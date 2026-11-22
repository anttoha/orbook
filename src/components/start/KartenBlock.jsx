import { useDecks, useSubjectName } from "../../shared/hooks/useKarten";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { dueCount, totalDue } from "../../shared/utils/karten";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";

// ─────────────────────────────────────────────────────────────
// Блок «Karteikarten» (часть 43, макет handy-08): сколько карточек fällig и первая такая стопка.
// Нажатие — сразу «Lernen» (всё fällige); нечего учить — раздел
// ─────────────────────────────────────────────────────────────
const KartenBlock = ({ editing }) => {
  const t = useT();
  const { today } = useNow();
  const decks = useDecks();
  const nameOf = useSubjectName();
  const due = totalDue(decks, today);
  const first = decks.find((deck) => dueCount(deck, today) > 0);

  const body = () => {
    if (decks.length === 0) return <BlockEmpty text={t("Noch keine Stapel")} />;
    if (due === 0) return <BlockEmpty text={t("Alles gelernt")} />;
    return (
      <>
        <p className="flex items-baseline gap-1.5">
          <span className="text-stat text-ink">{due}</span>
          <span className="text-body-sm font-semibold text-muted">{t("fällig")}</span>
        </p>
        <p className="mt-auto truncate text-body-sm font-semibold text-ink">{[first.subject && nameOf(first.subject), first.name].filter(Boolean).join(" · ")}</p>
        <p className="truncate text-caption font-bold text-accent-ink">{t("heute lernen")}</p>
      </>
    );
  };

  return (
    <BlockCard kind="karteikarten" title={t("Karteikarten")} to={due > 0 ? "/karteikarten/lernen" : "/karteikarten"} editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default KartenBlock;
