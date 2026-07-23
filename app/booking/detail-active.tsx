import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Clipboard, Modal,
  Animated, TouchableWithoutFeedback,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { Image } from 'expo-image';
import { useToast } from '../../components/ui/ToastContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { cancelBooking, getBookingById } from '../../lib/api';
import { FloatingSupportButtons } from '../../components/ui/FloatingSupportButtons';

function CancelSheet({
  visible,
  propertyName,
  checkIn,
  cancellationFee,
  total,
  onKeep,
  onConfirm,
  loading,
}: {
  visible: boolean;
  propertyName: string;
  checkIn: string;
  cancellationFee: number;
  total: number;
  onKeep: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const refundAmount = total - cancellationFee;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onKeep}>
      <TouchableWithoutFeedback onPress={onKeep}>
        <View style={sheet.overlay} />
      </TouchableWithoutFeedback>
      <View style={sheet.container}>
        <View style={sheet.handle} />

        {/* Warning icon */}
        <View style={sheet.iconWrap}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L2 20h20L12 2z" stroke="#D94F4F" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M12 9v4" stroke="#D94F4F" strokeWidth={2} strokeLinecap="round" />
            <Circle cx="12" cy="17" r="1" fill="#D94F4F" />
          </Svg>
        </View>

        <Text style={sheet.heading}>Cancel this booking?</Text>
        <Text style={sheet.sub}>
          You're about to cancel your stay at{' '}
          <Text style={sheet.bold}>{propertyName}</Text>
          {checkIn ? ` (check-in: ${checkIn})` : ''}.
        </Text>

        {/* Refund breakdown */}
        <View style={sheet.breakdown}>
          <View style={sheet.row}>
            <Text style={sheet.rowLabel}>Amount Paid</Text>
            <Text style={sheet.rowValue}>₦{total.toLocaleString()}</Text>
          </View>
          <View style={sheet.row}>
            <Text style={[sheet.rowLabel, { color: '#D94F4F' }]}>Cancellation Fee</Text>
            <Text style={[sheet.rowValue, { color: '#D94F4F' }]}>-₦{cancellationFee.toLocaleString()}</Text>
          </View>
          <View style={sheet.divider} />
          <View style={sheet.row}>
            <Text style={[sheet.rowLabel, { fontFamily: 'Poppins-Bold', color: '#1E1E1E' }]}>Refund Amount</Text>
            <Text style={[sheet.rowValue, { color: '#2E9E6B', fontFamily: 'Poppins-Bold' }]}>
              ₦{Math.max(0, refundAmount).toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={sheet.note}>
          Refunds are processed within 3–5 business days after confirmation.
        </Text>

        <TouchableOpacity
          style={[sheet.confirmBtn, loading && { opacity: 0.6 }]}
          onPress={onConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={sheet.confirmText}>{loading ? 'Cancelling…' : 'Yes, Cancel Booking'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={sheet.keepBtn} onPress={onKeep} activeOpacity={0.85}>
          <Text style={sheet.keepText}>Keep My Booking</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function BookingDetailActiveScreen() {
  const params = useLocalSearchParams();
  const toast = useToast();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const contentFade = useRef(new Animated.Value(0)).current;

  const bookingId = params.bookingId as string;

  useEffect(() => {
    if (!bookingId) { setLoading(false); setLoadError(true); return; }
    getBookingById(bookingId)
      .then(setBooking)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    if (!loading) {
      contentFade.setValue(0);
      Animated.timing(contentFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [loading]);

  // The real, fetched booking is authoritative - route params are only
  // ever used as a fallback for fields the fetch hasn't resolved yet
  // (or in the unlikely case it fails), not the primary source. This
  // is what makes this screen work correctly regardless of how someone
  // got here - tapping a booking from the list, or tapping a
  // notification that only ever passes bookingId and nothing else.
  const property = booking?.properties;
  const propertyName = property?.name || (params.propertyName as string) || 'Property';
  const propertyImage = property?.images?.[0] || (params.propertyImage as string) || '';
  const propertyType = property?.type || (params.propertyType as string) || 'Shortlet';
  const location = property?.location || (params.location as string) || '';
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const checkIn = booking?.check_in ? formatDate(booking.check_in) : (params.checkIn as string || '');
  const checkOut = booking?.check_out ? formatDate(booking.check_out) : (params.checkOut as string || '');
  const nights = booking?.nights ?? (Number(params.nights) || 1);
  const total = booking?.total ?? (Number(params.total) || 0);
  const serviceFee = booking?.service_fee ?? (Number(params.serviceFee) || 0);
  const cancellationFee = booking?.cancellation_fee ?? (Number(params.cancellationFee) || 0);
  const nightlyRate = nights > 0 ? Math.round((total - serviceFee) / nights) : 0;
  const ref = booking?.payment_ref || (params.ref as string) || bookingId?.slice(0, 12).toUpperCase() || '';
  const bookingStatus = booking?.status || 'confirmed';

  const handleCopyRef = () => {
    Clipboard.setString(ref);
    toast.success('Copied!', 'Booking reference copied.');
  };

  const handleReschedule = () => {
    toast.info('Reschedule requested', 'Our team will contact you within 24 hours.');
  };

  const handleCancel = () => {
    if (!bookingId) {
      toast.error('Missing booking', 'Could not identify this booking.');
      return;
    }
    setShowCancelSheet(true);
  };

  const confirmCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelBooking(bookingId);
      setBooking((cur: any) => cur ? { ...cur, status: 'cancelled' } : cur);
      setShowCancelSheet(false);
      toast.success('Booking cancelled', 'Your booking has been cancelled. Refund is being processed.');
      setTimeout(() => router.replace('/tabs/bookings'), 1500);
    } catch (e: any) {
      toast.error('Failed', e.message || 'Could not cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle cx="18" cy="5" r="3" stroke="#1E1E1E" strokeWidth={1.8} />
            <Circle cx="6" cy="12" r="3" stroke="#1E1E1E" strokeWidth={1.8} />
            <Circle cx="18" cy="19" r="3" stroke="#1E1E1E" strokeWidth={1.8} />
            <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#1E1E1E" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View>
            <Skeleton width="100%" height={220} borderRadius={0} />
            <View style={styles.content}>
              <Skeleton width="70%" height={22} style={{ marginBottom: 10 }} />
              <Skeleton width="45%" height={13} style={{ marginBottom: 20 }} />
              <Skeleton width="100%" height={180} borderRadius={16} style={{ marginBottom: 20 }} />
              <Skeleton width="100%" height={16} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={16} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={16} />
            </View>
          </View>
        ) : (
        <Animated.View style={{ opacity: contentFade }}>
        {/* Property image */}
        <View style={styles.propertyImage}>
          {propertyImage ? (
            <Image source={{ uri: propertyImage }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <Text style={styles.imagePlaceholder}>🏨</Text>
          )}
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>🏅</Text>
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Name + type */}
          <View style={styles.nameRow}>
            <Text style={styles.propertyName}>{propertyName}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{propertyType}</Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9E96A8" strokeWidth={1.8} />
            </Svg>
            <Text style={styles.locationText}>{location}</Text>
          </View>

          {/* Stay details card */}
          <View style={styles.stayCard}>
            <Text style={styles.stayTitle}>Stay Details</Text>
            <View style={styles.checkRow}>
              <View style={styles.checkItem}>
                <Text style={styles.checkLabel}>CHECK-IN</Text>
                <Text style={styles.checkValue}>{checkIn}</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkLabel}>CHECK-OUT</Text>
                <Text style={styles.checkValue}>{checkOut}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.stayRow}>
              <Text style={styles.stayRowLabel}>₦{nightlyRate.toLocaleString()} x {nights} nights</Text>
              <Text style={styles.stayRowValue}>₦{(nightlyRate * nights).toLocaleString()}</Text>
            </View>
            <View style={styles.stayRow}>
              <Text style={styles.stayRowLabel}>Service Charge</Text>
              <Text style={styles.stayRowValue}>₦{serviceFee.toLocaleString()}</Text>
            </View>
            <View style={[styles.divider, { borderStyle: 'dashed' }]} />
            <View style={styles.stayRow}>
              <Text style={styles.stayTotalLabel}>Total Paid</Text>
              <Text style={styles.stayTotalValue}>₦{total.toLocaleString()}</Text>
            </View>
          </View>

          {/* Meta rows */}
          <View style={styles.metaRows}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Payment Method</Text>
              <View style={styles.paystackRow}>
                <Text style={styles.paystackIcon}>🏦</Text>
                <Text style={styles.metaValue}>Paystack</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Booking Ref</Text>
              <TouchableOpacity style={styles.refRow} onPress={handleCopyRef}>
                <Text style={styles.metaValue}>{ref}</Text>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" />
                  <Path d="M10 4h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#6B2D82" strokeWidth={1.8} />
                </Svg>
              </TouchableOpacity>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Status</Text>
              <View style={[
                styles.statusBadge,
                bookingStatus === 'cancelled' && { backgroundColor: '#FEF2F2' },
                bookingStatus === 'pending' && { backgroundColor: '#FFFBEB' },
              ]}>
                <View style={[
                  styles.statusDot,
                  bookingStatus === 'cancelled' && { backgroundColor: '#D94F4F' },
                  bookingStatus === 'pending' && { backgroundColor: '#E8922A' },
                ]} />
                <Text style={[
                  styles.statusText,
                  bookingStatus === 'cancelled' && { color: '#D94F4F' },
                  bookingStatus === 'pending' && { color: '#E8922A' },
                ]}>
                  {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <TouchableOpacity style={styles.rescheduleBtn} onPress={handleReschedule}>
            <Text style={styles.rescheduleIcon}>📅</Text>
            <Text style={styles.rescheduleText}>Request Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={cancelLoading}>
            <Text style={styles.cancelText}>{cancelLoading ? 'Cancelling...' : 'Cancel Booking'}</Text>
          </TouchableOpacity>

          <Text style={styles.refundNote}>
            Cancellation fees apply per the property policy. Tap Cancel Booking to see your exact refund.
          </Text>

          <View style={{ height: 100 }} />
        </View>
        </Animated.View>
        )}
      </ScrollView>

      {/* Floating support buttons */}
      <FloatingSupportButtons />

      {/* Cancel confirmation sheet */}
      <CancelSheet
        visible={showCancelSheet}
        propertyName={propertyName}
        checkIn={checkIn}
        cancellationFee={cancellationFee}
        total={total}
        onKeep={() => setShowCancelSheet(false)}
        onConfirm={confirmCancel}
        loading={cancelLoading}
      />
    </SafeAreaView>
  );
}

const sheet = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0D9ED',
    alignSelf: 'center', marginBottom: 20,
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 16,
  },
  heading: { fontSize: 20, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  bold: { fontFamily: 'Poppins-SemiBold', color: '#1E1E1E' },
  breakdown: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0EBF8' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  rowValue: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#1E1E1E' },
  divider: { height: 1, backgroundColor: '#F0EBF8', marginVertical: 8 },
  note: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  confirmBtn: {
    backgroundColor: '#D94F4F', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  confirmText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#FFFFFF' },
  keepBtn: {
    borderWidth: 1.5, borderColor: '#6B2D82', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  keepText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#6B2D82' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  propertyImage: { height: 220, backgroundColor: '#F0EBF8', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  imagePlaceholder: { fontSize: 64 },
  verifiedBadge: {
    position: 'absolute', top: 16, left: 16,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  verifiedIcon: { fontSize: 14 },
  verifiedText: { fontSize: 11, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#C9A84C' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  propertyName: { fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', flex: 1 },
  typeBadge: { backgroundColor: '#F0E6FA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  typeText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  locationText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  stayCard: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#F0EBF8' },
  stayTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 14 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  checkItem: { gap: 4 },
  checkLabel: { fontSize: 10, fontFamily: 'Poppins-Medium', color: '#9E96A8', letterSpacing: 0.8 },
  checkValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#1E1E1E', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F0EBF8', marginVertical: 12 },
  stayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stayRowLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  stayRowValue: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  stayTotalLabel: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  stayTotalValue: { fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  metaRows: { gap: 16, marginBottom: 24, paddingRight: 64 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  metaValue: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  paystackRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paystackIcon: { fontSize: 16 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2E9E6B' },
  statusText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#2E9E6B', fontWeight: '600' },
  rescheduleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#6B2D82', borderRadius: 14, paddingVertical: 16, marginBottom: 12 },
  rescheduleIcon: { fontSize: 18 },
  rescheduleText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  cancelBtn: { backgroundColor: '#D94F4F', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  cancelText: { fontSize: 15, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#FFFFFF' },
  refundNote: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center', lineHeight: 18 },
});