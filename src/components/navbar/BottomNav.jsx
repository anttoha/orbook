import { useLocation } from "react-router-dom";
import { Ellipsis } from "lucide-react";
import { useNavTabs } from "../../shared/hooks/useNavTabs";
import { usePlanStore } from "../../shared/store/planStore";
import { translate } from "../../shared/i18n/translate";
import { isFullScreenPage, isTabActive } from "../../shared/utils/isTabActive";
import { restPaths } from "../../shared/utils/navLayout";
import TabBar from "./TabBar";

// Нижнє меню застосунку класу: вкладки з «Untere Leiste» (частина 35) і завжди останнім «Mehr».
// «Mehr» світиться й на розділах, яких немає внизу (вони відкриваються з «Mehr»)
const BottomNav = () => {
  const { pathname } = useLocation();
  const features = usePlanStore((s) => s.me?.features);
  const { tabs, list, look } = useNavTabs("phone");
  if (isFullScreenPage(pathname)) return null; // форма на весь екран: унизу її кнопки

  const mehr = { to: "/mehr", label: translate("Mehr"), icon: Ellipsis, activeOn: restPaths(list, features) };
  return <TabBar tabs={[...tabs, { ...mehr, active: isTabActive(mehr, pathname) }]} look={look} />;
};

export default BottomNav;
