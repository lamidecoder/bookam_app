import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { FloatingSupportButtons } from '../../../components/ui/FloatingSupportButtons';

function FaqHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>FAQ</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

function HelpfulSection() {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);
  return (
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
  );
}

export default function CancellationPolicyScreen() {
  const REFUNDS = [
    { icon: '🔄', color: '#2E9E6B', bg: '#F0FDF6', bar: '#2E9E6B', title: 'Full Refund', sub: 'Within 48 hours of booking completion.' },
    { icon: '%', color: '#E8922A', bg: '#FFFBEB', bar: '#E8922A', title: '50% Refund', sub: 'Up to 7 days before your scheduled check-in.' },
    { icon: '🚫', color: '#D94F4F', bg: '#FEF2F2', bar: '#D94F4F', title: 'No Refund', sub: 'For cancellations made within 7 days of check-in.' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <FaqHeader onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.breadcrumb}>SUPPORT › POLICIES</Text>
        <Text style={styles.title}>What is the cancellation policy?</Text>
        <Text style={styles.body}>
          At Bookam, we strive to provide a fair experience for both our guests and property hosts. Our standard cancellation policy is tiered based on the time remaining until your scheduled check-in:
        </Text>

        <View style={styles.refundCards}>
          {REFUNDS.map((r, i) => (
            <View key={i} style={[styles.refundCard, { backgroundColor: r.bg }]}>
              <View style={[styles.refundBar, { backgroundColor: r.bar }]} />
              <View style={[styles.refundIconWrap, { backgroundColor: r.bg }]}>
                <Text style={styles.refundIcon}>{r.icon}</Text>
              </View>
              <View style={styles.refundInfo}>
                <Text style={[styles.refundTitle, { color: r.color }]}>{r.title}</Text>
                <Text style={styles.refundSub}>{r.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Property-Specific Terms */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerBar} />
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
            <Circle cx="12" cy="12" r="10" stroke="#3A7BD5" strokeWidth={1.8} />
            <Path d="M12 8v4M12 16h.01" stroke="#3A7BD5" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>Property-Specific Terms</Text>
            <Text style={styles.infoBannerText}>
              Please note that certain high-demand event centers or premium short-lets may have custom cancellation terms. Always review the "House Rules" on the listing page before completing your booking.
            </Text>
          </View>
        </View>

        <HelpfulSection />

        {/* Still need help */}
        <View style={styles.stillHelpCard}>
          <Text style={styles.stillHelpIcon}>🎧</Text>
          <Text style={styles.stillHelpTitle}>Still need help?</Text>
          <Text style={styles.stillHelpSub}>Our concierge team is available 24/7 to assist with your booking concerns.</Text>
        </View>

        <PrimaryButton label="🎧  Contact Support" onPress={() => Linking.openURL('https://wa.me/2349034145636')} />
        <View style={{ height: 32 }} />
      </ScrollView>

      <FloatingSupportButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0EBF8' },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  breadcrumb: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#9E96A8', letterSpacing: 0.5, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 16, lineHeight: 32 },
  body: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22, marginBottom: 24 },
  refundCards: { gap: 12, marginBottom: 20 },
  refundCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, gap: 14, overflow: 'hidden' },
  refundBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  refundIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.1)' },
  refundIcon: { fontSize: 18 },
  refundInfo: { flex: 1 },
  refundTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold' },
  refundSub: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', marginTop: 2 },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 24, overflow: 'hidden' },
  infoBannerBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#3A7BD5' },
  infoBannerTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#3A7BD5', marginBottom: 4 },
  infoBannerText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#1E40AF', lineHeight: 20 },
  helpfulCard: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: 20, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#F0EBF8', marginBottom: 20 },
  helpfulTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  helpfulBtns: { flexDirection: 'row', gap: 24 },
  helpfulBtn: { alignItems: 'center', gap: 6, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#F0EBF8', minWidth: 70 },
  helpfulBtnActive: { borderColor: '#6B2D82', backgroundColor: '#F0E6FA' },
  helpfulIcon: { fontSize: 28 },
  helpfulLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  helpfulLabelActive: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  stillHelpCard: { alignItems: 'center', paddingVertical: 24, gap: 8, marginBottom: 20 },
  stillHelpIcon: { fontSize: 48 },
  stillHelpTitle: { fontSize: 20, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  stillHelpSub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', lineHeight: 20 },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  floatingIcon: { fontSize: 22 },
});