# Макеты части 37 «Noten als PDF»:
#   • кнопка «PDF» в шапке «Noten» и «Fehlzeiten» (телефон — круглая, ПК — с подписью);
#   • лист A4 (бумага всегда светлая): полугодие (оценки + пропуски), Zeugnis (Endnoten), только Fehlzeiten;
#   • старое Android-приложение без печати — тост «App aktualisieren».
# Экраны — из части 36 (gen.py там же), лист — по образцу листов A4 части 25.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g36", os.path.join(HERE, "..", "36-noten", "gen.py"))
N = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(N)
St, T, S, R, ICON, P, HL, DOT, g = N.St, N.T, N.S, N.R, N.ICON, N.P, N.HL, N.DOT, N.g
GR, ORDER, NAMES, FZ, fmt, avg, val, gcol = N.GR, N.ORDER, N.NAMES, N.FZ, N.fmt, N.avg, N.val, N.gcol

PDF = P("M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z") + P("M14 3v5h5M12 11v6M9 14l3 3 3-3")
ALERT = N.ALERT

def add(svg, extra):
    i = svg.rindex("</svg>")
    return svg[:i] + extra + svg[i:]

def height(svg): return int(float(svg.split('height="', 1)[1].split('"')[0]))

# ════════════════ Телефон ════════════════
def p_noten(st):
    return add(N.p_noten(st), st.rbtn(286, 33.31, PDF))

def p_fehlzeiten(st):
    return add(N.p_fehlzeiten(st), st.rbtn(334, 33.31, PDF))

def p_app_alt(st):
    """Android-App старой версии: печати в ней нет — коротко сказать, что делать."""
    c = st.c
    s = p_noten(st)
    H = height(s)
    return add(s, R(18, H - 140, 354, 46, 16, c["toastbg"]) + ICON(32, H - 125, 0.67, c["toastfg"], ALERT)
               + T(58, H - 112, "Für PDF bitte die App aktualisieren", 13.5, 600, c["toastfg"]))


# ════════════════ Шторка «Als PDF»: своё или оригинал InfoPoint ════════════════
CHECK = g.CHECK
SPIN = P("M12 3a9 9 0 1 0 9 9")

def mini(x, y, kind, c):
    """Маленькая страница: ORBook — фиолетовый заголовок и плашки; оригинал — таблицы в линию."""
    w, h = 40, 56
    out = [R(x, y, w, h, 5, "#FFFFFF", c["rule"], 1)]
    if kind == "orbook":
        out.append(R(x + 6, y + 7, 18, 3.5, 1.5, "#2A2433") + R(x + 6, y + 13, 24, 3.5, 1.5, "#6C4DF6"))
        for i in range(4):
            out.append(R(x + 6 + i * 7.2, y + 21, 6, 6, 1.5, "#F3EDE5"))
        for i in range(4):
            out.append(R(x + 6, y + 31 + i * 5.5, 20, 2.5, 1, "#C0B8C6") + R(x + 29, y + 30.5 + i * 5.5, 5, 3.5, 1, "#E3F5EC"))
    else:
        out.append(R(x + 6, y + 7, 22, 3.5, 1, "#2A2433"))
        rows = 7 if kind == "kompakt" else 4
        top = y + 14
        out.append(R(x + 6, top, 28, rows * 4.6, 0, "none", "#2A2433", 0.6))
        for i in range(1, rows):
            out.append(f'<line x1="{x + 6}" y1="{top + i * 4.6}" x2="{x + 34}" y2="{top + i * 4.6}" stroke="#2A2433" stroke-width="0.4"/>')
        if kind == "detail":
            out.append(R(x + 6, top + 24, 28, 12, 0, "none", "#2A2433", 0.6))
        else:
            out.append(f'<line x1="{x + 20}" y1="{top}" x2="{x + 20}" y2="{top + rows * 4.6}" stroke="#2A2433" stroke-width="0.4"/>')
    return "".join(out)

def choice(st, x, y, w, kind, ttl, sub, on, first=False):
    c = st.c
    out = []
    if not first: out.append(HL(x + 14, x + w - 14, y, c))
    out.append(mini(x + 14, y + 12, kind, c) + T(x + 68, y + 36, ttl, 15, 800, c["ink"]) + T(x + 68, y + 55, sub, 12.5, 400, c["faint"]))
    if on: out.append(DOT(x + w - 30, y + 40, 12, c["accent"]) + ICON(x + w - 38, y + 32, 0.67, c["on"], CHECK, 2.6))
    else: out.append(f'<circle cx="{x + w - 30}" cy="{y + 40}" r="11" fill="none" stroke="{c["faint2"]}" stroke-width="1.6"/>')
    return "".join(out)

def p_auswahl(st, pick=0, busy=False):
    c = st.c
    s = p_noten(st)
    H = height(s)
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    top = H - 470
    b = [inner, g.overlay(c, 390, H), N.m.sheet(st, top, "Noten · 1. Halbjahr", "Als PDF", H=H)]
    y = top + 96
    rows = [("orbook", "ORBook-Blatt", "Noten und Fehlzeiten · 1 Seite"),
            ("kompakt", "Original · Übersicht", "aus InfoPoint · Zusammenfassung"),
            ("detail", "Original · Alle Noten", "aus InfoPoint · Detailansicht")]
    b.append(st.card(18, y, 354, 80 * 3))
    for i, (k, t1, t2) in enumerate(rows):
        b.append(choice(st, 18, y + i * 80, 354, k, t1, t2, i == pick, i == 0))
    y = H - 76 - 20
    if busy:
        b.append(R(18, y, 354, 48, 24, c["accent"], None) + f'<g opacity="0.75">' + ICON(124, y + 16, 0.67, c["on"], SPIN, 2.4)
                 + T(150, y + 29, "Hole Original …", 14.5, 700, c["on"]) + "</g>")
    else:
        b.append(st.button(18, y, 354, "Als PDF", "primary", PDF))
    return st.page(390, H, "".join(b))


# ════════════════ v2 (владелец 21.11): окно «Als PDF» с превью, вариантами и «Herunterladen» ════════════════
DOWNLOAD = P("M12 4v11M7 10l5 5 5-5M5 20h14")
PRINT = P("M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2") + '<rect x="7" y="14" width="10" height="7" rx="1"/>'
VARIANTS = [("orbook", "1. Halbjahr", "Noten und Fehlzeiten"), ("orbook", "2. Halbjahr", "Noten und Fehlzeiten"),
            ("orbook", "Schuljahr", "beide Halbjahre"), ("orbook", "Zeugnis", "Endnoten"), ("orbook", "Fehlzeiten", "nur Fehlzeiten"),
            ("original", "Übersicht", "Zusammenfassung · 1 Seite"), ("original", "Alle Noten", "Detailansicht · 3 Seiten")]

def embed(svg, x, y, w):
    """Готовый лист A4 (794×1123) внутрь макета, уменьшенный до ширины w."""
    inner = svg[svg.index(">", svg.index("<svg")) + 1:svg.rindex("</svg>")]
    h = w * A4H / A4W
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h:.1f}" viewBox="0 0 {A4W} {A4H}">{inner}</svg>', h

def original_page(st):
    """Похоже на печать InfoPoint «Zusammenfassung»: чёрные таблицы, Arial-подобный текст."""
    ink, grey = "#111111", "#EEEEEE"
    b = [R(0, 0, A4W, A4H, 0, "#FFFFFF"), T(40, 70, "Herzlich Willkommen", 30, 700, ink)]
    def table(y, rows, cols, head=False):
        out = []
        widths = cols
        for r_i, row in enumerate(rows):
            x = 40
            for c_i, (cell, w) in enumerate(zip(row, widths)):
                fill = grey if (head and r_i == 0) or (c_i == 0 and not head) else "#FFFFFF"
                out.append(R(x, y + r_i * 30, w, 30, 0, fill, ink, 1) + T(x + 8, y + r_i * 30 + 20, cell, 14, 700 if head and r_i == 0 else 400, ink))
                x += w
        return "".join(out)
    b.append(table(96, [["Name:", "Max Muster"], ["Klasse:", "8a"]], [160, 554]))
    b.append(T(40, 200, "Zensurenübersicht (Kompakt)", 24, 700, ink) + f'<line x1="40" y1="212" x2="754" y2="212" stroke="#999"/>')
    rows = [["Fach", "Zensuren", "", "", "", "1.Hj", "2.Hj"], ["Deutsch", "1", "3", "", "", "2", ""], ["Mathematik", "2", "2-", "1+", "m.E.", "", ""],
            ["Englisch", "1", "1", "", "", "", ""], ["Physik", "3", "", "", "", "", ""], ["Biologie", "5", "", "", "", "", ""], ["Wahlpflichtfach", "", "", "", "", "", ""]]
    b.append(table(228, rows, [250, 90, 90, 90, 90, 52, 52], head=True))
    b.append(T(40, 476, "Fehlzeiten (Kompakt)", 24, 700, ink) + f'<line x1="40" y1="488" x2="754" y2="488" stroke="#999"/>')
    b.append(table(504, [["Fehltage", "2"], ["Unentschuldigte Fehltage", "1"], ["Fehlstunden", "2 Stunden"], ["Unentschuldigte Fehlstunden", "0 Stunden"]], [300, 414]))
    b.append(T(40, 680, "Letzte Aktualisierung: Montag, 16. November 2026", 15, 400, ink))
    return st.page(A4W, A4H, "".join(b))

def var_row(st, x, y, w, ttl, sub, on, h=50):
    c = st.c
    out = [R(x, y, w, h, 16, c["tint"] if on else c["card"])]
    if on: out.append(R(x + .5, y + .5, w - 1, h - 1, 15.5, "none", c["accent"], 1.5))
    out.append(T(x + 16, y + 22, ttl, 14.5, 800, c["accink"] if on else c["ink"]) + T(x + 16, y + 39, sub, 12, 400, c["muted"] if on else c["faint"]))
    if on: out.append(DOT(x + w - 26, y + h / 2, 11, c["accent"]) + ICON(x + w - 33.5, y + h / 2 - 7.5, 0.62, c["on"], CHECK, 2.6))
    return "".join(out)

def chip(st, x, y, text, on):
    c = st.c
    w = g.tw(text, 13.5, 800) * 0.92 + 30
    if on: out = R(x, y, w, 36, 18, c["accent"]) + T(x + w / 2, y + 23, text, 13.5, 800, c["on"], "middle")
    else: out = R(x, y, w, 36, 18, c["card"]) + R(x + .5, y + .5, w - 1, 35, 17.5, "none", c["rule"], 1) + T(x + w / 2, y + 23, text, 13.5, 700, c["ink"], "middle")
    return out, w

def preview(st, x, y, w, h, kind, light):
    """Песочная панель с листом. kind: halbjahr | original | laden."""
    c = st.c
    out = [R(x, y, w, h, 22, c["sand"])]
    pw = (h - 56) * A4W / A4H
    px = x + (w - pw) / 2
    if kind == "laden":
        k = c["skel"]
        ph = h - 56
        out.append(R(px, y + 16, pw, ph, 4, c["card"]))
        for i in range(9):
            out.append(R(px + pw * .08, y + 16 + ph * (.08 + i * .09), pw * (.84 if i % 3 else .5), ph * .03, 3, k))
        out.append(T(x + w / 2, y + h - 16, "Hole Original …", 12.5, 700, c["muted"], "middle"))
        return "".join(out)
    sheet = a4_halbjahr(light) if kind == "halbjahr" else original_page(light)
    svg_, ph = embed(sheet, px, y + 16, pw)
    out.append(R(px - 1, y + 15, pw + 2, ph + 2, 3, c["rule"]) + svg_)
    pages = "Seite 1 von 1" if kind == "halbjahr" else "Seite 1 von 1"
    out.append(T(x + w / 2, y + h - 16, pages, 12.5, 700, c["muted"], "middle"))
    return "".join(out)

def p_vorschau(st, pick=0, state=None):
    """Телефон: шторка почти на весь экран — превью, варианты кнопками, «Drucken» и «Herunterladen»."""
    c = st.c
    s = N.p_noten(st)
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    top = 48
    b = [inner[:inner.index('<rect x="16" y=')] if False else inner, g.overlay(c, 390, 844 + 200), N.m.sheet(st, top, "Noten · Klasse 9b", "Als PDF", H=844)]
    light = St("soft", "hell")
    kind = "laden" if state == "laden" else ("original" if pick >= 5 else "halbjahr")
    b.append(preview(st, 18, top + 92, 354, 330, kind, light))
    y = top + 92 + 330 + 26
    b.append(N.label(18, y, "ORBook", c)); y += 12
    x = 18
    for i, (_, ttl, _) in enumerate(VARIANTS[:5]):
        ch, w = chip(st, x, y, ttl, i == pick)
        if x + w > 372: x, y = 18, y + 44; ch, w = chip(st, x, y, ttl, i == pick)
        b.append(ch); x += w + 8
    y += 36 + 24
    b.append(N.label(18, y, "Original aus InfoPoint", c)); y += 12
    x = 18
    for i, (_, ttl, _) in enumerate(VARIANTS[5:], start=5):
        ch, w = chip(st, x, y, ttl, i == pick); b.append(ch); x += w + 8
    by = 844 - 76
    b.append(st.button(18, by, 150, "Drucken", "sand", PRINT) + st.button(178, by, 194, "Herunterladen", "primary", DOWNLOAD))
    if state == "gespeichert":
        b.append(R(18, by - 62, 354, 46, 16, c["toastbg"]) + ICON(32, by - 47, 0.67, c["toastfg"], CHECK, 2.4)
                 + T(58, by - 34, "Gespeichert: Noten-1-Halbjahr-2026-27.pdf", 13, 600, c["toastfg"]))
    return st.page(390, 844, "".join(b))

def pc_vorschau(st, pick=0):
    c = st.c
    s = N.pc_noten(st)
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    X, Y, W, H = 280, 50, 880, 800
    b = [inner, g.overlay(c, 1440, 900), R(X, Y, W, H, 30, c["paper"])]
    b.append(N.eyebrow(X + 28, Y + 38, "Noten · Klasse 9b", c) + N.title(X + 28, Y + 72, "Als PDF", c) + st.rbtn(X + W - 66, Y + 24, N.m.CLOSE if hasattr(N.m, "CLOSE") else g.CLOSE, size=40))
    y = Y + 104
    b.append(N.label(X + 28, y, "ORBook", c)); y += 12
    for i, (_, ttl, sub) in enumerate(VARIANTS):
        if i == 5:
            y += 18; b.append(N.label(X + 28, y, "Original aus InfoPoint", c)); y += 12
        b.append(var_row(st, X + 28, y, 300, ttl, sub, i == pick)); y += 58
    light = St("soft", "hell")
    kind = "original" if pick >= 5 else "halbjahr"
    b.append(preview(st, X + 352, Y + 96, W - 380, 610, kind, light))
    fy = Y + H - 72
    b.append(HL(X + 28, X + W - 28, fy - 16, c))
    name = "Noten-1-Halbjahr-2026-27.pdf" if kind == "halbjahr" else "InfoPoint-Uebersicht-2026-11-16.pdf"
    b.append(T(X + 28, fy + 29, name, 13, 600, c["faint"]))
    b.append(st.button(X + W - 28 - 200 - 12 - 140, fy + 4, 140, "Drucken", "sand", PRINT) + st.button(X + W - 28 - 200, fy + 4, 200, "Herunterladen", "primary", DOWNLOAD))
    return st.page(1440, 900, "".join(b))

# ════════════════ ПК ════════════════
def pc_noten(st):
    return add(N.pc_noten(st), st.button(918, 44, 126, "Als PDF", "sand", PDF, h=36))

# ════════════════ A4 (бумага всегда светлая) ════════════════
A4W, A4H = 794, 1123
X0, X1 = 64, 730
LOGO = lambda x, y, k: (f'<g transform="translate({x} {y}) scale({k})" fill="none">'
                        f'<ellipse cx="38" cy="38" rx="33" ry="13.5" stroke="#6C4DF6" stroke-width="5" transform="rotate(-28 38 38)"/>'
                        f'<circle cx="38" cy="38" r="11" fill="#2A2433"/><circle cx="64" cy="25" r="5.5" fill="#6C4DF6"/></g>')

def a4(st, ttl, sub, stand, body, foot_left, made="17.09.2026"):
    c = st.c
    b = [R(0, 0, A4W, A4H, 0, "#FFFFFF"), LOGO(X0, 56, 0.6), T(118, 88, "ORBook", 26, 900, c["ink"]),
         T(X1, 88, "Klasse 9b · Petrischule", 15, 700, c["faint"], "end"),
         T(X0, 164, ttl, 40, 900, c["ink"], ls=-0.6), T(X0, 210, sub, 40, 900, c["accent"], ls=-0.6),
         T(X0, 244, stand, 15, 400, c["muted"]), body,
         f'<line x1="{X0}" y1="1012" x2="{X1}" y2="1012" stroke="{c["rule"]}"/>',
         T(X0, 1044, foot_left, 13, 400, c["muted"]),
         T(X0, 1066, f"Erstellt am {made}", 13, 400, c["muted"]) + T(X1, 1066, "Teil von ORBitium", 13, 700, c["faint"], "end")]
    return st.page(A4W, A4H, "".join(b))

def tiles(st, y, items, h=88):
    """Плитки-итоги в ряд: (подпись, число, строка под числом, красная ли строка)."""
    c = st.c
    gap = 12
    tw = (X1 - X0 - gap * (len(items) - 1)) / len(items)
    out = []
    for i, (cap, num, small, bad) in enumerate(items):
        x = X0 + i * (tw + gap)
        out.append(R(x, y, tw, h, 20, c["sand"]) + T(x + 16, y + 26, cap.upper(), 10.5, 800, c["faint"], ls=0.5)
                   + T(x + 16, y + 62, num, 28, 900, c["ink"], ls=-0.4))
        if small: out.append(T(x + 16 + g.tw(num, 28, 900) * 0.98 + 8, y + 61, small, 12.5, 700, c["danger"] if bad else c["muted"]))
    return "".join(out)

def subj(st, x, y, code):
    return st.cell(x, y, 32, 32, code, r=10) + T(x + 16, y + 20.5, code, 11 if len(code) < 3 else 10, 900, st.ctext(code), "middle")

def gpill(st, x, y, text, v, w=56, h=32, size=15):
    bg, fg = gcol(st, v) if v is not None else (st.c["sand"], st.c["faint"])
    return R(x, y, w, h, 11, bg) + T(x + w / 2, y + h / 2 + size * 0.36, text, size, 900, fg, "middle")

def a4_halbjahr(st):
    c = st.c
    total = sum(avg(k) for k in ORDER) / len(ORDER)
    b = [tiles(st, 276, [("Schnitt", fmt(total), "", False), ("Noten", str(sum(len(GR[k]) for k in ORDER)), f"in {len(ORDER)} Fächern", False),
                         ("Fehltage", "2", "1 unentsch.", True), ("Fehlstunden", "16", "", False)])]
    y = 404
    b.append(T(X0, y, "Fach", 12.5, 800, c["faint"]) + T(270, y, "Einzelnoten", 12.5, 800, c["faint"]) + T(X1, y, "Schnitt", 12.5, 800, c["faint"], "end"))
    y += 12
    rh = 54
    for i, k in enumerate(ORDER):
        ry = y + i * rh
        b.append(HL(X0, X1, ry, c) + subj(st, X0, ry + 11, k) + T(X0 + 44, ry + 32, NAMES[k], 15, 800, c["ink"]))
        gx = 270
        for d, mo, wd, what, wt, z in GR[k]:
            b.append(R(gx, ry + 8, 68, 38, 11, c["sand"]) + T(gx + 12, ry + 26, z, 15, 900, c["ink"])
                     + T(gx + 12, ry + 40, f"{d}.{mo}.", 10, 600, c["faint"]))
            if wt > 1: b.append(T(gx + 60, ry + 25, f"×{wt}", 10.5, 800, c["accink"], "end"))
            gx += 76
        b.append(gpill(st, X1 - 56, ry + 11, fmt(avg(k)), avg(k)))
    y += rh * len(ORDER)
    b.append(HL(X0, X1, y, c))
    y += 44
    b.append(T(X0, y, "Fehlzeiten", 20, 900, c["ink"]))
    y += 14
    for i, (d, mo, wd, what, sub, ok) in enumerate(FZ):
        ry = y + i * 30
        b.append(T(X0, ry + 20, f"{wd.capitalize()} {d}.{mo}.", 14, 800, c["ink"]) + T(170, ry + 20, f"{what} · {sub}", 14, 400, c["muted"])
                 + T(X1, ry + 20, "entschuldigt" if ok else "unentschuldigt", 13, 800, c["ok"] if ok else c["danger"], "end"))
        if i: b.append(HL(X0, X1, ry, c))
    return a4(st, "Noten", "1. Halbjahr 2026/27", "Stand 16.09.2026 · aus Home.InfoPoint", "".join(b),
              "Schnitt: von ORBook aus den Einzelnoten berechnet, keine Zeugnisnote.")

ZEUGNIS = {"Ma": "2", "De": "2", "En": "1", "Ph": "3", "Ge": "1", "Bio": "3", "Ku": "2"}

def a4_zeugnis(st):
    c = st.c
    b = [tiles(st, 276, [("Fehltage", "3", "1 unentsch.", True), ("Fehlstunden", "18", "", False)])]
    y = 404
    b.append(T(X0, y, "Fach", 12.5, 800, c["faint"]) + T(560, y, "1. Halbjahr", 12.5, 800, c["faint"], "middle") + T(690, y, "2. Halbjahr", 12.5, 800, c["faint"], "middle"))
    y += 12
    rh = 56
    for i, k in enumerate(ORDER):
        ry = y + i * rh
        z = ZEUGNIS[k]
        b.append(HL(X0, X1, ry, c) + subj(st, X0, ry + 12, k) + T(X0 + 44, ry + 33, NAMES[k], 15, 800, c["ink"]))
        b.append(gpill(st, 532, ry + 12, z, val(z)) + gpill(st, 662, ry + 12, "–", None))
    b.append(HL(X0, X1, y + rh * len(ORDER), c))
    return a4(st, "Zeugnis", "Schuljahr 2026/27", "Endnoten aus Home.InfoPoint · Stand 06.02.2027", "".join(b),
              "Endnoten setzt die Schule.", "07.02.2027")

GRUND = ["Krankheit", "Arzttermin", "–", "Krankheit"]

def a4_fehlzeiten(st):
    c = st.c
    b = [tiles(st, 276, [("Fehltage", "2", "", False), ("Fehlstunden", "16", "", False), ("Unentschuldigt", "1", "", False)])]
    y = 404
    b.append(T(X0, y, "Datum", 12.5, 800, c["faint"]) + T(200, y, "Fehlzeit", 12.5, 800, c["faint"]) + T(440, y, "Grund", 12.5, 800, c["faint"])
             + T(X1, y, "Status", 12.5, 800, c["faint"], "end"))
    y += 12
    rh = 48
    for i, (d, mo, wd, what, sub, ok) in enumerate(FZ):
        ry = y + i * rh
        txt = "entschuldigt" if ok else "unentschuldigt"
        pw = g.tw(txt, 12, 800) * 0.9 + 20
        b.append(HL(X0, X1, ry, c) + T(X0, ry + 30, f"{wd.capitalize()} {d}.{mo}.2026", 14.5, 800, c["ink"])
                 + T(200, ry + 30, S(what, 700, c["ink"]) + S(f"  {sub}", 400, c["muted"]), 14.5, 400, c["ink"], raw=True)
                 + T(440, ry + 30, GRUND[i], 14.5, 400, c["muted"])
                 + R(X1 - pw, ry + 13, pw, 24, 12, c["oktint"] if ok else c["dtint"]) + T(X1 - pw / 2, ry + 29.5, txt, 12, 800, c["ok"] if ok else c["danger"], "middle"))
    b.append(HL(X0, X1, y + rh * len(FZ), c))
    return a4(st, "Fehlzeiten", "1. Halbjahr 2026/27", "Stand 16.09.2026 · aus Home.InfoPoint", "".join(b), "")

SCREENS = {   # имя: (функция, темы); лист A4 — только светлый
    "handy-01-noten": (p_noten, ("hell", "dunkel")),
    "handy-02-fehlzeiten": (p_fehlzeiten, ("hell", "dunkel")),
    "handy-03-app-alt": (p_app_alt, ("hell",)),
    "handy-04-auswahl": (lambda st: p_auswahl(st, 1), ("hell", "dunkel")),
    "handy-05-original-laden": (lambda st: p_auswahl(st, 1, busy=True), ("hell",)),
    "pc-01-noten": (pc_noten, ("hell", "dunkel")),
    "handy-06-vorschau": (p_vorschau, ("hell", "dunkel")),
    "handy-07-original-laden": (lambda st: p_vorschau(st, 5, "laden"), ("hell",)),
    "handy-08-gespeichert": (lambda st: p_vorschau(st, 0, "gespeichert"), ("hell",)),
    "pc-02-vorschau": (pc_vorschau, ("hell", "dunkel")),
    "pc-03-original": (lambda st: pc_vorschau(st, 5), ("hell",)),
    "a4-01-halbjahr": (a4_halbjahr, ("hell",)),
    "a4-02-zeugnis": (a4_zeugnis, ("hell",)),
    "a4-03-fehlzeiten": (a4_fehlzeiten, ("hell",)),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            path = os.path.join(OUT, f"{name}-{theme}.svg")
            open(path, "w", encoding="utf-8").write(fn(St("soft", theme)))
            os.system(f'rsvg-convert -w {780 if name.startswith("handy") else 1440 if name.startswith("pc") else 794} "{path}" -o "{path[:-4]}.png"')
            n += 1
    print(n, "files")
