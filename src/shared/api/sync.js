// ─────────────────────────────────────────────────────────────
// sync.js — запити Notizen-Sync (docs/API.md → «Notizen-Sync»).
// syncId іде ТІЛЬКИ в заголовку X-Sync-Id: адреси потрапляють у журнали, заголовки — ні.
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

const headers = (syncId) => ({ "X-Sync-Id": syncId });

// request(method, body) для syncNotes: 404 і 409 повертає статусом (це не помилка, а «блоку ще немає» / «хтось встиг»)
export const makeSyncRequest = (syncId) => async (method, body) => {
  try {
    return { status: 200, data: await api("/sync", { method, body, headers: headers(syncId) }) };
  } catch (error) {
    if (error.status === 404 || error.status === 409) return { status: error.status, error };
    throw error; // 401, 403 feature_disabled, 429, 503 sync_full, мережа …
  }
};

// Видалити блок на сервері (204, повтор безпечний)
export const deleteSyncBlock = (syncId) => api("/sync", { method: "DELETE", headers: headers(syncId) });
