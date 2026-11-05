import { cn } from "../../shared/utils/cn";

// Смужки кроків над заголовком: done із total зафарбовані
const StepBar = ({ done, total }) => (
  <div aria-hidden="true" className="flex gap-1.5">
    {Array.from({ length: total }, (_, index) => (
      <span key={index} className={cn("h-1 flex-1 rounded-full", index < done ? "bg-accent" : "bg-sand")} />
    ))}
  </div>
);

export default StepBar;
