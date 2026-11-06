import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { mergeCourses, splitCourses } from "../../shared/utils/courses";
import CourseGroup from "./CourseGroup";
import CourseRow from "./CourseRow";
import CoursesState from "./CoursesState";

// Блоки «Pflicht» і «Wahl». Перемикач є в кожного курсу: учень сам вирішує, що бачити.
// isOn(course) — чи ввімкнено курс, onToggle(course) — натиснули перемикач.
// Однакові курси під різними номерами — один рядок (mergeCourses): у course.nrs усі номери
// На ПК дві колонки; stacked — одна під одною (у вузькій панелі «Einstellungen»)
const CourseLists = ({ isOn, onToggle, stacked = false }) => {
  const courses = usePlanStore((s) => s.courses);
  const split = splitCourses(courses);
  const required = mergeCourses(split.required);
  const optional = mergeCourses(split.optional);

  return (
    <CoursesState>
      <div className={cn("flex flex-col gap-5", !stacked && "lg:grid lg:grid-cols-2 lg:items-start lg:gap-7")}>
        <CourseGroup title="Pflicht">
          {required.map((course) => (
            <CourseRow key={course.nr} course={course} checked={isOn(course)} onChange={() => onToggle(course)} />
          ))}
        </CourseGroup>
        <CourseGroup title="Wahl">
          {optional.map((course) => (
            <CourseRow key={course.nr} course={course} checked={isOn(course)} onChange={() => onToggle(course)} />
          ))}
        </CourseGroup>
      </div>
    </CoursesState>
  );
};

export default CourseLists;
