🧠 Tacitvs Quant Terminal
Design, Architecture & System Specification (Final Revision)
1. Концепция

Tacitvs Quant Terminal — профессиональная среда для квант-трейдинга, симуляций и стратегического анализа.
Цель — создать точный вычислительный интерфейс, где каждая деталь подчёркивает концентрацию и контроль.

Интерфейс не «украшен» — он спроектирован как инженерный инструмент.
Всё подчинено идее эффективности и дисциплины.

2. Визуальная идентичность

Стиль:

65 % Retro Cyberpunk UI — неон, цифровая энергия, геометрические линии.

35 % Post-Military Industrial — сдержанность, структурная логика, индустриальный минимализм.

Фон: #000000
Типографика: моноширинная (Share Tech Mono, JetBrains Mono).
Впечатление: холодная вычислительная мощь, терминальная ясность, строгая симметрия.

3. Цветовые режимы (темы)
Режим	Primary	Secondary	Назначение	Атмосфера
Matrix	#00FF84	#00CC66	Simulation / Research	аналитическая точность
BlackOps	#fe0174	#f82909	Execution / Risk	агрессивный режим действий
Neon	#319ff8	#422d94	Post-Analysis	спокойствие, порядок

🖤 Фон всегда #000000.
Primary — основной сигнал, Secondary — слабая глубина/свечение.

4. Технологический стек
Категория	Технологии	Назначение
Фреймворк	Next.js 15 + TypeScript	производительный SSR/SPA
UI	TailwindCSS + shadcn/ui	минимализм, темизация
Charts	Lightweight Charts / uPlot	быстрая визуализация
State	Zustand	управление состоянием
Data	TanStack Query + WebSocket	потоки данных
Compute	Web Workers / WASM	Monte Carlo, EV модели
Audio	Web Audio API + Tacitvs Radio	системные сигналы + ambient
Animation	Framer Motion	плавные переходы
Deploy	Vercel / Docker	стабильный продакшн
5. Архитектура модулей
Раздел	Назначение	Визуал
/dashboard	Сводка метрик	строгая терминальная сетка
/backtest	Симуляции, Monte Carlo	лабораторная среда
/research	Аналитика и корреляции	спокойный режим
/execution	Стратегии и ордера	красно-черный боевой интерфейс
/settings	Темы, звук, источники данных	нейтральный панельный стиль
6. Темизация
:root {
  --bg:#000000;
  --fg:#d0d0d0;
  --grid:#101010;
  --panel:#0b0b0b;
}
html[data-theme="matrix"]{--accent:#00FF84;--accent2:#00CC66;}
html[data-theme="blackops"]{--accent:#fe0174;--accent2:#f82909;}
html[data-theme="neon"]{--accent:#319ff8;--accent2:#422d94;}

7. Цветовая иерархия
Уровень	Элемент	Цвет
Primary	цифры, активные элементы	--accent
Secondary	рамки, glow, линии	--accent2
Neutral	текст, фон, панели	--fg, --grid
8. Смена темы, логотип и фавикон
export function setTheme(theme:'matrix'|'blackops'|'neon'){
  document.documentElement.setAttribute('data-theme',theme);
  updateLogo(theme); updateFavicon(theme);
}


SVG-логотип использует currentColor, чтобы автоматически менять цвет.
Фавикон формируется динамически на canvas по текущему --accent.

9. Аудио-система

Tacitvs Quant Terminal использует Web Audio API для коротких звуковых сигналов (ping, tick, alert).
Эти звуки подтверждают системные действия, не отвлекая от анализа.

📻 Tacitvs Radio — Ambient Layer

Небольшой модуль, создающий звуковую атмосферу в зависимости от активной темы:

Тема	Радио-поток (пример)	Атмосфера
Matrix	SomaFM – Mission Control (https://ice2.somafm.com/missioncontrol-128-mp3)	космический ambient для концентрации
BlackOps	NightDrive FM (https://stream.laut.fm/nightdrivefm)	тёмный cyber-beat для режима execution
Neon	SomaFM – Deep Space One (https://ice2.somafm.com/deepspaceone-128-mp3)	мягкий эмбиент для аналитики

Радио тихо работает в фоне, реагируя на смену темы (fade-in/out).
Можно полностью отключить в /settings.

10. UX-принципы

Минимум визуального шума.

Один акцент — одна эмоция.

Звуковой отклик без навязчивости.

Темы = режимы мышления.

Радио — лишь фон, не контент.

11. Архитектура каталогов
src/
 ├─ app/
 │   ├─ dashboard/
 │   ├─ backtest/
 │   ├─ research/
 │   ├─ execution/
 │   ├─ settings/
 │   └─ layout.tsx
 ├─ components/
 │   ├─ DataPanel.tsx
 │   ├─ MetricCell.tsx
 │   ├─ GraphModule.tsx
 │   ├─ ExecPanel.tsx
 │   ├─ TelemetryStrip.tsx
 │   └─ TacitvsRadio.tsx
 ├─ hooks/
 │   ├─ useTheme.ts
 │   ├─ useAudio.ts
 │   └─ useWebSocket.ts
 ├─ styles/
 │   ├─ globals.css
 │   └─ themes.css
 ├─ workers/
 │   └─ montecarlo.worker.ts
 └─ lib/
     ├─ theme.ts
     ├─ api.ts
     └─ radio.ts

12. Итог
Характеристика	Значение
🎨 Стиль	65 % Retro Cyberpunk / 35 % Post-Military Industrial
⚫ Фон	#000000
💡 Цвет	один основной + один поддерживающий
💻 Стек	Next.js + TS + Tailwind + WASM + Zustand
🔊 Аудио	системные эффекты + малый ambient радио
🧩 Темы	Matrix · BlackOps · Neon
🎛 UX	дисциплина, точность, минимализм
🧠 Философия	интерфейс как расширение ума трейдера