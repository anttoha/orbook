import { Skeleton } from "../ui/PlanState";

// Серые полоски, пока данные блока грузятся (макет handy-06)
const BlockSkeleton = () => (
  <div className="flex flex-col gap-2.5" aria-hidden="true">
    <Skeleton className="h-4 w-3/5 rounded-full" />
    <Skeleton className="h-2.5 w-2/5 rounded-full" />
  </div>
);

export default BlockSkeleton;
