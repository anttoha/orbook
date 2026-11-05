import { usePlanStore } from "../../shared/store/planStore";
import { splitCourses } from "../../shared/utils/courses";
import CourseGroup from "./CourseGroup";
import CourseRow from "./CourseRow";
import CoursesState from "./CoursesState";

// Блоки «Pflicht» і «Wahl». isOn(nr) — чи ввімкнено курс, onToggle(nr) — натиснули перемикач
const CourseLists = ({ isOn, onToggle }) => {
  const courses = usePlanStore((s) => s.courses);
  const { required, optional } = splitCourses(courses);

  return (
    <CoursesState>
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-7">
        <CourseGroup title="Pflicht">
          {required.map((course) => (
            <CourseRow key={course.nr} course={course} />
          ))}
        </CourseGroup>
        <CourseGroup title="Wahl">
          {optional.map((course) => (
            <CourseRow key={course.nr} course={course} checked={isOn(course.nr)} onChange={() => onToggle(course.nr)} />
          ))}
        </CourseGroup>
      </div>
    </CoursesState>
  );
};

export default CourseLists;
