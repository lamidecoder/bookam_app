import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { OtpInput } from '../../components/ui/OtpInput';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';
import { RateLimiter } from '../../lib/security';

export default function OTPVerifyScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string || '';
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (otp.length < 6) { toast.error('Enter code', 'Enter the 6-digit code.'); return; }
    const rateLimitKey = `otp-verify:${email}`;
    if (!RateLimiter.check(rateLimitKey, 5, 15 * 60 * 1000)) {
      toast.error('Too many attempts', `Please wait ${RateLimiter.getRemainingTime(rateLimitKey)} minutes before trying again.`);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      toast.success('Email verified!', 'Your account is ready to go.');
      router.replace('/tabs/home');
    } catch (e: any) {
      toast.error('Invalid code', 'The code is incorrect or expired.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!canResend) return;
    await supabase.auth.resend({ type: 'signup', email });
    setCountdown(60);
    setCanResend(false);
    setOtp('');
    toast.success('Code sent!', 'A new code has been sent to your email.');
  };

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'johndoe@example.com';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#1E1E1E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <BookamLogo width={110} height={34} />
            <View style={{ width: 22 }} />
          </View>

          <View style={{ height: 48 }} />

          <Text style={styles.heading}>Verify your email</Text>
          <Text style={styles.sub}>
            We sent a 6-digit code to your email{'\n'}
            <Text style={styles.emailHighlight}>{maskedEmail}</Text>
            <Text>. Enter it below — or just paste it, it'll fill in automatically.</Text>
          </Text>

          <OtpInput length={6} value={otp} onChange={(val) => {
            setOtp(val);
            if (val.length === 6) {
              // Auto-submit the moment all 6 digits are in, whether typed
              // or pasted — feels instant, like a real banking app.
              setTimeout(() => handleVerify(), 100);
            }
          }} />

          <View style={{ flex: 1 }} />

          <PrimaryButton label="Verify" onPress={handleVerify} loading={loading} />

          <View style={styles.resendWrap}>
            <Text style={styles.resendLabel}>Didn't get the code?</Text>
            <View style={styles.resendRow}>
              <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                  Resend code
                </Text>
              </TouchableOpacity>
              {!canResend && (
                <Text style={styles.countdown}>🕐 Resend in 0:{String(countdown).padStart(2, '0')}</Text>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE9F5' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  emailHighlight: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  resendWrap: { alignItems: 'center', marginTop: 16, gap: 4 },
  resendLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1E1E1E' },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resendLink: { fontSize: 14, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#9E96A8' },
  resendLinkDisabled: { color: '#9E96A8' },
  countdown: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
});