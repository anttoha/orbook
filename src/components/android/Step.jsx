// Шаг «как сделать»: номер, текст и значок справа (макет 31 handy-05, handy-10).
// label — одной строкой, жирное между звёздочками: "Datei *öffnen*" — так перевод сам решает, какое слово жирное
const Step = ({ number, label, icon: Icon }) => (
  <li className="flex h-14.5 items-center gap-3">
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tint text-label font-black text-accent-ink">{number}</span>
    <span className="min-w-0 flex-1 text-row leading-tight text-ink">
      {label.split("*").map((part, i) => (i % 2 ? <b key={i} className="font-extrabold">{part}</b> : part))}
    </span>
    <span className="grid size-8 shrink-0 place-items-center rounded-tile bg-sand text-accent-ink">
      <Icon className="size-4.5" />
    </span>
  </li>
);

export default Step;
