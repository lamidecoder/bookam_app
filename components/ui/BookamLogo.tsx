import React from 'react';
import { Image, StyleSheet } from 'react-native';

export function BookamLogo({ width = 120, height = 36 }: { width?: number; height?: number }) {
  return (
    <Image
      source={require('../../assets/images/bookam-logo.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}