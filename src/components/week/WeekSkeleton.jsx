import { Skeleton } from "../ui/PlanState";

const DAYS = [1, 2, 3, 4, 5];
const PERIODS = [1, 2, 3, 4, 5, 6];

// Тиждень вантажиться (макет «Woche · lädt»): та сама сітка, що й у WeekGrid, тільки сіра
const WeekSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-4">
    <div className="grid gap-1" style={{ gridTemplateColumns: "22px repeat(5, minmax(0, 1fr))" }}>
      <span />
      {DAYS.map((day) => (
        <div key={day} className="flex flex-col items-center gap-1.25 pb-2.5">
          <Skeleton className="h-2 w-5 rounded-tag" />
          <Skeleton className="h-3.5 w-4.5 rounded-full" />
        </div>
      ))}
      {PERIODS.map((period) => (
        <div key={period} className="contents">
          <div className="grid place-items-center">
            <Skeleton className="h-2.75 w-2.25 rounded-full" />
          </div>
          {DAYS.map((day) => (
            <Skeleton key={day} className="h-13 rounded-cell" />
          ))}
        </div>
      ))}
    </div>

    {/* Klausur і підсумок тижня */}
    <div className="flex items-center gap-3">
      <Skeleton className="size-5 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-2.25 w-32 rounded-full" />
        <Skeleton className="h-3.25 w-60 rounded-full" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="size-5 shrink-0 rounded-full" />
      <Skeleton className="h-3.25 w-48 rounded-full" />
    </div>
  </div>
);

export default WeekSkeleton;
