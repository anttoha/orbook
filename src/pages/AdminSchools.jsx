import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Plus } from "lucide-react";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import DangerDialog from "../components/admin/DangerDialog";
import SchoolCard from "../components/admin/schools/SchoolCard";
import SchoolSheet from "../components/admin/schools/SchoolSheet";
import SchoolTable from "../components/admin/schools/SchoolTable";
import Button from "../components/ui/Button";
import { SchoolIcon } from "../components/ui/icons";
import { useAdminClasses } from "../shared/hooks/useAdminClasses";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useAdminStore } from "../shared/store/adminStore";
import { adminClassColor } from "../shared/utils/adminClasses";

// Пунктирная карточка «Schule hinzufügen» внизу списка (телефон)
const AddSchoolTile = ({ onClick }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-4 rounded-card border-2 border-dashed border-rule px-4 py-4 text-left">
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
      <SchoolIcon className="size-5" />
    </span>
    <span className="min-w-0">
      <span className="block text-subhead text-ink">Schule hinzufügen</span>
      <span className="block truncate text-label text-faint">Mit den Zugangsdaten von stundenplan24.de</span>
    </span>
  </button>
);

const NOTE = "Eine Klasse entsteht mit ihrem ersten Code (Zugangs-, Lehrer- oder Editor-Code) und hat eigene Tests, Kanäle und Einstellungen. Den Plan lädt ORBook pro Schule einmal.";
const NOTE_SHORT = "Eine Klasse entsteht mit ihrem ersten Code. Der Plan lädt pro Schule nur einmal.";

// ─────────────────────────────────────────────────────────────
// «Schulen & Klassen» (часть 29, макеты handy-12, pc-03): все школы сервера и их классы.
// Класс → «Öffnen» (вся админка переключается на него), «Code für neue Klasse» → новый Zugangscode
// с этой школой, «Schule hinzufügen» / «Zugang ändern» — окно школы, ⋮ → «Klasse löschen» (ПК).
// ─────────────────────────────────────────────────────────────
const AdminSchools = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const schools = useAdminStore((s) => s.schools);
  const reloadSchools = useAdminStore((s) => s.reloadSchools);
  const setClass = useAdminStore((s) => s.setClass);
  const { list } = useAdminClasses();
  const [sheet, setSheet] = useState(null); // { school | null } — окно школы открыто
  const [deleting, setDeleting] = useState(null); // класс для «Klasse löschen»

  // Числа (устройства, коды) меняются — при каждом открытии свежий список
  useEffect(() => {
    reloadSchools();
  }, [reloadSchools]);

  const actions = {
    colorOf: (id) => adminClassColor(list, id),
    onOpen: (item) => {
      setClass(item.id);
      navigate("/admin");
    },
    onEdit: (school) => setSheet({ school }),
    onNewCode: (school) => navigate(`/admin/zugang?neu=1&schule=${school.id}`),
    onDelete: setDeleting,
  };

  const renderBody = () => {
    if (schools.status === "loading") return <AdminSkeleton rows={4} />;
    if (schools.status === "error") return <AdminError error={schools.error} onRetry={reloadSchools} />;
    const Item = isDesktop ? SchoolTable : SchoolCard;
    return schools.data.schools.map((school) => <Item key={school.id} school={school} {...actions} />);
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader
        title="Schulen & Klassen"
        backTo="/admin/einstellungen"
        server
        actions={
          isDesktop && (
            <Button variant="primary" className="flex-none px-5" onClick={() => setSheet({ school: null })}>
              <Plus className="size-4.5" /> Schule hinzufügen
            </Button>
          )
        }
      />
      {isDesktop && (
        <p className="flex items-center gap-2.5 rounded-card bg-sand px-4 py-2.5 text-label text-muted">
          <Info className="size-4 shrink-0" /> {NOTE}
        </p>
      )}
      {renderBody()}
      {!isDesktop && schools.status === "ready" && <AddSchoolTile onClick={() => setSheet({ school: null })} />}
      {isDesktop ? (
        <p className="text-label text-faint">Klasse löschen: im Menü ⋮ — mit dem Wort LÖSCHEN und Admin-Passwort. Die Daten der anderen Klassen bleiben.</p>
      ) : (
        <p className="flex gap-3 rounded-card bg-sand px-4 py-3.5 text-body-sm text-muted">
          <Info className="mt-0.5 size-4.5 shrink-0" /> {NOTE_SHORT}
        </p>
      )}

      <SchoolSheet open={sheet !== null} school={sheet?.school ?? null} onClose={() => setSheet(null)} />
      <DangerDialog
        open={deleting !== null}
        action={{ classId: deleting?.id }}
        title={`Klasse ${deleting?.name ?? ""} löschen?`}
        text="Alle Codes, Tests, Hausaufgaben, Materialien und Termine dieser Klasse werden gelöscht. Ihre Geräte verlieren nur diese Klasse."
        confirmLabel="Klasse löschen"
        onClose={() => setDeleting(null)}
        onDone={reloadSchools}
      />
    </section>
  );
};

export default AdminSchools;
