import CourseLists from "../components/courses/CourseLists";
import PageHeader from "../components/ui/PageHeader";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { isCourseOn, optionalNumbers, toggleCourse } from "../shared/utils/courses";

// «Meine Kurse» (макет 23). На відміну від першого запуску вибір діє одразу.
const MyCourses = () => {
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const setPicked = useUserStore((s) => s.setPicked);

  return (
    <section className="flex flex-col lg:max-w-186">
      <PageHeader backTo="/mehr" eyebrow="Mehr" title="Meine Kurse" />
      <p className="mt-3 mb-5 text-body-sm leading-5.25 text-muted">Ausgeblendete Kurse erscheinen nicht im Plan und nicht in der Statistik.</p>
      <CourseLists isOn={(nr) => isCourseOn(picked, nr)} onToggle={(nr) => setPicked(toggleCourse(picked, nr, optionalNumbers(courses)))} />
    </section>
  );
};

export default MyCourses;
