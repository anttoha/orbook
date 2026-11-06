import { cn } from "../../shared/utils/cn";

// Колір рядка порівняння: більше пропусків — погано (червоний), менше — добре (зелений)
const TONES = { up: "text-danger", down: "text-ok", same: "text-faint" };

// Картка з великим числом: «11 · Stunden fallen aus · +3 ggü. Aug».
// note — нижній рядок; tone — "up" | "down" | "same", без tone рядок сірий («bis 30. Sept»)
const StatCard = ({ value, label, note, tone }) => (
  <div className="flex min-h-28 min-w-0 flex-col rounded-card bg-card px-3 pt-3 pb-3.5 lg:min-h-24 lg:px-3">
    <p className="text-stat text-ink">{value}</p>
    <p className="mt-0.5 text-caption text-muted">{label}</p>
    {note && <p className={cn("mt-1 text-note font-semibold", tone ? TONES[tone] : "font-extrabold text-faint")}>{note}</p>}
  </div>
);

export default StatCard;
