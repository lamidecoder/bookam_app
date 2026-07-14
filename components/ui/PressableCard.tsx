import React, { useRef } from 'react';
import { Animated, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  scaleDown?: number;
  activeOpacity?: number;
  disabled?: boolean;
};

/**
 * A card wrapper that gives a smooth spring press animation.
 * Use this anywhere a card or button should physically respond
 * to touch — the 0.97 scale + shadow removal on press is what
 * makes an app feel native and polished vs flat.
 */
export function PressableCard({
  children, onPress, style, scaleDown = 0.97, activeOpacity = 1, disabled,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const shadow = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: scaleDown, useNativeDriver: true, tension: 250, friction: 12 }),
      Animated.timing(shadow, { toValue: 0.4, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }),
      Animated.timing(shadow, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: shadow }, style as ViewStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={activeOpacity}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}