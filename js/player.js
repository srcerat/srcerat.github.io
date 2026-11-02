/**
 * ===================================================================
 *  player.js — видеоплеер в стиле Chatterino / Twitch Clips
 * ===================================================================
 *  Клавиши:  Пробел / K — пауза      M — звук        F — полный экран
 *            L — повтор              ← → — перемотка на 5 сек
 *            ↑ ↓ — громкость         Esc — закрыть
 *  (буквы работают и в русской раскладке)
 *
 *    SourceRat.player.open(meme, { opener })
 * ===================================================================
 */
(function (SR) {
  'use strict';

  const { h, clamp, formatTime, isKey, fullscreen, modal } = SR;

  const SPEEDS = [1, 1.25, 1.5, 2, 0.5, 0.75];   // порядок переключения скорости
  const SEEK_STEP = 5;                           // секунд на стрелку ← →
  const VOLUME_STEP = 0.1;                       // на стрелку ↑ ↓
  const HIDE_CONTROLS_AFTER = 2800;              // мс бездействия в полном экране

  const formatSpeed = (speed) => `${Number.isInteger(speed) ? speed.toFixed(1) : speed}x`;

  /**
   * Горизонтальный ползунок (перемотка и громкость). Работает и мышью, и пальцем.
   * onChange получает позицию от 0 до 1.
   */
  function makeSlider(element, onChange, { onStart, onEnd } = {}) {
    let active = false;

    const positionOf = (event) => {
      const rect = element.getBoundingClientRect();
      return clamp((event.clientX - rect.left) / rect.width, 0, 1);
    };

    element.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      active = true;
      element.setPointerCapture(event.pointerId);
      if (onStart) onStart();
      onChange(positionOf(event));
    });

    element.addEventListener('pointermove', (event) => {
      if (active) onChange(positionOf(event));
    });

    const end = () => {
      if (!active) return;
      active = false;
      if (onEnd) onEnd();
    };
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
  }

  function open(meme, { opener } = {}) {
    const title = meme.title || 'Видеоклип';

    // --- Разметка ----------------------------------------------------
    const video = h('video', { class: 'cp-video', src: meme.src, preload: 'auto', playsInline: true });
    const bigPlay = h('div', { class: 'cp-big-play', hidden: true }, h('span', { class: 'cp-big-play-icon', text: '▶' }));
    const screen = h('div', { class: 'cp-screen' }, video, bigPlay);

    const progressFilled = h('div', { class: 'cp-progress-filled' });
    const progressThumb = h('div', { class: 'cp-progress-thumb' });
    const timeBubble = h('div', { class: 'cp-time-bubble', text: '00:00' });
    const progressArea = h('div', { class: 'cp-progress-area' },
      h('div', { class: 'cp-progress-track' }, progressFilled, progressThumb),
      timeBubble,
    );

    const controlButton = (className, label, ...children) =>
      h('button', { class: `cp-ctrl-btn ${className}`, type: 'button', title: label, 'aria-label': label }, ...children);

    const playIcon = h('span', { class: 'cp-btn-icon', text: '❚❚' });
    const playButton = controlButton('cp-play-toggle', 'Воспроизведение/Пауза (Space / K)', playIcon);

    const muteIcon = h('span', { class: 'cp-btn-icon', text: '🔊' });
    const muteButton = controlButton('cp-mute-toggle', 'Звук (M)', muteIcon);
    const volumeFilled = h('div', { class: 'cp-vol-filled' });
    const volumeSlider = h('div', { class: 'cp-vol-slider', title: 'Громкость' },
      h('div', { class: 'cp-vol-track' }, volumeFilled),
    );

    const timeCurrent = h('span', { text: '00:00' });
    const timeDuration = h('span', { text: '00:00' });

    const loopButton = controlButton('cp-loop-toggle active', 'Повтор (L)', h('span', { class: 'cp-btn-label', text: '🔁 LOOP' }));
    const speedLabel = h('span', { class: 'cp-btn-label', text: formatSpeed(SPEEDS[0]) });
    const speedButton = controlButton('cp-speed-toggle', 'Скорость воспроизведения', speedLabel);
    const fullscreenIcon = h('span', { class: 'cp-btn-icon', text: '⛶' });
    const fullscreenButton = controlButton('cp-fs-toggle', 'Полный экран (F)', fullscreenIcon);

    const root = h('div', { class: 'cp-player' },
      h('div', { class: 'cp-header' },
        h('div', { class: 'cp-title-group' },
          meme.badge ? h('span', { class: 'cp-badge', text: meme.badge }) : null,
          h('span', { class: 'cp-title', text: title }),
        ),
        h('button', { class: 'cp-top-btn cp-close-btn', type: 'button', title: 'Закрыть (Esc)', 'aria-label': 'Закрыть (Esc)', text: '✕', onclick: modal.close }),
      ),
      screen,
      h('div', { class: 'cp-controls-bar' },
        progressArea,
        h('div', { class: 'cp-controls-row' },
          h('div', { class: 'cp-ctrl-left' },
            playButton,
            h('div', { class: 'cp-vol-container' }, muteButton, volumeSlider),
            h('div', { class: 'cp-time-display' }, timeCurrent, h('span', { class: 'cp-time-sep', text: '/' }), timeDuration),
          ),
          h('div', { class: 'cp-ctrl-right' }, loopButton, speedButton, fullscreenButton),
        ),
      ),
    );

    video.loop = true;
    video.volume = 1;

    // --- Воспроизведение ---------------------------------------------
    function togglePlay() {
      if (video.paused || video.ended) video.play().catch(() => {});
      else video.pause();
    }

    function renderPlayState() {
      playIcon.textContent = video.paused ? '▶' : '❚❚';
      bigPlay.hidden = !video.paused;
    }

    video.addEventListener('play', renderPlayState);
    video.addEventListener('pause', renderPlayState);
    playButton.addEventListener('click', togglePlay);
    screen.addEventListener('click', togglePlay);

    function toggleLoop() {
      video.loop = !video.loop;
      loopButton.classList.toggle('active', video.loop);
    }
    loopButton.addEventListener('click', toggleLoop);

    let speedIndex = 0;
    speedButton.addEventListener('click', () => {
      speedIndex = (speedIndex + 1) % SPEEDS.length;
      video.playbackRate = SPEEDS[speedIndex];
      speedLabel.textContent = formatSpeed(SPEEDS[speedIndex]);
    });

    // --- Перемотка ---------------------------------------------------
    let scrubbing = false;   // пока тянем ползунок, не двигаем его «вручную» по timeupdate

    function renderProgress(fraction) {
      const percent = `${fraction * 100}%`;
      progressFilled.style.width = percent;
      progressThumb.style.left = percent;
    }

    function seekToFraction(fraction) {
      if (!Number.isFinite(video.duration)) return;
      video.currentTime = fraction * video.duration;
      renderProgress(fraction);
      timeCurrent.textContent = formatTime(video.currentTime);
    }

    function seekBy(seconds) {
      if (!Number.isFinite(video.duration)) return;
      video.currentTime = clamp(video.currentTime + seconds, 0, video.duration);
    }

    video.addEventListener('loadedmetadata', () => {
      timeDuration.textContent = formatTime(video.duration);
    });

    video.addEventListener('timeupdate', () => {
      if (scrubbing || !video.duration) return;
      renderProgress(video.currentTime / video.duration);
      timeCurrent.textContent = formatTime(video.currentTime);
    });

    makeSlider(progressArea, seekToFraction, {
      onStart: () => { scrubbing = true; },
      onEnd: () => { scrubbing = false; },
    });

    // Подсказка со временем над курсором
    progressArea.addEventListener('pointermove', (event) => {
      const rect = progressArea.getBoundingClientRect();
      const fraction = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      timeBubble.textContent = formatTime(fraction * (video.duration || 0));
      timeBubble.style.left = `${fraction * 100}%`;
    });

    // --- Громкость ---------------------------------------------------
    function renderVolume() {
      const silent = video.muted || video.volume === 0;
      muteIcon.textContent = silent ? '🔇' : '🔊';
      volumeFilled.style.width = silent ? '0%' : `${video.volume * 100}%`;
    }

    function toggleMute() {
      video.muted = !video.muted;
      renderVolume();
    }

    function changeVolume(delta) {
      video.volume = clamp(video.volume + delta, 0, 1);
      if (delta > 0) video.muted = false;
      renderVolume();
    }

    muteButton.addEventListener('click', toggleMute);

    makeSlider(volumeSlider, (fraction) => {
      video.volume = fraction;
      video.muted = fraction === 0;
      renderVolume();
    });

    // --- Полный экран ------------------------------------------------
    const isFullscreen = () => fullscreen.element() === root;

    function toggleFullscreen() {
      if (fullscreen.element()) {
        fullscreen.exit();
      } else {
        // На iPhone полный экран возможен только у самого <video>
        fullscreen.request(root).catch(() => {
          if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        });
      }
    }

    fullscreenButton.addEventListener('click', toggleFullscreen);
    screen.addEventListener('dblclick', toggleFullscreen);

    // В полном экране панели прячутся, если мышь давно не двигалась
    let hideTimer = null;

    function showControls() {
      root.classList.remove('cp-controls-hidden');
      clearTimeout(hideTimer);
      if (isFullscreen() && !video.paused) {
        hideTimer = setTimeout(() => root.classList.add('cp-controls-hidden'), HIDE_CONTROLS_AFTER);
      }
    }

    root.addEventListener('pointermove', showControls);
    video.addEventListener('play', showControls);
    video.addEventListener('pause', showControls);

    const stopWatchingFullscreen = fullscreen.onChange(() => {
      const active = isFullscreen();
      root.classList.toggle('is-fullscreen', active);
      fullscreenIcon.textContent = active ? '🗗' : '⛶';
      fullscreenButton.title = active ? 'Оконный режим (F)' : 'Полный экран (F)';
      showControls();
    });

    // --- Клавиши (их присылает modal.js) -----------------------------
    function onKey(event) {
      if (event.code === 'Space' || isKey(event, 'k')) {
        event.preventDefault();
        togglePlay();
      } else if (isKey(event, 'm')) {
        toggleMute();
      } else if (isKey(event, 'f')) {
        event.preventDefault();
        toggleFullscreen();
      } else if (isKey(event, 'l')) {
        toggleLoop();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seekBy(-SEEK_STEP);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        seekBy(SEEK_STEP);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        changeVolume(VOLUME_STEP);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        changeVolume(-VOLUME_STEP);
      }
    }

    function onClose() {
      clearTimeout(hideTimer);
      stopWatchingFullscreen();
      if (fullscreen.element()) fullscreen.exit();
      // Полностью освобождаем видео, чтобы браузер выключил декодер
      video.pause();
      video.removeAttribute('src');
      video.load();
    }

    // --- Запуск ------------------------------------------------------
    modal.open(root, { label: title, onKey, onClose, opener });

    // Сначала пробуем со звуком, если браузер не разрешил — без звука
    video.play().catch(() => {
      video.muted = true;
      renderVolume();
      video.play().catch(() => {});
    });
    renderPlayState();
  }

  SR.player = { open };
})(window.SourceRat);
