import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';

/**
 * IMPORTANT SUPABASE DASHBOARD SETUP REQUIRED:
 * For this 6-digit OTP code to work, the "Reset Password" email template
 * in Supabase must include {{ .Token }} — by default it only includes
 * {{ .ConfirmationURL }} (a clickable link), which has no code to type.
 *
 * Fix: Supabase Dashboard → Authentication → Email Templates → Reset Password
 * → edit the template to include {{ .Token }} somewhere in the email body,
 * e.g. "Your code is: {{ .Token }}"
 */

export default function OTPConfirmScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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

  const handleConfirm = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter code', 'Enter the 6-digit code.'); return; }
    if (!email) { toast.error('Missing email', 'Please start the reset process again.'); router.replace('/auth/forgot-password'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
      });
      if (error) throw error;

      // Session is now active — proceed to set new password
      router.push({ pathname: '/auth/new-password', params: { email } });
    } catch (e: any) {
      toast.error('Invalid code', e.message || 'The code is incorrect or has expired.');
    } finally {
      setLoading(false);
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
          <Text style={styles.sub}>A 6-digit code was sent to your number.</Text>

          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={r => { inputs.current[idx] = r; }}
                style={[
                  styles.otpBox,
                  digit && styles.otpBoxFilled,
                  idx === 0 && styles.otpBoxFirst,
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

          <View style={{ height: 24 }} />
          <PrimaryButton label="Confirm Code" onPress={handleConfirm} loading={loading} />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive it? </Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Resend Code</Text>
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
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', marginBottom: 40 },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  otpBox: {
    flex: 1, aspectRatio: 1,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#6B2D82',
    fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E',
  },
  otpBoxFilled: { backgroundColor: '#F0E6FA' },
  otpBoxFirst: { borderColor: '#3A7BD5', borderWidth: 2 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  resendText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  resendLink: { fontSize: 14, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#6B2D82' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 32, height: 4, borderRadius: 2, backgroundColor: '#D1C9E8' },
  dotActive: { width: 48, backgroundColor: '#6B2D82' },
});