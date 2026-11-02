/**
 * ===================================================================
 *  lightbox.js — просмотр картинки и гифки с зумом
 * ===================================================================
 *  Управление:
 *    колесо мыши — зум          двойной клик — 2.5x / сброс
 *    перетаскивание — сдвиг     + / − / 0 — зум с клавиатуры, F — полный экран
 *
 *    SourceRat.lightbox.open(meme, { opener })
 * ===================================================================
 */
(function (SR) {
  'use strict';

  const { h, clamp, isKey, fullscreen, modal } = SR;

  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 6;
  const ZOOM_BUTTON_STEP = 0.35;   // кнопки + / − и клавиши
  const ZOOM_WHEEL_STEP = 0.25;    // одно «щёлканье» колеса
  const ZOOM_BIG = 4;              // кнопка «4x»
  const ZOOM_DOUBLE_CLICK = 2.5;   // двойной клик
  const ZOOMED_THRESHOLD = 1.05;   // выше этого значения картинку можно двигать

  function open(meme, { opener } = {}) {
    const title = meme.title || '';

    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let drag = null;               // { x, y, panX, panY } пока кнопка зажата

    // --- Разметка ----------------------------------------------------
    const zoomValue = h('span', { class: 'lz-zoom-val', text: '100%' });
    const image = h('img', { class: 'lightbox-img-canvas', src: meme.src, alt: title, draggable: 'false' });
    const viewport = h('div', { class: 'lightbox-viewport' }, image);
    const dimensions = h('span', { text: 'Загрузка...' });

    const button = (text, label, onClick) =>
      h('button', { class: 'lz-btn', type: 'button', title: label, 'aria-label': label, text, onclick: onClick });

    const content = h('div', { class: 'lightbox-content' },
      h('div', { class: 'lightbox-zoom-bar' },
        h('div', { class: 'lz-title', text: title || 'Изображение' }),
        h('div', { class: 'lz-controls' },
          button('−', 'Отдалить (-)', () => setZoom(zoom - ZOOM_BUTTON_STEP)),
          zoomValue,
          button('+', 'Приблизить (+)', () => setZoom(zoom + ZOOM_BUTTON_STEP)),
          button('4x', 'Максимальный зум (400%)', () => setZoom(zoom < ZOOM_BIG - 0.2 ? ZOOM_BIG : 1)),
          button('↺ СБРОС', 'Сбросить (0)', () => setZoom(1)),
          button('⛶', 'Полный экран (F)', toggleFullscreen),
          h('button', { class: 'lightbox-close', type: 'button', title: 'Закрыть (Esc)', 'aria-label': 'Закрыть (Esc)', text: '✕', onclick: modal.close }),
        ),
      ),
      viewport,
      h('div', { class: 'lightbox-caption' },
        dimensions,
        h('span', { text: '[ колесико: зум / перетаскивание / двойной клик ]' }),
      ),
    );

    // --- Зум и сдвиг -------------------------------------------------
    function render() {
      image.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
      zoomValue.textContent = `${Math.round(zoom * 100)}%`;
      viewport.classList.toggle('is-zoomed', zoom > ZOOMED_THRESHOLD);
    }

    function setZoom(value) {
      zoom = clamp(value, ZOOM_MIN, ZOOM_MAX);
      if (zoom <= ZOOMED_THRESHOLD) {
        panX = 0;
        panY = 0;
      }
      render();
    }

    function toggleFullscreen() {
      if (fullscreen.element()) fullscreen.exit();
      else fullscreen.request(content).catch(() => {});
    }

    viewport.addEventListener('wheel', (event) => {
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? ZOOM_WHEEL_STEP : -ZOOM_WHEEL_STEP));
    }, { passive: false });

    viewport.addEventListener('dblclick', (event) => {
      event.preventDefault();
      setZoom(zoom > ZOOMED_THRESHOLD ? 1 : ZOOM_DOUBLE_CLICK);
    });

    // Перетаскивание. setPointerCapture «приклеивает» мышь/палец к области,
    // поэтому движение отслеживается даже за её пределами.
    viewport.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || zoom <= ZOOMED_THRESHOLD) return;
      drag = { x: event.clientX, y: event.clientY, panX, panY };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
    });

    viewport.addEventListener('pointermove', (event) => {
      if (!drag) return;
      panX = drag.panX + (event.clientX - drag.x);
      panY = drag.panY + (event.clientY - drag.y);
      render();
    });

    const endDrag = () => {
      drag = null;
      viewport.classList.remove('is-dragging');
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // --- Размер картинки в подписи -----------------------------------
    const showDimensions = () => {
      dimensions.textContent = `${image.naturalWidth} × ${image.naturalHeight}px`;
    };
    if (image.complete && image.naturalWidth) showDimensions();
    image.addEventListener('load', showDimensions);
    image.addEventListener('error', () => { dimensions.textContent = 'Не удалось загрузить'; });

    // --- Клавиши (их присылает modal.js) -----------------------------
    function onKey(event) {
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        setZoom(zoom + ZOOM_BUTTON_STEP);
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        setZoom(zoom - ZOOM_BUTTON_STEP);
      } else if (event.key === '0') {
        event.preventDefault();
        setZoom(1);
      } else if (isKey(event, 'f')) {
        event.preventDefault();
        toggleFullscreen();
      }
    }

    function onClose() {
      if (fullscreen.element() === content) fullscreen.exit();
    }

    modal.open(content, { label: title || 'Изображение', onKey, onClose, opener });
  }

  SR.lightbox = { open };
})(window.SourceRat);
