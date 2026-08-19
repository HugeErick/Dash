import { supabase } from "$lib/supabaseClient";

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

export async function loadServers(): Promise<StoredServer[]> {
  const { data, error } = await supabase
    .from("servers")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

// TODO: wrapp on try and catch in order to get svelte errs rather than 500 err code due to supabases ass

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

  if (error) throw error;
  return fromRow(data);
}

export async function removeServer(name: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("servers")
    .delete()
    .eq("name", name)
    .select();

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
