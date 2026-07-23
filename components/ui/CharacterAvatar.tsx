import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

/**
 * Simple illustrated character avatars - built entirely from SVG
 * shapes (no external image assets or licensed characters), aiming
 * for a friendly, Bitmoji/Memoji-adjacent feel: a face, hair, simple
 * eyes and mouth, varying skin tone and hairstyle per character.
 * Picking one stores its id (e.g. 'char3') in profiles.avatar_color -
 * same column as before, just holding a character id now instead of
 * a hex color.
 */
export const AVATAR_CHARACTERS = [
  'char1', 'char2', 'char3', 'char4',
  'char5', 'char6', 'char7', 'char8',
] as const;

type CharacterId = typeof AVATAR_CHARACTERS[number];

const SKIN_TONES: Record<string, string> = {
  light: '#F4C6A0',
  medium: '#D9A066',
  tan: '#C88A5A',
  deep: '#8D5A3C',
};

function Face({ skin }: { skin: string }) {
  return <Circle cx="50" cy="55" r="32" fill={skin} />;
}

function Eyes({ x1 = 38, x2 = 62 }: { x1?: number; x2?: number }) {
  return (
    <>
      <Circle cx={x1} cy="52" r="3.2" fill="#2A2A2A" />
      <Circle cx={x2} cy="52" r="3.2" fill="#2A2A2A" />
    </>
  );
}

function Smile() {
  return <Path d="M40 65 Q50 74 60 65" stroke="#8A4A3A" strokeWidth={2.5} strokeLinecap="round" fill="none" />;
}

const CHARACTERS: Record<CharacterId, React.ReactNode> = {
  // Short dark curly hair, light skin
  char1: (
    <>
      <Face skin={SKIN_TONES.light} />
      <Path d="M20 45 Q22 15 50 14 Q78 15 80 45 Q80 30 50 28 Q20 30 20 45Z" fill="#2B1B12" />
      <Eyes />
      <Smile />
    </>
  ),
  // Long straight hair, medium skin, gold streak
  char2: (
    <>
      <Path d="M14 40 Q16 12 50 12 Q84 12 86 40 L84 95 Q78 70 50 70 Q22 70 16 95Z" fill="#C9A84C" />
      <Face skin={SKIN_TONES.medium} />
      <Eyes />
      <Smile />
    </>
  ),
  // Bald, tan skin, glasses
  char3: (
    <>
      <Face skin={SKIN_TONES.tan} />
      <Eyes />
      <Smile />
      <Circle cx="38" cy="52" r="9" stroke="#2A2A2A" strokeWidth={2} fill="none" />
      <Circle cx="62" cy="52" r="9" stroke="#2A2A2A" strokeWidth={2} fill="none" />
      <Path d="M47 52h6" stroke="#2A2A2A" strokeWidth={2} />
    </>
  ),
  // Afro, deep skin
  char4: (
    <>
      <Circle cx="50" cy="38" r="30" fill="#1F1B18" />
      <Face skin={SKIN_TONES.deep} />
      <Eyes />
      <Smile />
    </>
  ),
  // Purple bun, light skin (brand-flavored)
  char5: (
    <>
      <Face skin={SKIN_TONES.light} />
      <Path d="M22 42 Q24 16 50 15 Q76 16 78 42 Q78 26 50 24 Q22 26 22 42Z" fill="#6B2D82" />
      <Circle cx="50" cy="14" r="9" fill="#6B2D82" />
      <Eyes />
      <Smile />
    </>
  ),
  // Short fade, medium skin, beard
  char6: (
    <>
      <Face skin={SKIN_TONES.medium} />
      <Path d="M20 44 Q22 18 50 17 Q78 18 80 44 Q80 32 50 30 Q20 32 20 44Z" fill="#3A2A20" />
      <Path d="M30 62 Q50 82 70 62 Q68 78 50 80 Q32 78 30 62Z" fill="#3A2A20" opacity={0.85} />
      <Eyes />
      <Smile />
    </>
  ),
  // Headscarf, tan skin
  char7: (
    <>
      <Face skin={SKIN_TONES.tan} />
      <Path d="M18 46 Q16 10 50 10 Q84 10 82 46 L84 58 Q86 40 50 38 Q14 40 16 58Z" fill="#D08C3E" />
      <Eyes />
      <Smile />
    </>
  ),
  // Curly ponytail, deep skin, gold hair tie
  char8: (
    <>
      <Face skin={SKIN_TONES.deep} />
      <Path d="M20 42 Q22 14 50 13 Q78 14 80 42 Q78 28 50 26 Q22 28 20 42Z" fill="#1F1B18" />
      <Circle cx="82" cy="46" r="12" fill="#1F1B18" />
      <Ellipse cx="82" cy="36" rx="4" ry="3" fill="#C9A84C" />
      <Eyes />
      <Smile />
    </>
  ),
};

export function CharacterAvatar({
  id, size = 40,
}: {
  id?: string | null;
  size?: number;
}) {
  const characterId = (id && AVATAR_CHARACTERS.includes(id as CharacterId) ? id : AVATAR_CHARACTERS[0]) as CharacterId;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="50" fill="#F5F0FA" />
        {CHARACTERS[characterId]}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});