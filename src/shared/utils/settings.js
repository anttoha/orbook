import { isTabEnabled } from "./isTabActive";

// Підписи під плитками «Einstellungen · Übersicht» на ПК (макет 22).
// Чисті функції: усі дані приходять параметрами, тому їх легко перевірити тестом.

const THEME_LABELS = { light: "Hell", dark: "Dunkel", system: "System" };

// Локальна дата і час пристрою: «2026-11-06», «07:40»
const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const localTime = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

// «7 von 8 Kursen»; курсів ще немає → null (рядок просто порожній)
export const coursesHint = ({ on, all }) => (all > 0 ? `${on} von ${all} Kursen` : null);

// «Hell · Start mit Woche»
export const appearanceHint = (theme, startView) =>
  `${THEME_LABELS[theme] ?? THEME_LABELS.system} · Start mit ${{ heute: "Heute", start: "Blöcken" }[startView] ?? "Woche"}`;

// «8 Fächer» / «1 Fach»; без предметів → null
export const subjectsHint = (count) => (count > 0 ? `${count} ${count === 1 ? "Fach" : "Fächer"}` : null);

// «K7QM-… · heute 07:40», «K7QM-… · 4.11.», без коду — «Aus»
export const syncHint = (code, lastSyncAt, now = new Date()) => {
  if (!code) return "Aus";
  const head = `${code.slice(0, 4)}-…`;
  const last = lastSyncAt ? new Date(lastSyncAt) : null;
  if (!last || Number.isNaN(last.getTime())) return head; // ще жодного разу не синхронізували
  const when = localDate(last) === localDate(now) ? `heute ${localTime(last)}` : `${last.getDate()}.${last.getMonth() + 1}.`;
  return `${head} · ${when}`;
};

// «Code A» (мітка коду) або «nicht freigeschaltet»
export const editorHint = (editor) => editor?.label ?? (editor ? "freigeschaltet" : "nicht freigeschaltet");

// Чи показувати розділ «Mehr»: Sync і Statistik школа могла вимкнути, Editor-Code учителю не потрібен,
// «Klasse verwalten» — лише з правом canManageClass (частина 29c)
export const sectionVisible = (section, { syncAllowed, teacher, features, canManage = false }) =>
  (!section.sync || syncAllowed) && !(section.classOnly && teacher) && !(section.manage && !canManage) && isTabEnabled(section, features);
