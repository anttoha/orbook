import { createPortal } from "react-dom";

// Лист для печати: рисуется прямо в <body>, на экране не виден (hidden), на бумаге — только он (index.css, @media print).
// Цвета — токены qr-*: они одинаковые в светлой и тёмной теме, бумага всегда белая
const PrintArea = ({ children }) => createPortal(<div className="print-area hidden bg-white text-qr-ink print:block">{children}</div>, document.body);

export default PrintArea;
