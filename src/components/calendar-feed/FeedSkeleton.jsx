// Загрузка (макет handy-07): серые полоски на месте карточек
const Bar = ({ className }) => <span className={`block rounded-full bg-skeleton ${className}`} />;

const FeedSkeleton = () => (
  <div className="flex flex-col gap-6" aria-busy="true">
    <div className="flex items-center gap-3 rounded-card bg-card px-3.5 py-3">
      <span className="size-8 shrink-0 rounded-full bg-skeleton" />
      <span className="flex flex-1 flex-col gap-2">
        <Bar className="h-3 w-28" />
        <Bar className="h-2.5 w-48" />
      </span>
    </div>
    <ul className="overflow-hidden rounded-card bg-card">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex min-h-18 items-center gap-3 border-b border-hair px-3.5 last:border-0">
          <span className="flex flex-1 flex-col gap-2">
            <Bar className="h-3 w-32" />
            <Bar className="h-2.5 w-52" />
          </span>
          <span className="h-6 w-10.5 rounded-full bg-skeleton" />
        </li>
      ))}
    </ul>
    <Bar className="h-9.5 w-full" />
  </div>
);

export default FeedSkeleton;
