import { useParams, useSearchParams } from "react-router-dom";
import DeckForm from "../components/karten/DeckForm";
import PageHeader from "../components/ui/PageHeader";
import StateScreen from "../components/ui/StateScreen";
import { useDeck } from "../shared/hooks/useKarten";
import { useT } from "../shared/hooks/useT";

// ─────────────────────────────────────────────────────────────
// /karteikarten/neu (?test=12&fach=En — из шторки теста) и /karteikarten/:id/bearbeiten (часть 43)
// ─────────────────────────────────────────────────────────────
const KartenEdit = () => {
  const t = useT();
  const { id } = useParams();
  const [params] = useSearchParams();
  const deck = useDeck(id);
  if (id && !deck) return <StateScreen title={t("Diesen Stapel gibt es nicht (mehr).")} />;
  return (
    <section className="flex flex-col gap-5.5 lg:max-w-186">
      <PageHeader backTo={deck ? `/karteikarten/${deck.id}` : "/karteikarten"} eyebrow={t("Karteikarten")} eyebrowClassName="text-accent-ink" title={deck ? t("Stapel bearbeiten") : t("Neuer Stapel")} />
      <DeckForm key={deck?.id ?? "neu"} deck={deck} preset={{ exam: params.get("test"), subject: params.get("fach") }} />
    </section>
  );
};

export default KartenEdit;
