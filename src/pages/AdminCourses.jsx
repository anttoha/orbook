import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminEmpty, AdminError, AdminSkeleton } from "../components/admin/AdminState";
import CourseRows from "../components/admin/courses/CourseRows";
import SubjectNames from "../components/admin/courses/SubjectNames";
import OptionRow from "../components/admin/settings/OptionRow";
import SaveButton from "../components/admin/settings/SaveButton";
import SettingsCard from "../components/admin/settings/SettingsCard";
import { LockIcon } from "../components/ui/icons";
import { loadAdminCourses, saveSettings } from "../shared/api/admin";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useAdminStore } from "../shared/store/adminStore";
import { coursesPatch, courseState, settingsPatch, subjectNamesPatch } from "../shared/utils/admin";

// Підпис під заголовком блоку
const Lead = ({ children }) => <p className="-mt-1 mb-1 text-caption text-faint">{children}</p>;

// Поле дати «Zählen ab» у вигляді пігулки; порожнє — рахувати з першого плану
const SinceField = ({ value, onChange }) => (
  <input
    type="date"
    aria-label="Statistik zählen ab"
    value={value ?? ""}
    onChange={(event) => onChange(event.target.value || null)}
    className="h-8.5 shrink-0 rounded-full border border-rule bg-card px-3 text-label font-extrabold text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
  />
);

// Чернетка: Pflicht/Wahl, назви предметів, «Zählen ab». key на сторінці скидає її після збереження
const CoursesForm = ({ data, settings, onSaved }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [states, setStates] = useState(() => Object.fromEntries(data.courses.map((c) => [c.nr, courseState(c)])));
  const [edited, setEdited] = useState({}); // { [code]: текст } — лише поля, які змінили
  const [since, setSince] = useState(settings.stats.since);
  const [busy, setBusy] = useState(false);

  const after = {
    courses: coursesPatch(settings.courses, data.courses, states), // optional і required
    subjects: { names: subjectNamesPatch(settings.subjects.names, data.subjects, edited) },
    stats: { since },
  };
  const patch = settingsPatch(settings, after);
  const dirty = Object.keys(patch).length > 0;

  const save = async () => {
    setBusy(true);
    try {
      await saveSettings(patch);
      toast.success("Änderungen gespeichert");
      onSaved();
    } catch (error) {
      toast.error(error.status === 422 ? "Nichts gespeichert: ein Wert ist nicht erlaubt." : error.message);
    } finally {
      setBusy(false);
    }
  };

  const button = { busy, dirty, onSave: save };
  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title="Kurse und Fächer" backTo="/admin" actions={isDesktop && <SaveButton {...button} />} />
      <p className="-mt-1.5 text-body text-muted lg:hidden">Gilt für die ganze Klasse, auf allen Geräten.</p>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
        <SettingsCard title="Kurse">
          <Lead>Wahl-Kurse wählt jeder Schüler in „Meine Kurse“ selbst.</Lead>
          <CourseRows courses={data.courses} states={states} onChange={(nr, value) => setStates({ ...states, [nr]: value })} />
          <p className="flex items-center gap-1.5 border-t border-hair py-3 text-caption text-faint">
            <LockIcon className="size-3.5" /> Gruppen und parallele Kurse sind automatisch Wahl. Du kannst sie trotzdem auf Pflicht stellen.
          </p>
        </SettingsCard>

        <div className="flex flex-col gap-5 lg:gap-4">
          <SettingsCard title="Fächer">
            <Lead>Namen stehen in Woche, Tag und Klausuren. Ohne Namen zeigt die App den Code.</Lead>
            <div className="py-3">
              <SubjectNames subjects={data.subjects} edited={edited} onChange={(code, text) => setEdited({ ...edited, [code]: text })} />
            </div>
          </SettingsCard>
          <SettingsCard title="Statistik">
            <OptionRow label="Zählen ab" hint="Leer = ab dem ersten Plan">
              <SinceField value={since} onChange={setSince} />
            </OptionRow>
          </SettingsCard>
        </div>
      </div>
      {/* на телефоні кнопка в кінці сторінки, як у макеті */}
      {!isDesktop && <SaveButton {...button} />}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// «Kurse und Fächer» (design/neu/13-admin-kurse, утверджено 2026-11-06).
// Курси й предмети — GET /api/admin/courses (без входу класу), зберігаємо в PATCH /admin/settings.
// ─────────────────────────────────────────────────────────────
const AdminCourses = () => {
  const courses = useAdminLoad("courses", loadAdminCourses);
  const settings = useAdminStore((s) => s.settings);
  const reloadSettings = useAdminStore((s) => s.reloadSettings);

  // Свіжі налаштування: з них courses.optional, subjects.names, stats.since
  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  const failed = courses.status === "error" ? courses : settings.status === "error" ? settings : null;
  if (courses.status === "loading" || settings.status === "loading" || failed) {
    const retry = () => (courses.status === "error" ? courses.reload() : reloadSettings());
    return (
      <section className="flex flex-col gap-4">
        <AdminHeader title="Kurse und Fächer" backTo="/admin" />
        {failed ? <AdminError error={failed.error} onRetry={retry} /> : <AdminSkeleton rows={5} />}
      </section>
    );
  }
  if (!courses.data.courses.length && !courses.data.subjects.length) {
    return (
      <section className="flex flex-col gap-4">
        <AdminHeader title="Kurse und Fächer" backTo="/admin" />
        <AdminEmpty text="Noch kein Plan geladen. Die Kurse erscheinen nach dem ersten Abruf." />
      </section>
    );
  }

  const saved = () => {
    courses.reload();
    reloadSettings();
  };
  // key: нові дані з сервера → нова чернетка
  return <CoursesForm key={JSON.stringify([courses.data, settings.data.settings])} data={courses.data} settings={settings.data.settings} onSaved={saved} />;
};

export default AdminCourses;
