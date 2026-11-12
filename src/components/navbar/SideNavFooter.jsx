import { Link, useLocation } from "react-router-dom";
import { Ellipsis, Keyboard, Moon, Sun } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { isDarkTheme, useTheme } from "../../shared/hooks/useTheme";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { standText } from "../../shared/utils/format";
import { isTabActive } from "../../shared/utils/isTabActive";
import NavigationLink from "./NavigationLink";

// Вкладка «Mehr» (частина 22: раніше «Einstellungen»): сторінки й налаштування; Statistik теж відкривається звідти
const settingsTab = { to: "/mehr", label: "Mehr", icon: Ellipsis, activeOn: ["/statistik"] };

// Текст стану плану (GET /api/plan/status):
//   «Plan aktuell · Stand 07:12» / «Plan veraltet · Stand von gestern 18:30» / «Plan noch nicht geladen»
const planText = (status, today) => {
  if (!status?.lastOkAt) return "Plan noch nicht geladen"; // сервер ще жодного разу не опитав школу
  const stand =
    status.lastOkAt.slice(0, 10) === today
      ? `Stand ${status.lastOkAt.slice(11, 16)}`
      : standText(status.lastOkAt, today);
  return `${status.stale ? "Plan veraltet" : "Plan aktuell"} · ${stand}`;
};

// ─────────────────────────────────────────────────────────────
// Низ сайдбара: «Mehr», стан плану, перемикач теми, «Admin».
// collapsed — сайдбар згорнутий: лишаємо тільки іконки
// ─────────────────────────────────────────────────────────────
const SideNavFooter = ({ collapsed }) => {
  const { pathname } = useLocation(); // для підсвічування «Mehr»
  const { theme, setTheme } = useTheme(); // світла / темна тема
  const { today } = useNow(); // сьогодні (для «Stand von gestern»)
  const status = usePlanStore((s) => s.status); // стан плану з сервера
  const refreshing = usePlanStore((s) => s.refreshing); // іде «Plan neu laden»

  const isDark = isDarkTheme(theme);
  const text = refreshing ? "Plan wird geladen…" : planText(status, today);

  return (
    <div className="mt-auto">
      <NavigationLink
        tab={settingsTab}
        active={isTabActive(settingsTab, pathname)}
        isHidden={collapsed}
      />

      <div className="mt-3 border-t border-hair pt-3">
        {/* стан плану: зелена крапка (актуальний) / червона (застарілий) + час.
            Текст не зникає, а тане й ховається за краєм — висота блоку та сама, нічого не стрибає */}
        <p
          className="flex items-center gap-2 overflow-hidden px-2 text-caption font-semibold whitespace-nowrap text-muted"
          title={text}
        >
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              refreshing
                ? "animate-pulse bg-faint"
                : status?.stale || !status?.lastOkAt
                  ? "bg-danger"
                  : "bg-ok",
            )}
          />
          <span
            aria-hidden={collapsed}
            className={cn(
              "truncate transition-opacity duration-300 ease-soft",
              collapsed ? "opacity-0" : "opacity-100 delay-150",
              status?.stale && "text-danger",
            )}
          >
            {text}
          </span>
        </p>

        {/* Один і той самий рядок у обох виглядах (раніше в згорнутому він перебудовувався в стовпчик і стрибав).
            Згортаємо плавно: невибрана тема і «Admin» стискаються до нуля, лишається кнопка поточної теми */}
        <div className="mt-2.5 flex items-center justify-between">
          {/* перемикач теми: ☀ / ☾ */}
          <div
            role="group"
            aria-label="Darstellung"
            className="relative flex shrink-0 rounded-full bg-sand p-0.75"
          >
            {/* фіолетова пігулка їде до вибраної теми; у згорнутому лишається тільки вона */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-0.75 left-0.75 h-6.5 w-7.5 rounded-full bg-accent transition-[translate] duration-500 ease-soft motion-reduce:transition-none",
                isDark && !collapsed && "translate-x-full",
              )}
            />
            {[
              { value: "light", icon: Sun, label: "Hell", on: !isDark },
              { value: "dark", icon: Moon, label: "Dunkel", on: isDark },
            ].map((option) => {
              const hidden = collapsed && !option.on; // згорнутий сайдбар: невибрана тема стискається
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-label={
                    collapsed ? (isDark ? "Hell" : "Dunkel") : option.label
                  }
                  aria-pressed={collapsed ? undefined : option.on}
                  tabIndex={hidden ? -1 : undefined}
                  data-no-press
                  // у згорнутому одна кнопка — вона перемикає тему туди-сюди
                  onClick={() =>
                    setTheme(
                      collapsed ? (isDark ? "light" : "dark") : option.value,
                    )
                  }
                  className={cn(
                    "relative grid h-6.5 place-items-center overflow-hidden rounded-full transition-[width,opacity,color] duration-500 ease-soft motion-reduce:transition-none",
                    hidden ? "w-0 opacity-0" : "w-7.5 opacity-100",
                    option.on ? "text-on-accent" : "text-faint hover:text-ink",
                  )}
                >
                  <option.icon className="size-3.5 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* «Admin»: у згорнутому стискається і тане */}
          <Link
            to="/admin"
            title="Admin"
            tabIndex={collapsed ? -1 : undefined}
            aria-hidden={collapsed}
            className={cn(
              "flex items-center gap-2 overflow-hidden rounded-full py-1 text-caption font-semibold whitespace-nowrap text-muted transition-[max-width,opacity,padding] duration-500 ease-soft hover:bg-sand hover:text-ink motion-reduce:transition-none",
              collapsed
                ? "pointer-events-none max-w-0 px-0 opacity-0"
                : "max-w-24 px-2 opacity-100",
            )}
          >
            <Keyboard className="size-4.5 shrink-0" />
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideNavFooter;
