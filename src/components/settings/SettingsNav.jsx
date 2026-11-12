import { Info, Keyboard, UserPlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { settingsGroups, settingsSections } from "../../shared/constants/constants";
import { useSyncAllowed } from "../../shared/hooks/useNotesSync";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { isTeacher } from "../../shared/utils/examRules";
import { isTabActive } from "../../shared/utils/isTabActive";
import { sectionVisible } from "../../shared/utils/settings";
import NewBadge from "../changelog/NewBadge";
import LeaveClass from "../more/LeaveClass";

// Пункт меню: 40px заввишки, вибраний — фіолетова «пігулка» (макет 22)
const item = "flex h-10 items-center gap-3 rounded-full px-3 text-nav font-bold";
const idle = "text-muted hover:bg-sand hover:text-ink";

// Пункт-посилання на розділ
const SectionLink = ({ section, pathname }) => {
  const active = isTabActive(section, pathname);
  return (
    <li>
      <Link to={section.to} aria-current={active ? "page" : undefined} className={cn(item, active ? "bg-accent font-extrabold text-on-accent" : idle)}>
        <section.icon className="size-4 shrink-0" />
        {section.label}
        {section.badge === "news" && !active && <NewBadge />}
      </Link>
    </li>
  );
};

// Пункт-кнопка: відкриває вікно, а не сторінку («Klasse einladen», «Tastenkürzel»)
const SheetItem = ({ icon: Icon, label, onClick }) => (
  <li>
    <button type="button" onClick={onClick} className={cn(item, "w-full", idle)}>
      <Icon className="size-4 shrink-0" />
      {label}
    </button>
  </li>
);

// ─────────────────────────────────────────────────────────────
// Меню розділів «Mehr» на ПК: Übersicht, далі групи «Seiten» і «Einstellungen» (частина 22),
// під рискою «Klasse verlassen».
// ─────────────────────────────────────────────────────────────
const SettingsNav = () => {
  const { pathname } = useLocation();
  const syncAllowed = useSyncAllowed(); // школа могла вимкнути синхронізацію
  const me = usePlanStore((s) => s.me);
  const { openSheet } = useSheet();
  const visible = settingsSections.filter((section) => sectionVisible(section, { syncAllowed, teacher: isTeacher(me), features: me?.features }));

  return (
    <nav aria-label="Mehr" className="w-settings-nav shrink-0">
      <ul>
        {visible
          .filter((section) => !section.group)
          .map((section) => (
            <SectionLink key={section.to} section={section} pathname={pathname} />
          ))}
      </ul>

      {settingsGroups.map((group) => (
        <div key={group.key} className="mt-3">
          <h3 className="px-3 pb-1 text-micro font-extrabold tracking-badge text-faint uppercase">{group.title}</h3>
          <ul>
            {visible
              .filter((section) => section.group === group.key)
              .map((section) => (
                <SectionLink key={section.to} section={section} pathname={pathname} />
              ))}
            {/* вікна, а не сторінки: «Klasse einladen» (частина 16) і «Tastenkürzel» */}
            {group.key === "seiten" && (
              <>
                <SheetItem icon={UserPlus} label="Klasse einladen" onClick={() => openSheet("einladen")} />
                <SheetItem icon={Info} label="Kurz erklärt" onClick={() => openSheet("tipps")} />
                <SheetItem icon={Keyboard} label="Tastenkürzel" onClick={() => openSheet("tasten")} />
              </>
            )}
          </ul>
        </div>
      ))}

      <ul className="mt-2.5 border-t border-hair pt-3">
        <LeaveClass className={cn(item, "w-full text-danger hover:bg-danger-tint")} />
      </ul>
    </nav>
  );
};

export default SettingsNav;
