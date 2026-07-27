import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NoInternetBanner } from '../components/ui/NoInternetBanner';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ToastProvider } from '../components/ui/ToastContext';
import { TransitionPresets } from '@react-navigation/stack';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  const initialRouteDone = useRef(false);

  const goToHomeAsGuest = async () => {
    await AsyncStorage.setItem('bookam_onboarded', 'true');
    router.replace('/tabs/home');
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
        await goToHomeAsGuest();
      } else if (event === 'PASSWORD_RECOVERY') {
        router.replace('/auth/new-password');
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        router.replace('/tabs/home');
      } else {
        const onboarded = await AsyncStorage.getItem('bookam_onboarded');
        // Not logged in no longer means forced to the login screen -
        // browsing properties should be free, same as any real booking
        // app (Airbnb, Booking.com). Login is only required for actions
        // that genuinely need an account: saving a property or booking
        // one - both already prompt for that at the moment they're
        // attempted, with a clear explanation rather than a silent
        // redirect.
        if (onboarded) {
          router.replace('/tabs/home');
        } else {
          router.replace('/onboarding');
        }
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
        router.replace('/tabs/home');
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
        <NoInternetBanner />
        <Stack
          screenOptions={{
            headerShown: false,
            // Same smooth horizontal slide on both platforms, rather
            // than each platform's own default - Android's previous
            // fade_from_bottom didn't even match the horizontal
            // swipe-back gesture already configured below, and a
            // consistent motion language feels more considered across
            // both platforms than each one doing its own thing.
            animation: 'slide_from_right',
            animationDuration: 300,
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