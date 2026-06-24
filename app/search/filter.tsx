import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

const PROPERTY_TYPES = ['Hotels', 'Shortlets', 'Event Centers'];
const AREAS = ['Ikoyi', 'Victoria Island', 'Lekki Phase 1', 'Banana Island', 'Ikeja'];
const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'pool', label: 'Pool', icon: '🏊' },
  { id: 'gen', label: 'Generator', icon: '⚡' },
  { id: 'ac', label: 'AC', icon: '❄️' },
  { id: 'tv', label: 'TV', icon: '📺' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'security', label: 'Security', icon: '🛡️' },
];
const RATINGS = ['3+', '4+', '5'];

export default function FilterScreen() {
  const [activeType, setActiveType] = useState('Hotels');
  const [activeAreas, setActiveAreas] = useState(['Ikoyi', 'Victoria Island']);
  const [activeAmenities, setActiveAmenities] = useState(['wifi', 'parking']);
  const [activeRating, setActiveRating] = useState('4+');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const toggleArea = (a: string) =>
    setActiveAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const toggleAmenity = (id: string) =>
    setActiveAmenities(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refine Search</Text>
        <TouchableOpacity onPress={() => {
          setActiveType('Hotels');
          setActiveAreas([]);
          setActiveAmenities([]);
          setActiveRating('');
          setVerifiedOnly(false);
        }}>
          <Text style={styles.resetBtn}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Property Type */}
        <Text style={styles.sectionLabel}>Property Type</Text>
        <View style={styles.typeRow}>
          {PROPERTY_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, activeType === type && styles.typeChipActive]}
              onPress={() => setActiveType(type)}
            >
              <Text style={[styles.typeChipText, activeType === type && styles.typeChipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Range */}
        <View style={styles.priceHeader}>
          <Text style={styles.sectionLabel}>Price Range</Text>
          <Text style={styles.priceRange}>₦20,000 - ₦250,000+</Text>
        </View>
        <View style={styles.sliderTrack}>
          <View style={styles.sliderFill} />
          <View style={[styles.sliderThumb, { left: '10%' }]} />
          <View style={[styles.sliderThumb, { left: '70%' }]} />
        </View>
        <View style={styles.priceLabels}>
          <Text style={styles.priceLabel}>Min: ₦20,000</Text>
          <Text style={styles.priceLabel}>Max: ₦500,000+</Text>
        </View>

        {/* Popular Areas */}
        <Text style={styles.sectionLabel}>Popular Areas</Text>
        <View style={styles.chipWrap}>
          {AREAS.map(area => (
            <TouchableOpacity
              key={area}
              style={[styles.chip, activeAreas.includes(area) && styles.chipActive]}
              onPress={() => toggleArea(area)}
            >
              <Text style={[styles.chipText, activeAreas.includes(area) && styles.chipTextActive]}>
                {area}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amenities */}
        <Text style={styles.sectionLabel}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {AMENITIES.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[styles.amenityItem, activeAmenities.includes(a.id) && styles.amenityItemActive]}
              onPress={() => toggleAmenity(a.id)}
            >
              <Text style={styles.amenityIcon}>{a.icon}</Text>
              <Text style={[styles.amenityLabel, activeAmenities.includes(a.id) && styles.amenityLabelActive]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ratings */}
        <Text style={styles.sectionLabel}>Ratings</Text>
        <View style={styles.ratingsRow}>
          {RATINGS.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.ratingBox, activeRating === r && styles.ratingBoxActive]}
              onPress={() => setActiveRating(r)}
            >
              <Text style={[styles.ratingText, activeRating === r && styles.ratingTextActive]}>{r}</Text>
              <Text style={styles.ratingStars}>
                {'⭐'.repeat(parseInt(r))}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Verified Only */}
        <View style={styles.verifiedCard}>
          <View style={styles.verifiedLeft}>
            <View style={styles.verifiedIconWrap}>
              <Text style={styles.verifiedIcon}>🏅</Text>
            </View>
            <View style={styles.verifiedText}>
              <Text style={styles.verifiedTitle}>Verified Only</Text>
              <Text style={styles.verifiedSub}>Show only properties inspected and verified by our concierge team.</Text>
            </View>
          </View>
          <Switch
            value={verifiedOnly}
            onValueChange={setVerifiedOnly}
            trackColor={{ false: '#E0D9ED', true: '#6B2D82' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={{ height: 20 }} />
        <PrimaryButton label="Show 12 Properties" onPress={() => router.back()} />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0EBF8',
  },
  closeBtn: { fontSize: 18, color: '#1E1E1E', padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  resetBtn: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 12 },

  // Type
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 40, backgroundColor: '#F0EBF8' },
  typeChipActive: { backgroundColor: '#6B2D82' },
  typeChipText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#9E96A8', fontWeight: '600' },
  typeChipTextActive: { color: '#FFFFFF' },

  // Price
  priceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  priceRange: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  sliderTrack: { height: 4, backgroundColor: '#E0D9ED', borderRadius: 2, marginBottom: 8, position: 'relative' },
  sliderFill: { position: 'absolute', left: '10%', right: '30%', top: 0, bottom: 0, backgroundColor: '#6B2D82', borderRadius: 2 },
  sliderThumb: {
    position: 'absolute', top: -8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#6B2D82', borderWidth: 3, borderColor: '#FFFFFF',
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  priceLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  priceLabel: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8' },

  // Areas
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 40, backgroundColor: '#F0EBF8' },
  chipActive: { backgroundColor: '#6B2D82' },
  chipText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  chipTextActive: { color: '#FFFFFF', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },

  // Amenities
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  amenityItem: {
    width: '21%', aspectRatio: 1, backgroundColor: '#F0EBF8',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  amenityItemActive: { backgroundColor: '#6B2D82' },
  amenityIcon: { fontSize: 22 },
  amenityLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center' },
  amenityLabelActive: { color: '#FFFFFF' },

  // Ratings
  ratingsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  ratingBox: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#F0EBF8', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  ratingBoxActive: { borderColor: '#6B2D82', backgroundColor: '#FFFFFF' },
  ratingText: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#9E96A8' },
  ratingTextActive: { color: '#6B2D82' },
  ratingStars: { fontSize: 12 },

  // Verified
  verifiedCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F0EBF8', borderRadius: 16, padding: 16, marginBottom: 24,
  },
  verifiedLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  verifiedIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center',
  },
  verifiedIcon: { fontSize: 22 },
  verifiedText: { flex: 1, gap: 2 },
  verifiedTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  verifiedSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 18 },
});
