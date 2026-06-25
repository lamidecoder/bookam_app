import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { useAuth } from '../../hooks/useAuth';
import { getProperties, getFeaturedProperties, subscribeToProperties, getSavedPropertyIds, toggleSavedProperty } from '../../lib/api';
import { optimizedImageUrl } from '../../lib/cloudinary';

const PROPERTY_TYPES = ['All', 'Hotels', 'Shortlets', 'Event Centers'];

function VerifiedBadge() {
  return (
    <View style={styles.verifiedBadge}>
      <Text style={styles.verifiedIcon}>🏅</Text>
      <Text style={styles.verifiedText}>VERIFIED</Text>
    </View>
  );
}

function PropertyImage({ uri }: { uri?: string }) {
  const optimized = optimizedImageUrl(uri, 600);
  if (!optimized) {
    return <Text style={styles.propertyEmoji}>🏨</Text>;
  }
  return (
    <Image
      source={{ uri: optimized }}
      style={StyleSheet.absoluteFillObject}
      contentFit="cover"
      transition={200}
      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
    />
  );
}

function PropertyCard({ item, onPress, isSaved, onToggleSave }: {
  item: any; onPress: () => void; isSaved: boolean; onToggleSave: () => void;
}) {
  return (
    <TouchableOpacity style={styles.propertyCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.propertyImage}>
        <PropertyImage uri={item.images?.[0]} />
        {item.verified && <VerifiedBadge />}
        <TouchableOpacity style={styles.heartBtn} onPress={onToggleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              stroke="#FFFFFF"
              fill={isSaved ? '#C9A84C' : 'none'}
              strokeWidth={1.8}
            />
          </Svg>
        </TouchableOpacity>
      </View>
      <View style={styles.propertyInfo}>
        <View style={styles.propertyTop}>
          <Text style={styles.propertyName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.propertyLocation}>{item.area}</Text>
        <View style={styles.propertyBottom}>
          <Text style={styles.propertyPrice}>
            ₦{item.price_per_night?.toLocaleString()}
            <Text style={styles.propertyUnit}>
              {item.type === 'Event Center' ? '/event' : '/night'}
            </Text>
          </Text>
          <TouchableOpacity style={styles.bookBtn} onPress={onPress}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [activeType, setActiveType] = useState('All');
  const [featured, setFeatured] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(false);
  const requestId = React.useRef(0);

  // Load saved property IDs once on mount / when user changes — not on every filter switch
  useEffect(() => {
    if (!user) { setSavedIds([]); return; }
    getSavedPropertyIds(user.id).then(setSavedIds).catch(() => {});
  }, [user]);

  const loadData = useCallback(async () => {
    const thisRequestId = ++requestId.current;
    setError(false);
    try {
      const typeFilter = activeType === 'All' ? undefined : activeType.slice(0, -1);
      const [featuredData, allData] = await Promise.all([
        getFeaturedProperties(),
        getProperties(typeFilter ? { type: typeFilter } : undefined),
      ]);
      if (thisRequestId === requestId.current) {
        setFeatured(featuredData.slice(0, 2));
        setAllProperties(allData);
      }
    } catch (e) {
      console.error('Load error:', e);
      if (thisRequestId === requestId.current) {
        setError(true);
      }
    } finally {
      if (thisRequestId === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [activeType]);

  const handleToggleSave = async (propertyId: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      const nowSaved = await toggleSavedProperty(user.id, propertyId);
      setSavedIds(prev => nowSaved ? [...prev, propertyId] : prev.filter(id => id !== propertyId));
    } catch (e) {
      console.error('Failed to toggle save:', e);
    }
  };

  useEffect(() => {
    loadData();
    // Real-time subscription — updates instantly when admin changes data
    const sub = subscribeToProperties((updated) => {
      setAllProperties(updated);
    });
    return () => { sub.unsubscribe(); };
  }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const navigateToProperty = (property: any) => {
    router.push({
      pathname: '/search/property-detail',
      params: { propertyId: property.id, ...property },
    });
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.split(' ');
      return parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'JD';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B2D82" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <BookamLogo width={110} height={34} />
          <TouchableOpacity style={styles.avatar} onPress={() => router.push('/tabs/profile')}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#6B2D82" />
          </Svg>
          <Text style={styles.locationText}>Lagos, Nigeria</Text>
        </View>

        {/* Search */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/tabs/explore')} activeOpacity={0.8}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx="11" cy="11" r="8" stroke="#9E96A8" strokeWidth={1.8} />
            <Path d="M21 21l-4.35-4.35" stroke="#9E96A8" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
          <Text style={styles.searchPlaceholder}>Search by location or property name</Text>
        </TouchableOpacity>

        {/* Type tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeTabs}>
          {PROPERTY_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeTab, activeType === type && styles.typeTabActive]}
              onPress={() => setActiveType(type)}
            >
              <Text style={[styles.typeTabText, activeType === type && styles.typeTabTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#6B2D82" />
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyText}>Something went wrong loading properties</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Featured</Text>
                  <TouchableOpacity onPress={() => setActiveType('All')}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                  {featured.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.featuredCard}
                      onPress={() => navigateToProperty(item)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.featuredImage}>
                        <PropertyImage uri={item.images?.[0]} />
                        {item.verified && <VerifiedBadge />}
                        <TouchableOpacity
                          style={styles.heartBtn}
                          onPress={() => handleToggleSave(item.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                              stroke="#FFFFFF"
                              fill={savedIds.includes(item.id) ? '#C9A84C' : 'none'}
                              strokeWidth={1.5}
                            />
                          </Svg>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.featuredInfo}>
                        <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.featuredLocation}>{item.area}</Text>
                        <Text style={styles.featuredPrice}>
                          ₦{item.price_per_night?.toLocaleString()}
                          <Text style={styles.featuredUnit}>{item.type === 'Event Center' ? '/event' : '/night'}</Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* All Properties */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Properties</Text>
              <TouchableOpacity onPress={() => router.push('/tabs/explore')}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M4 6h16M4 12h10M4 18h7" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={styles.allProperties}>
              {allProperties.map(item => (
                <PropertyCard
                  key={item.id}
                  item={item}
                  onPress={() => navigateToProperty(item)}
                  isSaved={savedIds.includes(item.id)}
                  onToggleSave={() => handleToggleSave(item.id)}
                />
              ))}
              {allProperties.length === 0 && (
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>🏠</Text>
                  <Text style={styles.emptyText}>No properties found</Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Poppins-Bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 20, marginBottom: 12 },
  locationText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5F5F5', borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  searchPlaceholder: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#AEAEB2' },
  typeTabs: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  typeTab: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 40, backgroundColor: '#F5F5F5' },
  typeTabActive: { backgroundColor: '#6B2D82' },
  typeTabText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#9E96A8', fontWeight: '600' },
  typeTabTextActive: { color: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  seeAll: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  featuredScroll: { paddingHorizontal: 20, gap: 14, marginBottom: 24 },
  featuredCard: { width: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  featuredImage: { height: 130, backgroundColor: '#F0EBF8', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  featuredEmoji: { fontSize: 48 },
  featuredInfo: { padding: 12, gap: 3 },
  featuredName: { fontSize: 13, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  featuredLocation: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  featuredPrice: { fontSize: 13, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82', marginTop: 2 },
  featuredUnit: { fontSize: 11, fontWeight: '400', color: '#9E96A8' },
  allProperties: { paddingHorizontal: 20, gap: 16 },
  propertyCard: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  propertyImage: { height: 200, backgroundColor: '#F0EBF8', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  propertyEmoji: { fontSize: 72 },
  propertyInfo: { padding: 14, gap: 6 },
  propertyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  propertyName: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingStar: { fontSize: 13 },
  ratingText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#1E1E1E', fontWeight: '600' },
  propertyLocation: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  propertyBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  propertyPrice: { fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  propertyUnit: { fontSize: 12, fontWeight: '400', color: '#9E96A8' },
  bookBtn: { backgroundColor: '#6B2D82', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  bookBtnText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
  verifiedBadge: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  verifiedIcon: { fontSize: 10 },
  verifiedText: { fontSize: 9, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#C9A84C', letterSpacing: 0.5 },
  heartBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  loader: { paddingVertical: 60, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  retryBtn: { marginTop: 12, backgroundColor: '#6B2D82', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
});