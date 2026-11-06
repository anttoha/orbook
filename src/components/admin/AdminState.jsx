import { RenewIcon, ShieldIcon, WarningIcon } from "../ui/icons";
import { Skeleton } from "../ui/PlanState";
import { cn } from "../../shared/utils/cn";

// Помилка завантаження: текст сервера і «Erneut versuchen» (кешу в адмінці немає)
export const AdminError = ({ error, onRetry }) => (
  <div className="flex flex-col items-center gap-3 rounded-card bg-card px-5 py-10 text-center">
    <WarningIcon className="size-7 text-danger" />
    <p className="text-body-sm font-semibold text-muted">{error?.message ?? "Konnte nicht laden."}</p>
    <button type="button" onClick={onRetry} className="flex h-10 items-center gap-2 rounded-full bg-sand px-4 text-label font-extrabold text-ink">
      <RenewIcon className="size-4" /> Erneut versuchen
    </button>
  </div>
);

// Порожній список: «Noch keine Editor-Codes»
export const AdminEmpty = ({ text, children }) => (
  <div className="flex flex-col items-center gap-3 rounded-card bg-card px-5 py-10 text-center">
    <p className="text-body-sm font-semibold text-muted">{text}</p>
    {children}
  </div>
);

// Сірі смужки замість списку, поки вантажимо
export const AdminSkeleton = ({ rows = 4, className }) => (
  <div className={cn("flex flex-col gap-2.5", className)}>
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} className="h-16 rounded-card" />
    ))}
  </div>
);

// Пісочна підказка зі щитом: «Keine echten Namen …», «Im Protokoll stehen keine IP-Adressen …»
export const AdminNote = ({ children, className }) => (
  <p className={cn("flex gap-2.5 rounded-card bg-sand px-3.5 py-3 text-label leading-5 text-muted", className)}>
    <ShieldIcon className="mt-0.5 size-4 shrink-0" />
    <span>{children}</span>
  </p>
);
