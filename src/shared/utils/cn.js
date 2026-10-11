import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge прибирає конфліктні класи ("p-2 p-4" → "p-4").
// Наших стилів тексту (text-body, text-caption…) він сам не знає і приймає їх
// за КОЛІР тексту — тоді "text-caption text-faint" втрачав би розмір.
// Тому кажемо йому: це група «розмір шрифту» (font-size).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display", "hero", "title", "heading", "logo", "number", "subhead", "input", "body", "body-sm", "label", "caption", "small", "micro", "tiny"],
        },
      ],
    },
  },
});

export const cn = (...inputs) => {
    return twMerge(clsx(inputs));
};
