/**
 * ═══════════════════════════════════════════════════════════
 * МІСТИЧНЕ ТАРО — script.js
 * Telegram Mini App | AI-інтерпретація через Railway бекенд
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. НАЛАШТУВАННЯ
────────────────────────────────────────────────────────── */

// URL твого Railway бекенду
const BACKEND_URL = 'https://tarobot-production-fa99.up.railway.app';

const TOTAL_SPREAD_CARDS = 12; // скільки карт показуємо рубашкою вгору
const CARDS_TO_PICK      = 3;  // скільки карт обирає користувач

/* ──────────────────────────────────────────────────────────
   2. TELEGRAM WEBAPP INIT
────────────────────────────────────────────────────────── */
function initTelegram() {
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    try { tg.setHeaderColor('#090714'); }     catch (_) {}
    try { tg.setBackgroundColor('#090714'); } catch (_) {}
  }
}

/* ──────────────────────────────────────────────────────────
   3. ЗОРЯНЕ НЕБО (Canvas)
────────────────────────────────────────────────────────── */
(function initStarfield() {
  const canvas   = document.getElementById('starfield');
  const ctx      = canvas.getContext('2d');
  let   stars    = [];
  let   shooters = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function seedStars() {
    stars = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.5 + 0.2,
        alpha: Math.random(),
        delta: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        gold:  Math.random() < 0.15,
      });
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.alpha += s.delta;
      if (s.alpha >= 1 || s.alpha <= 0) s.delta *= -1;
      s.alpha = Math.max(0, Math.min(1, s.alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold
        ? `rgba(200,150,60,${s.alpha * 0.7})`
        : `rgba(220,210,255,${s.alpha * 0.5})`;
      ctx.fill();
    }

    for (let i = shooters.length - 1; i >= 0; i--) {
      const s    = shooters[i];
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

    if (Math.random() < 0.003) {
      shooters.push({
        x:    Math.random() * canvas.width,
        y:    Math.random() * canvas.height * 0.5,
        len:  Math.random() * 80 + 40,
        vx:   Math.random() * 5 + 3,
        vy:   Math.random() * 3 + 1,
        life: 1,
      });
    }

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); seedStars(); });
  resize();
  seedStars();
  loop();
})();

/* ──────────────────────────────────────────────────────────
   4. ПОВНА КОЛОДА ТАРО (78 карт)
────────────────────────────────────────────────────────── */
const TAROT_DECK = [

  /* ════════════════════════════════
     СТАРШІ АРКАНИ (22 карти: 0–XXI)
  ════════════════════════════════ */
  {
    name: 'Блазень', symbol: '🌟', imageFile: 'card_00.png', number: '0',
    meaning: 'Нові початки · Невинність · Пригода',
    interpretation: 'Тебе чекає стрибок віри. Блазень сигналізує, що ти стоїш на порозі надзвичайного нового розділу — такого, що вимагає сміливості, а не обережності.',
  },
  {
    name: 'Маг', symbol: '🪄', imageFile: 'card_01.png', number: 'I',
    meaning: 'Сила волі · Майстерність · Маніфестація',
    interpretation: 'Ти маєш усі необхідні інструменти, щоб змінити свою реальність. Намір, підкріплений цілеспрямованою дією, — це і є алхімія творення.',
  },
  {
    name: 'Верховна Жриця', symbol: '🌙', imageFile: 'card_02.png', number: 'II',
    meaning: 'Інтуїція · Таємниця · Внутрішнє знання',
    interpretation: 'Відповіді, яких ти шукаєш, — не в зовнішньому світі, а в тихих глибинах власної інтуїції. Верховна Жриця береже таємниці, варті знання.',
  },
  {
    name: 'Імператриця', symbol: '🌸', imageFile: 'card_03.png', number: 'III',
    meaning: 'Достаток · Родючість · Турбота',
    interpretation: 'Всесвіт змовляється задля зростання і достатку у твоєму житті. Імператриця благословляє цей момент творчою родючістю та теплом безумовного кохання.',
  },
  {
    name: 'Імператор', symbol: '👑', imageFile: 'card_04.png', number: 'IV',
    meaning: 'Авторитет · Структура · Стабільність',
    interpretation: 'Порядок — твій союзник. Імператор закликає закласти міцний фундамент і збудувати щось, що переживе цей момент.',
  },
  {
    name: 'Ієрофант', symbol: '🗝️', imageFile: 'card_05.png', number: 'V',
    meaning: 'Традиція · Мудрість · Духовне керівництво',
    interpretation: 'Сакральне знання пропонується тобі через традицію або наставника. Ієрофант запрошує шанувати мудрість тих, хто прийшов до тебе.',
  },
  {
    name: 'Закохані', symbol: '💞', imageFile: 'card_06.png', number: 'VI',
    meaning: 'Кохання · Вибір · Узгодженість',
    interpretation: 'Перед тобою важливий вибір, що коріниться у цінностях і серці. Закохані запитують: чого ти справді бажаєш?',
  },
  {
    name: 'Колісниця', symbol: '⚡', imageFile: 'card_07.png', number: 'VII',
    meaning: 'Рішучість · Перемога · Контроль',
    interpretation: 'Стримай свої протилежні сили і рухайся вперед. Колісниця обіцяє перемогу тим, хто зберігає дисципліну.',
  },
  {
    name: 'Сила', symbol: '🦁', imageFile: 'card_08.png', number: 'VIII',
    meaning: 'Мужність · Терпіння · Внутрішня сила',
    interpretation: 'Справжня сила — тиха міць співчуття, яке зустрічає труднощі без страху. Усередині тебе більше стійкості, ніж ти усвідомлюєш.',
  },
  {
    name: 'Відлюдник', symbol: '🕯️', imageFile: 'card_09.png', number: 'IX',
    meaning: 'Самота · Рефлексія · Внутрішнє керівництво',
    interpretation: 'Настав час священного усамітнення. Відлюдник освітлює шлях усередину — шукай тиші, щоб почути найглибшу мудрість.',
  },
  {
    name: 'Колесо Фортуни', symbol: '☸️', imageFile: 'card_10.png', number: 'X',
    meaning: 'Цикли · Доля · Поворотні моменти',
    interpretation: 'Колесо обертається і твоя доля змінюється. Цей момент змін є частиною більш масштабного, цілеспрямованого узору.',
  },
  {
    name: 'Справедливість', symbol: '⚖️', imageFile: 'card_11.png', number: 'XI',
    meaning: 'Правда · Чесність · Причина і наслідок',
    interpretation: 'Закон причини і наслідку діє. Справедливість вимагає чесності — з іншими і, найголовніше, з самим собою.',
  },
  {
    name: 'Повішений', symbol: '🌀', imageFile: 'card_12.png', number: 'XII',
    meaning: 'Пауза · Здача · Новий погляд',
    interpretation: 'Відпусти контроль і побач ситуацію з нового кута — ясність приходить у тиші та прийнятті.',
  },
  {
    name: 'Смерть', symbol: '🦋', imageFile: 'card_13.png', number: 'XIII',
    meaning: 'Трансформація · Завершення · Відродження',
    interpretation: 'Те, що завершується, звільняє місце для нового. Це глибоке перетворення — старе "я" розчиняється, щоб народилось нове.',
  },
  {
    name: 'Поміркованість', symbol: '✨', imageFile: 'card_14.png', number: 'XIV',
    meaning: 'Баланс · Терпіння · Помірність',
    interpretation: 'Мистецтво алхімії живе посередині шляху. Залишайся терплячим — постійні зусилля створюють тривалу гармонію.',
  },
  {
    name: 'Диявол', symbol: '🔗', imageFile: 'card_15.png', number: 'XV',
    meaning: 'Тінь · Кайдани · Матеріалізм',
    interpretation: 'Можливо, тебе сковують переконання або звички, які більше не служать. Але кайдани слабші, ніж здаються — усвідомлення є першим кроком до свободи.',
  },
  {
    name: 'Вежа', symbol: '🌩️', imageFile: 'card_16.png', number: 'XVI',
    meaning: 'Раптова зміна · Одкровення · Хаос',
    interpretation: 'Раптове потрясіння руйнує те, що було неправдивим. Те, що залишається після бурі — справжнє і варте збереження.',
  },
  {
    name: 'Зірка', symbol: '⭐', imageFile: 'card_17.png', number: 'XVII',
    meaning: 'Надія · Зцілення · Натхнення',
    interpretation: 'Після бурі з\'являється Зірка. Довіряй — всесвіт веде тебе до зцілення та сяючого майбутнього.',
  },
  {
    name: 'Місяць', symbol: '🌑', imageFile: 'card_18.png', number: 'XVIII',
    meaning: 'Ілюзія · Страх · Підсвідоме',
    interpretation: 'Не все є таким, яким здається. Іди крізь свої страхи з усвідомленістю, а не уникненням — і шлях проясниться.',
  },
  {
    name: 'Сонце', symbol: '☀️', imageFile: 'card_19.png', number: 'XIX',
    meaning: 'Радість · Успіх · Життєва сила',
    interpretation: 'Тепло, ясність і сяючий успіх оточують цей момент. Дозволь собі відчути справжню радість і поділитися нею зі світом.',
  },
  {
    name: 'Суд', symbol: '📯', imageFile: 'card_20.png', number: 'XX',
    meaning: 'Пробудження · Спокута · Покликання',
    interpretation: 'Глибоке внутрішнє пробудження закликає тебе прийняти своє справжнє "я". Відповідай на своє вище покликання без вагань.',
  },
  {
    name: 'Світ', symbol: '🌍', imageFile: 'card_21.png', number: 'XXI',
    meaning: 'Завершення · Інтеграція · Цілісність',
    interpretation: 'Величний цикл досягає свого завершення. Ти інтегрував свій досвід і прийшов до місця глибокого знання та цілісності.',
  },

  /* ════════════════════════════════
     МАСТЬ ЧАШІ (Cups) — 14 карт
  ════════════════════════════════ */
  {
    name: 'Туз Чаш', symbol: '🏆', imageFile: 'cups_01.png', number: 'Туз',
    meaning: 'Нове кохання · Емоційний початок · Переповненість',
    interpretation: 'Тобі простягають переповнену чашу емоційних можливостей — насіння кохання і творчого самовираження. Прийми з відкритим серцем.',
  },
  {
    name: 'Двійка Чаш', symbol: '💑', imageFile: 'cups_02.png', number: 'II',
    meaning: 'Партнерство · Взаємне кохання · З\'єднання',
    interpretation: 'Між двома душами виникає глибокий і рівноправний зв\'язок. Це союз, побудований на взаємній повазі та щирому почутті.',
  },
  {
    name: 'Трійка Чаш', symbol: '🥂', imageFile: 'cups_03.png', number: 'III',
    meaning: 'Святкування · Дружба · Спільнота',
    interpretation: 'Час святкувати разом із тими, кого любиш. Спільна радість множиться — відкрий серце для вдячності та єднання.',
  },
  {
    name: 'Четвірка Чаш', symbol: '😔', imageFile: 'cups_04.png', number: 'IV',
    meaning: 'Роздуми · Апатія · Переоцінка',
    interpretation: 'Поки ти занурений у роздуми, всесвіт пропонує нові можливості. Підведи очі — дар може бути прямо перед тобою.',
  },
  {
    name: 'П\'ятірка Чаш', symbol: '😢', imageFile: 'cups_05.png', number: 'V',
    meaning: 'Втрата · Жаль · Горе',
    interpretation: 'Визнай свій біль, але не забудь обернутись — дві чаші ще стоять. Навіть у втраті є щось, за що варто триматись.',
  },
  {
    name: 'Шістка Чаш', symbol: '🌺', imageFile: 'cups_06.png', number: 'VI',
    meaning: 'Ностальгія · Невинність · Повернення до минулого',
    interpretation: 'Минуле тягнеться вперед із подарунками — возз\'єднання або зв\'язок із невинним "я". Шануй те, звідки ти прийшов.',
  },
  {
    name: 'Сімка Чаш', symbol: '🌈', imageFile: 'cups_07.png', number: 'VII',
    meaning: 'Ілюзії · Мрії · Вибір',
    interpretation: 'Перед тобою безліч спокусливих варіантів, але не всі вони реальні. Зроби крок назад і оціни, яка мрія насправді твоя.',
  },
  {
    name: 'Вісімка Чаш', symbol: '🚶', imageFile: 'cups_08.png', number: 'VIII',
    meaning: 'Відхід · Пошук сенсу · Розчарування',
    interpretation: 'Настав час залишити те, що більше не наповнює. Відхід — це не поразка, а сміливий крок назустріч глибшому сенсу.',
  },
  {
    name: 'Дев\'ятка Чаш', symbol: '😊', imageFile: 'cups_09.png', number: 'IX',
    meaning: 'Виконання бажань · Задоволення · Добробут',
    interpretation: 'Карта бажань: те, про що ти мрієш, цілком у межах досяжності. Насолоджуйся плодами своїх зусиль — ти цього заслуговуєш.',
  },
  {
    name: 'Десятка Чаш', symbol: '🌟', imageFile: 'cups_10.png', number: 'X',
    meaning: 'Щастя · Гармонія · Сімейна радість',
    interpretation: 'Повнота емоційного щастя і глибокий мир у стосунках. Це образ сповненого, гармонійного життя — він реальний і досяжний.',
  },
  {
    name: 'Паж Чаш', symbol: '🐟', imageFile: 'cups_11.png', number: 'Паж',
    meaning: 'Творчість · Інтуїція · Вісті',
    interpretation: 'Несподіване повідомлення або творчий імпульс прибуває. Залишайся відкритим до дивовижного — уява є вратами до нового.',
  },
  {
    name: 'Лицар Чаш', symbol: '🐴', imageFile: 'cups_12.png', number: 'Лицар',
    meaning: 'Романтика · Ідеалізм · Привабливість',
    interpretation: 'Романтичний і мрійливий посланник наближається. Дозволь серцю відкритися назустріч красі та ніжності моменту.',
  },
  {
    name: 'Королева Чаш', symbol: '🔮', imageFile: 'cups_13.png', number: 'Королева',
    meaning: 'Співчуття · Інтуїція · Емоційна глибина',
    interpretation: 'Дій з емпатією і довіряй глибокому знанню свого емоційного інтелекту. Нехай співчуття веде твій наступний крок.',
  },
  {
    name: 'Король Чаш', symbol: '🌊', imageFile: 'cups_14.png', number: 'Король',
    meaning: 'Емоційна зрілість · Мудрість серця · Баланс',
    interpretation: 'Справжня мудрість — відчувати глибоко і все ж зберігати рівновагу. Керуй своїм внутрішнім світом із майстерністю зрілого серця.',
  },

  /* ════════════════════════════════
     МАСТЬ ЖЕЗЛИ (Wands) — 14 карт
  ════════════════════════════════ */
  {
    name: 'Туз Жезлів', symbol: '🔥', imageFile: 'wands_01.png', number: 'Туз',
    meaning: 'Натхнення · Новий проєкт · Творча іскра',
    interpretation: 'Блискавка творчості вдарила! Слідуй цьому натхненному імпульсу, поки вагання не погасило вогонь.',
  },
  {
    name: 'Двійка Жезлів', symbol: '🌐', imageFile: 'wands_02.png', number: 'II',
    meaning: 'Планування · Амбіції · Вибір шляху',
    interpretation: 'Ти стоїш на роздоріжжі з усім світом перед собою. Думай стратегічно — великі мрії потребують сміливого планування.',
  },
  {
    name: 'Трійка Жезлів', symbol: '⛵', imageFile: 'wands_03.png', number: 'III',
    meaning: 'Розширення · Очікування · Далекі горизонти',
    interpretation: 'Твої зусилля вже запущені у плавання. Тримай зір спрямованим на горизонт — результати наближаються.',
  },
  {
    name: 'Четвірка Жезлів', symbol: '🎉', imageFile: 'wands_04.png', number: 'IV',
    meaning: 'Святкування · Стабільність · Гармонія вдома',
    interpretation: 'Час відсвяткувати досягнення і знайти радість у домашньому вогнищі. Міцна основа дозволяє тобі розцвітати.',
  },
  {
    name: 'П\'ятірка Жезлів', symbol: '⚔️', imageFile: 'wands_05.png', number: 'V',
    meaning: 'Конкуренція · Конфлікт · Боротьба',
    interpretation: 'Хаос і суперечки — тимчасові. Знайди спосіб направити цю енергію у продуктивне русло, замість взаємних зіткнень.',
  },
  {
    name: 'Шістка Жезлів', symbol: '🏆', imageFile: 'wands_06.png', number: 'VI',
    meaning: 'Перемога · Визнання · Лідерство',
    interpretation: 'Твій успіх заслуговує на визнання. Прийми лавровий вінець з гідністю і продовжуй надихати оточуючих.',
  },
  {
    name: 'Сімка Жезлів', symbol: '🛡️', imageFile: 'wands_07.png', number: 'VII',
    meaning: 'Захист позиції · Наполегливість · Виклик',
    interpretation: 'Відстоюй свою справу навіть під тиском. Ти на вершині — і маєш усі підстави там залишатися.',
  },
  {
    name: 'Вісімка Жезлів', symbol: '🏹', imageFile: 'wands_08.png', number: 'VIII',
    meaning: 'Швидкий рух · Вісті · Прискорення',
    interpretation: 'Події розвиваються стрімко. Будь готовий діяти швидко — вітер удачі надує вітрила саме зараз.',
  },
  {
    name: 'Дев\'ятка Жезлів', symbol: '🧱', imageFile: 'wands_09.png', number: 'IX',
    meaning: 'Стійкість · Захист · Майже у фіналі',
    interpretation: 'Ти вже пройшов такий довгий шлях — не здавайся тепер. Зберися з останніми силами: фініш ближче, ніж здається.',
  },
  {
    name: 'Десятка Жезлів', symbol: '😓', imageFile: 'wands_10.png', number: 'X',
    meaning: 'Тягар · Перевантаження · Відповідальність',
    interpretation: 'Ти несеш надто багато сам. Делегуй, відпусти або переосмисли свій тягар — мудрість полягає у знанні своїх меж.',
  },
  {
    name: 'Паж Жезлів', symbol: '🌱', imageFile: 'wands_11.png', number: 'Паж',
    meaning: 'Ентузіазм · Дослідження · Вільний дух',
    interpretation: 'Підходь до цієї ситуації з цікавістю і натхненням. Дослідник у тобі готовий — скажи "так" пригоді.',
  },
  {
    name: 'Лицар Жезлів', symbol: '🐎', imageFile: 'wands_12.png', number: 'Лицар',
    meaning: 'Пристрасть · Пригода · Імпульсивність',
    interpretation: 'Дій сміливо і швидко, але не дозволяй нетерпінню підвести. Перетвори цей вогненний порив на цілеспрямований рух.',
  },
  {
    name: 'Королева Жезлів', symbol: '🌻', imageFile: 'wands_13.png', number: 'Королева',
    meaning: 'Харизма · Впевненість · Незалежність',
    interpretation: 'Сяй своєю автентичною природою. Твоя тепла енергія і жива присутність здатні надихнути всіх навколо.',
  },
  {
    name: 'Король Жезлів', symbol: '🦅', imageFile: 'wands_14.png', number: 'Король',
    meaning: 'Харизма · Бачення · Сміливе лідерство',
    interpretation: 'Заяви про своє бачення і веди з вогненною переконаністю. Надихай інших через пристрасть та непохитний дух.',
  },

  /* ════════════════════════════════
     МАСТЬ МЕЧІ (Swords) — 14 карт
  ════════════════════════════════ */
  {
    name: 'Туз Мечів', symbol: '🗡️', imageFile: 'swords_01.png', number: 'Туз',
    meaning: 'Ясність · Правда · Розумовий прорив',
    interpretation: 'Меч кришталевої ясності розрізає плутанину. Істина, навколо якої ти кружляв, тепер неможлива для ігнорування.',
  },
  {
    name: 'Двійка Мечів', symbol: '🙈', imageFile: 'swords_02.png', number: 'II',
    meaning: 'Тупик · Невизначеність · Відмова бачити',
    interpretation: 'Рішення, якого ти уникаєш, не зникне саме по собі. Зніми пов\'язку з очей — ясність вже доступна тобі.',
  },
  {
    name: 'Трійка Мечів', symbol: '💔', imageFile: 'swords_03.png', number: 'III',
    meaning: 'Серцевий біль · Горе · Болюча правда',
    interpretation: 'Визнаний біль — це біль, який може зцілитися. Повністю відчуй це горе, а не заперечуй — лише тоді почнеться зцілення.',
  },
  {
    name: 'Четвірка Мечів', symbol: '🛌', imageFile: 'swords_04.png', number: 'IV',
    meaning: 'Відпочинок · Відновлення · Споглядання',
    interpretation: 'Тіло й розум потребують відновлення. Дозволь собі паузу — не бездіяльність, а свідомий відпочинок перед наступним рухом.',
  },
  {
    name: 'П\'ятірка Мечів', symbol: '😤', imageFile: 'swords_05.png', number: 'V',
    meaning: 'Конфлікт · Поразка · Пустоцвіт перемоги',
    interpretation: 'Перемога будь-якою ціною може виявитися порожньою. Запитай себе: чи варта ця битва своєї ціни?',
  },
  {
    name: 'Шістка Мечів', symbol: '🚤', imageFile: 'swords_06.png', number: 'VI',
    meaning: 'Перехід · Рух уперед · Зцілення',
    interpretation: 'Ти залишаєш турботи позаду і рухаєшся до спокійніших вод. Цей перехід — початок зцілення.',
  },
  {
    name: 'Сімка Мечів', symbol: '🦊', imageFile: 'swords_07.png', number: 'VII',
    meaning: 'Обман · Стратегія · Ухиляння',
    interpretation: 'Будь обачний із тими, хто діє нечесно — і сам не вдавайся до хитрощів. Справжня стратегія не потребує обману.',
  },
  {
    name: 'Вісімка Мечів', symbol: '⛓️', imageFile: 'swords_08.png', number: 'VIII',
    meaning: 'Обмеження · Страх · Самоув\'язнення',
    interpretation: 'Обмеження, які ти відчуваєш, переважно у твоїй голові. Зроби крок убік — і побачиш, що шлях вільний.',
  },
  {
    name: 'Дев\'ятка Мечів', symbol: '😰', imageFile: 'swords_09.png', number: 'IX',
    meaning: 'Тривога · Нічний жах · Надмірні думки',
    interpretation: 'Думки серед ночі здаються більш страшними, ніж є насправді. Стривожений розум потребує ніжності, а не ще більше тривоги.',
  },
  {
    name: 'Десятка Мечів', symbol: '🌅', imageFile: 'swords_10.png', number: 'X',
    meaning: 'Кінець циклу · Поразка · Відродження',
    interpretation: 'Найтемніший момент передує світанку. Цей болючий фінал відкриває двері для справжнього відродження.',
  },
  {
    name: 'Паж Мечів', symbol: '🦜', imageFile: 'swords_11.png', number: 'Паж',
    meaning: 'Цікавість · Пильність · Гострий розум',
    meaning: 'Допитливість · Спостережливість · Комунікація',
    interpretation: 'Твій розум гострий і готовий до навчання. Ставь запитання, шукай правду і не бійся висловлювати свої думки.',
  },
  {
    name: 'Лицар Мечів', symbol: '💨', imageFile: 'swords_12.png', number: 'Лицар',
    meaning: 'Рішучість · Швидкі дії · Безкомпромісність',
    interpretation: 'Дій швидко і сміливо, але не забувай про наслідки. Гострий розум без стриманості може порізати того, кого любиш.',
  },
  {
    name: 'Королева Мечів', symbol: '🌬️', imageFile: 'swords_13.png', number: 'Королева',
    meaning: 'Незалежність · Пряма мова · Розум',
    interpretation: 'Говори правду з ясністю і повагою. Твій незалежний розум — велика сила, якщо поєднаний із серцем.',
  },
  {
    name: 'Король Мечів', symbol: '⚖️', imageFile: 'swords_14.png', number: 'Король',
    meaning: 'Авторитет · Розумна сила · Справедливість',
    interpretation: 'Приймай рішення, ґрунтуючись на розумі й принципах, а не на емоціях. Справедливий суд вимагає холодного розуму і теплого серця.',
  },

  /* ════════════════════════════════
     МАСТЬ ПЕНТАКЛІ (Pentacles) — 14 карт
  ════════════════════════════════ */
  {
    name: 'Туз Пентаклів', symbol: '💰', imageFile: 'pents_01.png', number: 'Туз',
    meaning: 'Можливість · Процвітання · Новий початок',
    interpretation: 'Конкретна нова можливість у матеріальному світі вже поряд. Прийми цей дар з практичною вдячністю.',
  },
  {
    name: 'Двійка Пентаклів', symbol: '🤹', imageFile: 'pents_02.png', number: 'II',
    meaning: 'Баланс · Адаптивність · Жонглювання',
    interpretation: 'Ти успішно балансуєш між кількома справами — але слідкуй за тим, щоб жодна не впала. Гнучкість — твоя суперсила зараз.',
  },
  {
    name: 'Трійка Пентаклів', symbol: '🏗️', imageFile: 'pents_03.png', number: 'III',
    meaning: 'Командна робота · Майстерність · Будівництво',
    interpretation: 'Великі справи будуються разом. Твій внесок і навички цінні — найкращих результатів досягають у співпраці.',
  },
  {
    name: 'Четвірка Пентаклів', symbol: '🤑', imageFile: 'pents_04.png', number: 'IV',
    meaning: 'Безпека · Стримання · Надмірний контроль',
    interpretation: 'Захист того, що має цінність — мудрість. Але надмірне чіпляння за матеріальне може стати тягарем, а не захистом.',
  },
  {
    name: 'П\'ятірка Пентаклів', symbol: '❄️', imageFile: 'pents_05.png', number: 'V',
    meaning: 'Нестача · Труднощі · Відчуття покинутості',
    interpretation: 'Навіть у найважчі часи допомога ближче, ніж здається. Підніми голову і поглянь навколо — двері відкриті.',
  },
  {
    name: 'Шістка Пентаклів', symbol: '🎁', imageFile: 'pents_06.png', number: 'VI',
    meaning: 'Щедрість · Баланс давати і брати · Благодійність',
    interpretation: 'Ти знаходишся на боці того, хто дає або отримує. В обох випадках пам\'ятай: справжня щедрість не принижує.',
  },
  {
    name: 'Сімка Пентаклів', symbol: '🌾', imageFile: 'pents_07.png', number: 'VII',
    meaning: 'Терпіння · Оцінка результатів · Інвестиція',
    interpretation: 'Ти зробив посів — тепер час оцінити, чи правильне поле обраний. Терпіння та коригування курсу принесуть урожай.',
  },
  {
    name: 'Вісімка Пентаклів', symbol: '🔨', imageFile: 'pents_08.png', number: 'VIII',
    meaning: 'Ретельна праця · Майстерність · Навчання',
    interpretation: 'Присвяти себе своєму ремеслу з усієї душею. Майстерність приходить через наполегливе повторення і любов до справи.',
  },
  {
    name: 'Дев\'ятка Пентаклів', symbol: '🌿', imageFile: 'pents_09.png', number: 'IX',
    meaning: 'Незалежність · Достаток · Самодостатність',
    interpretation: 'Ти досяг рівня комфорту і впевненості завдяки власним зусиллям. Насолоджуйся плодами своєї незалежності.',
  },
  {
    name: 'Десятка Пентаклів', symbol: '🏰', imageFile: 'pents_10.png', number: 'X',
    meaning: 'Спадщина · Достаток · Сім\'я',
    interpretation: 'Довгострокова безпека і багата спадщина в межах досяжності — не лише грошова, а й мудрість, кохання і міцні основи.',
  },
  {
    name: 'Паж Пентаклів', symbol: '📚', imageFile: 'pents_11.png', number: 'Паж',
    meaning: 'Навчання · Практичність · Нові навички',
    interpretation: 'Підійди до нової можливості з готовністю навчатися. Кожен великий майстер колись був новачком із запалом у серці.',
  },
  {
    name: 'Лицар Пентаклів', symbol: '🐂', imageFile: 'pents_12.png', number: 'Лицар',
    meaning: 'Надійність · Терпіння · Методичність',
    interpretation: 'Повільний і стабільний виграє цю гонку. Твоя надійність і наполегливість — найміцніші інструменти досягнення мети.',
  },
  {
    name: 'Королева Пентаклів', symbol: '🌳', imageFile: 'pents_13.png', number: 'Королева',
    meaning: 'Турботливість · Практична мудрість · Достаток',
    interpretation: 'Твори добробут і затишок для себе та близьких з любов\'ю і практичністю. Справжня розкіш — це безпека і тепло домашнього вогнища.',
  },
  {
    name: 'Король Пентаклів', symbol: '💎', imageFile: 'pents_14.png', number: 'Король',
    meaning: 'Достаток · Ділова мудрість · Щедрість',
    interpretation: 'Ти збудував або будуєш щось міцне і цінне. Справжня заможність — це не лише матеріальне, а й мудрість, якою можна ділитися.',
  },
];

/* ──────────────────────────────────────────────────────────
   5. СТАН ДОДАТКУ
────────────────────────────────────────────────────────── */
let userQuestion  = '';
let shuffledDeck  = [];
let selectedCards = [];
let flipCount     = 0;

/* ──────────────────────────────────────────────────────────
   6. НАВІГАЦІЯ МІЖ ЕКРАНАМИ
────────────────────────────────────────────────────────── */
let currentScreenId = 'screen-start';

function showScreen(toId) {
  const current = document.getElementById(currentScreenId);
  const next    = document.getElementById(toId);
  if (!next || currentScreenId === toId) return;

  current.classList.add('exit');
  current.classList.remove('active');

  setTimeout(() => {
    current.classList.remove('exit');
    next.classList.add('active');
    currentScreenId = toId;
    next.scrollTop  = 0;
  }, 380);
}

/* ──────────────────────────────────────────────────────────
   7. ДОПОМІЖНІ ФУНКЦІЇ
────────────────────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showLoading(visible) {
  document.getElementById('loading-overlay').classList.toggle('hidden', !visible);
}

function haptic(type = 'light') {
  try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type); } catch (_) {}
}

/* ──────────────────────────────────────────────────────────
   8. ЕКРАН 1 → СТАРТ
────────────────────────────────────────────────────────── */
document.getElementById('btn-start').addEventListener('click', () => {
  haptic('medium');
  showScreen('screen-question');
});

/* ──────────────────────────────────────────────────────────
   9. ЕКРАН 2 → ВВЕДЕННЯ ПИТАННЯ
────────────────────────────────────────────────────────── */
const questionInput = document.getElementById('user-question');
const charCount     = document.getElementById('char-count');

questionInput.addEventListener('input', () => {
  charCount.textContent = questionInput.value.length;
});

document.getElementById('btn-back-question').addEventListener('click', () => {
  showScreen('screen-start');
});

document.getElementById('btn-reveal').addEventListener('click', () => {
  const q = questionInput.value.trim();
  if (!q) {
    questionInput.style.animation = 'none';
    questionInput.offsetHeight;
    questionInput.style.animation = 'shake 0.4s ease';
    questionInput.focus();
    return;
  }
  haptic('medium');
  userQuestion = q;

  // Показуємо екран вибору з колодою (не з картами)
  showScreen('screen-selection');
  buildDeckView();
});

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
   10. ЕКРАН 3 → ВИБІР КАРТ
────────────────────────────────────────────────────────── */

/**
 * Крок 1: показуємо колоду (стопку) — користувач натискає на неї
 */
function buildDeckView() {
  selectedCards = [];
  flipCount     = 0;
  updateCounter(0);
  document.getElementById('btn-read').classList.add('hidden');

  const spread = document.getElementById('card-spread');
  spread.innerHTML = '';

  // Підказка над колодою
  const selTop = document.querySelector('.selection-top');
  selTop.querySelector('.selection-title').textContent = 'Торкнись колоди';
  selTop.querySelector('.selection-hint').textContent  = 'Сконцентруйся на своєму питанні і натисни на колоду';
  document.getElementById('cards-chosen').textContent  = '0';

  // Обгортка для стопки карт
  const deckWrap = document.createElement('div');
  deckWrap.className = 'deck-wrap';
  deckWrap.setAttribute('role', 'button');
  deckWrap.setAttribute('aria-label', 'Натисни, щоб розкрити карти');

  // Будуємо «стопку» з кількох задніх карт
  for (let i = 4; i >= 0; i--) {
    const layer = document.createElement('div');
    layer.className = 'deck-card-layer';
    layer.style.cssText = `
      position: absolute;
      bottom: ${i * 3}px;
      left: ${i * 1}px;
      right: ${-i * 1}px;
    `;
    layer.innerHTML = `
      <div class="tarot-card" style="width:100%;height:100%">
        <div class="card-face card-back" style="border-radius:10px">
          <div class="card-back-inner">
            <span class="card-back-symbol">✦</span>
            <span class="card-back-star">☽ ✦ ☾</span>
            <span class="card-back-symbol" style="font-size:0.6em;opacity:0.5">✦</span>
          </div>
        </div>
      </div>
    `;
    deckWrap.appendChild(layer);
  }

  // Підпис під колодою
  const deckLabel = document.createElement('p');
  deckLabel.className = 'deck-label';
  deckLabel.textContent = '78 карт · Натисни, щоб відкрити';

  const deckContainer = document.createElement('div');
  deckContainer.className = 'deck-container';
  deckContainer.appendChild(deckWrap);
  deckContainer.appendChild(deckLabel);

  spread.appendChild(deckContainer);

  // Анімація появи
  deckContainer.style.opacity   = '0';
  deckContainer.style.transform = 'scale(0.85) translateY(30px)';
  deckContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    deckContainer.style.opacity   = '1';
    deckContainer.style.transform = 'scale(1) translateY(0)';
  }));

  // Клік на колоду → вибір 12 карт і показ розкладу
  deckWrap.addEventListener('click', () => {
    haptic('medium');
    animateDeckExplosion(deckContainer);
  });
}

/**
 * Анімація "вибуху" колоди і перехід до розкладу
 */
function animateDeckExplosion(deckContainer) {
  deckContainer.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  deckContainer.style.opacity    = '0';
  deckContainer.style.transform  = 'scale(1.15) translateY(-20px)';

  setTimeout(() => {
    buildCardSpread();
  }, 350);
}

/**
 * Крок 2: вибираємо 12 випадкових карт із 78 і показуємо розклад
 */
function buildCardSpread() {
  // Оновлюємо підказки
  const selTop = document.querySelector('.selection-top');
  selTop.querySelector('.selection-title').textContent = 'Обери три карти';
  selTop.querySelector('.selection-hint').textContent  = 'Довірся інтуїції — нехай рука веде тебе';

  // Перемішуємо всю колоду та беремо 12 унікальних карт
  shuffledDeck = shuffle([...TAROT_DECK]).slice(0, TOTAL_SPREAD_CARDS);

  const spread = document.getElementById('card-spread');
  spread.innerHTML = '';

  shuffledDeck.forEach((card, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'tarot-card-wrap';
    wrap.setAttribute('role', 'listitem');
    wrap.setAttribute('aria-label', `Карта Таро рубашкою вгору ${index + 1}`);
    wrap.dataset.index = index;

    wrap.innerHTML = `
      <div class="tarot-card" id="card-${index}">
        <div class="card-face card-back">
          <div class="card-back-inner">
            <span class="card-back-symbol">✦</span>
            <span class="card-back-star">☽ ✦ ☾</span>
            <span class="card-back-symbol" style="font-size:0.6em;opacity:0.5">✦</span>
          </div>
        </div>
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

    // Анімація «падіння» карт із колоди
    wrap.style.opacity    = '0';
    wrap.style.transform  = 'translateY(-40px) scale(0.8) rotate(-5deg)';
    wrap.style.transition = `opacity 0.45s ${index * 0.06}s ease, transform 0.45s ${index * 0.06}s cubic-bezier(0.34, 1.56, 0.64, 1)`;

    wrap.addEventListener('click', () => onCardClick(wrap, card, index));
    spread.appendChild(wrap);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.style.opacity   = '1';
      wrap.style.transform = 'translateY(0) scale(1) rotate(0deg)';
    }));
  });
}

function onCardClick(wrap, card, index) {
  if (wrap.classList.contains('is-flipped')) return;
  if (flipCount >= CARDS_TO_PICK) return;

  haptic('light');
  flipCount++;
  wrap.classList.add('is-flipped');

  const cardEl = document.getElementById(`card-${index}`);
  cardEl.classList.add('flipped', 'selected-glow');

  const positionLabels = ['Минуле', 'Теперішнє', 'Майбутнє'];
  selectedCards.push({ ...card, positionLabel: positionLabels[flipCount - 1] });

  updateCounter(flipCount);

  const countEl = document.getElementById('cards-chosen');
  countEl.style.transform = 'scale(1.5)';
  setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 200);

  if (flipCount === CARDS_TO_PICK) {
    setTimeout(() => {
      document.getElementById('btn-read').classList.remove('hidden');
    }, 300);
  }
}

function updateCounter(n) {
  document.getElementById('cards-chosen').textContent = n;
}

document.getElementById('btn-back-selection').addEventListener('click', () => {
  showScreen('screen-question');
});

document.getElementById('btn-read').addEventListener('click', async () => {
  if (selectedCards.length < CARDS_TO_PICK) return;
  haptic('heavy');
  showLoading(true);
  buildResultScreen();

  setTimeout(() => {
    showLoading(false);
    showScreen('screen-result');
    setTimeout(() => getAIInterpretation(userQuestion, selectedCards), 600);
  }, 900);
});

/* ──────────────────────────────────────────────────────────
   11. ЕКРАН 4 → РЕЗУЛЬТАТИ
────────────────────────────────────────────────────────── */
function buildResultScreen() {
  const truncated = userQuestion.length > 80
    ? userQuestion.slice(0, 80) + '…'
    : userQuestion;
  document.getElementById('result-question-display').textContent = `«${truncated}»`;

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

  // Мигаючі крапки поки AI думає
  document.getElementById('interpretation-text').innerHTML = `
    <div class="ai-thinking">
      <span class="ai-dot"></span>
      <span class="ai-dot"></span>
      <span class="ai-dot"></span>
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────
   12. AI ІНТЕРПРЕТАЦІЯ (Railway → Claude)
────────────────────────────────────────────────────────── */
async function getAIInterpretation(question, cards) {
  const interpEl = document.getElementById('interpretation-text');

  try {
    const response = await fetch(`${BACKEND_URL}/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, cards }),
    });

    if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);

    const data = await response.json();
    if (!data.interpretation) throw new Error('Порожня відповідь від сервера');

    // Очищаємо крапки, запускаємо друкарську машинку
    interpEl.innerHTML    = '';
    interpEl.style.opacity = '1';
    await typewriterEffect(interpEl, data.interpretation);

    // Мигаючий курсор на 2 секунди
    const cursor = document.createElement('span');
    cursor.className = 'ai-cursor';
    interpEl.appendChild(cursor);
    setTimeout(() => cursor.remove(), 2000);

  } catch (err) {
    console.error('AI Error:', err);
    showFallbackInterpretation(interpEl, question, cards);
  }
}

// Ефект друкарської машинки — символ за символом (18мс)
function typewriterEffect(el, text) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= text.length) { clearInterval(interval); resolve(); return; }
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

// Резервна інтерпретація якщо Railway недоступний
function showFallbackInterpretation(el, question, cards) {
  const [past, present, future] = cards;
  const openings = [
    `Зірки вислухали твоє запитання про "${question}" і відповіли крізь три карти.`,
    `Завіса між світами розкрилась заради твого питання: "${question}".`,
    `Всесвіт почув "${question}" — і ось що відкрилось у картах.`,
  ];
  const text = [
    openings[Math.floor(Math.random() * openings.length)],
    '',
    `Енергія «${past.name}» у минулому заклала основу — ${past.meaning.toLowerCase()}. ${past.interpretation}`,
    '',
    `Зараз «${present.name}» говорить тобі про ${present.meaning.toLowerCase()}. ${present.interpretation}`,
    '',
    `А попереду тебе веде «${future.name}» — ${future.meaning.toLowerCase()}. ${future.interpretation}`,
    '',
    'Довіряй цьому шляху. Карти лише дзеркало — справжня мудрість вже є всередині тебе.',
  ].join('\n');

  el.innerHTML = '';
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(10px)';
  el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

  requestAnimationFrame(() => requestAnimationFrame(async () => {
    el.style.opacity   = '1';
    el.style.transform = 'translateY(0)';
    await typewriterEffect(el, text);
  }));
}

/* ──────────────────────────────────────────────────────────
   13. КНОПКА "НОВИЙ РОЗКЛАД"
────────────────────────────────────────────────────────── */
document.getElementById('btn-new-reading').addEventListener('click', () => {
  haptic('medium');
  userQuestion          = '';
  selectedCards         = [];
  flipCount             = 0;
  questionInput.value   = '';
  charCount.textContent = '0';
  showScreen('screen-start');
});

/* ──────────────────────────────────────────────────────────
   14. ЗАПУСК
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
});
