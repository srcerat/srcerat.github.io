/**
 * ===================================================================
 *  card.js — одна карточка мема в ленте
 * ===================================================================
 *  Умеет: показать картинку / гифку / видео / цветной блок,
 *  спрятать под NSFW-блюр, проигрывать видео при наведении мыши.
 *
 *    const card = SourceRat.card.create(meme, { onOpen });
 *    card.element  — готовый DOM-элемент
 *    card.ready    — Promise: выполнится, когда известен размер медиа
 *                    (лента ждёт его, чтобы поставить карточку в нужную колонку)
 * ===================================================================
 */
(function (SR) {
  'use strict';

  const { h } = SR;

  // Сколько максимум ждём загрузки размера медиа, прежде чем показать карточку
  const MEDIA_WAIT_MS = 10000;

  // Ширина автоматического превью (для картинок на Cloudinary)
  const THUMB_WIDTH = 800;
  const CLOUDINARY_UPLOAD = '/image/upload/';

  /**
   * Какую картинку показывать в ленте:
   *  1. thumb из config.js, если он указан;
   *  2. для ссылок Cloudinary — уменьшенная копия, которую Cloudinary делает сам;
   *  3. иначе — сама картинка (src).
   */
  function thumbnailUrl(meme) {
    const src = String(meme.src || '');
    if (meme.thumb) return meme.thumb;

    if (src.includes('res.cloudinary.com/') && src.includes(CLOUDINARY_UPLOAD)) {
      return src.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}w_${THUMB_WIDTH},c_limit,q_auto,f_auto/`);
    }
    return src;
  }

  /**
   * Картинка или видео внутри карточки (и бейдж в углу, если он нужен).
   * fallbackSrc — полная картинка на случай, если превью не загрузилось.
   */
  function createMedia(meme) {
    const title = meme.title || '';

    if (meme.type === 'placeholder') {
      const border = meme.borderColor || '#00e5ff';
      const height = meme.height || 180;
      const block = h('div', {
        class: 'placeholder-card',
        style: {
          backgroundColor: meme.color || '#081b22',
          color: meme.textColor || border,
          minHeight: `${height}px`,
          border: `1px dashed ${border}`,
        },
      },
        h('span', { class: 'placeholder-badge', style: { borderColor: border }, text: meme.badge || 'INSTANCE' }),
        h('div', { class: 'placeholder-title', text: title || 'BOX' }),
        h('div', { class: 'placeholder-size', text: `213 × ${height}px` }),
      );
      return { frame: block, media: null, fallbackSrc: null };
    }

    if (meme.type === 'video') {
      const video = h('video', {
        class: 'meme-media feed-video',
        src: meme.src,
        loop: true,
        muted: true,
        playsInline: true,
        preload: 'metadata',
      });
      const badge = h('span', { class: 'media-badge', text: meme.badge || '▶ CLIP' });
      return { frame: h('div', { class: 'media-frame' }, video, badge), media: video, fallbackSrc: null };
    }

    // Картинка и гифка. Для обычных картинок в ленте берём лёгкое превью,
    // полная версия (src) открывается только в лайтбоксе. Гифки не трогаем.
    const isGif = meme.type === 'gif';
    const feedSrc = isGif ? meme.src : thumbnailUrl(meme);
    const image = h('img', { class: 'meme-media', src: feedSrc, alt: title });
    const badgeText = isGif ? meme.badge || 'GIF' : meme.badge;
    const badge = badgeText ? h('span', { class: `media-badge${isGif ? ' is-gif' : ''}`, text: badgeText }) : null;

    return {
      frame: h('div', { class: 'media-frame' }, image, badge),
      media: image,
      fallbackSrc: feedSrc !== meme.src ? meme.src : null,
    };
  }

  /**
   * Promise, который выполняется, когда у картинки/видео известен размер (или случилась ошибка).
   * Если превью не загрузилось, сначала пробуем полную картинку (fallbackSrc).
   */
  function whenSized(media, fallbackSrc) {
    if (!media) return Promise.resolve();

    const isImage = media.tagName === 'IMG';
    if (isImage ? media.complete : media.readyState >= 1) return Promise.resolve();

    return new Promise((resolve) => {
      const finish = () => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(finish, MEDIA_WAIT_MS);

      media.addEventListener(isImage ? 'load' : 'loadedmetadata', finish, { once: true });
      media.addEventListener('error', () => {
        if (fallbackSrc && media.getAttribute('src') !== fallbackSrc) {
          media.src = fallbackSrc;
        } else {
          finish();
        }
      });
    });
  }

  function create(meme, { onOpen }) {
    const title = meme.title || '';
    const isOpenable = meme.type !== 'placeholder';

    const { frame, media, fallbackSrc } = createMedia(meme);
    const card = h('article', { class: 'meme-card' }, frame);

    // --- NSFW-спойлер ------------------------------------------------
    const isHidden = () => Boolean(meme.nsfw) && !card.classList.contains('is-revealed');

    if (meme.nsfw) {
      card.classList.add('is-nsfw');
      card.append(
        h('div', { class: 'nsfw-overlay', 'aria-hidden': 'true' },
          h('div', { class: 'nsfw-spoiler-pill', text: '[ спойлер ]' }),
          h('div', { class: 'nsfw-hint', text: 'нажмите, чтобы открыть' }),
        ),
        h('button', { class: 'reblur-btn', type: 'button', title: 'Скрыть обратно', text: '[ скрыть ]' }),
      );
    }

    // Подпись для скринридеров и клавиатурное управление
    function updateLabel() {
      card.setAttribute('aria-label', isHidden() ? `${title} (скрыто, нажмите, чтобы показать)` : title);
    }

    if (isOpenable) {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      updateLabel();
      card.addEventListener('keydown', (event) => {
        if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          card.click();
        }
      });
    }

    // --- Превью видео при наведении мыши ----------------------------
    const feedVideo = media && media.tagName === 'VIDEO' ? media : null;

    function stopPreview() {
      feedVideo.pause();
      feedVideo.currentTime = 0;
    }

    if (feedVideo) {
      card.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse' && !isHidden()) feedVideo.play().catch(() => {});
      });
      card.addEventListener('pointerleave', stopPreview);
    }

    // --- Клик --------------------------------------------------------
    card.addEventListener('click', (event) => {
      if (event.target.closest('.reblur-btn')) {
        card.classList.remove('is-revealed');
        updateLabel();
        if (feedVideo) stopPreview();
        return;
      }

      if (isHidden()) {
        card.classList.add('is-revealed');
        updateLabel();
        return;
      }

      if (!isOpenable) return;

      if (feedVideo) stopPreview();
      // detail === 0 значит, что «клик» сделан с клавиатуры (Enter / пробел)
      onOpen(meme, { opener: event.detail === 0 ? card : null });
    });

    return { element: card, ready: whenSized(media, fallbackSrc) };
  }

  SR.card = { create };
})(window.SourceRat);
