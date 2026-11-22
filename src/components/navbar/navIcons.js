import { Award, BookOpen, CalendarDays, CalendarX, ClipboardCheck, Clock, Ellipsis, Folder, House, List, ListChecks, Star, Table2 } from "lucide-react";
import { FlagIcon, KartenIcon, StatsIcon } from "../ui/icons";

// Иконки разделов «Untere Leiste» (ключи — из shared/utils/navLayout.js SECTIONS). Логика иконок не знает
export const SECTION_ICONS = {
  start: House,
  woche: Table2,
  heute: List,
  tests: FlagIcon,
  aufgaben: ListChecks,
  termine: CalendarDays,
  noten: ClipboardCheck,
  fehlzeiten: CalendarX,
  materialien: Folder,
  statistik: StatsIcon,
  karteikarten: KartenIcon,
  mehr: Ellipsis,
};

// Значки, которые можно выбрать группе (GROUP_ICONS)
export const GROUP_ICON = { award: Award, clock: Clock, folder: Folder, chart: StatsIcon, star: Star, book: BookOpen };

export const groupIcon = (name) => GROUP_ICON[name] ?? Award;
