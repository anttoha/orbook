import { cn } from "../../shared/utils/cn";

const VARIANTS = { primary: "bg-accent text-on-accent", secondary: "bg-sand text-ink", danger: "bg-danger-tint text-danger" };

// Кнопка для шторок: variant="primary" (фіолетова), "secondary" (світла) або "danger" («Löschen»).
// З href стає посиланням такого самого вигляду (наприклад, завантажити файл)
const Button = ({ variant = "secondary", className, children, href, ...props }) => {
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
