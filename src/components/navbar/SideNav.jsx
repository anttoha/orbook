import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useHotkeys } from "../../shared/hooks/useHotkeys";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { isTabActive, isTabEnabled } from "../../shared/utils/isTabActive";
import { navTabs } from "../../shared/constants/constants";
import NavigationLink from "./NavigationLink";
import QuickSearch from "./QuickSearch";
import SideNavFooter from "./SideNavFooter";
import SideNavHeader from "./SideNavHeader";
import SoonList from "./SoonList";

// ─────────────────────────────────────────────────────────────
// Сайдбар на комп'ютері (≥ 1024px), як на макеті:
//   логотип + клас · пошук ⌘K · меню (у «Testen» лічильник) · «Bald»
//   · «Einstellungen» · стан плану · тема · «Admin»
// Згортається кнопкою в шапці до 71px (тільки іконки).
// ─────────────────────────────────────────────────────────────
const SideNav = () => {
  const { pathname } = useLocation(); // поточна адреса — для підсвічування пунктів
  const [isHidden, setIsHidden] = useState(false); // чи згорнутий сайдбар
  const examCount = usePlanStore((s) => s.exams.length); // лічильник у «Testen» (найближчі Klausuren)
  const features = usePlanStore((s) => s.me?.features); // вимкнені школою розділи не показуємо

  useHotkeys({ "mod+b": () => setIsHidden((prev) => !prev) }); // ⌘B / Ctrl+B — згорнути або розгорнути

  return (
    <aside
      className={cn(
        // sticky: сайдбар лишається на місці при прокручуванні; висота = екран − 2×16px
        "sticky top-4 my-4 hidden h-[calc(100dvh-2rem)] shrink-0 flex-col overflow-hidden rounded-panel bg-card px-3.5 pt-4 pb-3.5 lg:flex print:hidden",
        "transition-[width] duration-300 ease-out",
        isHidden ? "w-sidebar-mini" : "w-sidebar",
      )}
    >
      <SideNavHeader isHidden={isHidden} onChangeIsHidden={setIsHidden} />

      <div className="mt-4">
        <QuickSearch collapsed={isHidden} onExpand={() => setIsHidden(false)} />
      </div>

      <nav className="mt-5 space-y-1">
        {navTabs
          .filter((t) => t.desktop && isTabEnabled(t, features))
          .map((tab) => (
            <NavigationLink
              key={tab.to}
              active={isTabActive(tab, pathname)}
              tab={tab}
              isHidden={isHidden}
              badge={tab.to === "/testen" ? examCount : null} // кількість найближчих Klausuren
            />
          ))}
      </nav>

      {/* «Bald» тільки в розгорнутому вигляді */}
      {!isHidden && <SoonList />}

      <SideNavFooter collapsed={isHidden} />
    </aside>
  );
};

export default SideNav;
