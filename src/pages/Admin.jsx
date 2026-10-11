import { Keyboard } from "lucide-react";

// Заглушка сторінки «Admin» (посилання внизу сайдбара). Адмінку зробимо пізніше (гайд docs/frontend/09-admin.md).
const Admin = () => {
  return (
    <section className="flex flex-col items-center gap-3 rounded-[24px] bg-card px-6 py-16 text-center">
      <Keyboard className="size-8 text-faint" />
      <h1 className="text-heading text-ink">Admin</h1>
      <p className="text-body font-semibold text-muted">Dieser Bereich kommt bald.</p>
    </section>
  );
};

export default Admin;
