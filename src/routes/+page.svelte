<script lang="ts">
  import { onDestroy,  onMount } from "svelte";

  interface Server {
    name: String;
    url: string;
    status: "unknown" | "healthy" | "unhealthy" | "offline";
    lastChecked: Date | null;
    details?: {
      timestamp?: string;
      uptime?: number;
      load?: number[];
      memory?: {
        free: number;
        total: number;
      };
    };
  }

  const HARDCODED_SERVERS: { name: string; url: string }[] = [
    {
      name: "Unwanted Backend",
      url: "https://nurichvsdiewelt.work/api/health",
    },
    // Add more permanent servers here as needed.
  ];

  let servers: Server[] = HARDCODED_SERVERS.map((s) => ({
    ...s,
    status: "unknown",
    lastChecked: null,
  }));

  let listPollId: ReturnType<typeof setInterval>;
  let healthPollId: ReturnType<typeof setInterval>;


  function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }

  function memoryPercentage(memory: { free: number; total: number }): number {
    return Math.round(((memory.total - memory.free) / memory.total) * 100);
  }

  async function checkServerStatus(server: Server) {
    try {
      const response = await fetch(server.url);
      if (response.ok) {
        const data = await response.json();
        server.status = "healthy";
        server.details = {
          timestamp: data.timestamp,
          uptime: data.uptime,
          load: data.load,
          memory: data.memory,
        };
      } else {
        server.status = "unhealthy";
        server.details = undefined;
      }
    } catch (err) {
      server.status = "offline";
      server.details = undefined;
    }
    server.lastChecked = new Date();
    servers = [...servers];
  }

  async function checkAllServers() {
    await Promise.all(servers.map(checkServerStatus));
  }

  async function refreshServerList() {
    const known = new Map(servers.map((s) => [s.name, s]));
    const hardcodedNames = new Set(HARDCODED_SERVERS.map((s) => s.name));

    function toServer(entry: { name: string; url: string }): Server {
      const existing = known.get(entry.name);
      if (existing && existing.url === entry.url) {
        return existing;
      }
      return {
        name: entry.name,
        url: entry.url,
        status: "unknown",
        lastChecked: null,
      };
    }

    let registered: { name: string; url: string }[] = [];
    try {
      const res = await fetch("/api/servers");
      if (res.ok) {
        registered = await res.json();
      }
    } catch (err) {
      console.error("Failed to fetch registered servers", err);
      // Fall through — we still want to keep the hardcoded servers showing
      // even if the remote registry is unreachable.
    }

    const merged = [
      ...HARDCODED_SERVERS.map(toServer),
      ...registered
        .filter((r) => !hardcodedNames.has(r.name))
        .map(toServer),
    ];
 
    servers = merged;
 
    const needsCheck = servers.filter((s) => s.status === "unknown");
    await Promise.all(needsCheck.map(checkServerStatus));
  }

  onMount(async () => {
    await refreshServerList();
    listPollId = setInterval(refreshServerList, 15000);
    healthPollId = setInterval(checkAllServers, 30000);
  });

  onDestroy(() => {
    clearInterval(listPollId);
    clearInterval(healthPollId);
  });
</script>

<main class="m mx-2 my-4 p-2">
  <div class="m-2 p-2">
    <h2 class="font-bold text-4xl">Servers</h2>
  </div>
  {#if servers.length === 0}
    <p class="m-2 p-2 text-gray-500">
      No servers registered yet. 
    </p>
  {/if}

  <div class="grid gap-4">
    {#each servers as server (server.name)}
      <div class="rounded-lg border p-4">
        <div class="flex items-center gap-2">
          <div
            class={`h-3 w-3 rounded-full ${
              server.status === "healthy"
                ? "bg-green-500"
                : server.status === "unhealthy"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          ></div>
          <h3 class="font-bold text-2xl">{server.name}</h3>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p class="font-medium my-1">
              Status: <span class="capitalize">{server.status}</span>
            </p>
            {#if server.lastChecked}
              <p class="text-sm text-gray-500">
                Last checked: {new Date(server.lastChecked).toLocaleString()}
              </p>
            {/if}

            {#if server.details?.timestamp}
              <p class="mt-1 text-sm text-gray-500">
                Server reported at: {new Date(
                  server.details.timestamp,
                ).toLocaleString()}
              </p>
            {/if}
          </div>

          {#if server.details}
            <div class="space-y-2">
              {#if server.details.uptime}
                <div>
                  <p class="text-sm my-1 font-medium">Uptime</p>
                  <p>{formatUptime(server.details.uptime)}</p>
                </div>
              {/if}

              {#if server.details.load}
                <div>
                  <p class="text-sm my-1 font-medium">Load Average</p>
                  <div class="flex gap-4">
                    <span>1m: {server.details.load[0].toFixed(2)}</span>
                    <span>5m: {server.details.load[1].toFixed(2)}</span>
                    <span>15m: {server.details.load[2].toFixed(2)}</span>
                  </div>
                </div>
              {/if}

              {#if server.details.memory}
                <div>
                  <p class="text-sm my-1 font-medium">Memory Usage</p>
                  <div class="h-2.5 w-full rounded-full bg-gray-200">
                    <div
                      class="h-2.5 rounded-full bg-blue-600"
                      style={`width: ${memoryPercentage(server.details.memory)}%`}
                    ></div>
                  </div>
                  <p class="text-xs my-1 text-gray-500">
                    {memoryPercentage(server.details.memory)}% used (
                    {((server.details.memory.total -
                      server.details.memory.free) /
                      1024 /
                      1024) |
                      0} MB /
                    {(server.details.memory.total / 1024 / 1024) | 0} MB)
                  </p>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</main>
