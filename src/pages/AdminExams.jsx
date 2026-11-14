import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminExamList from "../components/admin/AdminExamList";
import AdminExamSheet from "../components/admin/AdminExamSheet";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminEmpty, AdminError, AdminSkeleton } from "../components/admin/AdminState";
import DangerDialog from "../components/admin/DangerDialog";
import SearchField from "../components/admin/SearchField";
import Segmented from "../components/ui/Segmented";
import { deleteAdminExam, loadAdminExams, restoreAdminExam } from "../shared/api/admin";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useAdminStore } from "../shared/store/adminStore";
import { authorText } from "../shared/utils/admin";
import { subjectName } from "../shared/utils/format";

const DEFAULT_TYPES = ["Klassenarbeit", "Leistungskontrolle", "Test", "Abgabe"];

// Пошук прямо в завантажених списках: тема, предмет, тип, назва коду (як q на сервері)
const matches = (exam, query) => [exam.topic, subjectName(exam.subject), exam.type, authorText(exam)].join(" ").toLowerCase().includes(query.trim().toLowerCase());

// Обидва списки одразу: числа на вкладках «Kommend · 5», «Vergangen · 12»
const loadBoth = () => Promise.all([loadAdminExams({ scope: "upcoming" }), loadAdminExams({ scope: "past" })]).then(([upcoming, past]) => ({ upcoming: upcoming.exams, past: past.exams }));

// ─────────────────────────────────────────────────────────────
// «Klausuren» адмінки (макети 44 телефон, 46 ПК): усі записи класу, правка без прав коду,
// видалення з «Rückgängig», «Alte löschen» — через Gefahrenzone (слово LÖSCHEN + пароль).
// ─────────────────────────────────────────────────────────────
const AdminExams = () => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { today } = useNow();
  const now = new Date().toISOString(); // для «vor 2 Tagen»
  const ensureSettings = useAdminStore((s) => s.ensureSettings);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);
  const types = useAdminStore((s) => s.settings.data?.settings.exams.types ?? DEFAULT_TYPES);
  const exams = useAdminLoad("exams", loadBoth);
  const [scope, setScope] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // Klausur у вікні правки
  const [purgeOpen, setPurgeOpen] = useState(false);

  // Види записів (Art) — з налаштувань
  useEffect(() => {
    ensureSettings();
  }, [ensureSettings]);

  // Після будь-якої зміни: список і лічильник у меню
  const changed = () => {
    exams.reload();
    reloadOverview();
  };

  const remove = async (exam) => {
    try {
      await deleteAdminExam(exam);
      changed();
      toast("Test gelöscht", {
        duration: 8000,
        action: { label: "Rückgängig", onClick: () => restoreAdminExam(exam).then(changed, (error) => toast.error(error.message)) },
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saved = (message, warning) => {
    setEditing(null);
    changed();
    if (warning) toast.error(warning);
    else toast.success(message);
  };

  const data = exams.data ?? { upcoming: [], past: [] };
  const list = data[scope].filter((exam) => matches(exam, query));
  const tabs = (
    <Segmented
      label="Zeitraum"
      size="form"
      className="min-w-0 flex-1 lg:flex-none"
      value={scope}
      onChange={setScope}
      options={[
        { value: "upcoming", label: `Kommend · ${data.upcoming.length}` },
        { value: "past", label: `Vergangen · ${data.past.length}` },
      ]}
    />
  );
  const purgeLink = (
    <button type="button" onClick={() => setPurgeOpen(true)} className="shrink-0 text-label font-extrabold whitespace-nowrap text-danger">
      Alte löschen
    </button>
  );

  const renderList = () => {
    if (exams.status === "loading") return <AdminSkeleton />;
    if (exams.status === "error") return <AdminError error={exams.error} onRetry={exams.reload} />;
    if (!list.length) return <AdminEmpty text={query ? "Kein Test passt zur Suche." : "Keine Tests"} />;
    return <AdminExamList isDesktop={isDesktop} exams={list} now={now} onEdit={setEditing} onDelete={remove} />;
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title="Tests" actions={isDesktop && [<span key="tabs">{tabs}</span>, <SearchField key="search" value={query} onChange={setQuery} className="w-45" />, <span key="purge">{purgeLink}</span>]} />
      {!isDesktop && (
        <div className="flex items-center gap-3">
          {tabs}
          {purgeLink}
        </div>
      )}
      <div>{renderList()}</div>

      <AdminExamSheet exam={editing} types={types} onClose={() => setEditing(null)} onSaved={saved} />
      <DangerDialog
        open={purgeOpen}
        onClose={() => setPurgeOpen(false)}
        action="purge"
        withDate
        today={today}
        title="Alte Tests löschen?"
        text="Alle Tests vor diesem Datum verschwinden endgültig für die ganze Klasse, auch bereits gelöschte."
        onDone={changed}
      />
    </section>
  );
};

export default AdminExams;
