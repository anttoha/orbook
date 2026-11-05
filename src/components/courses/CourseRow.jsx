import Switch from "../ui/Switch";
import { cn } from "../../shared/utils/cn";
import { courseTitle } from "../../shared/utils/courses";
import { fachClasses } from "../../shared/utils/lessons";
import { useUserStore } from "../../shared/store/userStore";

// Рядок курсу з перемикачем. Вимкнений курс блідіший разом із перемикачем, як у макеті
const CourseRow = ({ course, checked, onChange }) => {
  const overrides = useUserStore((s) => s.colorOverrides);

  return (
    <li className="-mx-2">
      {/* label: натискання на будь-яке місце рядка спрацьовує як натискання на перемикач */}
      <label className={cn("flex h-13.25 items-center gap-3 rounded-field px-2 hover:bg-paper", !checked && "opacity-55")}>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-note font-black", fachClasses(course.subject?.code, overrides))}>
          {course.subject?.code}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-row font-semibold text-ink">{courseTitle(course)}</span>
          {course.teacher && <span className="block truncate text-caption text-faint">{course.teacher}</span>}
        </span>
        <Switch checked={checked} onChange={onChange} label={courseTitle(course)} />
      </label>
    </li>
  );
};

export default CourseRow;
