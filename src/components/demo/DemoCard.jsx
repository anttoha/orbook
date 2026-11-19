import { useT } from "../../shared/hooks/useT";

// Карточка демо-кодов (часть 33, design/neu/33-demo-zugang): плашка «Demo» и строки с кодом
export const DemoCard = ({ className, children }) => {
  const t = useT();
  return (
    <div className={`rounded-card bg-card px-4 pt-4 pb-1.5 ${className ?? ""}`}>
      <p className="w-fit rounded-full bg-tint px-2.5 py-1 text-micro leading-none font-extrabold text-accent-ink uppercase">{t("Demo ·")} {t("ausgedachte Daten")}</p>
      <div className="mt-1 divide-y divide-hair">{children}</div>
    </div>
  );
};

// Строка: иконка, кто, код и кнопка «войти одним нажатием»
export const DemoRow = ({ icon: Icon, label, code, action, busy, onClick }) => (
  <div className="flex items-center gap-3 py-2.5">
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
      <Icon className="size-4.5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-row font-extrabold text-ink">{label}</p>
      <p className="truncate text-caption font-semibold text-faint">{code}</p>
    </div>
    <button type="button" onClick={onClick} disabled={busy} className="shrink-0 rounded-full bg-tint px-4 py-2 text-label font-extrabold text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-60">
      {action}
    </button>
  </div>
);
