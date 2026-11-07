import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { LockIcon } from "../ui/icons";

// Плашка «Du wurdest abgemeldet» над формою входу (макет 14c handy-11): сервер закінчив сесію —
// наприклад, адмін вимкнув Zugangscode. Зникає після нового входу (loginNotice = null)
const SignedOutBanner = ({ className }) => {
  const notice = usePlanStore((s) => s.loginNotice);
  if (!notice) return null;
  return (
    <div role="status" className={cn("flex gap-2.5 rounded-field bg-danger-tint px-3.5 py-3 text-danger", className)}>
      <LockIcon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="text-label font-extrabold">{notice.title}</p>
        <p className="mt-0.5 text-caption leading-4.25">{notice.text}</p>
      </div>
    </div>
  );
};

export default SignedOutBanner;
