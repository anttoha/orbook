// ─────────────────────────────────────────────────────────────
// push.js — запросы «Mitteilungen» (docs/API.md → «Mitteilungen», часть 17).
// Endpoint устройства идёт только в заголовке X-Push-Endpoint: адреса попадают в журналы, заголовки — нет.
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

const headers = (endpoint) => ({ "X-Push-Endpoint": endpoint });

export const getPushKey = () => api("/push/key").then((r) => r.publicKey);
export const putSubscription = (body) => api("/push/subscription", { method: "PUT", body });
export const getSubscription = (endpoint) => api("/push/subscription", { headers: headers(endpoint) });
export const deleteSubscription = (endpoint) => api("/push/subscription", { method: "DELETE", headers: headers(endpoint) });
export const sendTestPush = (endpoint) => api("/push/test", { method: "POST", headers: headers(endpoint) });
export const getAdminPush = () => api("/admin/push");
