import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Animated, Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { PrimaryButton } from '../ui/PrimaryButton';

const { height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onDismiss: () => void;
  propertyName?: string;
};

export function ForceSignInSheet({ visible, onDismiss, propertyName }: Props) {
  const translateY = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 300, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.heading}>Sign in to continue</Text>
        <Text style={styles.sub}>
          You need an account to complete your booking. Your selected dates will be saved.
        </Text>

        <View style={styles.buttons}>
          <PrimaryButton
            label="Log In"
            onPress={() => {
              onDismiss();
              router.push('/auth/login');
            }}
          />
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              onDismiss();
              router.push('/auth/register');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.createText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDismiss} style={styles.browseBtn}>
            <Text style={styles.browseText}>Continue browsing</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0D9ED',
    alignSelf: 'center', marginBottom: 24,
  },
  heading: {
    fontSize: 20, fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#1E1E1E', textAlign: 'center', marginBottom: 10,
  },
  sub: {
    fontSize: 14, fontFamily: 'Poppins-Regular',
    color: '#6B6478', textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  buttons: { gap: 12 },
  createBtn: {
    borderWidth: 1.5, borderColor: '#6B2D82',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
  },
  createText: {
    fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#6B2D82',
  },
  browseBtn: { alignItems: 'center', paddingVertical: 8 },
  browseText: {
    fontSize: 14, fontFamily: 'Poppins-Regular', color: '#9E96A8',
  },
});
