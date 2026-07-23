import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Clipboard, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';

export default function BookingConfirmedScreen() {
  const params = useLocalSearchParams();
  const toast = useToast();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  const ref = params.ref as string || `BKM-${Date.now().toString().slice(-8)}`;
  const propertyName = params.propertyName as string || 'Your property';
  const propertyImage = params.propertyImage as string || '';
  const checkIn = params.checkIn as string || '—';
  const checkOut = params.checkOut as string || '—';
  const total = Number(params.total) || 0;

  useEffect(() => {
    // A real booking just completed - the single biggest success
    // moment in the app, worth its own stronger haptic rather than
    // relying on whatever toast happens to fire around the same time.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    // Entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleCopyRef = () => {
    Clipboard.setString(ref);
    toast.success('Copied!', 'Booking reference copied to clipboard.');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Purple header */}
      <View style={styles.purpleHeader}>
        {/* Decorative dots */}
        <View style={[styles.dot, { top: 30, left: 40 }]} />
        <View style={[styles.dot, { top: 80, right: 60, width: 8, height: 8 }]} />
        <View style={[styles.dot, { bottom: 40, left: 80, width: 6, height: 6 }]} />

        {/* Checkmark */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12l5 5L20 7"
              stroke="#C9A84C"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>

        <Text style={styles.confirmedText}>Booking Confirmed!</Text>

        {/* Reference */}
        <TouchableOpacity style={styles.refRow} onPress={handleCopyRef} activeOpacity={0.8}>
          <Text style={styles.refText}>REF: {ref}</Text>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M10 4h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#FFFFFF" strokeWidth={1.8} />
            </Svg>
          </Svg>
        </TouchableOpacity>
      </View>

      {/* White card */}
      <Animated.View
        style={[
          styles.cardWrap,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.card}
          showsVerticalScrollIndicator={false}
        >
        {/* Property photo */}
        {propertyImage ? (
          <Image source={{ uri: propertyImage }} style={styles.propertyPhoto} contentFit="cover" transition={200} />
        ) : null}

        {/* Property name + verified */}
        <View style={styles.propertyRow}>
          <Text style={styles.propertyName}>{propertyName}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        {[
          { label: 'Check In', value: checkIn },
          { label: 'Check Out', value: checkOut },
          { label: 'Amount Paid', value: `₦${total.toLocaleString()}`, highlight: true },
          { label: 'Payment', value: 'Paystack ✅', isPaystack: true },
        ].map((row) => (
          <View key={row.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{row.label}</Text>
            <Text style={[
              styles.detailValue,
              row.highlight && styles.detailHighlight,
            ]}>
              {row.value}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Confirmation note */}
        <View style={styles.noteBanner}>
          <View style={styles.noteBar} />
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
            <Circle cx="12" cy="12" r="10" stroke="#2E9E6B" strokeWidth={1.8} />
            <Path d="M8 12l3 3 5-5" stroke="#2E9E6B" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.noteText}>
            A confirmation email and push notification have been sent to you.
          </Text>
        </View>

        <View style={{ height: 24 }} />

        {/* Buttons */}
        <PrimaryButton
          label="View My Booking"
          onPress={() => router.replace('/tabs/bookings')}
        />
        <View style={{ height: 12 }} />
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/tabs/home')}
          activeOpacity={0.85}
        >
          <Text style={styles.homeBtnText}>Go Home</Text>
        </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6B2D82' },
  purpleHeader: {
    paddingTop: 60, paddingBottom: 36,
    alignItems: 'center', position: 'relative',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute', width: 10, height: 10,
    borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmedText: {
    fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#FFFFFF', marginBottom: 12,
  },
  refRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  refText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#FFFFFF', fontWeight: '500' },
  cardWrap: {
    flex: 1, backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  card: {
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32,
  },
  propertyPhoto: { width: '100%', height: 160, borderRadius: 14, marginBottom: 14, backgroundColor: '#F0EBF8' },
  propertyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  propertyName: { fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  verifiedBadge: {
    backgroundColor: '#F0FDF6', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#2E9E6B',
  },
  verifiedText: { fontSize: 11, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#2E9E6B' },
  divider: { height: 1, backgroundColor: '#F0EBF8', marginVertical: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  detailHighlight: { color: '#6B2D82', fontFamily: 'Poppins-Bold', fontWeight: '700', fontSize: 15 },
  noteBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#F0FDF6', borderRadius: 10,
    padding: 14, gap: 10, overflow: 'hidden',
  },
  noteBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#2E9E6B' },
  noteText: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#1A6B45', lineHeight: 20 },
  homeBtn: {
    borderWidth: 1.5, borderColor: '#6B2D82',
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  homeBtnText: { fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#6B2D82' },
});