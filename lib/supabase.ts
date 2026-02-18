import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase environment variables');
}

// ⚠️ SERVER-SIDE ONLY: Uses Service Role Key (Admin Access)
// NEVER import this in client components
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
