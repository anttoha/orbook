import { courseCaption } from "../../../shared/utils/admin";
import { subjectName } from "../../../shared/utils/format";
import { fachDotClass } from "../../../shared/utils/lessons";
import { useUserStore } from "../../../shared/store/userStore";
import { cn } from "../../../shared/utils/cn";
import Segmented from "../../ui/Segmented";

const CHOICES = [
  { value: "pflicht", label: "Pflicht" },
  { value: "wahl", label: "Wahl" },
];

// ─────────────────────────────────────────────────────────────
// Список «Kurse» (design/neu/13-admin-kurse): крапка кольору предмета, «Ma · Mathe», вчитель,
// праворуч Pflicht/Wahl — у кожного курсу. Групи й паралельні курси сервер сам робить «Wahl»
// (підпис «Automatisch Wahl · …»), але адмін може зробити їх «Pflicht» (courses.required).
// states — { [nr]: "pflicht" | "wahl" } з чернетки
// ─────────────────────────────────────────────────────────────
const CourseRows = ({ courses, states, onChange }) => {
  const overrides = useUserStore((s) => s.colorOverrides);

  return (
    <ul className="divide-y divide-hair">
      {courses.map((course) => {
        const caption = [course.teacher, courseCaption(course, states[course.nr])].filter(Boolean).join(" · ");
        return (
          <li key={course.nr} className="flex min-h-16 items-center gap-3 py-2.5">
            <span className={cn("size-2 shrink-0 rounded-full", fachDotClass(course.subject?.code, overrides))} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-row font-extrabold text-ink">
                {course.label} · {subjectName(course.subject)}
              </p>
              {caption && <p className="mt-0.5 truncate text-caption text-faint">{caption}</p>}
            </div>
            <Segmented label={`${course.label}: Pflicht oder Wahl`} size="sm" className="shrink-0" value={states[course.nr]} options={CHOICES} onChange={(value) => onChange(course.nr, value)} />
          </li>
        );
      })}
    </ul>
  );
};

export default CourseRows;
