import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { changelog } from "../../shared/changelog";
import { newsDate } from "../../shared/utils/changelog";
import ChangeGroups from "../changelog/ChangeGroups";
import NewsPicture from "../changelog/NewsPicture";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// «Was ist neu» (часть 22b): открывается один раз после новой версии (?sheet=news).
// «Verstanden» закрывает, «Alle ansehen» ведёт в список всех версий.
const NewsSheet = ({ open, onClose }) => {
  const navigate = useNavigate();
  const latest = changelog[0];
  if (!latest) return null;

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
      <NewsPicture name={latest.picture} />
      <ChangeGroups entry={latest} delay={250} />
    </Sheet>
  );
};

export default NewsSheet;
