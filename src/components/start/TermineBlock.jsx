import { useAppointments } from "../../shared/hooks/useAppointments";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { timeText, upcomingAppointments } from "../../shared/utils/appointments";
import { shortDate, weekdayShort } from "../../shared/utils/format";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// ─────────────────────────────────────────────────────────────
// Блок «Termine» (макет pc-01): ближайшие Termine. Первый — с датой и временем строкой ниже,
// остальные — строкой «Herbstferien … ab 19. Okt». Настройка «Einträge» 2/3/5
// ─────────────────────────────────────────────────────────────
const TermineBlock = ({ block, editing }) => {
  const t = useT();
  const { today } = useNow();
  const { items, status } = useAppointments();
  const list = upcomingAppointments(items, today)
    .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))
    .slice(0, block.opts.count ?? 2);

  const body = () => {
    if (!list.length) return status === "loading" || status === "idle" ? <BlockSkeleton /> : <BlockEmpty text="Keine Termine" />;
    const [first, ...rest] = list;
    return (
      <>
        <p className="truncate text-body-sm font-extrabold text-ink">{first.title}</p>
        <p className="truncate text-caption text-faint">{[`${weekdayShort(first.dateFrom)}, ${shortDate(first.dateFrom)}`, timeText(first)].filter(Boolean).join(" · ")}</p>
        {rest.length > 0 && (
          <ul className="mt-2 flex flex-col divide-y divide-hair border-t border-hair">
            {rest.map((item) => (
              <li key={item.id} className="flex items-center gap-2 py-1.5">
                <span className="min-w-0 flex-1 truncate text-body-sm font-bold text-ink">{item.title}</span>
                <span className="shrink-0 text-caption text-faint">{`${item.dateTo ? `${t("ab")} ` : ""}${shortDate(item.dateFrom)}`}</span>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  };

  return (
    <BlockCard kind="termine" title={t("Termine")} to="/testen?liste=termine" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default TermineBlock;
