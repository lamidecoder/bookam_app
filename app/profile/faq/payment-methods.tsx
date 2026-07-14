import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { FloatingSupportButtons } from '../../../components/ui/FloatingSupportButtons';

export default function PaymentMethodsScreen() {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Payment methods available</Text>
        <Text style={styles.body}>Learn more about how we process your payments securely on our platform.</Text>

        {/* Secure Payments banner */}
        <View style={styles.secureBanner}>
          <View style={styles.secureBar} />
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#2E9E6B" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={styles.secureBannerTitle}>Secure Payments</Text>
            <Text style={styles.secureBannerText}>All payments are processed through a secure, encrypted payment gateway to ensure your financial data is always protected.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accepted Methods</Text>

        {/* Bank Transfer */}
        <View style={styles.methodCard}>
          <View style={[styles.methodIcon, { backgroundColor: '#F0E6FA' }]}>
            <Text style={styles.methodIconText}>🏦</Text>
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Bank Transfer</Text>
            <Text style={styles.methodSub}>Direct transfer from your bank app</Text>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>

        {/* Debit/Credit Cards */}
        <View style={styles.methodCard}>
          <View style={[styles.methodIcon, { backgroundColor: '#FFF8E7' }]}>
            <Text style={styles.methodIconText}>💳</Text>
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Debit/Credit Cards</Text>
            <Text style={styles.methodSub}>Global and local card networks</Text>
            <View style={styles.cardNetworks}>
              <View style={styles.networkChip}><Text style={styles.networkText}>💳 Mastercard</Text></View>
              <View style={styles.networkChip}><Text style={styles.networkText}>📶 Visa</Text></View>
              <View style={styles.networkChip}><Text style={styles.networkText}>🛡️ Verve</Text></View>
            </View>
          </View>
        </View>

        {/* USSD */}
        <View style={styles.methodCard}>
          <View style={[styles.methodIcon, { backgroundColor: '#FFF8E7' }]}>
            <Text style={styles.methodIconText}>📱</Text>
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>USSD</Text>
            <Text style={styles.methodSub}>Fast dial codes for any Nigerian bank</Text>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
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

        <PrimaryButton label="🎧  Contact Support" onPress={() => Linking.openURL('https://wa.me/2349034145636')} />
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
  closeBtn: { fontSize: 18, color: '#1E1E1E', padding: 4 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', lineHeight: 34, marginBottom: 10 },
  body: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22, marginBottom: 20 },
  secureBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F0FDF6', borderRadius: 12, padding: 16, marginBottom: 24, overflow: 'hidden' },
  secureBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#2E9E6B' },
  secureBannerTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#2E9E6B', marginBottom: 4 },
  secureBannerText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#1A6B45', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 14 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F0EBF8' },
  methodIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  methodIconText: { fontSize: 24 },
  methodInfo: { flex: 1, gap: 3 },
  methodTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  methodSub: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  cardNetworks: { flexDirection: 'row', gap: 8, marginTop: 8 },
  networkChip: { backgroundColor: '#F5F5F5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  networkText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  helpfulCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#F0EBF8', marginTop: 4, marginBottom: 20 },
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