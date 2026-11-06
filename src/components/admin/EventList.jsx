import { eventTime, levelOf } from "../../shared/utils/admin";
import { cn } from "../../shared/utils/cn";

const Dot = ({ level }) => <span className={cn("size-2 shrink-0 rounded-full", levelOf(level).dot)} />;

// Телефон (макет 46): крапка, заголовок і деталь, час праворуч
const EventCards = ({ events, today }) => (
  <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
    {events.map((event) => (
      <li key={event.id} className="flex gap-3 py-3">
        <span className="mt-1.75">
          <Dot level={event.level} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-row font-extrabold text-ink">{event.title}</p>
          {event.detail && <p className="mt-0.5 text-label text-muted">{event.detail}</p>}
        </div>
        <span className="shrink-0 text-label text-faint">{eventTime(event.ts, today, { withTime: false })}</span>
      </li>
    ))}
  </ul>
);

const th = "pb-3 text-left text-hint font-extrabold text-faint";

// ПК (макет 49): таблиця Status · Zeit · Ereignis · Details
const EventTable = ({ events, today }) => (
  <div className="rounded-card bg-card px-5 pt-4.5 pb-1">
    <table className="w-full border-collapse">
      <thead className="border-b border-hair">
        <tr>
          {["Status", "Zeit", "Ereignis", "Details"].map((title) => (
            <th key={title} className={th}>
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-hair">
        {events.map((event) => (
          <tr key={event.id} className="text-body-sm text-muted">
            <td className="w-35 py-3">
              <span className="flex items-center gap-2">
                <Dot level={event.level} />
                {levelOf(event.level).text}
              </span>
            </td>
            <td className="w-43 whitespace-nowrap">{eventTime(event.ts, today)}</td>
            <td className="pr-4 font-extrabold text-ink">{event.title}</td>
            <td className="text-faint">{event.detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Записи Protokoll: картки на телефоні, таблиця на ПК
const EventList = ({ isDesktop, ...props }) => (isDesktop ? <EventTable {...props} /> : <EventCards {...props} />);

export default EventList;
