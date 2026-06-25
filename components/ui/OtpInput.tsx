import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableWithoutFeedback, StyleSheet, Platform } from 'react-native';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

/**
 * A segmented OTP input that behaves like a single field underneath —
 * this is the pattern real banking/fintech apps use, because individual
 * boxes with maxLength={1} each handle paste and OS autofill suggestions
 * inconsistently (especially on Android). Here, ONE invisible TextInput
 * captures everything (typing, paste, SMS/email autofill suggestions),
 * and the visible boxes are purely a display layer driven by its value.
 *
 * Tap anywhere on the boxes to focus the hidden input. Pasting a full
 * code anywhere instantly fills every box at once.
 */
export function OtpInput({ length = 6, value, onChange, autoFocus = true }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handleChangeText = (text: string) => {
    // Strip anything that isn't a digit (handles paste from emails/SMS
    // that might include spaces, dashes, or surrounding text) and cap
    // at the expected length.
    const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(digitsOnly);
  };

  const digits = value.split('');
  while (digits.length < length) digits.push('');

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View>
        {/* The single real input — invisible, but it's what's actually
            focused and receiving input/paste/autofill. Positioned over
            the boxes so the OS still treats this as "the field" for
            autofill suggestion purposes. */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus={autoFocus}
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          style={styles.hiddenInput}
          caretHidden
        />

        <View style={styles.boxRow} pointerEvents="none">
          {digits.map((digit, idx) => {
            const isActiveBox = focused && idx === value.length;
            const isFilled = digit !== '';
            return (
              <View
                key={idx}
                style={[
                  styles.box,
                  isFilled && styles.boxFilled,
                  isActiveBox && styles.boxActive,
                ]}
              >
                <Text style={styles.boxText}>{digit}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  boxRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  box: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1C9E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: '#6B2D82',
    backgroundColor: '#F5F3FF',
  },
  boxActive: {
    borderColor: '#6B2D82',
    borderWidth: 2,
  },
  boxText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#1E1E1E',
  },
});

