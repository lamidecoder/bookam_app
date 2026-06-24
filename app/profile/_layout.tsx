import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'simple_push' : 'slide_from_right',
        animationDuration: 320,
        contentStyle: { backgroundColor: '#F8F5FA' },
      }}
    >
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="saved-properties" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="faq" />
    </Stack>
  );
}
