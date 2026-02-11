
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with auto-generated types from Supabase CLI
// npx supabase gen types typescript --project-id "your-project-id" > src/lib/supabase/types.ts
export type Database = any;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
