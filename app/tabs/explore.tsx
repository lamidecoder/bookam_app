import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Linking, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/ToastContext';
import { searchProperties, subscribeToProperties, getSavedPropertyIds, toggleSavedProperty } from '../../lib/api';
import { consumePendingFilters } from '../../lib/searchFilters';
import { optimizedImageUrl } from '../../lib/cloudinary';

const PROPERTY_TYPES = ['All', 'Hotels', 'Shortlets', 'Event Centers'];
const AREAS = ['Lekki Phase 1', 'Ikoyi', 'Ikeja', 'Ajah', 'Victoria Island', 'Magodo', 'Surulere', 'Banana Island'];
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

// Monochrome line icons for the amenity grid - replaces the coloured
// emoji so the whole search tab reads as one clean black-and-white set.
// Colour is passed in (white when the chip is active, muted grey when not).
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

// Small solid star for the rating pill - black, not the multicolour emoji.
function StarIcon({ size = 13, color = '#1E1E1E' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8L12 3z" fill={color} />
    </Svg>
  );
}

function VerifiedBadge() {
  return (
    <View style={styles.verifiedBadge}>
      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth={2} />
        <Path d="M8 12l2.5 2.5L16 9" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
      <Text style={styles.verifiedText}>VERIFIED</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [activeAreas, setActiveAreas] = useState<string[]>([]);
  const [activeAmenities, setActiveAmenities] = useState<string[]>([]);
  const [guests, setGuests] = useState(1);
  // Advanced filters set from the Refine Search screen. priceMax 0 means
  // "no cap"; minRating 0 means "any".
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = React.useRef(0);

  // When the user applies filters on the Refine Search screen and comes
  // back, pick them up and apply them to the live query. Consumed once so
  // they don't silently re-apply on every future focus.
  useFocusEffect(
    useCallback(() => {
      const f = consumePendingFilters();
      if (!f) return;
      setActiveType(f.type ? `${f.type}s` : 'All');
      setActiveAreas(f.areas);
      setActiveAmenities(f.amenities);
      setPriceMin(f.minPrice);
      setPriceMax(f.maxPrice);
      setMinRating(f.minRating);
      setVerifiedOnly(f.verifiedOnly);
    }, [])
  );

  const toggleArea = (area: string) =>
    setActiveAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);

  const toggleAmenity = (id: string) =>
    setActiveAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  // Load saved property IDs once on mount / when user changes — not on every keystroke
  useEffect(() => {
    if (!user) { setSavedIds([]); return; }
    getSavedPropertyIds(user.id).then(setSavedIds).catch(() => {});
  }, [user]);

  const runSearch = useCallback(async () => {
    const thisRequestId = ++requestId.current;
    setLoading(true);
    setError(false);
    try {
      const data = await searchProperties({
        query: search.trim(),
        type: activeType === 'All' ? undefined : activeType.slice(0, -1),
        areas: activeAreas.length ? activeAreas : undefined,
        amenities: activeAmenities.length ? activeAmenities : undefined,
        guests,
        minPrice: priceMin > 0 ? priceMin : undefined,
        maxPrice: priceMax > 0 ? priceMax : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        verifiedOnly: verifiedOnly || undefined,
      });
      // Ignore stale responses — only apply if this is still the latest request
      if (thisRequestId === requestId.current) {
        setResults(data);
      }
    } catch (e) {
      console.error(e);
      if (thisRequestId === requestId.current) {
        setError(true);
        setResults([]);
      }
    } finally {
      if (thisRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, [search, activeType, activeAreas, activeAmenities, guests, priceMin, priceMax, minRating, verifiedOnly]);

  useEffect(() => {
    const debounce = setTimeout(runSearch, 300);
    return () => clearTimeout(debounce);
  }, [runSearch]);

  // Always-current reference to runSearch so the realtime subscription can
  // call the latest version without being torn down and recreated.
  const runSearchRef = React.useRef(runSearch);
  runSearchRef.current = runSearch;

  // Real-time — if a property is added, edited, or deactivated while this
  // screen is open, re-run the current search. Subscribe ONCE on mount:
  // previously this effect depended on runSearch, so every keystroke tore
  // down and re-opened the realtime channel, which added real lag while
  // typing. Now the channel is stable and just calls the latest search.
  useEffect(() => {
    const sub = subscribeToProperties(() => { runSearchRef.current(); });
    return () => { sub.unsubscribe(); };
  }, []);

  const handleToggleSave = async (propertyId: string) => {
    if (!user) {
      toast.info('Sign in required', 'Please sign in to save this property.');
      router.push('/auth/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const nowSaved = await toggleSavedProperty(user.id, propertyId);
      setSavedIds(prev => nowSaved ? [...prev, propertyId] : prev.filter(id => id !== propertyId));
    } catch (e) {
      console.error('Failed to toggle save:', e);
      toast.error('Failed', 'Could not save this property. Please try again.');
    }
  };

  const handleOpenProperty = (item: any) => {
    router.push({ pathname: '/search/property-detail', params: { propertyId: item.id, ...item } });
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
          {(activeAreas.length > 0 || activeAmenities.length > 0 || priceMin > 0 || priceMax > 0 || minRating > 0 || verifiedOnly) && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

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
              <AmenityIcon id={a.id} color={activeAmenities.includes(a.id) ? '#FFFFFF' : '#6B6478'} />
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
        ) : error ? (
          <View style={styles.empty}>
            <Svg width={44} height={44} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 4 }}>
              <Path d="M12 3L2 20h20L12 3z" stroke="#9E96A8" strokeWidth={1.6} strokeLinejoin="round" />
              <Path d="M12 10v4M12 17.5v.01" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySub}>Could not load properties. Pull to retry.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={runSearch}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.empty}>
            <Svg width={44} height={44} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 4 }}>
              <Circle cx="11" cy="11" r="7" stroke="#9E96A8" strokeWidth={1.6} />
              <Path d="M21 21l-4.35-4.35" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySub}>Try adjusting your filters or search term.</Text>
          </View>
        ) : (
          results.map((item, idx) => {
            const isFirstNearby = item._nearbyMatch && !results[idx - 1]?._nearbyMatch;
            return (
            <React.Fragment key={item.id}>
              {isFirstNearby && (
                <View style={styles.nearbyHeader}>
                  <Text style={styles.nearbyHeaderText}>Also nearby</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => handleOpenProperty(item)}
                activeOpacity={0.9}
              >
              <View style={styles.resultImage}>
                {item.images?.[0] ? (
                  <Image source={{ uri: optimizedImageUrl(item.images[0], 600) }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                ) : (
                  <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
                    <Path d="M3 21h18M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16M15 21V9h4a1 1 0 011 1v11" stroke="#C4B8DC" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M8 8h1M11 8h1M8 12h1M11 12h1M8 16h1M11 16h1" stroke="#C4B8DC" strokeWidth={1.5} strokeLinecap="round" />
                  </Svg>
                )}
                {item.verified && <VerifiedBadge />}
                <TouchableOpacity style={styles.heartBtn} onPress={() => handleToggleSave(item.id)}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                      stroke="#FFFFFF"
                      fill={savedIds.includes(item.id) ? '#FFFFFF' : 'none'}
                      strokeWidth={1.8}
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
              <View style={styles.resultInfo}>
                <View style={styles.resultTop}>
                  <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.ratingRow}>
                    <StarIcon size={13} color="#C9A84C" />
                    <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'New'}</Text>
                  </View>
                </View>
                <Text style={styles.resultLocation}>{item.area}</Text>
                <View style={styles.resultBottom}>
                  <Text style={styles.resultPrice}>
                    ₦{item.price_per_night?.toLocaleString()}
                    <Text style={styles.resultUnit}>{item.type === 'Event Center' ? '/event' : '/night'}</Text>
                  </Text>
                  <TouchableOpacity style={styles.bookBtn} onPress={() => handleOpenProperty(item)}>
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
              </TouchableOpacity>
            </React.Fragment>
            );
          })
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

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
  nearbyHeader: { marginTop: 8, marginBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0EBF8' },
  nearbyHeaderText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#9E96A8' },
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
  verifiedText: { fontSize: 9, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF', letterSpacing: 0.5 },
  heartBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  emptySub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center' },
  retryBtn: { marginTop: 12, backgroundColor: '#6B2D82', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  floatingIcon: { fontSize: 22 },
});