import { useLocation } from "react-router-dom";
import { groupIcon, SECTION_ICONS } from "../../components/navbar/navIcons";
import { usePlanStore } from "../store/planStore";
import { useUserStore } from "../store/userStore";
import { menuStyleOf, navOf, navTabActive, visibleNav } from "../utils/navLayout";

// ─────────────────────────────────────────────────────────────
// Пункты меню из «Untere Leiste» (часть 35) — для нижней панели (device "phone") и сайдбара ("pc").
// Возвращает { tabs, list, look }: tabs уже с иконками, выбранностью и числом у Tests;
// группа — { id, label, icon, items, active, current }. list — раскладка (нужна «Mehr»), look — вид меню группы
// ─────────────────────────────────────────────────────────────
export function useNavTabs(device) {
  const { pathname, search } = useLocation();
  const features = usePlanStore((s) => s.me?.features);
  const examCount = usePlanStore((s) => s.exams.length); // число у Tests (ближайшие Klausuren)
  const nav = useUserStore((s) => s.nav);
  const list = navOf(nav, device);

  const linkOf = (tab) => ({
    ...tab,
    label: tab.label,
    icon: SECTION_ICONS[tab.key],
    active: navTabActive(tab, pathname, search),
    count: tab.key === "tests" ? examCount : 0,
  });

  const tabs = visibleNav(list, features).map((entry) => {
    if (entry.type === "link") return linkOf(entry.tab);
    const items = entry.tabs.map(linkOf);
    const current = items.find((item) => item.active) ?? null;
    return { id: entry.id, label: entry.name, icon: groupIcon(entry.icon), items, active: Boolean(current), current };
  });

  return { tabs, list, look: menuStyleOf(nav) };
}
