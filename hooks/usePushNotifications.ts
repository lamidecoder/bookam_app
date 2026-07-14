/**
 * Push notification registration hook.
 *
 * WHAT THIS DOES:
 * Requests the device's push token from Expo's notification service and
 * saves it to the user's profiles row in Supabase. The Edge Function
 * (send-booking-notification) reads this column to know which device
 * to notify when a booking status changes (confirmed / cancelled).
 *
 * IMPORTANT — EXPO GO LIMITATION (SDK 53+):
 * As of Expo SDK 53, remote push notification functionality was removed
 * from Expo Go entirely (both Android and iOS). Calling the permission
 * or token APIs while running inside Expo Go throws — and since none of
 * that was wrapped in a try/catch before, it crashed the app the moment
 * this hook ran. This version detects Expo Go via `expo-constants` and
 * skips the whole thing gracefully there. Push notifications only ever
 * work in a real EAS development or production build, never Expo Go —
 * so there's nothing lost by skipping it, only a crash avoided.
 *
 * SETUP REQUIRED (for the real build, not Expo Go):
 * 1. In Supabase Dashboard, your `send-booking-notification` Edge Function
 *    must read `profiles.push_token` for the booking's user_id and call
 *    Expo's push API: https://exp.host/--/api/v2/push/send
 * 2. EAS project ID must be set in app.json under expo.extra.eas.projectId
 *    (already set — see app.json).
 *
 * HOW TO USE:
 * Call this hook once in app/tabs/_layout.tsx (or home.tsx) after the
 * user is confirmed signed in. Don't call it on auth screens.
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configure how notifications appear when the app is in the foreground.
// Guarded the same way as everything else below — calling this inside
// Expo Go on SDK 53+ is exactly the kind of call that throws.
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn('[Bookam] Could not set notification handler:', e);
  }
}

export function usePushNotifications() {
  useEffect(() => {
    // Fire-and-forget with its own internal try/catch — never let a
    // rejected promise from this escape into the caller's render tree.
    registerPushToken().catch((e) => {
      console.warn('[Bookam] Push registration failed unexpectedly:', e);
    });
  }, []);
}

async function registerPushToken() {
  // Push notifications only work on real devices — never in the simulator.
  if (!Device.isDevice) return;

  // Expo Go (SDK 53+) doesn't support remote push notifications at all -
  // every call below this point would throw. Skip entirely, silently.
  if (isExpoGo) {
    console.log('[Bookam] Skipping push notification setup — not supported in Expo Go. Use a real build to test push notifications.');
    return;
  }

  try {
    // Android needs a notification channel before tokens work
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('bookings', {
        name: 'Booking Updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6B2D82',
        description: 'Confirmations, cancellations and reminders about your bookings.',
      });
    }

    // Request permission — nothing works without this
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // User declined — don't error, just silently exit.
    // Bookings still work, they just won't get push notifications.
    if (finalStatus !== 'granted') return;

    // Get the Expo push token — this is what the Edge Function sends to
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    // Save to the authenticated user's profile row
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ push_token: pushToken })
      .eq('id', user.id);
  } catch (e) {
    // Token registration failing for ANY reason is non-critical - the
    // app works fine without it, the user just won't get push
    // notifications for this session. Never let this crash the app.
    console.warn('[Bookam] Push token registration failed:', e);
  }
}