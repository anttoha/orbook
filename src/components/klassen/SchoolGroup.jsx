import { cn } from "../../shared/utils/cn";
import ClassCard from "./ClassCard";
import SchoolHead from "./SchoolHead";

// Школа и её карточки классов. start — номер первой карточки: карточки появляются друг за другом (rise-in)
const SchoolGroup = ({ group, today, wide, start = 0, head = true }) => (
  <section className="flex flex-col gap-2.5">
    {head && <SchoolHead school={group.school} count={group.items.length} />}
    <div className={cn("grid gap-3", wide && "lg:grid-cols-2 xl:grid-cols-3")}>
      {group.items.map((item, i) => (
        <div key={item.id} className="motion-safe:animate-rise-in" style={{ animationDelay: `${Math.min(start + i, 6) * 50}ms` }}>
          <ClassCard item={item} today={today} wide={wide} inSchool />
        </div>
      ))}
    </div>
  </section>
);

export default SchoolGroup;
