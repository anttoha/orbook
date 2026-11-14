import { Skeleton } from "../ui/PlanState";
import Liquid from "../ui/Liquid";

// Різна довжина рядків, щоб заглушка була схожа на справжні предмети
const ROWS = [
  ["w-30.5", "w-20.5"],
  ["w-37.5", "w-26"],
  ["w-27", "w-17.5"],
  ["w-34", "w-23"],
  ["w-41", "w-20.5"],
  ["w-24", "w-19"],
];

// День вантажиться (макет «Tag · lädt»): плашка Info і шість уроків
const DaySkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-3">
    <Skeleton className="h-16 rounded-tile" />
    <div className="flex flex-col gap-2">
      {ROWS.map(([first, second]) => (
        <Liquid as="div" refract press={false} key={first} className="flex h-13.5 items-center rounded-card bg-card px-3.5">
          <div className="flex w-13.5 shrink-0 flex-col gap-1.25">
            <Skeleton className="h-2.75 w-8.5 rounded-full" />
            <Skeleton className="h-2.25 w-6.5 rounded-full" />
          </div>
          <div className="flex flex-1 flex-col gap-1.75">
            <Skeleton className={`h-3.25 rounded-full ${first}`} />
            <Skeleton className={`h-2.5 rounded-full ${second}`} />
          </div>
        </Liquid>
      ))}
    </div>
  </div>
);

export default DaySkeleton;
