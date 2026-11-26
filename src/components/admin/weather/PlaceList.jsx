import { Check, MapPin } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { samePlace } from "../../../shared/utils/weather";
import Liquid from "../../ui/Liquid";

// «Niedersachsen, Deutschland» — регион и страна, чего нет — пропускаем
const placeLine = (place) => [place.region, place.country].filter(Boolean).join(", ");

// Найденные места (макет 50 handy-07): булавка, город, регион; выбранное — фиолетовым с галочкой
const PlaceList = ({ places, selected, onPick }) => (
  <Liquid as="ul" refract press={false} className="divide-y divide-hair rounded-card bg-card px-3.5">
    {places.map((place) => {
      const on = samePlace(place, selected);
      return (
        <li key={`${place.lat},${place.lon}`}>
          <button type="button" onClick={() => onPick(place)} aria-pressed={on} className="flex w-full items-center gap-3 py-3 text-left">
            <MapPin aria-hidden="true" className={cn("size-4.5 shrink-0", on ? "text-accent-ink" : "text-muted")} strokeWidth={2} />
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate text-row text-ink", on ? "font-extrabold" : "font-semibold")}>{place.name}</span>
              {placeLine(place) && <span className="block truncate text-caption text-faint">{placeLine(place)}</span>}
            </span>
            {on && <Check aria-hidden="true" className="size-5 shrink-0 text-accent-ink" strokeWidth={2.4} />}
          </button>
        </li>
      );
    })}
  </Liquid>
);

export default PlaceList;
