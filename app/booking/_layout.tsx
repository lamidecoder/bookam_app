import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'simple_push' : 'slide_from_right',
        animationDuration: 320,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="summary" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="payment-failed" />
      <Stack.Screen name="hold-expired" options={{ gestureEnabled: false }} />
      <Stack.Screen name="confirmed" options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="detail-active" />
      <Stack.Screen name="detail-review" />
    </Stack>
  );
}