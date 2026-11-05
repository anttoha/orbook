import { Ellipsis, List, Table2 } from "lucide-react";
import { FlagIcon, StatsIcon } from "../../components/ui/icons";

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