
(() => {
  'use strict';

  if (document.getElementById('sdRemoteLoading')) return;

  const screen = document.createElement('div');
  screen.id = 'sdRemoteLoading';

  screen.innerHTML = `
    <img
      id="sdLoadingImage"
      src="https://alex-ali119.github.io/stick-duel/remote-updates/stickman-battle-logo.png"
      alt="Loading"
    >
    <div class="sd-load-area">
      <div class="sd-load-track">
        <div id="sdLoadProgress"></div>
      </div>
      <div id="sdLoadPercent">0%</div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #sdRemoteLoading {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      background: #160d24;
      overflow: hidden;
    }

    #sdLoadingImage {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .sd-load-area {
      position: absolute;
      left: 15%;
      right: 15%;
      bottom: 8%;
      z-index: 2;
      text-align: center;
    }

    .sd-load-track {
      height: 14px;
      background: #ffffff66;
      border: 2px solid white;
      border-radius: 20px;
      overflow: hidden;
    }

    #sdLoadProgress {
      width: 0%;
      height: 100%;
      background: #00eaff;
      border-radius: 20px;
    }

    #sdLoadPercent {
      color: white;
      font-size: 20px;
      font-weight: bold;
      margin-top: 8px;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(screen);

  const progress = document.getElementById('sdLoadProgress');
  const percent = document.getElementById('sdLoadPercent');
  const start = performance.now();

  function update(now) {
    const value = Math.min((now - start) / 5000 * 100, 100);

    progress.style.width = value + '%';
    percent.textContent = Math.floor(value) + '%';

    if (value < 100) {
      requestAnimationFrame(update);
    } else {
      screen.remove();
      style.remove();
    }
  }

  requestAnimationFrame(update);
})();
