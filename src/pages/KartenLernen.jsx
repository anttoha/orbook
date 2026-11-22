import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import LearnCard from "../components/karten/LearnCard";
import LearnDone from "../components/karten/LearnDone";
import Button from "../components/ui/Button";
import { CheckIcon, FlipIcon } from "../components/ui/icons";
import ProgressBar from "../components/ui/ProgressBar";
import RoundButton from "../components/ui/RoundButton";
import StateScreen from "../components/ui/StateScreen";
import { useHotkeys } from "../shared/hooks/useHotkeys";
import { useDecks } from "../shared/hooks/useKarten";
import { useNow } from "../shared/hooks/useNow";
import { useT } from "../shared/hooks/useT";
import { useKartenStore } from "../shared/store/kartenStore";
import { cn } from "../shared/utils/cn";
import { nextRound, pooled, sessionQueue, sessionResult } from "../shared/utils/karten";
import { motionMs } from "../shared/utils/motion";

const FLY_MS = 340; // сколько летит отвеченная карточка (animate-fly-*)

// Новая сессия: очередь карточек и снимок стопок «до» (для итога)
const startSession = (decks, today, mode) => ({ queue: sessionQueue(decks, today, { all: mode === "all" }), index: 0, answers: [], mode, before: decks });

// ─────────────────────────────────────────────────────────────
// «Lernen» (часть 43, макеты handy-03…05, pc-02):
//   /karteikarten/lernen        — всё fällige из всех стопок («Heute lernen», блок Start, Aufgaben)
//   /karteikarten/:id/lernen    — одна стопка; ?alle=1 — «Alle üben» (коробки не двигаются)
// Ответ сразу сохраняется (kartenStore.answerCard): вышел посередине — сделанное не пропадает.
// Клавиатура: Пробел/Enter — перевернуть, → — «Weiß ich», ← — «Weiß ich nicht».
// ─────────────────────────────────────────────────────────────
const KartenLernen = () => {
  const t = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const { today } = useNow();
  const decks = useDecks();
  const answerCard = useKartenStore((s) => s.answerCard);
  const source = id ? decks.filter((deck) => deck.id === id) : decks;
  const [session, setSession] = useState(() => startSession(source, today, params.get("alle") === "1" ? "all" : "due"));
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(null); // "right" | "left" — карточка улетает
  const timer = useRef(null);
  const backTo = id ? `/karteikarten/${id}` : "/karteikarten";
  const { queue, index } = session;
  const item = queue[index];
  const deck = item ? decks.find((d) => d.id === item.deckId) : null;

  const answer = (known) => {
    if (!item || leaving || !flipped) return;
    if (session.mode === "due") answerCard(item.deckId, item.card.id, known, today);
    setLeaving(known ? "right" : "left");
    timer.current = setTimeout(() => {
      setSession((s) => ({ ...s, index: s.index + 1, answers: [...s.answers, { ...item, known }] }));
      setFlipped(false);
      setLeaving(null);
    }, motionMs(FLY_MS));
  };
  const flip = () => !leaving && setFlipped(true);

  // Клавиши: Пробел/Enter — перевернуть, стрелки — ответ (useHotkeys сам убирает слушатель)
  useHotkeys(flipped ? { arrowright: () => answer(true), arrowleft: () => answer(false) } : { " ": flip, enter: flip });
  // Ушли с экрана, пока карточка летит, — таймер больше не нужен
  useEffect(() => () => clearTimeout(timer.current), []);

  const title = id ? (source[0]?.name ?? t("Karteikarten")) : t("Heute lernen");
  const top = (
    <header className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <RoundButton to={backTo} aria-label={t("Schließen")}>
          <X className="size-4.5" />
        </RoundButton>
        <h1 className="min-w-0 flex-1 truncate text-center text-row font-extrabold text-ink">{title}</h1>
        <span className="w-9.5 text-right text-label font-extrabold text-muted tabular-nums">{queue.length > 0 && `${Math.min(index + 1, queue.length)} / ${queue.length}`}</span>
      </div>
      <ProgressBar done={index} total={queue.length} className="h-1.5" />
    </header>
  );

  if (queue.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-140 flex-1 flex-col gap-6">
        {top}
        <StateScreen icon={CheckIcon} title={t("Nichts fällig")} text={t("Alles für heute gelernt.")}>
          {id && <Button onClick={() => setSession(startSession(source, today, "all"))}>{t("Alle üben")}</Button>}
        </StateScreen>
      </section>
    );
  }

  if (!item) {
    const ids = [...new Set(queue.map((q) => q.deckId))];
    const after = pooled(decks, ids);
    const result = session.mode === "due" ? sessionResult(pooled(session.before, ids), after, session.answers) : { ...sessionResult(after, after, session.answers), moved: null };
    const again = () => {
      setSession({ queue: session.answers.filter((a) => !a.known).map(({ deckId, card, side }) => ({ deckId, card, side })), index: 0, answers: [], mode: "retry", before: decks });
    };
    return (
      <section className="mx-auto flex w-full max-w-140 flex-col gap-6">
        {top}
        <LearnDone total={session.answers.length} result={result} next={nextRound(decks.filter((d) => ids.includes(d.id)), today)} today={today} onAgain={again} onDone={() => navigate(backTo)} />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-140 flex-1 flex-col gap-7 pb-2">
      {top}
      {deck && <LearnCard deck={deck} card={item.card} side={item.side} flipped={flipped} leaving={leaving} onFlip={flip} onAnswer={answer} className="h-118 max-h-[62vh] min-h-80" />}
      <div className={cn("flex gap-2", !flipped && "motion-safe:animate-fade-in")} key={flipped ? "back" : "front"}>
        {flipped ? (
          <>
            <Button variant="danger" onClick={() => answer(false)} disabled={Boolean(leaving)}>
              <X className="size-4" /> {t("Weiß ich nicht")}
            </Button>
            <Button variant="primary" onClick={() => answer(true)} disabled={Boolean(leaving)}>
              <CheckIcon className="size-4" /> {t("Weiß ich")}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={flip}>
            <FlipIcon className="size-4.5" /> {t("Umdrehen")}
          </Button>
        )}
      </div>
    </section>
  );
};

export default KartenLernen;
