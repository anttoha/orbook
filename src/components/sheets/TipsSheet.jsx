import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { cn } from "../../shared/utils/cn";
import { MenuPicture, TasksPicture, WeekPicture } from "../tips/TipPictures";
import Button from "../ui/Button";
import { CheckIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";

// Три подсказки: коротко и по делу. На ПК вместо «lange drücken» — правый клик
const TIPS = [
  { picture: WeekPicture, title: "Tippe auf einen Tag", text: "Oben die Woche, darunter der Tag. Ausfälle und Vertretungen sind farbig markiert." },
  { picture: MenuPicture, title: "Stunde lange drücken", pcTitle: "Rechtsklick auf eine Stunde", text: "Notiz schreiben, Hausaufgabe oder Test eintragen, Fachfarbe ändern." },
  { picture: TasksPicture, title: "Aufgaben abhaken", text: "Hausaufgaben und eigene Aufgaben in einer Liste. Mit Sync-Code auch auf dem PC." },
];

// ─────────────────────────────────────────────────────────────
// «Kurz erklärt» (макеты 25 handy-13…15, pc-04): один раз после первого входа (useTipsOnStart),
// потом — из Mehr. Адрес: ?sheet=tipps
// ─────────────────────────────────────────────────────────────
const TipsSheet = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const tip = TIPS[step];
  const last = step === TIPS.length - 1;
  const close = () => {
    onClose();
    setStep(0); // следующее открытие — снова с первой
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      desktop="dialog"
      eyebrow={`Kurz erklärt · ${step + 1} von ${TIPS.length}`}
      title={isDesktop && tip.pcTitle ? tip.pcTitle : tip.title}
      footer={
        <>
          {!last && <Button onClick={close}>Überspringen</Button>}
          <Button variant="primary" onClick={() => (last ? close() : setStep(step + 1))}>
            {last ? <CheckIcon className="size-4" /> : <ArrowRight className="size-4" />}
            {last ? "Los geht’s" : "Weiter"}
          </Button>
        </>
      }
    >
      <p className="-mt-2 text-body-sm leading-5.5 text-muted">{tip.text}</p>
      {/* key — новая картинка появляется заново (анимация) */}
      <div key={step} className="motion-safe:animate-rise-in">
        <tip.picture />
      </div>
      <Dots count={TIPS.length} active={step} onPick={setStep} />
    </Sheet>
  );
};

// Точки шагов; можно нажать и перейти
const Dots = ({ count, active, onPick }) => (
  <div className="flex justify-center gap-1.5" role="tablist" aria-label="Tipps">
    {Array.from({ length: count }, (_, i) => (
      <button key={i} type="button" role="tab" aria-selected={i === active} aria-label={`Tipp ${i + 1}`} onClick={() => onPick(i)} className={cn("h-2 rounded-full transition-[width] duration-200", i === active ? "w-5.5 bg-accent" : "w-2 bg-faint2")} />
    ))}
  </div>
);

export default TipsSheet;
