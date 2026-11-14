import { GlassButton } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { cn } from "../../shared/utils/cn";

// «Glas» (часть 30a): те же варианты кнопкой библиотеки — раздувается и тянется за пальцем
const GLASS = { primary: "filled", secondary: "glass", tint: "tinted", danger: "glass" };

const VARIANTS = { primary: "bg-accent text-on-accent", secondary: "bg-sand text-ink", tint: "bg-tint text-accent-ink", danger: "bg-danger-tint text-danger" };

// Кнопка для шторок: variant="primary" (фіолетова), "secondary" (світла), "tint" (сиреневая, «+ Test») или "danger" («Löschen»).
// З href стає посиланням такого самого вигляду (наприклад, завантажити файл)
const Button = ({ variant = "secondary", className, children, href, ...props }) => {
  const glass = useGlass();
  if (glass) {
    return (
      <GlassButton
        variant={GLASS[variant] ?? "glass"}
        tint={variant === "primary" || variant === "tint" ? "var(--color-accent)" : undefined}
        destructive={variant === "danger"}
        size="lg"
        href={href}
        className={cn("flex-1", className)}
        {...props} // onClick, disabled, type, aria-* …
      >
        {children}
      </GlassButton>
    );
  }
  const classes = cn(
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-row font-bold transition-opacity active:opacity-80 disabled:opacity-40",
    VARIANTS[variant],
    className, // можна доповнити ззовні
  );

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button" // за замовчуванням не надсилає форму
      className={classes}
      {...props} // onClick, disabled, aria-* тощо
    >
      {children}
    </button>
  );
};

export default Button;
