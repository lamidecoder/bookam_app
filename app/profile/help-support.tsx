import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

const FAQS = [
  { id: 'cancellation', question: 'What is the cancellation policy?', icon: '🛡️', route: '/profile/faq/cancellation-policy' },
  { id: 'minimum-stay', question: 'How does the minimum stay work?', icon: '📅', route: '/profile/faq/minimum-stay' },
  { id: 'payment', question: 'Payment methods available', icon: '💳', route: '/profile/faq/payment-methods' },
  { id: 'verification', question: 'How to become a verified guest?', icon: '🛡️', route: '/profile/faq/verification' },
  { id: 'reporting', question: 'Reporting a property issue', icon: '🎧', route: '/profile/faq/reporting-issue' },
];

export default function HelpSupportScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="3" stroke="#6B2D82" strokeWidth={1.8} />
            <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#6B2D82" strokeWidth={1.8} />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Help and Support</Text>

        {/* FAQs */}
        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqCard}>
          {FAQS.map((faq, i) => (
            <React.Fragment key={faq.id}>
              <TouchableOpacity
                style={styles.faqRow}
                onPress={() => router.push(faq.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.faqIcon}>
                  <Text style={styles.faqIconText}>{faq.icon}</Text>
                </View>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              {i < FAQS.length - 1 && <View style={styles.faqDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Need more help */}
        <Text style={styles.sectionLabel}>NEED MORE HELP?</Text>
        <View style={styles.contactCard}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('https://wa.me/2348000000000')}
            activeOpacity={0.8}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#E8F8EF' }]}>
              <Text style={styles.contactIconText}>💬</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Chat on WhatsApp</Text>
              <Text style={styles.contactSub}>Typically replies in minutes</Text>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.faqDivider} />
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('tel:+2348000000000')}
            activeOpacity={0.8}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#F0E6FA' }]}>
              <Text style={styles.contactIconText}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Call Support</Text>
              <Text style={styles.contactSub}>Available 8AM — 10PM daily</Text>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18l6-6-6-6" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* We've got your back card */}
        <View style={styles.backCard}>
          <Text style={styles.backIcon}>🤝</Text>
          <Text style={styles.backTitle}>We've got your back</Text>
          <Text style={styles.backSub}>Our premium concierge team is always ready to ensure your stay in Lagos is seamless and luxurious.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82', marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontFamily: 'Poppins-SemiBold', fontWeight: '600',
    color: '#9E96A8', letterSpacing: 0.8, marginBottom: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  faqRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 18,
  },
  faqIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F0E6FA', alignItems: 'center', justifyContent: 'center',
  },
  faqIconText: { fontSize: 18 },
  faqQuestion: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500', lineHeight: 20 },
  faqDivider: { height: 1, backgroundColor: '#F0EBF8', marginHorizontal: 16 },
  contactCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 18 },
  contactIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  contactIconText: { fontSize: 22 },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#1E1E1E' },
  contactSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginTop: 2 },
  backCard: {
    backgroundColor: '#F0E6FA', borderRadius: 16,
    padding: 20, alignItems: 'center', gap: 8,
  },
  backIcon: { fontSize: 32, marginBottom: 4 },
  backTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  backSub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', lineHeight: 22 },
});
