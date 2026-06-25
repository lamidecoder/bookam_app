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
  | { success: true }
  | { success: false; error: string };

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
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

    // First-time Google sign-up: no profiles row exists yet for this user.
    // Without this, the profile screen, edit-profile prefill, and booking
    // summary's guest name would all silently show blank/fallback values.
    const { data: { user: googleUser } } = await supabase.auth.getUser();
    if (googleUser) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', googleUser.id)
        .maybeSingle();

      if (!existingProfile) {
        const fullName =
          googleUser.user_metadata?.full_name ||
          googleUser.user_metadata?.name ||
          googleUser.email?.split('@')[0] ||
          'Guest';

        await supabase.from('profiles').upsert({
          id: googleUser.id,
          full_name: fullName,
          email: googleUser.email,
          avatar_url: googleUser.user_metadata?.avatar_url || googleUser.user_metadata?.picture || null,
        });
      }
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Something went wrong with Google sign-in.' };
  }
}