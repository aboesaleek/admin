// Fix: Added a triple-slash directive to provide types for import.meta.env in a Vite project.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Ambil URL dan Kunci Anon dari environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pastikan environment variables sudah di-set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in the environment variables");
}

// Buat dan ekspor Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
