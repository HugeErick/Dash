<script lang="ts">
  import "../app.css";
  import { ModeWatcher, toggleMode, mode, setMode } from "mode-watcher";
  import Sun from "@lucide/svelte/icons/sun";
  import Moon from "@lucide/svelte/icons/moon";
  import House from "@lucide/svelte/icons/house";

  let { children } = $props();

  function handleModeChange() {
    if (mode.current === "dark") {
      setMode("light");
    } else {
      setMode("dark");
    }
  }
</script>

<ModeWatcher />
<div class="bg-customWhite dark:bg-darkGray rubikal h-screen w-screen">
  <nav class="dark:bg-lightBlack items-center border-2 border-red-500 p-4">
    <ul class="flex flex-row items-center justify-between">
      <li>
        <a href="/">
          <div class="border-2 border-red-500">
            <House size="20" />
          </div>
        </a>
      </li>
      <li>
        <a href="/about"> About </a>
      </li>
      <li>
        <button onclick={toggleMode} class="border-2 border-red-500">
          {#if mode.current === "dark"}
            <Sun size="20" />
          {:else}
            <Moon size="20" />
          {/if}
        </button>
      </li>
    </ul>
  </nav>

  {@render children()}
</div>
