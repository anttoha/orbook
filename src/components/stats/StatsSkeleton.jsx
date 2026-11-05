import { Skeleton } from "../ui/PlanState";

// Заглушка, поки статистика йде: три картки, блок стовпчиків, рядки списку
const StatsSkeleton = () => (
  <div aria-busy="true" aria-label="Statistik lädt" className="flex flex-col gap-5">
    <div className="grid grid-cols-3 gap-2">
      <Skeleton className="h-28 rounded-card" />
      <Skeleton className="h-28 rounded-card" />
      <Skeleton className="h-28 rounded-card" />
    </div>
    <Skeleton className="h-46 rounded-card" />
    <div className="flex flex-col gap-3">
      <Skeleton className="h-3.5 w-40" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
    </div>
  </div>
);

export default StatsSkeleton;
