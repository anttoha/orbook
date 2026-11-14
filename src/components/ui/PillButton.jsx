import { Link, useNavigate } from "react-router-dom";
import { GlassButton } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";

// ─────────────────────────────────────────────────────────────
// Кнопка-«таблетка» со своим видом (className) вне шторок: «+ Test», «Klasse hinzufügen», «Erneut versuchen» …
// Soft и Klar — ровно className, как раньше. «Glas» (часть 30a) — кнопка библиотеки liquid-glass:
// раздувается и тянется за пальцем. Из className туда идут только классы раскладки (ширина, отступы),
// цвет и высоту задаёт сама библиотека: glass — "filled" (залита акцентом) | "glass" | "tinted" (цветная подпись).
// to — ссылка внутри приложения (в «Glas» через navigate: href перезагрузил бы страницу).
// ─────────────────────────────────────────────────────────────
const LAYOUT = /^((sm|md|lg|desktop):)?(w-|min-w-|max-w-|flex-|basis-|grow|shrink|self-|order-|col-|row-|m[trblxy]?-|-m[trblxy]?-|hidden$|block$|absolute$|relative$|top-|right-|bottom-|left-|inset-|z-)/;
const layoutOnly = (className = "") => className.split(/\s+/).filter((name) => LAYOUT.test(name)).join(" ");

const PillButton = ({ to, glass: kind = "glass", size = "md", className, children, reloadDocument, ...props }) => {
  const glass = useGlass();
  const navigate = useNavigate();

  if (glass) {
    const go = to ? () => (reloadDocument ? window.location.assign(typeof to === "string" ? to : "/") : navigate(to)) : props.onClick;
    return (
      <GlassButton {...props} variant={kind} tint="var(--color-accent)" size={size} className={layoutOnly(className)} onClick={go}>
        {children}
      </GlassButton>
    );
  }
  if (to) {
    return (
      <Link to={to} reloadDocument={reloadDocument} className={className} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  );
};

export default PillButton;
