import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, User } from "lucide-react";
import { toast } from "sonner";
import { DemoCard, DemoRow } from "../demo/DemoCard";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { demoCode } from "../../shared/utils/demoAccess";
import { loginErrorText, teacherLoginErrorText } from "../../shared/utils/authErrors";

// Вход одним нажатием на демо (часть 33): Schüler:in и Lehrkraft. Editor — только после входа.
// На проде сервер кодов не присылает — компонент ничего не рисует.
const DemoLogin = ({ info, className }) => {
  const t = useT();
  const navigate = useNavigate();
  const login = usePlanStore((s) => s.login);
  const loginTeacher = usePlanStore((s) => s.loginTeacher);
  const [busy, setBusy] = useState(false);

  const student = demoCode(info, "student");
  const teacher = demoCode(info, "teacher");
  if (!student && !teacher) return null;

  const run = async (enter, errorText) => {
    setBusy(true);
    try {
      await enter();
      navigate("/", { replace: true }); // убрать ?zugang=… из адреса
    } catch (error) {
      toast.error(errorText(error));
      setBusy(false);
    }
  };

  return (
    <DemoCard className={className}>
      {student && <DemoRow icon={User} label={t("Schüler:in")} code={student} action={t("Öffnen")} busy={busy} onClick={() => run(() => login(student), loginErrorText)} />}
      {teacher && <DemoRow icon={GraduationCap} label={t("Lehrkraft")} code={teacher} action={t("Öffnen")} busy={busy} onClick={() => run(() => loginTeacher(teacher), teacherLoginErrorText)} />}
    </DemoCard>
  );
};

export default DemoLogin;
