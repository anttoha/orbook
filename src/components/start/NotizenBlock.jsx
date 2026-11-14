import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { weekdayShort } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import { latestNotes } from "../../shared/utils/startData";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";

// ─────────────────────────────────────────────────────────────
// Блок «Notizen» (макет handy-01): последняя заметка — текст и «● Englisch · Do».
// Нажатие открывает день этой заметки
// ─────────────────────────────────────────────────────────────
const NotizenBlock = ({ editing }) => {
  const t = useT();
  const notes = useUserStore((s) => s.notes);
  const overrides = useUserStore((s) => s.colorOverrides);
  const names = usePlanStore((s) => s.meta?.subjects);
  const [note] = latestNotes(notes, 1);
  const meta = note && [note.subject && (names?.[note.subject] ?? note.subject), note.date && weekdayShort(note.date)].filter(Boolean).join(" · ");

  return (
    <BlockCard kind="notizen" title={t("Notizen")} to={note?.date ? `/tag/${note.date}` : "/heute"} editing={editing}>
      {note ? (
        <>
          <p className="line-clamp-2 text-body font-bold text-ink">{note.text}</p>
          {meta && (
            <p className="mt-auto flex min-w-0 items-center gap-1.5 text-caption text-faint">
              {note.subject && <span className={cn("size-1.75 shrink-0 rounded-full", fachDotClass(note.subject, overrides))} />}
              <span className="truncate">{meta}</span>
            </p>
          )}
        </>
      ) : (
        <BlockEmpty text="Noch keine Notizen" />
      )}
    </BlockCard>
  );
};

export default NotizenBlock;
