/**
 * ===================================================================
 *  main.js — запуск сайта
 * ===================================================================
 *  Берёт настройки из config.js, добавляет значения по умолчанию
 *  для того, что в config.js не указано, и запускает части сайта.
 * ===================================================================
 */
(function (SR) {
  'use strict';

  // Что используется, если в config.js этого нет
  const DEFAULTS = {
    profile: {
      nickname: 'Source_Rat',
      avatar: 'assets/model.png',
      subtitles: [],
      timezoneLabel: 'GMT+2',
      timezoneOffset: 2,
      useVisitorLocalTime: false,
      headerTitle: '~/srcerat\\~',
    },
    about: { description: [] },
    socialLinks: [],
    memes: [],
    settings: {
      itemsPerBatch: 6,
      borderWidth: '1px',
      dividerWidth: '1px',
      borderColor: '#262626',
      dividerColor: '#262626',
    },
  };

  function resolveConfig(userConfig) {
    const merged = { ...DEFAULTS };
    for (const section of ['profile', 'about', 'settings']) {
      merged[section] = { ...DEFAULTS[section], ...userConfig[section] };
    }
    for (const list of ['socialLinks', 'memes']) {
      merged[list] = Array.isArray(userConfig[list]) ? userConfig[list] : DEFAULTS[list];
    }

    // Защита от неверных значений в config.js
    const { profile, about, settings } = merged;
    profile.timezoneOffset = Number(profile.timezoneOffset);
    if (!Number.isFinite(profile.timezoneOffset)) profile.timezoneOffset = DEFAULTS.profile.timezoneOffset;
    if (!Array.isArray(profile.subtitles)) profile.subtitles = [];
    if (!Array.isArray(about.description)) about.description = [];
    if (!(settings.itemsPerBatch >= 1)) settings.itemsPerBatch = DEFAULTS.settings.itemsPerBatch;

    return merged;
  }

  function openMeme(meme, options) {
    if (meme.type === 'video') SR.player.open(meme, options);
    else SR.lightbox.open(meme, options);
  }

  if (!window.SITE_CONFIG) {
    console.error('Не найден config.js — сайт покажет только значения по умолчанию.');
  }

  const config = resolveConfig(window.SITE_CONFIG || {});

  SR.profile.init(config);
  SR.feed.init({
    memes: config.memes,
    batchSize: config.settings.itemsPerBatch,
    onOpen: openMeme,
  });
})(window.SourceRat);
