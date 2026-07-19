import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Image, ViewToken, Animated,
  Platform, StatusBar as RNStatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;
const vscale = (size: number) => (height / 844) * size;

const SLIDES = [
  {
    id: '1',
    title: 'Find your perfect stay in Lagos.',
    subtitle: 'Browse verified hotels, shortlets and event centers all in one place.',
    image: require('../assets/images/slide1.png'),
    type: 'rounded',
  },
  {
    id: '2',
    title: 'Book instantly, no back and forth.',
    subtitle: 'Pick your dates, pay securely through Paystack and get confirmed immediately.',
    image: require('../assets/images/slide2.png'),
    type: 'full',
  },
  {
    id: '3',
    title: 'Hotels, shortlets and event centers in one place.',
    subtitle: 'Every listing is verified by the Bookam team before it goes live.',
    image: require('../assets/images/slide3.png'),
    type: 'contain',
  },
];

export default function OnboardingScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const slidesOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const TOP = insets.top || (Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 44);
  const BOTTOM = insets.bottom || 0;
  const IMAGE_HEIGHT = height < 700 ? height * 0.38 : height * 0.44;

  useEffect(() => {
    // Logo's own entrance - subtle scale-up-and-fade, not a bounce or
    // anything showy, matching "clean, not too much". Starts right away
    // rather than waiting for the splash-to-slides timer below.
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(slidesOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start(() => setShowSplash(false));
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  });

  const handleContinue = async () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem('bookam_onboarded', 'true');
      router.replace('/auth/login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('bookam_onboarded', 'true');
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {showSplash && (
        <Animated.View style={[styles.splash, { opacity: splashOpacity }]}>
          <Animated.Image
            source={require('../assets/images/logo.png')}
            style={[styles.splashLogo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
            resizeMode="contain"
          />
        </Animated.View>
      )}
      <Animated.View style={[styles.slidesWrapper, { opacity: slidesOpacity }]}>
        <View style={[styles.skipRow, { paddingTop: TOP + 8 }]}>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={flatRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          bounces={false} scrollEnabled={!showSplash}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { paddingTop: TOP + 52 }]}>
              {item.type === 'rounded' && (
                <View style={[styles.roundedImageWrap, { height: IMAGE_HEIGHT }]}>
                  <Image source={item.image} style={styles.roundedImage} resizeMode="cover" />
                </View>
              )}
              {item.type === 'full' && (
                <Image source={item.image} style={[styles.fullImage, { height: IMAGE_HEIGHT }]} resizeMode="cover" />
              )}
              {item.type === 'contain' && (
                <View style={[styles.containWrap, { height: IMAGE_HEIGHT * 0.7 }]}>
                  <Image source={item.image} style={styles.containImage} resizeMode="contain" />
                </View>
              )}
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />
        <View style={[styles.footer, { paddingBottom: BOTTOM + 24 }]}>
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleContinue} activeOpacity={0.88}>
            <LinearGradient colors={['#6b2d82', '#521169', '#3a0d4a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
              <Text style={styles.ctaText}>{activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A' },
  splash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F0A1A', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  splashLogo: { width: scale(180), height: scale(180) },
  slidesWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
  skipRow: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 8 },
  skipText: { fontSize: scale(15), fontWeight: '600', color: '#6B2D82' },
  slide: { width, flex: 1 },
  roundedImageWrap: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden' },
  roundedImage: { width: '100%', height: '100%' },
  fullImage: { width: '100%' },
  containWrap: { width: '100%', paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  containImage: { width: '100%', height: '100%' },
  textBlock: { paddingHorizontal: 20, paddingTop: vscale(24), gap: vscale(10), flex: 1 },
  title: { fontSize: scale(26), fontWeight: '800', color: '#0F0A1A', lineHeight: scale(34), textAlign: 'center' },
  subtitle: { fontSize: scale(15), color: '#6B6478', lineHeight: scale(22), textAlign: 'center' },
  footer: { paddingHorizontal: 20, gap: 16 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 24, backgroundColor: '#6B2D82' },
  dotInactive: { width: 6, backgroundColor: '#E0D9ED' },
  ctaBtn: { borderRadius: 14, overflow: 'hidden' },
  ctaGradient: { paddingVertical: vscale(18), alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: scale(16), fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
});