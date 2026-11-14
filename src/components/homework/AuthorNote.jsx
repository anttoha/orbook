import { UserRound } from "lucide-react";
import { usePlanStore } from "../../shared/store/planStore";
import { authorLine, editRightsText } from "../../shared/utils/homework";

const box = "flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted";

// ─────────────────────────────────────────────────────────────
// Плашка у вікні Klausur / Hausaufgabe (макети handy-05, 08, 15):
//   Eingetragen von Mü · Lehrkraft  (· geändert von Schüler)
//   Ändern: Mü, Admin und Schüler mit Freigabe.
// Запись ученика — без автора: тогда плашки нет (владелец 14.11: без «ohne Namen»)
// ─────────────────────────────────────────────────────────────
const AuthorNote = ({ entry }) => {
  const me = usePlanStore((s) => s.me);
  const line = authorLine(entry, me);
  if (!line) return null;

  return (
    <div className={box}>
      <UserRound className="size-4 shrink-0" />
      <p>
        Eingetragen von <b className="font-extrabold text-ink">{line.name}</b>
        {line.role && ` · ${line.role}`}
        {line.changedByStudent && " · geändert von Schüler"}
        <br />
        {editRightsText(entry)}
      </p>
    </div>
  );
};

export default AuthorNote;
