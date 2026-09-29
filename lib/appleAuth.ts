/**
 * Sign in with Apple - native flow.
 *
 * Uses expo-apple-authentication (the real native Apple sheet) and hands
 * the returned identity token to Supabase via signInWithIdToken. Once a
 * session exists we reuse the SAME consent / duplicate-account logic that
 * Google sign-in uses (finishOAuthSignIn), so the two providers behave
 * identically from that point on.
 *
 * IMPORTANT - where this works:
 *   - Real iOS build (EAS) or the iOS Simulator: YES
 *   - Expo Go: NO (native module isn't in the Expo Go binary)
 *   - Android / web: NO (button is hidden; isAppleSignInAvailable() is false)
 *
 * ============================================
 * ONE-TIME SETUP (native flow - already done for Bookam):
 * ============================================
 * Because this app uses the NATIVE flow (not the web OAuth redirect),
 * the setup is short and needs NO .p8 key and NO Services ID:
 *
 * 1. developer.apple.com -> Certificates, Identifiers & Profiles ->
 *    Identifiers -> App ID "com.bookam.app" with the "Sign in with
 *    Apple" capability enabled.
 *
 * 2. Supabase -> Authentication -> Providers -> Apple -> Enabled, and
 *    add "com.bookam.app" to the Client IDs field. Leave the Secret Key
 *    / Services ID blank (those are only for the web OAuth flow).
 *
 * The .p8 key + Services ID would ONLY be needed if Bookam later adds a
 * web login page that signs in with Apple through the browser redirect.
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { finishOAuthSignIn, GoogleSignInResult } from './googleAuth';

// Same result shape as Google - the screens treat them interchangeably.
export type AppleSignInResult = GoogleSignInResult;

/**
 * True only on a real iOS device/simulator where the native Apple auth
 * module is present and Apple sign-in is actually offered. The auth
 * screens call this to decide whether to render the Apple button at all,
 * so it never shows on Android, web, or inside Expo Go.
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * @param termsAccepted Pass true ONLY when the user has explicitly ticked
 *   the Terms checkbox (register screen). From the login screen pass
 *   false: existing users sign straight in, but a BRAND-NEW Apple user
 *   will be signed out again and told to register - no account persists
 *   without recorded consent (NDPA 2023). This mirrors Google exactly.
 */
export async function signInWithApple(
  termsAccepted = false,
  termsVersion = '1.0',
): Promise<AppleSignInResult> {
  try {
    // Apple expects the SHA-256 hash of a nonce; Supabase needs the RAW
    // nonce to verify the identity token it gets back. Generating and
    // binding the nonce this way is what stops a stolen token from being
    // replayed against our backend.
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      return {
        success: false,
        error: 'Apple did not return an identity token. Please try again.',
      };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Apple sends the real name ONLY on the first authorization for this
    // Apple ID + app pair. Capture it now if we got it, otherwise the
    // profile falls back to the email prefix inside finishOAuthSignIn.
    let appleFullName: string | undefined;
    if (credential.fullName?.givenName || credential.fullName?.familyName) {
      appleFullName = [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    return finishOAuthSignIn(termsAccepted, termsVersion, appleFullName);
  } catch (e: any) {
    // The user tapping "Cancel" on the Apple sheet isn't an error worth
    // shouting about - treat it as a quiet cancellation.
    if (e?.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, error: 'Sign-in was cancelled.' };
    }
    return {
      success: false,
      error: e?.message || 'Something went wrong with Apple sign-in.',
    };
  }
}
