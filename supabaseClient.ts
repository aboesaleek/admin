import { createClient } from '@supabase/supabase-js';

// --- هام ---
// استبدل هذه القيم المؤقتة بعنوان URL لمشروع Supabase ومفتاح anon الخاص بك.
// يمكنك العثور عليها في قسم "Settings" > "API" في مشروع Supabase الخاص بك.
const supabaseUrl = 'https://rlbuwmowdstsjrmusbve.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYnV3bW93ZHN0c2pybXVzYnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTczMDUsImV4cCI6MjA3NDkzMzMwNX0.aPVCln5wL_ndlml0UEx5EYhWTNp3cxihBqiTnYkklqg';

// إنشاء وتصدير عميل Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);