import { useRef, useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { sideName } from "../../shared/utils/karten";

const SWIPE = 90; // столько пикселей вбок — и это ответ
const other = (side) => (side === "a" ? "b" : "a");

// Одна сторона: маленькая подпись («ENGLISCH») и слово крупно
const Face = ({ label, text, small }) => (
  <>
    <span className="text-micro font-extrabold tracking-badge text-faint uppercase">{label}</span>
    <span className={cn("max-w-full text-center break-words text-ink", small ? "text-subhead font-extrabold text-muted" : "text-sheet font-black")}>{text}</span>
  </>
);

// ─────────────────────────────────────────────────────────────
// Карточка в «Lernen» (макет 43 handy-03, handy-04). Анимации (владелец 22.11 — «прикольные»):
//   • переворот — настоящий 3D по оси Y (класс flip-motion, лёгкая пружина);
//   • перевёрнутую можно тянуть пальцем: наклоняется, край светится зелёным (вправо — «Weiß ich»)
//     или красным (влево — «Weiß ich nicht»); отпустил раньше SWIPE — пружинит назад;
//   • leaving — карточка улетает (animate-fly-right / -left), новая выезжает (animate-card-in).
// Сзади две «тени» — видно, что это стопка.
// ─────────────────────────────────────────────────────────────
const LearnCard = ({ deck, card, side, flipped, leaving, onFlip, onAnswer, className }) => {
  const t = useT();
  const [dx, setDx] = useState(0);
  const start = useRef(null);
  const back = other(side);

  const down = (e) => {
    start.current = { x: e.clientX, moved: false };
    if (flipped) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!start.current || !flipped) return;
    const next = e.clientX - start.current.x;
    if (Math.abs(next) > 6) start.current.moved = true;
    setDx(next);
  };
  const up = () => {
    const was = start.current;
    start.current = null;
    if (!was) return;
    if (!flipped && !was.moved) return onFlip();
    if (Math.abs(dx) >= SWIPE) onAnswer(dx > 0);
    setDx(0);
  };

  const pull = Math.min(1, Math.abs(dx) / SWIPE); // насколько близко к ответу (0…1)
  const dragging = dx !== 0;

  return (
    <div className={cn("relative perspective-distant", className)}>
      {/* стопка сзади */}
      <div aria-hidden="true" className="absolute inset-x-6 top-5 -bottom-3 rounded-panel bg-card opacity-40" />
      <div aria-hidden="true" className="absolute inset-x-3 top-2.5 -bottom-1.5 rounded-panel bg-card opacity-70" />

      <div
        key={card.id}
        className={cn("relative h-full touch-pan-y select-none", leaving === "right" && "animate-fly-right", leaving === "left" && "animate-fly-left", !leaving && "motion-safe:animate-card-in")}
        style={dragging ? { transform: `translateX(${dx}px) rotate(${dx / 18}deg)` } : { transition: "transform 0.35s var(--ease-spring)" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => (setDx(0), (start.current = null))}
      >
        <div className={cn("relative h-full transform-3d flip-motion", flipped && "rotate-y-180")}>
          {/* Vorderseite */}
          <button
            type="button"
            onClick={(e) => e.detail === 0 && onFlip()} // клавиатура (Enter) — мышь и палец идут через pointer
            aria-label={t("Umdrehen")}
            disabled={flipped}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-panel bg-card px-6 shadow-raise outline-none backface-hidden focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Face label={sideName(deck, side)} text={card[side]} />
            <span className="absolute bottom-6 text-caption font-bold text-faint">{t("Kasten {box}", { box: card.box })}</span>
          </button>
          {/* Rückseite */}
          <div className="absolute inset-0 flex rotate-y-180 flex-col items-center rounded-panel bg-card px-6 pt-9 shadow-raise backface-hidden">
            <div className="flex flex-col items-center gap-3">
              <Face label={sideName(deck, side)} text={card[side]} small />
            </div>
            <span className="my-8 h-px w-4/5 bg-hair" />
            <div className="flex flex-col items-center gap-4">
              <Face label={sideName(deck, back)} text={card[back]} />
            </div>
            <span className="absolute bottom-6 text-caption font-bold text-faint">{t("Kasten {box}", { box: card.box })}</span>
            {/* край светится, пока тянешь: зелёный — знаю, красный — не знаю */}
            <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 rounded-panel ring-4", dx > 0 ? "ring-ok" : "ring-danger")} style={{ opacity: pull }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnCard;
