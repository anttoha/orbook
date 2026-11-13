import { Link } from "react-router-dom";
import { ChevronRight, School } from "lucide-react";
import { useT } from "../../shared/hooks/useT";

// ─────────────────────────────────────────────────────────────
// Строка школы над её классами (макет 29d handy-20): значок, имя, сколько классов.
// Нажатие — страница школы (/klassen/schule/:id) с её классами и «Klasse hinzufügen»
// ─────────────────────────────────────────────────────────────
const SchoolHead = ({ school, count }) => {
  const t = useT();
  const body = (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sand text-muted">
        <School className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">
        <span className="text-row font-extrabold text-ink">{school?.name ?? t("Schule")}</span>
        <span className="text-label text-faint"> · {count} {t(count === 1 ? "Klasse" : "Klassen")}</span>
      </span>
    </>
  );
  if (!school?.id) return <div className="flex items-center gap-2.5 px-0.5">{body}</div>;
  return (
    <Link to={`/klassen/schule/${school.id}`} className="group flex items-center gap-2.5 rounded-field px-0.5 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
      {body}
      <ChevronRight className="size-4 shrink-0 text-faint2 transition-transform duration-150 ease-soft group-hover:translate-x-0.5" />
    </Link>
  );
};

export default SchoolHead;
