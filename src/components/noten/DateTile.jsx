import { monthTag } from "../../shared/utils/noten";

// Песочная плашка даты: «16» и «SEP» (оценки, Fehlzeiten)
const DateTile = ({ iso }) => (
  <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-tile bg-sand">
    <span className="text-body-sm leading-none font-black text-ink">{iso ? iso.slice(8, 10) : "–"}</span>
    <span className="mt-0.5 text-tiny font-extrabold tracking-badge text-faint">{monthTag(iso)}</span>
  </span>
);

export default DateTile;
