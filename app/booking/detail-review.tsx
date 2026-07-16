import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useToast } from '../../components/ui/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { submitReview } from '../../lib/api';
import { FloatingSupportButtons } from '../../components/ui/FloatingSupportButtons';

function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => onRate(star)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={star <= rating ? '#C9A84C' : 'none'}
              stroke={star <= rating ? '#C9A84C' : '#D1D1D6'}
              strokeWidth={1.5}
            />
          </Svg>
        </TouchableOpacity>
      ))}
      <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function BookingDetailReviewScreen() {
  const params = useLocalSearchParams();
  const toast = useToast();
  const { user } = useAuth();
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const bookingId = params.bookingId as string;
  const propertyId = params.propertyId as string;
  const propertyName = params.propertyName as string || 'Property';
  const location = params.location as string || '';
  const nights = Number(params.nights) || 1;
  const total = Number(params.total) || 0;
  const serviceFee = Number(params.serviceFee) || 0;
  const nightlyRate = nights > 0 ? Math.round((total - serviceFee) / nights) : 0;
  const dates = params.dates as string || '';
  const guestCount = Number(params.guestCount) || 1;

  const handleSubmitReview = async () => {
    if (rating === 0) { toast.error('Rating required', 'Please select a star rating.'); return; }
    if (review.trim().length < 10) { toast.error('Review too short', 'Please write at least 10 characters.'); return; }
    if (!user || !bookingId || !propertyId) {
      toast.error('Missing info', 'Could not identify this booking. Please try again from My Bookings.');
      return;
    }
    setLoading(true);
    try {
      await submitReview({
        user_id: user.id,
        booking_id: bookingId,
        property_id: propertyId,
        rating,
        body: review.trim(),
      });
      toast.success('Review submitted!', 'Thank you for sharing your experience.');
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/tabs/bookings');
        }
      }, 1500);
    } catch (e: any) {
      toast.error('Failed', e.message || 'Could not submit review. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#1E1E1E" strokeWidth={1.8} />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Circle cx="18" cy="5" r="3" stroke="#1E1E1E" strokeWidth={1.8} />
              <Circle cx="6" cy="12" r="3" stroke="#1E1E1E" strokeWidth={1.8} />
              <Circle cx="18" cy="19" r="3" stroke="#1E1E1E" strokeWidth={1.8} />
              <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#1E1E1E" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property image */}
        <View style={styles.propertyImage}>
          <Text style={styles.imagePlaceholder}>🏨</Text>
          <View style={styles.completedBadge}>
            <View style={styles.completedDot} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Property info */}
          <Text style={styles.propertyName}>{propertyName}</Text>
          <View style={styles.locationRow}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9E96A8" strokeWidth={1.8} />
            </Svg>
            <Text style={styles.locationText}>{location}</Text>
          </View>

          {/* Duration + Guests */}
          <View style={styles.infoBoxes}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>DURATION</Text>
              <Text style={styles.infoValue}>{nights} Nights</Text>
              <Text style={styles.infoSub}>{dates}</Text>
            </View>
            <View style={[styles.infoBox, { borderLeftWidth: 1, borderLeftColor: '#F0EBF8' }]}>
              <Text style={styles.infoLabel}>GUESTS</Text>
              <Text style={styles.infoValue}>{guestCount} Adults</Text>
              <Text style={styles.infoSub}>Verified Check-In</Text>
            </View>
          </View>

          {/* Review section */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewHeading}>How was your stay?</Text>
            <Text style={styles.reviewSub}>Share your experience to help others in the Bookam community.</Text>
            <StarRating rating={rating} onRate={setRating} />
            <Text style={styles.writeLabel}>Write a review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder={`Tell us about your stay at ${propertyName}...`}
              placeholderTextColor="#AEAEB2"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <PrimaryButton label="Submit Review" onPress={handleSubmitReview} loading={loading} />
            <Text style={styles.reviewNote}>Reviews are posted publicly and include your first name.</Text>
          </View>

          {/* Payment details */}
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentRows}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>{nights} Nights x ₦{nightlyRate.toLocaleString()}</Text>
              <Text style={styles.paymentValue}>₦{(nightlyRate * nights).toLocaleString()}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Fee</Text>
              <Text style={styles.paymentValue}>₦{serviceFee.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
            </View>
          </View>

          {/* Download receipt */}
          <TouchableOpacity style={styles.receiptBtn} onPress={() => toast.info('Coming soon', 'Downloadable receipts will be available in a future update.')}>
            <Text style={styles.receiptIcon}>🧾</Text>
            <Text style={styles.receiptText}>Download Receipt</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating support buttons */}
      <FloatingSupportButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  headerRight: { flexDirection: 'row', gap: 16 },
  propertyImage: {
    height: 220, backgroundColor: '#F0EBF8',
    alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholder: { fontSize: 64 },
  completedBadge: {
    position: 'absolute', top: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  completedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B6478' },
  completedText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#6B6478', fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  propertyName: { fontSize: 20, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  locationText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  infoBoxes: {
    flexDirection: 'row', backgroundColor: '#F8F5FC',
    borderRadius: 12, marginBottom: 24, overflow: 'hidden',
  },
  infoBox: { flex: 1, padding: 16, gap: 4 },
  infoLabel: { fontSize: 10, fontFamily: 'Poppins-Medium', color: '#9E96A8', letterSpacing: 0.8 },
  infoValue: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  infoSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  reviewCard: {
    backgroundColor: '#FAFAFA', borderRadius: 16,
    padding: 20, marginBottom: 28, gap: 14,
    borderWidth: 1, borderColor: '#F0EBF8',
  },
  reviewHeading: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  reviewSub: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 20, marginTop: -6 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingNum: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#C9A84C', marginLeft: 8, fontWeight: '600' },
  writeLabel: { fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#1E1E1E' },
  reviewInput: {
    backgroundColor: '#FFFFFF', borderRadius: 10,
    borderWidth: 1, borderColor: '#E0D9ED',
    padding: 14, fontSize: 14, fontFamily: 'Poppins-Regular',
    color: '#1E1E1E', minHeight: 100,
  },
  reviewNote: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 16 },
  paymentRows: { gap: 12, marginBottom: 20 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between' },
  paymentLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  paymentValue: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F0EBF8' },
  totalLabel: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  totalValue: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  receiptBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8F5FC', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#E0D9ED',
  },
  receiptIcon: { fontSize: 20 },
  receiptText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  callBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  floatingIcon: { fontSize: 22 },
});