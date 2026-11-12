import OrbitMark from "../ui/OrbitMark";

// «So sieht es aus» (Soft 26): песочная карточка с примером уведомления
const PushPreview = () => (
  <section className="flex flex-col gap-2.5">
    <h2 className="text-hint font-extrabold text-faint">So sieht es aus</h2>
    <div className="flex gap-3 rounded-card bg-sand px-3.5 py-3.5">
      <OrbitMark className="mt-0.5 size-7.5 shrink-0" />
      <div className="min-w-0 text-body-sm text-ink">
        <p className="font-bold">ORBook · jetzt</p>
        <p>Morgen ist was anders · 4. Std Geschichte: Vertretung, Raum B12</p>
      </div>
    </div>
  </section>
);

export default PushPreview;
