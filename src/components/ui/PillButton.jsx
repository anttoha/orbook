import { Link, useNavigate } from "react-router-dom";
import { GlassButton } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { layoutOnly } from "../../shared/utils/glassLayout";

// ─────────────────────────────────────────────────────────────
// Кнопка-«таблетка» со своим видом (className) вне шторок: «+ Test», «Klasse hinzufügen», «Erneut versuchen» …
// Soft и Klar — ровно className, как раньше. «Glas» (часть 30a) — кнопка библиотеки liquid-glass:
// раздувается и тянется за пальцем. Из className туда идут только классы раскладки (ширина, отступы),
// цвет и высоту задаёт сама библиотека: glass — "filled" (залита акцентом) | "glass" | "tinted" (цветная подпись) | "destructive" (красная подпись).
// to — ссылка внутри приложения (в «Glas» через navigate: href перезагрузил бы страницу).
// ─────────────────────────────────────────────────────────────

const PillButton = ({ to, glass: kind = "glass", size = "md", className, children, reloadDocument, ...props }) => {
  const glass = useGlass();
  const navigate = useNavigate();

  if (glass) {
    const go = to ? () => (reloadDocument ? window.location.assign(typeof to === "string" ? to : "/") : navigate(to)) : props.onClick;
    return (
      <GlassButton {...props} variant={kind === "destructive" ? "glass" : kind} destructive={kind === "destructive"} tint="var(--color-accent)" size={size} className={layoutOnly(className)} onClick={go}>
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
