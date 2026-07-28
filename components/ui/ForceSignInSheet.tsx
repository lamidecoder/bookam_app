import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';

/**
 * The designed "force sign in" bottom sheet - shown when a guest tries
 * to complete an action that genuinely needs an account (booking,
 * saving a property). Distinct from a plain toast+redirect: this is
 * the actual designed screen, and it explicitly reassures the person
 * their progress won't be lost, which the returnTo/returnToProperty
 * params passed into `params` below make true rather than just a
 * promise in copy.
 */
export function ForceSignInSheet({
  visible,
  onDismiss,
  message = "You need an account to complete your booking. Your selected dates will be saved.",
  returnParams,
}: {
  visible: boolean;
  onDismiss: () => void;
  message?: string;
  returnParams?: Record<string, string>;
}) {
  const goTo = (pathname: '/auth/login' | '/auth/register') => {
    onDismiss();
    router.push({ pathname, params: returnParams });
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={styles.container}>
        <View style={styles.handle} />
        <Text style={styles.title}>Sign in to continue</Text>
        <Text style={styles.subtitle}>{message}</Text>

        <TouchableOpacity style={styles.loginBtn} onPress={() => goTo('/auth/login')} activeOpacity={0.85}>
          <Text style={styles.loginBtnText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerBtn} onPress={() => goTo('/auth/register')} activeOpacity={0.85}>
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDismiss} style={styles.continueBrowsing}>
          <Text style={styles.continueBrowsingText}>Continue browsing</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FAF8FC',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0D9ED',
    alignSelf: 'center', marginBottom: 20,
  },
  title: { fontSize: 20, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#1E1E1E', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B6478', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 8 },
  loginBtn: { backgroundColor: '#6B2D82', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  registerBtn: { borderWidth: 1.5, borderColor: '#6B2D82', borderRadius: 14, paddingVertical: 14.5, alignItems: 'center', marginBottom: 8 },
  registerBtnText: { color: '#6B2D82', fontSize: 15, fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  continueBrowsing: { paddingVertical: 12, alignItems: 'center' },
  continueBrowsingText: { color: '#9E96A8', fontSize: 14, fontFamily: 'Poppins-Medium', fontWeight: '500' },
});