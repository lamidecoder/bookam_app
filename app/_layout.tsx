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

  const goToLogin = async () => {
    await AsyncStorage.setItem('bookam_onboarded', 'true');
    router.replace('/auth/login');
  };

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    SplashScreen.hideAsync();

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
    });

    const handleDeepLink = async (url: string) => {
      if (!url) return;
      const fragment = url.split('#')[1];
      if (!fragment) return;
      const params = new URLSearchParams(fragment);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const type = params.get('type');
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) router.replace(type === 'recovery' ? '/auth/new-password' : '/tabs/home');
      }
    };

    const linkSub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });

    return () => {
      subscription.unsubscribe();
      linkSub.remove();
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