import { ChartNoAxesColumn, Ellipsis, List, Table2 } from "lucide-react";
import { FlagIcon } from "../../components/ui/icons";

export const navTabs = [
  { to: "/", label: "Woche", icon: Table2, end: true, mobile: true, activeOn: ["/woche", "/heute", "/tag"] },
  { to: "/woche", label: "Woche", icon: Table2, end: true, desktop: true, activeOn: ["/", "/tag"] },
  { to: "/heute", label: "Heute", icon: List, desktop: true },
  { to: "/testen", label: "Klausuren", icon: FlagIcon, mobile: true, desktop: true, },
  { to: "/statistik", label: "Statistik", icon: ChartNoAxesColumn, mobile: true, desktop: true },
  { to: "/mehr", label: "Mehr", icon: Ellipsis, mobile: true },
];