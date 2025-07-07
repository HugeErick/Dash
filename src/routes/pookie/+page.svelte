<!-- src/routes/pookie/+page.svelte -->

<script>
  // No JavaScript needed for this simple illustration
</script>

<div class="container">
  <div class="penguin">
    <!-- Penguin body -->
    <div class="body">
      <div class="belly"></div>
    </div>

    <!-- Penguin face -->
    <div class="face">
      <div class="eye left"></div>
      <div class="eye right"></div>
      <div class="beak"></div>
    </div>

    <!-- Arms -->
    <div class="arm left"></div>
    <div class="arm right">
      <!-- Heart that the penguin is holding -->
      <div class="heart"></div>
    </div>

    <!-- Feet -->
    <div class="foot left"></div>
    <div class="foot right"></div>
  </div>

  <!-- Name -->
  <h1 class="name">Pa mi Pookie</h1>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #e6f7ff;
  }

  .penguin {
    position: relative;
    width: 300px;
    height: 300px;
    margin-bottom: 20px;
  }

  .body {
    position: absolute;
    width: 150px;
    height: 200px;
    background-color: #000;
    border-radius: 70% 70% 65% 65%;
    top: 50px;
    left: 75px;
    z-index: 1;
  }

  .belly {
    position: absolute;
    width: 100px;
    height: 130px;
    background-color: white;
    border-radius: 50%;
    top: 60px;
    left: 25px;
    z-index: 2;
  }

  .face {
    position: absolute;
    width: 100px;
    height: 100px;
    background-color: #000;
    border-radius: 50%;
    top: 10px;
    left: 100px;
    z-index: 2;
  }

  .eye {
    position: absolute;
    width: 15px;
    height: 15px;
    background-color: white;
    border-radius: 50%;
    top: 40px;
    z-index: 3;
  }

  .eye.left {
    left: 30px;
  }

  .eye.right {
    right: 30px;
  }

  .beak {
    position: absolute;
    width: 20px;
    height: 15px;
    background-color: #ff9900;
    border-radius: 50%;
    top: 60px;
    left: 40px;
    z-index: 3;
  }

  .arm {
    position: absolute;
    width: 30px;
    height: 80px;
    background-color: #000;
    border-radius: 30%;
    z-index: 0;
  }

  .arm.left {
    transform: rotate(35deg);
    top: 100px;
    left: 50px;
  }

  .arm.right {
    transform: rotate(-10deg);
    top: 100px;
    right: 50px;
    z-index: 3;
  }

  .heart {
    position: absolute;
    width: 30px;
    height: 30px;
    background-color: #ff3366;
    transform: rotate(45deg);
    top: -15px;
    right: -15px;
    animation: pulse 1.5s infinite;
  }

  .heart:before,
  .heart:after {
    content: "";
    position: absolute;
    width: 30px;
    height: 30px;
    background-color: #ff3366;
    border-radius: 50%;
  }

  .heart:before {
    top: -15px;
    left: 0;
  }

  .heart:after {
    top: 0;
    left: -15px;
  }

  .foot {
    position: absolute;
    width: 35px;
    height: 15px;
    background-color: #ff9900;
    border-radius: 50%;
    top: 240px;
    z-index: 0;
  }

  .foot.left {
    left: 85px;
  }

  .foot.right {
    right: 85px;
  }

  .name {
    font-family: "Comic Sans MS", cursive, sans-serif;
    font-size: 2.5rem;
    color: #ff3366;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    margin: 0;
    animation: bounce 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: rotate(45deg) scale(1);
    }
    50% {
      transform: rotate(45deg) scale(1.2);
    }
    100% {
      transform: rotate(45deg) scale(1);
    }
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>
