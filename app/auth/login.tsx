import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect, Polyline } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';
import { RateLimiter } from '../../lib/security';
import { signInWithGoogle } from '../../lib/googleAuth';

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </Svg>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const toast = useToast();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle(false);
      if (!result.success) {
        const failed = result as { success: false; error: string; needsTerms?: boolean };
        if (failed.needsTerms) {
          toast.info('One more step', 'Please accept our Terms of Service to create your account.');
          router.replace('/auth/register');
          return;
        }
        toast.error('Google sign-in failed', failed.error);
        return;
      }
      toast.success('Welcome back!', 'You are now logged in.');
      // Always explicitly go to home — no ambiguity. router.canGoBack()
      // + router.back() used to be here, but canGoBack() can evaluate
      // true due to how Expo Router's nested (auth) group stack retains
      // its own internal history, so back() was returning WITHIN the
      // auth flow instead of actually leaving it. After a successful
      // sign-in there is only one correct destination.
      router.replace('/tabs/home');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) { toast.error('Email required', 'Enter your email address.'); return; }
    if (!password) { toast.error('Password required', 'Enter your password.'); return; }
    const rateLimitKey = `login:${email.trim().toLowerCase()}`;
    if (!RateLimiter.check(rateLimitKey, 5, 15 * 60 * 1000)) {
      toast.error('Too many attempts', `Please wait ${RateLimiter.getRemainingTime(rateLimitKey)} minutes before trying again.`);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      toast.success('Welcome back!', 'You are now logged in.');
      router.replace('/tabs/home');
    } catch (e: any) {
      toast.error('Login failed', e.message || 'Incorrect email or password.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.logoWrap}>
            <BookamLogo width={130} height={40} />
          </View>

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.sub}>Log in to your Bookam account</Text>

          {/* Email */}
          <View style={styles.inputWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#9E96A8" strokeWidth={1.8} />
              <Polyline points="22,6 12,13 2,6" stroke="#9E96A8" strokeWidth={1.8} />
            </Svg>
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
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#9E96A8" strokeWidth={1.8} />
              <Path d="M7 11V7a5 5 0 0110 0v4" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#AEAEB2"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                {showPassword ? (
                  <>
                    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9E96A8" strokeWidth={1.8} />
                    <Circle cx="12" cy="12" r="3" stroke="#9E96A8" strokeWidth={1.8} />
                  </>
                ) : (
                  <>
                    <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
                    <Path d="M1 1l22 22" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
                  </>
                )}
              </Svg>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotWrap} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton label="Log In" onPress={handleLogin} loading={loading} />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && { opacity: 0.6 }]}
            activeOpacity={0.85}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <GoogleIcon />
            <Text style={styles.googleText}>{googleLoading ? 'Signing in...' : 'Continue with Google'}</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account?  </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE9F5' },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  heading: { fontSize: 28, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', marginBottom: 28 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0EBF8', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 14,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1E1E1E', padding: 0 },
  forgotWrap: { alignItems: 'flex-end', marginTop: -4, marginBottom: 20 },
  forgotText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: '#D1C9E8' },
  orText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 16, marginBottom: 28,
    borderWidth: 1, borderColor: '#E0D9ED',
  },
  googleText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#1E1E1E' },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  signupLink: { fontSize: 14, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#6B2D82' },
});