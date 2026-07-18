import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Svg, { Path, Circle, Line } from 'react-native-svg';

/**
 * Global "no internet connection" banner. Mounted once at the root
 * layout so it's visible across every screen, not just one - slides
 * down from the top when the connection drops, slides away
 * automatically the moment it's restored. The "Retry" button doesn't
 * actually need to DO anything beyond re-checking the connection state
 * itself (NetInfo already updates reactively the instant real
 * connectivity returns), but tapping it gives the person a concrete
 * action to take rather than just staring at a banner with no options.
 */
export function NoInternetBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const [checking, setChecking] = useState(false);
  const slideAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected can briefly be null while NetInfo is still
      // determining state on first load - treat that as "connected"
      // rather than flashing the banner on every cold app start.
      setIsConnected(state.isConnected !== false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isConnected ? -80 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
    }).start();
  }, [isConnected, slideAnim]);

  const handleRetry = async () => {
    setChecking(true);
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected !== false);
    setTimeout(() => setChecking(false), 500);
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      pointerEvents={isConnected ? 'none' : 'auto'}
    >
      <View style={styles.content}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5 13l2 2a7.07 7.07 0 0 1 10 0l2-2a10 10 0 0 0-14 0z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
          <Line x1="1" y1="1" x2="23" y2="23" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          <Circle cx="12" cy="20" r="1.2" fill="#FFFFFF" />
        </Svg>
        <Text style={styles.text}>No internet connection</Text>
        <TouchableOpacity onPress={handleRetry} disabled={checking} style={styles.retryBtn}>
          <Text style={styles.retryText}>{checking ? 'Checking…' : 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 9999,
  },
  content: {
    backgroundColor: '#D94F4F',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },
});