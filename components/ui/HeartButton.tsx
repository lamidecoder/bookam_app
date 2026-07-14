import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  saved: boolean;
  onPress: () => void;
  size?: number;
};

/**
 * Heart button with a spring bounce on save.
 * The scale-up-then-settle animation is the signature feel
 * of apps like Airbnb and Instagram — it confirms the action
 * without needing any text.
 */
export function HeartButton({ saved, onPress, size = 18 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevSaved = useRef(saved);

  useEffect(() => {
    if (saved && !prevSaved.current) {
      // Bounce animation only when going from unsaved → saved
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, tension: 300, friction: 6 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
      ]).start();
    }
    prevSaved.current = saved;
  }, [saved]);

  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
            stroke={saved ? '#C9A84C' : '#FFFFFF'}
            fill={saved ? '#C9A84C' : 'rgba(0,0,0,0.15)'}
            strokeWidth={1.8}
          />
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
}