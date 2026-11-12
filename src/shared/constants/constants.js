import { Bell, CalendarDays, Ellipsis, FileText, Folder, House, Layers, List, Megaphone, Palette, Server, Sparkles, Sun, Table2, UserRound } from "lucide-react";
import { FlagIcon, KeyIcon, LockIcon, ShieldIcon, StatsIcon, SyncIcon } from "../../components/ui/icons";

// Масштаб «Schriftgröße» (ті самі відсотки, що в index.css): шкали часу множать на нього пікселі
export const FONT_SCALES = { 1: 0.9375, 2: 1, 3: 1.125 };

export const navTabs = [
  { to: "/woche", label: "Woche", icon: Table2, end: true, mobile: true, activeOn: ["/", "/heute", "/tag"] },
  { to: "/woche", label: "Woche", icon: Table2, end: true, desktop: true, activeOn: ["/", "/tag"] },
  { to: "/heute", label: "Heute", icon: List, desktop: true },
  { to: "/testen", label: "Tests", icon: FlagIcon, mobile: true, desktop: true, },
  // Materialien (частина 15): на ПК — пункт меню, на телефоні — з «Mehr»
  { to: "/materialien", label: "Materialien", icon: Folder, desktop: true },
  // Materialien і Statistik (частина 22) відкриваються з «Mehr»
  { to: "/mehr", label: "Mehr", icon: Ellipsis, mobile: true, activeOn: ["/materialien", "/statistik"] },
];
// Меню адмінки. mobile — у нижньому меню телефона (4 пункти), desktop — у сайдбарі ПК.
// count — лічильник праворуч: "codes" (усі Editor-Codes) або "exams" (найближчі Klausuren)
export const adminTabs = [
  { to: "/admin", label: "Übersicht", icon: House, exact: true, mobile: true, desktop: true },
  // Lehrer-Codes: на ПК — окремий пункт, на телефоні — друга половина вкладки «Codes» (перемикач, Admin.jsx)
  { to: "/admin/codes", label: "Editor-Codes", short: "Codes", icon: KeyIcon, mobile: true, desktop: true, count: "codes" },
  { to: "/admin/lehrer", label: "Lehrer-Codes", icon: UserRound, desktop: true, count: "teachers" },
  // Passwörter: на ПК — пункт меню, на телефоні — з Einstellungen і «Übersicht → Schnell» (частина 14b)
  { to: "/admin/zugang", label: "Zugangscodes", icon: LockIcon, desktop: true, count: "access", activeOn: ["/admin/passwoerter"] }, // частина 14c; паролі (14b) — підсторінка
  { to: "/admin/klausuren", label: "Tests", icon: FlagIcon, mobile: true, desktop: true, count: "exams" },
  { to: "/admin/kurse", label: "Kurse & Fächer", icon: Table2, desktop: true },
  { to: "/admin/muster", label: "Muster", icon: Layers, desktop: true }, // частина 19b; телефон — з Einstellungen і «Übersicht → Schnell»
  { to: "/admin/materialien", label: "Materialien", icon: Folder, desktop: true }, // частина 15; телефон — «Übersicht → Schnell»
  { to: "/admin/termine", label: "Termine", icon: CalendarDays, desktop: true }, // частина 18; телефон — «Übersicht → Schnell»
  { to: "/admin/kanaele", label: "Kanäle", icon: Megaphone, desktop: true }, // частина 27; телефон — з Einstellungen і «Übersicht → Schnell»
  { to: "/admin/protokoll", label: "Protokoll", icon: FileText, desktop: true },
  { to: "/admin/einstellungen", label: "Einstellungen", icon: Server, mobile: true, desktop: true },
];

// Розділи «Mehr» на ПК (макети 22–29, частина 22): меню зліва і плитки «Übersicht», у двох групах.
// group — «seiten» (просто сторінки) або «einstellungen» (те, що налаштовується).
// hint — ключ підпису під плиткою (shared/utils/settings.js); sync — ховаємо, якщо школа вимкнула синхронізацію;
// feature — ховаємо, якщо школа вимкнула розділ (me.features).
export const settingsSections = [
  { to: "/mehr", label: "Übersicht", icon: House, exact: true },
  { to: "/statistik", label: "Statistik", icon: StatsIcon, hint: "stats", group: "seiten", feature: "statistics" },
  { to: "/mehr/neuigkeiten", label: "Neuigkeiten", icon: Sparkles, hint: "news", group: "seiten", badge: "news" }, // часть 22b
  { to: "/mehr/datenschutz", label: "Datenschutz", icon: ShieldIcon, hint: "privacy", group: "seiten" },
  { to: "/mehr/kurse", label: "Meine Kurse", icon: Table2, hint: "courses", group: "einstellungen" },
  { to: "/mehr/darstellung", label: "Darstellung", icon: Sun, hint: "appearance", group: "einstellungen" },
  { to: "/mehr/fachfarben", label: "Fachfarben", icon: Palette, hint: "subjects", group: "einstellungen" },
  { to: "/mehr/mitteilungen", label: "Mitteilungen", icon: Bell, hint: "push", group: "einstellungen", feature: "push" }, // частина 17
  { to: "/mehr/sync", label: "Synchronisieren", icon: SyncIcon, hint: "sync", sync: true, group: "einstellungen" },
  { to: "/mehr/editor-code", label: "Editor-Code", icon: KeyIcon, hint: "editor", classOnly: true, group: "einstellungen" }, // учителю код не потрібен
];

// Дві групи «Mehr» з підписом праворуч від заголовка (макет 22, частина 22)
export const settingsGroups = [
  { key: "seiten", title: "Seiten", hint: "weitere Bereiche der App" },
  { key: "einstellungen", title: "Einstellungen", hint: "so soll ORBook bei dir sein" },
];
