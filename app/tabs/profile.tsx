import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/ToastContext';
import { useAuth } from '../../hooks/useAuth';

function MenuRow({ icon, label, onPress, danger }: {
  icon: React.ReactNode; label: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {!danger && (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path d="M9 18l6-6-6-6" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const toast = useToast();
  const { user, profile } = useAuth();

  const displayName = profile?.full_name || 'Guest';
  const displayPhone = profile?.phone || 'Not set';
  const displayEmail = profile?.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'GU';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#6B2D82" strokeWidth={1.8} />
            <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="#6B2D82" strokeWidth={1.8} />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userPhone}>{displayPhone}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile/edit-profile')} style={styles.editBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          <MenuRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="7" r="4" stroke="#6B2D82" strokeWidth={1.8} /><Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" /></Svg>}
            label="Edit Profile"
            onPress={() => router.push('/profile/edit-profile')}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#6B2D82" strokeWidth={1.8} /></Svg>}
            label="Saved Properties"
            onPress={() => router.push('/profile/saved-properties')}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" /></Svg>}
            label="Notification Settings"
            onPress={() => toast.info('Coming soon', 'Notification settings coming in v1.1')}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            label="Help and Support"
            onPress={() => router.push('/profile/help-support')}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#D94F4F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            label="Log Out"
            onPress={handleLogout}
            danger
          />
        </View>

        <Text style={styles.version}>Bookam v1.0.0</Text>
      </ScrollView>

      {/* Floating buttons */}
      <View style={styles.floatingBtns}>
        <TouchableOpacity style={styles.whatsappBtn} onPress={() => Linking.openURL('https://wa.me/2348000000000')}>
          <Text style={styles.floatingIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:+2348000000000')}>
          <Text style={styles.floatingIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },

  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 16, marginBottom: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  avatarWrap: {},
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  userPhone: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  userEmail: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  editBtn: { padding: 8 },

  menuCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 18,
  },
  menuIcon: { width: 24, alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  menuLabelDanger: { color: '#D94F4F' },
  menuDivider: { height: 1, backgroundColor: '#F0EBF8', marginHorizontal: 20 },

  version: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center', marginTop: 8 },

  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  callBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  floatingIcon: { fontSize: 22 },
});