import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ToastProvider } from '../components/ui/ToastContext';
import { TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  const initialRouteDone = useRef(false);

  // Runtime enforcement of the navigation bar's icon/background style.
  // The static app.json androidNavigationBar config alone was not being
  // honored when the device's SYSTEM is in dark mode — Android can
  // still override manifest-level nav bar theming for parts of the UI
  // based on system dark-mode settings. This app has no dark-mode UI of
  // its own (single light theme throughout), so the nav bar needs to be
  // explicitly pinned at runtime rather than left to follow the system,
  // or the back/home/recent-apps icons can become invisible (dark icons
  // rendered against a system-dark-themed bar).
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // 'light' = light bar background with DARK icons - correct for this
    // app, which has no dark-mode UI of its own and stays light-themed
    // regardless of the device's system theme. Never use 'auto' here:
    // that follows the system theme independently of the app's own
    // forced-light content, which is what caused the icons to become
    // inconsistent/invisible specifically when the device was in dark
    // mode.
    NavigationBar.setStyle('light');
  }, []);

  const goToLogin = async () => {
    await AsyncStorage.setItem('bookam_onboarded', 'true');
    router.replace('/auth/login');
  };

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!initialRouteDone.current) return;
      // NOTE: SIGNED_IN navigation is intentionally NOT handled here.
      // Each auth screen (login, register, otp-verify, Google sign-in)
      // already navigates correctly after success — either back to the
      // screen the user was browsing before being gated (e.g. property
      // detail, with their selected dates intact), or to /tabs/home for
      // first-time users coming from onboarding. A global forced redirect
      // here would override that and always dump people on Home, losing
      // their place.
      if (event === 'SIGNED_OUT') {
        await goToLogin();
      } else if (event === 'PASSWORD_RECOVERY') {
        router.replace('/auth/new-password');
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        router.replace('/tabs/home');
      } else {
        const onboarded = await AsyncStorage.getItem('bookam_onboarded');
        router.replace(onboarded ? '/auth/login' : '/onboarding');
      }
      initialRouteDone.current = true;
      // Hide the native splash only now — the very first frame the user
      // sees is already the correct destination, not a flash of
      // whatever index.tsx used to render first.
      SplashScreen.hideAsync();
    });

    // Safety net: getSession() reads from local encrypted storage, so it
    // should resolve near-instantly — but if anything unexpected ever
    // stalls it, this guarantees the splash screen can't hang forever
    // and leave the user staring at a frozen app.
    const safetyTimeout = setTimeout(() => {
      if (!initialRouteDone.current) {
        router.replace('/auth/login');
        initialRouteDone.current = true;
        SplashScreen.hideAsync();
      }
    }, 5000);

    const handleDeepLink = async (url: string) => {
      if (!url) return;
      const fragment = url.split('#')[1];
      if (!fragment) return;
      const params = new URLSearchParams(fragment);
      const type = params.get('type');

      // CRITICAL: this global listener must ONLY handle password-recovery
      // links opened from outside the app (e.g. tapping the reset-password
      // email while the app was closed). Google sign-in is fully handled
      // by lib/googleAuth.ts via WebBrowser.openAuthSessionAsync, which
      // resolves its own promise directly with the result — it does NOT
      // need this listener too. Google's redirect URL has no `type` param,
      // so checking for `type === 'recovery'` here is what keeps the two
      // paths from racing each other and fighting over navigation/session
      // state. Without this check, Google sign-in works then immediately
      // logs the user back out — this exact bug has happened before when
      // this check was accidentally removed/reverted. Do not remove it.
      if (type !== 'recovery') return;

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) router.replace('/auth/new-password');
      }
    };

    const linkSub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });

    return () => {
      subscription.unsubscribe();
      linkSub.remove();
      clearTimeout(safetyTimeout);
    };
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            // Premium default transition
            animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
            animationDuration: 350,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            contentStyle: { backgroundColor: '#EEE9F5' },
          }}
        >
          <Stack.Screen
            name="onboarding"
            options={{ animation: 'fade', animationDuration: 600 }}
          />
          <Stack.Screen
            name="auth"
            options={{ animation: 'fade', animationDuration: 400 }}
          />
          <Stack.Screen
            name="tabs"
            options={{ animation: 'fade', animationDuration: 500 }}
          />
        </Stack>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}