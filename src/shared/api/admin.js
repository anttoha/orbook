// ─────────────────────────────────────────────────────────────
// admin.js — усі запити адмінки (docs/frontend/09-admin.md, docs/API.md → «Admin»).
// Cookie адміна (orbook_admin) окрема від cookie класу; 401 → екран «Admin · Login»
// (це робить api.js: шлях /admin/... кличе обробник адмінки).
// ─────────────────────────────────────────────────────────────
import { api, ifMatch } from "./api";

// Часть 29: запрос от имени класса кода (в списке коды всех классов). Нет classId — класс из чипа
const asClass = (classId) => (classId ? { classId } : {});

// ── Вхід ──
export const adminMe = () => api("/admin/auth/me");
export const adminLogin = (password) => api("/admin/auth/login", { method: "POST", body: { password } });
export const adminLogout = () => api("/admin/auth/logout", { method: "POST" });

// ── Огляд і план ──
export const loadOverview = () => api("/admin/overview");
export const loadClasses = () => api("/admin/plan/classes");
export const refreshPlan = () => api("/admin/plan/refresh", { method: "POST" });

// ── Editor-Codes ──
export const loadCodes = (classId) => api("/admin/codes", asClass(classId));
// → { code, item }: повний код є ТІЛЬКИ в цій відповіді
// schoolId + className (частина 29) — код для цього класу; без них — клас із чипа адмінки
export const createCode = ({ label, rights, valid, schoolId, className }) => api("/admin/codes", { method: "POST", body: { label, rights, valid, schoolId, className } });
// changes: будь-що з { label, rights, validUntil, active }
// classId — класс этого кода (см. asClass)
export const updateCode = (id, changes, classId) => api(`/admin/codes/${id}`, { method: "PATCH", body: changes, ...asClass(classId) });
export const regenerateCode = (id, classId) => api(`/admin/codes/${id}/regenerate`, { method: "POST", ...asClass(classId) });
export const deleteCode = (id, classId) => api(`/admin/codes/${id}`, { method: "DELETE", ...asClass(classId) });

// ── Lehrer-Codes (частина 14) ──
// → { teachers: [{ short, subjects: ["Ma"], codeId }] }: Kürzel із плану класу; codeId — діючий Lehrer-Code або null
// classId — Kürzel з плану іншого класу (поле «Klasse» у новому Lehrer-Code)
export const loadTeachers = (classId) => api("/admin/teachers", classId ? { classId } : {});
// Один Kürzel — один діючий код: другий → 409 teacher_exists. → { code, item }, код ORB-L-… лише тут
export const createTeacherCode = ({ teacher, rights, valid, schoolId, className }) => api("/admin/codes", { method: "POST", body: { kind: "teacher", teacher, rights, valid, schoolId, className } });

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
// Часть 29: «Klasse löschen» — action { classId }: DELETE з тим самим тілом (LÖSCHEN + пароль)
const dangerRequest = (action) => (typeof action === "object" ? { path: `/admin/classes/${action.classId}`, method: "DELETE" } : { path: DANGER[action], method: "POST" });

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
    const { path, method } = dangerRequest(action);
    return { status: "done", ...(await api(path, { method, body })) };
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
// Один набор запросов на два адреса (часть 29): админ — /admin/access-codes (все классы, Klassenpasswort),
// учитель или староста с правом «Klasse verwalten» — /class/access-codes (только свой класс)
function accessApi(base) {
  return {
    // → { codes: [{ id, label, masked, audience, maxDevices | null, devices, validUntil, active, status, lastUsedAt | null }],
    //     classPassword: { enabled, devices, changedAt | null, lastUsedAt | null } } (classPassword — только у админа)
    list: (classId) => api(base, asClass(classId)),
    // → { code, item }: повний код ORB-A-… є ТІЛЬКИ в цій відповіді. maxDevices: null — без ліміту
    // schoolId + className (частина 29, лише адмін) — код для іншого класу; клас, якого ще немає, з'являється з цим кодом
    create: ({ label, audience, maxDevices, valid, schoolId, className }) => api(base, { method: "POST", body: { label, audience, maxDevices, valid, schoolId, className } }),
    // changes: будь-що з { label, maxDevices, validUntil, active } → { item, signedOut }. active: false — пристрої коду виходять
    // classId (последний параметр везде) — класс этого кода; нет — класс из чипа / свой класс
    update: (id, changes, classId) => api(`${base}/${id}`, { method: "PATCH", body: changes, ...asClass(classId) }),
    regenerate: (id, classId) => api(`${base}/${id}/regenerate`, { method: "POST", ...asClass(classId) }), // → { code, item, signedOut }
    signOut: (id, classId) => api(`${base}/${id}/sign-out`, { method: "POST", ...asClass(classId) }), // → { signedOut }
    remove: (id, classId) => api(`${base}/${id}`, { method: "DELETE", ...asClass(classId) }), // → { signedOut }
    // Повний Zugangscode ще раз (власник 07.11) → { code }; старий код без шифру → 409 code_hidden
    show: (id, classId) => api(`${base}/${id}/code`, asClass(classId)),
    // Посилання-запрошення групового коду (частина 16): створити або замінити (стара адреса перестає працювати) → { item }
    renewInvite: (id, classId) => api(`${base}/${id}/invite`, { method: "POST", ...asClass(classId) }),
    // { active?, shared? }: вимкнути посилання / показати його учням (таке посилання одне на клас) → { item }
    updateInvite: (id, changes, classId) => api(`${base}/${id}/invite`, { method: "PATCH", body: changes, ...asClass(classId) }),
  };
}
export const adminAccess = accessApi("/admin/access-codes");
export const classAccess = accessApi("/class/access-codes");
export const loadAccessCodes = adminAccess.list;

// Старий пароль класу: вимкнути можна лише при робочому коді (інакше 409 last_access). → { classPassword, signedOut }
// classId — класс, у которого Klassenpasswort (№ 1), даже если в чипе другой класс
export const setClassPasswordEnabled = (enabled, classId) => api("/admin/access-codes/class-password", { method: "PATCH", body: { enabled }, ...asClass(classId) });
export const signOutClassPassword = (classId) => api("/admin/access-codes/class-password/sign-out", { method: "POST", ...asClass(classId) }); // → { signedOut }

// ── Schulen & Klassen (часть 29) ──
// → { schools: [{ id, name, number, baseUrl, passwordSet, classesInPlan, classes: [{ id, name, devices, codes, exams }] }] }
export const loadSchools = () => api("/admin/schools");
// Класи з плану школи: { classes: [{ name, id | null }], needsTest }
export const loadSchoolClasses = (schoolId) => api(`/admin/schools/${schoolId}/classes`);
// school: { name, number, password, baseUrl } → школа; 422 — поля (details.fields)
export const createSchool = (school) => api("/admin/schools", { method: "POST", body: school });
// changes: будь-що з { name, number, password, baseUrl }; порожній пароль не шлемо — лишається старий
export const updateSchool = (id, changes) => api(`/admin/schools/${id}`, { method: "PATCH", body: changes });
// «Verbindung testen» → { ok, classesFound, classes, message }. Нової школи ще немає — перевірка без збереження;
// у збереженої школи сервер при успіху запам'ятовує список класів (потрібен полю «Klasse»)
export const testSchool = (id, values) => api(id ? `/admin/schools/${id}/test` : "/admin/schools/test", { method: "POST", body: values });
export const deleteSchool = (id) => api(`/admin/schools/${id}`, { method: "DELETE" }); // 409 school_not_empty

// ── Kanäle (часть 27): Telegram-группа класса ──
// → { botConfigured, botUsername, group: { title, members, connectedAt, lastOkAt, error } | null, tomorrowAt, recent: [{ kind, title, sentAt, ok }] }
export const loadChannels = () => api("/admin/channels");
// → { link, expiresAt }: t.me/…?startgroup=… на 15 минут; 409 telegram_missing — бот на сервере не настроен
export const telegramLink = () => api("/admin/channels/telegram/link", { method: "POST" });
export const telegramTest = () => api("/admin/channels/test", { method: "POST" }); // → { ok }
export const telegramDisconnect = () => api("/admin/channels/telegram", { method: "DELETE" });
// kind: "plan" | "tomorrow" → { text } (text может быть null — сказать нечего)
export const loadChannelText = (kind) => api(`/admin/channels/text?kind=${kind}`);
