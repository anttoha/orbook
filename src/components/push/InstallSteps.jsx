import OrbitMark from "../ui/OrbitMark";

// Шаги 1-2-3 с картинкой справа (макет 17: iPhone и «blockiert»).
// steps: [{ text: [["Unten auf ", false], ["Teilen", true], …], icon }]
const InstallSteps = ({ steps }) => (
  <ol className="overflow-hidden rounded-card bg-card">
    {steps.map((step, index) => (
      <li key={index} className="flex min-h-16 items-center gap-3 border-b border-hair px-3.5 py-2.5 last:border-0">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tint text-label font-black text-accent-ink">{index + 1}</span>
        <span className="min-w-0 flex-1 text-body-sm text-ink">
          {step.text.map(([part, bold], i) => (bold ? <b key={i} className="font-extrabold">{part}</b> : <span key={i}>{part}</span>))}
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-thumb bg-sand text-accent-ink" aria-hidden="true">
          {step.icon === "app" ? <OrbitMark className="size-6" /> : <step.icon className="size-4.5" />}
        </span>
      </li>
    ))}
  </ol>
);

export default InstallSteps;
