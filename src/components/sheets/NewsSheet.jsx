import { useNavigate } from "react-router-dom";
import { Check, House, SlidersHorizontal } from "lucide-react";
import { useUserStore } from "../../shared/store/userStore";
import MenuRow from "../more/MenuRow";
import { changelog } from "../../shared/changelog";
import { newsDate, unseenEntries } from "../../shared/utils/changelog";
import ChangeGroups from "../changelog/ChangeGroups";
import NewsPicture from "../changelog/NewsPicture";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// «Was ist neu» (часть 22b): открывается один раз после новой версии (?sheet=news).
// Пропустил несколько версий — показываем все, которых не видел (sheet.id — последняя увиденная).
// «Verstanden» закрывает, «Alle ansehen» ведёт в список всех версий.
// Запись с action ({ label, startView }, часть 30c) предлагает сразу открыть новую страницу:
// строка «Startansicht» и кнопки «Später» / «Mit Start öffnen» (макет 30 handy-14)
const NewsSheet = ({ open, onClose, sheet }) => {
  const navigate = useNavigate();
  const startView = useUserStore((s) => s.startView);
  const answerStartOffer = useUserStore((s) => s.answerStartOffer);
  const latest = changelog[0];
  if (!latest) return null;
  const entries = unseenEntries(sheet?.id ?? null, changelog);
  const action = entries.find((entry) => entry.action?.startView === "start" && startView !== "start")?.action;
  const takeAction = () => {
    answerStartOffer(true); // Startansicht = Start, карточка «Mit Start öffnen?» больше не нужна
    onClose();
    navigate("/start");
  };
  const footer = action ? (
    <>
      <Button onClick={onClose}>Später</Button>
      <Button variant="primary" onClick={takeAction}>
        <House className="size-4" />
        {action.label}
      </Button>
    </>
  ) : (
    <>
      <Button onClick={() => navigate("/mehr/neuigkeiten")}>Alle ansehen</Button>
      <Button variant="primary" onClick={onClose}>
        <Check className="size-4" />
        Verstanden
      </Button>
    </>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      eyebrow={`Version ${latest.version} · ${newsDate(latest.date)}`}
      title="Was ist neu"
      footer={footer}
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
        {action && (
          <ul className="rounded-card bg-card px-3.5">
            <MenuRow to="/mehr/darstellung" icon={SlidersHorizontal} label="Startansicht" value={{ heute: "Heute" }[startView] ?? "Woche"} />
          </ul>
        )}
      </div>
    </Sheet>
  );
};

export default NewsSheet;
