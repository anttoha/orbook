import { useEffect } from "react";
import { useAppointmentStore } from "../store/appointmentsStore";
import { usePlanStore } from "../store/planStore";
import { useUserStore } from "../store/userStore";
import { appointmentsOn, mySubjects, visibleAppointments } from "../utils/appointments";

// Терміни, які бачить цей учень: курсові — лише з його предметами («Meine Kurse»).
// Перший виклик завантажує список; далі — той самий у пам'яті
export function useAppointments() {
  const all = useAppointmentStore((s) => s.items);
  const status = useAppointmentStore((s) => s.status);
  const ensure = useAppointmentStore((s) => s.ensure);
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);

  useEffect(() => {
    ensure();
  }, [ensure]);

  return { items: visibleAppointments(all, mySubjects(me, courses, picked, hiddenRequired)), status };
}

// Терміни одного дня (смужка тижня, плашка дня)
export const useAppointmentsOn = (iso) => appointmentsOn(useAppointments().items, iso);

// Один термін для вікна: { item, status } (status: loading | missing | ready)
export function useAppointment(id) {
  const all = useAppointmentStore((s) => s.items);
  const status = useAppointmentStore((s) => s.status);
  const ensure = useAppointmentStore((s) => s.ensure);
  useEffect(() => {
    ensure();
  }, [ensure]);
  const item = all.find((x) => String(x.id) === String(id)) ?? null;
  if (item) return { item, status: "ready" };
  return { item: null, status: status === "idle" || status === "loading" ? "loading" : "missing" };
}
