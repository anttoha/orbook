import { ChevronRight, Target } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { noteNumber } from "../../shared/utils/noten";
import Button from "../ui/Button";
import { ZielStatus } from "./ZielBadge";

// Вторая строка: «Nächste Note: 1,6 oder besser» / «Schaffst du mit jeder Note» / … ; без оценок с числом — ничего
function needLine(result) {
  if (!result) return null;
  if (result.status === "sure") return translate("Schaffst du mit jeder Note");
  if (result.status === "impossible") return translate("Mit einer Note nicht zu schaffen");
  return translate("Nächste Note: {note} oder besser", { note: noteNumber(result.need) });
}

// ─────────────────────────────────────────────────────────────
// Цель предмета под карточкой Schnitt (часть 42): ◎ Ziel 2,0 · что нужно · статус ›.
// Цели нет — кнопка «Ziel setzen». Нажатие — шторка «Mein Ziel».
// ─────────────────────────────────────────────────────────────
const ZielCard = ({ info, onOpen }) => {
  const t = useT();
  if (!info) {
    return (
      <Button onClick={onOpen} className="flex-none">
        <Target className="size-4.5" />
        {t("Ziel setzen")}
      </Button>
    );
  }
  const line = needLine(info.result);
  return (
    <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 rounded-card bg-card px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
        <Target className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-extrabold text-ink">{translate("Ziel {note}", { note: noteNumber(info.ziel) })}</span>
        {line && <span className="block text-body-sm text-muted">{line}</span>}
      </span>
      <ZielStatus status={info.status} />
      <ChevronRight className="size-4 shrink-0 text-faint2" />
    </button>
  );
};

export default ZielCard;
