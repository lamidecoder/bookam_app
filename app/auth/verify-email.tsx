import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { RateLimiter } from '../../lib/security';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const toast = useToast();

  useEffect(() => {
    const iv = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(iv);
  }, []);

  const handleResend = async () => {
    if (timer > 0) {
      toast.warning('Please wait', `You can resend in ${timer} seconds.`);
      return;
    }
    if (!RateLimiter.check('resend_email', 3, 15 * 60 * 1000)) {
      toast.warning('Too many attempts', 'Please wait 15 minutes before trying again.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email as string,
        options: { emailRedirectTo: AuthSession.makeRedirectUri({ scheme: 'bookam', path: 'auth/callback' }) },
      });

      if (error) throw error;

      setTimer(60);
      toast.success('Email resent!', 'Check your inbox for the verification link.');
    } catch (error: any) {
      toast.error('Failed to resend', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast.success('Email verified!', 'Welcome to Bookam.');
        router.replace('/tabs/home');
      } else {
        toast.info('Not verified yet', 'Please click the link in your email first.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.inner}>

        <View style={styles.logoRow}>
          <BookamLogo width={120} height={36} />
        </View>

        {/* Email illustration */}
        <View style={styles.iconWrap}>
          <View style={styles.iconBg}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                stroke="#6B2D82" strokeWidth={1.8}
              />
              <Path d="M22 6L12 13 2 6" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </View>
        </View>

        <Text style={styles.heading}>Verify your email</Text>
        <Text style={styles.sub}>
          We sent a verification link to{'\n'}
          <Text style={styles.emailText}>{email || 'your email address'}</Text>
          {'\n\n'}Click the link in the email to activate your account.
        </Text>

        {/* Steps */}
        <View style={styles.steps}>
          {[
            '1. Open your email app',
            '2. Find the email from Bookam',
            '3. Click "Confirm your email"',
            '4. Come back here and tap below',
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            label="I've verified my email"
            onPress={handleCheckVerification}
            loading={loading}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0 || loading}>
              <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend email'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back to login</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE9F5' },
  inner: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  logoRow: { alignItems: 'center', paddingTop: 24, paddingBottom: 32 },
  iconWrap: { alignItems: 'center', marginBottom: 28 },
  iconBg: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#F0E6FA',
    alignItems: 'center', justifyContent: 'center',
  },
  heading: {
    fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#1E1E1E', textAlign: 'center', marginBottom: 12,
  },
  sub: {
    fontSize: 14, fontFamily: 'Poppins-Regular',
    color: '#6B6478', textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  emailText: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  steps: { gap: 12, marginBottom: 36 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B2D82' },
  stepText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1E1E1E' },
  bottom: { gap: 16 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  resendLink: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  resendDisabled: { color: '#B0AABC' },
  backBtn: { alignItems: 'center' },
  backText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
});