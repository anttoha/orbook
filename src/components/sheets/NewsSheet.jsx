import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { changelog } from "../../shared/changelog";
import { newsDate, unseenEntries } from "../../shared/utils/changelog";
import ChangeGroups from "../changelog/ChangeGroups";
import NewsPicture from "../changelog/NewsPicture";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// «Was ist neu» (часть 22b): открывается один раз после новой версии (?sheet=news).
// Пропустил несколько версий — показываем все, которых не видел (sheet.id — последняя увиденная).
// «Verstanden» закрывает, «Alle ansehen» ведёт в список всех версий.
const NewsSheet = ({ open, onClose, sheet }) => {
  const navigate = useNavigate();
  const latest = changelog[0];
  if (!latest) return null;
  const entries = unseenEntries(sheet?.id ?? null, changelog);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      eyebrow={`Version ${latest.version} · ${newsDate(latest.date)}`}
      title="Was ist neu"
      footer={
        <>
          <Button onClick={() => navigate("/mehr/neuigkeiten")}>Alle ansehen</Button>
          <Button variant="primary" onClick={onClose}>
            <Check className="size-4" />
            Verstanden
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {entries.map((entry, index) => (
          <section key={entry.version} className="flex flex-col gap-3">
            {entries.length > 1 && (
              <p className="text-hint font-extrabold text-faint">
                Version {entry.version} · {newsDate(entry.date)}
              </p>
            )}
            <NewsPicture name={entry.picture} />
            <ChangeGroups entry={entry} delay={250 + index * 150} />
          </section>
        ))}
      </div>
    </Sheet>
  );
};

export default NewsSheet;
