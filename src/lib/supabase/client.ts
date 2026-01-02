import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Re-export Database type for convenience
export type { Database };

// Initialize client with Database type - ensure env vars are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create typed client - env vars are required for proper type inference
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
