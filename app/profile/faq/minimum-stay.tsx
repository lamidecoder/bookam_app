import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { FloatingSupportButtons } from '../../../components/ui/FloatingSupportButtons';

export default function MinimumStayScreen() {
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
        <TouchableOpacity>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="3" stroke="#6B2D82" strokeWidth={1.8} />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>How does the minimum stay work?</Text>
        <View style={styles.titleUnderline} />

        <View style={styles.card}>
          <Text style={styles.cardBody}>
            Minimum stay requirements are specifically determined by our property owners to ensure operational efficiency and quality service for every guest.
          </Text>

          {/* Hotels + Shortlets boxes */}
          <View style={styles.infoBoxes}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxIcon}>🛏️</Text>
              <Text style={styles.infoBoxTitle}>Hotels</Text>
              <Text style={styles.infoBoxSub}>Typically 1 Night</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxIcon}>🏢</Text>
              <Text style={styles.infoBoxTitle}>Shortlets</Text>
              <Text style={styles.infoBoxSub}>2-3 Nights Average</Text>
            </View>
          </View>

          {/* Where to find it */}
          <View style={styles.tipBanner}>
            <View style={styles.tipBar} />
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
              <Circle cx="12" cy="12" r="10" stroke="#C9A84C" strokeWidth={1.8} />
              <Path d="M12 8v4M12 16h.01" stroke="#C9A84C" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Where to find it?</Text>
              <Text style={styles.tipText}>You can always view the specific minimum stay requirement on the property detail page right before you finalize your booking.</Text>
            </View>
          </View>
        </View>

        {/* Property image */}
        <View style={styles.propertyImage}>
          <Text style={styles.propertyImageEmoji}>🏙️</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✅</Text>
            <Text style={styles.verifiedText}>Verified Premium Listing</Text>
          </View>
        </View>

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

        <PrimaryButton label="🎧  Contact Support" onPress={() => Linking.openURL('https://wa.me/2348000000000')} />
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.back()}>
          <Text style={styles.browseBtnText}>Browse Other Topics</Text>
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
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', lineHeight: 32, marginBottom: 8 },
  titleUnderline: { width: 48, height: 3, backgroundColor: '#6B2D82', borderRadius: 2, marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F0EBF8', gap: 16 },
  cardBody: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22 },
  infoBoxes: { flexDirection: 'row', gap: 12 },
  infoBox: { flex: 1, backgroundColor: '#F8F5FA', borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 },
  infoBoxIcon: { fontSize: 28 },
  infoBoxTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  infoBoxSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center' },
  tipBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFFBEB', borderRadius: 10, padding: 14, overflow: 'hidden' },
  tipBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#C9A84C' },
  tipTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 4 },
  tipText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 20 },
  propertyImage: { height: 180, backgroundColor: '#2D1B33', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20, overflow: 'hidden' },
  propertyImageEmoji: { fontSize: 64 },
  verifiedBadge: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  verifiedIcon: { fontSize: 12 },
  verifiedText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
  helpfulCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#F0EBF8', marginBottom: 20 },
  helpfulTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  helpfulBtns: { flexDirection: 'row', gap: 24 },
  helpfulBtn: { alignItems: 'center', gap: 6, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#F0EBF8', minWidth: 70 },
  helpfulBtnActive: { borderColor: '#6B2D82', backgroundColor: '#F0E6FA' },
  helpfulIcon: { fontSize: 28 },
  helpfulLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  helpfulLabelActive: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  browseBtn: { borderWidth: 1.5, borderColor: '#6B2D82', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  browseBtnText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  floatingIcon: { fontSize: 22 },
});