import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { cancelBooking } from '../../lib/api';

const HOLD_MINUTES = 15;

export default function PaymentFailedScreen() {
  const params = useLocalSearchParams();
  const toast = useToast();
  const bookingId = params.bookingId as string;
  const [secondsLeft, setSecondsLeft] = useState(HOLD_MINUTES * 60);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(iv);
          router.replace({ pathname: '/booking/hold-expired', params: { bookingId } });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, '0')} remaining.`;

  const handleTryAgain = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId) {
      router.replace('/tabs/home');
      return;
    }
    setCancelLoading(true);
    try {
      await cancelBooking(bookingId);
      router.replace('/tabs/home');
    } catch (e: any) {
      toast.error('Failed', e.message || 'Could not cancel. Please try again.');
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
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#1E1E1E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Error icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconBg}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Line x1="18" y1="6" x2="6" y2="18" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
              <Line x1="6" y1="6" x2="18" y2="18" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
          </View>
        </View>

        <Text style={styles.heading}>Payment unsuccessful</Text>
        <Text style={styles.sub}>
          Something went wrong with your payment on Paystack. Please try again or use a different method.
        </Text>

        {/* Hold timer banner */}
        <View style={styles.timerBanner}>
          <View style={styles.timerBar} />
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
            <Circle cx="12" cy="12" r="10" stroke="#E8922A" strokeWidth={1.8} />
            <Path d="M12 7v5l3 3" stroke="#E8922A" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
          <View>
            <Text style={styles.timerTitle}>Your dates are still held.</Text>
            <Text style={styles.timerSub}>{timeStr}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <View style={styles.buttons}>
          <PrimaryButton label="Try Again" onPress={handleTryAgain} loading={loading} />
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85} disabled={cancelLoading}>
            <Text style={styles.cancelText}>{cancelLoading ? 'Cancelling...' : 'Cancel Booking'}</Text>
          </TouchableOpacity>
          <Text style={styles.cancelNote}>Cancelling will release your held dates.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0EBF8',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 },
  iconWrap: { alignItems: 'center', marginBottom: 24 },
  iconBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#D94F4F', alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  timerBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFFBEB', borderRadius: 10,
    padding: 14, gap: 10, overflow: 'hidden',
  },
  timerBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#E8922A' },
  timerTitle: { fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#E8922A' },
  timerSub: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#E8922A', marginTop: 2 },
  buttons: { gap: 12 },
  cancelBtn: {
    borderWidth: 1.5, borderColor: '#6B2D82',
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#6B2D82' },
  cancelNote: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center' },
});