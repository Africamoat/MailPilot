import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type ContactStatus =
  | "not_contacted"
  | "contacted"
  | "follow_up"
  | "replied";

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  status: ContactStatus;
  last_contacted_at: string | null;
  has_replied: boolean;
  follow_up_count: number;
  next_follow_up_at: string | null;
  notes: string | null;
  created_at: string;
}

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}
