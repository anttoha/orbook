import { weekProgress } from "../../shared/utils/tasks";

// Правая колонка «Aufgaben» на широком ПК (макет 25 pc-01): «3 von 7 erledigt» с полоской и подсказка
const WeekProgress = ({ list, today }) => {
  const { done, total, dueSoon } = weekProgress(list, today);
  return (
    <aside className="hidden w-exams-aside shrink-0 flex-col gap-4 desktop:flex">
      <div className="rounded-card bg-card px-5.5 py-5">
        <p className="text-hint font-extrabold text-faint">Diese Woche</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-hero text-accent-ink">{done}</span>
          <span className="text-subhead font-extrabold text-ink">von {total} erledigt</span>
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-sand">
          <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-soft" style={{ width: total > 0 ? `${(done / total) * 100}%` : "0%" }} />
        </div>
        <p className="mt-3 text-label text-faint">{dueSoon > 0 ? `Noch offen bis morgen: ${dueSoon}` : "Bis morgen ist nichts offen."}</p>
      </div>
    </aside>
  );
};

export default WeekProgress;
