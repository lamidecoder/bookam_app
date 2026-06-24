#!/usr/bin/env node
/**
 * BOOKAM SETUP SCRIPT
 * Run: node setup.js
 * This writes all files to the correct locations automatically.
 */

const fs = require('fs');
const path = require('path');

const files = {};

// ============================================================
// constants/theme.ts
// ============================================================
files['constants/theme.ts'] = `
export const Colors = {
  primary: '#6B2D82',
  primaryDark: '#521169',
  primaryLight: '#8B4DAA',
  secondary: '#C9A84C',
  secondaryDark: '#A8893A',
  secondaryLight: '#D9BE7A',
  tertiary: '#B7AD5D',
  neutral: '#1E1E1E',
  surface: '#fcf9f8',
  surfaceGrey: '#F5F5F5',
  white: '#FFFFFF',
  bgLight: '#F0EBF5',
  bgAuth: '#EEE9F5',
  borderGrey: '#D9D9D9',
  borderPrimary: '#6B2D82',
  textPrimary: '#1E1E1E',
  textSecondary: '#6B6478',
  textMuted: '#9E96A8',
  textWhite: '#FFFFFF',
  textDisabled: '#B0AABC',
  success: '#2E9E6B',
  error: '#D94F4F',
  warning: '#E8922A',
  info: '#3A7BD5',
  whatsapp: '#25D366',
  confirmed: '#2E9E6B',
  completed: '#3A7BD5',
  cancelled: '#D94F4F',
  pending: '#E8922A',
  shadow: 'rgba(107,45,130,0.12)',
  overlay: 'rgba(0,0,0,0.5)',
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const Radii = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export const Shadows = {
  sm: { shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  md: { shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6 },
  lg: { shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 10 },
};
`.trim();

// ============================================================
// app.json
// ============================================================
files['app.json'] = JSON.stringify({
  expo: {
    name: "Bookam",
    slug: "bookam",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "bookam",
    userInterfaceStyle: "light",
    ios: { supportsTablet: false, bundleIdentifier: "com.bookam.app" },
    android: { package: "com.bookam.app" },
    web: { bundler: "metro", output: "static" },
    plugins: ["expo-router"],
    experiments: { typedRoutes: true }
  }
}, null, 2);

// ============================================================
// package.json
// ============================================================
files['package.json'] = JSON.stringify({
  name: "bookam",
  main: "expo-router/entry",
  version: "1.0.0",
  scripts: {
    start: "expo start",
    android: "expo start --android",
    ios: "expo start --ios",
    web: "expo start --web"
  },
  dependencies: {
    "expo": "~54.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.2.0",
    "expo-font": "~13.3.0",
    "expo-splash-screen": "~0.30.0",
    "expo-linear-gradient": "~14.1.0",
    "expo-blur": "~14.1.0",
    "expo-haptics": "~14.1.0",
    "expo-secure-store": "~14.2.0",
    "expo-asset": "~11.1.0",
    "expo-linking": "~7.0.0",
    "react": "19.0.0",
    "react-native": "0.78.2",
    "react-native-reanimated": "~3.17.0",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.10.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@expo-google-fonts/poppins": "^0.2.3",
    "zustand": "^5.0.0",
    "react-native-svg": "15.11.2"
  },
  devDependencies: {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.0.0",
    "typescript": "^5.3.3"
  }
}, null, 2);

// ============================================================
// babel.config.js
// ============================================================
files['babel.config.js'] = `
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
`.trim();

// ============================================================
// tsconfig.json
// ============================================================
files['tsconfig.json'] = JSON.stringify({
  extends: "expo/tsconfig.base",
  compilerOptions: { strict: true, baseUrl: ".", paths: { "@/*": ["./*"] } }
}, null, 2);

// ============================================================
// app/_layout.tsx
// ============================================================
files['app/_layout.tsx'] = `
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      checkOnboarding();
    }
  }, [fontsLoaded]);

  const checkOnboarding = async () => {
    try {
      // TESTING MODE: always start from beginning — remove for production
      await AsyncStorage.multiRemove(['bookam_onboarded', 'bookam_token']);
      router.replace('/onboarding');
    } catch {
      router.replace('/onboarding');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
      </Stack>
    </GestureHandlerRootView>
  );
}
`.trim();

// ============================================================
// app/index.tsx
// ============================================================
files['app/index.tsx'] = `
import { Redirect } from 'expo-router';
export default function Index() {
  return <Redirect href="/onboarding" />;
}
`.trim();

// ============================================================
// app/onboarding.tsx
// ============================================================
files['app/onboarding.tsx'] = `
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
const scale = (size) => (width / 390) * size;
const vscale = (size) => (height / 844) * size;

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
  const flatRef = useRef(null);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const slidesOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const TOP = insets.top || (Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 44);
  const BOTTOM = insets.bottom || 0;
  const IMAGE_HEIGHT = height < 700 ? height * 0.38 : height * 0.44;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(slidesOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start(() => setShowSplash(false));
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
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
          <Image source={require('../assets/images/logo.png')} style={styles.splashLogo} resizeMode="contain" />
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
`.trim();

// ============================================================
// components/ui/BookamLogo.tsx
// ============================================================
files['components/ui/BookamLogo.tsx'] = `
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export function BookamLogo({ size = 28 }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.book, { fontSize: size }]}>B</Text>
      <Text style={[styles.oo, { fontSize: size }]}>oo</Text>
      <Text style={[styles.k, { fontSize: size }]}>k</Text>
      <Text style={[styles.am, { fontSize: size }]}>am</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline' },
  book: { fontFamily: 'Poppins-Bold', color: '#6B2D82', fontWeight: '700' },
  oo: { fontFamily: 'Poppins-Bold', color: '#C9A84C', fontWeight: '700' },
  k: { fontFamily: 'Poppins-Bold', color: '#6B2D82', fontWeight: '700' },
  am: { fontFamily: 'Poppins-Bold', color: '#6B2D82', fontWeight: '700' },
});
`.trim();

// ============================================================
// components/ui/AuthInput.tsx
// ============================================================
files['components/ui/AuthInput.tsx'] = `
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export function AuthInput({ icon, isPassword, prefix, style, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      {prefix && (
        <>
          <Text style={styles.prefix}>{prefix}</Text>
          <View style={styles.divider} />
        </>
      )}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#A0A0A0"
        secureTextEntry={isPassword && !show}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShow(!show)} style={styles.eye}>
          <Text style={styles.eyeIcon}>{show ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 16, gap: 10,
  },
  icon: { fontSize: 18 },
  prefix: { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1E1E1E', fontWeight: '500' },
  divider: { width: 1, height: 20, backgroundColor: '#D9D9D9' },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1E1E1E', padding: 0 },
  eye: { padding: 4 },
  eyeIcon: { fontSize: 16 },
});
`.trim();

// ============================================================
// components/ui/PrimaryButton.tsx
// ============================================================
files['components/ui/PrimaryButton.tsx'] = `
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export function PrimaryButton({ label, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.btn, (disabled || loading) && styles.disabled, style]}
      onPress={onPress} activeOpacity={0.85} disabled={disabled || loading}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={styles.label}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#6B2D82', borderRadius: 12, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.6 },
  label: { fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#FFFFFF' },
});
`.trim();

// ============================================================
// app/auth/_layout.tsx
// ============================================================
files['app/auth/_layout.tsx'] = `
import { Stack } from 'expo-router';
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="otp-confirm" />
      <Stack.Screen name="new-password" />
    </Stack>
  );
}
`.trim();

// ============================================================
// app/auth/login.tsx
// ============================================================
files['app/auth/login.tsx'] = `
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { AuthInput } from '../../components/ui/AuthInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      await AsyncStorage.setItem('bookam_token', 'demo_token');
      router.replace('/tabs/home');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoRow}><BookamLogo size={28} /></View>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.sub}>Log in to your Bookam account</Text>
          <View style={styles.form}>
            <AuthInput icon="🇳🇬" prefix="+234 ▾" placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <AuthInput icon="🔒" placeholder="Password" value={password} onChangeText={setPassword} isPassword />
          </View>
          <TouchableOpacity style={styles.forgotRow} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
          <PrimaryButton label="Log In" onPress={handleLogin} loading={loading} />
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE9F5' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
  logoRow: { alignItems: 'center', paddingTop: 40, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', marginBottom: 32 },
  form: { gap: 12, marginBottom: 12 },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 28 },
  forgotText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#D9D9D9' },
  dividerText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 20 },
  footerText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  footerLink: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
});
`.trim();

// ============================================================
// app/auth/register.tsx
// ============================================================
files['app/auth/register.tsx'] = `
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { AuthInput } from '../../components/ui/AuthInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      router.push('/auth/otp-verify');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoRow}><BookamLogo size={28} /></View>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.sub}>Join Bookam and start booking in minutes</Text>
          <View style={styles.form}>
            <AuthInput icon="👤" placeholder="Enter your full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
            <AuthInput icon="🇳🇬" prefix="+234" placeholder="080XXXXXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <AuthInput icon="✉️" placeholder="Enter your email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <View>
              <AuthInput icon="🔒" placeholder="Create a password" value={password} onChangeText={setPassword} isPassword />
              <Text style={styles.hint}>Minimum 8 characters</Text>
            </View>
          </View>
          <PrimaryButton label="Create Account" onPress={handleRegister} loading={loading} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE9F5' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
  logoRow: { alignItems: 'center', paddingTop: 24, paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', marginBottom: 32 },
  form: { gap: 12, marginBottom: 32 },
  hint: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginTop: 4, marginLeft: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  footerLink: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
});
`.trim();

// ============================================================
// app/auth/otp-verify.tsx
// ============================================================
files['app/auth/otp-verify.tsx'] = `
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

export default function OtpVerifyScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      router.replace('/tabs/home');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
            <BookamLogo size={24} />
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.content}>
            <Text style={styles.heading}>Verify your number</Text>
            <Text style={styles.sub}>
              We sent a 6-digit code to{' '}
              <Text style={styles.highlight}>+234 080XXXXXXXX</Text>
              {'. Enter it below.'}
            </Text>
            <View style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx} ref={el => { inputs.current[idx] = el; }}
                  style={[styles.otpBox, digit ? styles.otpFilled : null]}
                  value={digit} onChangeText={val => handleChange(val.slice(-1), idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                  keyboardType="number-pad" maxLength={1} textAlign="center" selectTextOnFocus
                />
              ))}
            </View>
          </View>
          <View style={styles.bottom}>
            <PrimaryButton label="Verify" onPress={handleVerify} loading={loading} />
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't get the code?  </Text>
              {timer > 0
                ? <Text style={styles.resendMuted}>Resend code  ⏱ Resend in 0:{timer.toString().padStart(2, '0')}</Text>
                : <TouchableOpacity onPress={() => setTimer(60)}><Text style={styles.resendLink}>Resend code</Text></TouchableOpacity>
              }
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE9F5' },
  inner: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 32 },
  back: { padding: 4 },
  backIcon: { fontSize: 22, color: '#1E1E1E' },
  content: { flex: 1 },
  heading: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 10, textAlign: 'center' },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  highlight: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpBox: { width: 48, height: 56, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#D9D9D9', fontSize: 20, fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  otpFilled: { borderColor: '#6B2D82' },
  bottom: { paddingBottom: 32, gap: 20 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  resendText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  resendMuted: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  resendLink: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
});
`.trim();

// ============================================================
// app/auth/forgot-password.tsx
// ============================================================
files['app/auth/forgot-password.tsx'] = `
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { AuthInput } from '../../components/ui/AuthInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      router.push('/auth/otp-confirm');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
            <BookamLogo size={24} />
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.content}>
            <Text style={styles.heading}>Reset your password</Text>
            <Text style={styles.sub}>Enter the phone number linked to your account and we'll send you a code.</Text>
            <Text style={styles.label}>Phone Number</Text>
            <AuthInput icon="🇳🇬" prefix="+234" placeholder="800 000 0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <View style={styles.bottom}>
            <PrimaryButton label="Send Code" onPress={handleSend} loading={loading} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE9F5' },
  inner: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 32 },
  back: { padding: 4 },
  backIcon: { fontSize: 22, color: '#1E1E1E' },
  content: { flex: 1 },
  heading: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 10 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22, marginBottom: 32 },
  label: { fontSize: 14, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#1E1E1E', marginBottom: 10 },
  bottom: { paddingBottom: 32 },
});
`.trim();

// ============================================================
// app/auth/otp-confirm.tsx
// ============================================================
files['app/auth/otp-confirm.tsx'] = `
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

export default function OtpConfirmScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      router.push('/auth/new-password');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
            <BookamLogo size={24} />
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.content}>
            <Text style={styles.heading}>Enter the code</Text>
            <Text style={styles.sub}>A 6-digit code was sent to your number.</Text>
            <View style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx} ref={el => { inputs.current[idx] = el; }}
                  style={[styles.otpBox, digit ? styles.otpFilled : null]}
                  value={digit} onChangeText={val => handleChange(val.slice(-1), idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                  keyboardType="number-pad" maxLength={1} textAlign="center" selectTextOnFocus
                />
              ))}
            </View>
          </View>
          <View style={styles.bottom}>
            <PrimaryButton label="Confirm Code" onPress={handleConfirm} loading={loading} />
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive it? </Text>
              <TouchableOpacity><Text style={styles.resendLink}>Resend Code</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0FA' },
  inner: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 40 },
  back: { padding: 4 },
  backIcon: { fontSize: 22, color: '#1E1E1E' },
  content: { flex: 1 },
  heading: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 10, textAlign: 'center' },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', marginBottom: 40 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpBox: { width: 48, height: 56, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#6B2D82', fontSize: 20, fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
  otpFilled: { backgroundColor: '#F0E6FA' },
  bottom: { paddingBottom: 32, gap: 20 },
  resendRow: { flexDirection: 'row', justifyContent: 'center' },
  resendText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478' },
  resendLink: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B2D82', fontWeight: '600' },
});
`.trim();

// ============================================================
// app/auth/new-password.tsx
// ============================================================
files['app/auth/new-password.tsx'] = `
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BookamLogo } from '../../components/ui/BookamLogo';
import { AuthInput } from '../../components/ui/AuthInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      router.replace('/auth/login');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
            <BookamLogo size={24} />
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.content}>
            <Text style={styles.heading}>Create new password</Text>
            <Text style={styles.sub}>Your new password must be different from your previous one.</Text>
            <Text style={styles.label}>New Password</Text>
            <AuthInput icon="🔒" placeholder="Enter new password" value={password} onChangeText={setPassword} isPassword />
            <Text style={styles.hint}>Minimum 8 characters</Text>
            <Text style={[styles.label, { marginTop: 20 }]}>Confirm New Password</Text>
            <AuthInput icon="🔒" placeholder="Re-enter new password" value={confirm} onChangeText={setConfirm} isPassword />
          </View>
          <View style={styles.bottom}>
            <PrimaryButton label="Reset Password" onPress={handleReset} loading={loading} />
            <View style={styles.protectedRow}>
              <Text style={styles.protectedIcon}>✅</Text>
              <Text style={styles.protectedText}>Your account is protected</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0FA' },
  inner: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 32 },
  back: { padding: 4 },
  backIcon: { fontSize: 22, color: '#1E1E1E' },
  content: { flex: 1 },
  heading: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#1E1E1E', marginBottom: 10 },
  sub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 22, marginBottom: 32 },
  label: { fontSize: 14, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#1E1E1E', marginBottom: 8 },
  hint: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9E96A8', marginTop: 6, marginLeft: 2 },
  bottom: { paddingBottom: 32, gap: 16 },
  protectedRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  protectedIcon: { fontSize: 16 },
  protectedText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#2E9E6B' },
});
`.trim();

// ============================================================
// WRITE ALL FILES
// ============================================================
let written = 0;
let errors = 0;

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('✅ ' + filePath);
    written++;
  } catch (err) {
    console.error('❌ ' + filePath + ' — ' + err.message);
    errors++;
  }
}

console.log('\\n==============================');
console.log('✅ Written: ' + written + ' files');
if (errors > 0) console.log('❌ Errors:  ' + errors + ' files');
console.log('==============================');
console.log('\\nNext steps:');
console.log('  cmd /c "rmdir /s /q node_modules"');
console.log('  npm install --legacy-peer-deps');
console.log('  npx expo start');
