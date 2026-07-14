import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { OtpInput } from '../../components/ui/OtpInput';
import { useToast } from '../../components/ui/ToastContext';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { RateLimiter } from '../../lib/security';

/**
 * IMPORTANT SUPABASE DASHBOARD SETUP REQUIRED:
 * For this 6-digit OTP code to work, the "Reset Password" email template
 * in Supabase must include {{ .Token }} — by default it only includes
 * {{ .ConfirmationURL }} (a clickable link), which has no code to type.
 */

export default function OTPConfirmScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
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

  // codeOverride: the auto-submit fires before React re-renders with the
  // final digit, so reading `otp` state here would get the old 5-digit
  // value and reject valid codes. Pass the fresh value directly.
  const handleConfirm = async (codeOverride?: string) => {
    const code = codeOverride ?? otp;
    if (code.length < 6) { toast.error('Enter code', 'Enter the 6-digit code.'); return; }
    if (!email) { toast.error('Missing email', 'Please start the reset process again.'); router.replace('/auth/forgot-password'); return; }

    const rateLimitKey = `otp-confirm:${email}`;
    if (!RateLimiter.check(rateLimitKey, 5, 15 * 60 * 1000)) {
      toast.error('Too many attempts', `Please wait ${RateLimiter.getRemainingTime(rateLimitKey)} minutes before trying again.`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
      });
      if (error) throw error;
      toast.success('Code verified!', 'Now choose your new password.');
      router.push({ pathname: '/auth/new-password', params: { email } });
    } catch (e: any) {
      toast.error('Invalid code', e.message || 'The code is incorrect or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: AuthSession.makeRedirectUri({ scheme: 'bookam', path: 'auth/callback' }),
      });
      if (error) throw error;
      setCountdown(60);
      setCanResend(false);
      setOtp('');
      toast.success('Code sent!', 'A new code has been sent to your email.');
    } catch (e: any) {
      toast.error('Failed', e.message || 'Could not resend code.');
    }
  };

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

          <Text style={styles.heading}>Enter the code</Text>
          <Text style={styles.sub}>A 6-digit code was sent to your email — paste it, it'll fill in automatically.</Text>

          <OtpInput length={6} value={otp} onChange={(val) => {
            setOtp(val);
            if (val.length === 6) {
              setTimeout(() => handleConfirm(val), 100);
            }
          }} />

          <View style={{ height: 24 }} />
          <PrimaryButton label="Confirm Code" onPress={() => handleConfirm()} loading={loading} />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={!canResend}>
              <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                {canResend ? 'Resend Code' : `Resend in 0:${String(countdown).padStart(2, '0')}`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />

          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2FA' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 10 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', marginBottom: 40, paddingHorizontal: 8 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  resendText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  resendLink: { fontSize: 14, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#6B2D82' },
  resendLinkDisabled: { color: '#9E96A8', fontFamily: 'Poppins-Regular', fontWeight: '400' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 32, height: 4, borderRadius: 2, backgroundColor: '#D1C9E8' },
  dotActive: { width: 48, backgroundColor: '#6B2D82' },
});