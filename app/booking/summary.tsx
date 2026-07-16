import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, TextInput, Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { createBooking, updateProfile } from '../../lib/api';
import { Validate } from '../../lib/security';

const TERMS_URL = 'https://bookamfast.com/terms';

function InfoBanner({ type, text }: { type: 'info' | 'warning'; text: string }) {
  const isInfo = type === 'info';
  return (
    <View style={[styles.banner, isInfo ? styles.bannerInfo : styles.bannerWarning]}>
      <View style={[styles.bannerBar, isInfo ? styles.bannerBarInfo : styles.bannerBarWarning]} />
      <View style={styles.bannerIcon}>
        {isInfo ? (
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke="#3A7BD5" strokeWidth={1.8} />
            <Line x1="12" y1="8" x2="12" y2="12" stroke="#3A7BD5" strokeWidth={1.8} strokeLinecap="round" />
            <Circle cx="12" cy="16" r="1" fill="#3A7BD5" />
          </Svg>
        ) : (
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L2 20h20L12 2z" stroke="#E8922A" strokeWidth={1.8} strokeLinejoin="round" />
            <Line x1="12" y1="9" x2="12" y2="13" stroke="#E8922A" strokeWidth={1.8} strokeLinecap="round" />
            <Circle cx="12" cy="17" r="1" fill="#E8922A" />
          </Svg>
        )}
      </View>
      <Text style={[styles.bannerText, isInfo ? styles.bannerTextInfo : styles.bannerTextWarning]}>
        {text}
      </Text>
    </View>
  );
}

function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: React.ReactNode }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} activeOpacity={0.8}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && (
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path d="M5 12l5 5L20 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function BookingSummaryScreen() {
  const params = useLocalSearchParams();
  const { user, profile } = useAuth();
  const [checkedCancel, setCheckedCancel] = useState(false);
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const toast = useToast();

  const canProceed = checkedCancel && checkedTerms;

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.split(' ');
      return parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'JD';
  };

  const booking = {
    propertyId: params.propertyId as string,
    propertyName: params.propertyName as string || 'Property',
    location: params.location as string || '',
    checkIn: params.checkIn as string || '',
    checkOut: params.checkOut as string || '',
    nights: Number(params.nights) || 1,
    nightlyRate: Number(params.nightlyRate) || 0,
    serviceFee: Number(params.serviceFee) || 0,
    total: Number(params.total) || 0,
    guestName: profile?.full_name || user?.email || 'Guest',
    guestPhone: profile?.phone || '',
    cancellationFee: Number(params.cancellationFee) || 0,
    guests: Number(params.guests) || 1,
  };

  const handleConfirm = async () => {
    if (!canProceed) {
      toast.warning('Please agree', 'Both boxes must be ticked to proceed.');
      return;
    }
    if (!user) {
      toast.error('Sign in required', 'Please log in to complete your booking.');
      router.push('/auth/login');
      return;
    }
    if (!booking.propertyId) {
      toast.error('Missing property', 'Property information is missing. Please go back and try again.');
      return;
    }

    // No phone on file (common for Google sign-ups and email-only accounts
    // that never added one) — collect it now, since the host needs a real
    // way to reach the guest about check-in.
    let phoneToSave: string | null = null;
    if (!booking.guestPhone) {
      if (!phoneInput.trim()) {
        toast.error('Phone required', 'Please enter a phone number so the host can reach you.');
        return;
      }
      const localFormat = phoneInput.trim().length === 10 ? `0${phoneInput.trim()}` : phoneInput.trim();
      if (!Validate.phone(localFormat)) {
        toast.error('Invalid phone', 'Enter a valid Nigerian number, e.g. 08031234567.');
        return;
      }
      phoneToSave = `+234${localFormat.replace(/^0/, '')}`;
    }

    setLoading(true);
    try {
      if (phoneToSave) {
        await updateProfile(user.id, { phone: phoneToSave });
      }

      const created = await createBooking({
        user_id: user.id,
        property_id: booking.propertyId,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        nights: booking.nights,
        guests: booking.guests,
        nightly_rate: booking.nightlyRate,
        service_fee: booking.serviceFee,
        total: booking.total,
        cancellation_fee: booking.cancellationFee,
      });

      router.push({
        pathname: '/booking/payment',
        params: {
          bookingId: created.id,
          total: booking.total,
          propertyName: booking.propertyName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        },
      });
    } catch (e: any) {
      toast.error('Could not create booking', e.message || 'Please try again.');
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
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Property */}
        <Text style={styles.propertyName}>{booking.propertyName}</Text>
        <View style={styles.locationRow}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9E96A8" strokeWidth={1.8} />
            <Circle cx="12" cy="9" r="2.5" stroke="#9E96A8" strokeWidth={1.8} />
          </Svg>
          <Text style={styles.location}>{booking.location}</Text>
        </View>

        <View style={styles.divider} />

        {/* Booking details */}
        {[
          { label: 'Check-in', value: booking.checkIn },
          { label: 'Check-out', value: booking.checkOut },
          { label: 'Nights', value: `${booking.nights} nights` },
          { label: 'Nightly rate', value: `₦${booking.nightlyRate.toLocaleString()} × ${booking.nights} nights` },
        ].map((row) => (
          <View key={row.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{row.label}</Text>
            <Text style={styles.detailValue}>{row.value}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₦{booking.total.toLocaleString()}</Text>
        </View>

        <View style={styles.divider} />

        {/* Guest info */}
        <Text style={styles.bookingForLabel}>Booking for</Text>
        <Text style={styles.guestName}>{booking.guestName}</Text>
        {booking.guestPhone ? (
          <Text style={styles.guestPhone}>{booking.guestPhone}</Text>
        ) : (
          <View style={styles.phoneInputWrap}>
            <Text style={styles.dialCode}>🇳🇬 +234</Text>
            <View style={styles.dividerV} />
            <TextInput
              style={styles.phoneInput}
              value={phoneInput}
              onChangeText={(v) => setPhoneInput(v.replace(/[^0-9]/g, ''))}
              placeholder="803 123 4567"
              placeholderTextColor="#AEAEB2"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        )}
        {!booking.guestPhone && (
          <Text style={styles.phoneHint}>The host needs this to reach you about your stay.</Text>
        )}

        <View style={{ height: 20 }} />

        {/* Banners */}
        <InfoBanner
          type="info"
          text="Your selected dates are held for 15 minutes while you complete payment."
        />
        <View style={{ height: 12 }} />
        <InfoBanner
          type="warning"
          text={`A cancellation fee of ₦${booking.cancellationFee.toLocaleString()} applies to this property.`}
        />

        <View style={{ height: 20 }} />

        {/* Checkboxes */}
        <Checkbox
          checked={checkedCancel}
          onToggle={() => setCheckedCancel(v => !v)}
          label={
            <Text style={styles.checkLabel}>
              I have read and accept the cancellation terms for this property.
            </Text>
          }
        />
        <View style={{ height: 14 }} />
        <Checkbox
          checked={checkedTerms}
          onToggle={() => setCheckedTerms(v => !v)}
          label={
            <Text style={styles.checkLabel}>
              I agree to the{' '}
              <Text style={styles.termsLink} onPress={() => Linking.openURL(TERMS_URL)}>Bookam Terms and Conditions</Text>
            </Text>
          }
        />

        <View style={{ height: 32 }} />

        {/* CTA */}
        <PrimaryButton
          label={`Confirm and Pay — ₦${booking.total.toLocaleString()}`}
          onPress={handleConfirm}
          loading={loading}
          disabled={!canProceed}
        />
        {!canProceed && (
          <Text style={styles.bothBoxes}>Both boxes must be ticked to proceed</Text>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0EBF8',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  avatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Poppins-Bold' },
  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  propertyName: { fontSize: 20, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  location: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  divider: { height: 1, backgroundColor: '#F0EBF8', marginVertical: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  totalValue: { fontSize: 20, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  bookingForLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginBottom: 4 },
  guestName: { fontSize: 15, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#1E1E1E' },
  guestPhone: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', marginTop: 2 },
  phoneInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginTop: 6,
  },
  dialCode: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  dividerV: { width: 1, height: 18, backgroundColor: '#D1D1D6' },
  phoneInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1E1E1E', padding: 0 },
  phoneHint: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginTop: 4 },
  banner: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 10, overflow: 'hidden', padding: 14, gap: 10,
  },
  bannerInfo: { backgroundColor: '#EFF6FF' },
  bannerWarning: { backgroundColor: '#FFFBEB' },
  bannerBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  bannerBarInfo: { backgroundColor: '#3A7BD5' },
  bannerBarWarning: { backgroundColor: '#E8922A' },
  bannerIcon: { paddingTop: 1 },
  bannerText: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', lineHeight: 20 },
  bannerTextInfo: { color: '#1E40AF' },
  bannerTextWarning: { color: '#92400E' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#D1D1D6',
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: '#6B2D82', borderColor: '#6B2D82' },
  checkLabel: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#1E1E1E', lineHeight: 20 },
  termsLink: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  bothBoxes: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center', marginTop: 8 },
});