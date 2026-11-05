import SubjectBadge from "../ui/SubjectBadge";
import Switch from "../ui/Switch";
import { cn } from "../../shared/utils/cn";
import { courseTitle } from "../../shared/utils/courses";

// Рядок курсу з перемикачем. Вимкнений курс блідіший разом із перемикачем, як у макеті
const CourseRow = ({ course, checked, onChange }) => {
  return (
    <li className="-mx-2">
      {/* label: натискання на будь-яке місце рядка спрацьовує як натискання на перемикач */}
      <label className={cn("flex h-13.25 items-center gap-3 rounded-field px-2 hover:bg-paper", !checked && "opacity-55")}>
        <SubjectBadge subject={course.subject} />
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
