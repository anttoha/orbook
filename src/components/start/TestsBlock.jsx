import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { mySubjects } from "../../shared/utils/appointments";
import { cn } from "../../shared/utils/cn";
import { examWhen, numericDate, subjectName, weekdayShort } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// ─────────────────────────────────────────────────────────────
// Блок «Tests» (макет handy-01): ближайшие тесты. Первый — крупно, «Fr · in 2 Tagen»,
// остальные — строкой с датой. Настройки блока: «Einträge» 2/3/5 и «Nur meine Kurse»
// ─────────────────────────────────────────────────────────────
const TestsBlock = ({ block, editing }) => {
  const t = useT();
  const all = usePlanStore((s) => s.exams);
  const status = usePlanStore((s) => s.examsState.status);
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const overrides = useUserStore((s) => s.colorOverrides);
  const mine = block.opts.mine !== false ? mySubjects(me, courses, picked, hiddenRequired) : null;
  const exams = (mine ? all.filter((exam) => !exam.subject || mine.has(exam.subject.code)) : all).slice(0, block.opts.count ?? 2);

  const body = () => {
    if (!exams.length) return status === "loading" ? <BlockSkeleton /> : <BlockEmpty text="Keine Tests geplant" />;
    const [first, ...rest] = exams;
    return (
      <>
        <p className="flex items-center gap-2 text-subhead text-ink">
          <span className={cn("size-2 shrink-0 rounded-full", fachDotClass(first.subject?.code, overrides))} />
          <span className="truncate">{subjectName(first.subject)}</span>
        </p>
        <p className="truncate text-caption font-bold text-accent-ink">{`${weekdayShort(first.date)} · ${examWhen(first)}`}</p>
        {rest.length > 0 && (
          <ul className="mt-2 flex flex-col divide-y divide-hair border-t border-hair">
            {rest.map((exam) => (
              <li key={exam.id} className="flex items-center gap-2 py-1.5">
                <span className={cn("size-2 shrink-0 rounded-full", fachDotClass(exam.subject?.code, overrides))} />
                <span className="min-w-0 flex-1 truncate text-body-sm font-bold text-ink">{subjectName(exam.subject)}</span>
                <span className="shrink-0 text-caption text-faint">{`${weekdayShort(exam.date)} ${numericDate(exam.date)}`}</span>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  };

  return (
    <BlockCard kind="tests" title={t("Tests")} to="/testen" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default TestsBlock;
