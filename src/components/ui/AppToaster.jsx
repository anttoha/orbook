import { Toaster } from "sonner";
import { Check, TriangleAlert } from "lucide-react";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";

// Спливаючі сповіщення (toast) як на макеті «Meldungen»: на телефоні над нижнім меню, на ПК внизу праворуч.
// Один на застосунок класу і один на адмінку
const AppToaster = () => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <Toaster
      position={isDesktop ? "bottom-right" : "bottom-center"}
      offset={isDesktop ? { bottom: 28, right: 28 } : { bottom: 96 }}
      mobileOffset={{ bottom: 96, left: 16, right: 16 }}
      style={{ "--width": "400px" }}
      visibleToasts={1} // один тост за раз: новий замінює старий
      icons={{ success: <Check className="size-4" />, error: <TriangleAlert className="size-4" /> }}
      toastOptions={{
        unstyled: true,
        classNames: {
          // колір помилки через data-type: окремий клас програв би bg-ink за порядком у CSS
          toast: "flex w-full items-center gap-2.5 rounded-field bg-ink px-3.5 py-3 font-sans text-nav font-semibold text-paper shadow-menu data-[type=error]:bg-danger data-[type=error]:text-white",
          title: "min-w-0",
          icon: "shrink-0",
          actionButton: "ml-auto shrink-0 text-label font-bold underline",
        },
      }}
    />
  );
};

export default AppToaster;
