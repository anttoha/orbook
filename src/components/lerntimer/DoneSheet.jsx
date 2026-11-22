import { Coffee } from "lucide-react";
import { useSubjectName } from "../../shared/hooks/useKarten";
import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";
import { durationText } from "../../shared/utils/lerntimer";
import { fachDotClass } from "../../shared/utils/lessons";
import Button from "../ui/Button";
import { CheckIcon } from "../ui/icons";
import Liquid from "../ui/Liquid";
import Sheet from "../ui/Sheet";
import RoundDots from "./RoundDots";

// Салют: 14 точек разлетаются из галочки. Направления заранее — без случайностей, одинаково каждый раз
const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * 2 * Math.PI;
  const dist = 58 + (i % 3) * 16;
  return { dx: `${Math.round(Math.cos(angle) * dist)}px`, dy: `${Math.round(Math.sin(angle) * dist)}px`, rot: `${(i % 2 ? 1 : -1) * 120}deg`, accent: i % 2 === 0 };
});

// Галочка с пружиной и салютом: половина точек — цвет предмета, половина — акцент
const Celebrate = ({ dotClass }) => (
  <div className="relative mx-auto grid size-16 place-items-center">
    <span aria-hidden="true" className="confetti pointer-events-none absolute inset-0">
      {BURST.map((b, i) => (
        <span
          key={i}
          className={`absolute top-1/2 left-1/2 -mt-1 -ml-1 size-2 rounded-full motion-safe:animate-confetti ${b.accent ? "bg-accent" : dotClass}`}
          style={{ "--dx": b.dx, "--dy": b.dy, "--rot": b.rot, animationDelay: "120ms" }}
        />
      ))}
    </span>
    <span className="grid size-16 place-items-center rounded-full bg-ok-tint motion-safe:animate-done-pop">
      <CheckIcon className="size-8 text-ok" />
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Шторка «Runde geschafft!» (макет 44 handy-05): сколько засчитано, сколько сегодня, раунды;
// «N min Pause» (после последнего раунда — «Lange Pause») или «Fertig für heute».
// done — { min, code, round } из store; breakMin — минуты перерыва
// ─────────────────────────────────────────────────────────────
const DoneSheet = ({ done, rounds, today, breakMin, longBreak, onBreak, onFinish, onClose }) => {
  const t = useT();
  const nameOf = useSubjectName();
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <Sheet
      open={Boolean(done)}
      onClose={onClose}
      desktop="dialog"
      title={t("Runde geschafft!")}
      footer={
        <div className="flex w-full flex-col gap-2">
          <Button variant="primary" onClick={onBreak}>
            <Coffee className="size-4.5" /> {longBreak ? t("{min} min lange Pause", { min: breakMin }) : t("{min} min Pause", { min: breakMin })}
          </Button>
          <Button onClick={onFinish}>
            <CheckIcon className="size-4" /> {t("Fertig für heute")}
          </Button>
        </div>
      }
    >
      {done && (
        <div className="flex flex-col items-center gap-5 pb-1 text-center">
          <Celebrate dotClass={fachDotClass(done.code, overrides)} />
          <p className="text-body-sm text-muted">
            <span className="font-extrabold text-ink">{t("{min} min {fach}", { min: done.min, fach: nameOf(done.code) })}</span> · {t("heute {zeit}", { zeit: durationText(today) })}
          </p>
          <Liquid as="div" refract press={false} className="flex h-16 w-full items-center justify-between rounded-card bg-card px-4 motion-safe:animate-float-up">
            <span className="text-row font-bold text-ink">{t("Runde {n} von {total}", { n: done.round, total: rounds })}</span>
            <RoundDots done={done.round} total={rounds} />
          </Liquid>
        </div>
      )}
    </Sheet>
  );
};

export default DoneSheet;
