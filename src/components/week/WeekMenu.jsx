import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Calendar, CalendarCheck, CalendarRange, Check, Eye, List, MoreVertical, Printer, RefreshCw, Share } from "lucide-react";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import Kbd from "../ui/Kbd";
import { menuContentClass, menuIconClass, menuItemClass, menuSeparatorClass } from "../ui/menuStyles";

// ─────────────────────────────────────────────────────────────
// Меню «⋮» у тижня.
//   Телефон: Woche wählen, Zu heute springen, Heute öffnen, Wochenende, Plan neu laden, Woche teilen
//   ПК: Zu heute springen T, Tagesansicht D, Wochenende, Plan neu laden R, Woche teilen, Drucken ⌘P
//   (самі клавіші T / D / R працюють на сторінці тижня — див. useHotkeys у Week.jsx)
// monday — показаний тиждень ("2026-10-05"), onToday — перейти на поточний тиждень,
// onPickWeek — відкрити календар «Woche wählen» (тільки телефон)
// ─────────────────────────────────────────────────────────────
const WeekMenu = ({ monday, onToday, onPickWeek }) => {
  const navigate = useNavigate(); // перехід на іншу сторінку
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // ПК чи телефон
  const { openSheet } = useSheet(); // відкрити шторку
  const showWeekend = useUserStore((s) => s.showWeekend); // вихідні показано?
  const toggleWeekend = useUserStore((s) => s.toggleWeekend); // перемкнути вихідні
  const hasPicked = useUserStore((s) => s.picked.length > 0); // чи є приховані курси
  const showAllCourses = useUserStore((s) => s.showAllCourses); // показати всі курси
  const refreshPlan = usePlanStore((s) => s.refreshPlan); // «Plan neu laden» (POST /api/plan/refresh)
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // «Teilen» може бути вимкнене адміном

  // Підказка клавіші справа в пункті (тільки на ПК)
  const shortcut = (key) => isDesktop && <Kbd className="ml-auto">{key}</Kbd>;

  return (
    <DropdownMenu.Root>
      {/* кнопка «⋮»; asChild — використовуємо свою кнопку замість стандартної */}
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Weitere Optionen"
          className="flex size-9.5 items-center justify-center rounded-full bg-card outline-none data-[state=open]:bg-sand focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <MoreVertical className="size-4.25" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        {/* align="end" — меню вирівнюється по правому краю кнопки */}
        <DropdownMenu.Content align="end" sideOffset={8} className={menuContentClass}>
          {/* на ПК календар — окрема кнопка 📅 у шапці, в меню він не потрібен */}
          {!isDesktop && (
            <DropdownMenu.Item className={menuItemClass} onSelect={onPickWeek}>
              <Calendar className={menuIconClass} /> Woche wählen
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item className={menuItemClass} onSelect={onToday}>
            <CalendarCheck className={menuIconClass} /> Zu heute springen {shortcut("T")}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={menuItemClass} onSelect={() => navigate("/heute")}>
            <List className={menuIconClass} /> {isDesktop ? "Tagesansicht" : "Heute öffnen"} {shortcut("D")}
          </DropdownMenu.Item>

          {/* пункт-галочка: сам показує, чи увімкнено */}
          <DropdownMenu.CheckboxItem className={menuItemClass} checked={showWeekend} onCheckedChange={toggleWeekend}>
            <CalendarRange className={menuIconClass} /> Wochenende anzeigen
            <DropdownMenu.ItemIndicator className="ml-auto text-accent">
              <Check className="size-4" strokeWidth={3} />
            </DropdownMenu.ItemIndicator>
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.Separator className={menuSeparatorClass} />

          <DropdownMenu.Item className={menuItemClass} onSelect={refreshPlan}>
            <RefreshCw className={menuIconClass} /> Plan neu laden {shortcut("R")}
          </DropdownMenu.Item>
          {shareEnabled && (
            <DropdownMenu.Item className={menuItemClass} onSelect={() => openSheet("teilen", { bereich: "woche", kw: monday })}>
              <Share className={menuIconClass} /> Woche teilen
            </DropdownMenu.Item>
          )}
          {/* «Drucken» — системний друк браузера (тільки ПК) */}
          {isDesktop && (
            <DropdownMenu.Item className={menuItemClass} onSelect={() => window.print()}>
              <Printer className={menuIconClass} /> Drucken {shortcut("⌘P")}
            </DropdownMenu.Item>
          )}

          {/* тільки якщо якісь курси приховані */}
          {hasPicked && (
            <>
              <DropdownMenu.Separator className={menuSeparatorClass} />
              <DropdownMenu.Item className={menuItemClass} onSelect={showAllCourses}>
                <Eye className={menuIconClass} /> Alle Kurse zeigen
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default WeekMenu;
