import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export interface StoredServer {
  name: string;
  url: string; // full URL to the /api/health endpoint
  registeredAt: string;
  updatedAt: string;
}

// A plain JSON file is enough for a single-instance dashboard. If you ever
// run this behind multiple server instances/replicas, swap this for a real
// DB or a KV store (Redis, Upstash, etc.) — the upsert/remove/load API
// below is the only thing +server.ts depends on, so the swap is isolated.
const DATA_FILE = process.env.SERVERS_DATA_FILE ?? "data/servers.json";

function ensureFile() {
  if (!existsSync(DATA_FILE)) {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export function loadServers(): StoredServer[] {
  ensureFile();
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveServers(servers: StoredServer[]) {
  ensureFile();
  writeFileSync(DATA_FILE, JSON.stringify(servers, null, 2));
}

/**
 * Registers a server, or updates its URL if one with the same name already
 * exists. This is what makes re-registration idempotent: every time your
 * ngrok tunnel restarts and gets a new temp domain, calling this again with
 * the same `name` just overwrites the stale URL instead of creating a
 * duplicate entry.
 */
export function upsertServer(name: string, url: string): StoredServer {
  const servers = loadServers();
  const now = new Date().toISOString();
  const existingIndex = servers.findIndex((s) => s.name === name);

  let entry: StoredServer;
  if (existingIndex >= 0) {
    entry = { ...servers[existingIndex], url, updatedAt: now };
    servers[existingIndex] = entry;
  } else {
    entry = { name, url, registeredAt: now, updatedAt: now };
    servers.push(entry);
  }

  saveServers(servers);
  return entry;
}

export function removeServer(name: string): boolean {
  const servers = loadServers();
  const next = servers.filter((s) => s.name !== name);
  const changed = next.length !== servers.length;
  if (changed) saveServers(next);
  return changed;
}
