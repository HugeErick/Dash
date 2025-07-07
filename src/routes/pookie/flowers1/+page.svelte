<!-- src/routes/pookie/flowers/+page.svelte -->
<script>
  import { onMount } from "svelte";

  /**
   * @type {any[]}
   */
  let roses = [];

  // Rose arrangement
  function createRoses() {
    roses = [];

    // Create exactly 12 roses (a dozen)
    for (let i = 0; i < 12; i++) {
      // Calculate position in a more compact circular arrangement
      const angle = (i / 12) * Math.PI * 2;

      // Smaller radius for a more compact bouquet
      const radius = i % 3 === 0 ? 40 : 80; // Inner and outer circle (reduced values)

      // Center horizontally, position vertically below text
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius + 60; // Position below text

      // Add some randomness to make it look natural
      const randomOffset = 20;
      const x =
        50 + offsetX + (Math.random() * randomOffset - randomOffset / 2);
      const y =
        50 + offsetY + (Math.random() * randomOffset - randomOffset / 2);

      // Vary the rose sizes slightly
      const size = Math.random() * 10 + 35;

      // Vary the red shades slightly for a natural look
      const redShade = Math.floor(Math.random() * 40) + 180; // 180-220 range for red
      const color = `rgb(${redShade}, ${Math.floor(redShade / 8)}, ${Math.floor(redShade / 8)})`;

      roses = [
        ...roses,
        {
          id: i,
          x,
          y,
          size,
          petalCount: 12 + Math.floor(Math.random() * 4), // 12-15 petals for roses
          rotation: Math.random() * 360,
          color,
          growDelay: i * 200, // Stagger the animation
          bloomDelay: i * 200 + 800,
          stemRotation: Math.random() * 20 - 10, // Slight random stem angle
        },
      ];
    }
  }

  onMount(() => {
    createRoses();
  });
</script>

<div class="roses-container">
  <div class="for-pookie">Pa mi Pookie ♥</div>

  {#each roses as rose (rose.id)}
    <div
      class="rose-wrapper"
      style="--x: {rose.x}%; --y: {rose.y}%; --delay: {rose.growDelay}ms; 
             --bloom-delay: {rose.bloomDelay}ms; --stem-rotation: {rose.stemRotation}deg;"
    >
      <div class="stem">
        <div class="leaf leaf-left"></div>
        <div class="leaf leaf-right"></div>
        <div class="thorn thorn-1"></div>
        <div class="thorn thorn-2"></div>
        <div class="thorn thorn-3"></div>
      </div>

      <div
        class="rose"
        style="--size: {rose.size}px; --rotation: {rose.rotation}deg; --color: {rose.color};"
      >
        <!-- Inner petals (tighter) -->
        {#each Array(6) as _, i}
          <div
            class="petal petal-inner"
            style="--angle: {(360 / 6) * i}deg; --layer: 1;"
          ></div>
        {/each}

        <!-- Middle petals -->
        {#each Array(8) as _, i}
          <div
            class="petal petal-middle"
            style="--angle: {(360 / 8) * i + 10}deg; --layer: 2;"
          ></div>
        {/each}

        <!-- Outer petals (more open) -->
        {#each Array(rose.petalCount) as _, i}
          <div
            class="petal petal-outer"
            style="--angle: {(360 / rose.petalCount) * i + 5}deg; --layer: 3;"
          ></div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }

  .roses-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .for-pookie {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    font-family: "Brush Script MT", cursive;
    font-size: 3rem;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    opacity: 0;
    animation: fadeIn 2s ease-in-out 0.5s forwards;
    z-index: 100;
  }

  /* Rose wrapper with stem */
  .rose-wrapper {
    position: absolute;
    left: var(--x);
    top: var(--y);
    transform-origin: bottom center;
    transform: translate(-50%, -50%) rotate(var(--stem-rotation));
    z-index: calc(var(--y) * -1);
  }

  .stem {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 4px;
    height: 0;
    background: linear-gradient(to top, #1b5e20, #388e3c);
    transform: translateX(-50%);
    border-radius: 2px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    animation: growStem 1.5s ease-out var(--delay) forwards;
  }

  .leaf {
    position: absolute;
    width: 25px;
    height: 12px;
    background-color: #388e3c;
    border-radius: 50% 50% 50% 0;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
    opacity: 0;
    animation: fadeIn 0.5s ease-out calc(var(--delay) + 0.5s) forwards;
  }

  .leaf-left {
    left: -22px;
    top: 60%;
    transform: rotate(-20deg);
  }

  .leaf-right {
    right: -22px;
    top: 40%;
    transform: rotate(160deg);
  }

  .thorn {
    position: absolute;
    width: 6px;
    height: 3px;
    background-color: #1b5e20;
    border-radius: 0 50% 50% 0;
    left: 2px;
    opacity: 0;
    animation: fadeIn 0.5s ease-out calc(var(--delay) + 0.7s) forwards;
  }

  .thorn-1 {
    top: 30%;
  }

  .thorn-2 {
    top: 50%;
    transform: rotate(180deg);
    left: -4px;
  }

  .thorn-3 {
    top: 70%;
  }

  /* Rose head */
  .rose {
    position: absolute;
    bottom: 80px;
    left: 0;
    width: var(--size);
    height: var(--size);
    transform: translateX(-50%) rotate(var(--rotation));
    transform-origin: center;
    opacity: 0;
    scale: 0;
    animation: bloom 1.5s ease-out var(--bloom-delay) forwards;
  }

  .petal {
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: var(--color);
    border-radius: 50% 50% 50% 50%;
    transform-origin: 0 50%;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
  }

  .petal-inner {
    width: calc(var(--size) * 0.5);
    height: calc(var(--size) * 0.3);
    transform: translateY(-50%) rotate(var(--angle))
      translateX(calc(var(--size) * 0.1));
    z-index: 3;
  }

  .petal-middle {
    width: calc(var(--size) * 0.6);
    height: calc(var(--size) * 0.35);
    transform: translateY(-50%) rotate(var(--angle))
      translateX(calc(var(--size) * 0.15));
    z-index: 2;
  }

  .petal-outer {
    width: calc(var(--size) * 0.7);
    height: calc(var(--size) * 0.4);
    transform: translateY(-50%) rotate(var(--angle))
      translateX(calc(var(--size) * 0.2));
    z-index: 1;
  }

  /* Animations */
  @keyframes growStem {
    0% {
      height: 0;
    }
    100% {
      height: 80px;
    }
  }

  @keyframes bloom {
    0% {
      opacity: 0;
      scale: 0;
    }
    100% {
      opacity: 1;
      scale: 1;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
