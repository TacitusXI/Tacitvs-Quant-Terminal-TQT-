🧠 Tacitvs Quant Terminal
Design, Architecture & Tech Stack (Final Integrated Version)
1. Концепция

Tacitvs Quant Terminal — это вычислительная среда для профессионального квант-трейдинга, анализа стратегий и live execution.
Она совмещает точность научных инструментов и атмосферу ретро-киберпанк индустриального терминала.

Главная цель — системная эффективность.
Интерфейс не декорация, а инженерная поверхность для решений.

2. Визуальная идентичность

Стиль:

65% Retro Cyberpunk UI — холодный неон, цифровые метрики, свечение, терминальные шрифты.

35% Post-Military Industrial Design — структурная строгость, металлическая геометрия, минимализм.

Ощущение:
Черный фон, светящиеся метрики, анимации пульсации данных, промышленные панели и структурные линии.
Всё выровнено, ничего лишнего.

3. Цветовые режимы (темы)

Каждая тема — как “состояние системы”.
Используется один основной акцентный цвет и один вспомогательный, чтобы создать глубину без перегрузки.

Режим	Primary	Secondary	Применение
Matrix	#00FF84	#00CC66	Research / Simulation
BlackOps	#fe0174	#f82909	Execution / Risk Mode
Neon	#319ff8	#422d94	Post-Analysis / Reporting

Фон: #000000 (всегда).
Главный цвет — энергия, второй — поддержка.

4. Технологический стек
Категория	Технология	Назначение
Фреймворк	Next.js 15 + TypeScript	SSR + SPA, high-performance
Стили	TailwindCSS + CSS Variables	Темизация и дизайн под Retro Cyberpunk
UI-библиотека	shadcn/ui + кастомные компоненты	Контролы в индустриальном стиле
Графики	TradingView Lightweight Charts + uPlot	Высокопроизводительная визуализация
Состояние	Zustand	Простое и быстрое управление состоянием
Коммуникация	WebSocket + TanStack Query	Реал-тайм котировки, апдейты, телеметрия
Вычисления	Web Workers / Rust → WASM	Монте-Карло, EV, бэктест без лагов
Звук	Web Audio API	Системные сигналы и feedback
Анимации	Framer Motion	Пульс, fade, focus-анимации
Деплой	Vercel / Docker	Production-ready окружение
5. Структура модулей
Модуль	Назначение	Визуальный стиль
/dashboard	Главная панель, сводка и телеметрия	строгий, минималистичный терминал
/backtest	Симуляции, Monte Carlo	холодная зелёная лаборатория
/research	Анализ, корреляции, метрики	спокойный серый с синим свечением
/execution	Live Execution / Ордеры	красный режим риска
/settings	Настройки темы, звука, сети	нейтральный пост-индустриальный стиль
6. Темизация (CSS-переменные)
:root {
  --bg: #000000;
  --fg: #d0d0d0;
  --grid: #101010;
  --panel: #0b0b0b;
}

/* Matrix */
html[data-theme="matrix"] {
  --accent: #00FF84;
  --accent2: #00CC66;
}

/* BlackOps */
html[data-theme="blackops"] {
  --accent: #fe0174;
  --accent2: #f82909;
}

/* Neon */
html[data-theme="neon"] {
  --accent: #319ff8;
  --accent2: #422d94;
}

7. Управление темой, логотипом и фавиконом
JS-менеджер
export function setTheme(theme:'matrix'|'blackops'|'neon') {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  updateLogo(theme);
  updateFavicon(theme);
}

SVG-логотип
export const TacitvsLogo = () => (
  <svg viewBox="0 0 100 100" style={{color:'var(--accent)'}}>
    <path fill="currentColor"
      d="M50 14c-16 0-26 11-26 26v10l7 9h38l7-9V40C76 25 66 14 50 14z"/>
  </svg>
);

Динамический фавикон
function updateFavicon(){
  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim();
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d')!;
  x.fillStyle = '#000'; x.fillRect(0,0,64,64);
  x.strokeStyle = accent; x.lineWidth = 3;
  x.beginPath(); x.moveTo(18,46); x.lineTo(46,18); x.lineTo(46,46); x.closePath(); x.stroke();
  const link = document.querySelector('link[rel="icon"]') ?? document.createElement('link');
  link.rel = 'icon'; link.href = c.toDataURL('image/png');
  document.head.appendChild(link);
}

8. Цветовая иерархия
Уровень	Элемент	Цвет
Primary	активные данные, EV, PnL, кнопки, индикаторы	--accent
Secondary	подсветка, бордеры, линии сетки	--accent2
Neutral	текст, фон, панели	--fg, --grid
9. Аудио Feedback
Событие	Фидбэк	Тон
Simulation start	короткий ping	880 Hz
Simulation done	двойной ping	660 / 880 Hz
Order executed	tick	1200 Hz
Error	alert buzz	200 Hz
Theme switch	мягкий pulse	440 Hz
export function playBeep(freq=880,ms=70){
  const ctx=new (window.AudioContext||(window as any).webkitAudioContext)();
  const o=ctx.createOscillator(), g=ctx.createGain();
  o.type='square'; o.frequency.value=freq;
  o.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(.0001,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(.3,ctx.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+ms/1000);
  o.start(); o.stop(ctx.currentTime+ms/1000+.02);
}

10. Интерфейсные компоненты
Компонент	Назначение	Стиль
DataPanel	панель метрик	строгий промышленный блок
MetricCell	числовое значение	неоновое свечение
GraphModule	визуализация данных	прозрачный canvas
ExecPanel	управление стратегиями	кнопки как тумблеры
TelemetryStrip	статус сети / latency	низкий бар с цифрами
ThemeToggle	смена темы	переключатель/команда
11. UX и поведение

Hover → лёгкое свечение 0 0 6px var(--accent2)

Active → контур --accent

Focus → тонкая линия с glow-анимацией

Никаких резких эффектов — только системное движение

Command Palette (⌘K):

run backtest

switch theme to matrix

connect feed

disable audio

12. Итог

Tacitvs Quant Terminal =
⚡ Производительная quant-среда
🎨 Визуальный язык: Retro Cyberpunk + Post-Military Industrial
💻 Технологический стек: Next.js, Tailwind, Workers, WASM
🔊 Системный отклик через Web Audio
🧩 Темы Matrix / BlackOps / Neon с динамической сменой логотипа и фавикона
🖤 Фон #000000, моноширинные цифры, дисциплина и минимализм