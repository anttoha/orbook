import { Link, useLocation } from "react-router-dom";
import { settingsSections } from "../../shared/constants/constants";
import { useSyncAllowed } from "../../shared/hooks/useNotesSync";
import { cn } from "../../shared/utils/cn";
import { isTabActive } from "../../shared/utils/isTabActive";
import LeaveClass from "../more/LeaveClass";

// Пункт меню: 40px заввишки, вибраний — фіолетова «пігулка» (макет 22)
const item = "flex h-10 items-center gap-3 rounded-full px-3 text-nav font-bold";

// ─────────────────────────────────────────────────────────────
// Меню розділів «Einstellungen» на ПК: Übersicht … Datenschutz, під рискою «Klasse verlassen».
// ─────────────────────────────────────────────────────────────
const SettingsNav = () => {
  const { pathname } = useLocation();
  const syncAllowed = useSyncAllowed(); // школа могла вимкнути синхронізацію

  return (
    <nav aria-label="Einstellungen" className="w-settings-nav shrink-0">
      <ul>
        {settingsSections
          .filter((section) => !section.sync || syncAllowed)
          .map((section) => {
            const active = isTabActive(section, pathname);
            return (
              <li key={section.to}>
                <Link
                  to={section.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(item, active ? "bg-accent font-extrabold text-on-accent" : "text-muted hover:bg-sand hover:text-ink")}
                >
                  <section.icon className="size-4 shrink-0" />
                  {section.label}
                </Link>
              </li>
            );
          })}
      </ul>

      <ul className="mt-2.5 border-t border-hair pt-3">
        <LeaveClass className={cn(item, "w-full text-danger hover:bg-danger-tint")} />
      </ul>
    </nav>
  );
};

export default SettingsNav;
