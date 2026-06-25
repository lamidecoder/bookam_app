import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { useAuth } from '../../hooks/useAuth';
import { getUserBookings, subscribeToBookings } from '../../lib/api';
import { FloatingSupportButtons } from '../../components/ui/FloatingSupportButtons';

type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'pending';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', bg: '#F0FDF6', text: '#2E9E6B' },
  completed: { label: 'Completed', bg: '#F5F5F5', text: '#6B6478' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', text: '#D94F4F' },
  pending: { label: 'Pending', bg: '#FFFBEB', text: '#E8922A' },
};

export default function BookingsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadBookings = async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setError(false);
    try {
      const data = await getUserBookings(user.id);
      setBookings(data);
    } catch (e) {
      console.error(e);
      setError(true);
    }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadBookings();
    const sub = subscribeToBookings(user.id, setBookings);
    return () => { sub.unsubscribe(); };
  }, [user]);

  const upcoming = bookings.filter(b => ['confirmed', 'pending'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  const list = activeTab === 'upcoming' ? upcoming : past;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <BookamLogo width={110} height={34} />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#1E1E1E" strokeWidth={1.8} />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#1E1E1E" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} tintColor="#6B2D82" />}
      >
        <Text style={styles.pageTitle}>My Bookings</Text>

        <View style={styles.tabs}>
          {(['upcoming', 'past'] as const).map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'upcoming' && upcoming.length > 0 && ` (${upcoming.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6B2D82" style={{ marginTop: 60 }} />
        ) : !user ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyTitle}>Sign in to view bookings</Text>
            <Text style={styles.emptySub}>Log in to see your upcoming and past stays.</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/auth/login')}>
              <Text style={styles.exploreBtnText}>Log In</Text>
            </TouchableOpacity>
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySub}>Could not load your bookings.</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={loadBookings}>
              <Text style={styles.exploreBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'upcoming' ? 'Your confirmed reservations will appear here.' : 'Your past stays will appear here.'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/tabs/home')}>
                <Text style={styles.exploreBtnText}>Browse Properties</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.cards}>
            {list.map(booking => {
              const status = booking.status as BookingStatus;
              const cfg = STATUS_CONFIG[status];
              const property = booking.properties;
              return (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.card}
                  onPress={() => router.push({
                    pathname: status === 'completed' ? '/booking/detail-review' : '/booking/detail-active',
                    params: {
                      bookingId: booking.id,
                      propertyId: booking.property_id,
                      propertyName: property?.name,
                      location: property?.location,
                      checkIn: formatDate(booking.check_in),
                      checkOut: formatDate(booking.check_out),
                      nights: booking.nights,
                      total: booking.total,
                      serviceFee: booking.service_fee,
                      ref: booking.payment_ref || booking.id.slice(0, 12).toUpperCase(),
                      guestCount: booking.guests,
                      dates: `${formatDate(booking.check_in)} – ${formatDate(booking.check_out)}`,
                    },
                  })}
                  activeOpacity={0.9}
                >
                  {activeTab === 'past' ? (
                    <>
                      <View style={styles.pastImage}>
                        <Text style={styles.pastEmoji}>🏨</Text>
                        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                        </View>
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{property?.name}</Text>
                        <View style={styles.locationRow}>
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9E96A8" strokeWidth={1.8} />
                          </Svg>
                          <Text style={styles.locationText}>{property?.location}</Text>
                        </View>
                        <View style={styles.pastMeta}>
                          <View>
                            <Text style={styles.metaLabel}>DATES</Text>
                            <Text style={styles.metaValue}>{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.metaLabel}>TOTAL PAID</Text>
                            <Text style={styles.priceText}>₦{booking.total?.toLocaleString()}</Text>
                          </View>
                        </View>
                        {status === 'completed' && (
                          <TouchableOpacity
                            style={styles.reviewLink}
                            onPress={() => router.push({
                              pathname: '/booking/detail-review',
                              params: {
                                bookingId: booking.id,
                                propertyId: booking.property_id,
                                propertyName: property?.name,
                                location: property?.location,
                                checkIn: formatDate(booking.check_in),
                                checkOut: formatDate(booking.check_out),
                                nights: booking.nights,
                                total: booking.total,
                                serviceFee: booking.service_fee,
                                ref: booking.payment_ref || booking.id.slice(0, 12).toUpperCase(),
                                guestCount: booking.guests,
                                dates: `${formatDate(booking.check_in)} – ${formatDate(booking.check_out)}`,
                              },
                            })}
                          >
                            <Text style={styles.reviewLinkText}>Leave a Review →</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </>
                  ) : (
                    <View style={styles.upcomingCard}>
                      <View style={styles.upcomingImage}>
                        <Text style={styles.upcomingEmoji}>🏨</Text>
                      </View>
                      <View style={styles.upcomingInfo}>
                        <View style={styles.upcomingTop}>
                          <Text style={styles.cardName} numberOfLines={2}>{property?.name}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                          </View>
                        </View>
                        <View style={styles.locationRow}>
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9E96A8" strokeWidth={1.8} />
                          </Svg>
                          <Text style={styles.locationText}>{property?.area}</Text>
                        </View>
                        <View style={styles.upcomingBottom}>
                          <Text style={styles.dateText}>📅 {formatDate(booking.check_in)} – {formatDate(booking.check_out)}</Text>
                          <Text style={styles.priceText}>₦{booking.total?.toLocaleString()}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <FloatingSupportButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  pageTitle: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82', marginBottom: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#F0EBF8', borderRadius: 40, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 36, alignItems: 'center' },
  tabActive: { backgroundColor: '#6B2D82' },
  tabText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#9E96A8' },
  tabTextActive: { color: '#FFFFFF' },
  cards: { gap: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  upcomingCard: { flexDirection: 'row' },
  upcomingImage: { width: 90, backgroundColor: '#F0EBF8', alignItems: 'center', justifyContent: 'center' },
  upcomingEmoji: { fontSize: 32 },
  upcomingInfo: { flex: 1, padding: 14, gap: 6 },
  upcomingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  upcomingBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pastImage: { height: 160, backgroundColor: '#F0EBF8', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pastEmoji: { fontSize: 56 },
  cardInfo: { padding: 14, gap: 6 },
  cardName: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  pastMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaLabel: { fontSize: 10, fontFamily: 'Poppins-Medium', color: '#9E96A8', letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  dateText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  priceText: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  reviewLink: { marginTop: 4 },
  reviewLinkText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  emptySub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center' },
  exploreBtn: { marginTop: 12, backgroundColor: '#6B2D82', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  exploreBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  floatingIcon: { fontSize: 22 },
});