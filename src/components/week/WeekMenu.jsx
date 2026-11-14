import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Calendar, CalendarCheck, CalendarRange, Check, Layers, List, MoreVertical, Printer, RefreshCw, Share } from "lucide-react";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { GlassMenu } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { useT } from "../../shared/hooks/useT";
import Kbd from "../ui/Kbd";
import Switch from "../ui/Switch";
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
  const allCourses = useUserStore((s) => s.allCourses); // режим «Alle Kurse» (частина 22)
  const setAllCourses = useUserStore((s) => s.setAllCourses);
  const refreshPlan = usePlanStore((s) => s.refreshPlan); // «Plan neu laden» (POST /api/plan/refresh)
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // «Teilen» може бути вимкнене адміном

  const [open, setOpen] = useState(false); // чи відкрите меню

  // Підказка клавіші справа в пункті (тільки на ПК)
  const shortcut = (key) => isDesktop && <Kbd className="ml-auto">{key}</Kbd>;
  const glass = useGlass();
  const t = useT();

  // «Glas» (часть 30a): меню библиотеки — вырастает из кнопки «⋮» и складывается обратно.
  // Те же пункты; включённые «Wochenende» и «Alle Kurse» — с галочкой
  if (glass) {
    const icon = (Icon) => <Icon className="size-4.5" />;
    const items = [
      !isDesktop && { label: t("Woche wählen"), icon: icon(Calendar), onSelect: onPickWeek },
      { label: t("Zu heute springen"), icon: icon(CalendarCheck), onSelect: onToday },
      { label: t(isDesktop ? "Tagesansicht" : "Heute öffnen"), icon: icon(List), onSelect: () => navigate("/heute") },
      { label: t("Wochenende anzeigen"), icon: icon(CalendarRange), checked: showWeekend, onSelect: toggleWeekend },
      { label: t("Alle Kurse zeigen"), icon: icon(Layers), checked: allCourses, onSelect: () => setAllCourses(!allCourses) },
      { label: t("Plan neu laden"), icon: icon(RefreshCw), onSelect: refreshPlan },
      shareEnabled && { label: t("Woche teilen"), icon: icon(Share), onSelect: () => openSheet("teilen", { bereich: "woche", kw: monday }) },
      isDesktop && { label: t("Drucken"), icon: icon(Printer), onSelect: () => window.print() },
    ].filter(Boolean);
    return <GlassMenu icon={<MoreVertical className="size-4.25" />} aria-label={t("Weitere Optionen")} size="sm" width={250} items={items} />;
  }

  return (
    <DropdownMenu.Root onOpenChange={setOpen}>
      {/* затемнення під меню, як на макеті телефона (на ПК його немає) */}
      {open && <div aria-hidden="true" className="fixed inset-0 z-40 animate-fade-in bg-overlay lg:hidden" />}
      {/* кнопка «⋮»; asChild — використовуємо свою кнопку замість стандартної */}
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Weitere Optionen"
          className="relative flex size-9.5 items-center justify-center rounded-full bg-card outline-none data-[state=open]:bg-sand focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <MoreVertical className="size-4.25" />
          {/* фіолетова крапка: увімкнено «Alle Kurse» — видно, що це не лише мій план */}
          {allCourses && <span aria-hidden="true" className="absolute top-0 right-0 size-2.75 rounded-full border-2 border-paper bg-accent" />}
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

          {/* «Alle Kurse zeigen»: весь план класу, чужі курси пунктиром. «Meine Kurse» не змінюється */}
          <DropdownMenu.Separator className={menuSeparatorClass} />
          <DropdownMenu.CheckboxItem className={menuItemClass} checked={allCourses} onCheckedChange={setAllCourses}>
            <Layers className={menuIconClass} /> Alle Kurse zeigen
            <Switch checked={allCourses} className="ml-auto" />
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

        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default WeekMenu;
