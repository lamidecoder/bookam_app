import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Linking, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { searchProperties, getSavedPropertyIds, toggleSavedProperty } from '../../lib/api';
import { optimizedImageUrl } from '../../lib/cloudinary';

const PROPERTY_TYPES = ['All', 'Hotels', 'Shortlets', 'Event Centers'];
const AREAS = ['Lekki Phase 1', 'Ikoyi', 'Ikeja', 'Ajah', 'Victoria Island', 'Magodo', 'Surulere', 'Banana Island'];
const AMENITIES = [
  { id: 'WiFi', label: 'WiFi', icon: '📶' },
  { id: 'Parking', label: 'Parking', icon: '🅿️' },
  { id: 'Pool', label: 'Pool', icon: '🏊' },
  { id: 'Generator', label: 'Generator', icon: '⚡' },
  { id: 'AC', label: 'AC', icon: '❄️' },
  { id: 'TV', label: 'TV', icon: '📺' },
  { id: 'Kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'Security', label: 'Security', icon: '🛡️' },
];

function VerifiedBadge() {
  return (
    <View style={styles.verifiedBadge}>
      <Text style={styles.verifiedIcon}>🏅</Text>
      <Text style={styles.verifiedText}>VERIFIED</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [activeAreas, setActiveAreas] = useState<string[]>([]);
  const [activeAmenities, setActiveAmenities] = useState<string[]>([]);
  const [guests, setGuests] = useState(1);
  const [results, setResults] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleArea = (area: string) =>
    setActiveAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);

  const toggleAmenity = (id: string) =>
    setActiveAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchProperties({
        query: search,
        type: activeType === 'All' ? undefined : activeType.slice(0, -1),
        areas: activeAreas.length ? activeAreas : undefined,
        amenities: activeAmenities.length ? activeAmenities : undefined,
        guests,
      });
      setResults(data);
      if (user) {
        const saved = await getSavedPropertyIds(user.id);
        setSavedIds(saved);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, activeType, activeAreas, activeAmenities, guests, user]);

  useEffect(() => {
    const debounce = setTimeout(runSearch, 400);
    return () => clearTimeout(debounce);
  }, [runSearch]);

  const handleToggleSave = async (propertyId: string) => {
    if (!user) { router.push('/auth/login'); return; }
    const nowSaved = await toggleSavedProperty(user.id, propertyId);
    setSavedIds(prev => nowSaved ? [...prev, propertyId] : prev.filter(id => id !== propertyId));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#1E1E1E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.searchInputWrap}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx="11" cy="11" r="8" stroke="#9E96A8" strokeWidth={1.8} />
            <Path d="M21 21l-4.35-4.35" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location or property name"
            placeholderTextColor="#AEAEB2"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterIconBtn} onPress={() => router.push('/search/filter')}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M4 6h16M7 12h10M10 18h4" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          {(activeAreas.length > 0 || activeAmenities.length > 0) && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionLabel}>Property Type</Text>
        <View style={styles.typeRow}>
          {PROPERTY_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, activeType === type && styles.typeChipActive]}
              onPress={() => setActiveType(type)}
            >
              <Text style={[styles.typeChipText, activeType === type && styles.typeChipTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Area</Text>
        <View style={styles.chipWrap}>
          {AREAS.map(area => (
            <TouchableOpacity
              key={area}
              style={[styles.chip, activeAreas.includes(area) && styles.chipActive]}
              onPress={() => toggleArea(area)}
            >
              <Text style={[styles.chipText, activeAreas.includes(area) && styles.chipTextActive]}>{area}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Guests</Text>
        <View style={styles.guestsRow}>
          <TouchableOpacity style={styles.guestBtn} onPress={() => setGuests(g => Math.max(1, g - 1))}>
            <Text style={styles.guestBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.guestCount}>{guests}</Text>
          <TouchableOpacity style={[styles.guestBtn, styles.guestBtnActive]} onPress={() => setGuests(g => g + 1)}>
            <Text style={[styles.guestBtnText, styles.guestBtnTextActive]}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {AMENITIES.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[styles.amenityItem, activeAmenities.includes(a.id) && styles.amenityItemActive]}
              onPress={() => toggleAmenity(a.id)}
            >
              <Text style={styles.amenityIcon}>{a.icon}</Text>
              <Text style={[styles.amenityLabel, activeAmenities.includes(a.id) && styles.amenityLabelActive]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {loading ? 'Searching...' : `${results.length} properties found`}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6B2D82" style={{ marginTop: 40 }} />
        ) : results.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySub}>Try adjusting your filters or search term.</Text>
          </View>
        ) : (
          results.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.resultCard}
              onPress={() => router.push({ pathname: '/search/property-detail', params: { propertyId: item.id, ...item } })}
              activeOpacity={0.9}
            >
              <View style={styles.resultImage}>
                {item.images?.[0] ? (
                  <Image source={{ uri: optimizedImageUrl(item.images[0], 600) }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                ) : (
                  <Text style={styles.resultEmoji}>🏨</Text>
                )}
                {item.verified && <VerifiedBadge />}
                <TouchableOpacity style={styles.heartBtn} onPress={() => handleToggleSave(item.id)}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                      stroke="#FFFFFF"
                      fill={savedIds.includes(item.id) ? '#C9A84C' : 'none'}
                      strokeWidth={1.8}
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
              <View style={styles.resultInfo}>
                <View style={styles.resultTop}>
                  <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.ratingRow}>
                    <Text>⭐</Text>
                    <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '—'}</Text>
                  </View>
                </View>
                <Text style={styles.resultLocation}>{item.area}</Text>
                <View style={styles.resultBottom}>
                  <Text style={styles.resultPrice}>
                    ₦{item.price_per_night?.toLocaleString()}
                    <Text style={styles.resultUnit}>{item.type === 'Event Center' ? '/event' : '/night'}</Text>
                  </Text>
                  <TouchableOpacity style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.floatingBtns}>
        <TouchableOpacity style={styles.whatsappBtn} onPress={() => Linking.openURL('https://wa.me/2348000000000')}>
          <Text style={styles.floatingIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:+2348000000000')}>
          <Text style={styles.floatingIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  searchHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0EBF8' },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1E1E1E', padding: 0 },
  filterIconBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  filterDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#D94F4F' },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 12, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 40, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#F5F5F5' },
  typeChipActive: { backgroundColor: '#6B2D82', borderColor: '#6B2D82' },
  typeChipText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#9E96A8', fontWeight: '600' },
  typeChipTextActive: { color: '#FFFFFF' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 40, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#F5F5F5' },
  chipActive: { backgroundColor: '#6B2D82', borderColor: '#6B2D82' },
  chipText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  chipTextActive: { color: '#FFFFFF', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  guestsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
  guestBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#E0D9ED', alignItems: 'center', justifyContent: 'center' },
  guestBtnActive: { backgroundColor: '#6B2D82', borderColor: '#6B2D82' },
  guestBtnText: { fontSize: 20, color: '#6B6478' },
  guestBtnTextActive: { color: '#FFFFFF' },
  guestCount: { fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  amenityItem: { width: '21%', aspectRatio: 1, backgroundColor: '#F5F5F5', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1.5, borderColor: 'transparent' },
  amenityItemActive: { backgroundColor: '#6B2D82', borderColor: '#6B2D82' },
  amenityIcon: { fontSize: 22 },
  amenityLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center' },
  amenityLabelActive: { color: '#FFFFFF' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultsCount: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#1E1E1E', fontWeight: '600' },
  resultCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  resultImage: { height: 200, backgroundColor: '#F0EBF8', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  resultEmoji: { fontSize: 72 },
  resultInfo: { padding: 14, gap: 6 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  resultName: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#1E1E1E', fontWeight: '600' },
  resultLocation: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  resultBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  resultPrice: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  resultUnit: { fontSize: 12, fontWeight: '400', color: '#9E96A8' },
  bookBtn: { backgroundColor: '#6B2D82', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  bookBtnText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
  verifiedBadge: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  verifiedIcon: { fontSize: 10 },
  verifiedText: { fontSize: 9, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#C9A84C', letterSpacing: 0.5 },
  heartBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  emptySub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  floatingIcon: { fontSize: 22 },
});