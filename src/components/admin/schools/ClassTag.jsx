import { classColor } from "../../../shared/constants/classColors";
import { useAdminClasses } from "../../../shared/hooks/useAdminClasses";
import { adminClassColor } from "../../../shared/utils/adminClasses";
import { cn } from "../../../shared/utils/cn";

// Метка класса у кода «07B» в цвете класса (как в чипе админки). В списке коды всех классов —
// метка показывает, чей код. Код без класса (один класс на сервере) — метки нет
const ClassTag = ({ code }) => {
  const { list } = useAdminClasses();
  if (!code?.className) return null;
  return (
    <span title={`Klasse ${code.className}`} className={cn("inline-flex h-4.75 shrink-0 items-center rounded-full px-2 text-room leading-none font-black", classColor(adminClassColor(list, code.classId)).tint)}>
      {code.className}
    </span>
  );
};

export default ClassTag;
