/**
 * Supabase client configuration
 * Initialize with your Supabase project URL and API key
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Export a client where available; do NOT throw during import so server builds without env vars.
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const supabaseAdmin =
  supabaseServiceRoleKey && supabaseUrl
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

export async function getUserFromAccessToken(accessToken?: string) {
  if (!accessToken || !supabaseAdmin) return null;

  try {
    const res = await supabaseAdmin.auth.getUser(accessToken);
    if ('error' in res && res.error) return null;
    // res.data may be { user }
    // support both shapes from different SDK versions
    // @ts-ignore
    return (res.data && res.data.user) || null;
  } catch (e) {
    return null;
  }
}
