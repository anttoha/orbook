import { groupsOf } from "../../shared/utils/changelog";
import Badge from "../ui/Badge";

// Группы «NEU / BEHOBEN / ENTFERNT»: бейдж и под ним точки с текстом
const ChangeGroups = ({ entry }) => (
  <div className="flex flex-col gap-4.5">
    {groupsOf(entry).map((group) => (
      <section key={group.key} className="flex flex-col gap-2">
        <Badge variant={group.variant} className="self-start">
          {group.title}
        </Badge>
        <ul className="flex flex-col gap-1.5">
          {group.items.map((item) => (
            <li key={item} className="flex gap-2.5 text-body-sm leading-5 text-ink">
              <span aria-hidden="true" className="mt-2 size-1.25 shrink-0 rounded-full bg-faint2" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export default ChangeGroups;
