import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get the tokens from the URL params
      const access_token = params.access_token as string;
      const refresh_token = params.refresh_token as string;

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) throw error;
        router.replace('/tabs/home');
      } else {
        // Try getting current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/tabs/home');
        } else {
          router.replace('/auth/login');
        }
      }
    } catch (e) {
      console.error('Callback error:', e);
      router.replace('/auth/login');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6B2D82" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEE9F5' },
});