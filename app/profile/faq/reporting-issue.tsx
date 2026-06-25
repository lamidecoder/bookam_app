import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { FloatingSupportButtons } from '../../../components/ui/FloatingSupportButtons';

export default function ReportingIssueScreen() {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);

  const STEPS = [
    {
      num: 1,
      title: 'Contact your host',
      body: 'Open the "Bookings" tab and select your current stay. Tap the message icon to contact the host directly through our secure app messaging system.',
      highlight: null,
    },
    {
      num: 2,
      title: 'Escalate if needed',
      body: 'If your host hasn\'t responded or resolved the issue within ',
      highlight: '4 hours',
      bodySuffix: ', please contact the Bookam Concierge team for immediate intervention.',
    },
    {
      num: 3,
      title: 'Document the issue',
      body: 'Take clear photos or videos of the problem. This documentation helps us verify the situation and speed up any potential refund or relocation requests.',
      highlight: null,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <TouchableOpacity><Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="3" stroke="#6B2D82" strokeWidth={1.8} /></Svg></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Reporting a property issue</Text>
        <Text style={styles.body}>We want to ensure your stay is as comfortable as possible. If something isn't right, follow these steps to get it resolved quickly.</Text>

        {/* Property image */}
        <View style={styles.propertyImage}>
          <Text style={styles.propertyEmoji}>🏢</Text>
          <View style={styles.supportBadge}>
            <Text style={styles.supportBadgeIcon}>✅</Text>
            <Text style={styles.supportBadgeText}>Verified Property Support</Text>
          </View>
        </View>

        {/* Steps */}
        {STEPS.map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{step.num}</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepBody}>
                {step.body}
                {step.highlight && <Text style={styles.stepHighlight}>{step.highlight}</Text>}
                {step.bodySuffix}
              </Text>
            </View>
          </View>
        ))}

        {/* Our Commitment banner */}
        <View style={styles.commitmentBanner}>
          <View style={styles.commitmentBar} />
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
            <Circle cx="12" cy="12" r="10" stroke="#6B2D82" strokeWidth={1.8} fill="#6B2D82" />
            <Path d="M12 8v4M12 16h.01" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={styles.commitmentTitle}>Our Commitment</Text>
            <Text style={styles.commitmentText}>Bookam is here to ensure a seamless stay. If your booking doesn't meet our quality standards, we'll make it right.</Text>
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
  closeBtn: { fontSize: 18, color: '#1E1E1E', padding: 4 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', lineHeight: 34, marginBottom: 10 },
  body: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22, marginBottom: 20 },
  propertyImage: { height: 180, backgroundColor: '#2D1B33', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24, overflow: 'hidden', position: 'relative' },
  propertyEmoji: { fontSize: 64 },
  supportBadge: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  supportBadgeIcon: { fontSize: 12 },
  supportBadgeText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
  step: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  stepNumText: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  stepContent: { flex: 1, gap: 8 },
  stepTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  stepBody: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22 },
  stepHighlight: { color: '#6B2D82', fontFamily: 'Poppins-Bold', fontWeight: '700' },
  commitmentBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F0E6FA', borderRadius: 12, padding: 16, marginBottom: 24, overflow: 'hidden' },
  commitmentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#6B2D82' },
  commitmentTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82', marginBottom: 4 },
  commitmentText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 20 },
  helpfulCard: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: 20, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#F0EBF8', marginBottom: 20 },
  helpfulTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  helpfulBtns: { flexDirection: 'row', gap: 24 },
  helpfulBtn: { alignItems: 'center', gap: 6, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#F0EBF8', minWidth: 70 },
  helpfulBtnActive: { borderColor: '#6B2D82', backgroundColor: '#F0E6FA' },
  helpfulIcon: { fontSize: 28 },
  helpfulLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  helpfulLabelActive: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  floatingIcon: { fontSize: 22 },
});