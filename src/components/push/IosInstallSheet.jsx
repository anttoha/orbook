import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import InstallSteps from "./InstallSteps";
import { IOS_STEPS } from "./steps";

// «ORBook installieren» на iPhone (макет 17 handy-04): у Safari нет кнопки «Installieren», только эти шаги.
// Адрес: ?sheet=installieren
const IosInstallSheet = ({ open, onClose }) => (
  <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow="iPhone · Safari" title="ORBook installieren" footer={<Button onClick={onClose}>Verstanden</Button>}>
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-muted">Dann startet ORBook wie eine App: eigenes Symbol, keine Browserleiste, und Mitteilungen gehen auch.</p>
      <InstallSteps steps={IOS_STEPS} />
      <p className="rounded-field bg-sand px-3.25 py-3 text-label text-muted">Teilen ist das Quadrat mit dem Pfeil nach oben, unten in der Mitte von Safari.</p>
    </div>
  </Sheet>
);

export default IosInstallSheet;
