import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDayVersions } from "../../shared/hooks/useDayVersions";
import { useNow } from "../../shared/hooks/useNow";
import { useSheet } from "../../shared/hooks/useSheet";
import { cn } from "../../shared/utils/cn";
import { versionLabel } from "../../shared/utils/dayHistory";
import { isIsoDate, longDate, numericDate, weekdayLong, weekdayShort } from "../../shared/utils/format";
import { useVisibleLesson } from "../../shared/hooks/useVisibleLesson";
import DayHistory from "../history/DayHistory";
import VersionView from "../history/VersionView";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// Шторка «Verlauf des Tages» (часть 26). Адреса:
//   ?sheet=verlauf&datum=2026-09-17        — лента Fassungen
//   ?sheet=verlauf&datum=2026-09-17&id=790 — одна старая Fassung, «Ältere / Neuere» листают
// ─────────────────────────────────────────────────────────────
const DayHistorySheet = ({ open, onClose, sheet }) => {
  const { today } = useNow();
  const { openSheet } = useSheet();
  const visible = useVisibleLesson();
  const date = isIsoDate(sheet.datum) ? sheet.datum : today;
  const { data } = useDayVersions(date);
  const versions = data?.versions ?? [];
  const index = sheet.id ? versions.findIndex((v) => String(v.id) === String(sheet.id)) : -1;
  const version = index >= 0 ? versions[index] : null;
  const dayText = `${weekdayLong(date)}, ${longDate(date)}`;

  // листаем без новой записи в истории: «Назад» закрывает шторку, а не листает обратно
  const show = (id) => openSheet("verlauf", { datum: date, id }, { replace: true });
  const back = () => openSheet("verlauf", { datum: date }, { replace: true });

  if (!version) {
    return (
      <Sheet open={open} onClose={onClose} panelLabel="Verlauf des Tages" eyebrow={dayText} title="Verlauf des Tages">
        <DayHistory date={date} />
      </Sheet>
    );
  }

  const older = versions[index + 1];
  const newer = versions[index - 1];
  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Verlauf des Tages"
      eyebrow={`Fassung ${versions.length - index} von ${versions.length} · ${weekdayShort(date)}, ${numericDate(date)}`}
      title={versionLabel(version.fetchedAt, today)}
      icon={
        <button type="button" onClick={back} aria-label="Zurück zum Verlauf" className="mt-1 grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink hover:bg-sand">
          <ChevronLeft className="size-4.25" />
        </button>
      }
      footer={
        <>
          <Button disabled={!older} onClick={() => older && show(older.id)}>
            <ChevronLeft className="size-4" /> Ältere
          </Button>
          {/* следующая за самой новой старой Fassung — это сегодняшний план: возвращаемся к ленте */}
          <Button disabled={!newer} onClick={() => (index === 1 ? back() : newer && show(newer.id))}>
            Neuere <ChevronRight className="size-4" />
          </Button>
        </>
      }
    >
      {/* key — при листании Fassung въезжает заново */}
      <div key={version.id} className={cn("motion-safe:animate-page-fade")}>
        <VersionView version={version} newer={newer} current={versions[0]} visible={visible} today={today} />
      </div>
    </Sheet>
  );
};

export default DayHistorySheet;
