import { TriangleAlert } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// Поле вводу з підписом. Під полем одне з двох:
//   error — червоний текст і червона рамка; hint — сіра підказка.
// inputClassName доповнює вигляд самого поля.
// Решта пропсів (value, onChange, type …) іде прямо на <input>.
// multiline — багаторядкове поле (textarea), наприклад текст Hausaufgabe
// trailing — кнопка всередині поля праворуч (наприклад «око» в PasswordField)
// leading — іконка всередині поля ліворуч (наприклад скріпка в полі посилання)
const TextField = ({ id, label, hint, error, className, inputClassName, ref, multiline = false, leading, trailing, ...inputProps }) => {
  const messageId = `${id}-message`;
  const Input = multiline ? "textarea" : "input";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-hint font-extrabold text-faint">
        {label}
      </label>
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            multiline ? "min-h-29 resize-none py-3.5 leading-6" : "h-12.5",
            "w-full rounded-field border bg-card px-4 text-input text-ink outline-none transition placeholder:text-faint2 read-only:opacity-60",
            error ? "border-danger focus:ring-2 focus:ring-danger/30" : "border-transparent focus:ring-2 focus:ring-accent/30",
            trailing && "pr-12",
            leading && "pl-11",
            inputClassName, // наприклад, великий шрифт у полі коду
          )}
          {...inputProps}
        />
        {leading && <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-faint">{leading}</div>}
        {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={messageId} role="alert" className="mt-1.5 flex gap-1 text-hint leading-4.25 text-danger">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : (
        hint && (
          <p id={messageId} className="mt-1.5 text-caption text-faint">
            {hint}
          </p>
        )
      )}
    </div>
  );
};

export default TextField;
