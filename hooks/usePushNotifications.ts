/**
 * Push notification registration hook.
 *
 * WHAT THIS DOES:
 * Requests the device's push token from Expo's notification service and
 * saves it to the user's profiles row in Supabase. The Edge Function
 * (send-booking-notification) reads this column to know which device
 * to notify when a booking status changes (confirmed / cancelled).
 *
 * SETUP REQUIRED:
 * 1. In Supabase Dashboard, your `send-booking-notification` Edge Function
 *    must read `profiles.push_token` for the booking's user_id and call
 *    Expo's push API: https://exp.host/--/api/v2/push/send
 * 2. For production builds (not Expo Go), you need an EAS project ID.
 *    Add it to app.json: { "expo": { "extra": { "eas": { "projectId": "YOUR_ID" } } } }
 *    Get it from: https://expo.dev → your project → settings
 *
 * HOW TO USE:
 * Call this hook once in app/tabs/_layout.tsx (or home.tsx) after the
 * user is confirmed signed in. Don't call it on auth screens.
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  useEffect(() => {
    registerPushToken();
  }, []);
}

async function registerPushToken() {
  // Push notifications only work on real devices — never in the simulator
  if (!Device.isDevice) return;

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

  try {
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
    // Token registration failing is non-critical — app works fine without it.
    // The user just won't receive push notifications for this session.
    console.warn('[Bookam] Push token registration failed:', e);
  }
}