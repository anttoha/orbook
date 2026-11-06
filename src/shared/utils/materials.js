// ─────────────────────────────────────────────────────────────
// materials.js — Materialien (частина 15): посилання на Google Drive / OneDrive за предметами.
// Перевірка посилання — та сама, що на сервері (docs/API.md «Materialien»): тут лише щоб одразу
// показати «Erkannt: Google Drive · Ordner» або помилку. Останнє слово — за сервером.
// ─────────────────────────────────────────────────────────────
import { isTeacher } from "./examRules";
import { shortDate, subjectName } from "./format";

export const TITLE_MAX = 80;
const URL_MAX = 500;

// Дозволені сайти: показуємо під полем посилання і в адмінці («Erlaubt»)
export const MATERIAL_SITES = [
  { provider: "google", name: "Google Drive", hosts: ["drive.google.com", "docs.google.com"] },
  { provider: "onedrive", name: "OneDrive", hosts: ["onedrive.live.com", "1drv.ms", "SharePoint"] },
];
const HOSTS = { "drive.google.com": "google", "docs.google.com": "google", "onedrive.live.com": "onedrive", "1drv.ms": "onedrive" };
const SHAREPOINT = ".sharepoint.com";

export const PROVIDER_LABEL = { google: "Google Drive", onedrive: "OneDrive" };
export const KIND_LABEL = { folder: "Ordner", document: "Dokument", sheet: "Tabelle", slides: "Präsentation", pdf: "PDF", file: "Datei" };

// Тексти помилок поля «Link» (як на сервері)
export const LINK_ERRORS = {
  required: "Bitte einen Link einfügen.",
  too_long: `Der Link darf höchstens ${URL_MAX} Zeichen lang sein.`,
  invalid: "Der Link darf keine Leerzeichen enthalten.",
  not_allowed: "Nur Links von Google Drive oder OneDrive.",
  incomplete: "Bitte den Link zur Datei oder zum Ordner einfügen.",
};

const providerOf = (host) => HOSTS[host] ?? (host.endsWith(SHAREPOINT) && host.length > SHAREPOINT.length ? "onedrive" : null);
const GOOGLE_DOCS = { document: "document", spreadsheets: "sheet", presentation: "slides" };
const ONEDRIVE_SHORT = { f: "folder", w: "document", x: "sheet", p: "slides", b: "pdf" };

// Вид за адресою: папка, документ … (без запитів до чужих сайтів)
function kindOf(host, path) {
  const parts = path.split("/").filter(Boolean);
  if (host === "drive.google.com") return parts.includes("folders") ? "folder" : "file";
  if (host === "docs.google.com") return GOOGLE_DOCS[parts[0]] ?? "file";
  if (host === "1drv.ms") return ONEDRIVE_SHORT[parts[0]] ?? "file";
  // SharePoint: https://schule.sharepoint.com/:f:/s/… — буква між двокрапками
  if (host.endsWith(SHAREPOINT) && parts[0]?.startsWith(":")) return ONEDRIVE_SHORT[parts[0].replaceAll(":", "")] ?? "file";
  return "file";
}

// Перевірити вставлене посилання.
//   { ok: true, url, provider, kind }  або  { ok: false, error: "not_allowed" | … }
export function checkLink(value) {
  let raw = (value ?? "").trim();
  if (!raw) return { ok: false, error: "required" };
  if (raw.length > URL_MAX) return { ok: false, error: "too_long" };
  if (/\s/.test(raw) || [...raw].some((ch) => ch.charCodeAt(0) < 32)) return { ok: false, error: "invalid" }; // пробіли й керівні символи
  if (!raw.includes("://")) {
    // «javascript:…», «mailto:…» — не посилання на Drive; «drive.google.com/…» без https — можна
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !Object.keys(HOSTS).some((host) => raw.toLowerCase().startsWith(host))) return { ok: false, error: "not_allowed" };
    raw = `https://${raw}`;
  }
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, error: "not_allowed" };
  }
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.port) return { ok: false, error: "not_allowed" };
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const provider = providerOf(host);
  if (!provider) return { ok: false, error: "not_allowed" };
  if (parsed.pathname.replaceAll("/", "") === "" && !parsed.search) return { ok: false, error: "incomplete" };
  parsed.protocol = "https:";
  return { ok: true, url: parsed.href, provider, kind: kindOf(host, parsed.pathname) };
}

// «Google Drive · Ordner · von Mü». Посилання за Editor-Code — без імені (author: null)
export function materialMeta(item) {
  const parts = [PROVIDER_LABEL[item.provider] ?? "Link", KIND_LABEL[item.kind] ?? KIND_LABEL.file];
  if (item.author?.short) parts.push(`von ${item.author.short}`);
  return parts.join(" · ");
}

// Рядок унизу шторки: «Eingetragen von Mü · 12. Sept»; за Editor-Code — без імені
export function addedText(item) {
  const date = item.createdAt ? shortDate(item.createdAt.slice(0, 10)) : null;
  const who = item.author?.short ? `Eingetragen von ${item.author.short}` : "Geteilt";
  if (!date) return who;
  return item.author?.short ? `${who} · ${date}` : `${who} am ${date}`;
}

// Коротка адреса для вікна дій: «drive.google.com/drive/folders/1aX…»
export function shortUrl(url, max = 36) {
  const plain = (url ?? "").replace(/^https?:\/\//, "");
  return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain;
}

// Групи за предметами (за назвою, по-німецьки), всередині — нові зверху (так віддає сервер)
export function groupMaterials(items) {
  const groups = new Map();
  for (const item of items) {
    const code = item.subject?.code ?? "";
    if (!groups.has(code)) groups.set(code, { code, name: subjectName(item.subject), items: [] });
    groups.get(code).items.push(item);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));
}

// Чипи фільтра: лише предмети, для яких є посилання
export const materialChips = (items) => [...new Set(items.map((item) => item.subject?.code).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));

// Право ділитися: у коді вчителя чи Editor-Code
export const canShareMaterials = (me) => Boolean(me?.teacher?.canMaterials || me?.editor?.canMaterials);

// Куди веде «+»: учню без коду — спершу Editor-Code; з кодом без права — кнопки немає
export function addMaterialTarget(me) {
  if (canShareMaterials(me)) return "/materialien/neu";
  return me?.editor || isTeacher(me) ? null : "/editor-code?weiter=material";
}

// Предмети у формі: учителю — лише свої за планом (teacher.subjects), іншим — усі з форми Klausur
export function materialSubjects(me, allSubjects) {
  if (!isTeacher(me)) return allSubjects;
  const own = me.teacher?.subjects ?? [];
  return allSubjects.filter((subject) => own.includes(subject.code));
}

// Перевірка форми перед відправкою: { subject?, title?, url? } — тексти помилок
export function validateMaterialForm(form) {
  const errors = {};
  if (!form.subject) errors.subject = "Bitte ein Fach wählen.";
  const title = form.title.trim();
  if (!title) errors.title = "Bitte einen Titel eingeben.";
  else if (title.length > TITLE_MAX) errors.title = `Der Titel darf höchstens ${TITLE_MAX} Zeichen lang sein.`;
  const link = checkLink(form.url);
  if (!link.ok) errors.url = LINK_ERRORS[link.error];
  return errors;
}

export const materialToForm = (item) => ({ subject: item?.subject?.code ?? null, title: item?.title ?? "", url: item?.url ?? "" });
