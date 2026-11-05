// Блок «Pflicht» або «Wahl»: підпис і картка з рядками. Порожню групу не показуємо.
const CourseGroup = ({ title, children }) => {
  if (!children.length) return null;

  return (
    <section>
      <h2 className="mb-2 text-hint font-extrabold text-faint">{title}</h2>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5 py-0.5">{children}</ul>
    </section>
  );
};

export default CourseGroup;
