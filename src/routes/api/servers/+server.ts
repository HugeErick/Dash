import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { loadServers, removeServer, upsertServer } from "$lib/server/serverStore";
import { REGISTER_TOKEN } from "$env/static/private";

// Very small shared-secret check so random people can't spam your servers
// list. Set REGISTER_TOKEN in your .env — see .env.example.
function checkAuth(request: Request) {
  const token = request.headers.get("x-register-token");
  if (!REGISTER_TOKEN || token !== REGISTER_TOKEN) {
    throw error(401, "Invalid or missing registration token");
  }
}

// GET /api/servers — list everything currently registered.
// The dashboard page calls this on load and on a polling interval.
export const GET: RequestHandler = async () => {
  return json(await loadServers());
};

// POST /api/servers — register a new server or update an existing one
// (matched by `name`). Body can be either:
//   { "name": "Ngrok Test Server", "url": "https://abc123.ngrok-free.app/api/health" }
// or, if you'd rather not hardcode the health path on the caller side:
//   { "name": "Ngrok Test Server", "baseUrl": "https://abc123.ngrok-free.app" }
export const POST: RequestHandler = async ({ request }) => {
  checkAuth(request);
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    throw error(400, "Invalid JSON body");
  }

  const { name, url, baseUrl } = body as {
    name?: string;
    url?: string;
    baseUrl?: string;
  };

  if (!name || (!url && !baseUrl)) {
    throw error(400, "Missing 'name' and either 'url' or 'baseUrl'");
  }

  const healthUrl = url ?? `${String(baseUrl).replace(/\/$/, "")}/api/health`;

  try {
    new URL(healthUrl);
  } catch {
    throw error(400, "Resulting health URL is not valid");
  }

  const entry = await upsertServer(name, healthUrl);
  return json(entry, { status: 201 });
};

// DELETE /api/servers — drop a server by name, e.g. { "name": "..." }
export const DELETE: RequestHandler = async ({ request }) => {
  checkAuth(request);
  const body = await request.json().catch(() => null);
  const name = body?.name;
  if (!name) throw error(400, "Missing 'name'");
  const removed = await removeServer(name);
  return json({ removed });
};
