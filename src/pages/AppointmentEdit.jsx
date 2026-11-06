import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import AppointmentForm from "../components/appointments/AppointmentForm";
import PageHeader from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/PlanState";
import { useAppointmentStore } from "../shared/store/appointmentsStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { addAppointmentTarget, appointmentSubjects, canCreateAppointments } from "../shared/utils/appointments";
import { formEyebrow, formSubjects } from "../shared/utils/examRules";

const BACK = "/testen?liste=termine";

const Placeholder = ({ text }) => (
  <section className="flex flex-col gap-5 lg:max-w-186">
    <PageHeader backTo={BACK} eyebrow="Termine" title="Termin ändern" />
    {text ? <p className="text-body-sm text-muted">{text}</p> : <Skeleton className="h-40 rounded-card" />}
  </section>
);

// Форма з правильними предметами і підписом «хто записує»
const Form = ({ item }) => {
  const me = usePlanStore((s) => s.me);
  const meta = usePlanStore((s) => s.meta);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const subjects = appointmentSubjects(me, formSubjects(courses, picked, meta?.subjects, item?.subject));
  return <AppointmentForm key={item?.id ?? "neu"} item={item} subjects={subjects} eyebrow={formEyebrow(me, "Termine")} authorShort={me?.teacher?.short ?? null} />;
};

// Правка: /testen/termine/4/bearbeiten. Термін — зі списку (вантажимо, якщо адресу відкрили напряму)
const EditExisting = ({ id }) => {
  const item = useAppointmentStore((s) => s.items.find((x) => String(x.id) === id)) ?? null;
  const status = useAppointmentStore((s) => s.status);
  const ensure = useAppointmentStore((s) => s.ensure);
  useEffect(() => {
    ensure();
  }, [ensure]);

  if (!item && (status === "idle" || status === "loading")) return <Placeholder />;
  if (!item) return <Placeholder text="Diesen Termin gibt es nicht (mehr)." />;
  if (!item.canEdit) return <Placeholder text="Diesen Termin kannst du nicht ändern." />;
  return <Form item={item} />;
};

// ─────────────────────────────────────────────────────────────
// «Neuer Termin» / «Termin ändern» (частина 18): /testen/termine/neu і …/4/bearbeiten.
// Права ще раз перевіряємо тут (адресу можна відкрити напряму), остаточно — сервер.
// ─────────────────────────────────────────────────────────────
const AppointmentEdit = () => {
  const { id } = useParams();
  const me = usePlanStore((s) => s.me);
  // лише при вході: якщо код застаріє посеред запису, сервер скаже при збереженні
  const [redirect] = useState(() => (canCreateAppointments(me) ? null : addAppointmentTarget(me) ?? BACK));

  if (id) return <EditExisting id={id} />;
  if (redirect) return <Navigate to={redirect} replace />;
  return <Form item={null} />;
};

export default AppointmentEdit;
