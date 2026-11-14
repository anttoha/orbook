import { Link, useNavigate } from "react-router-dom";
import { GlassButton } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { cn } from "../../shared/utils/cn";

// Круглая кнопка с иконкой в шапках: «назад», «‹ ›» неделя и день, «+», месяц.
// to — ссылка внутри приложения (иначе onClick). children — иконка.
// «Glas» (часть 30a): кнопка библиотеки liquid-glass — раздувается и тянется за пальцем.
// Ссылка там — через navigate, а не href: href перезагрузил бы всю страницу
const BASE =
  "grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink transition-colors outline-none hover:bg-sand focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40";

const RoundButton = ({ to, onClick, className, children, ...props }) => {
  const glass = useGlass();
  const navigate = useNavigate();

  if (glass) {
    return (
      <GlassButton
        icon={children}
        size="sm"
        className={cn("shrink-0", className)}
        onClick={to ? () => navigate(to) : onClick}
        {...props} // aria-label, disabled, title
      />
    );
  }
  if (to) {
    return (
      <Link to={to} className={cn(BASE, className)} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cn(BASE, className)} {...props}>
      {children}
    </button>
  );
};

export default RoundButton;
