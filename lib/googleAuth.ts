/**
 * Google Sign-In via Supabase OAuth.
 *
 * This uses expo-auth-session + expo-web-browser, which works in BOTH:
 * - Expo Go (during development/testing)
 * - A real standalone APK/IPA build (production)
 *
 * Unlike @react-native-google-signin/google-signin, this needs no custom
 * native dev client or google-services.json — Supabase handles the OAuth
 * exchange server-side.
 *
 * ============================================
 * ONE-TIME SETUP REQUIRED (cannot be done in code):
 * ============================================
 *
 * 1. GOOGLE CLOUD CONSOLE (console.cloud.google.com):
 *    a. Create a project (or use existing)
 *    b. APIs & Services → OAuth consent screen → choose "External" → fill
 *       in app name, support email → Save → click "Publish" (so it's not
 *       stuck in testing mode, which would block real users)
 *    c. APIs & Services → Credentials → Create Credentials → OAuth Client ID
 *       → Application type: "Web application"
 *    d. Under "Authorized redirect URIs" add your Supabase callback URL:
 *       https://sudjewavhnwdgpojjrrc.supabase.co/auth/v1/callback
 *    e. Copy the generated Client ID and Client Secret
 *
 * 2. SUPABASE DASHBOARD (supabase.com/dashboard):
 *    a. Authentication → Providers → Google → toggle ON
 *    b. Paste the Client ID and Client Secret from step 1
 *    c. Save
 *
 * 3. APP.JSON — confirm the "scheme" field matches what's used below.
 *    Already set to "bookam" in this project — no change needed.
 *
 * That's it — no Android package name / SHA-1 fingerprint needed with
 * this approach, since Google never talks to the app directly.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export type GoogleSignInResult =
  | { success: true; isNewUser: boolean }
  | { success: false; error: string; needsTerms?: boolean };

/**
 * @param termsAccepted Pass true ONLY when the user has explicitly ticked
 *   the Terms checkbox (register screen). From the login screen pass
 *   false: existing users sign straight in, but a BRAND-NEW Google user
 *   will be signed out again and told to register - no account persists
 *   without recorded consent (NDPA 2023).
 */
export async function signInWithGoogle(termsAccepted = false, termsVersion = '1.0'): Promise<GoogleSignInResult> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'bookam' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true, // we open the browser manually below
      },
    });

    if (error || !data?.url) {
      return { success: false, error: error?.message || 'Could not start Google sign-in.' };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

    if (result.type !== 'success' || !result.url) {
      return { success: false, error: 'Sign-in was cancelled.' };
    }

    // Parse tokens out of the redirect URL (they arrive in the hash fragment)
    const url = new URL(result.url);
    const hashParams = new URLSearchParams(url.hash.replace('#', ''));
    const access_token = hashParams.get('access_token') || url.searchParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token') || url.searchParams.get('refresh_token');

    if (!access_token || !refresh_token) {
      return { success: false, error: 'Could not complete sign-in. Please try again.' };
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      return { success: false, error: sessionError.message };
    }

    return _finishSignIn(termsAccepted, termsVersion);
  } catch (e: any) {
    return { success: false, error: e.message || 'Something went wrong with Google sign-in.' };
  }
}

/**
 * Consent-aware completion, run with a live session.
 * - Existing profile -> normal sign-in.
 * - New user + terms accepted -> create profile WITH the consent record.
 * - New user + terms NOT accepted (login-screen path) -> sign out
 *   immediately and refuse: no profile row and no session are kept.
 *   The person is sent to register, where the checkbox is mandatory.
 */
async function _finishSignIn(termsAccepted: boolean, termsVersion: string): Promise<GoogleSignInResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Could not retrieve your account. Please try again.' };

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) {
    return { success: true, isNewUser: false };
  }

  // No profile exists for THIS specific Google identity — but that's not
  // the same as "this person has never used Bookam before". If they
  // already registered with email + password using this same email
  // address, Supabase (depending on the project's identity-linking
  // setting) can create a SEPARATE auth identity for the Google
  // sign-in rather than linking it to their existing account. Without
  // this check, that would silently create a second, disconnected
  // profile sharing the same email — their real booking history and
  // saved properties would be invisible whenever they signed in via
  // Google instead of email/password, with no way to reconcile the two
  // from inside the app.
  if (user.email) {
    const { data: emailMatch } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (emailMatch) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'An account with this email already exists. Please log in with your email and password instead.',
      };
    }
  }

  if (!termsAccepted) {
    await supabase.auth.signOut();
    return {
      success: false,
      needsTerms: true,
      error: 'Please create an account and accept the Terms of Service first.',
    };
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Guest';

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    terms_accepted: true,
    terms_accepted_at: new Date().toISOString(),
    terms_version: termsVersion,
  });
  if (profileError) {
    // terms_* columns may not exist yet if the migration wasn't run -
    // still create the basic profile rather than leaving it blank.
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    });
  }
  return { success: true, isNewUser: true };
}