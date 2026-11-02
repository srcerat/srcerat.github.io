/*
================================================================================
  ИНСТРУКЦИЯ ПО НАСТРОЙКЕ САЙТА  (читать только эту часть)
================================================================================

  Это единственный файл, который нужно править. Всё, что вы видите на сайте
  (ник, ссылки, мемы), берётся отсюда. Сами настройки находятся ниже этой
  инструкции, после строки  window.SITE_CONFIG = {

  Как менять, чтобы ничего не сломать:
    1. Текст всегда пишется в кавычках:  "вот так".
    2. Между соседними пунктами списка ставится запятая.
    3. Скобки { } [ ] и кавычки должны закрываться. Если что-то поломали —
       верните файл из архива, ничего страшного.
    4. Сохранили файл — обновите страницу в браузере (Ctrl + F5).


--------------------------------------------------------------------------------
  КАК ДОБАВИТЬ МЕМ
--------------------------------------------------------------------------------

  1. Загрузите файл на хостинг (см. «ГДЕ ХРАНИТЬ ФАЙЛЫ» ниже) и скопируйте ссылку.
  2. Скопируйте нужный шаблон из раздела «ШАБЛОНЫ» и вставьте его внутрь
     списка  memes: [ ... ]  в самый конец, перед закрывающей ].
  3. Вставьте свою ссылку в src, напишите title. Готово.

  Новые мемы показываются в том порядке, в каком они записаны.

  Что можно указывать у мема:
    type    тип:  "image" (картинка), "gif" (гифка), "video" (видео),
                  "placeholder" (цветной блок без файла)
    src     ссылка на файл (или путь вида "assets/memes/cat.png")
    title   подпись: видна в окне просмотра и в плеере
    badge   плашка в углу карточки: "CLIP", "MEME", "18+"... (необязательно)
    nsfw    true — спрятать под размытие, снимается кликом; false — показать сразу
    thumb   лёгкое превью для ленты (необязательно, см. ниже)


--------------------------------------------------------------------------------
  ГДЕ ХРАНИТЬ ФАЙЛЫ (чтобы они не занимали место на хостинге сайта)
--------------------------------------------------------------------------------

https://imagekit.io/dashboard/media-library

--------------------------------------------------------------------------------
  ШАБЛОНЫ (скопируйте блок целиком, включая запятую в конце)
--------------------------------------------------------------------------------

  1. Картинка:
    {
      type: "image",
      src: "https://res.cloudinary.com/ваше_имя/image/upload/cat.jpg",
      title: "Мой кот",
      badge: "MEME",
      nsfw: false
    },

     Картинка из папки сайта с ручным превью:
    {
      type: "image",
      src: "assets/memes/cat.jpg",
      thumb: "assets/memes/thumbs/cat.jpg",
      title: "Мой кот",
      nsfw: false
    },

  2. Гифка:
    {
      type: "gif",
      src: "https://example.com/dance.gif",
      title: "Смешной танец",
      nsfw: false
    },

  3. Видео:
    {
      type: "video",
      src: "https://files.catbox.moe/abc123.mp4",
      title: "Крутой момент на стриме",
      badge: "CLIP",
      nsfw: false
    },

  4. Картинка или видео под размытием (спойлер):
    {
      type: "image",
      src: "https://res.cloudinary.com/ваше_имя/image/upload/secret.jpg",
      title: "Спойлер к игре",
      badge: "18+",
      nsfw: true
    },

  5. Цветной блок без файла:
    {
      type: "placeholder",
      color: "#121212",
      borderColor: "#ffcc00",
      textColor: "#ffcc00",
      height: 180,
      title: "ЖЁЛТЫЙ БЛОК",
      badge: "NOTE",
      nsfw: false
    },


--------------------------------------------------------------------------------
  ПРОФИЛЬ, ЧАСЫ, ССЫЛКИ
--------------------------------------------------------------------------------

  profile.nickname              ник (крупно под аватаром)
  profile.avatar                аватар: путь к файлу или ссылка, лучше 1:2 (например 160x320)
  profile.subtitles             строки под ником, можно добавлять сколько угодно
  profile.timezoneLabel         подпись пояса у часов: "GMT+2", "MSK"...
  profile.timezoneOffset        сдвиг от UTC в часах: 2 для GMT+2, 3 для Москвы
  profile.useVisitorLocalTime   true — часы показывают время посетителя, а не ваше
  profile.headerTitle           надпись в самом верху слева
  about.description             подпись над кнопками соцсетей (каждая строка отдельно)

  Кнопка соцсети — это строка { name: "...", url: "...", icon: "↗" }.
  Чтобы добавить кнопку, скопируйте любую строку и поменяйте name и url.
  Чтобы убрать — удалите строку.

  settings.itemsPerBatch        сколько мемов подгружать за раз при прокрутке
  settings.borderWidth          толщина рамок кнопок и карточек
  settings.dividerWidth         толщина разделительных полосок
  settings.borderColor          цвет рамок (HEX, например "#262626")
  settings.dividerColor         цвет разделительных полосок

================================================================================
  НИЖЕ — САМИ НАСТРОЙКИ
================================================================================
*/

window.SITE_CONFIG = {
  profile: {
    nickname: "Source_Rat",
    avatar: "assets/model.png",
    subtitles: [
      "Крыса, Исходная крыса, Сурс-рет, Сурс.",
      "Просто небольшой креатор"
    ],
    timezoneLabel: "GMT+2",
    timezoneOffset: 2,
    useVisitorLocalTime: false,
    headerTitle: "~/srcerat\\~"
  },

  about: {
    description: [
      "Соцсети / Ссылки"
    ]
  },

  socialLinks: [
    { name: "telegram", url: "https://t.me/srcerat", icon: "↗" },
    { name: "github", url: "https://github.com/srcerat", icon: "↗" },
    { name: "discord", url: "https://discord.gg/DzpSh5mSde", icon: "↗" },
    { name: "namemc", url: "https://namemc.com/profile/Source_Rat.1", icon: "↗" },
    { name: "youtube", url: "https://youtube.com/@Source_Rat", icon: "↗" }
  ],

  memes: [
    {
      type: "image",
      src: "https://ik.imagekit.io/0rgxjka0n/IMG_20261031_112234783_AE.jpg",
      title: "pictureofrandomcat",
      nsfw: false
    },
    {
      type: "image",
      src: "https://ik.imagekit.io/0rgxjka0n/IMG_20261031_112246589_AE.jpg",
      title: "pictureofrandomcat",
      nsfw: false
    },
    {
      type: "video",
      src: "assets/memes/X2Twitter.com_tDRk41ydAiQjDJQY_852p.mp4",
      title: "memes from gaming_chair",
      badge: "MEME",
      nsfw: true
    },
    {
      type: "video",
      src: "assets/memes/X2Twitter.com_WR1boXHIgsynLpCr_360p.mp4",
      title: "memes from gaming_chair",
      badge: "MEME",
      nsfw: true
    },
    {
      type: "video",
      src: "assets/memes/hallo_3.mov",
      title: "memes from gaming_chair",
      badge: "MEME",
      nsfw: true
    }
  ],

  settings: {
    itemsPerBatch: 6,
    borderWidth: "1px",
    dividerWidth: "1px",
    borderColor: "#262626",
    dividerColor: "#262626"
  }
};
