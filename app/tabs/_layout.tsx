import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { usePushNotifications } from '../../hooks/usePushNotifications';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22V12h6v10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={1.8} />
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function BookingsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={1.8} />
      <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function TabIcon({ focused, icon, label }: { focused: boolean; icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.tabItem}>
      {icon}
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>{label}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

export default function TabsLayout() {
  // Registers the device's push token and saves it to profiles.push_token
  // the moment a logged-in user enters the tabs. Without this call, the
  // hook existed but was never invoked anywhere - no token was ever
  // saved, so send-booking-notification could never reach anyone.
  usePushNotifications();
  const insets = useSafeAreaInsets();
  // Base 72px is the design height on a device with NO gesture bar
  // (older phones, or Android 3-button nav). On phones with a home
  // indicator / gesture pill (iPhone X+, most modern Android), we add
  // the device's actual bottom inset on top of that so the icons never
  // sit crowded against the gesture bar — this is what "smooth on all
  // devices" needs: it's dynamic per-device, not a guessed fixed number.
  const tabBarHeight = 56 + Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  const tabBarStyle = [styles.tabBar, { height: tabBarHeight, paddingBottom: Math.max(insets.bottom, 8) }];

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}>
      <Tabs.Screen name="home" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={<HomeIcon color={focused ? '#6B2D82' : '#9E96A8'} />} label="Home" /> }} />
      <Tabs.Screen name="explore" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={<SearchIcon color={focused ? '#6B2D82' : '#9E96A8'} />} label="Search" /> }} />
      <Tabs.Screen name="bookings" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={<BookingsIcon color={focused ? '#6B2D82' : '#9E96A8'} />} label="Bookings" /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={<ProfileIcon color={focused ? '#6B2D82' : '#9E96A8'} />} label="Profile" /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0EBF8',
    paddingTop: 8, elevation: 12,
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 12,
  },
  tabItem: { alignItems: 'center', gap: 3, minWidth: 60 },
  tabLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  tabLabelActive: { color: '#6B2D82', fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  tabDot: { position: 'absolute', bottom: -6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#6B2D82' },
});