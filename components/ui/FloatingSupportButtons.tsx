import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

function WhatsAppIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.6 6.32A8.86 8.86 0 0012.05 4C7.14 4 3.16 7.98 3.16 12.9c0 1.62.43 3.13 1.18 4.45L3 21l3.79-1.27a8.83 8.83 0 005.26 1.68h.01c4.91 0 8.89-3.98 8.89-8.9a8.86 8.86 0 00-2.62-6.27zM12.06 19.7a7.36 7.36 0 01-4.21-1.32l-.3-.19-2.6.87.87-2.55-.19-.31a7.39 7.39 0 01-1.34-4.27c0-4.09 3.34-7.43 7.43-7.43 1.98 0 3.85.78 5.25 2.19a7.35 7.35 0 012.18 5.25c0 4.1-3.34 7.43-7.43 7.43h-.01"
        fill="#FFFFFF"
      />
      <Path
        d="M16.07 14.4c-.21-.1-1.24-.61-1.43-.68-.19-.07-.34-.1-.48.1-.14.21-.55.68-.68.82-.12.14-.25.16-.46.05-.62-.31-1.27-.7-1.86-1.27a7.04 7.04 0 01-1.27-1.59c-.13-.23 0-.36.12-.49.12-.13.27-.31.4-.46.13-.16.18-.27.27-.45.09-.18.04-.33-.04-.46-.08-.13-.71-1.71-.97-2.34-.21-.5-.43-.43-.59-.44h-.5c-.16 0-.43.06-.66.32-.23.26-.87.85-.87 2.05 0 1.2.87 2.36 1 2.53.13.16 1.68 2.57 4.08 3.5 2.4.93 2.4.62 2.83.58.43-.04 1.39-.57 1.59-1.12.2-.55.2-1.02.14-1.12-.06-.1-.21-.16-.42-.26z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

type Props = {
  /** Override the default support numbers if a specific property/host has its own contact */
  whatsappNumber?: string;
  phoneNumber?: string;
  /** Set false to hide one of the two buttons */
  showWhatsapp?: boolean;
  showCall?: boolean;
  /** Extra distance ABOVE the device's safe area — defaults to clearing
   * a bottom action bar / tab bar. The device's own safe-area inset
   * (home indicator / gesture bar) is always added on top of this so
   * the buttons never sit crowded against it on any phone. */
  bottom?: number;
};

// BookamFast Nigeria Ltd. support contact — 09034145636, 9AM-9PM WAT.
// Converted to international format: WhatsApp needs digits only (no +
// or leading 0), tel: links need the + prefix.
const DEFAULT_WHATSAPP = '2349034145636';
const DEFAULT_PHONE = '+2349034145636';

export function FloatingSupportButtons({
  whatsappNumber = DEFAULT_WHATSAPP,
  phoneNumber = DEFAULT_PHONE,
  showWhatsapp = true,
  showCall = true,
  bottom = 90,
}: Props) {
  const insets = useSafeAreaInsets();
  if (!showWhatsapp && !showCall) return null;

  return (
    <View style={[styles.container, { bottom: bottom + insets.bottom }]}>
      {showWhatsapp && (
        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={() => Linking.openURL(`https://wa.me/${whatsappNumber}`)}
          activeOpacity={0.85}
        >
          <WhatsAppIcon />
        </TouchableOpacity>
      )}
      {showCall && (
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
          activeOpacity={0.85}
        >
          <PhoneIcon />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    gap: 12,
  },
  whatsappBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#25D366',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  callBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#6B2D82',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6B2D82', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
});