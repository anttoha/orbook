// Первая загрузка (макет handy-06): серые плашки на месте «Stand», плиток и предметов
const Bar = ({ className }) => <span className={`block rounded-full bg-skeleton ${className}`} />;

const NotenSkeleton = () => (
  <div className="flex animate-pulse flex-col gap-4" aria-hidden="true">
    <Bar className="h-2.5 w-37.5" />
    <div className="grid grid-cols-2 gap-3">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-4 rounded-card bg-card p-3.5">
          <Bar className="h-2.5 w-17.5" />
          <span className="block h-7 w-15 rounded-tile bg-skeleton" />
          <Bar className="h-2 w-25" />
        </div>
      ))}
    </div>
    <ul className="mt-4 divide-y divide-hair rounded-card bg-card px-3.5">
      {["w-22.5", "w-27", "w-31.5", "w-22.5", "w-27", "w-31.5"].map((w, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5">
          <span className="size-10 rounded-tile bg-skeleton" />
          <span className="flex flex-1 flex-col gap-2">
            <Bar className={`h-2.5 ${w}`} />
            <Bar className="h-2 w-17.5" />
          </span>
          <span className="h-8.5 w-13 rounded-tile bg-skeleton" />
        </li>
      ))}
    </ul>
  </div>
);

export default NotenSkeleton;
