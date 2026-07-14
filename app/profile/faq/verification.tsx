import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { FloatingSupportButtons } from '../../../components/ui/FloatingSupportButtons';

export default function VerificationScreen() {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero image */}
        <View style={styles.heroImage}>
          <Text style={styles.heroEmoji}>🏨</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeIcon}>🏅</Text>
            <Text style={styles.heroBadgeText}>How to become a verified guest?</Text>
          </View>
        </View>

        {/* Step 1 */}
        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Identity Verification</Text>
            <Text style={styles.stepBody}>To maintain safety and trust, we require a valid government-issued document. You can upload one of the following:</Text>
            {['🪪  National ID Card', '🌍  International Passport', '🚗  Driver\'s License'].map((doc, i) => (
              <View key={i} style={styles.docRow}>
                <Text style={styles.docText}>{doc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Profile Completion</Text>
            <Text style={styles.stepBody}>Upload a clear, recent profile photo. This helps hosts recognize you during check-in and adds a personal touch to your profile.</Text>
          </View>
        </View>

        {/* Why get verified */}
        <Text style={styles.sectionTitle}>Why get verified?</Text>
        <View style={styles.goldBadgeCard}>
          <View style={styles.goldBadgeIcon}><Text style={styles.goldBadgeEmoji}>🏅</Text></View>
          <View>
            <Text style={styles.goldBadgeTitle}>Gold 'Verified' Badge</Text>
            <Text style={styles.goldBadgeSub}>Stand out as a premium guest.</Text>
          </View>
        </View>
        <View style={styles.benefitRow}>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>🤝</Text>
            <Text style={styles.benefitTitle}>Build Trust with Hosts</Text>
          </View>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitTitle}>Faster Booking Approvals</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Helpful */}
        <View style={styles.helpfulCard}>
          <Text style={styles.helpfulTitle}>Was this helpful?</Text>
          <View style={styles.helpfulBtns}>
            <TouchableOpacity style={[styles.helpfulBtn, voted === 'yes' && styles.helpfulBtnActive]} onPress={() => setVoted('yes')}>
              <Text style={styles.helpfulIcon}>👍</Text>
              <Text style={[styles.helpfulLabel, voted === 'yes' && styles.helpfulLabelActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.helpfulBtn, voted === 'no' && styles.helpfulBtnActive]} onPress={() => setVoted('no')}>
              <Text style={styles.helpfulIcon}>👎</Text>
              <Text style={[styles.helpfulLabel, voted === 'no' && styles.helpfulLabelActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton label="Get Verified Now" onPress={() => {}} />
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('https://wa.me/2349034145636')}>
          <Text style={styles.contactBtnIcon}>🎧</Text>
          <Text style={styles.contactBtnText}>Contact Support</Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>

      <FloatingSupportButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0EBF8' },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  scroll: { paddingBottom: 40 },
  heroImage: { height: 180, backgroundColor: '#2D1B33', alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative' },
  heroEmoji: { fontSize: 64 },
  heroBadge: { position: 'absolute', bottom: 14, left: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroBadgeIcon: { fontSize: 16 },
  heroBadgeText: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  step: { flexDirection: 'row', gap: 14, paddingHorizontal: 20, marginBottom: 24 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  stepNumText: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  stepContent: { flex: 1, gap: 8 },
  stepTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  stepBody: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22 },
  docRow: { paddingVertical: 4 },
  docText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  sectionTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', paddingHorizontal: 20, marginBottom: 14 },
  goldBadgeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 14, marginHorizontal: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0EBF8' },
  goldBadgeIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF8E7', alignItems: 'center', justifyContent: 'center' },
  goldBadgeEmoji: { fontSize: 24 },
  goldBadgeTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  goldBadgeSub: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginTop: 2 },
  benefitRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  benefitCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 8, borderWidth: 1, borderColor: '#F0EBF8' },
  benefitIcon: { fontSize: 28 },
  benefitTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#F0EBF8', marginHorizontal: 20, marginBottom: 20 },
  helpfulCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 20, padding: 20, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#F0EBF8', marginBottom: 20 },
  helpfulTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  helpfulBtns: { flexDirection: 'row', gap: 24 },
  helpfulBtn: { alignItems: 'center', gap: 6, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#F0EBF8', minWidth: 70 },
  helpfulBtnActive: { borderColor: '#6B2D82', backgroundColor: '#F0E6FA' },
  helpfulIcon: { fontSize: 28 },
  helpfulLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  helpfulLabelActive: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#6B2D82', borderRadius: 14, paddingVertical: 16, marginHorizontal: 20 },
  contactBtnIcon: { fontSize: 18 },
  contactBtnText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  floatingIcon: { fontSize: 22 },
});