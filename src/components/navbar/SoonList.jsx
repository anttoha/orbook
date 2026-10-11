import { Link } from "react-router-dom";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { dayNumber, examWhen, subjectName, weekdayShort } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";

// ─────────────────────────────────────────────────────────────
// «Bald» у сайдбарі: 3 найближчі Klausuren (GET /api/exams).
// Квадрат зліва — дата в кольорі предмета, праворуч — «Klausur · Mathe / in 2 Tagen».
// ─────────────────────────────────────────────────────────────
const SoonList = () => {
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори
  const exams = usePlanStore((s) => s.exams).slice(0, 3); // три найближчі

  if (exams.length === 0) return null; // нічого показувати

  return (
    <section className="mt-7">
      <h3 className="px-3 text-label font-extrabold text-faint">Bald</h3>
      <ul className="mt-2.5 flex flex-col gap-1">
        {exams.map((exam, i) => (
          <li key={exam.id}>
            <Link to={`/tag/${exam.date}`} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-sand">
              {/* дата в кольорі предмета */}
              <span className={cn("flex h-8.5 w-8 shrink-0 flex-col items-center justify-center rounded-lg", fachClasses(exam.subject.code, overrides))}>
                <span className="text-label leading-none font-black">{dayNumber(exam.date)}</span>
                <span className="text-tiny leading-none font-extrabold uppercase">{weekdayShort(exam.date)}</span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-body-sm font-semibold text-ink">
                  {exam.type} · {subjectName(exam.subject)}
                </span>
                {/* найближча — фіолетовим, решта — сірим (як на макеті) */}
                <span className={cn("block text-caption font-semibold", i === 0 ? "text-accent-ink" : "text-faint")}>{examWhen(exam)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SoonList;
