import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path } from 'react-native-svg';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

export default function HoldExpiredScreen() {
  const params = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* Clock icon */}
        <View style={styles.iconWrap}>
          <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke="#D1D1D6" strokeWidth={1.5} />
            <Path d="M12 7v5l3 3" stroke="#D1D1D6" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
        </View>

        <Text style={styles.heading}>Your hold has expired</Text>
        <Text style={styles.sub}>
          The 15-minute hold on your selected dates has ended. Those dates are now available to others.
        </Text>
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottom}>
        <PrimaryButton
          label="Go Back to Property"
          onPress={() => router.back()}
        />
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/tabs/home')}
        >
          <Text style={styles.homeText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1, paddingHorizontal: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrap: { marginBottom: 28 },
  heading: {
    fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#1E1E1E', textAlign: 'center', marginBottom: 14,
  },
  sub: {
    fontSize: 14, fontFamily: 'Poppins-Regular',
    color: '#6B6478', textAlign: 'center', lineHeight: 22,
  },
  bottom: {
    paddingHorizontal: 24, paddingBottom: 32, gap: 14,
  },
  homeBtn: { alignItems: 'center', paddingVertical: 8 },
  homeText: {
    fontSize: 15, fontFamily: 'Poppins-SemiBold',
    fontWeight: '600', color: '#6B2D82',
  },
});
