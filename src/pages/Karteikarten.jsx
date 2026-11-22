import { useParams } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import DeckList from "../components/karten/DeckList";
import DeckMenu from "../components/karten/DeckMenu";
import DeckView from "../components/karten/DeckView";
import HeuteCard from "../components/karten/HeuteCard";
import KartenEmpty from "../components/karten/KartenEmpty";
import RoundButton from "../components/ui/RoundButton";
import StateScreen from "../components/ui/StateScreen";
import { useDecks, useSubjectName } from "../shared/hooks/useKarten";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useT } from "../shared/hooks/useT";
import { totalDue } from "../shared/utils/karten";

// Шапка: строка над заголовком, заголовок, справа кнопки. backTo — «назад» (стопка на телефоне)
const Header = ({ eyebrow, title, aside, backTo, accent = false }) => {
  const t = useT();
  return (
    <header className="flex items-end gap-2.5">
      {backTo && (
        <RoundButton to={backTo} aria-label={t("Zurück")}>
          <ChevronLeft className="size-4.5" />
        </RoundButton>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className={accent ? "text-hint font-extrabold text-accent-ink" : "text-hint font-extrabold text-faint"}>{eyebrow}</p>
        <h1 className="truncate text-title text-ink lg:text-hero">{title}</h1>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
};

// «+» — как в «Aufgaben»: круглая акцентная кнопка
const ROUND = "grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-90";

const NewButton = () => {
  const t = useT();
  return (
    <RoundButton to="/karteikarten/neu" look={ROUND} aria-label={t("Neuer Stapel")}>
      <Plus className="size-4.5" strokeWidth={2.4} />
    </RoundButton>
  );
};

// ─────────────────────────────────────────────────────────────
// Karteikarten (часть 43): /karteikarten и /karteikarten/:id.
// Телефон: список (handy-01) или стопка (handy-02). ПК (pc-01): слева список, справа открытая стопка (или первая).
// Всё лежит на устройстве (kartenStore) — загрузки нет.
// ─────────────────────────────────────────────────────────────
const Karteikarten = () => {
  const t = useT();
  const { id } = useParams();
  const { today } = useNow();
  const decks = useDecks();
  const nameOf = useSubjectName();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const due = totalDue(decks, today);
  const eyebrow = due > 0 ? t("Heute {due} fällig", { due }) : t("Nichts fällig");
  const deck = id ? decks.find((d) => d.id === id) : isDesktop ? decks[0] : null;

  if (id && !deck) return <StateScreen title={t("Diesen Stapel gibt es nicht (mehr).")} />;

  const deckEyebrow = deck ? `${nameOf(deck.subject)} · ${deck.cards.length === 1 ? t("1 Karte") : t("{n} Karten", { n: deck.cards.length })}` : "";

  if (!isDesktop && deck) {
    return (
      <section className="flex flex-col gap-5.5">
        <Header backTo="/karteikarten" eyebrow={deckEyebrow} accent title={deck.name} aside={<DeckMenu deck={deck} />} />
        <DeckView key={deck.id} deck={deck} today={today} />
      </section>
    );
  }

  const list = (
    <div className="flex min-w-0 flex-col gap-5.5">
      <Header eyebrow={eyebrow} title={t("Karteikarten")} aside={<NewButton />} />
      {decks.length === 0 ? (
        <KartenEmpty />
      ) : (
        <>
          <HeuteCard decks={decks} today={today} />
          <DeckList decks={decks} today={today} selected={isDesktop ? deck?.id : null} />
        </>
      )}
    </div>
  );

  if (!isDesktop || !deck) return <section className="flex flex-1 flex-col">{list}</section>;

  return (
    <section className="grid grid-cols-5 items-start gap-9">
      <div className="col-span-2">{list}</div>
      {/* Сменилась стопка — проявляется только правая колонка */}
      <div key={deck.id} className="col-span-3 flex min-w-0 flex-col gap-5.5 motion-safe:animate-panel-in">
        <Header eyebrow={deckEyebrow} accent title={deck.name} aside={<DeckMenu deck={deck} />} />
        <DeckView deck={deck} today={today} wide />
      </div>
    </section>
  );
};

export default Karteikarten;
