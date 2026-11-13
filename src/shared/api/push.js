// ─────────────────────────────────────────────────────────────
// push.js — запросы «Mitteilungen» (docs/API.md → «Mitteilungen», часть 17).
// Endpoint устройства идёт только в заголовке X-Push-Endpoint: адреса попадают в журналы, заголовки — нет.
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

const headers = (endpoint) => ({ "X-Push-Endpoint": endpoint });

export const getPushKey = () => api("/push/key").then((r) => r.publicKey);
// Часть 29: подписка — своя у каждого класса (сервер: endpoint + класс). classId — не открытый класс
export const putSubscription = (body, classId) => api("/push/subscription", { method: "PUT", body, ...(classId !== undefined ? { classId } : {}) });
export const getSubscription = (endpoint) => api("/push/subscription", { headers: headers(endpoint) });
export const deleteSubscription = (endpoint, classId) => api("/push/subscription", { method: "DELETE", headers: headers(endpoint), ...(classId !== undefined ? { classId } : {}) });
export const sendTestPush = (endpoint) => api("/push/test", { method: "POST", headers: headers(endpoint) });
export const getAdminPush = () => api("/admin/push");
