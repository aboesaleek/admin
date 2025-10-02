import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// Please replace these placeholder values with your actual Supabase project URL and anon key.
// You can find these in your Supabase project's "Settings" > "API" section.
const supabaseUrl = 'https://rlbuwmowdstsjrmusbve.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYnV3bW93ZHN0c2pybXVzYnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTczMDUsImV4cCI6MjA3NDkzMzMwNX0.aPVCln5wL_ndlml0UEx5EYhWTNp3cxihBqiTnYkklqg';

// FIX: This check is redundant because the Supabase credentials have already been
// provided. The TypeScript compiler correctly identifies that this condition
// will never be met, resulting in an error. The check has been removed.

// Create and export the Supabase client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
