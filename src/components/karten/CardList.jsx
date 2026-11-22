import { useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { Plus } from "lucide-react";

const FIRST = 6; // сначала видно 6 карточек, остальные — по «Alle N anzeigen»

// ─────────────────────────────────────────────────────────────
// Карточки стопки (макет 43 handy-02): «the journey … die Reise». Нажатие — шторка «Karte bearbeiten».
// onAdd — «+ Karte», onOpen(card) — правка. rows — сколько показывать без «Alle anzeigen» (на ПК больше)
// ─────────────────────────────────────────────────────────────
const CardList = ({ cards, onAdd, onOpen, rows = FIRST }) => {
  const t = useT();
  const [all, setAll] = useState(false);
  const shown = all ? cards : cards.slice(0, rows);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-hint font-extrabold text-faint">{t("Karten · {n}", { n: cards.length })}</h2>
        <button type="button" onClick={onAdd} className="flex items-center gap-1 rounded-full text-hint font-extrabold text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
          <Plus className="size-4" strokeWidth={2.4} /> {t("Karte")}
        </button>
      </div>
      {cards.length === 0 ? (
        <p className="rounded-card bg-card px-4 py-4 text-body-sm text-muted">{t("Noch keine Karten")}</p>
      ) : (
        <ul className="overflow-hidden rounded-card bg-card">
          {shown.map((card, i) => (
            <li key={card.id} className="border-hair not-first:border-t mx-4">
              <button
                type="button"
                onClick={() => onOpen(card)}
                className="flex min-h-12.5 w-full items-center gap-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50 motion-safe:animate-item-rise"
                style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
              >
                <span className="min-w-0 flex-1 truncate text-row font-bold text-ink">{card.a}</span>
                <span className="min-w-0 max-w-1/2 truncate text-body-sm text-muted">{card.b}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!all && cards.length > rows && (
        <button type="button" onClick={() => setAll(true)} className="self-center rounded-full px-3 py-1 text-label font-extrabold text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
          {t("Alle {n} anzeigen", { n: cards.length })}
        </button>
      )}
    </section>
  );
};

export default CardList;
