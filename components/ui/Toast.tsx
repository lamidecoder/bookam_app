import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastProps = {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  onDismiss: () => void;
  duration?: number;
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#2E9E6B" strokeWidth={1.8} />
      <Path d="M8 12l3 3 5-5" stroke="#2E9E6B" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
  if (type === 'error') return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#D94F4F" strokeWidth={1.8} />
      <Line x1="15" y1="9" x2="9" y2="15" stroke="#D94F4F" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="9" y1="9" x2="15" y2="15" stroke="#D94F4F" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
  if (type === 'warning') return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 20h20L12 2z" stroke="#E8922A" strokeWidth={1.8} strokeLinejoin="round" />
      <Line x1="12" y1="9" x2="12" y2="13" stroke="#E8922A" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="12" cy="17" r="1" fill="#E8922A" />
    </Svg>
  );
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#3A7BD5" strokeWidth={1.8} />
      <Line x1="12" y1="8" x2="12" y2="12" stroke="#3A7BD5" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1" fill="#3A7BD5" />
    </Svg>
  );
}

const TOAST_CONFIG = {
  success: { bg: '#F0FDF6', border: '#2E9E6B', titleColor: '#1A6B45' },
  error:   { bg: '#FEF2F2', border: '#D94F4F', titleColor: '#9B1C1C' },
  warning: { bg: '#FFFBEB', border: '#E8922A', titleColor: '#92400E' },
  info:    { bg: '#EFF6FF', border: '#3A7BD5', titleColor: '#1E40AF' },
};

export function Toast({ visible, type, title, message, onDismiss, duration = 4000 }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = TOAST_CONFIG[type];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => dismiss(), duration);
      return () => clearTimeout(timer);
    } else {
      dismiss();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 12,
          backgroundColor: config.bg,
          borderLeftColor: config.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.iconCol}>
        <ToastIcon type={type} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: config.titleColor }]}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
      <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Line x1="18" y1="6" x2="6" y2="18" stroke="#9E96A8" strokeWidth={2} strokeLinecap="round" />
          <Line x1="6" y1="6" x2="18" y2="18" stroke="#9E96A8" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCol: { paddingTop: 1 },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  message: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 18 },
  closeBtn: { paddingTop: 2 },
});