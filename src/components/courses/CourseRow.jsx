import Switch from "../ui/Switch";
import { cn } from "../../shared/utils/cn";
import { courseTitle } from "../../shared/utils/courses";
import { fachClasses } from "../../shared/utils/lessons";
import { useUserStore } from "../../shared/store/userStore";

// Рядок курсу. onChange є — це вибірковий курс із перемикачем; немає — підпис «immer».
const CourseRow = ({ course, checked, onChange }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  const selectable = Boolean(onChange);
  const dimmed = selectable && !checked; // вимкнений курс блідіший разом із перемикачем, як у макеті
  // label: натискання на будь-яке місце рядка спрацьовує як натискання на перемикач
  const Row = selectable ? "label" : "div";

  return (
    <li>
      <Row className={cn("flex h-13.25 items-center gap-3", selectable && "cursor-pointer", dimmed && "opacity-55")}>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-note font-black", fachClasses(course.subject?.code, overrides))}>
          {course.subject?.code}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-row font-semibold text-ink">{courseTitle(course)}</span>
          {course.teacher && <span className="block truncate text-caption text-faint">{course.teacher}</span>}
        </span>
        {selectable ? <Switch checked={checked} onChange={onChange} /> : <span className="text-room font-extrabold text-faint">immer</span>}
      </Row>
    </li>
  );
};

export default CourseRow;
