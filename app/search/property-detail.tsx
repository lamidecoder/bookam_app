import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { getProperty, getBlockedDates, toggleSavedProperty, getSavedPropertyIds } from '../../lib/api';
import { optimizedImageUrl } from '../../lib/cloudinary';

const DAY_LABELS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = new Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function PropertyDetailScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const toast = useToast();

  const propertyId = params.propertyId as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(1);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) { setLoading(false); return; }
    (async () => {
      try {
        const [prop, blocked] = await Promise.all([
          getProperty(propertyId),
          getBlockedDates(propertyId),
        ]);
        setProperty(prop);
        setBlockedDates(blocked);
        if (user) {
          const savedIds = await getSavedPropertyIds(user.id);
          setSaved(savedIds.includes(propertyId));
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load', 'Could not load property details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId, user]);

  const weeks = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const isPastDate = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleDayPress = (day: number) => {
    const key = formatDateKey(viewYear, viewMonth, day);
    if (blockedDates.includes(key) || isPastDate(day)) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(key);
      setSelectedCheckOut(null);
    } else {
      if (key > selectedCheckIn) {
        setSelectedCheckOut(key);
      } else {
        setSelectedCheckIn(key);
        setSelectedCheckOut(null);
      }
    }
  };

  const getDayStyle = (day: number | null) => {
    if (!day) return null;
    const key = formatDateKey(viewYear, viewMonth, day);
    if (key === selectedCheckIn) return styles.dayCheckIn;
    if (key === selectedCheckOut) return styles.dayCheckOut;
    if (selectedCheckIn && selectedCheckOut && key > selectedCheckIn && key < selectedCheckOut) return styles.dayRange;
    if (blockedDates.includes(key)) return styles.dayBooked;
    if (isPastDate(day)) return styles.dayPast;
    return null;
  };

  const getDayTextStyle = (day: number | null) => {
    if (!day) return null;
    const key = formatDateKey(viewYear, viewMonth, day);
    if (key === selectedCheckIn || key === selectedCheckOut) return styles.dayTextSelected;
    if (blockedDates.includes(key) || isPastDate(day)) return styles.dayTextDisabled;
    return null;
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const nights = useMemo(() => {
    if (!selectedCheckIn || !selectedCheckOut) return 0;
    const inD = new Date(selectedCheckIn);
    const outD = new Date(selectedCheckOut);
    return Math.round((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24));
  }, [selectedCheckIn, selectedCheckOut]);

  const nightlyRate = property?.price_per_night || 0;
  const serviceFee = property?.service_fee || 0;
  const total = nights * nightlyRate + serviceFee;

  const handleToggleSave = async () => {
    if (!user) { router.push('/auth/login'); return; }
    const nowSaved = await toggleSavedProperty(user.id, propertyId);
    setSaved(nowSaved);
  };

  const handleBookNow = () => {
    if (!selectedCheckIn || !selectedCheckOut) {
      toast.warning('Select dates', 'Please select check-in and check-out dates.');
      return;
    }
    if (!user) {
      // Force Sign In flow
      toast.info('Sign in required', 'Please log in to continue booking.');
      router.push('/auth/login');
      return;
    }
    router.push({
      pathname: '/booking/summary',
      params: {
        propertyId,
        propertyName: property.name,
        location: property.location,
        checkIn: new Date(selectedCheckIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        checkOut: new Date(selectedCheckOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        nights,
        nightlyRate,
        serviceFee,
        total,
        cancellationFee: Math.round((nightlyRate * nights * (property.cancellation_fee_percent || 15)) / 100),
        guests: 1,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6B2D82" />
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontSize: 16, color: '#6B6478', textAlign: 'center' }}>Property not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#6B2D82', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = property.images || [];
  const totalPhotos = Math.max(images.length, 1);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero Image */}
        <View style={styles.heroImage}>
          {images[0] ? (
            <Image source={{ uri: optimizedImageUrl(images[0], 900) }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          ) : (
            <Text style={styles.heroEmoji}>🛋️</Text>
          )}

          <SafeAreaView style={styles.heroOverlay} edges={['top']}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroBtn}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="18" cy="5" r="3" stroke="#FFFFFF" strokeWidth={1.8} />
                <Circle cx="6" cy="12" r="3" stroke="#FFFFFF" strokeWidth={1.8} />
                <Circle cx="18" cy="19" r="3" stroke="#FFFFFF" strokeWidth={1.8} />
                <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </SafeAreaView>

          {property.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>🏅</Text>
              <Text style={styles.verifiedText}>VERIFIED BY BOOKAM</Text>
            </View>
          )}

          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>{currentPhoto} / {totalPhotos}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.propertyName}>{property.name}</Text>
            <TouchableOpacity onPress={handleToggleSave}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                  stroke={saved ? '#D94F4F' : '#9E96A8'}
                  fill={saved ? '#D94F4F' : 'none'}
                  strokeWidth={1.8}
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{property.type?.toUpperCase()}</Text>
            </View>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9E96A8" strokeWidth={1.8} />
            </Svg>
            <Text style={styles.locationText}>{property.location}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingValue}>{property.rating?.toFixed(1) || '—'}</Text>
            <Text style={styles.ratingCount}>({property.review_count || 0} reviews)</Text>
          </View>

          <Text style={styles.price}>
            ₦{nightlyRate.toLocaleString()}
            <Text style={styles.priceUnit}>{property.type === 'Event Center' ? ' / event' : ' / night'}</Text>
          </Text>

          <View style={styles.divider} />

          {property.video_url && (
            <>
              <Text style={styles.sectionTitle}>Property Videos</Text>
              <TouchableOpacity style={styles.videoBtn} onPress={() => Linking.openURL(property.video_url)}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" fill="#6B2D82" />
                  <Path d="M10 8l6 4-6 4V8z" fill="#FFFFFF" />
                </Svg>
                <Text style={styles.videoBtnText}>View on Instagram</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          )}

          <Text style={styles.sectionTitle}>About this property</Text>
          <Text style={styles.aboutText}>{property.description || 'No description available.'}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {(property.amenities || []).map((a: string, i: number) => (
              <View key={i} style={styles.amenityItem}>
                <Text style={styles.amenityIcon}>✓</Text>
                <Text style={styles.amenityLabel}>{a}</Text>
              </View>
            ))}
          </View>

          {property.house_rules?.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>House Rules</Text>
              <View style={styles.rulesList}>
                {property.house_rules.map((rule: string, i: number) => (
                  <View key={i} style={styles.ruleRow}>
                    <View style={styles.ruleCheck}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path d="M5 12l5 5L20 7" stroke="#C9A84C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 14 }} />
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerBar} />
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
              <Circle cx="12" cy="12" r="10" stroke="#3A7BD5" strokeWidth={1.8} />
              <Path d="M12 8v4M12 16h.01" stroke="#3A7BD5" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <Text style={styles.infoBannerText}>
              Minimum stay is {property.min_stay || 1} night{property.min_stay > 1 ? 's' : ''} for this property.
            </Text>
          </View>

          <View style={{ height: 10 }} />
          <View style={styles.warningBanner}>
            <View style={styles.warningBannerBar} />
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
              <Path d="M12 2L2 20h20L12 2z" stroke="#E8922A" strokeWidth={1.8} strokeLinejoin="round" />
              <Path d="M12 9v4M12 17h.01" stroke="#E8922A" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <Text style={styles.warningBannerText}>
              All cancellations attract a fee of {property.cancellation_fee_percent || 15}% if cancelled within 24 hours.
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.calendar}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity style={styles.calNavBtn} onPress={goPrevMonth}>
                <Text style={styles.calNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonth}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
              <TouchableOpacity style={styles.calNavBtn} onPress={goNextMonth}>
                <Text style={styles.calNavText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dayLabels}>
              {DAY_LABELS.map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={styles.calWeek}>
                {week.map((day, di) => (
                  <TouchableOpacity
                    key={di}
                    style={[styles.calDay, getDayStyle(day)]}
                    onPress={() => day && handleDayPress(day)}
                    disabled={!day || blockedDates.includes(formatDateKey(viewYear, viewMonth, day)) || isPastDate(day)}
                  >
                    <Text style={[styles.calDayText, getDayTextStyle(day)]}>{day || ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={styles.calLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#C9A84C' }]} />
                <Text style={styles.legendText}>Selected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6B2D82' }]} />
                <Text style={styles.legendText}>Booked</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#D1D1D6' }]} />
                <Text style={styles.legendText}>Unavailable</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        <View style={styles.stickyInfo}>
          <Text style={styles.stickyDates} numberOfLines={1}>
            {selectedCheckIn && selectedCheckOut
              ? `${new Date(selectedCheckIn).getDate()} – ${new Date(selectedCheckOut).getDate()} ${MONTH_NAMES[viewMonth].slice(0, 3)} · ${nights} night${nights > 1 ? 's' : ''}`
              : 'Select dates'}
          </Text>
          {nights > 0 && (
            <Text style={styles.stickyTotal}>₦{total.toLocaleString()} total</Text>
          )}
        </View>
        <TouchableOpacity style={styles.bookNowBtn} onPress={handleBookNow}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.floatingBtns}>
        <TouchableOpacity style={styles.whatsappBtn} onPress={() => Linking.openURL('https://wa.me/2348000000000')}>
          <Text style={styles.floatingIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:+2348000000000')}>
          <Text style={styles.floatingIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  heroImage: { height: 300, backgroundColor: '#E8E0F0', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroEmoji: { fontSize: 80 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  heroBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', bottom: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  verifiedIcon: { fontSize: 12 },
  verifiedText: { fontSize: 10, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#C9A84C', letterSpacing: 0.5 },
  photoCounter: { position: 'absolute', bottom: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  photoCounterText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  propertyName: { fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  typeBadge: { backgroundColor: '#6B2D82', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeText: { fontSize: 10, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF', letterSpacing: 0.5 },
  locationText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', flexShrink: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  ratingStar: { fontSize: 14 },
  ratingValue: { fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#1E1E1E' },
  ratingCount: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  price: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82', marginBottom: 16 },
  priceUnit: { fontSize: 15, fontWeight: '400', color: '#6B6478' },
  divider: { height: 1, backgroundColor: '#F0EBF8', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 14 },
  videoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0E6FA', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, alignSelf: 'flex-start' },
  videoBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  aboutText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8F5FA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  amenityIcon: { fontSize: 12, color: '#2E9E6B', fontWeight: '700' },
  amenityLabel: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#1E1E1E' },
  rulesList: { gap: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF8E7', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#C9A84C' },
  ruleText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1E1E1E', flex: 1, flexWrap: 'wrap' },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 14, overflow: 'hidden' },
  infoBannerBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#3A7BD5' },
  infoBannerText: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#1E40AF', lineHeight: 20 },
  warningBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFFBEB', borderRadius: 10, padding: 14, overflow: 'hidden' },
  warningBannerBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#E8922A' },
  warningBannerText: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#92400E', lineHeight: 20 },
  calendar: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0EBF8' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calNavBtn: { padding: 8, minWidth: 36, alignItems: 'center' },
  calNavText: { fontSize: 20, color: '#6B2D82', fontWeight: '600' },
  calMonth: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  dayLabels: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#9E96A8', fontWeight: '600' },
  calWeek: { flexDirection: 'row', marginBottom: 4 },
  calDay: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  calDayText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#1E1E1E' },
  dayCheckIn: { backgroundColor: '#C9A84C' },
  dayCheckOut: { backgroundColor: '#6B2D82' },
  dayRange: { backgroundColor: '#F0E6FA' },
  dayBooked: { backgroundColor: '#F0EBF8' },
  dayPast: { opacity: 0.3 },
  dayTextSelected: { color: '#FFFFFF', fontFamily: 'Poppins-Bold', fontWeight: '700' },
  dayTextDisabled: { color: '#C4BFCB' },
  calLegend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  stickyBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#F0EBF8', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8, gap: 12 },
  stickyInfo: { gap: 2, flex: 1 },
  stickyDates: { fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#1E1E1E' },
  stickyTotal: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  bookNowBtn: { backgroundColor: '#6B2D82', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
  bookNowText: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  floatingIcon: { fontSize: 22 },
});