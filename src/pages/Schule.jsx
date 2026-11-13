import { Navigate, useParams } from "react-router-dom";
import AddClassTile from "../components/klassen/AddClassTile";
import SchoolGroup from "../components/klassen/SchoolGroup";
import PageHeader from "../components/ui/PageHeader";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useT } from "../shared/hooks/useT";
import { useClasses } from "../shared/store/classesStore";
import { usePlanStore } from "../shared/store/planStore";
import { classesOfSchool } from "../shared/utils/classes";
import { berlinParts } from "../shared/utils/lessonClock";

// ─────────────────────────────────────────────────────────────
// Страница школы (часть 29d, макет handy-21): её классы на этом устройстве и «Klasse hinzufügen».
// Код другой школы здесь тоже работает — класс встанет к своей школе (шторка это скажет).
// Классов этой школы больше нет (последний убрали) — назад на «Meine Klassen»
// ─────────────────────────────────────────────────────────────
const Schule = () => {
  const t = useT();
  const { id } = useParams();
  const list = useClasses((s) => s.list);
  const now = usePlanStore((s) => s.now);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const items = classesOfSchool(list, id);
  if (items.length === 0) return <Navigate to="/klassen" replace />;
  const school = items[0].school;

  return (
    <section className="flex flex-1 flex-col gap-3.5 pb-6">
      <PageHeader backTo="/klassen" eyebrow={`${t("Meine Klassen")} · ${t("Schule")}`} title={school.name} />
      <p className="-mt-1.5 text-label text-muted">
        {items.length} {t(items.length === 1 ? "Klasse auf diesem Gerät" : "Klassen auf diesem Gerät")}
      </p>
      <SchoolGroup group={{ key: school.id, school, items }} today={berlinParts(now).date} wide={isDesktop} head={false} />
      <div className="motion-safe:animate-rise-in" style={{ animationDelay: `${Math.min(items.length, 6) * 50}ms` }}>
        <AddClassTile schoolId={school.id} hint="Zugangscode einer Klasse dieser Schule" />
      </div>
      <p className="text-caption text-faint">{t("Code einer anderen Schule? Geht auch – die Klasse landet dann bei ihrer Schule.")}</p>
    </section>
  );
};

export default Schule;
