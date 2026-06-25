import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sudjewavhnwdgpojjrrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGpld2F2aG53ZGdwb2pqcnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTI5MTMsImV4cCI6MjA5NTQ4ODkxM30.-LO_NSi2whWfXVaVnWDZwHTHs2W40lb_qih_NtGvSmI';

/**
 * SECURITY: Session tokens are stored using expo-secure-store, which uses
 * the OS-level encrypted Keychain (iOS) / Keystore (Android) — NOT plain
 * AsyncStorage, which stores data as readable plaintext on the device.
 * This protects the user's session token even if the device is compromised
 * or another app gains storage access.
 *
 * SecureStore has a ~2KB value size limit per key — Supabase sessions are
 * normally well under that, but if you ever see storage errors, the fix is
 * to chunk large values, not to fall back to AsyncStorage.
 */
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;