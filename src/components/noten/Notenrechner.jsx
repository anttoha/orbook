import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { defaultTarget, hasDouble, neededGrade, noteNumber, stepTarget } from "../../shared/utils/noten";
import { translate } from "../../shared/i18n/translate";
import Segmented from "../ui/Segmented";

const WEIGHTS = [
  { value: 1, label: "×1" },
  { value: 2, label: "×2" },
];

const StepButton = ({ label, onClick, disabled, children }) => (
  <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className="grid size-9 place-items-center rounded-full bg-sand text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40">
    {children}
  </button>
);

// Результат: «Du brauchst 1,6 oder besser» или что с одной оценкой не выйти / выйдет с любой
const Result = ({ result, name }) => {
  const t = useT();
  if (result.status !== "need") {
    return <p className="text-lead font-bold text-ink">{result.status === "impossible" ? t("Mit einer Note nicht zu schaffen") : t("Schaffst du mit jeder Note")}</p>;
  }
  return (
    <>
      <p className="flex items-baseline gap-3">
        <span className="text-display text-accent-ink">{noteNumber(result.need)}</span>
        <span className="text-lead font-bold text-ink">{t("oder besser")}</span>
      </p>
      <p className="mt-1 text-body-sm text-muted">{translate("Dann ist dein Schnitt in {fach} {note}.", { fach: name, note: noteNumber(result.after) })}</p>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Notenrechner (макет handy-03, на ПК — в колонке предмета): какую оценку нужно на следующей работе,
// чтобы Schnitt стал не хуже цели. Только расчёт: Zeugnis ставит учитель (решение владельца)
// ─────────────────────────────────────────────────────────────
const Notenrechner = ({ subject }) => {
  const t = useT();
  const [target, setTarget] = useState(() => defaultTarget(subject.average));
  const [weight, setWeight] = useState(() => (hasDouble(subject.list) ? 2 : 1));
  const result = neededGrade(subject.list, target, weight);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="divide-y divide-hair rounded-card bg-card px-3.5">
        <div className="flex items-center gap-3 py-2.5">
          <span className="min-w-0 flex-1 text-row text-ink">{t("Mein Ziel")}</span>
          <StepButton label={t("Besser")} onClick={() => setTarget(stepTarget(target, -0.1))} disabled={target <= 1}>
            <Minus className="size-4.5" strokeWidth={2.4} />
          </StepButton>
          <span className="w-12 text-center text-subhead text-ink" aria-live="polite">{noteNumber(target)}</span>
          <StepButton label={t("Schlechter")} onClick={() => setTarget(stepTarget(target, 0.1))} disabled={target >= 6}>
            <Plus className="size-4.5" strokeWidth={2.4} />
          </StepButton>
        </div>
        <div className="flex items-center gap-3 py-2.5">
          <span className="min-w-0 flex-1 text-row text-ink">{t("Nächste Note zählt")}</span>
          <Segmented options={WEIGHTS} value={weight} onChange={setWeight} label={t("Nächste Note zählt")} size="sm" className="w-30 shrink-0" />
        </div>
      </div>
      <div className="rounded-card bg-tint px-4.5 py-4">
        <p className="text-small font-extrabold tracking-wide text-accent-ink uppercase">{t("Du brauchst")}</p>
        <div className="mt-1">
          <Result result={result} name={subject.name} />
        </div>
      </div>
    </div>
  );
};

export default Notenrechner;
