import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { RateLimiter } from '../../lib/security';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSend = async () => {
    if (!email.trim() || !email.includes('@')) { toast.error('Invalid email', 'Enter a valid email address.'); return; }
    const rateLimitKey = `forgot-password:${email.trim().toLowerCase()}`;
    if (!RateLimiter.check(rateLimitKey, 3, 15 * 60 * 1000)) {
      toast.error('Too many attempts', `Please wait ${RateLimiter.getRemainingTime(rateLimitKey)} minutes before trying again.`);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // Auto-detects the right redirect for the current environment -
        // exp:// in Expo Go during dev, bookam:// in a real build. Was
        // previously hardcoded to the Expo Go format only, which would
        // have silently broken password reset in production builds.
        redirectTo: AuthSession.makeRedirectUri({ scheme: 'bookam', path: 'auth/callback' }),
      });
      if (error) throw error;
      router.push({ pathname: '/auth/otp-confirm', params: { email: email.trim() } });
    } catch (e: any) {
      toast.error('Failed', e.message || 'Could not send reset code.');
    } finally { setLoading(false); }
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

          <View style={{ height: 40 }} />

          <Text style={styles.heading}>Reset your password</Text>
          <Text style={styles.sub}>Enter the email address linked to your account and we'll send you a reset code.</Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#AEAEB2"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={{ flex: 1 }} />

          <PrimaryButton label="Send Code" onPress={handleSend} loading={loading} />

          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0FF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 10 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22, marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#1E1E1E', marginBottom: 8 },
  input: {
    backgroundColor: '#EBEBEB', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1E1E1E',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 },
  dot: { width: 32, height: 4, borderRadius: 2, backgroundColor: '#D1C9E8' },
  dotActive: { width: 48, backgroundColor: '#6B2D82' },
});