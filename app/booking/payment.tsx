import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { confirmBooking } from '../../lib/api';

function PaystackLogo() {
  return (
    <View style={styles.paystackLogo}>
      <View style={styles.paystackBar1} />
      <View style={styles.paystackBar2} />
      <View style={styles.paystackBar3} />
    </View>
  );
}

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const total = Number(params.total) || 0;
  const propertyName = params.propertyName as string || 'Property';
  const propertyImage = params.propertyImage as string || '';
  const bookingId = params.bookingId as string;

  const handleProceed = async () => {
    if (!bookingId) {
      toast.error('Missing booking', 'Something went wrong. Please start your booking again.');
      router.back();
      return;
    }
    setLoading(true);
    try {
      // NOTE: This is a SANDBOX/TEST payment flow for client demo purposes.
      // Real Paystack integration requires a Supabase Edge Function to:
      // 1. Initialize transaction via Paystack API
      // 2. Open Linking.openURL(authorization_url) for the user to pay
      // 3. Verify payment via webhook before calling confirmBooking
      await new Promise(r => setTimeout(r, 1200));

      const paystackRef = `PSTK-TEST-${Date.now().toString().slice(-8)}`;
      const confirmed = await confirmBooking(bookingId, paystackRef);

      router.replace({
        pathname: '/booking/confirmed',
        params: {
          propertyName,
          propertyImage,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          total,
          ref: confirmed.payment_ref,
        },
      });
    } catch (e) {
      router.replace({ pathname: '/booking/payment-failed', params: { total, propertyName, bookingId } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#1E1E1E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Property reminder */}
        {propertyImage ? (
          <View style={styles.propertyReminder}>
            <Image source={{ uri: propertyImage }} style={styles.propertyThumb} contentFit="cover" transition={200} />
            <Text style={styles.propertyReminderName} numberOfLines={1}>{propertyName}</Text>
          </View>
        ) : null}

        {/* Amount */}
        <Text style={styles.amount}>₦{total.toLocaleString()}</Text>
        <Text style={styles.redirect}>
          You are being redirected to Paystack to complete your payment securely.
        </Text>

        {/* Paystack card */}
        <View style={styles.paystackCard}>
          <PaystackLogo />
          <View style={styles.securedRow}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.securedText}>Secured by Paystack</Text>
            <View style={styles.sandboxBadge}>
              <Text style={styles.sandboxBadgeText}>TEST MODE — No real charge</Text>
            </View>
          </View>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBar} />
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
            <Circle cx="12" cy="12" r="10" stroke="#3A7BD5" strokeWidth={1.8} />
            <Line x1="12" y1="8" x2="12" y2="12" stroke="#3A7BD5" strokeWidth={1.8} strokeLinecap="round" />
            <Circle cx="12" cy="16" r="1" fill="#3A7BD5" />
          </Svg>
          <Text style={styles.infoText}>
            You can pay by card, bank transfer or USSD on the next screen. Your 15-minute date hold is active.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* CTA */}
        <PrimaryButton label="Proceed to Payment" onPress={handleProceed} loading={loading} />
        <Text style={styles.securityNote}>
          Bookam does not store your payment details. All transactions are handled securely by Paystack.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0EBF8',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 },
  amount: { fontSize: 36, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82', textAlign: 'center', marginBottom: 12 },
  propertyReminder: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center', marginBottom: 20, backgroundColor: '#FAF8FC', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  propertyThumb: { width: 40, height: 40, borderRadius: 8 },
  propertyReminderName: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#1E1E1E', maxWidth: 200 },
  redirect: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  paystackCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 24, alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    marginBottom: 20,
  },
  paystackLogo: { gap: 6, alignItems: 'flex-start' },
  paystackBar1: { width: 48, height: 8, borderRadius: 4, backgroundColor: '#00C3F7' },
  paystackBar2: { width: 36, height: 8, borderRadius: 4, backgroundColor: '#00C3F7' },
  paystackBar3: { width: 24, height: 8, borderRadius: 4, backgroundColor: '#00C3F7' },
  securedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lockIcon: { fontSize: 16 },
  securedText: { fontSize: 15, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#1E1E1E' },
  sandboxBadge: { backgroundColor: '#FFFBEB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
  sandboxBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: '#E8922A', fontWeight: '600' },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 10,
    padding: 14, gap: 10, overflow: 'hidden',
  },
  infoBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#3A7BD5' },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#1E40AF', lineHeight: 20 },
  securityNote: {
    fontSize: 12, fontFamily: 'Poppins-Regular',
    color: '#9E96A8', textAlign: 'center', lineHeight: 18, marginTop: 14,
  },
});