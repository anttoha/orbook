import { Info, MapPin, UserRound } from "lucide-react";
import { usePlanStore } from "../../shared/store/planStore";
import { audienceText, sourceText } from "../../shared/utils/appointments";

const box = "flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted";

// Біла картка «Ort / Hinweis» (макет 18 handy-02). Немає ні місця, ні підказки — картки немає
export const PlaceAndNote = ({ item }) => {
  if (!item.place && !item.note) return null;
  return (
    <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
      {item.place && (
        <li className="flex gap-2.5 py-3 text-body text-ink">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted" /> {item.place}
        </li>
      )}
      {item.note && (
        <li className="flex gap-2.5 py-3 text-body whitespace-pre-line text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-muted" /> {item.note}
        </li>
      )}
    </ul>
  );
};

// «Eingetragen von Ric · Lehrkraft / Gilt für alle mit dem Kurs Physik.»
export const SourceNote = ({ item }) => {
  const me = usePlanStore((s) => s.me);
  const source = sourceText(item, me);
  return (
    <div className={box}>
      <UserRound className="size-4 shrink-0" />
      <p>
        Eingetragen {source.name ? "von " : ""}
        {source.name && <b className="font-extrabold text-ink">{source.name}</b>}
        {source.role && `${source.name ? " · " : ""}${source.role}`}
        <br />
        {audienceText(item)}
      </p>
    </div>
  );
};
