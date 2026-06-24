import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'simple_push' : 'slide_from_right',
        animationDuration: 320,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="filter" />
      <Stack.Screen name="property-detail" />
    </Stack>
  );
}
