import { describe, expect, it } from "vitest";
import { cleanBody, cleanCss, cleanOriginal } from "./cleanOriginal";

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
