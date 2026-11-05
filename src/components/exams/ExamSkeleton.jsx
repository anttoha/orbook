import { Skeleton } from "../ui/PlanState";

const ROWS = [
  ["w-14", "w-40"],
  ["w-20", "w-32"],
  ["w-16", "w-44"],
  ["w-20", "w-28"],
];

// Список вантажиться: такі самі рядки, що й у ExamRow, тільки сірі
const ExamSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-2">
    {ROWS.map(([first, second]) => (
      <div key={second} className="flex h-16 items-center gap-3 rounded-card bg-card px-3">
        <Skeleton className="h-11 w-9.5 shrink-0 rounded-tile" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className={`h-2.5 rounded-full ${first}`} />
          <Skeleton className={`h-3.25 rounded-full ${second}`} />
        </div>
      </div>
    ))}
  </div>
);

export default ExamSkeleton;
