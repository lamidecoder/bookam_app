import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile, updateProfile } from '../lib/api';

// After a profile-edit email change, the auth email updates immediately
// but profiles.email deliberately stays on the OLD value until the
// person actually clicks the confirmation link in their inbox (see
// edit-profile.tsx) - showing the new email as "already changed" in the
// profile before that would be exactly backwards. Once they do confirm,
// their session's user.email reflects the new address; this catches
// that and brings profiles.email back in sync, so it doesn't get stuck
// on the old email forever.
async function loadAndSyncProfile(userId: string, authEmail: string | undefined) {
  const fresh = await getProfile(userId).catch(() => null);
  if (!fresh) return null;
  if (authEmail && fresh.email !== authEmail) {
    await updateProfile(userId, { email: authEmail }).catch(() => {});
    return { ...fresh, email: authEmail };
  }
  return fresh;
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const fresh = await loadAndSyncProfile(session.user.id, session.user.email);
      if (fresh) setProfile(fresh);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const fresh = await loadAndSyncProfile(session.user.id, session.user.email);
        if (fresh) setProfile(fresh);
      }
      // Only marked done once the profile is actually ready (or
      // genuinely doesn't exist) - previously fired right alongside
      // the profile fetch instead of after it, so every screen gating
      // its skeleton on this flag would briefly flash fallback content
      // (Guest, JD, etc) in the gap between the skeleton disappearing
      // and the real profile data actually arriving.
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const fresh = await loadAndSyncProfile(session.user.id, session.user.email);
        if (fresh) setProfile(fresh);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, refreshProfile };
}