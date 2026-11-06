import { Link } from "react-router-dom";
import { eventTime } from "../../shared/utils/admin";
import EventIcon from "./EventIcon";

// «Letzte Aktivität» (до 5 записів з overview.events) і посилання на весь Protokoll
const RecentEvents = ({ events, today, linkLabel }) => (
  <section>
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-hint font-extrabold text-faint">Letzte Aktivität</h2>
      <Link to="/admin/protokoll" className="text-label font-extrabold text-accent-ink">
        {linkLabel}
      </Link>
    </div>
    {events.length ? (
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
        {events.map((event) => (
          <li key={event.id} className="flex items-center gap-3 py-3">
            <EventIcon event={event} className="size-4.5 shrink-0" />
            <p className="min-w-0 flex-1 text-body-sm leading-5 text-ink">{event.title}</p>
            <span className="shrink-0 text-label text-faint">{eventTime(event.ts, today, { withTime: false })}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="rounded-card bg-card px-3.5 py-4 text-body-sm text-muted">Noch keine Einträge.</p>
    )}
  </section>
);

export default RecentEvents;
