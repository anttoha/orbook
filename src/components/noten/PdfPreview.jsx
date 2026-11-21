import { cloneElement, useEffect, useState } from "react";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { pageCount } from "../../shared/utils/notenSheet";
import Button from "../ui/Button";

// Сколько от настоящего листа (794 px) видно в превью: телефон — маленький, ПК — крупнее
const ZOOM = { phone: 0.24, desktop: 0.5 };

// Серые строки вместо листа, пока оригинал грузится (макет handy-07)
const Loading = () => {
  const t = useT();
  return (
    <div className="flex h-full flex-col items-center gap-3 pb-1">
      <div className="flex h-full w-48 flex-col gap-2.5 rounded-tag bg-card p-4 lg:w-92 lg:gap-5 lg:p-8">
        {[1, 2, 2, 1, 2, 2, 1, 2, 2].map((w, i) => (
          <span key={i} className={cn("h-1.5 rounded-mark bg-skel motion-safe:animate-pulse lg:h-3", w === 1 ? "w-1/2" : "w-5/6")} />
        ))}
      </div>
      <p className="shrink-0 text-label font-bold text-muted">{t("Hole Original …")}</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Превью «Als PDF»: настоящий лист, уменьшенный zoom (zoom меняет и место в разметке, не только картинку).
// element — лист ORBook; original — { loading } | { html } | { error } для оригинала InfoPoint.
// onReady(DOM) — лист нарисован: с него «Herunterladen» делает PDF. Ниже — «1 Seite» / «3 Seiten»
// ─────────────────────────────────────────────────────────────
const PdfPreview = ({ element, original, onRetry, onReady }) => {
  const t = useT();
  const zoom = useMediaQuery(DESKTOP_QUERY) ? ZOOM.desktop : ZOOM.phone;
  const [height, setHeight] = useState(0);

  // Лист ORBook: меряем высоту (без zoom) и отдаём DOM наверх. Высота меняется, когда догружается
  // шрифт, — поэтому следим за ней, пока превью открыто
  const [sheetNode, setSheetNode] = useState(null);
  useEffect(() => {
    if (!sheetNode) return undefined;
    onReady(sheetNode);
    const observer = new ResizeObserver(() => setHeight(sheetNode.offsetHeight));
    observer.observe(sheetNode);
    return () => observer.disconnect();
  }, [sheetNode, onReady]);

  // Оригинал: рамка без скриптов; после загрузки — высота страницы и её DOM
  const measureFrame = (event) => {
    const doc = event.currentTarget.contentDocument;
    if (!doc) return;
    const full = doc.documentElement.scrollHeight;
    event.currentTarget.style.height = `${full}px`;
    setHeight(full);
    onReady(doc.documentElement);
  };

  let body;
  if (element) {
    body = <div style={{ zoom }}>{cloneElement(element, { ref: setSheetNode })}</div>;
  } else if (original?.html) {
    body = (
      <div style={{ zoom }} className="w-a4w bg-white">
        <iframe title={t("Original aus InfoPoint")} sandbox="allow-same-origin" srcDoc={original.html} onLoad={measureFrame} className="block w-a4w border-0 bg-white" />
      </div>
    );
  } else if (original?.error) {
    body = (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-row font-bold text-ink">{original.error === "disabled" ? t("Noten sind für deine Klasse ausgeschaltet") : t("InfoPoint nicht erreichbar")}</p>
        <Button onClick={onRetry} className="flex-none">{t("Nochmal")}</Button>
      </div>
    );
  } else {
    body = <Loading />;
  }

  const pages = pageCount(height);
  return (
    <div className="flex h-82.5 flex-col rounded-card bg-sand px-4 pt-4 pb-3 lg:h-152.5">
      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto overscroll-contain no-scrollbar">
        <div className="h-fit shadow-raise">{body}</div>
      </div>
      <p className="pt-2.5 text-center text-label font-bold text-muted">{height ? (pages === 1 ? t("1 Seite") : t("{n} Seiten", { n: pages })) : " "}</p>
    </div>
  );
};

export default PdfPreview;
