// ─────────────────────────────────────────────────────────────
// qr.js — що малювати в QR-коді запрошення (частина 16, макет design/neu/16-einladen).
// Матрицю рахує бібліотека uqr (рівень корекції Q: можна закрити ~25 % — тому лого в центрі не заважає).
// Тут лише вибір: які клітинки — крапки, де три «очі» і яке поле в центрі вільне під лого.
// ─────────────────────────────────────────────────────────────
import { encode } from "uqr";

const EYE = 7; // «око» в кутку — завжди 7×7 клітинок
const LOGO = 7; // вільний квадрат під лого в центрі: 7×7 з 33×33 — це ~4,5 % коду

// Чи клітинка в одному з трьох «очей» (зліва вгорі, справа вгорі, зліва внизу)
const inEye = (x, y, size) => (x < EYE && y < EYE) || (x >= size - EYE && y < EYE) || (x < EYE && y >= size - EYE);

// Квадрат під лого: однаковий відступ від країв, тому стоїть точно по центру
export const logoBox = (size) => {
  const from = Math.floor((size - LOGO) / 2);
  return { from, to: from + LOGO - 1 };
};

// Матриця (масив рядків з true/false) → { size, dots: [[x, y]…], eyes: [[x, y]…], logo }
export function qrLayout(matrix) {
  const size = matrix.length;
  const logo = logoBox(size);
  const inLogo = (x, y) => x >= logo.from && x <= logo.to && y >= logo.from && y <= logo.to;
  const dots = [];
  matrix.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark && !inEye(x, y, size) && !inLogo(x, y)) dots.push([x, y]);
    }),
  );
  const eyes = [
    [0, 0],
    [size - EYE, 0],
    [0, size - EYE],
  ];
  return { size, dots, eyes, logo };
}

// Текст → готове розташування для <QrCode>. border: 0 — тихий край малюємо самі (відступ у SVG)
export const qrFor = (text) => qrLayout(encode(text, { ecc: "Q", border: 0 }).data);
