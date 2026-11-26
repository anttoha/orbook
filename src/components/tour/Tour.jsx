import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useEndTour } from "../../shared/hooks/useEndTour";
import { useTourTarget } from "../../shared/hooks/useTourTarget";
import { useTourStore } from "../../shared/store/tourStore";
import { stepDone, TOUR_STEPS } from "../../shared/utils/tour";
import TourBubble from "./TourBubble";
import TourWelcome from "./TourWelcome";

// ─────────────────────────────────────────────────────────────
// Rundgang (часть 52, макеты design/neu/52-rundgang): слой поверх приложения.
// Приветствие → шаги. Прожектор — рамка с тенью цвета затемнения; клики ловят прозрачные блоки вокруг него.
// В шагах «tippen» и «probieren» дырка открыта: элемент под ней работает как обычно.
// ─────────────────────────────────────────────────────────────
const Tour = () => {
  const phase = useTourStore((s) => s.phase);
  if (phase === "welcome") return createPortal(<TourWelcome />, document.body);
  if (phase === "tour") return createPortal(<TourSteps />, document.body);
  return null;
};

const TourSteps = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const index = useTourStore((s) => s.step);
  const next = useTourStore((s) => s.next);
  const end = useEndTour();
  const step = TOUR_STEPS[index];
  const last = index === TOUR_STEPS.length - 1;

  // Элемента нет: у шага-действия сами открываем нужную страницу (тур идёт дальше), остальное пропускаем
  const missing = () => {
    if (step.fallback && !stepDone(step, pathname)) navigate(step.fallback);
    else if (last) end();
    else next();
  };
  const spot = useTourTarget(step.target, true, missing);

  // Шаг-действие: человек открыл нужную страницу — следующий шаг
  useEffect(() => {
    if (stepDone(step, pathname)) next();
  }, [step, pathname, next]);

  // Esc — выйти из тура (ПК)
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && end();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- end закрывает тур и всегда одинаков по смыслу

  const open = step.mode !== "weiter"; // в дырку можно нажать
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {spot ? <Blockers spot={spot} open={open} /> : <div className="pointer-events-auto absolute inset-0 bg-overlay motion-safe:animate-fade-in" />}
      {spot && (
        <div
          aria-hidden="true"
          className="tour-spot pointer-events-none absolute border-2 border-accent motion-reduce:transition-none"
          style={{ left: spot.x, top: spot.y, width: spot.w, height: spot.h, borderRadius: spot.r }}
        >
          {step.mode === "tippen" && <Pulse key={index} radius={spot.r} />}
        </div>
      )}
      <TourBubble step={step} index={index} spot={spot} last={last} onNext={last ? end : next} onSkip={end} />
    </div>
  );
};

// Прозрачные блоки вокруг прожектора: клик мимо элемента никуда не уходит (сам слой тура клики пропускает)
const Blockers = ({ spot, open }) => {
  const right = spot.x + spot.w;
  const bottom = spot.y + spot.h;
  return (
    <>
      <div className="pointer-events-auto absolute inset-x-0 top-0" style={{ height: spot.y }} />
      <div className="pointer-events-auto absolute inset-x-0 bottom-0" style={{ top: bottom }} />
      <div className="pointer-events-auto absolute left-0" style={{ top: spot.y, height: spot.h, width: spot.x }} />
      <div className="pointer-events-auto absolute right-0" style={{ top: spot.y, height: spot.h, left: right }} />
      {!open && <div className="pointer-events-auto absolute" style={{ left: spot.x, top: spot.y, width: spot.w, height: spot.h }} />}
    </>
  );
};

// Шаг-действие: от рамки расходятся два кольца — «нажми сюда»
const Pulse = ({ radius }) =>
  [0, 0.8].map((delay) => (
    <span
      key={delay}
      className="absolute -inset-1.5 border-2 border-accent opacity-0 motion-safe:animate-tour-pulse"
      style={{ borderRadius: radius + 6, animationDelay: `${delay}s` }}
    />
  ));

export default Tour;
