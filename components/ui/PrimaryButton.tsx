import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet,
  ActivityIndicator, ViewStyle, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({ label, onPress, loading, disabled, style, variant = 'primary' }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.97, tension: 250, friction: 12, useNativeDriver: true }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start();
  };

  const isSecondary = variant === 'secondary';
  const isDisabled = disabled || loading;

  if (isSecondary) {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <TouchableOpacity
          style={[styles.btn, styles.secondary, isDisabled && styles.disabledSecondary]}
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={1}
          disabled={isDisabled}
        >
          {loading
            ? <ActivityIndicator color="#6B2D82" />
            : <Text style={styles.labelSecondary}>{label}</Text>
          }
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style, isDisabled && { opacity: 0.6 }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        disabled={isDisabled}
        style={{ borderRadius: 14, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={['#8B3DAF', '#6B2D82', '#521169']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.label}>{label}</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#6B2D82',
    borderRadius: 14,
  },
  disabledSecondary: { opacity: 0.55 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  labelSecondary: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#6B2D82',
    letterSpacing: 0.3,
  },
});