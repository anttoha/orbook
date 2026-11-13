import { Link, useLocation } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { isTabActive } from "../../shared/utils/isTabActive";

// ─────────────────────────────────────────────────────────────
// Нижнє меню телефона (< 1024px): «пігулка» з іконками, у вибраного пункту ще й підпис.
// tabs — [{ to, label, short?, icon, exact? }]; short — коротший підпис («Codes» замість «Editor-Codes»).
// Спільне для застосунку класу (BottomNav) і адмінки (AdminShell).
// ─────────────────────────────────────────────────────────────
const TabBar = ({ tabs }) => {
  const { pathname } = useLocation();
  const t = useT();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-linear-to-t from-paper to-transparent pt-10 pb-5.5 lg:hidden print:hidden">
      <div className="px-4">
        <nav className="pointer-events-auto flex h-14.5 rounded-full border border-hair bg-card p-1.75">
          {tabs.map((tab) => {
            const active = isTabActive(tab, pathname);
            const label = t(tab.short ?? tab.label);

            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full min-w-0 basis-0 items-center justify-center rounded-full",
                  "transition-[flex-grow,background-color,color] duration-300 ease-out motion-reduce:transition-none",
                  active ? "grow-[1.4] bg-accent text-on-accent" : "grow text-faint",
                )}
              >
                <tab.icon className="size-5 shrink-0" />
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap text-label font-extrabold leading-none [text-box:trim-both_cap_alphabetic]",
                    "transition-all duration-300 ease-out motion-reduce:transition-none",
                    active ? "ml-1.5 max-w-24 opacity-100" : "ml-0 max-w-0 opacity-0",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TabBar;
