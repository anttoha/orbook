import { Outlet, useLocation } from "react-router-dom";
import SettingsNav from "../components/settings/SettingsNav";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { SettingsPanelContext } from "../shared/hooks/useSettingsPanel";
import { usePlanStore } from "../shared/store/planStore";
import { cn } from "../shared/utils/cn";

const isOverview = (pathname) => pathname.replace(/\/$/, "") === "/mehr";

// ─────────────────────────────────────────────────────────────
// Оболонка всіх сторінок /mehr/* (макети 22–29).
// Телефон: сторінка як є (своя шапка з «назад»).
// ПК: загальний заголовок «Mehr», меню розділів зліва (групи «Seiten» і «Einstellungen»), вибраний розділ праворуч.
// ─────────────────────────────────────────────────────────────
const SettingsLayout = () => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const me = usePlanStore((s) => s.me);
  const { pathname } = useLocation();

  if (!isDesktop) return <Outlet />;

  const school = [me?.className, me?.schoolName].filter(Boolean).join(" · "); // обидва поля бувають порожні

  return (
    <section>
      <header className="space-y-1">
        <p className="min-h-4 text-hint font-extrabold text-faint">{school}</p>
        <h1 className="text-hero text-ink">Mehr</h1>
      </header>

      <div className="mt-5.5 flex items-start gap-11">
        <SettingsNav />
        {/* Розділи мають відступ 18px з боків (макети 23–29), плитки «Übersicht» — ні.
            Заголовок розділу виходить за відступ сам (PageHeader, -ml-4.5) */}
        <div className={cn("max-w-settings min-w-0 flex-1", !isOverview(pathname) && "px-4.5")}>
          <SettingsPanelContext value>
            {/* новий розділ — нова обгортка (key): він м'яко проявляється, як вкладка, а меню стоїть на місці */}
            <div key={pathname} className="motion-safe:animate-panel-in">
              <Outlet />
            </div>
          </SettingsPanelContext>
        </div>
      </div>
    </section>
  );
};

export default SettingsLayout;
