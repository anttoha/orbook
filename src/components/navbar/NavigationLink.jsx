import { Link, useNavigate } from "react-router-dom";
import { GlassButton } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Пункт меню сайдбара: іконка + підпис (+ лічильник праворуч).
// isHidden — сайдбар згорнутий: підпис прозорий, видно тільки іконку
// badge — число праворуч (наприклад, 5 у «Testen»); null — без лічильника
// index — номер пункту: підписи від'їжджають і повертаються по черзі (сходинкою), а не всі разом
// ─────────────────────────────────────────────────────────────
const NavigationLink = ({ active, tab, isHidden = false, badge = null, index = 0, className = "", iconClassName = "", textClassName = "" }) => {
  const t = useT();
  const glass = useGlass();
  const navigate = useNavigate();

  // «Glas» (часть 30a): пункт — кнопка библиотеки; выбранный залит акцентом. Свёрнутая панель — только иконка
  if (glass) {
    return (
      <GlassButton
        variant={active ? "filled" : "clear"}
        tint={active ? "var(--color-accent)" : undefined}
        icon={<tab.icon className="size-5" />}
        aria-current={active ? "page" : undefined}
        aria-label={isHidden ? t(tab.label) : undefined}
        title={isHidden ? t(tab.label) : undefined}
        onClick={() => navigate(tab.to)}
        className={cn(isHidden ? "" : "orb-start w-full", className)}
      >
        {isHidden ? undefined : (
          <>
            {t(tab.label)}
            {badge > 0 && <span className="text-caption font-extrabold opacity-70">{badge}</span>}
          </>
        )}
      </GlassButton>
    );
  }

  return (
    <Link
      to={tab.to}
      aria-current={active ? "page" : undefined}
      title={isHidden ? t(tab.label) : undefined} // підказка в згорнутому вигляді
      className={cn(
        "flex h-10.5 items-center gap-3 overflow-hidden rounded-full px-3 text-body font-semibold transition-colors",
        active ? "bg-accent font-bold text-on-accent" : "text-ink/80 hover:bg-sand",
        className,
      )}
    >
      <tab.icon className={cn("size-5 shrink-0", iconClassName)} />
      <span
        className={cn(
          "flex-1 whitespace-nowrap transition-[opacity,translate] ease-soft motion-reduce:transition-none",
          isHidden ? "-translate-x-3 opacity-0 duration-200" : "translate-x-0 opacity-100 duration-500",
          textClassName,
        )}
        style={{ transitionDelay: `${isHidden ? index * 25 : 150 + index * 45}ms` }}
      >
        {t(tab.label)}
      </span>
      {/* лічильник */}
      {badge > 0 && !isHidden && (
        <span
          className={cn(
            "grid h-5 min-w-5.5 place-items-center rounded-full px-1.5 text-caption font-extrabold",
            active ? "bg-on-accent/20 text-on-accent" : "bg-sand text-muted",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

export default NavigationLink;
