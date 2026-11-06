import { useLocation } from "react-router-dom";
import { isFullScreenPage, isTabEnabled } from "../../shared/utils/isTabActive";
import { navTabs } from "../../shared/constants/constants";
import { usePlanStore } from "../../shared/store/planStore";
import TabBar from "./TabBar";

// Нижнє меню застосунку класу: пункти для телефона, без вимкнених школою розділів
const BottomNav = () => {
  const { pathname } = useLocation();
  const features = usePlanStore((s) => s.me?.features); // вимкнені школою розділи не показуємо
  if (isFullScreenPage(pathname)) return null; // форма на весь екран: унизу її кнопки

  return <TabBar tabs={navTabs.filter((t) => t.mobile && isTabEnabled(t, features))} />;
};

export default BottomNav;
