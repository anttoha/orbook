import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// cn склеює класи й прибирає ті, що конфліктують: пізніший перемагає.
// tailwind-merge не читає index.css, тому свої токени треба назвати тут.
// Без цього text-row вважався б кольором і викидав би text-on-accent.
const customMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["landing", "display", "lobby", "hero", "welcome", "countdown", "stat", "sheet", "title", "panel", "heading", "state", "brand", "dialog", "logo", "number", "cell", "cell-sm", "subhead", "input", "lead", "body", "row", "body-sm", "nav", "label", "hint", "caption", "note", "small", "axis", "micro", "room", "tiny", "nano"],
      radius: ["tick", "mark", "tag", "chip", "tile", "cell", "field", "block", "box", "card", "panel"],
      tracking: ["badge", "code"],
      shadow: ["lift", "raise", "menu", "sheet"],
      spacing: ["gutter", "gutter-auth"],
      container: ["sidebar", "sidebar-mini", "search", "popover", "sheet", "dialog"],
    },
  },
});

export const cn = (...inputs) => customMerge(clsx(inputs));
