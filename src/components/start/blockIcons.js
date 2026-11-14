import { CalendarDays, Clock, File, Folder, List, ListChecks, RefreshCw, Sun, Table2 } from "lucide-react";
import { FlagIcon, StatsIcon } from "../ui/icons";

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
  countdown: Sun,
};
