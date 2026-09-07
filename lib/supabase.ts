import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://vygubrpugmcxbfczwklo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Vzxyf2lAzgU-2E_u196T-Q_8SUOOZk8';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Browser-safe client (uses anon key)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Server-side admin client (uses service role key - never expose to browser)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');
};
