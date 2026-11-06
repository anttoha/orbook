import { useParams } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import AppointmentForm from "../components/appointments/AppointmentForm";
import { loadAdminCourses } from "../shared/api/admin";
import { loadAdminAppointments } from "../shared/api/appointments";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";

// Предмети класу для «Für»: назва з налаштувань або зі шкільних даних
const toSubjects = (data) => (data?.subjects ?? []).map((s) => ({ code: s.code, name: s.name ?? s.defaultName ?? null }));

// ─────────────────────────────────────────────────────────────
// Адмін: «Neuer Termin» / «Termin ändern» (/admin/termine/neu, …/4/bearbeiten). Та сама форма, що в учителя,
// але запис іде від школи (POST /api/admin/appointments), а правити можна будь-який термін.
// ─────────────────────────────────────────────────────────────
const AdminAppointmentEdit = () => {
  const { id } = useParams();
  const data = useAdminLoad("appointment-form", () => Promise.all([loadAdminCourses(), id ? loadAdminAppointments() : null]));

  if (data.status === "loading") return <AdminSkeleton />;
  if (data.status === "error") return <AdminError error={data.error} onRetry={data.reload} />;
  const [courses, list] = data.data;
  const item = id ? (list?.appointments ?? []).find((x) => String(x.id) === id) : null;
  if (id && !item) {
    return (
      <section className="flex flex-col gap-5">
        <AdminHeader title="Termin ändern" backTo="/admin/termine" />
        <p className="text-body-sm text-muted">Diesen Termin gibt es nicht (mehr).</p>
      </section>
    );
  }
  return <AppointmentForm key={item?.id ?? "neu"} item={item} subjects={toSubjects(courses)} eyebrow="Admin · Schule" admin />;
};

export default AdminAppointmentEdit;
