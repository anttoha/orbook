import { infoParagraphs } from "../../../shared/utils/format";

// ─────────────────────────────────────────────────────────────
// Картка «Info zum Tag» у правій колонці дня (ПК):
// перші два абзаци + «Alles» (відкриває панель з усім текстом).
// day — день із сервера: info (рядки), publishedAt (коли школа опублікувала план)
// ─────────────────────────────────────────────────────────────
const DayInfoCard = ({ day, onOpen }) => {
  const paragraphs = infoParagraphs(day.info); // абзаци тексту школи

  return (
    <section className="rounded-[24px] bg-card p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-label font-extrabold text-faint">Info zum Tag</h2>
        <button type="button" onClick={onOpen} className="text-label font-extrabold text-accent">
          Alles
        </button>
      </header>
      <div className="mt-2.5 flex flex-col gap-2.5 text-body font-medium text-ink">
        {paragraphs.slice(0, 2).map((p) => (
          <p key={p} className="line-clamp-4">
            {p}
          </p>
        ))}
      </div>
      {/* «Stand 11:26» — час публікації плану школою (HH:MM з ISO-рядка) */}
      {day.publishedAt && <p className="mt-2.5 text-caption font-semibold text-faint">Aus dem Vertretungsplan · Stand {day.publishedAt.slice(11, 16)}</p>}
    </section>
  );
};

export default DayInfoCard;
