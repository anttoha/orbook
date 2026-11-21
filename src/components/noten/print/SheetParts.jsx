import { cn } from "../../../shared/utils/cn";
import { badgeOf, gradeTone } from "../../../shared/utils/noten";
import { useT } from "../../../shared/hooks/useT";
import { PrintFoot, PrintHead } from "../../print/PrintBits";

// Мелкие детали листа «Noten» (макеты 37 a4-01…03). Только qr-* и print-* — бумага всегда светлая

// Цвет оценки на бумаге — те же правила, что у GradePill, но без тёмной темы
const TONES = { good: "bg-print-ok-tint text-print-ok", bad: "bg-print-danger-tint text-print-danger", mid: "bg-print-sand text-qr-ink", none: "bg-print-sand text-qr-ink/45" };

export const PaperGrade = ({ text, value, className }) => (
  <span className={cn("grid h-8 w-14 place-items-center rounded-thumb text-body font-black", TONES[gradeTone(value)], className)}>{text}</span>
);

// Квадратик предмета. На бумаге нейтральный: цвета предметов зависят от темы
export const PaperSubject = ({ code, name }) => (
  <span className="flex min-w-0 items-center gap-3">
    <span className="grid size-8 shrink-0 place-items-center rounded-thumb bg-print-sand text-small font-black">{badgeOf(code)}</span>
    {/* без truncate: при «Herunterladen» лист рисуется картинкой, и многоточие там ставится раньше времени */}
    <span className="min-w-0 text-body leading-tight font-extrabold break-words">{name}</span>
  </span>
);

// Плитки-итоги в ряд: { label, value, extra, danger }
export const PaperTiles = ({ items }) => (
  <div className={cn("grid gap-3", items.length === 4 ? "grid-cols-4" : items.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
    {items.map((item) => (
      <div key={item.label} className="rounded-box bg-print-sand px-4 py-3">
        <p className="text-small font-extrabold tracking-wide text-qr-ink/45 uppercase">{item.label}</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-panel">{item.value}</span>
          {item.extra && <span className={cn("text-label font-bold", item.danger ? "text-print-danger" : "text-qr-ink/60")}>{item.extra}</span>}
        </p>
      </div>
    ))}
  </div>
);

// Заголовок таблицы: подписи колонок
export const PaperColumns = ({ children, className }) => <div className={cn("flex items-end pb-3 text-hint font-extrabold text-qr-ink/45", className)}>{children}</div>;

// Рамка листа: шапка ORBook, крупный заголовок, строка «Stand», содержимое, подвал
export const Paper = ({ ref, className: klass, title, sub, stand, foot, children }) => {
  const t = useT();
  return (
    <article ref={ref} className="print-noten flex min-h-a4-noten w-a4w flex-col bg-white px-16 text-qr-ink">
      <PrintHead right={klass} />
      <h1 className="mt-6 text-lobby">
        {title}
        {sub && <span className="block text-qr-eye">{sub}</span>}
      </h1>
      {stand && <p className="mt-3 text-body text-qr-ink/60">{stand}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
      <div className="mt-6 break-inside-avoid">
        <PrintFoot lines={[foot, t("Erstellt am {date}", { date: new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) })].filter(Boolean)} />
      </div>
    </article>
  );
};
