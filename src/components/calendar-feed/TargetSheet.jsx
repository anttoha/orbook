import { ChevronRight } from "lucide-react";
import Sheet from "../ui/Sheet";
import { TARGETS } from "./targets";
import { useT } from "../../shared/hooks/useT";

// Телефон: шторка «In welchen Kalender?» (макет handy-03). Ссылки — обычные <a>: так их открывает
// и браузер, и Android-App (внешние адреса — во внешнем браузере)
const TargetSheet = ({ open, onClose, links, onCopy }) => {
  const t = useT();
  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={t("Kalender-Abo")} title={t("In welchen Kalender?")}>
      <ul className="overflow-hidden rounded-card bg-card">
        {TARGETS.map((target) => (
          <li key={target.key} className="border-b border-hair last:border-0">
            <TargetRow target={target} href={target.key === "copy" ? null : links?.[target.key]} onClick={target.key === "copy" ? onCopy : onClose} />
          </li>
        ))}
      </ul>
    </Sheet>
  );
};

const TargetRow = ({ target, href, onClick }) => {
  const t = useT();
  const Icon = target.icon;
  const inner = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-row font-bold text-ink">{t(target.title)}</span>
        <span className="block truncate text-caption text-faint">{t(target.hint)}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden="true" />
    </>
  );
  const row = "flex min-h-17 w-full items-center gap-3.5 px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand";
  if (!href) {
    return (
      <button type="button" onClick={onClick} className={row}>
        {inner}
      </button>
    );
  }
  return (
    <a href={href} onClick={onClick} className={row} {...(target.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {inner}
    </a>
  );
};

export default TargetSheet;
