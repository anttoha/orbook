import { Link } from "react-router-dom";
import { useDeckExam } from "../../shared/hooks/useKarten";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { allSafe, dueCount } from "../../shared/utils/karten";
import { shortDay } from "../../shared/utils/lernplan";
import Badge from "../ui/Badge";
import DeckBadge from "./DeckBadge";
import LernstandBar from "./LernstandBar";

// ─────────────────────────────────────────────────────────────
// Строка стопки (макет 43 handy-01): кружок предмета, имя, «42 Karten · 12 fällig», полоска Lernstand,
// бейдж теста. selected — открытая стопка на ПК (обводка акцентом)
// ─────────────────────────────────────────────────────────────
const DeckRow = ({ deck, today, selected = false, index = 0 }) => {
  const t = useT();
  const exam = useDeckExam(deck);
  const due = dueCount(deck, today);
  const n = deck.cards.length;
  return (
    <Link
      to={`/karteikarten/${deck.id}`}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "flex items-center gap-3.5 rounded-card bg-card px-3.5 py-3.5 outline-none transition-[box-shadow,scale] duration-200 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-99 motion-safe:animate-item-rise",
        selected && "ring-1 ring-accent",
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <DeckBadge subject={deck.subject} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-body font-extrabold text-ink">{deck.name}</p>
          {exam && <Badge>{t("Test {day}", { day: shortDay(exam.date) })}</Badge>}
        </div>
        <p className="mt-0.5 text-label text-faint">
          {n === 1 ? t("1 Karte") : t("{n} Karten", { n })}
          {" · "}
          {due > 0 ? <span className="font-extrabold text-accent-ink">{t("{due} fällig", { due })}</span> : allSafe(deck, today) ? <span className="font-extrabold text-ok">{t("alles sicher")}</span> : t("nichts fällig")}
        </p>
        <LernstandBar deck={deck} className="mt-2" delay={120 + Math.min(index, 8) * 40} />
      </div>
    </Link>
  );
};

export default DeckRow;
