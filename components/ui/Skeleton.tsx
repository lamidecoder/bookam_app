import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, StyleSheet, DimensionValue } from 'react-native';

type Props = {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

/**
 * A shimmering skeleton placeholder.
 * Replaces spinners during loading — feels much more native.
 */
export function Skeleton({ width, height, borderRadius = 8, style }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#EDE6F7', opacity },
        style,
      ]}
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <View style={sk.card}>
      <Skeleton width="100%" height={190} borderRadius={0} />
      <View style={sk.body}>
        <Skeleton width="70%" height={16} borderRadius={8} />
        <View style={{ height: 8 }} />
        <Skeleton width="40%" height={12} borderRadius={6} />
        <View style={{ height: 14 }} />
        <View style={sk.footer}>
          <Skeleton width={100} height={22} borderRadius={8} />
          <Skeleton width={90} height={36} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

export function FeaturedCardSkeleton() {
  return (
    <View style={sk.featuredCard}>
      <Skeleton width="100%" height={220} borderRadius={0} />
    </View>
  );
}

const sk = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    borderWidth: 1, borderColor: '#F5F0FF',
  },
  body: { padding: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredCard: {
    width: 280, borderRadius: 22, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14, shadowRadius: 16, elevation: 8,
  },
});