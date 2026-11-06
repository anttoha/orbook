import { courseState } from "../../../shared/utils/admin";
import { subjectName } from "../../../shared/utils/format";
import { fachDotClass } from "../../../shared/utils/lessons";
import { useUserStore } from "../../../shared/store/userStore";
import { cn } from "../../../shared/utils/cn";
import { LockIcon } from "../../ui/icons";
import Segmented from "../../ui/Segmented";

const CHOICES = [
  { value: "pflicht", label: "Pflicht" },
  { value: "wahl", label: "Wahl" },
];

// Плашка «Immer Wahl» для груп і паралельних курсів: адмін їх не перемикає
const AlwaysWahl = () => (
  <span className="flex h-8.5 shrink-0 items-center gap-1.5 rounded-full bg-tint px-3.5 text-label font-extrabold text-accent-ink">
    <LockIcon className="size-3.5" /> Immer Wahl
  </span>
);

// ─────────────────────────────────────────────────────────────
// Список «Kurse» (design/neu/13-admin-kurse): крапка кольору предмета, «Ma · Mathe», вчитель,
// праворуч Pflicht/Wahl або «Immer Wahl». states — { [nr]: "pflicht" | "wahl" } з чернетки
// ─────────────────────────────────────────────────────────────
const CourseRows = ({ courses, states, onChange }) => {
  const overrides = useUserStore((s) => s.colorOverrides);

  return (
    <ul className="divide-y divide-hair">
      {courses.map((course) => {
        const fixed = courseState(course); // з сервера: чи курс узагалі можна перемикати
        const caption = [course.teacher, fixed.locked].filter(Boolean).join(" · ");
        return (
          <li key={course.nr} className="flex min-h-16 items-center gap-3 py-2.5">
            <span className={cn("size-2 shrink-0 rounded-full", fachDotClass(course.subject?.code, overrides))} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-row font-extrabold text-ink">
                {course.label} · {subjectName(course.subject)}
              </p>
              {caption && <p className="mt-0.5 truncate text-caption text-faint">{caption}</p>}
            </div>
            {fixed.locked ? <AlwaysWahl /> : <Segmented label={`${course.label}: Pflicht oder Wahl`} size="sm" value={states[course.nr]} options={CHOICES} onChange={(value) => onChange(course.nr, value)} />}
          </li>
        );
      })}
    </ul>
  );
};

export default CourseRows;
