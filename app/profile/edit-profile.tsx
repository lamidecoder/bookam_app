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

export default function EditProfileScreen() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name required', 'Please enter your full name.');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ full_name: fullName, email }).eq('id', user.id);
        await supabase.auth.updateUser({ data: { full_name: fullName } });
      }
      toast.success('Profile updated!', 'Your changes have been saved.');
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      toast.error('Update failed', 'Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="3" stroke="#6B2D82" strokeWidth={1.8} />
              <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#6B2D82" strokeWidth={1.8} />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(fullName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)) || 'GU'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
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
                placeholderTextColor="#AEAEB2"
              />
            </View>

            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={[styles.inputWrap, styles.inputLocked]}>
              <Text style={styles.flag}>🇳🇬</Text>
              <Text style={styles.dialCode}>+234</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={profile?.phone || 'Not set'}
                editable={false}
                placeholderTextColor="#AEAEB2"
              />
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </Svg>
            </View>
            <Text style={styles.lockedNote}>Phone number cannot be changed as it identifies your account.</Text>
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
  inputLocked: { opacity: 0.7 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1E1E1E', padding: 0 },
  flag: { fontSize: 18 },
  dialCode: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  lockedNote: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginTop: 4 },
});