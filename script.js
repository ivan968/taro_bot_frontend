/**
 * ═══════════════════════════════════════════════════════════
 * MYSTIC TAROT — script.js
 * Telegram Mini App | Full Tarot Reading Experience
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. TELEGRAM WEBAPP INIT
────────────────────────────────────────────────────────── */

/**
 * Initialises the Telegram WebApp SDK.
 * Safe to call even outside Telegram (falls back gracefully).
 */
function initTelegram() {
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();       // Notify Telegram the app is ready
    tg.expand();      // Expand to full screen height
    // Optionally set header colour to match our dark theme
    try { tg.setHeaderColor('#090714'); } catch (_) {}
    try { tg.setBackgroundColor('#090714'); } catch (_) {}
  }
}

/* ──────────────────────────────────────────────────────────
   2. STARFIELD CANVAS
────────────────────────────────────────────────────────── */

/**
 * Draws an animated starfield on a <canvas> element.
 * Stars twinkle by slowly varying their opacity.
 */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');

  let stars = [];
  const STAR_COUNT = 160;

  /** Resize canvas to match window */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /** Seed the star array with random positions, sizes, opacities */
  function seedStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       Math.random() * 1.5 + 0.2,
        alpha:   Math.random(),
        delta:   (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        // Occasional golden star
        gold:    Math.random() < 0.15,
      });
    }
  }

  /** Main render loop */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const star of stars) {
      // Twinkle
      star.alpha += star.delta;
      if (star.alpha >= 1 || star.alpha <= 0) star.delta *= -1;
      star.alpha = Math.max(0, Math.min(1, star.alpha));

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = star.gold
        ? `rgba(200,150,60,${star.alpha * 0.7})`
        : `rgba(220,210,255,${star.alpha * 0.5})`;
      ctx.fill();
    }

    // Occasional shooting star
    if (Math.random() < 0.003) drawShootingStar();

    requestAnimationFrame(draw);
  }

  /** Draw a single transient shooting star */
  let shooters = [];
  function drawShootingStar() {
    shooters.push({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height * 0.5,
      len:  Math.random() * 80 + 40,
      vx:   Math.random() * 5 + 3,
      vy:   Math.random() * 3 + 1,
      life: 1,
    });
  }

  function drawShooters() {
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y + s.len * 0.5);
      grad.addColorStop(0, `rgba(255,255,230,0)`);
      grad.addColorStop(1, `rgba(255,255,230,${s.life * 0.8})`);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.len, s.y + s.len * 0.5);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1;
      ctx.stroke();
      s.x    += s.vx;
      s.y    += s.vy;
      s.life -= 0.04;
      if (s.life <= 0) shooters.splice(i, 1);
    }
  }

  // Override draw to also handle shooters
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
      star.alpha += star.delta;
      if (star.alpha >= 1 || star.alpha <= 0) star.delta *= -1;
      star.alpha = Math.max(0, Math.min(1, star.alpha));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = star.gold
        ? `rgba(200,150,60,${star.alpha * 0.7})`
        : `rgba(220,210,255,${star.alpha * 0.5})`;
      ctx.fill();
    }
    drawShooters();
    if (Math.random() < 0.003) drawShootingStar();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); seedStars(); });
  resize();
  seedStars();
  loop();
})();

/* ──────────────────────────────────────────────────────────
   3. TAROT DECK DATA
────────────────────────────────────────────────────────── */

/**
 * Full Major Arcana (22 cards) + 10 Minor Arcana samples = 32 cards.
 * Each card:
 *   name         — display name
 *   symbol       — emoji stand-in (replace with image path later)
 *   imageFile    — filename under assets/cards/ (swap in real art)
 *   meaning      — short keyword meaning
 *   interpretation — paragraph for the reading
 *   position     — upright/reversed chance handled at runtime
 */
const TAROT_DECK = [
  /* ── Старші Аркани ── */
  {
    name: 'Блазень',
    symbol: '🌟',
    imageFile: 'card_00.png',
    meaning: 'Нові початки · Невинність · Пригода',
    interpretation: 'Тебе чекає стрибок віри. Блазень сигналізує, що ти стоїш на порозі надзвичайного нового розділу — такого, що вимагає сміливості, а не обережності. Прийми невідоме з відкритим серцем.',
    element: 'Повітря',
    number: '0',
  },
  {
    name: 'Маг',
    symbol: '🪄',
    imageFile: 'card_01.png',
    meaning: 'Сила волі · Майстерність · Маніфестація',
    interpretation: 'Ти маєш усі необхідні інструменти, щоб змінити свою реальність. Маг нагадує: намір, підкріплений цілеспрямованою дією, — це і є алхімія творення.',
    element: 'Повітря',
    number: 'I',
  },
  {
    name: 'Верховна Жриця',
    symbol: '🌙',
    imageFile: 'card_02.png',
    meaning: 'Інтуїція · Таємниця · Внутрішнє знання',
    interpretation: 'Відповіді, яких ти шукаєш, — не в зовнішньому світі, а в тихих глибинах власної інтуїції. Будь мовчазним і відкритим — Верховна Жриця береже таємниці, варті знання.',
    element: 'Вода',
    number: 'II',
  },
  {
    name: 'Імператриця',
    symbol: '🌸',
    imageFile: 'card_03.png',
    meaning: 'Достаток · Родючість · Турбота',
    interpretation: 'Всесвіт змовляється задля зростання і достатку у твоєму житті. Імператриця благословляє цей момент творчою родючістю та теплом безумовного кохання.',
    element: 'Земля',
    number: 'III',
  },
  {
    name: 'Імператор',
    symbol: '👑',
    imageFile: 'card_04.png',
    meaning: 'Авторитет · Структура · Стабільність',
    interpretation: 'Порядок — твій союзник. Імператор закликає тебе закласти міцний фундамент, утвердити свій авторитет із мудрістю та збудувати щось, що переживе цей момент.',
    element: 'Вогонь',
    number: 'IV',
  },
  {
    name: 'Ієрофант',
    symbol: '🗝️',
    imageFile: 'card_05.png',
    meaning: 'Традиція · Мудрість · Духовне керівництво',
    interpretation: 'Сакральне знання пропонується тобі через традицію або наставника. Ієрофант запрошує тебе шанувати мудрість тих, хто прийшов до тебе.',
    element: 'Земля',
    number: 'V',
  },
  {
    name: 'Закохані',
    symbol: '💞',
    imageFile: 'card_06.png',
    meaning: 'Кохання · Вибір · Узгодженість',
    interpretation: 'Перед тобою постає важливий вибір — такий, що коріниться у цінностях і серці. Закохані запитують: чого ти справді бажаєш і чи відповідають твої дії цій істині?',
    element: 'Повітря',
    number: 'VI',
  },
  {
    name: 'Колісниця',
    symbol: '⚡',
    imageFile: 'card_07.png',
    meaning: 'Рішучість · Перемога · Контроль',
    interpretation: 'Стримай свої протилежні сили і рухайся вперед. Колісниця обіцяє перемогу тим, хто зберігає дисципліну і скеровує свою волю з непохитною рішучістю.',
    element: 'Вода',
    number: 'VII',
  },
  {
    name: 'Сила',
    symbol: '🦁',
    imageFile: 'card_08.png',
    meaning: 'Мужність · Терпіння · Внутрішня сила',
    interpretation: 'Справжня сила — це не примус, а тиха міць співчуття, яке зустрічає труднощі без страху. Усередині тебе більше стійкості, ніж ти усвідомлюєш.',
    element: 'Вогонь',
    number: 'VIII',
  },
  {
    name: 'Відлюдник',
    symbol: '🕯️',
    imageFile: 'card_09.png',
    meaning: 'Самота · Рефлексія · Внутрішнє керівництво',
    interpretation: 'Настав час священного усамітнення. Відлюдник освітлює твій шлях усередину — шукай самоти, щоб почути свою найглибшу мудрість, перш ніж повернутися у світ.',
    element: 'Земля',
    number: 'IX',
  },
  {
    name: 'Колесо Фортуни',
    symbol: '☸️',
    imageFile: 'card_10.png',
    meaning: 'Цикли · Доля · Поворотні моменти',
    interpretation: 'Колесо обертається, і твоя доля змінюється. Пам\'ятай: життя рухається циклами — цей момент змін, хоч і несподіваний, є частиною більш масштабного, цілеспрямованого узору.',
    element: 'Вогонь',
    number: 'X',
  },
  {
    name: 'Справедливість',
    symbol: '⚖️',
    imageFile: 'card_11.png',
    meaning: 'Правда · Чесність · Причина і наслідок',
    interpretation: 'Закон причини і наслідку діє. Справедливість вимагає чесності — з іншими і, найголовніше, з самим собою. Те, що заслужено, буде дано; те, що справедливо, переможе.',
    element: 'Повітря',
    number: 'XI',
  },
  {
    name: 'Повішений',
    symbol: '🌀',
    imageFile: 'card_12.png',
    meaning: 'Пауза · Здача · Новий погляд',
    interpretation: 'Опір подовжує урок. Повішений запрошує тебе відпустити контроль і побачити свою ситуацію з абсолютно нового кута — ясність з\'являється в тиші.',
    element: 'Вода',
    number: 'XII',
  },
  {
    name: 'Смерть',
    symbol: '🦋',
    imageFile: 'card_13.png',
    meaning: 'Трансформація · Завершення · Відродження',
    interpretation: 'Те, що завершується, звільняє місце для нового. Карта Смерті говорить не про буквальну втрату, а про глибоке перетворення — старе "я" розчиняється, щоб могло народитися нове.',
    element: 'Вода',
    number: 'XIII',
  },
  {
    name: 'Поміркованість',
    symbol: '✨',
    imageFile: 'card_14.png',
    meaning: 'Баланс · Терпіння · Поміркованість',
    interpretation: 'Мистецтво алхімії живе посередині шляху. Поміркованість просить тебе поєднати протилежні сили з грацією, залишатися терплячим і довіряти, що постійні зусилля створюють тривалу гармонію.',
    element: 'Вогонь',
    number: 'XIV',
  },
  {
    name: 'Диявол',
    symbol: '🔗',
    imageFile: 'card_15.png',
    meaning: 'Тінь · Кайдани · Матеріалізм',
    interpretation: 'Можливо, тебе сковують переконання, звичка або стосунки, які більше не служать тобі — але кайдани слабші, ніж здаються. Усвідомлення само по собі є першим кроком до звільнення.',
    element: 'Земля',
    number: 'XV',
  },
  {
    name: 'Вежа',
    symbol: '🌩️',
    imageFile: 'card_16.png',
    meaning: 'Раптова зміна · Одкровення · Хаос',
    interpretation: 'Раптове одкровення або потрясіння руйнує те, що було неправдивим. Вежа — це драматична карта, але те, що вона знищує, було збудовано на нестабільному ґрунті. Те, що залишається, — справжнє.',
    element: 'Вогонь',
    number: 'XVI',
  },
  {
    name: 'Зірка',
    symbol: '⭐',
    imageFile: 'card_17.png',
    meaning: 'Надія · Зцілення · Натхнення',
    interpretation: 'Після бурі з\'являється Зірка. Це карта глибокої надії і духовного оновлення. Довіряй, що всесвіт веде тебе до зцілення та сяючого майбутнього.',
    element: 'Повітря',
    number: 'XVII',
  },
  {
    name: 'Місяць',
    symbol: '🌑',
    imageFile: 'card_18.png',
    meaning: 'Ілюзія · Страх · Підсвідоме',
    interpretation: 'Не все є таким, яким здається. Місяць освітлює тіньову місцевість підсвідомого — іди крізь свої страхи з усвідомленістю, а не уникненням, і шлях проясниться.',
    element: 'Вода',
    number: 'XVIII',
  },
  {
    name: 'Сонце',
    symbol: '☀️',
    imageFile: 'card_19.png',
    meaning: 'Радість · Успіх · Життєва сила',
    interpretation: 'Тепло, ясність і сяючий успіх оточують цей момент. Сонце світить на тебе повним світлом — дозволь собі відчути справжню радість і поділитися нею зі світом.',
    element: 'Вогонь',
    number: 'XIX',
  },
  {
    name: 'Суд',
    symbol: '📯',
    imageFile: 'card_20.png',
    meaning: 'Пробудження · Спокута · Покликання',
    interpretation: 'Глибоке внутрішнє пробудження закликає тебе піднятися і прийняти своє справжнє "я" без застережень. Суд запрошує тебе відповісти на своє вище покликання без провини чи вагань.',
    element: 'Вогонь',
    number: 'XX',
  },
  {
    name: 'Світ',
    symbol: '🌍',
    imageFile: 'card_21.png',
    meaning: 'Завершення · Інтеграція · Цілісність',
    interpretation: 'Величний цикл досягає свого завершення. Світ святкує твої досягнення і цілісність — ти інтегрував свій досвід і прийшов до місця глибокого знання.',
    element: 'Земля',
    number: 'XXI',
  },
  /* ── Молодші Аркани ── */
  {
    name: 'Туз Чаш',
    symbol: '🏆',
    imageFile: 'card_22.png',
    meaning: 'Нове кохання · Емоційний початок · Переповненість',
    interpretation: 'Тобі простягають переповнену чашу емоційних можливостей. Це насіння кохання, співчуття і творчого самовираження — прийми його з відкритим серцем.',
    element: 'Вода',
    number: 'Туз',
  },
  {
    name: 'Туз Жезлів',
    symbol: '🔥',
    imageFile: 'card_23.png',
    meaning: 'Натхнення · Новий проєкт · Творча іскра',
    interpretation: 'Блискавка творчості вдарила! Туз Жезлів запалює пристрасний новий початок — слідуй цьому натхненному імпульсу, поки вагання не погасило вогонь.',
    element: 'Вогонь',
    number: 'Туз',
  },
  {
    name: 'Туз Мечів',
    symbol: '⚔️',
    imageFile: 'card_24.png',
    meaning: 'Ясність · Правда · Розумовий прорив',
    interpretation: 'Меч кришталевої ясності розрізає плутанину. Туз Мечів провіщає момент прориву — істина, навколо якої ти кружляв, тепер неможлива для ігнорування.',
    element: 'Повітря',
    number: 'Туз',
  },
  {
    name: 'Туз Пентаклів',
    symbol: '💰',
    imageFile: 'card_25.png',
    meaning: 'Можливість · Процвітання · Новий початок',
    interpretation: 'Конкретна нова можливість у матеріальному світі вже поряд — фінансова, професійна чи пов\'язана зі здоров\'ям. Прийми цей дар з практичною вдячністю і обдуманими діями.',
    element: 'Земля',
    number: 'Туз',
  },
  {
    name: 'Королева Чаш',
    symbol: '🔮',
    imageFile: 'card_26.png',
    meaning: 'Співчуття · Інтуїція · Емоційна глибина',
    interpretation: 'Дій з емпатією і довіряй глибокому знанню свого емоційного інтелекту. Королева Чаш втілює мудрість почуттів — нехай співчуття веде твій наступний крок.',
    element: 'Вода',
    number: 'Королева',
  },
  {
    name: 'Король Жезлів',
    symbol: '🦅',
    imageFile: 'card_27.png',
    meaning: 'Харизма · Бачення · Сміливе лідерство',
    interpretation: 'Заяви про своє бачення і веди з сміливою, вогненною переконаністю. Король Жезлів закликає тебе надихати інших через пристрасть, чесність і непохитний підприємницький дух.',
    element: 'Вогонь',
    number: 'Король',
  },
  {
    name: 'Десятка Пентаклів',
    symbol: '🏰',
    imageFile: 'card_28.png',
    meaning: 'Спадщина · Достаток · Сім\'я',
    interpretation: 'Довгострокова безпека і багата спадщина в межах досяжності. Десятка Пентаклів говорить про міжпоколінне багатство — не лише грошове, а й мудрість, кохання і міцні основи.',
    element: 'Земля',
    number: 'Десятка',
  },
  {
    name: 'Трійка Мечів',
    symbol: '💔',
    imageFile: 'card_29.png',
    meaning: 'Серцевий біль · Горе · Болюча правда',
    interpretation: 'Визнаний біль — це біль, який може зцілитися. Трійка Мечів запрошує тебе повністю відчути і пережити це горе, а не заперечувати його — лише тоді може початися справжнє зцілення.',
    element: 'Повітря',
    number: 'Трійка',
  },
  {
    name: 'Шістка Чаш',
    symbol: '🌺',
    imageFile: 'card_30.png',
    meaning: 'Ностальгія · Невинність · Повернення до минулого',
    interpretation: 'Минуле тягнеться вперед із подарунками — возз\'єднання, спогад чи зв\'язок із невинним "я". Шістка Чаш запрошує тебе шанувати те, звідки ти прийшов.',
    element: 'Вода',
    number: 'Шістка',
  },
  {
    name: 'Паж Жезлів',
    symbol: '🌱',
    imageFile: 'card_31.png',
    meaning: 'Ентузіазм · Дослідження · Вільний дух',
    interpretation: 'Підходь до цієї ситуації з цікавістю і натхненною енергією. Паж Жезлів сигналізує, що дослідник у тобі готовий — скажи "так" пригоді.',
    element: 'Вогонь',
    number: 'Паж',
  },
];

/* ──────────────────────────────────────────────────────────
   4. CARD SPREAD LAYOUT (how many face-down cards to show)
────────────────────────────────────────────────────────── */
const TOTAL_SPREAD_CARDS = 12; // Number of face-down cards to display
const CARDS_TO_PICK      = 3;  // User must pick exactly 3

/* ──────────────────────────────────────────────────────────
   5. SCREEN NAVIGATION
────────────────────────────────────────────────────────── */

/** Currently visible screen id */
let currentScreenId = 'screen-start';

/**
 * Transitions from the current screen to a new one.
 * @param {string} toId — the id of the target screen element
 */
function showScreen(toId) {
  const current = document.getElementById(currentScreenId);
  const next    = document.getElementById(toId);

  if (!next || currentScreenId === toId) return;

  // Exit current
  current.classList.add('exit');
  current.classList.remove('active');

  // Enter next after a short delay for the exit animation
  setTimeout(() => {
    current.classList.remove('exit');
    next.classList.add('active');
    currentScreenId = toId;
    // Scroll new screen to top
    next.scrollTop = 0;
  }, 380);
}

/* ──────────────────────────────────────────────────────────
   6. STATE
────────────────────────────────────────────────────────── */
let userQuestion  = '';        // The question the user typed
let shuffledDeck  = [];        // A freshly shuffled subset for the spread
let selectedCards = [];        // Array of chosen card objects (max 3)
let flipCount     = 0;         // How many cards have been flipped so far

/* ──────────────────────────────────────────────────────────
   7. UTILITY FUNCTIONS
────────────────────────────────────────────────────────── */

/**
 * Fisher-Yates in-place shuffle.
 * @param {Array} arr
 * @returns {Array} shuffled in place
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Show / hide the loading overlay */
function showLoading(visible) {
  const el = document.getElementById('loading-overlay');
  el.classList.toggle('hidden', !visible);
}

/** Haptic feedback via Telegram API if available */
function haptic(type = 'light') {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
  } catch (_) {}
}

/* ──────────────────────────────────────────────────────────
   8. SCREEN 1 → START
────────────────────────────────────────────────────────── */
document.getElementById('btn-start').addEventListener('click', () => {
  haptic('medium');
  showScreen('screen-question');
});

/* ──────────────────────────────────────────────────────────
   9. SCREEN 2 → QUESTION INPUT
────────────────────────────────────────────────────────── */

// Live character count
const questionInput = document.getElementById('user-question');
const charCount     = document.getElementById('char-count');

questionInput.addEventListener('input', () => {
  charCount.textContent = questionInput.value.length;
});

// Back button
document.getElementById('btn-back-question').addEventListener('click', () => {
  showScreen('screen-start');
});

// Reveal button
document.getElementById('btn-reveal').addEventListener('click', () => {
  const q = questionInput.value.trim();
  if (!q) {
    // Shake the input to prompt entry
    questionInput.style.animation = 'none';
    questionInput.offsetHeight; // force reflow
    questionInput.style.animation = 'shake 0.4s ease';
    questionInput.focus();
    return;
  }
  haptic('medium');
  userQuestion = q;
  buildCardSpread();
  showScreen('screen-selection');
});

// Inline shake keyframe (injected once)
(function addShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-6px)}
      80%{transform:translateX(6px)}
    }
  `;
  document.head.appendChild(style);
})();

/* ──────────────────────────────────────────────────────────
   10. SCREEN 3 → CARD SELECTION
────────────────────────────────────────────────────────── */

/** Reset state and build the spread of face-down cards */
function buildCardSpread() {
  selectedCards = [];
  flipCount     = 0;

  // Update counter display
  updateCounter(0);
  document.getElementById('btn-read').classList.add('hidden');

  // Shuffle the full deck and pick TOTAL_SPREAD_CARDS unique cards
  shuffledDeck = shuffle([...TAROT_DECK]).slice(0, TOTAL_SPREAD_CARDS);

  const spread = document.getElementById('card-spread');
  spread.innerHTML = '';

  shuffledDeck.forEach((card, index) => {
    const wrap = document.createElement('div');
    wrap.className   = 'tarot-card-wrap';
    wrap.setAttribute('role', 'listitem');
    wrap.setAttribute('aria-label', `Карта Таро рубашкою вгору ${index + 1}`);
    wrap.dataset.index = index;

    wrap.innerHTML = `
      <div class="tarot-card" id="card-${index}">

        <!-- Back face -->
        <div class="card-face card-back">
          <div class="card-back-inner">
            <span class="card-back-symbol">✦</span>
            <span class="card-back-star">☽ ✦ ☾</span>
            <span class="card-back-symbol" style="font-size:0.6em;opacity:0.5">✦</span>
          </div>
        </div>

        <!-- Front face (revealed) -->
        <div class="card-face card-front" aria-hidden="true">
          <div class="card-img-wrap">
            <div class="card-placeholder-art">
              <span class="card-placeholder-symbol">${card.symbol}</span>
              <span class="card-placeholder-num">${card.number}</span>
            </div>
          </div>
          <div class="card-label">
            <span class="card-label-text">${card.name}</span>
          </div>
        </div>

      </div>
    `;

    // Stagger card appearance with CSS delay
    wrap.style.opacity   = '0';
    wrap.style.transform = 'translateY(20px) scale(0.9)';
    wrap.style.transition = `opacity 0.4s ${index * 0.04}s ease, transform 0.4s ${index * 0.04}s ease`;

    wrap.addEventListener('click', () => onCardClick(wrap, card, index));
    spread.appendChild(wrap);

    // Trigger entrance animation next frame
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.style.opacity   = '1';
      wrap.style.transform = 'translateY(0) scale(1)';
    }));
  });
}

/**
 * Handles a click on a face-down card.
 * Flips the card, adds it to selectedCards, updates UI.
 */
function onCardClick(wrap, card, index) {
  // Already flipped or max reached
  if (wrap.classList.contains('is-flipped')) return;
  if (flipCount >= CARDS_TO_PICK) return;

  haptic('light');
  flipCount++;
  wrap.classList.add('is-flipped');

  const cardEl = document.getElementById(`card-${index}`);
  cardEl.classList.add('flipped', 'selected-glow');

  // Record the selection with its position label
  const positionLabels = ['Минуле', 'Теперішнє', 'Майбутнє'];
  selectedCards.push({ ...card, positionLabel: positionLabels[flipCount - 1] });

  updateCounter(flipCount);

  // Pulse the counter number
  const countEl = document.getElementById('cards-chosen');
  countEl.style.transform = 'scale(1.5)';
  setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 200);

  // Show "Read My Cards" button once all 3 are chosen
  if (flipCount === CARDS_TO_PICK) {
    setTimeout(() => {
      const btn = document.getElementById('btn-read');
      btn.classList.remove('hidden');
    }, 300);
  }
}

/** Update the "X/3 cards selected" counter */
function updateCounter(n) {
  document.getElementById('cards-chosen').textContent = n;
}

// Back button on selection screen
document.getElementById('btn-back-selection').addEventListener('click', () => {
  showScreen('screen-question');
});

// "Read My Cards" button — тепер запускає AI-інтерпретацію
document.getElementById('btn-read').addEventListener('click', async () => {
  if (selectedCards.length < CARDS_TO_PICK) return;
  haptic('heavy');
  showLoading(true);

  // Рендеримо екран результатів (карти), потім викликаємо AI
  buildResultScreen();

  setTimeout(() => {
    showLoading(false);
    showScreen('screen-result');
    // Запускаємо AI-стрімінг після переходу на екран
    setTimeout(() => streamAIInterpretation(userQuestion, selectedCards), 600);
  }, 900);
});

/* ──────────────────────────────────────────────────────────
   11. SCREEN 4 → RESULTS
────────────────────────────────────────────────────────── */

/** Рендер карт результату (без інтерпретації — вона приходить від AI) */
function buildResultScreen() {
  const qDisplay = document.getElementById('result-question-display');
  const truncated = userQuestion.length > 80
    ? userQuestion.slice(0, 80) + '…'
    : userQuestion;
  qDisplay.textContent = `«${truncated}»`;

  const resultCardsEl = document.getElementById('result-cards');
  resultCardsEl.innerHTML = '';

  selectedCards.forEach((card, i) => {
    const item = document.createElement('div');
    item.className = 'result-card-item';
    item.innerHTML = `
      <div class="result-card-img">
        <div class="card-placeholder-art">
          <span class="result-card-symbol">${card.symbol}</span>
          <span class="result-card-num">${card.number}</span>
        </div>
      </div>
      <span class="result-card-position">${card.positionLabel}</span>
      <span class="result-card-name">${card.name}</span>
      <span class="result-card-meaning">${card.meaning}</span>
    `;
    resultCardsEl.appendChild(item);
    setTimeout(() => item.classList.add('revealed'), i * 250 + 200);
  });

  // Заглушка для тексту — AI заповнить його
  const interpEl = document.getElementById('interpretation-text');
  interpEl.innerHTML = `
    <div class="ai-thinking">
      <span class="ai-dot"></span>
      <span class="ai-dot"></span>
      <span class="ai-dot"></span>
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────
   12. AI ІНТЕРПРЕТАЦІЯ (через Railway бекенд)
────────────────────────────────────────────────────────── */

/**
 * Відправляє питання і карти на Railway бекенд,
 * отримує готову AI-інтерпретацію і показує її з анімацією.
 *
 * @param {string} question  — питання користувача
 * @param {Array}  cards     — масив з 3 обраних карт
 */
async function streamAIInterpretation(question, cards) {
  const interpEl = document.getElementById('interpretation-text');

  try {
    // Запит до Railway бекенду
    const response = await fetch('https://tarobot-production-fa99.up.railway.app/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, cards }),
    });

    if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);

    const data = await response.json();
    const text = data.interpretation;

    // Показуємо текст з ефектом друкарської машинки
    interpEl.innerHTML = '';
    interpEl.style.opacity = '1';
    await typewriterEffect(interpEl, text);

    // Мигаючий курсор наприкінці — зникає через 2 секунди
    const cursor = document.createElement('span');
    cursor.className = 'ai-cursor';
    interpEl.appendChild(cursor);
    setTimeout(() => cursor.remove(), 2000);

  } catch (err) {
    console.error('AI Error:', err);
    // Резервна локальна інтерпретація якщо сервер недоступний
    interpEl.style.opacity = '0';
    interpEl.style.transform = 'translateY(10px)';
    interpEl.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    interpEl.textContent = generateFallbackInterpretation(question, cards);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      interpEl.style.opacity   = '1';
      interpEl.style.transform = 'translateY(0)';
    }));
  }
}

/**
 * Анімує появу тексту символ за символом (ефект друкарської машинки).
 * @param {HTMLElement} el   — контейнер
 * @param {string}      text — повний текст для відображення
 */
function typewriterEffect(el, text) {
  return new Promise(resolve => {
    let i = 0;
    // Швидкість: 18мс на символ (~55 символів/сек)
    const interval = setInterval(() => {
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
        return;
      }
      const char = text[i];
      if (char === '\n') {
        el.appendChild(document.createElement('br'));
      } else {
        el.appendChild(document.createTextNode(char));
      }
      i++;
    }, 18);
  });
}

/**
 * Резервна локальна інтерпретація — використовується, якщо API недоступний.
 */
function generateFallbackInterpretation(question, cards) {
  const [past, present, future] = cards;
  const openings = [
    `Зірки вислухали твоє запитання про "${question}" і відповіли крізь три карти.`,
    `Завіса між світами розкрилась заради твого питання: "${question}".`,
    `Всесвіт почув "${question}" — і ось що відкрилось у картах.`,
  ];
  const opening = openings[Math.floor(Math.random() * openings.length)];
  return `${opening}\n\nЕнергія «${past.name}» у минулому заклала основу — ${past.meaning.toLowerCase()}. ${past.interpretation}\n\nЗараз «${present.name}» говорить тобі про ${present.meaning.toLowerCase()}. ${present.interpretation}\n\nА попереду тебе веде «${future.name}» — ${future.meaning.toLowerCase()}. ${future.interpretation}\n\nДовіряй цьому шляху. Карти лише дзеркало — справжня мудрість вже є всередині тебе.`;
}

/* ──────────────────────────────────────────────────────────
   13. NEW READING BUTTON
────────────────────────────────────────────────────────── */
document.getElementById('btn-new-reading').addEventListener('click', () => {
  haptic('medium');

  // Reset state
  userQuestion        = '';
  selectedCards       = [];
  flipCount           = 0;
  questionInput.value = '';
  charCount.textContent = '0';

  // Navigate back to start
  showScreen('screen-start');
});

/* ──────────────────────────────────────────────────────────
   13. BOOT
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
});
