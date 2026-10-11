import { cn } from "../../shared/utils/cn";

// Кнопка для шторок: variant="primary" (фіолетова) або "secondary" (світла)
const Button = ({ variant = "secondary", className, children, ...props }) => {
  return (
    <button
      type="button" // за замовчуванням не надсилає форму
      className={cn(
        "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-body font-extrabold transition-opacity active:opacity-80 disabled:opacity-40",
        variant === "primary" ? "bg-accent text-on-accent" : "bg-sand text-ink",
        className, // можна доповнити ззовні
      )}
      {...props} // onClick, disabled, aria-* тощо
    >
      {children}
    </button>
  );
};

export default Button;
