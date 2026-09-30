import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { setPendingFilters } from '../../lib/searchFilters';

const PROPERTY_TYPES = ['All', 'Hotels', 'Shortlets', 'Event Centers'];
const AREAS = ['Ikoyi', 'Victoria Island', 'Lekki Phase 1', 'Banana Island', 'Ikeja'];
// ids are the REAL amenity strings stored on properties, so selecting one
// here actually matches records in the search query.
const AMENITIES = [
  { id: 'WiFi', label: 'WiFi' },
  { id: 'Parking', label: 'Parking' },
  { id: 'Pool', label: 'Pool' },
  { id: 'Generator', label: 'Generator' },
  { id: 'AC', label: 'AC' },
  { id: 'TV', label: 'TV' },
  { id: 'Kitchen', label: 'Kitchen' },
  { id: 'Security', label: 'Security' },
];
const RATINGS = ['3+', '4+', '5'];

const PRICE_MIN = 0;
const PRICE_MAX = 2000000; // top thumb at the ceiling means "no upper cap"
const PRICE_STEP = 50000;

// Monochrome line icons - matches the Search tab.
function AmenityIcon({ id, color }: { id: string; color: string }) {
  const p = { stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  switch (id) {
    case 'WiFi':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M5 12.5a10 10 0 0114 0" {...p} />
          <Path d="M8.5 15.5a5 5 0 017 0" {...p} />
          <Circle cx="12" cy="19" r="1.1" fill={color} />
        </Svg>
      );
    case 'Parking':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M5.5 11l1.4-4.2A2 2 0 018.8 5.5h6.4a2 2 0 011.9 1.3L18.5 11" {...p} />
          <Rect x="3.5" y="11" width="17" height="6" rx="1.6" {...p} />
          <Circle cx="7.5" cy="17.5" r="1.4" {...p} />
          <Circle cx="16.5" cy="17.5" r="1.4" {...p} />
        </Svg>
      );
    case 'Pool':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M3 15.5c1.8 0 1.8-1.3 3.6-1.3s1.8 1.3 3.6 1.3 1.8-1.3 3.6-1.3 1.8 1.3 3.6 1.3" {...p} />
          <Path d="M3 19.5c1.8 0 1.8-1.3 3.6-1.3s1.8 1.3 3.6 1.3 1.8-1.3 3.6-1.3 1.8 1.3 3.6 1.3" {...p} />
          <Path d="M8 12V6.5a2 2 0 014 0M8 9h4" {...p} />
        </Svg>
      );
    case 'Generator':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'AC':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2v20M4.5 6l15 12M19.5 6l-15 12" {...p} />
          <Path d="M12 5l-2.2 2M12 5l2.2 2M12 19l-2.2-2M12 19l2.2-2" {...p} />
        </Svg>
      );
    case 'TV':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="5" width="18" height="12" rx="2" {...p} />
          <Path d="M8 21h8M12 17v4" {...p} />
        </Svg>
      );
    case 'Kitchen':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M7 3v6a2 2 0 002 2M9 3v8m0 0v10M7 3v4" {...p} />
          <Path d="M16.5 3c-1.4 0-2.2 2.2-2.2 4.5s.8 3.5 2.2 3.5v10" {...p} />
        </Svg>
      );
    case 'Security':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3l7 3v5c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6l7-3z" {...p} />
          <Path d="M9 12l2 2 4-4.5" {...p} />
        </Svg>
      );
    default:
      return null;
  }
}

function StarIcon({ size = 12, color = '#C9A84C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8L12 3z" fill={color} />
    </Svg>
  );
}

// A real two-thumb, draggable price range slider (no extra native deps -
// pure PanResponder). Reports changes up as [min, max].
function PriceRangeSlider({ values, onChange }: { values: [number, number]; onChange: (v: [number, number]) => void }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const startRef = useRef(0);

  const clampStep = (v: number) =>
    Math.max(PRICE_MIN, Math.min(PRICE_MAX, Math.round(v / PRICE_STEP) * PRICE_STEP));
  const valueToX = (v: number) =>
    trackWidth > 0 ? ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * trackWidth : 0;

  const makeResponder = (which: 'min' | 'max') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = which === 'min' ? valuesRef.current[0] : valuesRef.current[1];
      },
      onPanResponderMove: (_e, g) => {
        const w = trackWidthRef.current;
        if (w <= 0) return;
        const delta = (g.dx / w) * (PRICE_MAX - PRICE_MIN);
        let nv = clampStep(startRef.current + delta);
        const [curMin, curMax] = valuesRef.current;
        if (which === 'min') {
          nv = Math.max(PRICE_MIN, Math.min(nv, curMax - PRICE_STEP));
          onChange([nv, curMax]);
        } else {
          nv = Math.min(PRICE_MAX, Math.max(nv, curMin + PRICE_STEP));
          onChange([curMin, nv]);
        }
      },
    });

  const minPan = useRef(makeResponder('min')).current;
  const maxPan = useRef(makeResponder('max')).current;

  const fmt = (v: number) => `₦${v.toLocaleString()}`;

  return (
    <View>
      <View style={styles.priceHeader}>
        <Text style={styles.sectionLabel}>Price Range</Text>
        <Text style={styles.priceRange}>
          {fmt(values[0])} - {values[1] >= PRICE_MAX ? `${fmt(PRICE_MAX)}+` : fmt(values[1])}
        </Text>
      </View>
      <View
        style={styles.sliderTrack}
        onLayout={(e) => { const w = e.nativeEvent.layout.width; trackWidthRef.current = w; setTrackWidth(w); }}
      >
        <View style={[styles.sliderFill, { left: valueToX(values[0]), width: Math.max(0, valueToX(values[1]) - valueToX(values[0])) }]} />
        <View {...minPan.panHandlers} hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }} style={[styles.sliderThumb, { left: valueToX(values[0]) - 12 }]} />
        <View {...maxPan.panHandlers} hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }} style={[styles.sliderThumb, { left: valueToX(values[1]) - 12 }]} />
      </View>
      <View style={styles.priceLabels}>
        <Text style={styles.priceLabel}>Min: {fmt(values[0])}</Text>
        <Text style={styles.priceLabel}>Max: {values[1] >= PRICE_MAX ? `${fmt(PRICE_MAX)}+` : fmt(values[1])}</Text>
      </View>
    </View>
  );
}

export default function FilterScreen() {
  const [activeType, setActiveType] = useState('All');
  const [activeAreas, setActiveAreas] = useState<string[]>([]);
  const [activeAmenities, setActiveAmenities] = useState<string[]>([]);
  const [activeRating, setActiveRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(true); // checked by default
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);

  const toggleArea = (a: string) =>
    setActiveAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const toggleAmenity = (id: string) =>
    setActiveAmenities(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const resetAll = () => {
    setActiveType('All');
    setActiveAreas([]);
    setActiveAmenities([]);
    setActiveRating('');
    setVerifiedOnly(true);
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
  };

  const applyFilters = () => {
    setPendingFilters({
      type: activeType === 'All' ? undefined : activeType.slice(0, -1),
      areas: activeAreas,
      amenities: activeAmenities,
      minPrice: priceMin,
      maxPrice: priceMax >= PRICE_MAX ? 0 : priceMax, // 0 = no upper cap
      minRating: activeRating ? parseInt(activeRating) : 0,
      verifiedOnly,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refine Search</Text>
        <TouchableOpacity onPress={resetAll}>
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

        {/* Price Range (draggable) */}
        <PriceRangeSlider
          values={[priceMin, priceMax]}
          onChange={([lo, hi]) => { setPriceMin(lo); setPriceMax(hi); }}
        />

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
              <AmenityIcon id={a.id} color={activeAmenities.includes(a.id) ? '#FFFFFF' : '#6B6478'} />
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
              onPress={() => setActiveRating(activeRating === r ? '' : r)}
            >
              <Text style={[styles.ratingText, activeRating === r && styles.ratingTextActive]}>{r}</Text>
              <View style={styles.ratingStarsRow}>
                {Array.from({ length: parseInt(r) }).map((_, i) => (
                  <StarIcon key={i} size={11} color={activeRating === r ? '#C9A84C' : '#DED0B4'} />
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Verified Only */}
        <View style={styles.verifiedCard}>
          <View style={styles.verifiedLeft}>
            <View style={styles.verifiedIconWrap}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth={2} />
                <Path d="M8 12l2.5 2.5L16 9" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
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
        <PrimaryButton label="Show Properties" onPress={applyFilters} />
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
  sliderTrack: { height: 4, backgroundColor: '#E0D9ED', borderRadius: 2, marginBottom: 8, marginTop: 8, position: 'relative', justifyContent: 'center' },
  sliderFill: { position: 'absolute', top: 0, bottom: 0, backgroundColor: '#6B2D82', borderRadius: 2 },
  sliderThumb: {
    position: 'absolute', top: -10,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#6B2D82', borderWidth: 3, borderColor: '#FFFFFF',
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  priceLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, marginTop: 6 },
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
  ratingStarsRow: { flexDirection: 'row', gap: 1 },

  // Verified
  verifiedCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F0EBF8', borderRadius: 16, padding: 16, marginBottom: 24,
  },
  verifiedLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  verifiedIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center',
  },
  verifiedText: { flex: 1, gap: 2 },
  verifiedTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  verifiedSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 18 },
});
