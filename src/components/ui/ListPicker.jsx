import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { cn } from "../../shared/utils/cn";
import { summaryText } from "../../shared/utils/picker";
import Button from "./Button";
import PickerList, { PickerBadge } from "./PickerList";
import Sheet from "./Sheet";

// Що показує саме поле: вибраний пункт (кружечок, назва, підпис), кілька — «Mathe, Deutsch +2», нічого — placeholder
const FieldFace = ({ items, values, placeholder }) => {
  const first = items.find((item) => item.value === values[0]);
  if (!values.length) return <span className="min-w-0 flex-1 truncate text-input text-faint2">{placeholder}</span>;
  return (
    <>
      <PickerBadge code={first?.code ?? values[0]} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-extrabold text-ink">{values.length > 1 ? summaryText(items, values) : (first?.title ?? values[0])}</span>
        {values.length === 1 && first?.subtitle && <span className="block truncate text-hint text-faint">{first.subtitle}</span>}
      </span>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Вибір предмета або курсу (design/neu/19c-kurs-auswahl): одне поле → список із пошуком.
// Замість «стіни» чипів: телефон — шторка знизу, ПК — випадне вікно під полем (як пошук ⌘K).
// Якщо поле вже стоїть у шторці (урок Muster, нотатка, фільтр) — на телефоні список розгортається на місці.
//
// Пропси:
//   id, label     — для скрінрідера (видимий підпис дає Field навколо)
//   items         — пункти (shared/utils/picker.js: courseItems, subjectItems)
//   value         — value вибраного (або null); multiple — масив
//   onChange      — новий value (multiple — новий масив)
//   multiple      — кілька (фільтр «Fächer»): клік вмикає/вимикає, список не закривається
//   clearable     — можна зняти вибір (необов'язкове поле): рядок «Ohne Fach» / «Alle Fächer»
//   inline        — поле вже в шторці: на телефоні розгортати на місці
//   title         — заголовок шторки на телефоні, error — червона рамка
// ─────────────────────────────────────────────────────────────
const ListPicker = ({ id, label, items, value, onChange, multiple = false, clearable = false, clearLabel = "Ohne Fach", inline = false, title = "Fach wählen", placeholder = "Fach wählen", error = false, className }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [open, setOpen] = useState(false);
  const values = multiple ? (value ?? []) : value ? [value] : [];

  const choose = (next) => {
    if (multiple) return onChange(values.includes(next) ? values.filter((v) => v !== next) : [...values, next]);
    onChange(clearable && next === value ? null : next); // у необов'язковому повторний клік знімає
    setOpen(false);
  };
  const clear = () => {
    onChange(multiple ? [] : null);
    if (!multiple) setOpen(false);
  };

  const trigger = (
    <button
      id={id}
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-field border-2 bg-card px-3.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        open ? "border-accent" : error ? "border-danger" : "border-transparent",
        className,
      )}
    >
      <FieldFace items={items} values={values} placeholder={placeholder} />
      <ChevronDown className={cn("size-4.5 shrink-0 text-faint transition-transform", open && "rotate-180")} />
    </button>
  );
  const clearRow = (clearable || multiple) && values.length > 0 && (
    <button type="button" onClick={clear} className="self-start px-2.5 pb-1 text-label font-bold text-accent-ink">
      {multiple ? "Alle Fächer" : clearLabel}
    </button>
  );
  const list = (props) => <PickerList items={items} selected={values} onChoose={choose} {...props} />;

  // ПК: випадне вікно під полем, такої ж ширини (але не вужче за 360px)
  if (isDesktop) {
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            collisionPadding={16}
            className="z-50 flex max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) min-w-popover flex-col gap-1 rounded-card bg-card p-3 shadow-sheet outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
          >
            {clearRow}
            {list({ autoFocus: true, keys: true, className: "max-h-100" })}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  // Телефон у шторці: список розгортається під полем
  if (inline) {
    return (
      <div className="flex flex-col gap-2">
        {trigger}
        {open && (
          <div className="flex flex-col gap-1 rounded-card bg-sand p-2">
            {clearRow}
            {list({ className: "max-h-80" })}
            {multiple && (
              <Button variant="primary" onClick={() => setOpen(false)} className="mt-1">
                Fertig
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Телефон на сторінці: шторка знизу
  return (
    <>
      {trigger}
      <Sheet open={open} onClose={() => setOpen(false)} title={title} footer={multiple && <Button variant="primary" onClick={() => setOpen(false)} className="flex-1">Fertig</Button>}>
        {clearRow}
        {list({})}
      </Sheet>
    </>
  );
};

export default ListPicker;
