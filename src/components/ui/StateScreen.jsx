import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Екран стану по центру: кружечок з іконкою, заголовок, текст, кнопки.
// «Plan kommt gerade nicht an», «Heute ist frei», «Plan für Freitag fehlt noch».
// fill — зайняти висоту екрана; false, коли під ним ще щось є (сірі уроки «vorläufig»)
// ─────────────────────────────────────────────────────────────
const StateScreen = ({ icon: Icon, title, text, fill = true, children }) => (
  <div className={cn("flex flex-col items-center justify-center px-4 text-center", fill ? "min-h-[calc(100dvh-16rem)] lg:min-h-96" : "py-6")}>
    <span className="grid size-16 place-items-center rounded-full bg-tint text-accent-ink">
      <Icon className="size-6" />
    </span>
    <h2 className="mt-3.5 text-state text-ink">{title}</h2>
    <p className="mt-3 max-w-85 text-body-sm text-muted">{text}</p>
    {children && <div className="mt-5.5 flex w-full max-w-80.5 flex-col gap-2">{children}</div>}
  </div>
);

export default StateScreen;
