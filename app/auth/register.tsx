import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect, Polyline } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';

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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleRegister = async () => {
    if (!fullName.trim()) { toast.error('Name required', 'Enter your full name.'); return; }
    if (!email.trim() || !email.includes('@')) { toast.error('Invalid email', 'Enter a valid email address.'); return; }
    if (password.length < 8) { toast.error('Weak password', 'Password must be at least 8 characters.'); return; }
    if (!agreed) { toast.error('Agreement required', 'Please accept the Terms of Service.'); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email,
        });
      }

      router.push({ pathname: '/auth/otp-verify', params: { email } });
    } catch (e: any) {
      toast.error('Registration failed', e.message || 'Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <BookamLogo width={130} height={40} />
          </View>

          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.sub}>Join Bookam and start booking in minutes</Text>

          {/* Full Name */}
          <View style={styles.inputWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="7" r="4" stroke="#9E96A8" strokeWidth={1.8} />
              <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#AEAEB2"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#9E96A8" strokeWidth={1.8} />
              <Polyline points="22,6 12,13 2,6" stroke="#9E96A8" strokeWidth={1.8} />
            </Svg>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
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
              placeholder="Create a password"
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
          <Text style={styles.hint}>Minimum 8 characters</Text>

          {/* Terms checkbox */}
          <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(v => !v)} activeOpacity={0.8}>
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && (
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12l5 5L20 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              )}
            </View>
            <Text style={styles.checkLabel}>
              I agree to the{' '}
              <Text style={styles.link}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
          <PrimaryButton label="Create Account" onPress={handleRegister} loading={loading} />

          {/* OR */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
            <GoogleIcon />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginLink}>Log in</Text>
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
  heading: { fontSize: 26, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0EBF8', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 14,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1E1E1E', padding: 0 },
  hint: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginTop: -8, marginBottom: 14, marginLeft: 2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 5,
    borderWidth: 1.5, borderColor: '#C4B8DC',
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#6B2D82', borderColor: '#6B2D82' },
  checkLabel: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#1E1E1E', lineHeight: 20 },
  link: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: '#D1C9E8' },
  orText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8', letterSpacing: 0.5 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 16, marginBottom: 28,
    borderWidth: 1, borderColor: '#E0D9ED',
  },
  googleText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#1E1E1E' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  loginLink: { fontSize: 14, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#6B2D82' },
});