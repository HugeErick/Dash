<script lang="ts">
  import { onMount } from "svelte";

  interface Server {
    name: String;
    url: URL;
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

  let servers: Server[] = [
    {
      name: "Unwanted Backend",
      url: new URL("http://nurichvsdiewelt.work/api/health"),
      status: "unknown",
      lastChecked: null,
    },
    // Add more as needed
  ];

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

  onMount(() => {
    servers.forEach((server) => {
      checkServerStatus(server);
    });
  });
</script>

<main class="m mx-2 my-4 p-2">
  <div class="m-2 p-2">
    <h2 class="font-bold text-4xl">Servers</h2>
  </div>
  <div class="grid gap-4">
    {#each servers as server (server.url)}
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
