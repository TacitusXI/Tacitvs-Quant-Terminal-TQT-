Tacitvs Radio 📡 — Dynamic Audio System
🎧 Идея

Tacitvs Radio — это встроенная станция, которая автоматически подстраивается под активную тему и подтягивает реальные интернет-радио потоки.
Каждая тема имеет свой набор станций с приоритетом fallback.

🌐 Пример конфигурации радио
export const RADIO_STATIONS = {
  matrix: [
    { name: "Digital Drift FM", url: "https://icecast.omroep.nl/radio2-bb-mp3" },
    { name: "Synthwave Paradise", url: "https://stream.laut.fm/synthwave" },
  ],
  blackops: [
    { name: "Industrial Noise", url: "https://stream.laut.fm/dark-industrial" },
    { name: "Cyber Bass", url: "https://stream.laut.fm/darkclubradio" },
  ],
  neon: [
    { name: "Deep Space One", url: "https://somafm.com/deepspaceone.pls" },
    { name: "Ambient Chill", url: "https://stream.laut.fm/ambient" },
  ],
};

⚙️ Компонент TacitvsRadio
import { useEffect, useRef, useState } from "react";
import { RADIO_STATIONS } from "@/lib/radio";

export function TacitvsRadio({ theme }: { theme: 'matrix'|'blackops'|'neon' }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLAudioElement>(null);
  const list = RADIO_STATIONS[theme];

  useEffect(() => {
    if (!ref.current) return;
    ref.current.src = list[current].url;
    ref.current.play().catch(() => {});
  }, [theme, current]);

  return (
    <div className="radio-panel border-t border-[var(--accent2)] p-2 flex items-center justify-between">
      <span className="text-[var(--accent2)] text-sm font-mono">
        Tacitvs Radio • {list[current].name}
      </span>
      <div className="flex gap-2">
        <button onClick={()=>setCurrent((current+1)%list.length)}>Next</button>
        <audio ref={ref} autoPlay preload="none" />
      </div>
    </div>
  );
}


🎚 При смене темы (setTheme('matrix')) — радио плавно переключает поток.

🔄 Если поток неактивен, fallback на следующий.

🎵 Можно управлять громкостью, включением/отключением.

⚡ Потоки кешируются для быстрого старта.

6. Интеграция с темизацией
// layout.tsx
import { TacitvsRadio } from "@/components/TacitvsRadio";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'matrix'|'blackops'|'neon'>('matrix');
  return (
    <html data-theme={theme}>
      <body>
        {children}
        <TacitvsRadio theme={theme} />
      </body>
    </html>
  );
}

7. UX-принципы аудио
Состояние	Звук	Поведение
Idle / Off	тишина	только системные эффекты
Active Simulation	радио включается автоматически	поддерживает концентрацию
High-Risk (BlackOps)	включается Industrial поток	тёмный саундтрек действия
Analysis (Neon)	ambient для фокуса	мягкое фон. присутствие
Manual Mode	пользователь выбирает станцию	сохраняется в localStorage
8. Радио + Системные эффекты

Web Audio API управляет громкостью системных “бипов” и радио по разным GainNode.

Crossfade между станциями при смене темы (linear ramp 1.5 s).

Метаданные (название трека, битрейт, жанр) отображаются в footer.

9. Пример визуала Tacitvs Radio Panel
┌────────────────────────────────────────────────────────────┐
│ Tacitvs Radio • Synthwave Paradise [STREAMING 192 kbps]   │
│ [■ Stop]  [▶ Play]  [↻ Next]  Volume ▮▮▮▮▯  Theme: Matrix │
└────────────────────────────────────────────────────────────┘