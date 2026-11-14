import { useRouteError } from "react-router-dom";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { routeErrorText } from "../shared/utils/routeError";
import { cn } from "../shared/utils/cn";
import PillButton from "../components/ui/PillButton";
import Liquid from "../components/ui/Liquid";

// Показується замість сторінки, яка впала (errorElement у router.jsx).
// inline — усередині застосунку, меню лишається. Без inline — на весь екран.
const RouteError = ({ inline = false }) => {
  const error = useRouteError();

  return (
    <div className={cn(!inline && "flex min-h-dvh items-center justify-center bg-paper px-gutter")}>
      <Liquid as="div" refract press={false} role="alert" className="flex w-full max-w-110 flex-col items-center gap-3 rounded-card bg-card px-5 py-10 text-center">
        <TriangleAlert className="size-7 text-danger" />
        <h1 className="text-subhead text-ink">Etwas ist schiefgelaufen</h1>
        <p className="text-label font-semibold text-muted">{routeErrorText(error)}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {/* повне перезавантаження: скидає стан, через який сторінка могла впасти */}
          <PillButton glass="filled" size="sm"
           
            onClick={() => window.location.reload()} className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-label font-extrabold text-on-accent">
            <RefreshCw className="size-3.5" /> Neu laden
          </PillButton>
          {/* reloadDocument: повне завантаження, бо стан застосунку міг зламатися */}
          <PillButton glass="glass" size="sm" to="/woche" reloadDocument className="rounded-full bg-sand px-4 py-2 text-label font-extrabold text-ink">
            Zur Woche
          </PillButton>
        </div>
      </Liquid>
    </div>
  );
};

export default RouteError;
