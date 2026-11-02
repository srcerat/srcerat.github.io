/**
 * ===================================================================
 *  modal.js — тёмная подложка, в которой открываются картинки и видео
 * ===================================================================
 *  Одновременно открыто не больше одного окна.
 *
 *    SourceRat.modal.open(элемент, { label, onKey, onClose, opener })
 *    SourceRat.modal.close()
 *
 *  Закрывается: клавишей Esc, кликом по тёмному фону, вызовом close().
 *  Остальные клавиши модуль передаёт окну через onKey, поэтому
 *  на всю страницу вешается один обработчик клавиатуры, а не по одному
 *  на каждое открытие.
 * ===================================================================
 */
(function (SR) {
  'use strict';

  const overlay = SR.$('#lightbox');
  const page = SR.$('main');

  let current = null;          // { content, onKey, onClose, opener }
  let pressedOnBackdrop = false;

  function open(content, { label = '', onKey, onClose, opener } = {}) {
    close();

    overlay.setAttribute('aria-label', label);
    overlay.append(content);
    overlay.classList.add('active');
    page.inert = true;         // фон страницы недоступен для Tab и скринридеров
    overlay.focus({ preventScroll: true });

    current = { content, onKey, onClose, opener };
  }

  function close() {
    if (!current) return;

    const { content, onClose, opener } = current;
    current = null;

    if (onClose) onClose();
    content.remove();
    overlay.classList.remove('active');
    page.inert = false;

    // Возвращаем фокус на карточку, только если окно открыли с клавиатуры
    if (opener) opener.focus({ preventScroll: true });
  }

  // Клик по тёмному фону закрывает окно. Проверяем и нажатие, и отпускание:
  // иначе, если зажать кнопку на картинке и отпустить на фоне, окно закроется само.
  overlay.addEventListener('pointerdown', (event) => {
    pressedOnBackdrop = event.target === overlay;
  });

  overlay.addEventListener('click', (event) => {
    if (pressedOnBackdrop && event.target === overlay) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!current) return;

    if (event.key === 'Escape') {
      close();
      return;
    }

    // Ctrl+F, Ctrl+0 и подобные оставляем браузеру
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (current.onKey) current.onKey(event);
  });

  // Пробел на кнопке срабатывает при отпускании клавиши. Если пробел у нас
  // уже означает «пауза», не даём ему заодно «нажать» сфокусированную кнопку.
  document.addEventListener('keyup', (event) => {
    if (current && event.code === 'Space') event.preventDefault();
  });

  SR.modal = { open, close };
})(window.SourceRat);
