import { describe, expect, it } from "vitest";
import { asPrinted, cleanBody, cleanCss, cleanOriginal, printCss } from "./cleanOriginal";

const EVIL =
  '<html><head><script>alert(1)</script><link rel="stylesheet" href="x.css"></head>' +
  '<body onload="x()"><div id="content" class="main"><h2>Zensuren</h2>' +
  '<table class="t02"><tr><td style=\'text-align:center;\' onclick="y()">1</td>' +
  '<td style="background:url(https://evil.example/a.png)">2</td><th colspan=4><b>Zensuren</b></th></tr></table>' +
  '<a href="javascript:z()">Details</a><img src="images/print.png" onerror="z()">' +
  "<iframe src='https://evil.example'></iframe><p>&lt;b&gt; &amp; Ende</p><!-- x --></div></body></html>";

describe("cleanOriginal", () => {
  it("lässt Tabellen und Text, wirft aktive Inhalte raus", () => {
    const out = cleanBody(EVIL);
    for (const bad of ["script", "alert", "onload", "onclick", "onerror", "javascript", "<img", "<link", "iframe", "evil.example", "url(", "<!--"]) {
      expect(out, bad).not.toContain(bad);
    }
    expect(out).toContain('<td style="text-align:center;">1</td>');
    expect(out).toContain('<th colspan="4"><b>Zensuren</b></th>');
    expect(out).toContain("<span>Details</span>");
    expect(out).toContain("&lt;b&gt; &amp; Ende");
  });

  it("Stil ohne fremde Adressen, Seite mit genau einem <style>", () => {
    expect(cleanCss("td{background:url(a.png)} @import 'x.css'; /* c */ </style>")).toBe("td{background:none}   /style>");
    const page = cleanOriginal("<b>x</b>", "#head{display:none}");
    expect(page.match(/<style>/g)).toHaveLength(1);
    expect(page).toContain("<style>#head{display:none}</style>");
    expect(cleanOriginal(null, null)).toContain("<body></body>");
  });
});

describe("printCss / asPrinted (как на бумаге)", () => {
  const css = "#head{color:red}@media print{#head,#footer{display:none}#content{padding:0}}@media screen{.only{color:blue}}@media (max-width:600px){p{margin:0}}";

  it("правила для печати становятся обычными, только для экрана — выброшены, остальные остаются", () => {
    expect(printCss(css)).toBe("#head{color:red}#head,#footer{display:none}#content{padding:0}@media (max-width:600px){p{margin:0}}");
  });
  it("«screen, print» тоже считается печатью; «not print» — нет", () => {
    expect(printCss("@media screen, print{a{b:c}}")).toBe("a{b:c}");
    expect(printCss("@media not print{a{b:c}}")).toBe("@media not print{a{b:c}}");
  });
  it("пустой стиль и null не ломаются", () => {
    expect(printCss("")).toBe("");
    expect(printCss(null)).toBe("");
  });
  it("в странице меняется только <style>, фон убран", () => {
    const page = asPrinted("<html><head><style>@media print{#head{display:none}}</style></head><body><div id=\"head\">Abmelden</div></body></html>");
    expect(page).toContain("#head{display:none}");
    expect(page).toContain("background:transparent!important");
    expect(page).toContain('<div id="head">Abmelden</div>');
  });
});
