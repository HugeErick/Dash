<script lang="ts">
  // +layout.svelte
  import "../app.css";
  import { ModeWatcher, toggleMode, mode } from "mode-watcher";
  import { Sun, Moon } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";

  let { children } = $props();

</script>

<ModeWatcher />
<div class="dark:bg-dark-gray dark:text-custom-white rubikal h-screen w-screen">
        <Button variant="ghost" onclick={toggleMode} class="p-2">
          {#if mode.current === "dark"}
            <Sun class="size-5" />
          {:else}
            <Moon class="size-5"/>
          {/if}
        </Button>
  {@render children()}
</div>
