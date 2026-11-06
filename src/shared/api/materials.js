// ─────────────────────────────────────────────────────────────
// materials.js — Materialien (docs/API.md «Materialien», частина 15).
// Як homework.js: PATCH і DELETE з версією (If-Match), 409 conflict — посилання вже змінили.
// Видалення на сервері остаточне, тому «Rückgängig» створює посилання заново.
// ─────────────────────────────────────────────────────────────
import { api, ifMatch } from "./api";
import { materialToForm } from "../utils/materials";

// Зберегти форму. Без existing — створити, з existing — змінити.
//   { status: "saved", exam: item }  або  { status: "conflict", current }
// («exam» — щоб спільний useExamSave не розрізняв види записів)
export async function saveMaterial(form, existing = null) {
  try {
    const item = existing ? await api(`/materials/${existing.id}`, { method: "PATCH", body: form, headers: ifMatch(existing.version) }) : await api("/materials", { method: "POST", body: form });
    return { status: "saved", exam: item };
  } catch (error) {
    if (error.code === "conflict") return { status: "conflict", current: error.details.current };
    throw error;
  }
}

export const deleteMaterial = (item) => api(`/materials/${item.id}`, { method: "DELETE", headers: ifMatch(item.version) });

// «Rückgängig» після видалення: те саме посилання ще раз
export const recreateMaterial = (item) => api("/materials", { method: "POST", body: materialToForm(item) });

// Адмінка: усі посилання (з міткою коду) і видалення будь-якого
export const loadAdminMaterials = (signal) => api("/admin/materials", { signal });
export const deleteAdminMaterial = (item) => api(`/admin/materials/${item.id}`, { method: "DELETE" });
