import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  StyleSheet, TextInputProps, ViewStyle,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// ── Icon components (clean black outlined SVG icons) ──────────────────────────

function PersonIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="4" stroke="#8A8A8E" strokeWidth={1.8} />
      <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke="#8A8A8E" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function EmailIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#8A8A8E" strokeWidth={1.8} />
      <Path d="M2 8l10 7 10-7" stroke="#8A8A8E" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke="#8A8A8E" strokeWidth={1.8} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#8A8A8E" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill="#8A8A8E" />
    </Svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#8A8A8E" strokeWidth={1.8} />
        <Circle cx="12" cy="12" r="3" stroke="#8A8A8E" strokeWidth={1.8} />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="#8A8A8E" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="#8A8A8E" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="1" y1="1" x2="23" y2="23" stroke="#8A8A8E" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

// ── Exported slot components ───────────────────────────────────────────────────

export function PersonSlot() { return <PersonIcon />; }
export function EmailSlot() { return <EmailIcon />; }
export function LockSlot() { return <LockIcon />; }

export function PhoneSlot({ showDropdown = false }: { showDropdown?: boolean }) {
  return (
    <View style={styles.phoneSlot}>
      <Text style={styles.flag}>🇳🇬</Text>
      <Text style={styles.dialCode}>+234{showDropdown ? ' ▾' : ''}</Text>
      <View style={styles.phoneDivider} />
    </View>
  );
}

// Keep IconSlot for any custom emoji use
export function IconSlot({ icon }: { icon: string }) {
  return <Text style={styles.iconText}>{icon}</Text>;
}

// ── Main AuthInput ─────────────────────────────────────────────────────────────

type Props = TextInputProps & {
  leftSlot?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
};

export function AuthInput({ leftSlot, isPassword, containerStyle, style, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {leftSlot && <View style={styles.leftSlot}>{leftSlot}</View>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#AEAEB2"
        secureTextEntry={isPassword && !show}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setShow(v => !v)}
          style={styles.eyeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <EyeIcon visible={show} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  leftSlot: {
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1E1E1E',
    paddingVertical: 16,
  },
  eyeBtn: { paddingLeft: 8 },
  iconText: { fontSize: 20 },
  phoneSlot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { fontSize: 20 },
  dialCode: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#1E1E1E', fontWeight: '500' },
  phoneDivider: { width: 1, height: 22, backgroundColor: '#D1D1D6', marginLeft: 8 },
});