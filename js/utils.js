/**
 * ===================================================================
 *  utils.js — маленькие помощники, которыми пользуются остальные файлы
 * ===================================================================
 *  Все файлы сайта кладут свои функции в один общий объект SourceRat,
 *  поэтому порядок подключения в index.html важен.
 * ===================================================================
 */
(function (SR) {
  'use strict';

  /** Короткая замена document.querySelector. */
  const $ = (selector, root = document) => root.querySelector(selector);

  /**
   * Создаёт HTML-элемент. Пример:
   *   h('button', { class: 'btn', text: 'OK', onclick: save }, дочерний1, дочерний2)
   *
   * Текст вставляется через textContent, поэтому ломать разметку
   * (и экранировать спецсимволы) не нужно.
   *
   * Особые ключи: class, text, style (объект), on<событие> (функция).
   * true/false для свойств вроде hidden, muted, loop ставятся как свойства.
   */
  function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);

    for (const [key, value] of Object.entries(attrs)) {
      if (value == null) continue;

      if (key === 'class') {
        node.className = value;
      } else if (key === 'text') {
        node.textContent = value;
      } else if (key === 'style') {
        Object.assign(node.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        node.addEventListener(key.slice(2), value);
      } else if (typeof value === 'boolean') {
        if (key in node) node[key] = value;
        else if (value) node.setAttribute(key, '');
      } else {
        node.setAttribute(key, value);
      }
    }

    node.append(...children.filter((child) => child != null && child !== false));
    return node;
  }

  /** Ограничивает число рамками [min, max]. */
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /** 75 → "01:15". Если время неизвестно — "00:00". */
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '00:00';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(Math.floor(seconds / 60))}:${pad(Math.floor(seconds % 60))}`;
  }

  /**
   * Проверяет, нажата ли клавиша-буква, независимо от раскладки:
   * isKey(event, 'm') срабатывает и на латинскую M, и на русскую «ь».
   */
  function isKey(event, letter) {
    return (event.key || '').toLowerCase() === letter ||
           event.code === 'Key' + letter.toUpperCase();
  }

  /** Полноэкранный режим (с запасным вариантом для старого Safari). */
  const fullscreen = {
    element() {
      return document.fullscreenElement || document.webkitFullscreenElement || null;
    },
    request(element) {
      const fn = element.requestFullscreen || element.webkitRequestFullscreen;
      return fn ? Promise.resolve(fn.call(element)) : Promise.reject(new Error('Fullscreen API не поддерживается'));
    },
    exit() {
      const fn = document.exitFullscreen || document.webkitExitFullscreen;
      return fn ? Promise.resolve(fn.call(document)).catch(() => {}) : Promise.resolve();
    },
    /** Подписка на вход/выход из полного экрана. Возвращает функцию отписки. */
    onChange(handler) {
      document.addEventListener('fullscreenchange', handler);
      document.addEventListener('webkitfullscreenchange', handler);
      return () => {
        document.removeEventListener('fullscreenchange', handler);
        document.removeEventListener('webkitfullscreenchange', handler);
      };
    },
  };

  SR.$ = $;
  SR.h = h;
  SR.clamp = clamp;
  SR.formatTime = formatTime;
  SR.isKey = isKey;
  SR.fullscreen = fullscreen;
})(window.SourceRat = window.SourceRat || {});
