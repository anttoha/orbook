import { Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHomeworkItem } from "../../shared/hooks/useHomework";
import { useNow } from "../../shared/hooks/useNow";
import { usePlanStore } from "../../shared/store/planStore";
import { subjectName } from "../../shared/utils/format";
import { dueTitle } from "../../shared/utils/homework";
import { homeworkText, shareText } from "../../shared/utils/share";
import AuthorNote from "../homework/AuthorNote";
import HistoryList from "../homework/HistoryList";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { PencilIcon } from "../ui/icons";
import { Skeleton } from "../ui/PlanState";
import Sheet from "../ui/Sheet";
import SubjectBadge from "../ui/SubjectBadge";

// Вікно без запису: вантажиться, не знайдена або помилка
const Placeholder = ({ open, onClose, status, error }) => (
  <Sheet open={open} onClose={onClose} panelLabel="Hausaufgabe" title="Hausaufgabe">
    {status === "loading" ? <Skeleton className="h-19 rounded-card" /> : <p className="text-body-sm text-muted">{status === "missing" ? "Diese Hausaufgabe gibt es nicht (mehr)." : error?.message}</p>}
  </Sheet>
);

// ─────────────────────────────────────────────────────────────
// Вікно Hausaufgabe (макети handy-05, handy-15, pc-02). Адреса: ?sheet=hausaufgabe&id=4.
// «Kalender» з макета немає: у API немає .ics для Hausaufgaben (spec, «Отличия»).
// «Bearbeiten» — лише коли ця сесія може міняти запис (canEdit).
// ─────────────────────────────────────────────────────────────
const HomeworkSheet = ({ open, onClose, sheet }) => {
  const { item, status, error } = useHomeworkItem(sheet.id);
  const { today } = useNow();
  const navigate = useNavigate();
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false);

  if (!item) return <Placeholder open={open} onClose={onClose} status={status} error={error} />;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Hausaufgabe"
      eyebrow={
        <span className="flex items-center gap-2">
          <Badge variant="soft">Hausaufgabe</Badge>
          <span className="truncate text-hint font-normal">{subjectName(item.subject)}</span>
        </span>
      }
      title={dueTitle(item.due, today)}
      titleClassName="text-brand"
      hideClose
      icon={<SubjectBadge subject={item.subject} size="lg" />}
      footer={
        <div className="flex w-full flex-col gap-3.5">
          {shareEnabled && (
            <Button onClick={() => shareText(homeworkText(item))}>
              <Share className="size-4" /> Teilen
            </Button>
          )}
          {item.canEdit && (
            <Button variant="primary" className="flex-none" onClick={() => navigate(`/testen/hausaufgaben/${item.id}/bearbeiten`)}>
              <PencilIcon className="size-4" /> Bearbeiten
            </Button>
          )}
        </div>
      }
    >
      <p className="rounded-card bg-card px-3.75 py-3.5 text-body whitespace-pre-line text-ink">{item.text}</p>
      <AuthorNote entry={item} privacyText="Nur Fach, Abgabe und Aufgabe — ohne Namen." />
      <HistoryList kind="homework" entry={item} noun="Hausaufgabe" />
    </Sheet>
  );
};

export default HomeworkSheet;
