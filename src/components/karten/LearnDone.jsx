import { RotateCcw } from "lucide-react";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { useT } from "../../shared/hooks/useT";
import { daysBetween, daysLeftText } from "../../shared/utils/format";
import Button from "../ui/Button";
import { CheckIcon } from "../ui/icons";
import { Clock } from "lucide-react";
import BoxesCard from "./BoxesCard";

// Плитка «9 gewusst»: число считает от 0, плитки поднимаются по очереди
const Stat = ({ n, label, className, delay }) => {
  const value = useCountUp(n);
  return (
    <div className="flex-1 rounded-card bg-card px-4.5 py-4 motion-safe:animate-rise-in" style={{ animationDelay: `${delay}ms` }}>
      <p className={`text-stat leading-none tabular-nums ${className}`}>{value}</p>
      <p className="mt-2 text-label font-bold text-muted">{label}</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// «Geschafft!» (макет 43 handy-05): галочка выпрыгивает, «gewusst / noch nicht», как сдвинулись коробки,
// когда следующая порция. result — sessionResult (moved = null при «Alle üben»: коробки не двигались).
// ─────────────────────────────────────────────────────────────
const LearnDone = ({ total, result, next, today, onAgain, onDone }) => {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <span className="mb-3 grid size-16 place-items-center rounded-full bg-ok-tint text-ok motion-safe:animate-done-pop">
          <CheckIcon className="size-8" />
        </span>
        <h2 className="text-title text-ink motion-safe:animate-rise-in" style={{ animationDelay: "120ms" }}>
          {t("Geschafft!")}
        </h2>
        <p className="text-body-sm text-muted">{total === 1 ? t("1 Karte wiederholt") : t("{total} Karten wiederholt", { total })}</p>
      </div>
      <div className="flex gap-2">
        <Stat n={result.known} label={t("gewusst")} className="text-ok" delay={200} />
        <Stat n={result.unknown} label={t("noch nicht")} className="text-danger" delay={280} />
      </div>
      <section className="flex flex-col gap-3 motion-safe:animate-rise-in" style={{ animationDelay: "360ms" }}>
        <h2 className="text-hint font-extrabold text-faint">{t("Lernstand")}</h2>
        <BoxesCard counts={result.counts} moved={result.moved} />
      </section>
      {next && (
        <div className="flex h-14 items-center gap-3 rounded-card bg-card px-4 motion-safe:animate-rise-in" style={{ animationDelay: "440ms" }}>
          <Clock className="size-5 text-muted" />
          <span className="flex-1 text-row font-bold text-ink">{t("Nächste Runde")}</span>
          <span className="text-label font-extrabold text-accent-ink">{t("{when} · {count} Karten", { when: daysLeftText(daysBetween(today, next.date)), count: next.count })}</span>
        </div>
      )}
      <div className="flex gap-2">
        {result.unknown > 0 && (
          <Button onClick={onAgain}>
            <RotateCcw className="size-4" /> {result.unknown === 1 ? t("Die 1 nochmal") : t("Die {n} nochmal", { n: result.unknown })}
          </Button>
        )}
        <Button variant="primary" onClick={onDone}>
          <CheckIcon className="size-4" /> {t("Fertig")}
        </Button>
      </div>
    </div>
  );
};

export default LearnDone;
