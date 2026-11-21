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
