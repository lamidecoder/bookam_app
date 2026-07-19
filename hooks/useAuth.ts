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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadAndSyncProfile(session.user.id, session.user.email).then((p) => { if (p) setProfile(p); });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadAndSyncProfile(session.user.id, session.user.email).then((p) => { if (p) setProfile(p); });
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, refreshProfile };
}