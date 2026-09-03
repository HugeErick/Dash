import { supabase } from "$lib/supabaseClient";
import { error as kitError } from "@sveltejs/kit";

// TODO: sanitize input received w zod here

export interface StoredServer {
  name: string;
  url: string; // full URL to the /api/health endpoint
  registeredAt: string;
  updatedAt: string;
}

interface ServerRow {
  name: string;
  url: string;
  registered_at: string;
  updated_at: string;
}

function fromRow(row: ServerRow): StoredServer {
  return {
    name: row.name,
    url: row.url,
    registeredAt: row.registered_at,
    updatedAt: row.updated_at,
  };
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  try {
    return await fn();
  } catch (e) {
      if (attempts > 1 && e instanceof TypeError && e.message.includes("fetch failed")) {
        return withRetry(fn, attempts -1);
      }
      throw e;
    }
}

export async function loadServers(): Promise<StoredServer[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
    .from("servers")
    .select("*")
    .order("name");

    if (error) {
      console.error("[loadServers] supabase err:", error);
      throw kitError (500, `Failed to load servers :${error.message}`);
    }
    return (data ?? []).map(fromRow);
  })
}

/**
 * Registers a server, or updates its URL if one with the same name already
 * exists. This is what makes re-registration idempotent: every time your
 * ngrok tunnel restarts and gets a new temp domain, calling this again with
 * the same `name` just overwrites the stale URL instead of creating a
 * duplicate row. `registered_at` is left out of the upsert payload on
 * purpose so it keeps its original value on conflict — Postgres only
 * touches the columns you pass in ON CONFLICT DO UPDATE.
 */
export async function upsertServer(name: string, url: string): Promise<StoredServer> {
  const { data, error } = await supabase
    .from("servers")
    .upsert(
      { name, url, updated_at: new Date().toISOString() },
      { onConflict: "name" },
    )
    .select()
    .single();

  if (error) {
    console.error("[upsertServer] supabase err:", error);
    throw kitError (500, `Failed to load servers :${error.message}`);
  };
  return fromRow(data);
}

export async function removeServer(name: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("servers")
    .delete()
    .eq("name", name)
    .select();

    if (error) {
      console.error("[removeServer] supabase err:", error);
      throw kitError (500, `Failed to load servers :${error.message}`);
  };
  return (data?.length ?? 0) > 0;
}
