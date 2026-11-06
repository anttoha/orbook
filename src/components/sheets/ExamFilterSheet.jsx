import { useExamFilterDraft } from "../../shared/hooks/useExamFilterDraft";
import { EMPTY_FILTER } from "../../shared/utils/exams";
import ExamFilterFields from "../exams/ExamFilterFields";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// Вікно фільтра. Адреса: ?sheet=klausurfilter.
// Вибір лежить у чернетці й застосовується лише кнопкою «3 anzeigen»:
// закрили вікно — у списку нічого не змінилось.
// На ПК сторінка Klausuren відкриває замість нього випадне вікно (ExamFilterPopover).
// ─────────────────────────────────────────────────────────────
const ExamFilterSheet = ({ open, onClose }) => {
  const { draft, change, setDraft, apply, count, pastLoading } = useExamFilterDraft(open);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      title="Filter"
      footer={
        <>
          <Button onClick={() => setDraft(EMPTY_FILTER)}>Zurücksetzen</Button>
          <Button
            variant="primary"
            onClick={() => {
              apply();
              onClose();
            }}
          >
            {pastLoading ? "Anzeigen" : `${count} anzeigen`}
          </Button>
        </>
      }
    >
      <ExamFilterFields draft={draft} change={change} />
    </Sheet>
  );
};

export default ExamFilterSheet;
