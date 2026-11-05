// Puts images side by side on a grey page and screenshots it (no PIL or ImageMagick on this server).
import { launch } from "./mock.mjs";
import fs from "node:fs";
const [out, ...files] = process.argv.slice(2);
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
const uri = (f) => `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;
await page.setContent(`<body style="margin:0;background:#888;display:flex;gap:16px;align-items:flex-start;width:max-content">${files.map((f) => `<img src="${uri(f)}" style="height:860px">`).join("")}</body>`);
await page.waitForTimeout(150);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
