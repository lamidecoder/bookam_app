import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/ToastContext';
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
  type AppNotification,
} from '../lib/api';

function NotificationIcon({ type }: { type: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    booking_confirmed: { bg: '#F0FDF6', color: '#2E9E6B' },
    checkin_reminder: { bg: '#FFF8EA', color: '#C9A84C' },
    booking_cancelled: { bg: '#FEF2F2', color: '#D94F4F' },
    general: { bg: '#F0E6FA', color: '#6B2D82' },
  };
  const c = config[type] ?? config.general;

  return (
    <View style={[iconStyles.wrap, { backgroundColor: c.bg }]}>
      {type === 'booking_confirmed' ? (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M20 6L9 17l-5-5" stroke={c.color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : type === 'checkin_reminder' ? (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="8" cy="15" r="4" stroke={c.color} strokeWidth={2} />
          <Path d="M11 12l7-7M15 5l2 2M18 2l2 2" stroke={c.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : type === 'booking_cancelled' ? (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M18 6L6 18M6 6l12 12" stroke={c.color} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      ) : (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={c.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={c.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setError(false);
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleOpen = async (n: AppNotification) => {
    if (!n.read) {
      setNotifications((cur) => cur.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      markNotificationRead(n.id).catch(() => {});
    }
    if (n.related_booking_id) {
      router.push({ pathname: '/booking/detail-active', params: { bookingId: n.related_booking_id } });
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setNotifications((cur) => cur.map((x) => ({ ...x, read: true })));
    try {
      await markAllNotificationsRead(user.id);
    } catch (e) {
      toast.error('Failed', 'Could not mark all as read. Please try again.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6B2D82" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#6B2D82" />}
        >
          {error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyTitle}>Something went wrong</Text>
              <Text style={styles.emptySub}>Could not load your notifications.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={load}>
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>Nothing yet</Text>
              <Text style={styles.emptySub}>Updates about your bookings will show up here.</Text>
            </View>
          ) : (
            notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.card, !n.read && styles.cardUnread]}
                onPress={() => handleOpen(n)}
                activeOpacity={0.8}
              >
                <NotificationIcon type={n.type} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.cardTitle, !n.read && styles.cardTitleUnread]} numberOfLines={1}>{n.title}</Text>
                    {!n.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.cardText} numberOfLines={2}>{n.body}</Text>
                  <Text style={styles.cardTime}>{timeAgo(n.created_at)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0EBF8',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  markAllText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#6B2D82' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: '#FFFFFF',
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F5F2F8',
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardUnread: {
    backgroundColor: '#FBF8FE', borderColor: '#E8DCF5',
    borderLeftWidth: 3, borderLeftColor: '#6B2D82',
    shadowOpacity: 0.08,
  },
  cardBody: { flex: 1, justifyContent: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Medium', fontWeight: '500', color: '#4A4458' },
  cardTitleUnread: { fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#1E1E1E' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#6B2D82' },
  cardText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 18, marginBottom: 4 },
  cardTime: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#B3ABC0' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#1E1E1E', marginBottom: 6 },
  emptySub: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center', lineHeight: 19 },
  retryBtn: { marginTop: 16, backgroundColor: '#6B2D82', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  retryBtnText: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
});