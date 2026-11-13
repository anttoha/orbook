import { schoolLine, schoolStatus } from "../../../shared/utils/adminClasses";
import Badge from "../../ui/Badge";
import { SchoolIcon } from "../../ui/icons";

const BADGE = { ok: "ok", danger: "danger", muted: "off" };

// Шапка школы: значок, имя, «Nr. 10245678 · 42 Klassen im Plan», плашка «Plan ok».
// Одна и та же на телефоне (карточка) и ПК (над таблицей)
const SchoolHead = ({ school, children }) => {
  const status = schoolStatus(school);
  const line = schoolLine(school);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sand text-muted">
        <SchoolIcon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2.5">
          <span className="truncate text-subhead text-ink">{school.name}</span>
          <Badge variant={BADGE[status.tone]}>{status.label}</Badge>
        </p>
        {line && <p className="truncate text-label text-faint">{line}</p>}
      </div>
      {children}
    </div>
  );
};

export default SchoolHead;
