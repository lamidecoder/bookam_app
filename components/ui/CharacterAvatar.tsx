import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

/**
 * Real illustrated character avatars via DiceBear (dicebear.com) - an
 * open-source, MIT-licensed avatar library with genuinely illustrated
 * styles, not hand-drawn shapes. "avataaars" is the style closest to
 * a Bitmoji-like cartoon-person look: varied hair, skin tone, facial
 * features, expression.
 *
 * Each id here is a seed string - DiceBear deterministically generates
 * the same avatar for the same seed every time, so these 8 seeds were
 * picked once and will always render the same 8 distinct-looking
 * avatars. Picking one stores its id in profiles.avatar_color (same
 * column as before, just holding a seed string now).
 */
export const AVATAR_CHARACTERS = [
  'Aneka', 'Zaid', 'Chidi', 'Amara',
  'Tobi', 'Ngozi', 'Kwame', 'Yemi',
] as const;

function avatarUrl(seed: string, size: number): string {
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(seed)}&size=${Math.round(size * 2)}&backgroundColor=f5f0fa`;
}

export function CharacterAvatar({
  id, size = 40,
}: {
  id?: string | null;
  size?: number;
}) {
  const seed = id && AVATAR_CHARACTERS.includes(id as any) ? id : AVATAR_CHARACTERS[0];

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={{ uri: avatarUrl(seed, size) }}
        style={{ width: size, height: size }}
        contentFit="cover"
        transition={150}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#F5F0FA' },
});