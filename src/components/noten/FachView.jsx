import { Calculator, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotenStore } from "../../shared/store/notenStore";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { fachClasses } from "../../shared/utils/lessons";
import { badgeOf, dayDate, gradeKey, nextExamOf, noteNumber, weightOf } from "../../shared/utils/noten";
import { translate } from "../../shared/i18n/translate";
import Button from "../ui/Button";
import { FlagIcon } from "../ui/icons";
import DateTile from "./DateTile";
import GradePill from "./GradePill";
import NewBadge from "./NewBadge";

// «×2» в подписи, если оценка весит больше одной; «×0,5» — как есть
const weightText = (g) => (weightOf(g) === 1 ? null : translate("zählt ×{n}", { n: String(weightOf(g)).replace(".", ",") }));

// Карточка цветом предмета: SCHNITT 2,1 · «4 Noten» · «Doppelt zählt ×2»
const SchnittCard = ({ subject }) => {
  const t = useT();
  const overrides = useUserStore((s) => s.colorOverrides);
  const heavy = subject.list.find((g) => weightOf(g) > 1);
  return (
    <div className={cn("flex items-end justify-between gap-3 rounded-card px-4.5 py-4.5", fachClasses(badgeOf(subject.code), overrides))}>
      <div>
        <p className="text-small font-extrabold tracking-wide uppercase">{t("Schnitt")}</p>
        <p className="mt-2 text-lobby">{noteNumber(subject.average)}</p>
      </div>
      <div className="mb-2 min-w-0 text-right">
        <p className="text-lead font-extrabold">{subject.list.length === 1 ? t("1 Note") : translate("{n} Noten", { n: subject.list.length })}</p>
        {heavy?.weightLabel && <p className="truncate text-body-sm">{`${heavy.weightLabel} ${weightText(heavy)}`}</p>}
      </div>
    </div>
  );
};

// Строка оценки: [16 SEP] Klassenarbeit · «Di 16.09. · zählt ×2»   (neu) [3+]
const GradeRow = ({ grade, isNew }) => {
  const t = useT();
  return (
    <li className="flex items-center gap-3 py-3">
      <DateTile iso={grade.date} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-extrabold text-ink">{grade.note || grade.kind || t("Note")}</span>
        <span className="block truncate text-caption text-faint">{[dayDate(grade.date), weightText(grade)].filter(Boolean).join(" · ")}</span>
      </span>
      {isNew && <NewBadge />}
      <GradePill text={grade.grade ?? "–"} value={grade.value} />
    </li>
  );
};

// «Nächster Test · Fr 19.09.» — ближайшая Klausur этого предмета (нет — строки нет)
const NextTest = ({ subject }) => {
  const t = useT();
  const exam = nextExamOf(usePlanStore((s) => s.exams), subject);
  if (!exam) return null;
  return (
    <Link to={`/testen?sheet=klausur&id=${exam.id}`} className="flex items-center gap-3 rounded-card bg-card px-3.5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand">
      <FlagIcon className="size-5 shrink-0 text-muted" />
      <span className="min-w-0 flex-1 text-row text-ink">{t("Nächster Test")}</span>
      <span className="shrink-0 text-body-sm text-faint">{dayDate(exam.date)}</span>
      <ChevronRight className="size-4 shrink-0 text-faint2" />
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────
// Предмет (макет handy-02; на ПК — правая колонка pc-01).
// rechner — что показать вместо кнопки «Notenrechner» (на ПК расчёт стоит прямо в колонке)
// ─────────────────────────────────────────────────────────────
const FachView = ({ subject, fresh, onRechner, rechner }) => {
  const t = useT();
  const markSeen = useNotenStore((s) => s.markSeen);
  // «neu» видно, пока смотришь предмет; ушёл с него (назад или другой предмет на ПК) — уже не новые
  useEffect(() => () => markSeen(subject.code), [subject.code, markSeen]);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3.5">
        <SchnittCard subject={subject} />
        {onRechner && (
          <Button onClick={onRechner} className="flex-none">
            <Calculator className="size-4.5" />
            {t("Notenrechner")}
          </Button>
        )}
      </div>
      <section>
        <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Noten")}</h2>
        <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
          {subject.list.map((g, i) => (
            <GradeRow key={`${g.date}-${i}`} grade={g} isNew={fresh.includes(gradeKey(subject.code, g))} />
          ))}
        </ul>
      </section>
      {rechner}
      <NextTest subject={subject} />
    </div>
  );
};

export default FachView;
