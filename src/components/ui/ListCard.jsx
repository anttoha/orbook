// Підпис і біла картка з рядками, розділеними лінією: Mehr, Darstellung, Meine Kurse.
const ListCard = ({ title, className, children }) => (
  <section className={className}>
    {title && <h2 className="mb-2.5 text-hint font-extrabold text-faint">{title}</h2>}
    <ul className="divide-y divide-hair rounded-card bg-card px-3.5 py-0.5">{children}</ul>
  </section>
);

export default ListCard;
