import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
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

// expo-secure-store is a NATIVE-ONLY module — it has no implementation in
// a web browser or Node.js (e.g. Metro's server-side static rendering).
// Calling it outside a real iOS/Android runtime throws "getValueWithKeyAsync
// is not a function", and because that happens deep inside Supabase's own
// client initialization, it's an UNCAUGHT exception that crashes the
// entire Metro/Node process, not just one screen — this took down the
// whole dev server, including Android testing running in the same
// session. This app never ships to web, but Expo Router can still
// attempt to prepare a web bundle in the background depending on config,
// so this in-memory fallback exists purely so that path can never crash
// again, even by accident.
const memoryFallback = new Map<string, string>();
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Per-key write lock. Chunked writes are multiple sequential SecureStore
// calls (delete old chunks, write new chunks, write the chunk-count
// marker, delete the plain key) - NOT atomic. If two writes to the same
// key overlap (e.g. Supabase's client persisting the session from
// setSession(), then immediately persisting again as part of its own
// internal auth-state-change handling), the second write can start
// while the first is still mid-sequence. The result: a chunk-count
// marker that says "3 chunks" while only 1 has actually been written by
// the newer call - the next read finds a missing chunk, returns null,
// and Supabase correctly (from its point of view) treats that as "no
// session". This is exactly the "Welcome back! ...then bounced back to
// Login with no error" symptom, and it's a genuinely different failure
// mode than the SIZE problem chunking alone fixes - a value can be
// perfectly sized AND still get corrupted by an interleaved write.
const writeLocks = new Map<string, Promise<void>>();

async function withWriteLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = writeLocks.get(key) ?? Promise.resolve();
  let release: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  writeLocks.set(key, previous.then(() => current));
  await previous;
  try {
    return await fn();
  } finally {
    release!();
  }
}

const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (!isNative) return memoryFallback.get(key) ?? null;

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
    if (!isNative) { memoryFallback.set(key, value); return; }

    // Serialized per key — a second setItem() call on the same key waits
    // for the first to fully finish before it starts, so the multi-step
    // chunked write sequence can never interleave with another one.
    return withWriteLock(key, async () => {
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
    });
  },

  async removeItem(key: string): Promise<void> {
    if (!isNative) { memoryFallback.delete(key); return; }

    return withWriteLock(key, async () => {
      const chunkCountStr = await SecureStore.getItemAsync(key + CHUNK_COUNT_SUFFIX);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_${i}`);
        }
        await SecureStore.deleteItemAsync(key + CHUNK_COUNT_SUFFIX);
      }
      await SecureStore.deleteItemAsync(key).catch(() => {});
    });
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