import { useState } from "react";
import { useNow } from "../../../shared/hooks/useNow";
import { useAdminStore } from "../../../shared/store/adminStore";
import { TrashIcon } from "../../ui/icons";
import { Undo2 } from "lucide-react";
import DangerDialog from "../DangerDialog";
import PillButton from "../../ui/PillButton";

// Три дії «Gefahrenzone»: заголовок і текст вікна для кожної
const dangers = (counts) => [
  {
    action: "deleteExams",
    label: "Alle Tests löschen",
    icon: TrashIcon,
    title: "Alle Tests löschen?",
    text: `${counts?.examsUpcoming ?? 0} kommende und alle vergangenen Tests verschwinden für die ganze Klasse, auch bereits gelöschte.`,
  },
  {
    action: "deleteSync",
    label: "Alle Sync-Daten löschen",
    icon: TrashIcon,
    title: "Alle Sync-Daten löschen?",
    text: `Alle ${counts?.syncBlocks ?? 0} verschlüsselten Sync-Speicher auf dem Server werden gelöscht. Die Notizen auf den Geräten selbst bleiben.`,
  },
  {
    action: "resetStats",
    label: "Statistik zurücksetzen",
    icon: Undo2,
    title: "Statistik zurücksetzen?",
    text: "Die Statistik zählt ab heute neu. Gespeicherte Pläne bleiben erhalten.",
    confirmLabel: "Zurücksetzen",
  },
];

// «Gefahrenzone» (макети 45 і 47): кожна кнопка відкриває вікно з LÖSCHEN і паролем адміна
const DangerZone = ({ onDone }) => {
  const { today } = useNow();
  const counts = useAdminStore((s) => s.overview.data?.counts);
  const [open, setOpen] = useState(null); // яка дія у вікні
  const items = dangers(counts);
  const current = items.find((item) => item.action === open);

  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint lg:hidden">Gefahrenzone</h2>
      <div className="flex flex-col gap-2.5 lg:rounded-card lg:border lg:border-danger lg:bg-danger-tint lg:px-5 lg:pt-4.5 lg:pb-3">
        <h2 className="hidden text-hint font-extrabold text-danger lg:block">Gefahrenzone</h2>
        <div className="flex flex-col gap-2.5 lg:flex-row lg:justify-around">
          {items.map((item) => (
            <PillButton glass="destructive" size="lg" key={item.action} onClick={() => setOpen(item.action)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-danger-tint px-5 text-row font-extrabold text-danger lg:bg-transparent">
              <item.icon className="size-4" /> {item.label}
            </PillButton>
          ))}
        </div>
      </div>
      <DangerDialog open={Boolean(current)} onClose={() => setOpen(null)} action={open} title={current?.title} text={current?.text} confirmLabel={current?.confirmLabel} today={today} onDone={onDone} />
    </section>
  );
};

export default DangerZone;
