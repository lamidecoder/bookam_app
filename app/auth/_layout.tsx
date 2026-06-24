import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: Platform.OS === 'ios' ? 'simple_push' : 'slide_from_right',
        animationDuration: 320,
        contentStyle: { backgroundColor: '#EEE9F5' },
      }}
    >
      <Stack.Screen name="login" options={{ animation: 'fade', animationDuration: 400 }} />
      <Stack.Screen name="register" options={{ animation: 'slide_from_right', animationDuration: 320 }} />
      <Stack.Screen name="verify-email" options={{ animation: 'slide_from_right', animationDuration: 320 }} />
      <Stack.Screen name="otp-verify" options={{ animation: 'slide_from_right', animationDuration: 320 }} />
      <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right', animationDuration: 320 }} />
      <Stack.Screen name="otp-confirm" options={{ animation: 'slide_from_right', animationDuration: 320 }} />
      <Stack.Screen name="new-password" options={{ animation: 'slide_from_right', animationDuration: 320 }} />
      <Stack.Screen name="callback" options={{ animation: 'fade', animationDuration: 300 }} />
    </Stack>
  );
}