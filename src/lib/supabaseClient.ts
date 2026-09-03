import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from "$env/static/public"
import { Agent, fetch as undiciFetch } from "undici";

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const agent = new Agent({
  keepAliveTimeout: 4_000,
  keepAliveMaxTimeout: 10_000,
})

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url, options = {}) => undiciFetch(url, { ...options, dispatcher: agent}),
  },
});
