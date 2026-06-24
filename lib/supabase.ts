import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sudjewavhnwdgpojjrrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGpld2F2aG53ZGdwb2pqcnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTI5MTMsImV4cCI6MjA5NTQ4ODkxM30.-LO_NSi2whWfXVaVnWDZwHTHs2W40lb_qih_NtGvSmI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;