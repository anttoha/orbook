import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { menuContentClass } from "./menuStyles";

// Як виглядає кнопка: "pill" — маленька «пігулка» в рядку налаштувань (макет handy-12),
// "field" — на всю ширину, як текстове поле форми
const TRIGGERS = {
  pill: "h-8.5 gap-1.5 rounded-full border bg-card pr-2.5 pl-3 text-label font-extrabold",
  field: "h-12.5 w-full justify-between rounded-field border bg-card px-4 text-input",
};

// ─────────────────────────────────────────────────────────────
// Свій випадний список замість системного <select> (той на ПК виглядає як у Windows 98).
// Radix DropdownMenu дає клавіатуру (стрілки, Enter, Esc), фокус і доступність.
// options — [{ value, label }]; значення може бути числом — повертаємо того самого типу
// ─────────────────────────────────────────────────────────────
const Select = ({ value, options, onChange, label, variant = "pill", invalid = false, disabled = false, className }) => {
  const current = options.find((option) => String(option.value) === String(value ?? ""));

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label={label}
        aria-invalid={invalid}
        disabled={disabled}
        className={cn(
          "group inline-flex shrink-0 cursor-pointer items-center text-ink outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default disabled:opacity-50 data-[state=open]:border-accent",
          TRIGGERS[variant],
          invalid ? "border-danger" : variant === "pill" ? "border-rule" : "border-transparent",
          className,
        )}
      >
        <span className="truncate">{current?.label ?? "—"}</span>
        {/* стрілка повертається, поки список відкритий */}
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className={cn(menuContentClass, "max-h-(--radix-dropdown-menu-content-available-height) min-w-(--radix-dropdown-menu-trigger-width) overflow-y-auto")}
        >
          <DropdownMenu.RadioGroup value={String(value ?? "")} onValueChange={(next) => onChange(options.find((option) => String(option.value) === next)?.value)}>
            {options.map((option) => (
              <DropdownMenu.RadioItem
                key={String(option.value)}
                value={String(option.value)}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-tile px-3 py-2.5 text-body-sm text-ink outline-none select-none data-highlighted:bg-sand data-[state=checked]:bg-tint data-[state=checked]:font-extrabold data-[state=checked]:text-accent-ink"
              >
                {option.label}
                <DropdownMenu.ItemIndicator>
                  <Check className="size-4" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default Select;
