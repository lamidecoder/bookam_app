import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/ToastContext';
import { updateProfile } from '../../lib/api';

type Prefs = { booking_updates: boolean; checkin_reminders: boolean; promotions: boolean };
const DEFAULT_PREFS: Prefs = { booking_updates: true, checkin_reminders: true, promotions: true };

function SettingRow({
  title, description, value, onValueChange, disabled,
}: {
  title: string; description: string; value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E5E1EA', true: '#C9A84C' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E5E1EA"
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.notification_preferences) {
      setPrefs({ ...DEFAULT_PREFS, ...profile.notification_preferences });
    }
  }, [profile]);

  const handleToggle = async (key: keyof Prefs, value: boolean) => {
    if (!user) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next); // instant, optimistic - feels immediate rather than waiting on a network round trip
    setSaving(key);
    try {
      await updateProfile(user.id, { notification_preferences: next });
      await refreshProfile();
    } catch (e) {
      setPrefs(prefs); // revert on failure
      toast.error('Could not save', 'Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#1E1E1E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>WHAT YOU HEAR ABOUT</Text>
        <View style={styles.card}>
          <SettingRow
            title="Booking Updates"
            description="Confirmations, changes, and cancellations for your bookings."
            value={prefs.booking_updates}
            onValueChange={(v) => handleToggle('booking_updates', v)}
            disabled={saving === 'booking_updates'}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Check-in Reminders"
            description="A reminder the day before you're due to check in."
            value={prefs.checkin_reminders}
            onValueChange={(v) => handleToggle('checkin_reminders', v)}
            disabled={saving === 'checkin_reminders'}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Offers & Promotions"
            description="Occasional deals and new property announcements."
            value={prefs.promotions}
            onValueChange={(v) => handleToggle('promotions', v)}
            disabled={saving === 'promotions'}
          />
        </View>

        <Text style={styles.footnote}>
          Turning these off only affects what shows up in your notifications inbox - you'll still get essential account and security messages.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  scroll: { padding: 20, paddingTop: 8 },
  sectionLabel: { fontSize: 12, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#9E96A8', letterSpacing: 0.5, marginBottom: 10 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#F0EBF8', overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#1E1E1E', marginBottom: 3 },
  rowDesc: { fontSize: 12.5, fontFamily: 'Poppins-Regular', color: '#9E96A8', lineHeight: 17 },
  divider: { height: 1, backgroundColor: '#F5F2F8', marginLeft: 16 },
  footnote: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#B3ABC0', textAlign: 'center', marginTop: 16, lineHeight: 17, paddingHorizontal: 12 },
});