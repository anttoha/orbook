import { sentLabel } from "../../../shared/utils/channels";

// «Zuletzt gesendet»: заголовок сообщения, когда и дошло ли
const RecentList = ({ items }) => {
  if (!items?.length) return null;
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-hint font-extrabold text-faint">Zuletzt gesendet</h2>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
        {items.slice(0, 5).map((item) => (
          <li key={`${item.kind}-${item.sentAt}`} className="flex items-center justify-between gap-3 py-2.5">
            <span className="min-w-0">
              <span className="block truncate text-row text-ink">{item.title}</span>
              <span className="block text-caption text-faint">{sentLabel(item.sentAt)}</span>
            </span>
            <span className={item.ok ? "shrink-0 text-caption text-muted" : "shrink-0 text-caption font-bold text-danger"}>
              {item.ok ? "Telegram" : "nicht angekommen"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentList;
