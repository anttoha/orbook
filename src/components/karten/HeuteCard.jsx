import { Link } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { dueCount, nextRound } from "../../shared/utils/karten";
import { daysLeftText, daysBetween } from "../../shared/utils/format";
import { KartenIcon } from "../ui/icons";

// ─────────────────────────────────────────────────────────────
// «Heute lernen» (макет 43 handy-01): сколько карточек пора повторить во всех стопках и одна кнопка.
// Нечего повторять — «Alles gelernt» и когда следующая порция.
// ─────────────────────────────────────────────────────────────
const HeuteCard = ({ decks, today, className }) => {
  const t = useT();
  const due = decks.reduce((sum, deck) => sum + dueCount(deck, today), 0);
  const from = decks.filter((deck) => dueCount(deck, today) > 0).length;
  const next = due === 0 ? nextRound(decks, today) : null;

  return (
    <section className={cn("flex items-center gap-4 rounded-card bg-tint px-4.5 py-4", className)}>
      <div className="min-w-0 flex-1">
        <p className="text-hint font-extrabold text-accent-ink">{t("Heute lernen")}</p>
        {due > 0 ? (
          <p className="mt-1 flex items-center gap-2">
            <span key={due} className="text-stat leading-none text-ink tabular-nums motion-safe:animate-count-pop">
              {due}
            </span>
            <span className="leading-tight">
              <span className="block text-row font-extrabold text-ink">{due === 1 ? t("Karte") : t("Karten")}</span>
              <span className="block text-label text-muted">{from === 1 ? t("aus 1 Stapel") : t("aus {from} Stapeln", { from })}</span>
            </span>
          </p>
        ) : (
          <p className="mt-1">
            <span className="block text-subhead font-extrabold text-ink">{t("Alles gelernt")}</span>
            {next && <span className="block text-label text-muted">{t("Nächste Runde: {when} · {count} Karten", { when: daysLeftText(daysBetween(today, next.date)), count: next.count })}</span>}
          </p>
        )}
      </div>
      {due > 0 && (
        <Link to="/karteikarten/lernen" className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-5 text-row font-bold text-on-accent transition-opacity active:opacity-80">
          <KartenIcon className="size-4.5" /> {t("Lernen")}
        </Link>
      )}
    </section>
  );
};

export default HeuteCard;
