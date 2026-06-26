import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sudjewavhnwdgpojjrrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGpld2F2aG53ZGdwb2pqcnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTI5MTMsImV4cCI6MjA5NTQ4ODkxM30.-LO_NSi2whWfXVaVnWDZwHTHs2W40lb_qih_NtGvSmI';

/**
 * SECURITY: Session tokens are stored using expo-secure-store (OS-level
 * encrypted Keychain/Keystore), NOT plain AsyncStorage.
 *
 * REAL BUG FIXED HERE: SecureStore has a hard ~2048 byte limit per key.
 * Plain email/password sessions are small enough to fit, but Google
 * OAuth sessions carry extra metadata (avatar URL, full profile data)
 * that commonly pushes the stored value to ~2800+ bytes — well past the
 * limit. This caused writes to silently fail or get corrupted: the user
 * would see "Welcome back!" (the initial setSession() call succeeding),
 * then get bounced back to Login moments later with zero error shown,
 * because the next read of the corrupted/missing stored session found
 * nothing valid and Supabase's client correctly treated that as signed
 * out. This is a known, widely-reported issue in the Supabase + Expo
 * community — their own docs acknowledge it.
 *
 * THE FIX: chunk any value over a safe threshold across multiple
 * SecureStore keys, and reassemble on read. This keeps the encryption
 * benefit of SecureStore while removing the size limit that was
 * breaking Google sign-in specifically (and would eventually break
 * email/password sessions too, as Supabase adds more session metadata
 * over time).
 */
const CHUNK_SIZE = 1800; // safely under the 2048 byte limit
const CHUNK_COUNT_SUFFIX = '_chunks';

const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const chunkCountStr = await SecureStore.getItemAsync(key + CHUNK_COUNT_SUFFIX);

    // Not chunked — either a small legacy value, or doesn't exist
    if (!chunkCountStr) {
      return SecureStore.getItemAsync(key);
    }

    const chunkCount = parseInt(chunkCountStr, 10);
    const chunks: string[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
      if (chunk === null) return null; // a chunk went missing — treat as invalid
      chunks.push(chunk);
    }
    return chunks.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    // If this key was previously chunked (e.g. a Google session that's
    // now being replaced by a smaller email/password session), clean up
    // the old numbered chunks first so they don't linger as orphaned data.
    const existingChunkCountStr = await SecureStore.getItemAsync(key + CHUNK_COUNT_SUFFIX);
    if (existingChunkCountStr) {
      const existingChunkCount = parseInt(existingChunkCountStr, 10);
      for (let i = 0; i < existingChunkCount; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {});
      }
    }

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.deleteItemAsync(key + CHUNK_COUNT_SUFFIX).catch(() => {});
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunkCount = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < chunkCount; i++) {
      const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}_${i}`, chunk);
    }
    await SecureStore.setItemAsync(key + CHUNK_COUNT_SUFFIX, String(chunkCount));
    // The plain key itself is no longer used when chunked — clear it so
    // a stale unchunked value can't be read by mistake.
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },

  async removeItem(key: string): Promise<void> {
    const chunkCountStr = await SecureStore.getItemAsync(key + CHUNK_COUNT_SUFFIX);
    if (chunkCountStr) {
      const chunkCount = parseInt(chunkCountStr, 10);
      for (let i = 0; i < chunkCount; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
      await SecureStore.deleteItemAsync(key + CHUNK_COUNT_SUFFIX);
    }
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
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