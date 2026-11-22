import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useDeckExam } from "../../shared/hooks/useKarten";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { useKartenStore } from "../../shared/store/kartenStore";
import { cn } from "../../shared/utils/cn";
import { boxCounts, dueCount, sideName } from "../../shared/utils/karten";
import Button from "../ui/Button";
import { KartenIcon } from "../ui/icons";
import Segmented from "../ui/Segmented";
import BoxesCard from "./BoxesCard";
import CardList from "./CardList";
import CardSheet from "./CardSheet";
import TestLink from "./TestLink";

// ─────────────────────────────────────────────────────────────
// Стопка (макет 43 handy-02, pc-01 справа): тест, «Lernstand», «Zuerst zeigen», кнопки «lernen», карточки.
// wide — ПК: слева настройки и кнопки, справа карточки
// ─────────────────────────────────────────────────────────────
const DeckView = ({ deck, today, wide = false }) => {
  const t = useT();
  const navigate = useNavigate();
  const exam = useDeckExam(deck);
  const updateDeck = useKartenStore((s) => s.updateDeck);
  const [params, setParams] = useSearchParams();
  // { card } — шторка карточки (card = null — новая). ?karte=neu — сразу после «Neuer Stapel · Einzeln»
  const [sheet, setSheet] = useState(() => (params.get("karte") === "neu" ? { card: null } : null));
  const closeSheet = () => {
    setSheet(null);
    if (params.has("karte")) setParams({}, { replace: true });
  };
  const due = dueCount(deck, today);
  const n = deck.cards.length;
  const first = [
    { value: "a", label: sideName(deck, "a") },
    { value: "b", label: sideName(deck, "b") },
    { value: "mix", label: translate("Gemischt") },
  ];

  const controls = (
    <div className="flex flex-col gap-5.5">
      {exam && <TestLink exam={exam} today={today} compact={wide} />}
      <section className="flex flex-col gap-3">
        <h2 className="text-hint font-extrabold text-faint">{t("Lernstand")}</h2>
        <BoxesCard counts={boxCounts(deck)} />
      </section>
      {n > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-hint font-extrabold text-faint">{t("Zuerst zeigen")}</h2>
          <Segmented options={first} value={deck.first} onChange={(value) => updateDeck(deck.id, { first: value })} label={t("Zuerst zeigen")} />
        </section>
      )}
      {n > 0 && (
        <div className="flex flex-col gap-2.5">
          {due > 0 && (
            <Button variant="primary" onClick={() => navigate(`/karteikarten/${deck.id}/lernen`)} className="flex-none">
              <KartenIcon className="size-4.5" /> {t("{due} fällige lernen", { due })}
            </Button>
          )}
          <Button onClick={() => navigate(`/karteikarten/${deck.id}/lernen?alle=1`)} className="flex-none">
            <RotateCcw className="size-4" /> {t("Alle {n} üben", { n })}
          </Button>
        </div>
      )}
    </div>
  );
  const cards = <CardList key={deck.id} cards={deck.cards} rows={wide ? 11 : 6} onAdd={() => setSheet({ card: null })} onOpen={(card) => setSheet({ card })} />;

  return (
    <>
      <div className={cn(wide ? "grid grid-cols-2 items-start gap-5" : "flex flex-col gap-7")}>
        {controls}
        {cards}
      </div>
      <CardSheet open={Boolean(sheet)} onClose={closeSheet} deck={deck} card={sheet?.card ?? null} />
    </>
  );
};

export default DeckView;
