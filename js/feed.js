/**
 * ===================================================================
 *  feed.js — лента мемов: колонки (masonry) и бесконечный скролл
 * ===================================================================
 *  • Мемы показываются пачками (config.js → settings.itemsPerBatch).
 *    Следующая пачка подгружается, когда пользователь доскроллил до конца.
 *  • Колонок три. Каждая карточка ставится в самую короткую колонку.
 *    Чтобы высота была настоящей, карточка появляется только после того,
 *    как загрузился размер её картинки/видео. Порядок мемов при этом
 *    сохраняется: следующая карточка ждёт предыдущую.
 *
 *    SourceRat.feed.init({ memes, batchSize, onOpen })
 * ===================================================================
 */
(function (SR) {
  'use strict';

  const { $ } = SR;

  function init({ memes, batchSize, onOpen }) {
    const columns = [...document.querySelectorAll('#masonry-container .masonry-col')];
    const sentinel = $('#feed-sentinel');
    const loader = $('#feed-loader');
    const endBadge = $('#feed-end');
    const backToTop = $('#btn-back-to-top');

    let renderedCount = 0;
    let isLoading = false;
    let observer = null;

    function shortestColumn() {
      return columns.reduce((shortest, column) =>
        column.offsetHeight < shortest.offsetHeight ? column : shortest);
    }

    /** Создаёт карточки пачки и по очереди ставит их в колонки. */
    async function renderBatch(batch) {
      const cards = batch.map((meme) => SR.card.create(meme, { onOpen }));

      for (const [index, card] of cards.entries()) {
        await card.ready;
        card.element.style.setProperty('--i', index);
        shortestColumn().append(card.element);
      }
    }

    function finish() {
      loader.hidden = true;
      endBadge.hidden = false;
      if (observer) observer.disconnect();
    }

    async function loadNextBatch() {
      if (isLoading || renderedCount >= memes.length) return;
      isLoading = true;

      const batch = memes.slice(renderedCount, renderedCount + batchSize);
      try {
        await renderBatch(batch);
      } finally {
        // Даже если один мем сломан (например, ошибка в config.js), лента не зависает
        renderedCount += batch.length;
        isLoading = false;
      }

      if (renderedCount >= memes.length) {
        finish();
      } else if (observer) {
        // Если маяк всё ещё на экране (экран большой, пачка маленькая),
        // повторная подписка заставит браузер сразу вызвать подгрузку ещё раз
        observer.unobserve(sentinel);
        observer.observe(sentinel);
      }
    }

    backToTop.addEventListener('click', () => window.scrollTo({ top: 0 }));

    if (memes.length === 0) {
      finish();
      return;
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadNextBatch();
      }, { rootMargin: '300px' });
      observer.observe(sentinel);
    } else {
      // Совсем старый браузер: показываем всё сразу
      (async function loadAll() {
        while (renderedCount < memes.length) await loadNextBatch();
      })();
    }
  }

  SR.feed = { init };
})(window.SourceRat);
