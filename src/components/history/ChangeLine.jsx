import { Info } from "lucide-react";
import { KIND_BADGE } from "../../shared/utils/dayHistory";
import Badge from "../ui/Badge";
import SubjectBadge from "../ui/SubjectBadge";

// Цвет бейджа по виду изменения (те же, что у уроков: FÄLLT AUS пунктиром, VERTRETUNG — сиреневый)
const VARIANT = { aus: "cancelled", vertretung: "changed", raum: "changed", verlegt: "changed", neu: "soft", info: "soft", weg: "off", normal: "ok" };

// Одна строка в ленте «Verlauf»: кружок предмета, «3. Std · Englisch», серым — что именно, справа бейдж.
// item — из versionChanges; для «Info zum Tag» передаём { kind: "info", title, text } без code
const ChangeLine = ({ item }) => (
  <li className="flex items-start gap-2.5">
    {item.kind === "info" ? (
      <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-sand text-muted">
        <Info className="size-3.5" />
      </span>
    ) : (
      <SubjectBadge subject={item.code ? { code: item.code } : null} size="sm" />
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-label font-bold text-ink">{item.title}</p>
      <p className="text-caption text-faint">{item.text}</p>
    </div>
    <Badge variant={VARIANT[item.kind] ?? "soft"} className="mt-0.5">
      {KIND_BADGE[item.kind] ?? "NEU"}
    </Badge>
  </li>
);

export default ChangeLine;
