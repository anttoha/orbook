import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// Название каждого оформления; значения — DESIGNS в shared/utils/appearance.js
const DESIGNS = [
  { value: "soft", label: "Soft" },
  { value: "glas", label: "Glas" },
  { value: "klar", label: "Klar" },
];

// Три клетки урока в превью: фон и текст — токены предметов
const CELLS = [
  { code: "De", className: "bg-deutsch-tint text-deutsch-text" },
  { code: "Ma", className: "bg-mathe-tint text-mathe-text" },
  { code: "En", className: "bg-englisch-tint text-englisch-text" },
];

// Маленькое превью: атрибут data-design на самой плитке включает токены этого оформления только внутри неё —
// поэтому превью рисуется настоящими классами (bg-card, rounded-tile …), а не нарисованной картинкой
const Preview = ({ design, glassBg }) => (
  <span
    data-design={design}
    data-glass-bg={glassBg}
    className={cn("flex h-26 flex-col gap-2 overflow-hidden rounded-thumb border border-rule p-2.5", design === "glas" ? "glass-backdrop" : "bg-paper")}
  >
    <span className="grid grid-cols-3 gap-1">
      {CELLS.map((cell) => (
        <span key={cell.code} className={cn("rounded-chip px-1.5 py-1.5 text-left text-micro font-black", cell.className)}>
          {cell.code}
        </span>
      ))}
    </span>
    <span className="flex flex-1 flex-col justify-center gap-1 rounded-chip bg-card px-2">
      <span className="h-1.25 w-3/5 rounded-full bg-ink" />
      <span className="h-1 w-2/5 rounded-full bg-faint" />
    </span>
    <span className="h-4.5 w-1/2 rounded-full bg-accent" />
  </span>
);

// Выбор оформления (макет design/neu/30-personalisierung, handy-07)
const DesignPicker = ({ value, glassBg, onChange }) => {
  const t = useT();
  return (
    <div role="group" aria-label={t("Design")} className="grid grid-cols-3 gap-3">
      {DESIGNS.map((design) => (
        <button key={design.value} type="button" aria-pressed={design.value === value} onClick={() => onChange(design.value)} className="min-w-0">
          <span className={cn("block rounded-thumb", design.value === value && "ring-2 ring-accent ring-offset-3 ring-offset-paper")}>
            <Preview design={design.value} glassBg={glassBg} />
          </span>
          <span className="mt-2 block text-label font-bold text-ink">{t(design.label)}</span>
        </button>
      ))}
    </div>
  );
};

export default DesignPicker;
