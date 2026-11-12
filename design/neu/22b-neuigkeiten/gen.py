# Генератор макетов части 22b «Neuigkeiten»: окно «Was ist neu» (один раз после новой версии) и страница «Neuigkeiten» в Mehr.
# Основа — оригиналы ORBook Soft: 22 «Mehr», 12 «Teilen» (шторка), PC 22 «Einstellungen · Übersicht» и макеты части 22.
# Данные грузятся из файла во фронте, поэтому состояний «загрузка/ошибка» нет — только окно, список и раскрытая версия.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g22", os.path.join(HERE, "..", "22-kleinigkeiten", "gen.py"))
k = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(k)
g, m19, page = k.g, k.m19, k.page
T, R, ICON, P, label, eyebrow, title, button, round_btn, badge = k.T, k.R, k.ICON, k.P, k.label, k.eyebrow, k.title, k.button, k.round_btn, k.badge
BACK, CLOSE, CHEV_R, CHECK, tw = g.BACK, g.CLOSE, g.CHEV_R, g.CHECK, g.tw
SPARK = P("M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z") + P("M19 16v4M17 18h4")
CHEV_U, CHEV_D = P("M6 14l6-6 6 6"), g.CHEV_D

# ── Beispieltexte (so stehen sie später in src/shared/changelog) ──
ENTRIES = [
    ("0.8.4", "12. November 2026", {
        "Neu": ["Die Seite „Neuigkeiten“. Hier steht, was sich geändert hat.",
                "„Alle Kurse“: Ein Tipp, und du siehst den ganzen Plan der Klasse.",
                "Sport gibt es jetzt getrennt für Mädchen und Jungen.",
                "„Mehr“ ist übersichtlicher: oben Seiten, darunter Einstellungen."],
        "Behoben": ["Am Anfang waren manchmal alle Kurse an, obwohl du nur einen gewählt hattest."],
        "Entfernt": ["Statistik ist nicht mehr unten in der Leiste. Du findest sie jetzt unter „Mehr“."]}),
    ("0.8.3", "8. November 2026", {
        "Behoben": ["Der Plan zeigt jetzt die nächsten fünf Schultage, auch am Wochenende.",
                    "Im Browser-Tab ist jetzt das ORBook-Logo."]}),
    ("0.8.2", "7. November 2026", {
        "Neu": ["Zugangscodes kannst du dir noch einmal anzeigen lassen."]}),
    ("0.8.1", "7. November 2026", {
        "Neu": ["Neue Mitschüler kommen per Link oder QR-Code in die Klasse."],
        "Behoben": ["Ein paar Fehler bei der Kurswahl."]}),
]
KIND = {"Neu": "tint", "Behoben": "ok", "Entfernt": "off"}

def wrap(text, maxw, size=13.5):
    lines, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if tw(t, size, 400) * 0.88 > maxw and cur: lines.append(cur); cur = word
        else: cur = t
    return lines + [cur]

def groups(x, y, w, c, gr, size=13.5, lh=19.5):
    """Gruppen «NEU / BEHOBEN / ENTFERNT»: Marke, darunter Punkte mit Text. Gibt (svg, neues y) zurück."""
    out = []
    for name, items in gr.items():
        bd, _ = badge(x, y, name.upper(), c, KIND[name]); out.append(bd); y += 38
        for it in items:
            out.append(f'<circle cx="{x + 3.5}" cy="{y - 4.5}" r="2.5" fill="{c["faint2"]}"/>')
            for ln in wrap(it, w - 18, size):
                out.append(T(x + 16, y, ln, size, 400, c["ink"])); y += lh
            y += 5
        y += 8
    return "".join(out), y

def illu(x, y, w, h, c, sub, pc=False):
    pc = pc or w < 300
    """Bild zur Version (Beispiel): Schalter «Alle Kurse» und drei Stunden, eine davon gestrichelt (nicht mein Kurs)."""
    out = [R(x, y, w, h, 18, c["tint"])]
    out.append(T(x + 14, y + 28, "Alle Kurse zeigen", 12.5, 700, c["accink"]) + g.switch(x + w - 56, y + 12, True, c))
    cw = (w - 28 - 12) / 3; cy = y + 48; ch = h - 62
    for i, (code, mine) in enumerate([("Ma", True), ("Ph", False), ("En", True)]):
        cx = x + 14 + i * (cw + 6)
        solid, tint, text = sub[code]
        if mine: out.append(R(cx, cy, cw, ch, 12, tint) + T(cx + 9, cy + 20, g.NAMES[code], 11.5 if pc else 12.5, 800, text))
        else: out.append(R(cx + .5, cy + .5, cw - 1, ch - 1, 12, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(cx + 9, cy + 20, g.NAMES[code], 11.5 if pc else 12.5, 800, c["faint"]))
    return "".join(out)

# ════════════════ Telefon ════════════════
def p_mehr(c, theme, sub):
    b = [eyebrow(18, 33, "9b · Meine Schule", c), title(18, 65, "Mehr", c)]
    b.append(label(18, 104, "Seiten", c) + T(372, 104, "weitere Bereiche der App", 12, 400, c["faint"], "end"))
    card, h = k.rows_card(18, 116, 354, [(k.BARS, "Statistik", "Woche · Monat"), (SPARK, "Neuigkeiten", "0.8.4"), (k.I_SHIELD, "Datenschutz", None)], c)
    b.append(card)
    bd, _ = badge(18 + 45 + tw("Neuigkeiten", 14.5, 500) + 10, 116 + 52.5 + 17, "NEU", c, "accent"); b.append(bd)
    y = 116 + h + 32
    b.append(label(18, y, "Einstellungen", c) + T(372, y, "so soll ORBook bei dir sein", 12, 400, c["faint"], "end"))
    card, h2 = k.rows_card(18, y + 12, 354, [(k.I_KURSE, "Meine Kurse", "7 von 8"), (k.I_DARST, "Darstellung", "Hell"), (k.I_FARBEN, "Fachfarben", None),
                                             (k.I_MITT, "Mitteilungen", "an"), (k.I_SYNC, "Notizen synchronisieren", "K7QM-…"), (k.I_KEY, "Klausuren eintragen", "Editor-Code")], c)
    b.append(card)
    y = y + 12 + h2 + 18
    b.append(R(18, y, 354, 52.5, 22, c["card"]) + ICON(32, y + 16, 0.79, c["danger"], k.I_LOGOUT, 1.9) + T(63, y + 30.5, "Klasse verlassen", 14.5, 500, c["danger"]))
    b.append(T(18, y + 83, "ORBook 1.0 · Teil von ORBitium", 12, 400, c["faint"]) + T(372, y + 83, "Admin", 12, 400, c["faint"], "end"))
    b.append(k.bottom_nav(c, 2))
    return page(390, 844, c, "".join(b))

def sheet(top, c, eyebrow_text, title_text, H=844):
    b = [f'<path d="M30,{top} H360 A30,30 0 0 1 390,{top + 30} V{H}  H0  V{top + 30} A30,30 0 0 1 30,{top} Z" fill="{c["paper"]}"/>',
         R(176, top + 10, 38, 4, 2, c["faint2"]), eyebrow(18, top + 41, eyebrow_text, c), title(18, top + 70, title_text, c, 26),
         R(338, top + 42, 34, 34, 17, c["card"]) + ICON(346.5, top + 50.5, 0.71, c["ink"], CLOSE)]
    return "".join(b)

def p_fenster(c, theme, sub):
    inner, w, h = g.base("04 Woche", theme)
    top = 70
    ver, date, gr = ENTRIES[0]
    b = [inner, g.overlay(c, 390, 844), sheet(top, c, f"Version {ver} · {date[:-5]}", "Was ist neu")]
    b.append(illu(18, top + 96, 354, 104, c, sub))
    body, y = groups(18, top + 232, 354, c, gr)
    b.append(body)
    b.append(f'<line x1="0" y1="{756}" x2="390" y2="756" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(18, 770, 150, "Alle ansehen", c, "sand", None) + button(176, 770, 196, "Verstanden", c))
    return g.svg(390, 844, c, "".join(b))

def entry_card(x, y, w, c, entry, open_, sub, newest=False, pc=False):
    ver, date, gr = entry
    out = []
    n = sum(len(v) for v in gr.values())
    head = 58
    body, endy, img_h = "", y + head, 0
    if open_:
        if pc:
            body, endy = groups(x + 20, y + head + 6, w - 40 - 260, c, gr)
            img = illu(x + w - 20 - 240, y + head + 6, 240, 112, c, sub) if newest else ""
            body += img; endy = max(endy, y + head + 130)
        else:
            iy = y + head
            gbody, endy = groups(x + 14, iy + 4, w - 28, c, gr)
            body += gbody
        h = endy - y + 6
    else:
        h = head
    out.append(R(x, y, w, h, 22, c["card"]))
    out.append(T(x + 16, y + 26, f"Version {ver}", 15, 800, c["ink"]))
    bx = x + 16 + tw(f"Version {ver}", 15, 800) + 10
    if newest: out.append(badge(bx, y + 11, "NEU", c, "accent")[0])
    sub_txt = date if open_ else f"{date} · {n} {'Änderung' if n == 1 else 'Änderungen'}"
    out.append(T(x + 16, y + 45, sub_txt, 12, 400, c["faint"]))
    out.append(ICON(x + w - 36, y + 18, 0.75, c["faint2"], CHEV_U if open_ else CHEV_D))
    if open_: out.append(f'<line x1="{x + 14}" y1="{y + head}" x2="{x + w - 14}" y2="{y + head}" stroke="{c["hair"]}" stroke-width="1"/>')
    return "".join(out) + body, h

def p_liste(c, theme, sub, open_idx=0):
    b = [round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, "Mehr", c) + title(66, 65, "Neuigkeiten", c)]
    y = 100
    for i, e in enumerate(ENTRIES):
        card, h = entry_card(18, y, 354, c, e, i == open_idx, sub, newest=i == 0)
        b.append(card); y += h + 10
    b.append(k.bottom_nav(c, 2))
    return page(390, 844, c, "".join(b))

# ════════════════ Computer ════════════════
def p_pc_mehr(c, theme, sub):
    k.SUBNAV[0][1][:] = [("Statistik", k.BARS), ("Neuigkeiten", SPARK), ("Datenschutz", k.I_SHIELD)]
    inner = k.pc_base("22 Einstellungen · Übersicht", theme)
    b = [inner, R(250, 0, 1190, 900, 0, c["paper"]), k.pc_sidebar(inner, c, True)]
    b.append(eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38))
    b.append(k.pc_subnav(c, "Übersicht"))
    b.append(T(558, 132, "Übersicht", 26, 900, c["ink"], ls=-0.39))
    X1, X2, W = 558, 904, 334
    b.append(label(X1, 176, "Seiten", c) + T(X1 + 62, 176, "weitere Bereiche der App", 12, 400, c["faint"]))
    b.append(k.hub_card(X1, 188, W, k.BARS, "Statistik", "Stunden, Ausfälle, Vertretungen", c) + k.hub_card(X2, 188, W, SPARK, "Neuigkeiten", "Neu in 0.8.4 · 12. November", c))
    b.append(badge(X2 + 70 + tw("Neuigkeiten", 15, 700) + 10, 188 + 20, "NEU", c, "accent")[0])
    b.append(k.hub_card(X1, 268, W, k.I_SHIELD, "Datenschutz", "Keine Konten, kein Tracking", c) + k.hub_card(X2, 268, W, k.I_KEYS, "Tastenkürzel", "⌘K, T, ←, →, N …", c))
    b.append(label(X1, 380, "Einstellungen", c) + T(X1 + 124, 380, "so soll ORBook bei dir sein", 12, 400, c["faint"]))
    cards = [(k.I_KURSE, "Meine Kurse", "7 von 8 Kursen"), (k.I_DARST, "Darstellung", "Hell · Start mit Woche"), (k.I_FARBEN, "Fachfarben", "8 Fächer"),
             (k.I_MITT, "Mitteilungen", "3 von 4 an"), (k.I_SYNC, "Notizen-Sync", "K7QM-… · heute 07:40"), (k.I_KEY, "Editor-Code", "nicht freigeschaltet")]
    for i, (ic, t_, s_) in enumerate(cards):
        b.append(k.hub_card(X1 if i % 2 == 0 else X2, 392 + (i // 2) * 80, W, ic, t_, s_, c))
    b.append(T(558, 664, "ORBook 1.0 · Teil von ORBitium", 12.5, 400, c["faint"]) + T(1238, 664, "Admin", 12.5, 400, c["faint"], "end"))
    return page(1440, 900, c, "".join(b))

def p_pc_fenster(c, theme, sub):
    inner, w, h = g.base("05 Woche · Stunden + gewählter Tag", theme, "PC")
    ver, date, gr = ENTRIES[0]
    X, W, H = 380, 680, 600
    Y = (900 - H) / 2
    win = "".join(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else "") for f in ("nsh0", "nsh1", None))
    b = [inner, g.overlay(c, 1440, 900), win, g.modal_head(X, Y, W, f"Version {ver} · {date[:-5]}", "Was ist neu", c)]
    body, _ = groups(X + 26, Y + 112, 330, c, gr, size=14, lh=20.5)
    b.append(body)
    b.append(illu(X + 392, Y + 106, 262, 120, c, sub, True))
    b.append(T(X + 392, Y + 248, "Gestrichelt = ein Kurs,", 12, 400, c["faint"]) + T(X + 392, Y + 266, "den du nicht hast.", 12, 400, c["faint"]))
    b.append(f'<line x1="{X}" y1="{Y + H - 82}" x2="{X + W}" y2="{Y + H - 82}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(X + 26, Y + H - 66, 190, "Alle Neuigkeiten", c, "sand", None) + button(X + W - 26 - 200, Y + H - 66, 200, "Verstanden", c))
    return g.svg(1440, 900, c, "".join(b))

def p_pc_liste(c, theme, sub):
    k.SUBNAV[0][1][:] = [("Statistik", k.BARS), ("Neuigkeiten", SPARK), ("Datenschutz", k.I_SHIELD)]
    inner = k.pc_base("22 Einstellungen · Übersicht", theme)
    b = [inner, R(250, 0, 1190, 900, 0, c["paper"]), k.pc_sidebar(inner, c, True)]
    b.append(eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38))
    b.append(k.pc_subnav(c, "Neuigkeiten"))
    b.append(T(558, 132, "Neuigkeiten", 26, 900, c["ink"], ls=-0.39))
    b.append(T(558, 156, "Was sich geändert hat. Das Neueste steht oben.", 13.5, 400, c["muted"]))
    y = 176
    for i, e in enumerate(ENTRIES):
        card, h = entry_card(558, y, 680, c, e, i == 0, sub, newest=i == 0, pc=True)
        b.append(card); y += h + 10
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-mehr": p_mehr,
    "handy-02-fenster": p_fenster,
    "handy-03-liste": p_liste,
    "handy-04-liste-aeltere": lambda c, t, s: p_liste(c, t, s, 1),
    "pc-01-mehr": p_pc_mehr,
    "pc-02-fenster": p_pc_fenster,
    "pc-03-liste": p_pc_liste,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
