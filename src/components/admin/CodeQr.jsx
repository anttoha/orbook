import { Printer } from "lucide-react";
import { usePrint } from "../../shared/hooks/usePrint";
import { useAdminStore } from "../../shared/store/adminStore";
import { codeLink } from "../../shared/utils/linkCode";
import { copyText } from "../../shared/utils/share";
import TeacherSheet from "../print/TeacherSheet";
import Button from "../ui/Button";
import { CopyIcon } from "../ui/icons";
import QrCode from "../ui/QrCode";

// Сегодня как «17.09.2026» — для строки «Ausgedruckt am …»
const todayText = () => new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

// ─────────────────────────────────────────────────────────────
// QR к только что созданному коду (макет 25 handy-12): Lehrer-Code → /?zugang=lehrkraft#КОД,
// Editor-Code → /mehr/editor-code#КОД. Отсканировал — код уже вписан, «Anmelden» человек жмёт сам.
// У Lehrer-Code ещё «Drucken» — личный лист A4 для учителя (a4-03). Код виден только сейчас
// ─────────────────────────────────────────────────────────────
const CodeQr = ({ code, kind, teacher, rights }) => {
  const { print, area } = usePrint();
  const className = useAdminStore((s) => s.settings.data?.settings.school.className ?? null);
  // «?? []» — вне селектора: новый пустой массив в селекторе каждый раз «другой», и страница перерисовывается без конца
  const subjects = useAdminStore((s) => s.teachers.data?.teachers?.find((t) => t.short === teacher)?.subjects) ?? [];
  const url = codeLink(kind === "teacher" ? "teacher" : "editor", code, window.location.origin);
  const printSheet = () => print(<TeacherSheet code={code} url={url} className={className} teacher={teacher} subjects={subjects} rights={rights} printedOn={todayText()} />);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center rounded-panel bg-card px-4 pt-5 pb-5 text-center">
        <QrCode value={url} label={kind === "teacher" ? "QR-Code mit dem Lehrer-Code" : "QR-Code mit dem Editor-Code"} className="size-44" />
        <p className="mt-3 text-caption text-faint">Scannen = Code schon eingetragen</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => copyText(code)} className="flex-1">
          <CopyIcon className="size-4" /> Kopieren
        </Button>
        {kind === "teacher" && (
          <Button onClick={printSheet} className="flex-1">
            <Printer className="size-4" /> Drucken
          </Button>
        )}
      </div>
      {area}
    </div>
  );
};

export default CodeQr;
