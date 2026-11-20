// ─────────────────────────────────────────────────────────────
// noten.js — оценки из Home.InfoPoint (docs/API.md «Noten», часть 36).
// Сервер ORBook только передаёт запрос в школу и ничего не хранит; логин и пароль — данные InfoPoint ученика.
// Ошибки (ApiError.code): infopoint_denied, too_often (retryAfter), rate_limited, infopoint_unreachable, infopoint_changed
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

// InfoPoint бывает медленным: сервер ждёт школу до 15 с, мы — чуть дольше
export const fetchNoten = (username, password) => api("/noten/abrufen", { method: "POST", body: { username, password }, timeout: 25000 });
