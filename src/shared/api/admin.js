// ─────────────────────────────────────────────────────────────
// admin.js — усі запити адмінки (docs/frontend/09-admin.md, docs/API.md → «Admin»).
// Cookie адміна (orbook_admin) окрема від cookie класу; 401 → екран «Admin · Login»
// (це робить api.js: шлях /admin/... кличе обробник адмінки).
// ─────────────────────────────────────────────────────────────
import { api, ifMatch } from "./api";

// ── Вхід ──
export const adminMe = () => api("/admin/auth/me");
export const adminLogin = (password) => api("/admin/auth/login", { method: "POST", body: { password } });
export const adminLogout = () => api("/admin/auth/logout", { method: "POST" });

// ── Огляд і план ──
export const loadOverview = () => api("/admin/overview");
export const loadClasses = () => api("/admin/plan/classes");
export const refreshPlan = () => api("/admin/plan/refresh", { method: "POST" });

// ── Editor-Codes ──
export const loadCodes = () => api("/admin/codes");
// → { code, item }: повний код є ТІЛЬКИ в цій відповіді
export const createCode = ({ label, rights, valid }) => api("/admin/codes", { method: "POST", body: { label, rights, valid } });
// changes: будь-що з { label, rights, validUntil, active }
export const updateCode = (id, changes) => api(`/admin/codes/${id}`, { method: "PATCH", body: changes });
export const regenerateCode = (id) => api(`/admin/codes/${id}/regenerate`, { method: "POST" });
export const deleteCode = (id) => api(`/admin/codes/${id}`, { method: "DELETE" });

// ── Lehrer-Codes (частина 14) ──
// → { teachers: [{ short, subjects: ["Ma"], codeId }] }: Kürzel із плану класу; codeId — діючий Lehrer-Code або null
export const loadTeachers = () => api("/admin/teachers");
// Один Kürzel — один діючий код: другий → 409 teacher_exists. → { code, item }, код ORB-L-… лише тут
export const createTeacherCode = ({ teacher, rights, valid }) => api("/admin/codes", { method: "POST", body: { kind: "teacher", teacher, rights, valid } });

// ── Arten von Tests (часть 24) ──
// → { types: [{ name, short, count }], examsAutoMove, homeworkAutoMove }
export const loadExamTypes = () => api("/admin/exam-types");
// Весь список по порядку: { name, short, was? } (was — старое имя при переименовании).
// replaceWith: { "Abgabe": "Test" } — замена для удалённого вида с записями; без неё 409 type_in_use
export const saveExamTypes = (types, replaceWith = {}) => api("/admin/exam-types", { method: "PUT", body: { types, replaceWith } });

// ── Hausaufgaben ──
// «Hausaufgaben jetzt aufräumen»: за строком homework.keepDays → { removed }
export const purgeHomework = () => api("/admin/homework/purge", { method: "POST" });

// ── Klausuren ──
export function loadAdminExams({ scope, q = "" }) {
  const params = new URLSearchParams({ scope });
  if (q.trim()) params.set("q", q.trim());
  return api(`/admin/exams?${params}`);
}
// If-Match необов'язковий, але з ним сервер помітить, що запис уже змінили (409)
export const updateAdminExam = (exam, changes) => api(`/admin/exams/${exam.id}`, { method: "PATCH", body: changes, headers: ifMatch(exam.version) });
export const deleteAdminExam = (exam) => api(`/admin/exams/${exam.id}`, { method: "DELETE" });
export const restoreAdminExam = (exam) => api(`/admin/exams/${exam.id}/restore`, { method: "POST" });

// ── Einstellungen ──
export const loadSettings = () => api("/admin/settings");
// Тільки змінене (settingsPatch); пароль школи лише на запис, порожній не шлемо
export const saveSettings = (patch, schoolPassword = "") =>
  api("/admin/settings", { method: "PATCH", body: { settings: patch, ...(schoolPassword ? { schoolPassword } : {}) } });
// Нічого не зберігає: лише пробує завантажити Klassen.xml з цими даними
export const testConnection = (values) => api("/admin/plan/test-connection", { method: "POST", body: values });

// ── Passwörter (частина 14b) ──
// Усі пристрої класу вийдуть. → { devicesSignedOut, password: null }
export const changeClassPassword = (password) => api("/admin/class-password", { method: "POST", body: { password } });
// Пароль придумує сервер. → { devicesSignedOut, password }: пароль є ТІЛЬКИ в цій відповіді
export const generateClassPassword = () => api("/admin/class-password", { method: "POST", body: { generate: true } });
// Цей пристрій лишається в адмінці, інші виходять. → { otherSessionsEnded }; 403 wrong_password рахується в ліміт входу
export const changeAdminPassword = (currentPassword, newPassword) => api("/admin/admin-password", { method: "POST", body: { currentPassword, newPassword } });

// ── Muster-Stundenplan (частина 19b) ──
// → { source, abMode, abWeek, schoolAbWeek, weeks | null, updatedAt, auto: { A, B }, autoFrom, autoTo, lessonTimes }
export const loadMuster = () => api("/admin/muster");
// Своя сітка тижнів A і B. 422 → details.fields «weeks.A.3» (дубль або забагато курсів в уроці)
export const saveMuster = (weeks) => api("/admin/muster", { method: "PUT", body: { weeks } });

// ── Protokoll ──
export function loadEvents({ kind = "all", q = "", before = null }) {
  const params = new URLSearchParams({ kind });
  if (q.trim()) params.set("q", q.trim());
  if (before) params.set("before", before);
  return api(`/admin/events?${params}`);
}

// ── Gefahrenzone ──
const DANGER = {
  deleteExams: "/admin/danger/delete-exams", // «Alle Klausuren löschen»
  deleteSync: "/admin/danger/delete-sync", // «Alle Sync-Notizen löschen»
  resetStats: "/admin/danger/reset-stats", // «Statistik zurücksetzen»
  purge: "/admin/exams/purge", // «Alte löschen» (потрібна дата before)
};

// Небезпечна дія: потрібні слово LÖSCHEN і пароль адміна. Перед дією сервер сам робить бекап.
//   { status: "done", deleted?, since?, backup } — виконано; backup — ім'я файла
//   { status: "wrong_password", attemptsLeft }  — пароль неправильний (рахується в ліміт входу адміна)
//   { status: "locked", retryAfter }            — забагато помилок: форма заблокована на retryAfter секунд
//   { status: "backup_failed", message }        — бекап не вдався, нічого не видалено
//   { status: "confirm_missing" }               — у полі не «LÖSCHEN», на сервер не йдемо
export async function runDanger(action, { word, currentPassword, before }) {
  if (word !== "LÖSCHEN") return { status: "confirm_missing" };
  const body = { confirm: word, currentPassword, ...(before ? { before } : {}) };
  try {
    return { status: "done", ...(await api(DANGER[action], { method: "POST", body })) };
  } catch (error) {
    if (error.code === "wrong_password") return { status: "wrong_password", attemptsLeft: error.details?.attemptsLeft ?? null };
    if (error.code === "locked") return { status: "locked", retryAfter: error.retryAfter ?? error.details?.retryAfter ?? 1800 };
    if (error.code === "backup_failed") return { status: "backup_failed", message: error.message };
    throw error;
  }
}

// ── Kurse und Fächer ──
// → { courses: [{ nr, label, subject, teacher, group, parallel, parallelWith, automatic, forced, optional }],
//     subjects: [{ code, defaultName, name }] }. Зберігаємо через saveSettings (courses.optional, subjects.names, stats.since)
export const loadAdminCourses = () => api("/admin/courses");

// ── Zugangscodes (частина 14c) ──
// → { codes: [{ id, label, masked, audience, maxDevices | null, devices, validUntil, active, status, lastUsedAt | null }],
//     classPassword: { enabled, devices, changedAt | null, lastUsedAt | null } }
export const loadAccessCodes = () => api("/admin/access-codes");
// → { code, item }: повний код ORB-A-… є ТІЛЬКИ в цій відповіді. maxDevices: null — без ліміту
export const createAccessCode = ({ label, audience, maxDevices, valid }) => api("/admin/access-codes", { method: "POST", body: { label, audience, maxDevices, valid } });
// changes: будь-що з { label, maxDevices, validUntil, active } → { item, signedOut }. active: false — пристрої коду виходять
export const updateAccessCode = (id, changes) => api(`/admin/access-codes/${id}`, { method: "PATCH", body: changes });
export const regenerateAccessCode = (id) => api(`/admin/access-codes/${id}/regenerate`, { method: "POST" }); // → { code, item, signedOut }
export const signOutAccessCode = (id) => api(`/admin/access-codes/${id}/sign-out`, { method: "POST" }); // → { signedOut }
export const deleteAccessCode = (id) => api(`/admin/access-codes/${id}`, { method: "DELETE" }); // → { signedOut }
// Старий пароль класу: вимкнути можна лише при робочому коді (інакше 409 last_access). → { classPassword, signedOut }
export const setClassPasswordEnabled = (enabled) => api("/admin/access-codes/class-password", { method: "PATCH", body: { enabled } });
export const signOutClassPassword = () => api("/admin/access-codes/class-password/sign-out", { method: "POST" }); // → { signedOut }
// Посилання-запрошення групового коду (частина 16): створити або замінити (стара адреса перестає працювати)
// Повний Zugangscode ще раз (власник 07.11) → { code }; старий код без шифру → 409 code_hidden
export const showAccessCode = (id) => api(`/admin/access-codes/${id}/code`);
export const renewInvite = (id) => api(`/admin/access-codes/${id}/invite`, { method: "POST" }); // → { item }
// { active?, shared? }: вимкнути посилання / показати його учням (таке посилання одне на клас) → { item }
export const updateInvite = (id, changes) => api(`/admin/access-codes/${id}/invite`, { method: "PATCH", body: changes });
