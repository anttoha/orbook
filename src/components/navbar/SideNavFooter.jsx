import { Link, useLocation } from "react-router-dom";
import { Keyboard, Moon, Settings, Sun } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useTheme } from "../../shared/hooks/useTheme";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { standText } from "../../shared/utils/format";
import { isTabActive } from "../../shared/utils/isTabActive";
import NavigationLink from "./NavigationLink";

// Вкладка «Einstellungen» — веде на «Mehr» (там налаштування)
const settingsTab = { to: "/mehr", label: "Einstellungen", icon: Settings };

// Текст стану плану (GET /api/plan/status):
//   «Plan aktuell · Stand 07:12» / «Plan veraltet · Stand von gestern 18:30» / «Plan noch nicht geladen»
const planText = (status, today) => {
  if (!status?.lastOkAt) return "Plan noch nicht geladen"; // сервер ще жодного разу не опитав школу
  const stand = status.lastOkAt.slice(0, 10) === today ? `Stand ${status.lastOkAt.slice(11, 16)}` : standText(status.lastOkAt, today);
  return `${status.stale ? "Plan veraltet" : "Plan aktuell"} · ${stand}`;
};

// ─────────────────────────────────────────────────────────────
// Низ сайдбара: «Einstellungen», стан плану, перемикач теми, «Admin».
// collapsed — сайдбар згорнутий: лишаємо тільки іконки
// ─────────────────────────────────────────────────────────────
const SideNavFooter = ({ collapsed }) => {
  const { pathname } = useLocation(); // для підсвічування «Einstellungen»
  const { theme, setTheme } = useTheme(); // світла / темна тема
  const { today } = useNow(); // сьогодні (для «Stand von gestern»)
  const status = usePlanStore((s) => s.status); // стан плану з сервера
  const refreshing = usePlanStore((s) => s.refreshing); // іде «Plan neu laden»

  // Тема зараз темна? («system» — дивимось на налаштування системи)
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const text = refreshing ? "Plan wird geladen…" : planText(status, today);

  return (
    <div className="mt-auto">
      <NavigationLink tab={settingsTab} active={isTabActive(settingsTab, pathname)} isHidden={collapsed} />

      <div className="mt-3 border-t border-hair pt-3">
        {/* стан плану: зелена крапка (актуальний) / червона (застарілий) + час */}
        <p className="flex items-center gap-2 px-2 text-caption font-semibold whitespace-nowrap text-muted" title={text}>
          <span className={cn("size-2 shrink-0 rounded-full", refreshing ? "animate-pulse bg-faint" : status?.stale || !status?.lastOkAt ? "bg-danger" : "bg-ok")} />
          {!collapsed && <span className={cn("truncate", status?.stale && "text-danger")}>{text}</span>}
        </p>

        <div className={cn("mt-2.5 flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
          {/* перемикач теми: ☀ / ☾ */}
          <div role="group" aria-label="Darstellung" className={cn("flex rounded-full bg-sand p-0.75", collapsed && "flex-col")}>
            {[
              { value: "light", icon: Sun, label: "Hell", on: !isDark },
              { value: "dark", icon: Moon, label: "Dunkel", on: isDark },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                aria-pressed={option.on}
                onClick={() => setTheme(option.value)}
                className={cn("grid h-6.5 w-7.5 place-items-center rounded-full transition-colors", option.on ? "bg-accent text-on-accent" : "text-faint hover:text-ink")}
              >
                <option.icon className="size-3.5" />
              </button>
            ))}
          </div>

          {/* «Admin» */}
          <Link to="/admin" title="Admin" className="flex items-center gap-2 rounded-full px-2 py-1 text-caption font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
            <Keyboard className="size-4.5" />
            {!collapsed && "Admin"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideNavFooter;
