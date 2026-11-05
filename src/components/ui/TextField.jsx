import { TriangleAlert } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// Поле вводу з підписом. Під полем одне з двох:
//   error — червоний текст і червона рамка; hint — сіра підказка.
// inputClassName доповнює вигляд самого поля.
// Решта пропсів (value, onChange, type …) іде прямо на <input>.
const TextField = ({ id, label, hint, error, className, inputClassName, ref, ...inputProps }) => {
  const messageId = `${id}-message`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-hint font-extrabold text-faint">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          "h-12.5 w-full rounded-field border bg-card px-4 text-input text-ink outline-none transition placeholder:text-faint2 read-only:opacity-60",
          error ? "border-danger focus:ring-2 focus:ring-danger/30" : "border-transparent focus:ring-2 focus:ring-accent/30",
          inputClassName, // наприклад, великий шрифт у полі коду
        )}
        {...inputProps}
      />
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
