import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../lib/api';
import { Validate } from '../../lib/security';

export default function EditProfileScreen() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
      const rawPhone = profile.phone || '';
      setPhone(rawPhone.replace(/^\+234/, '').replace(/^0/, ''));
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name required', 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Invalid email', 'Please enter a valid email address.');
      return;
    }

    let formattedPhone: string | null = null;
    if (phone.trim()) {
      const localFormat = phone.trim().length === 10 ? `0${phone.trim()}` : phone.trim();
      if (!Validate.phone(localFormat)) {
        toast.error('Invalid phone', 'Enter a valid Nigerian phone number, e.g. 08031234567.');
        return;
      }
      formattedPhone = `+234${localFormat.replace(/^0/, '')}`;
    }

    setLoading(true);
    try {
      if (!user) throw new Error('No active session.');

      const emailChanged = email.trim() !== (profile?.email || user.email);
      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
        if (emailError) throw emailError;
      }

      await updateProfile(user.id, {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: formattedPhone || undefined,
      });
      await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });

      toast.success(
        'Profile updated!',
        emailChanged
          ? 'Check your new email to confirm the change.'
          : 'Your changes have been saved.'
      );
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/tabs/profile');
        }
      }, 1200);
    } catch (e: any) {
      toast.error('Update failed', e.message || 'Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(fullName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)) || 'GU'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.changePhotoBtn} onPress={() => toast.info('Coming soon', 'Profile photo uploads will be available in a future update.')}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputWrap}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="7" r="4" stroke="#9E96A8" strokeWidth={1.8} />
                <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                placeholderTextColor="#AEAEB2"
              />
            </View>

            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#9E96A8" strokeWidth={1.8} />
                <Path d="M22 6L12 13 2 6" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#AEAEB2"
              />
            </View>
            <Text style={styles.hint}>Changing this sends a confirmation link to the new address.</Text>

            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.flag}>🇳🇬</Text>
              <Text style={styles.dialCode}>+234</Text>
              <View style={styles.dividerV} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, ''))}
                placeholder="803 123 4567"
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#AEAEB2"
              />
            </View>
            <Text style={styles.hint}>
              Optional, but hosts use this to reach you about your booking. Not used to sign in.
            </Text>
          </View>

          <PrimaryButton label="Save Changes" onPress={handleSave} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingTop: 28, paddingBottom: 32, gap: 14 },
  avatarWrap: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2.5, borderColor: '#C9A84C',
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  changePhotoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#6B2D82', borderRadius: 40,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  cameraIcon: { fontSize: 16 },
  changePhotoText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
  form: { gap: 6, marginBottom: 32 },
  fieldLabel: {
    fontSize: 14, fontFamily: 'Poppins-SemiBold', fontWeight: '600',
    color: '#1E1E1E', marginBottom: 6, marginTop: 14,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1E1E1E', padding: 0 },
  flag: { fontSize: 18 },
  dialCode: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  dividerV: { width: 1, height: 20, backgroundColor: '#D1D1D6' },
  hint: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginTop: 4 },
});