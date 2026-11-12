import { cn } from "../../shared/utils/cn";

// Кольори бейджів за типом
const variants = {
  changed: "bg-tint text-accent-ink", // VERTRETUNG, RAUM
  cancelled: "border border-dashed border-faint2 text-muted", // FÄLLT AUS: тільки пунктирна рамка, без заливки
  exam: "bg-accent text-on-accent", // KLAUSUR
  soft: "bg-sand text-muted", // TEST, ABGABE
  live: "bg-accent text-on-accent", // LÄUFT · 27 MIN
  ok: "bg-ok-tint text-ok", // AKTIV, OK (адмінка)
  off: "bg-sand text-faint", // GESPERRT
  danger: "bg-danger-tint text-danger", // ABGELAUFEN, FEHLER
};

// Маленький бейдж великими літерами: <Badge variant="changed">Vertretung</Badge>
const Badge = ({ variant = "changed", className, children, ...rest }) => {
  return (
    <span
      className={cn(
        "inline-flex h-4.75 shrink-0 items-center rounded-full px-2 text-room leading-none font-extrabold tracking-badge whitespace-nowrap uppercase",
        variants[variant], // колір за типом
        className,
      )}
      {...rest} // например style для задержки анимации
    >
      {children}
    </span>
  );
};

export default Badge;
