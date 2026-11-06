import { Keyboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { settingsSections } from "../../shared/constants/constants";
import { useSyncAllowed } from "../../shared/hooks/useNotesSync";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { isTeacher } from "../../shared/utils/examRules";
import { isTabActive } from "../../shared/utils/isTabActive";
import { sectionVisible } from "../../shared/utils/settings";
import LeaveClass from "../more/LeaveClass";

// Пункт меню: 40px заввишки, вибраний — фіолетова «пігулка» (макет 22)
const item = "flex h-10 items-center gap-3 rounded-full px-3 text-nav font-bold";

// ─────────────────────────────────────────────────────────────
// Меню розділів «Einstellungen» на ПК: Übersicht … Datenschutz, під рискою «Klasse verlassen».
// ─────────────────────────────────────────────────────────────
const SettingsNav = () => {
  const { pathname } = useLocation();
  const syncAllowed = useSyncAllowed(); // школа могла вимкнути синхронізацію
  const teacher = usePlanStore((s) => isTeacher(s.me));
  const { openSheet } = useSheet();

  return (
    <nav aria-label="Einstellungen" className="w-settings-nav shrink-0">
      <ul>
        {settingsSections
          .filter((section) => sectionVisible(section, { syncAllowed, teacher }))
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
        {/* «Tastenkürzel» — не сторінка, а вікно (як плитка в «Übersicht»); власник попросив пункт і в меню */}
        <li>
          <button type="button" onClick={() => openSheet("tasten")} className={cn(item, "w-full text-muted hover:bg-sand hover:text-ink")}>
            <Keyboard className="size-4 shrink-0" />
            Tastenkürzel
          </button>
        </li>
      </ul>

      <ul className="mt-2.5 border-t border-hair pt-3">
        <LeaveClass className={cn(item, "w-full text-danger hover:bg-danger-tint")} />
      </ul>
    </nav>
  );
};

export default SettingsNav;
