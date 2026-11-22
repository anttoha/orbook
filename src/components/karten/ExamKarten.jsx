import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useDecks } from "../../shared/hooks/useKarten";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { useClasses } from "../../shared/store/classesStore";
import { useKartenStore } from "../../shared/store/kartenStore";
import { cn } from "../../shared/utils/cn";
import { decksForExam, dueCount, examRef, safeCount } from "../../shared/utils/karten";
import { CheckIcon, KartenIcon } from "../ui/icons";
import DeckBadge from "./DeckBadge";
import LernstandBar from "./LernstandBar";

const tintButton = "flex h-10 w-full items-center justify-center gap-2 rounded-full bg-tint text-row font-extrabold text-accent-ink transition-opacity active:opacity-80";

// Привязанная стопка: «30 von 42 sicher · 12 fällig», полоска, «Jetzt lernen»
const LinkedDeck = ({ deck, today }) => {
  const t = useT();
  const due = dueCount(deck, today);
  return (
    <div className="flex flex-col gap-3 rounded-card bg-card p-3.5 motion-safe:animate-rise-in">
      <div className="flex items-center gap-3.5">
        <DeckBadge subject={deck.subject} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-extrabold text-ink">{deck.name}</p>
          <p className="text-label text-faint">
            {t("{safe} von {n} sicher", { safe: safeCount(deck), n: deck.cards.length })}
            {due > 0 && (
              <>
                {" · "}
                <span className="font-extrabold text-accent-ink">{t("{due} fällig", { due })}</span>
              </>
            )}
          </p>
          <LernstandBar deck={deck} className="mt-2" delay={150} />
        </div>
      </div>
      {deck.cards.length > 0 && (
        <Link to={due > 0 ? `/karteikarten/${deck.id}/lernen` : `/karteikarten/${deck.id}/lernen?alle=1`} className={tintButton}>
          <KartenIcon className="size-4.5" /> {due > 0 ? t("Jetzt lernen") : t("Alle üben")}
        </Link>
      )}
    </div>
  );
};

// Выбор стопок прямо в карточке (вложенная шторка в шторке теста на телефоне ведёт себя плохо)
const DeckChooser = ({ decks, exam, cls }) => {
  const t = useT();
  const updateDeck = useKartenStore((s) => s.updateDeck);
  const linked = (deck) => deck.exam && String(deck.exam.id) === String(exam.id);
  return (
    <ul className="overflow-hidden rounded-card bg-card motion-safe:animate-drop-in">
      {decks.map((deck) => (
        <li key={deck.id} className="mx-3.5 border-hair not-first:border-t">
          <button type="button" onClick={() => updateDeck(deck.id, { exam: linked(deck) ? null : examRef(exam, cls) })} className="flex h-13 w-full items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
            <DeckBadge subject={deck.subject} size="md" />
            <span className="min-w-0 flex-1 truncate text-row font-bold text-ink">{deck.name}</span>
            <span className={cn("grid size-5.5 place-items-center rounded-full transition-colors", linked(deck) ? "bg-accent text-on-accent" : "border border-rule")}>{linked(deck) && <CheckIcon className="size-3.5 motion-safe:animate-check-pop" />}</span>
          </button>
        </li>
      ))}
      <li className="mx-3.5 border-t border-hair">
        <Link to={`/karteikarten/neu?test=${exam.id}${exam.subject?.code ? `&fach=${exam.subject.code}` : ""}`} className="flex h-13 items-center gap-3 text-row font-extrabold text-accent-ink">
          <Plus className="size-5" strokeWidth={2.4} /> {t("Neuer Stapel")}
        </Link>
      </li>
    </ul>
  );
};

// ─────────────────────────────────────────────────────────────
// «Karteikarten» в шторке теста (часть 43, макет handy-10): привязанные стопки и «Stapel wählen».
// Только у будущих тестов. Стопок вообще нет — одна кнопка «Karteikarten zum Test» (форма с тестом и предметом)
// ─────────────────────────────────────────────────────────────
const ExamKarten = ({ exam }) => {
  const t = useT();
  const { today } = useNow();
  const cls = useClasses((s) => s.activeId);
  const decks = useDecks();
  const [choosing, setChoosing] = useState(false);
  if (exam.date < today) return null;
  const linked = decksForExam(decks, exam.id, cls);

  if (decks.length === 0) {
    return (
      <Link to={`/karteikarten/neu?test=${exam.id}${exam.subject?.code ? `&fach=${exam.subject.code}` : ""}`} className={cn(tintButton, "h-12")}>
        <KartenIcon className="size-4.5" /> {t("Karteikarten zum Test")}
      </Link>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-hint font-extrabold text-faint">{t("Karteikarten")}</h3>
        <button type="button" onClick={() => setChoosing(!choosing)} aria-expanded={choosing} className="rounded-full text-hint font-extrabold text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
          {choosing ? t("Fertig") : t("Stapel wählen")}
        </button>
      </div>
      {choosing ? <DeckChooser decks={decks} exam={exam} cls={cls} /> : linked.map((deck) => <LinkedDeck key={deck.id} deck={deck} today={today} />)}
      {!choosing && linked.length === 0 && (
        <button type="button" onClick={() => setChoosing(true)} className={cn(tintButton, "h-12")}>
          <KartenIcon className="size-4.5" /> {t("Karteikarten zum Test")}
        </button>
      )}
    </section>
  );
};

export default ExamKarten;
