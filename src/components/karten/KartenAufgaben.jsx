import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useDecks, useSubjectName } from "../../shared/hooks/useKarten";
import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { dueCount } from "../../shared/utils/karten";
import { fachClasses } from "../../shared/utils/lessons";
import { KartenIcon } from "../ui/icons";

// ─────────────────────────────────────────────────────────────
// «Karteikarten» в «Aufgaben» (часть 43, макет handy-09): строка на каждую стопку, где сегодня есть fällig.
// Нажатие — сразу учить эту стопку. Всё повторил — строка сама исчезает (галочки нет)
// ─────────────────────────────────────────────────────────────
const KartenAufgaben = ({ today }) => {
  const t = useT();
  const decks = useDecks().filter((deck) => dueCount(deck, today) > 0);
  const nameOf = useSubjectName();
  const overrides = useUserStore((s) => s.colorOverrides);
  if (decks.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="mb-0.75 text-hint font-extrabold text-faint">{t("Heute")}</h2>
      {decks.map((deck, i) => {
        const n = dueCount(deck, today);
        return (
          <Link
            key={deck.id}
            to={`/karteikarten/${deck.id}/lernen`}
            style={{ animationDelay: `${i * 35}ms` }}
            className="flex items-center gap-3 rounded-card bg-card py-2.5 pr-3 pl-3 outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-98 motion-safe:animate-rise-in"
          >
            <span className={cn("grid h-11 w-9.5 shrink-0 place-items-center rounded-tile", deck.subject ? fachClasses(deck.subject, overrides) : "bg-sand text-muted")}>
              <KartenIcon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-note text-faint">
                <span className="font-extrabold text-accent-ink">{t("Karteikarten")}</span>
                {deck.subject && ` · ${nameOf(deck.subject)}`}
                {" · "}
                <span className="font-bold text-accent-ink">{t("heute")}</span>
              </span>
              <span className="mt-1 block truncate text-row font-extrabold text-ink">
                {deck.name} · {n === 1 ? t("1 Karte") : t("{n} Karten", { n })}
              </span>
            </span>
            <ChevronRight className="size-4.5 shrink-0 text-faint2" />
          </Link>
        );
      })}
    </section>
  );
};

export default KartenAufgaben;
