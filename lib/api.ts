import { supabase } from './supabase';

// ============================================
// PROPERTIES
// ============================================
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
  return data || [];
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
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('verified', true)
    .eq('active', true)
    .gte('rating', 4.8)
    .order('rating', { ascending: false })
    .limit(6);
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
    .select()
    .single();
  if (error) throw error;
  return data;
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
    .single();

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