import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const TIPS = [
  {
    icon: 'calendar' as const,
    title: 'Pick your dates',
    body: 'Tap a date on the calendar to set check-in, then tap another date for check-out.',
  },
  {
    icon: 'scroll' as const,
    title: 'See the full picture',
    body: 'Scroll down for photos, amenities, reviews, and the property\u2019s own booking policy.',
  },
  {
    icon: 'check' as const,
    title: 'Book in seconds',
    body: 'Once your dates are set, tap Book Now to review your total and pay securely.',
  },
];

function TipIcon({ type }: { type: typeof TIPS[number]['icon'] }) {
  if (type === 'calendar') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M3 9h18M7 3v4M17 3v4M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (type === 'scroll') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke="#6B2D82" strokeWidth={1.8} />
        <Path d="M12 8v4l3 2" stroke="#6B2D82" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke="#6B2D82" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BookingTipsModal({
  visible, onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.heading}>New here? Quick tips</Text>
          <Text style={styles.sub}>A few things to know before you book</Text>

          <View style={{ height: 20 }} />

          {TIPS.map((tip) => (
            <View key={tip.title} style={styles.tipRow}>
              <View style={styles.tipIconWrap}>
                <TipIcon type={tip.icon} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipBody}>{tip.body}</Text>
              </View>
            </View>
          ))}

          <View style={{ height: 8 }} />

          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.dismissText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(30,20,40,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 380,
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
  },
  heading: { fontSize: 19, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#1E1E1E', marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9E96A8' },
  tipRow: { flexDirection: 'row', gap: 14, marginBottom: 18, alignItems: 'flex-start' },
  tipIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#F0E6FA', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tipTitle: { fontSize: 14.5, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: '#1E1E1E', marginBottom: 3 },
  tipBody: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B6478', lineHeight: 18 },
  dismissBtn: {
    backgroundColor: '#6B2D82', borderRadius: 40,
    paddingVertical: 14, alignItems: 'center',
  },
  dismissText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
});