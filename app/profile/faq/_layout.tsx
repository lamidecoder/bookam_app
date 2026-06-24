import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function FaqLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: Platform.OS === 'ios' ? 'simple_push' : 'slide_from_right', animationDuration: 320 }}>
      <Stack.Screen name="cancellation-policy" />
      <Stack.Screen name="minimum-stay" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="reporting-issue" />
    </Stack>
  );
}
