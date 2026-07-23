import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Curated avatar colors - clean, deliberate palette rather than photo
 * upload. Brand purple and gold first, then a small set of tasteful
 * complements. Kept short (8) on purpose - a picker with dozens of
 * options stops feeling curated and starts feeling like a color wheel.
 */
export const AVATAR_COLORS = [
  '#6B2D82', // brand purple
  '#C9A84C', // brand gold
  '#2E9E6B', // forest green
  '#3A6EA5', // soft blue
  '#C1666B', // dusty rose
  '#4A4E69', // slate
  '#D08C3E', // warm terracotta
  '#1F7A72', // deep teal
];

export function getInitials(name?: string | null): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  name, color, size = 40,
}: {
  name?: string | null;
  color?: string | null;
  size?: number;
}) {
  const bg = color || AVATAR_COLORS[0];
  const initials = getInitials(name) || '?';

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontFamily: 'Poppins-Bold', fontWeight: '700' },
});