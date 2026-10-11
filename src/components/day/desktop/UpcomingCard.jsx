import { Link } from "react-router-dom";
import { ChevronRight, CircleSlash, Flag, RefreshCw } from "lucide-react";
import { useSheet } from "../../../shared/hooks/useSheet";
import { usePlanStore } from "../../../shared/store/planStore";
import { examWhen, lessonBadge, subjectName, weekdayShort } from "../../../shared/utils/format";
import { upcomingChanges } from "../../../shared/utils/lessons";

// Бейдж уроку → слово праворуч у рядку
const CHANGE_WORDS = { VERTRETUNG: "Vertretung", "FÄLLT AUS": "fällt aus", RAUM: "Raumwechsel", KLAUSUR: "Klausur" };

// ─────────────────────────────────────────────────────────────
// «Kommt noch» у правій колонці дня (ПК): що зміниться найближчим часом.
//   ↻ Do · 4. Std Geschichte        Vertretung ›
//     Raum B12 · Kle
//   ⚑ Fr · Klausur Mathe            in 2 Tagen ›
// Зміни — з уже завантаженого тижня (після сьогодні), до трьох; плюс перша Klausur.
// days — дні тижня; today — "YYYY-MM-DD"
// ─────────────────────────────────────────────────────────────
const UpcomingCard = ({ days, today }) => {
  const { openSheet } = useSheet(); // відкрити урок
  const exam = usePlanStore((s) => s.exams.find((e) => e.date > today)); // найближча Klausur після сьогодні
  const changes = upcomingChanges(days, today)
    .filter((c) => c.date > today) // тільки наступні дні
    .slice(0, 3);

  if (changes.length === 0 && !exam) return null; // нічого не міняється

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-label font-extrabold text-faint">Kommt noch</h2>
      <div className="flex flex-col divide-y divide-hair rounded-[24px] bg-card px-4">
        {changes.map(({ date, weekday, lesson }) => {
          const Icon = lesson.status === "cancelled" ? CircleSlash : RefreshCw; // значок
          return (
            <button
              key={`${date}-${lesson.period}-${lesson.subject.code}`}
              type="button"
              onClick={() => openSheet("stunde", { datum: date, stunde: lesson.period, fach: lesson.subject.code })}
              className="flex items-center gap-3 py-3 text-left"
            >
              <Icon className="size-4.5 shrink-0 text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-semibold text-ink">
                  {weekday} · {lesson.period}. Std {subjectName(lesson.subject)}
                </span>
                {lesson.room && (
                  <span className="block truncate text-caption font-semibold text-faint">
                    Raum {lesson.room}
                    {lesson.teacher && ` · ${lesson.teacher}`}
                  </span>
                )}
              </span>
              {/* що сталося — звичайними літерами */}
              <span className="shrink-0 text-label font-semibold text-faint">{CHANGE_WORDS[lessonBadge(lesson)]}</span>
              <ChevronRight className="size-4 shrink-0 text-faint" />
            </button>
          );
        })}

        {exam && (
          <Link to={`/tag/${exam.date}`} className="flex items-center gap-3 py-3 text-left">
            <Flag className="size-4.5 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate text-body font-semibold text-ink">
              {weekdayShort(exam.date)} · {exam.type} {subjectName(exam.subject)}
            </span>
            <span className="shrink-0 text-label font-semibold text-faint">{examWhen(exam)}</span>
            <ChevronRight className="size-4 shrink-0 text-faint" />
          </Link>
        )}
      </div>
    </section>
  );
};

export default UpcomingCard;
