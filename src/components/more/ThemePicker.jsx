import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// Дві смужки-«текст» у мініатюрі теми
const Lines = ({ className }) => (
  <div className="flex flex-col gap-1.25 px-2.75 pt-5">
    <span className={cn("h-1.25 w-12/25 rounded-full", className)} />
    <span className={cn("h-1.25 w-8/25 rounded-full opacity-45", className)} />
  </div>
);

const THEMES = [
  { value: "light", label: "Hell", preview: <div className="h-full bg-preview-light"><Lines className="bg-preview-light-line" /></div> },
  { value: "dark", label: "Dunkel", preview: <div className="h-full bg-preview-dark"><Lines className="bg-preview-dark-line" /></div> },
  {
    value: "system",
    label: "System",
    preview: (
      <div className="flex h-full">
        <span className="flex-1 bg-preview-light" />
        <span className="flex-1 bg-preview-dark" />
      </div>
    ),
  },
];

// Вибір теми: три мініатюри (макет 24). Кольори мініатюр не змінюються разом із темою
const ThemePicker = ({ value, onChange }) => {
  const t = useT();
  return (
  <div role="group" aria-label={t("Thema")} className="grid grid-cols-3 gap-3">
    {THEMES.map((theme) => (
      <button key={theme.value} type="button" aria-pressed={theme.value === value} onClick={() => onChange(theme.value)}>
        <span className={cn("block h-14 overflow-hidden rounded-thumb border border-rule", theme.value === value && "ring-2 ring-accent ring-offset-3 ring-offset-paper")}>
          {theme.preview}
        </span>
        <span className="mt-2 block text-label font-bold text-ink">{t(theme.label)}</span>
      </button>
    ))}
  </div>
  );
};

export default ThemePicker;
