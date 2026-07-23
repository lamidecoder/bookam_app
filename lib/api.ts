import { supabase } from './supabase';

// ============================================
// PROPERTIES
// ============================================
// Curated nearby-area groupings for Lagos - there's no lat/lng geo data
// on properties (just text area/location fields), so true
// distance-based search isn't available without much bigger
// infrastructure (geocoding every property, a spatial index, etc).
// This is the achievable, still genuinely useful version: if searching
// a specific area comes back sparse, also surface properties from
// areas people would actually consider "nearby" in real life, instead
// of just showing an empty result.
const LAGOS_NEARBY_AREAS: Record<string, string[]> = {
  'lekki': ['ajah', 'victoria island', 'ikoyi', 'chevron', 'osapa', 'agungi'],
  'ajah': ['lekki', 'sangotedo', 'chevron'],
  'victoria island': ['ikoyi', 'lekki', 'obalende'],
  'ikoyi': ['victoria island', 'obalende', 'lekki'],
  'ikeja': ['gra', 'opebi', 'allen', 'magodo', 'ogba'],
  'magodo': ['ikeja', 'ogba', 'ojodu'],
  'yaba': ['surulere', 'ebute metta', 'gbagada'],
  'surulere': ['yaba', 'lawanson', 'ijesha'],
  'gbagada': ['yaba', 'ketu', 'anthony'],
  'ajao estate': ['isolo', 'oshodi', 'mafoluku'],
  'festac': ['amuwo odofin', 'satellite town'],
};

function findNearbyAreas(query: string): string[] {
  const key = query.trim().toLowerCase();
  if (LAGOS_NEARBY_AREAS[key]) return LAGOS_NEARBY_AREAS[key];
  // Also check if the query matches as a nearby area of some other
  // area - e.g. searching "Ajah" should also catch "Lekki" since
  // they're mutually nearby, even though Ajah isn't its own top-level
  // key pointing back to itself.
  for (const [area, nearby] of Object.entries(LAGOS_NEARBY_AREAS)) {
    if (nearby.includes(key)) return [area, ...nearby.filter((a) => a !== key)];
  }
  return [];
}

export async function searchProperties(filters: {
  query?: string;
  type?: string;
  areas?: string[];
  amenities?: string[];
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}) {
  let q = supabase.from('properties').select('*').eq('active', true);

  if (filters.type) q = q.eq('type', filters.type);
  if (filters.areas?.length) q = q.in('area', filters.areas);
  if (filters.amenities?.length) q = q.contains('amenities', filters.amenities);
  if (filters.minPrice) q = q.gte('price_per_night', filters.minPrice);
  if (filters.maxPrice) q = q.lte('price_per_night', filters.maxPrice);
  if (filters.query?.trim()) {
    q = q.or(`name.ilike.%${filters.query}%,area.ilike.%${filters.query}%,location.ilike.%${filters.query}%`);
  }

  q = q.order('rating', { ascending: false });

  const { data, error } = await q;
  if (error) throw error;
  const exactResults = data || [];

  // Only reach for nearby-area fallback when there's an actual location
  // query with genuinely sparse results (<3) - not on every search,
  // and not when other filters (type/amenities/price) already narrowed
  // things down on purpose.
  const queryText = filters.query?.trim();
  if (queryText && exactResults.length < 3 && !filters.areas?.length) {
    const nearby = findNearbyAreas(queryText);
    if (nearby.length > 0) {
      const excludeIds = exactResults.map((p) => p.id);
      let nearbyQuery = supabase
        .from('properties')
        .select('*')
        .eq('active', true)
        .in('area', nearby)
        .order('rating', { ascending: false })
        .limit(10);
      if (excludeIds.length > 0) {
        nearbyQuery = nearbyQuery.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      const { data: nearbyData } = await nearbyQuery;
      if (nearbyData?.length) {
        // Tagged distinctly so the UI can show these under their own
        // "Also nearby" heading instead of silently mixing them in
        // with genuine exact matches.
        return [...exactResults, ...nearbyData.map((p) => ({ ...p, _nearbyMatch: true }))];
      }
    }
  }

  return exactResults;
}

export async function getProperties(filters?: {
  type?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  verifiedOnly?: boolean;
}) {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('active', true)
    .order('rating', { ascending: false });

  if (filters?.type && filters.type !== 'All') {
    query = query.eq('type', filters.type);
  }
  if (filters?.area) {
    query = query.eq('area', filters.area);
  }
  if (filters?.minPrice) {
    query = query.gte('price_per_night', filters.minPrice);
  }
  if (filters?.maxPrice) {
    query = query.lte('price_per_night', filters.maxPrice);
  }
  if (filters?.verifiedOnly) {
    query = query.eq('verified', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getFeaturedProperties() {
  // No hard rating cutoff - a strict floor like 4.8 left almost nothing
  // to show once real (non-demo) rating data varies, which made the
  // horizontal scroll look broken since there was rarely more than one
  // or two qualifying properties to swipe through. Verified + active,
  // best-rated first, is a better "featured" signal than an arbitrary
  // threshold that can leave the section nearly empty.
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('verified', true)
    .eq('active', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(8);
  if (error) throw error;
  return data || [];
}

// Real-time subscription for properties
export function subscribeToProperties(callback: (properties: any[]) => void) {
  const channelName = `properties-${Math.random().toString(36).slice(2)}`;
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, async () => {
      const data = await getProperties();
      callback(data);
    })
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// ============================================
// BOOKINGS
// ============================================
export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, properties(name, location, area, images, type)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createBooking(booking: {
  user_id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  nightly_rate: number;
  service_fee: number;
  total: number;
  cancellation_fee: number;
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...booking, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function confirmBooking(bookingId: string, paystackRef: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed', paystack_ref: paystackRef, payment_ref: `BKM-${Date.now()}` })
    .eq('id', bookingId)
    .select('*, properties(name)')
    .single();
  if (error) throw error;

  // Personalized in-app notification - entirely wrapped so nothing in
  // here can ever block the booking confirmation itself from
  // succeeding, regardless of what goes wrong inside it. Deliberately
  // NOT using an embedded profiles(...) join in the query above -
  // bookings.user_id references auth.users, not profiles directly, so
  // PostgREST has no foreign key path to auto-embed through.
  try {
    const { data: guestProfile } = await supabase
      .from('profiles')
      .select('full_name, notification_preferences')
      .eq('id', data.user_id)
      .maybeSingle();

    // Respects the guest's own notification preferences - only create
    // this if they haven't turned booking-update notifications off.
    // Defaults to true (sent) if the preference was never explicitly set.
    const wantsBookingUpdates = guestProfile?.notification_preferences?.booking_updates !== false;
    if (wantsBookingUpdates) {
      const firstName = guestProfile?.full_name?.split(' ')[0];
      await createNotification({
        userId: data.user_id,
        title: firstName ? `You're all set, ${firstName}!` : "You're all set!",
        body: `Your stay at ${data.properties?.name ?? 'your property'} is confirmed for ${new Date(data.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.`,
        type: 'booking_confirmed',
        relatedBookingId: bookingId,
      });
    }
  } catch (e) {
    console.warn('Could not create booking-confirmed notification:', e);
  }

  return data;
}

export type AppNotification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  related_booking_id: string | null;
  read: boolean;
  created_at: string;
};

export async function createNotification(params: {
  userId: string;
  title: string;
  body: string;
  type?: string;
  relatedBookingId?: string;
}) {
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    title: params.title,
    body: params.body,
    type: params.type ?? 'general',
    related_booking_id: params.relatedBookingId ?? null,
  });
  if (error) throw error;
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
  return count || 0;
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  if (error) throw error;
}

/**
 * Generates a personalized check-in reminder for any of the person's
 * upcoming bookings checking in tomorrow - called once when the app
 * opens (see app/tabs/home.tsx). No backend cron/scheduled-function
 * infrastructure exists in this project, so rather than requiring that
 * bigger lift, this checks on natural app opens instead: genuinely
 * good enough, since a guest checking in tomorrow is very likely to
 * open the app at some point today anyway. Safely skips creating a
 * duplicate if a reminder for that specific booking already exists.
 */
export async function generateCheckinReminders(userId: string) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, check_in, properties(name)')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .eq('check_in', tomorrowStr);
  if (error || !bookings?.length) return;

  // Fetched once here rather than per-booking - same safe pattern as
  // confirmBooking, deliberately not an embedded profiles(...) join.
  const { data: guestProfile } = await supabase
    .from('profiles')
    .select('full_name, notification_preferences')
    .eq('id', userId)
    .maybeSingle();

  // Respects the guest's own preference - skip entirely if they've
  // turned check-in reminders off.
  if (guestProfile?.notification_preferences?.checkin_reminders === false) return;

  const firstName = guestProfile?.full_name?.split(' ')[0];

  for (const booking of bookings) {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('related_booking_id', booking.id)
      .eq('type', 'checkin_reminder')
      .maybeSingle();
    if (existing) continue; // already sent, don't duplicate

    await createNotification({
      userId,
      title: firstName ? `See you tomorrow, ${firstName}!` : 'Check-in tomorrow!',
      body: `Your stay at ${(booking as any).properties?.name ?? 'your property'} begins tomorrow. Safe travels!`,
      type: 'checkin_reminder',
      relatedBookingId: booking.id,
    }).catch(() => {});
  }
}

export async function cancelBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Real-time bookings
export function subscribeToBookings(userId: string, callback: (bookings: any[]) => void) {
  const channelName = `bookings-${userId}-${Math.random().toString(36).slice(2)}`;
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'bookings',
      filter: `user_id=eq.${userId}`,
    }, async () => {
      const data = await getUserBookings(userId);
      callback(data);
    })
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// ============================================
// SAVED PROPERTIES
// ============================================
export async function getSavedPropertyIds(userId: string) {
  const { data, error } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data?.map(d => d.property_id) || [];
}

export async function getSavedProperties(userId: string) {
  const { data, error } = await supabase
    .from('saved_properties')
    .select(`*, properties(*)`)
    .eq('user_id', userId);
  if (error) throw error;
  return data?.map(d => d.properties) || [];
}

export async function toggleSavedProperty(userId: string, propertyId: string) {
  const { data: existing } = await supabase
    .from('saved_properties')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (existing) {
    await supabase.from('saved_properties').delete().eq('user_id', userId).eq('property_id', propertyId);
    return false;
  } else {
    await supabase.from('saved_properties').insert({ user_id: userId, property_id: propertyId });
    return true;
  }
}

// ============================================
// BLOCKED DATES
// ============================================
export async function getBlockedDates(propertyId: string) {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('date')
    .eq('property_id', propertyId);
  if (error) throw error;
  return data?.map(d => d.date) || [];
}

// ============================================
// REVIEWS
// ============================================
export async function submitReview(review: {
  user_id: string;
  booking_id: string;
  property_id: string;
  rating: number;
  body: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  if (error) throw error;

  // Update property rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('property_id', review.property_id);

  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase
      .from('properties')
      .update({ rating: Math.round(avg * 10) / 10, review_count: reviews.length })
      .eq('id', review.property_id);
  }

  return data;
}

// ============================================
// USER PROFILE
// ============================================
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: {
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  avatar_color?: string;
  notification_preferences?: { booking_updates?: boolean; checkin_reminders?: boolean; promotions?: boolean };
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}