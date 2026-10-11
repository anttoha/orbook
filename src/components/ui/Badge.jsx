import { cn } from "../../shared/utils/cn";

// Кольори бейджів за типом
const variants = {
  changed: "bg-tint text-accent-ink", // VERTRETUNG, RAUM
  cancelled: "bg-sand text-faint", // FÄLLT AUS
  exam: "bg-accent text-on-accent", // KLAUSUR, TEST
  live: "bg-accent text-on-accent", // LÄUFT · 27 MIN
};

// Маленький бейдж великими літерами: <Badge variant="changed">Vertretung</Badge>
const Badge = ({ variant = "changed", className, children }) => {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-1 text-micro leading-none font-extrabold tracking-wide whitespace-nowrap uppercase",
        variants[variant], // колір за типом
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
