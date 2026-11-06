// ─────────────────────────────────────────────────────────────
// appointments.js — Termine (docs/API.md «Termine», частина 18).
// Як materials.js: PATCH і DELETE з версією (If-Match), 409 conflict — термін уже змінили.
// Адмін пише через /api/admin/appointments («Eingetragen von der Schule»).
// ─────────────────────────────────────────────────────────────
import { api, ifMatch } from "./api";
import { appointmentToForm, formToBody } from "../utils/appointments";

const base = (admin) => (admin ? "/admin/appointments" : "/appointments");

// Зберегти форму. Без existing — створити, з existing — змінити.
//   { status: "saved", exam: item }  або  { status: "conflict", current }
// («exam» — щоб спільний useExamSave не розрізняв види записів)
export async function saveAppointment(form, existing = null, { admin = false } = {}) {
  const body = formToBody(form);
  try {
    const item = existing ? await api(`${base(admin)}/${existing.id}`, { method: "PATCH", body, headers: ifMatch(existing.version) }) : await api(base(admin), { method: "POST", body });
    return { status: "saved", exam: item };
  } catch (error) {
    if (error.code === "conflict") return { status: "conflict", current: error.details.current };
    throw error;
  }
}

export const deleteAppointment = (item, { admin = false } = {}) => api(`${base(admin)}/${item.id}`, { method: "DELETE", headers: ifMatch(item.version) });

// «Rückgängig» після видалення: той самий термін ще раз (на сервері видалення остаточне)
export const recreateAppointment = (item, { admin = false } = {}) => api(base(admin), { method: "POST", body: formToBody(appointmentToForm(item)) });

// Адмінка: усі терміни (з міткою коду)
export const loadAdminAppointments = (signal) => api("/admin/appointments", { signal });
