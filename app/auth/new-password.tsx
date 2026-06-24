import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleReset = async () => {
    if (password.length < 8) { toast.error('Too short', 'Minimum 8 characters.'); return; }
    if (password !== confirm) { toast.error('Mismatch', 'Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password reset!', 'You can now log in with your new password.');
      setTimeout(() => router.replace('/auth/login'), 1500);
    } catch (e: any) {
      toast.error('Failed', e.message || 'Could not reset password.');
    } finally { setLoading(false); }
  };

  const EyeOff = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M1 1l22 22" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );

  const EyeOn = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9E96A8" strokeWidth={1.8} />
      <Circle cx="12" cy="12" r="3" stroke="#9E96A8" strokeWidth={1.8} />
    </Svg>
  );

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

          <Text style={styles.heading}>Create new password</Text>
          <Text style={styles.sub}>Your new password must be different from your previous one.</Text>

          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#9E96A8" strokeWidth={1.8} />
              <Path d="M7 11V7a5 5 0 0110 0v4" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter new password"
              placeholderTextColor="#AEAEB2"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPw ? <EyeOn /> : <EyeOff />}
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Minimum 8 characters</Text>

          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#9E96A8" strokeWidth={1.8} />
              <Path d="M7 11V7a5 5 0 0110 0v4" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Re-enter new password"
              placeholderTextColor="#AEAEB2"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showConfirm ? <EyeOn /> : <EyeOff />}
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />

          <PrimaryButton label="Reset Password" onPress={handleReset} loading={loading} />

          <View style={styles.protectedRow}>
            <Text style={styles.protectedIcon}>✅</Text>
            <Text style={styles.protectedText}>Your account is protected</Text>
          </View>

          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
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
  heading: { fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 10 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22, marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#1E1E1E', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#EBEBEB', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 6,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1E1E1E', padding: 0 },
  hint: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginBottom: 20, marginLeft: 2 },
  protectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, marginBottom: 16 },
  protectedIcon: { fontSize: 16 },
  protectedText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#2E9E6B' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 32, height: 4, borderRadius: 2, backgroundColor: '#D1C9E8' },
  dotActive: { width: 48, backgroundColor: '#6B2D82' },
});