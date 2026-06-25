import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { getSavedProperties, toggleSavedProperty } from '../../lib/api';
import { optimizedImageUrl } from '../../lib/cloudinary';
import { FloatingSupportButtons } from '../../components/ui/FloatingSupportButtons';

export default function SavedPropertiesScreen() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await getSavedProperties(user.id);
      setProperties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const handleUnsave = async (propertyId: string) => {
    if (!user) return;
    await toggleSavedProperty(user.id, propertyId);
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#6B2D82" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Properties</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6B2D82" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSaved(); }} tintColor="#6B2D82" />}
        >
          {properties.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🤍</Text>
              <Text style={styles.emptyTitle}>No saved properties yet</Text>
              <Text style={styles.emptySub}>Properties you save will appear here.</Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/tabs/home')}>
                <Text style={styles.exploreBtnText}>Browse Properties</Text>
              </TouchableOpacity>
            </View>
          ) : (
            properties.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/search/property-detail', params: { propertyId: item.id, ...item } })}
                activeOpacity={0.9}
              >
                <View style={styles.cardImage}>
                  {item.images?.[0] ? (
                    <Image source={{ uri: optimizedImageUrl(item.images[0], 600) }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                  ) : (
                    <Text style={styles.cardEmoji}>🏨</Text>
                  )}
                  {item.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedIcon}>✅</Text>
                      <Text style={styles.verifiedText}>VERIFIED</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.heartBtn} onPress={() => handleUnsave(item.id)}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                        stroke="#C9A84C"
                        fill="#C9A84C"
                        strokeWidth={1.8}
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingStar}>⭐</Text>
                      <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={styles.locationRow}>
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9E96A8" strokeWidth={1.8} />
                    </Svg>
                    <Text style={styles.locationText}>{item.area}</Text>
                  </View>
                  <Text style={styles.cardPrice}>
                    ₦{item.price_per_night?.toLocaleString()}
                    <Text style={styles.cardUnit}>{item.type === 'Event Center' ? '/event' : '/night'}</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <FloatingSupportButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82' },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  cardImage: { height: 220, backgroundColor: '#E8E0F0', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardEmoji: { fontSize: 72 },
  verifiedBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  verifiedIcon: { fontSize: 11 },
  verifiedText: { fontSize: 10, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#FFFFFF', letterSpacing: 0.5 },
  heartBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 16, gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingStar: { fontSize: 13 },
  ratingText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#1E1E1E', fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  cardPrice: { fontSize: 20, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#6B2D82', marginTop: 4 },
  cardUnit: { fontSize: 13, fontWeight: '400', color: '#9E96A8' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  emptySub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#9E96A8', textAlign: 'center' },
  exploreBtn: { marginTop: 16, backgroundColor: '#6B2D82', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  exploreBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', fontWeight: '600' },
  floatingBtns: { position: 'absolute', bottom: 100, right: 20, gap: 12 },
  whatsappBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  callBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6B2D82', alignItems: 'center', justifyContent: 'center', shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  floatingIcon: { fontSize: 22 },
});