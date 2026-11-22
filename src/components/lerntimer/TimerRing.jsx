import { cn } from "../../shared/utils/cn";

const R = 105; // радиус кольца в viewBox 240×240
const C = 2 * Math.PI * R; // длина окружности

// Цифры «17:42»: каждая цифра — отдельный span с key по значению,
// поэтому сменившаяся цифра появляется заново и «перелистывается» (animate-digit-in)
const Digits = ({ text }) => (
  <span className="inline-flex tabular-nums" aria-hidden="true">
    {[...text].map((ch, i) => (
      <span key={`${i}-${ch}`} className={cn("inline-block", ch !== ":" && "motion-safe:animate-digit-in")}>
        {ch}
      </span>
    ))}
  </span>
);

// ─────────────────────────────────────────────────────────────
// Кольцо Lerntimer (макет 44 handy-01…04, pc-01): серый круг и дуга «осталось», в центре минуты.
//   progress — 1 (полное) … 0 (пусто); phase — "focus" | "pause" (зелёное); paused — бледнеет и «дышит»;
//   top — «FOKUS» / «PAUSE» / «PAUSIERT»; time — «17:42»; bottom — «fertig um 16:52»; large — ПК.
//   pulse — меняется при старте фазы: кольцо «вдыхает» (animate-ring-start)
// ─────────────────────────────────────────────────────────────
const TimerRing = ({ progress, phase = "focus", paused = false, running = false, top, time, bottom, large = false, pulse }) => {
  const pause = phase === "pause";
  const tone = pause ? "stroke-ok" : "stroke-accent";
  const showKnob = progress > 0 && progress < 1;
  return (
    <div role="timer" aria-label={`${top} ${time}`} className={cn("relative grid place-items-center", large ? "size-80" : "size-60")}>
      {/* мягкое свечение под кольцом, пока таймер идёт */}
      {running && !paused && <span className={cn("absolute inset-6 rounded-full blur-2xl motion-safe:animate-timer-glow", pause ? "bg-ok" : "bg-accent")} />}
      <svg key={pulse} viewBox="0 0 240 240" className={cn("absolute inset-0 size-full motion-safe:animate-ring-start", paused && "motion-safe:animate-ring-breathe")}>
        <circle cx="120" cy="120" r={R} fill="none" strokeWidth="14" className="stroke-sand" />
        <circle
          cx="120"
          cy="120"
          r={R}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          transform="rotate(-90 120 120)"
          className={cn("ring-motion", tone, paused && "opacity-45")}
        />
        {/* точка на конце дуги: крутится вместе с остатком */}
        {showKnob && (
          <g className="ring-motion" style={{ rotate: `${progress * 360}deg`, transformOrigin: "120px 120px" }}>
            <circle cx="120" cy={120 - R} r="10" strokeWidth="3" className={cn("fill-card ring-motion", tone, paused && "opacity-45")} />
          </g>
        )}
      </svg>
      <div className="relative flex flex-col items-center">
        <p className={cn("text-small font-extrabold tracking-widest", paused ? "text-faint" : pause ? "text-ok" : "text-accent-ink")}>{top}</p>
        <p className={cn("mt-2", large ? "text-timer-pc" : "text-timer", paused ? "text-muted" : "text-ink")}>
          <Digits text={time} />
        </p>
        <p className="mt-2.5 min-h-5 text-label font-bold text-faint">{bottom}</p>
      </div>
    </div>
  );
};

export default TimerRing;
