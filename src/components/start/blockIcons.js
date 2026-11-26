import { CalendarDays, ClipboardCheck, Clock, CloudSun, File, Folder, List, ListChecks, RefreshCw, Sparkle, Sun, Table2, Timer } from "lucide-react";
import { FlagIcon, KartenIcon, StatsIcon } from "../ui/icons";

// Иконка каждого вида блока — в шапке блока и в списке «Block hinzufügen» (как в макетах 30)
export const BLOCK_ICONS = {
  jetzt: Clock,
  heute: List,
  woche: Table2,
  tests: FlagIcon,
  aufgaben: ListChecks,
  aenderungen: RefreshCw,
  termine: CalendarDays,
  notizen: File,
  materialien: Folder,
  statistik: StatsIcon,
  noten: ClipboardCheck,
  countdown: Sun,
  karteikarten: KartenIcon,
  lerntimer: Timer,
  fuerDich: Sparkle, // часть 50b
  wetter: CloudSun,
};
