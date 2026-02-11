import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types'; // We'll need to check where types are

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set. Please check your .env.local file.');
  // We don't throw here to avoid crashing the entire app if envs are missing during build, 
  // but it will fail at runtime if used.
}

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || '', 
  supabaseAnonKey || '', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
    },
    db: {
      schema: 'public',
    },
  }
);
