<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Wide Monitor game-comforter</title>
  <style>
    body {
      margin: 0;
      background: #888;
      overflow: hidden;
      font-family: 'Segoe UI', sans-serif;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      transition: transform 1s ease, opacity 1s ease;
    }

    h1 {
      margin-bottom: 30px;
      color: #222;
      font-size: 32px;
      transition: transform 1s ease, opacity 1s ease;
    }

    .red-button {
      background: radial-gradient(circle at 30% 30%, #ff4d4d, #b30000);
      border: none;
      box-shadow: 0 4px 0 #800000, 0 8px 15px rgba(0, 0, 0, 0.4);
      color: white;
      padding: 25px 60px;
      font-size: 24px;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.3s ease;
      position: relative;
    }

    .red-button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 0 #800000, 0 12px 20px rgba(255, 0, 0, 0.6);
    }

    .switches {
      margin-top: 40px;
      display: flex;
      gap: 30px;
      transition: transform 1s ease, opacity 1s ease;
    }

    .switch {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #fff;
    }

    .toggle {
      position: relative;
      width: 60px;
      height: 30px;
      background: #ccc;
      border-radius: 15px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .toggle input {
      display: none;
    }

    .toggle-slider {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 0 5px rgba(0,0,0,0.2);
    }

    .toggle input:checked + .toggle-slider {
      transform: translateX(30px);
      background: #4caf50;
    }

    .fog-line {
      position: fixed;
      width: 50px;
      height: 100%;
      top: 0;
      z-index: 20;
      opacity: 0;
      transition: opacity 1s ease;
      pointer-events: none;
      backdrop-filter: blur(10px);
      mix-blend-mode: lighten;
      animation: fogColorCycle 10s infinite alternate ease-in-out, fogFloat 6s infinite ease-in-out;
    }

    .fog-line.left {
      left: 0;
    }

    .fog-line.right {
      right: 0;
    }

    @keyframes fogColorCycle {
      0% {
        background: linear-gradient(to bottom, rgba(255, 0, 0, 0.2), rgba(0, 0, 255, 0.2));
      }
      50% {
        background: linear-gradient(to bottom, rgba(0, 255, 0, 0.2), rgba(0, 255, 255, 0.2));
      }
      100% {
        background: linear-gradient(to bottom, rgba(255, 0, 255, 0.2), rgba(255, 255, 0, 0.2));
      }
    }

    @keyframes fogFloat {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }

    #overlay {
      position: fixed;
      background: rgba(0, 0, 0, 1);
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      display: none;
      opacity: 0;
      transition: opacity 1s ease;
    }

    #overlay.active {
      display: block;
      opacity: 1;
    }

    .fade-out {
      opacity: 0;
      transform: translateY(-100px);
    }

    .color-picker {
      margin-top: 8px;
      display: flex;
      gap: 5px;
    }
  </style>
</head>
<body>

<div class="container" id="homeUI">
  <h1 id="title">Wide Monitor game-comforter</h1>

  <button class="red-button" id="startButton"></button>

  <div class="switches" id="switchGroup">
    <div class="switch">
      <label>Gradient Fog Glow</label>
      <label class="toggle">
        <input type="checkbox" id="fogToggle">
        <span class="toggle-slider"></span>
      </label>
      <div class="color-picker">
        <input type="color" id="colorStart" value="#ff0000" />
        <input type="color" id="colorEnd" value="#0000ff" />
      </div>
    </div>
  </div>
</div>

<div class="fog-line left" id="fogLeft"></div>
<div class="fog-line right" id="fogRight"></div>

<div id="overlay"></div>

<script>
  const startBtn = document.getElementById('startButton');
  const homeUI = document.getElementById('homeUI');
  const overlay = document.getElementById('overlay');
  const fogToggle = document.getElementById('fogToggle');
  const fogLeft = document.getElementById('fogLeft');
  const fogRight = document.getElementById('fogRight');
  const colorStart = document.getElementById('colorStart');
  const colorEnd = document.getElementById('colorEnd');

  let clickCount = 0;
  let clickTimer = null;

  function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  }

  function startComfortMode() {
    // Slide UI out with animation
    document.getElementById("title").classList.add("fade-out");
    document.getElementById("switchGroup").classList.add("fade-out");
    startBtn.classList.add("fade-out");

    setTimeout(() => {
      homeUI.style.transform = 'translateY(-100vh)';
      homeUI.style.opacity = '0';
      overlay.classList.add('active');
    }, 700);

    if (fogToggle.checked) {
      fogLeft.style.opacity = '1';
      fogRight.style.opacity = '1';
    }

    enterFullscreen();
  }

  function resetUI() {
    overlay.classList.remove('active');
    homeUI.style.transform = 'translateY(0)';
    homeUI.style.opacity = '1';

    // Reset UI fade-out
    document.getElementById("title").classList.remove("fade-out");
    document.getElementById("switchGroup").classList.remove("fade-out");
    startBtn.classList.remove("fade-out");

    fogLeft.style.opacity = '0';
    fogRight.style.opacity = '0';
  }

  function handleTripleClick() {
    clickCount++;
    if (clickTimer) clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
      if (clickCount >= 3) {
        resetUI();
      }
      clickCount = 0;
    }, 400);
  }

  startBtn.addEventListener('click', startComfortMode);
  document.addEventListener('click', handleTripleClick);
</script>

</body>
</html>
