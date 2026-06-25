import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Clipboard, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { useToast } from '../../components/ui/ToastContext';
import { cancelBooking } from '../../lib/api';
import { FloatingSupportButtons } from '../../components/ui/FloatingSupportButtons';

export default function BookingDetailActiveScreen() {
  const params = useLocalSearchParams();
  const toast = useToast();
  const [cancelLoading, setCancelLoading] = useState(false);

  const bookingId = params.bookingId as string;
  const propertyName = params.propertyName as string || 'Property';
  const location = params.location as string || '';
  const checkIn = params.checkIn as string || '';
  const checkOut = params.checkOut as string || '';
  const nights = Number(params.nights) || 1;
  const total = Number(params.total) || 0;
  const serviceFee = Number(params.serviceFee) || 0;
  const nightlyRate = nights > 0 ? Math.round((total - serviceFee) / nights) : 0;
  const ref = params.ref as string || bookingId?.slice(0, 12).toUpperCase() || '';

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
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Cancellation fees may apply.',
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            setCancelLoading(true);
            try {
              await cancelBooking(bookingId);
              toast.success('Booking cancelled', 'Your booking has been cancelled.');
              setTimeout(() => router.replace('/tabs/bookings'), 1500);
            } catch (e: any) {
              toast.error('Failed', e.message || 'Could not cancel booking.');
            } finally { setCancelLoading(false); }
          },
        },
      ]
    );
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
        {/* Property image */}
        <View style={styles.propertyImage}>
          <Text style={styles.imagePlaceholder}>🏨</Text>
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
              <Text style={styles.typeText}>Shortlet</Text>
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
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Confirmed</Text>
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
            Full refund available if cancelled before {checkIn}. 50% refund after.
          </Text>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating support buttons */}
      <FloatingSupportButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  propertyImage: {
    height: 220, backgroundColor: '#F0EBF8',
    alignItems: 'center', justifyContent: 'center',
  },
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
  typeBadge: {
    backgroundColor: '#F0E6FA', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  typeText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  locationText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },

  stayCard: {
    backgroundColor: '#FAFAFA', borderRadius: 16,
    padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: '#F0EBF8',
  },
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

  metaRows: { gap: 16, marginBottom: 24 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  metaValue: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  paystackRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paystackIcon: { fontSize: 16 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FDF6', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2E9E6B' },
  statusText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#2E9E6B', fontWeight: '600' },

  rescheduleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderWidth: 1.5, borderColor: '#6B2D82',
    borderRadius: 14, paddingVertical: 16, marginBottom: 12,
  },
  rescheduleIcon: { fontSize: 18 },
  rescheduleText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },

  cancelBtn: {
    backgroundColor: '#D94F4F', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 10,
  },
  cancelText: { fontSize: 15, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#FFFFFF' },
  refundNote: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center', lineHeight: 18 },

  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  callBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  floatingIcon: { fontSize: 22 },
});