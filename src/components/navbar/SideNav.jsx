import { useState } from "react";
import { useHotkeys } from "../../shared/hooks/useHotkeys";
import { useNavTabs } from "../../shared/hooks/useNavTabs";
import { useScrollFade } from "../../shared/hooks/useScrollFade";
import { cn } from "../../shared/utils/cn";
import NavGroup from "./NavGroup";
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
  const [isHidden, setIsHidden] = useState(false); // чи згорнутий сайдбар
  const [scrollRef, scrollFade] = useScrollFade(); // края меню гаснут, если его можно прокрутить
  const { tabs } = useNavTabs("pc"); // пункти з «Untere Leiste» (частина 35): розділи і групи

  useHotkeys({ "mod+b": () => setIsHidden((prev) => !prev) }); // ⌘B / Ctrl+B — згорнути або розгорнути

  return (
    <aside
      className={cn(
        // sticky: сайдбар лишається на місці при прокручуванні; висота = екран − 2×16px
        "sticky top-4 my-4 hidden h-[calc(100dvh-2rem)] shrink-0 flex-col overflow-hidden rounded-panel bg-card px-3.5 pt-4 pb-3.5 lg:flex print:hidden",
        "transition-[width] duration-500 ease-soft motion-reduce:transition-none",
        isHidden ? "w-sidebar-mini" : "w-sidebar",
      )}
    >
      <SideNavHeader isHidden={isHidden} onChangeIsHidden={setIsHidden} />

      <div className="mt-4">
        <QuickSearch collapsed={isHidden} />
      </div>

      {/* Меню и «Bald» прокручиваются, если экран низкий (часто, когда группа раскрыта);
          шапка, поиск и низ (план, тема, Admin) остаются на месте. Края гаснут, если есть что прокрутить */}
      <div ref={scrollRef} className={cn("-mx-1 mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 no-scrollbar", scrollFade)}>
      <nav className="space-y-1">
        {tabs.map((tab, index) =>
          tab.items ? (
            <NavGroup key={tab.id} group={tab} index={index} isHidden={isHidden} />
          ) : (
            // index — підписи ховаються й з'являються по черзі; count — кількість найближчих Klausuren у Tests
            <NavigationLink key={tab.to} index={index} active={tab.active} tab={tab} isHidden={isHidden} badge={tab.count || null} flashKey={tab.key} />
          ),
        )}
      </nav>

      {/* «Bald» тільки в розгорнутому вигляді: не зникає одразу, а від'їжджає вліво і тане.
          Ширина фіксована (сайдбар мінус відступи), щоб текст не переносився, поки сайдбар звужується */}
      <div
        inert={isHidden}
        aria-hidden={isHidden}
        className={cn("w-51 transition-[opacity,translate] ease-soft motion-reduce:transition-none", isHidden ? "pointer-events-none -translate-x-6 opacity-0 duration-200" : "translate-x-0 opacity-100 delay-200 duration-500")}
      >
        <SoonList />
      </div>
      </div>

      <SideNavFooter collapsed={isHidden} />
    </aside>
  );
};

export default SideNav;
