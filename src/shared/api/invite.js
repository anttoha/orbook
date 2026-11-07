// ─────────────────────────────────────────────────────────────
// Запрошення посиланням (частина 16, /opt/orbook-be/docs/API.md «Einladungslink»).
// Посилання = /i/<token>; повну адресу складає inviteUrl (shared/utils/invite.js).
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

// Без входу: чи живе посилання → { className, full }; 404 invite_invalid — ні
export const previewInvite = (token) => api(`/public/invite/${encodeURIComponent(token)}`);

// «Beitreten»: як вхід кодом → { className, features } + cookie класу
export const joinWithInvite = (token) => api("/auth/join", { method: "POST", body: { token } });

// «Klasse einladen» в «Mehr»: посилання, яке адмін дозволив показувати учням → { token, className }; 404 invite_off
export const loadClassInvite = () => api("/invite");
