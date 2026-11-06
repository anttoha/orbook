import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminEmpty, AdminError, AdminSkeleton } from "../components/admin/AdminState";
import AppointmentRow from "../components/appointments/AppointmentRow";
import { loadAdminAppointments } from "../shared/api/appointments";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { useNow } from "../shared/hooks/useNow";
import { groupAppointments, upcomingAppointments } from "../shared/utils/appointments";

// ─────────────────────────────────────────────────────────────
// «Termine» адмінки (частина 18): усі терміни класу (і курсові), «Termin eintragen» від школи,
// правка й видалення будь-якого — у формі (нажати на рядок). Вигляд — як список учня (макет pc-01).
// ─────────────────────────────────────────────────────────────
const AdminAppointments = () => {
  const { today } = useNow();
  const list = useAdminLoad("appointments", () => loadAdminAppointments().then((data) => data.appointments));
  const items = upcomingAppointments(list.data ?? [], today);

  const renderList = () => {
    if (list.status === "loading") return <AdminSkeleton />;
    if (list.status === "error") return <AdminError error={list.error} onRetry={list.reload} />;
    if (!items.length) return <AdminEmpty text="Noch keine Termine" />;
    return groupAppointments(items, today).map((group) => (
      <section key={group.title} className="flex flex-col gap-2">
        <h2 className="mb-0.5 text-hint font-extrabold text-faint">{group.title}</h2>
        {group.items.map((item) => (
          <Link key={item.id} to={`/admin/termine/${item.id}/bearbeiten`} className="block rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
            <AppointmentRow item={item} today={today} />
            {item.createdBy && <span className="sr-only">eingetragen mit {item.createdBy.label}</span>}
          </Link>
        ))}
      </section>
    ));
  };

  return (
    <section className="flex flex-col gap-5 lg:max-w-exams">
      <AdminHeader
        title="Termine"
        backTo="/admin"
        actions={
          <Link to="/admin/termine/neu" aria-label="Termin eintragen" className="flex h-9.5 items-center gap-2 rounded-full bg-accent px-3.5 text-row font-bold text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50 lg:h-12 lg:px-5">
            <Plus className="size-4" /> <span className="hidden lg:inline">Termin eintragen</span>
          </Link>
        }
      />
      <p className="text-body-sm text-muted">Termine der Schule erscheinen als „Eingetragen von der Schule“. Die Frist für das automatische Löschen steht unter Einstellungen.</p>
      {renderList()}
    </section>
  );
};

export default AdminAppointments;
