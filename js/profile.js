/**
 * ===================================================================
 *  profile.js — верх страницы: ник, подписи, часы, кнопки соцсетей
 * ===================================================================
 *  Все данные берутся из config.js. Тут ничего менять не нужно.
 * ===================================================================
 */
(function (SR) {
  'use strict';

  const { $, h } = SR;

  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;

  /** Заполняет блок строками: каждая строка — отдельный <div>. */
  function renderLines(container, lines) {
    container.replaceChildren(...lines.map((line) => h('div', { text: line })));
  }

  /** Часы: показывают время в указанном часовом поясе (или местное время посетителя). */
  function startClock({ timezoneLabel, timezoneOffset, useVisitorLocalTime }) {
    const timeElement = $('#clock-time');
    $('#clock-tz').textContent = timezoneLabel;

    const pad = (n) => String(n).padStart(2, '0');

    function render() {
      let hours;
      let minutes;

      if (useVisitorLocalTime) {
        const now = new Date();
        hours = now.getHours();
        minutes = now.getMinutes();
      } else {
        // Сдвигаем время на нужное число часов и читаем его как UTC
        const shifted = new Date(Date.now() + timezoneOffset * HOUR);
        hours = shifted.getUTCHours();
        minutes = shifted.getUTCMinutes();
      }

      timeElement.textContent = `${pad(hours)}:${pad(minutes)}`;
    }

    // Обновляем раз в минуту, ровно на её границе
    function scheduleNextTick() {
      setTimeout(() => {
        render();
        scheduleNextTick();
      }, MINUTE - (Date.now() % MINUTE) + 50);
    }

    render();
    scheduleNextTick();

    // Вкладка в фоне может «проспать» таймер — при возврате обновляем сразу
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) render();
    });
  }

  function renderSocialLinks(links) {
    $('#social-buttons').replaceChildren(...links.map((link) =>
      h('a', {
        class: 'tui-btn wipe-btn',
        href: link.url || '#',
        target: '_blank',
        rel: 'noopener noreferrer',
      }, link.name || 'link', h('span', { class: 'btn-arrow', text: link.icon || '↗' }))
    ));
  }

  /** Толщина и цвет рамок из config.js → settings превращаются в CSS-переменные. */
  function applyBorderSettings(settings) {
    const variables = {
      '--tui-border-width': settings.borderWidth,
      '--tui-divider-width': settings.dividerWidth,
      '--tui-border-color': settings.borderColor,
      '--tui-divider-color': settings.dividerColor,
    };
    for (const [name, value] of Object.entries(variables)) {
      if (value) document.documentElement.style.setProperty(name, value);
    }
  }

  function init(config) {
    const { profile, about, socialLinks, settings } = config;

    $('#header-path').textContent = profile.headerTitle;
    $('#profile-nickname').textContent = profile.nickname;
    renderLines($('#profile-subtitles'), profile.subtitles);
    renderLines($('#bio-description'), about.description);

    const avatar = $('#profile-avatar');
    avatar.alt = `Аватар ${profile.nickname}`;
    if (profile.avatar && avatar.getAttribute('src') !== profile.avatar) avatar.src = profile.avatar;

    renderSocialLinks(socialLinks);
    applyBorderSettings(settings);
    startClock(profile);
  }

  SR.profile = { init };
})(window.SourceRat);
