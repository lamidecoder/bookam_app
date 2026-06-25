import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';

export default function OTPVerifyScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
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

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter code', 'Enter the 6-digit code.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw error;
      if (router.canGoBack()) { router.back(); } else { router.replace('/tabs/home'); }
    } catch (e: any) {
      toast.error('Invalid code', 'The code is incorrect or expired.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!canResend) return;
    await supabase.auth.resend({ type: 'signup', email });
    setCountdown(60);
    setCanResend(false);
    toast.success('Code sent!', 'A new code has been sent to your email.');
  };

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'johndoe@example.com';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>

          {/* Header */}
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
            <Text>. Enter it below.</Text>
          </Text>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={r => { inputs.current[idx] = r; }}
                style={[
                  styles.otpBox,
                  digit && styles.otpBoxFilled,
                  idx === 0 && !digit && styles.otpBoxActive,
                ]}
                value={digit}
                onChangeText={v => handleChange(v, idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

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
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  otpBox: {
    flex: 1, aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14, borderWidth: 1.5, borderColor: '#D1C9E8',
    fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#1E1E1E',
  },
  otpBoxFilled: { borderColor: '#6B2D82', backgroundColor: '#F5F3FF' },
  otpBoxActive: { borderColor: '#6B2D82', borderWidth: 2 },
  resendWrap: { alignItems: 'center', marginTop: 16, gap: 4 },
  resendLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1E1E1E' },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resendLink: { fontSize: 14, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#9E96A8' },
  resendLinkDisabled: { color: '#9E96A8' },
  countdown: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
});