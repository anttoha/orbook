import { useEffect, useRef, useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { bubblePlace, TOUR_STEPS } from "../../shared/utils/tour";
import { CheckIcon } from "../ui/icons";

// Ширина пузыря: на телефоне почти во всю ширину (макет 354 из 390), на ПК — 360
const widthOf = (view) => Math.min(360, view - 36);

// Высота пузыря меняется с текстом и переводом — меряем её, чтобы поставить пузырь над элементом
const useHeight = () => {
  const ref = useRef(null);
  const [height, setHeight] = useState(130);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.target.offsetHeight));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, height];
};

// ─────────────────────────────────────────────────────────────
// Пузырь шага (макеты 52 handy-01…07): заголовок и «3/11», одна строка, внизу точки шагов,
// «Überspringen» и «Weiter» («Fertig» на последнем). У шага-действия «Weiter» нет — нажимают сам элемент.
// Пузырь едет за прожектором (tour-move), содержимое нового шага выпрыгивает (tour-pop).
// ─────────────────────────────────────────────────────────────
const TourBubble = ({ step, index, spot, last, onNext, onSkip }) => {
  const t = useT();
  const [ref, height] = useHeight();
  const view = { width: window.innerWidth, height: window.innerHeight };
  const w = widthOf(view.width);
  const place = bubblePlace(spot, { w, h: height }, view);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={t("Rundgang")}
      className="tour-move pointer-events-auto absolute top-0 left-0 motion-reduce:transition-none"
      style={{ width: w, translate: `${place.x}px ${place.y}px` }}
    >
      <div key={index} className="relative rounded-panel bg-card p-4.5 shadow-sheet motion-safe:animate-tour-pop">
        <Arrow place={place} />
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-subhead text-ink">{t(step.title)}</h2>
          <span className="text-caption font-extrabold text-faint">
            {index + 1}/{TOUR_STEPS.length}
          </span>
        </div>
        <p className="mt-1.5 text-nav text-muted">{t(step.text)}</p>
        <div className="mt-4 flex items-center gap-3">
          <Dots index={index} />
          {!last && (
            <button type="button" onClick={onSkip} className="ml-auto text-nav font-extrabold text-muted">
              {t("Überspringen")}
            </button>
          )}
          {step.mode !== "tippen" && <NextButton last={last} onClick={onNext} />}
        </div>
      </div>
    </div>
  );
};

const NextButton = ({ last, onClick }) => {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex h-9.5 items-center gap-1.5 rounded-full bg-accent px-5 text-nav font-extrabold text-on-accent transition-transform active:scale-95", last && "ml-auto")}
    >
      {last && <CheckIcon className="size-4" />}
      {last ? t("Fertig") : t("Weiter")}
    </button>
  );
};

// Точки шагов: текущий — вытянутая «пилюля», ширина меняется плавно. Шагов 11 — точки мелкие, чтобы влезли кнопки
const Dots = ({ index }) => (
  <div className="flex items-center gap-1" aria-hidden="true">
    {TOUR_STEPS.map((step, i) => (
      <span key={step.id} className={cn("h-1.5 rounded-full transition-all duration-300 ease-soft", i === index ? "w-3.5 bg-accent" : "w-1.5 bg-faint2")} />
    ))}
  </div>
);

// Хвостик к элементу: квадрат, повёрнутый на 45°, наполовину спрятан под пузырём
const Arrow = ({ place }) => {
  if (!place.side) return null;
  const style =
    place.side === "left" ? { left: -5, top: place.arrow - 5 } : place.side === "top" ? { top: -5, left: place.arrow - 5 } : { bottom: -5, left: place.arrow - 5 };
  return <span aria-hidden="true" className="absolute size-2.5 rotate-45 rounded-tag bg-card" style={style} />;
};

export default TourBubble;
