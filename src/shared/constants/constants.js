import { Ellipsis, FileText, House, List, Palette, Server, Sun, Table2 } from "lucide-react";
import { FlagIcon, KeyIcon, ShieldIcon, StatsIcon, SyncIcon } from "../../components/ui/icons";

// Масштаб «Schriftgröße» (ті самі відсотки, що в index.css): шкали часу множать на нього пікселі
export const FONT_SCALES = { 1: 0.9375, 2: 1, 3: 1.125 };

export const navTabs = [
  { to: "/woche", label: "Woche", icon: Table2, end: true, mobile: true, activeOn: ["/", "/heute", "/tag"] },
  { to: "/woche", label: "Woche", icon: Table2, end: true, desktop: true, activeOn: ["/", "/tag"] },
  { to: "/heute", label: "Heute", icon: List, desktop: true },
  { to: "/testen", label: "Klausuren", icon: FlagIcon, mobile: true, desktop: true, },
  { to: "/statistik", label: "Statistik", icon: StatsIcon, mobile: true, desktop: true, feature: "statistics" },
  { to: "/mehr", label: "Mehr", icon: Ellipsis, mobile: true },
];
// Меню адмінки. mobile — у нижньому меню телефона (4 пункти), desktop — у сайдбарі ПК.
// count — лічильник праворуч: "codes" (усі Editor-Codes) або "exams" (найближчі Klausuren)
export const adminTabs = [
  { to: "/admin", label: "Übersicht", icon: House, exact: true, mobile: true, desktop: true },
  { to: "/admin/codes", label: "Editor-Codes", short: "Codes", icon: KeyIcon, mobile: true, desktop: true, count: "codes" },
  { to: "/admin/klausuren", label: "Klausuren", icon: FlagIcon, mobile: true, desktop: true, count: "exams" },
  { to: "/admin/kurse", label: "Kurse & Fächer", icon: Table2, desktop: true },
  { to: "/admin/protokoll", label: "Protokoll", icon: FileText, desktop: true },
  { to: "/admin/einstellungen", label: "Einstellungen", icon: Server, mobile: true, desktop: true },
];

// Розділи «Einstellungen» на ПК (макети 22–29): меню зліва і плитки «Übersicht».
// hint — ключ підпису під плиткою (shared/utils/settings.js); sync — ховаємо, якщо школа вимкнула синхронізацію.
// «Mitteilungen» з'явиться в частині 17.
export const settingsSections = [
  { to: "/mehr", label: "Übersicht", icon: House, exact: true },
  { to: "/mehr/kurse", label: "Meine Kurse", icon: Table2, hint: "courses" },
  { to: "/mehr/darstellung", label: "Darstellung", icon: Sun, hint: "appearance" },
  { to: "/mehr/fachfarben", label: "Fachfarben", icon: Palette, hint: "subjects" },
  { to: "/mehr/sync", label: "Notizen-Sync", icon: SyncIcon, hint: "sync", sync: true },
  { to: "/mehr/editor-code", label: "Editor-Code", icon: KeyIcon, hint: "editor" },
  { to: "/mehr/datenschutz", label: "Datenschutz", icon: ShieldIcon, hint: "privacy" },
];
