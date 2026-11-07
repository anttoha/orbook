# Генератор макетов части 19 «Muster-Stundenplan» — будущие недели по обычному расписанию.
# Помощники и цвета — из генераторов частей 14/15/18 (те же токены Soft).
# Основа — оригиналы ORBook Soft: 04 «Woche», 05 «Tag · Liste», 07 «Stunde · Details», 11 «Woche wählen»,
# 16 «Klausur eintragen», 33 «Neuer Plan da», 38 «Toasts», PC 05 «Woche», PC 08 «Stunde · Details», PC 12 «Woche wählen».
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g18", os.path.join(HERE, "..", "18-termine", "gen.py"))
m18 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m18)
g, m15 = m18.g, m18.m15
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, note_box, svg, overlay, base, badge = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.note_box, g.svg, g.overlay, g.base, g.badge)
CHECK, CHEV_R, BACK, CLOSE, PEN, SHARE, CAL, USER = g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.PEN, g.SHARE, g.CAL, g.USER
toast, sheet_bg, INFO, WARN, FILE = m15.toast, m15.sheet_bg, m15.INFO, m15.WARN, m15.FILE
shifted, field, fit = m18.shifted, m18.field, m18.fit
NAMES = g.NAMES

FLAG = P("M5 21V4h12l-2 4 2 4H5")
LAYERS = P("M12 3l9 5-9 5-9-5z") + P("M3 13l9 5 9-5")          # «Muster» — стопка листов: так обычно идёт неделя
BELL = P("M6 16V11a6 6 0 0 1 12 0v5l2 2H4z") + P("M10 21h4")
ARROW = P("M5 12h14M13 6l6 6-6 6")
REFRESH = P("M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5")

# ── Штриховка «Muster» ──
# mh — светлые полосы поверх цвета предмета (клетки и строки уроков); mr — тонкие полосы на фоне (календарь, легенда).
def defs(c):
    return (f'<pattern id="mh" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
            f'<rect x="0" y="0" width="3" height="8" fill="{c["paper"]}" fill-opacity="{0.55 if c is g.LIGHT else 0.38}"/></pattern>'
            f'<pattern id="mr" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
            f'<rect x="0" y="0" width="1.6" height="7" fill="{c["faint2"]}" fill-opacity="0.8"/></pattern>')

def page(w, h, c, body):
    return svg(w, h, c, body, defs(c))

# ── Данные: Muster «Woche B» (сегодня — Mi, 17. Sept, как в оригиналах; KW 41 = 6.–10. Okt) ──
TEACH = {"De": "Web", "Ma": "Mü", "En": "Sch", "Ph": "Ric", "Ge": "Bau", "Sp": "Hen", "Bio": "Kra", "Ku": "Lau"}
ROOM = {"De": "102", "Ma": "108", "En": "210", "Ph": "301", "Ge": "108", "Sp": "Halle", "Bio": "305", "Ku": "012"}
TIMES = [("07:30", "08:15"), ("08:20", "09:05"), ("09:25", "10:10"), ("10:30", "11:15"), ("11:35", "12:20"), ("12:25", "13:10")]
MUSTER = [  # Mo … Fr, Stunden 1–6
    ["De", "Ma", "En", "Sp", "Ge", None],
    ["Ma", "Ph", "De", "En", "Ku", None],
    ["De", "Ma", "En", "Ph", "Ge", "Sp"],
    ["De", "Ma", "Ph", "Ge", "Sp", "En"],
    ["Ma", "En", "De", "Bio", "Ge", "Ku"],
]
KW41 = [("MO", "6"), ("DI", "7"), ("MI", "8"), ("DO", "9"), ("FR", "10")]
COLS = [44, 110.8, 177.59, 244.39, 311.19]   # Spalten wie in 04 «Woche»
CW = 62.8

# ════════════════ Bausteine ════════════════
def flag_corner(x, y, w, c):
    """Ecke mit Fähnchen wie in 04 (Klausur in dieser Stunde)."""
    return (f'<path d="M{x + w - 19.02},{y + 1} H{x + w - 1} V{y + 19} H{x + w - 13} A6,6 0 0 1 {x + w - 19.02},{y + 13} Z" fill="{c["accent"]}"/>'
            + ICON(x + w - 15, y + 5, 0.42, c["on"], FLAG, 2.6))

def cell(x, y, code, c, sub, muster=True, flag=None, w=CW, h=52):
    """Stunde in der Wochentabelle: Muster = gleiche Farbe, aber schraffiert."""
    if code is None:
        return f'<g opacity="0.6">{R(x, y, w, h, 14, c["sand"])}</g>'
    solid, tint, text = sub[code]
    out = [R(x, y, w, h, 14, tint)]
    if muster: out.append(R(x, y, w, h, 14, "url(#mh)"))
    out.append(T(x + 8, y + 20, code, 12.5, 900, text))
    if flag:
        out.append(flag_corner(x, y, w, c))
        out.append(T(x + 8, y + 42, flag, 8.5, 800, c["accink"], ls=0.26))
    else:
        out.append(f'<g opacity="0.85">{T(x + 8, y + 42, ROOM[code], 9.5, 600, text)}</g>')
    return "".join(out)

def period_labels(y0, c, step=56, n=6):
    out = []
    for i in range(n):
        y = y0 + i * step
        out.append(T(27, y + 24, str(i + 1), 12.5, 700, c["ink"], "middle") + T(27, y + 38, TIMES[i][0], 8.5, 400, c["faint"], "middle"))
    return "".join(out)

def day_head(col, wd, d, c, sel=False, hatch=False, y=85.31):
    x = COLS[col]
    out = []
    if sel: out.append(R(x, y, CW, 42, 14, c["accent"]))
    if hatch: out.append(R(x, y, CW, 42, 14, "url(#mr)"))
    out.append(T(x + CW / 2, y + 14.5, wd, 10, 700, c["sub"] if sel else c["faint"], "middle", 0.8))
    out.append(T(x + CW / 2, y + 34.5, d, 18, 900, c["on"] if sel else c["ink"], "middle", -0.27))
    return "".join(out)

def muster_box(x, y, w, c, lines, chevron=False, h=59.69):
    """Hinweis «Muster» — wie «Info zum Tag», aber in Tint mit Stapel-Icon."""
    out = [R(x, y, w, h, 16, c["tint"]), ICON(x + 13, y + 12, 0.67, c["accink"], LAYERS)]
    for i, ln in enumerate(lines):
        out.append(T(x + 39, y + 24 + i * 18.85, ln, 13, 400, c["muted"], raw=True))
    if chevron: out.append(ICON(x + w - 28, y + h / 2 - 8, 0.67, c["faint2"], CHEV_R))
    return "".join(out)

def card_rows(x, y, w, rows, c):
    """Karte unter der Woche wie in 04: Icon, Titel, graue Unterzeile, rechts Text und ›."""
    hh = [68.88 if r[2] else 52.5 for r in rows]
    out = [R(x, y, w, sum(hh), 22, c["card"])]
    ry = y
    for i, (icon, ttl, subl, right, accent) in enumerate(rows):
        if i: out.append(f'<line x1="{x + 14}" y1="{ry}" x2="{x + w - 14}" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        if subl:
            out.append(ICON(x + 14, ry + 25.69, 0.79, c["accink"] if accent else c["muted"], icon, 1.9))
            out.append(T(x + 45, ry + 23, ttl, 14.5, 500, c["ink"]) + T(x + 45, ry + 42, subl, 12, 400, c["faint"]))
            if right: out.append(T(x + w - 38, ry + 39.19, right, 13, 400, c["faint"], "end"))
            out.append(ICON(x + w - 30, ry + 27.19, 0.67, c["faint2"], CHEV_R))
        else:
            out.append(ICON(x + 14, ry + 16, 0.79, c["accink"] if accent else c["muted"], icon, 1.9) + T(x + 45, ry + 30.5, ttl, 14.5, 500, c["ink"]))
            if right: out.append(T(x + w - 38, ry + 30, right, 13, 400, c["faint"], "end"))
            out.append(ICON(x + w - 30, ry + 17.5, 0.67, c["faint2"], CHEV_R))
        ry += hh[i]
    return "".join(out), sum(hh)

def extra_line(x, y, icon, text, color, c, bold=None):
    t = (S(bold, 800, color) + S(text, 400, color)) if bold else g.esc(text)
    return ICON(x, y - 10.4, 0.54, color, icon, 2.2) + T(x + 19, y, t, 12, 400, color, raw=True)

def lesson_row(y, p, code, c, sub, muster=True, extras=(), state=None, w=354, x=18, info=None):
    """Zeile in «Tag · Liste» (05). state: None | 'aus' (fällt aus) | 'vertretung'. extras: Zeilen unter Lehrer · Raum."""
    solid, tint, text = sub[code]
    lines = list(extras) + ([info] if info else [])
    h = 64 if not lines else 64 + 19.19 * len(lines)
    out = []
    if state == "aus":
        out.append(R(x, y, w, h, 20, c["sand"]))
    elif state == "vertretung":
        out.append(R(x - 2, y - 2, w + 4, h + 4, 22, c["accent"]) + R(x, y, w, h, 20, tint))
    else:
        out.append(R(x, y, w, h, 20, tint))
        if muster: out.append(R(x, y, w, h, 20, "url(#mh)"))
    a, b = TIMES[p - 1]
    out.append(T(x + 14, y + 26, a, 13, 700, c["ink"]) + T(x + 14, y + 43, b, 11, 400, c["faint"]))
    name = NAMES[code]
    if state == "aus":
        out.append(T(x + 68, y + 27, name, 15, 800, c["faint"]) + R(x + 68, y + 22.5, g.tw(name, 15, 800) * 0.93, 1, 0, c["faint"]))
        bw = 70.75
        out.append(R(x + w - 14.5 - bw, y + 13, bw, 18, 9, "none", c["faint2"], 1, ' stroke-dasharray="3 2"')
                   + T(x + w - 14.5 - bw + 7.5, y + 25.5, "FÄLLT AUS", 9.5, 800, c["muted"], ls=0.57))
        out.append(T(x + 68, y + 48, TEACH[code], 12.5, 400, c["muted"]))
    else:
        out.append(T(x + 68, y + 27, name, 15, 800, text))
        if state == "vertretung":
            bd, bw = badge(0, 0, "VERTRETUNG", c, "tint")
            out.append(f'<g transform="translate({x + w - 14 - bw} {y + 12.5})">{bd}</g>')
        out.append(T(x + 68, y + 48, f"{TEACH[code]} · Raum {ROOM[code]}", 12.5, 400, c["muted"]))
    for i, (icon, txt, col, bold) in enumerate(lines):
        out.append(extra_line(x + 68, y + 67 + i * 19.19, icon, txt, c[col], c, bold))
    return "".join(out), h

def pause(y, c, x=18, w=354):
    return (T(x + 54, y + 3.5, "Pause · 20 min", 9.5, 800, c["faint2"])
            + f'<line x1="{x + 129.36}" y1="{y}" x2="{x + w}" y2="{y}" stroke="{c["rule"]}" stroke-width="1" stroke-dasharray="3 2"/>')

def day_list(y, rows, c, sub, x=18, w=354, gap=8):
    """rows: (Stunde, Fach, muster, extras, state, info). Nach 2., 3. und 4. Stunde — Pause wie in 05."""
    out = []
    for p, code, muster, extras, state, info in rows:
        r, h = lesson_row(y, p, code, c, sub, muster, extras, state, w, x, info)
        out.append(r); y += h
        if p in (2, 3, 4) and p != rows[-1][0]:
            out.append(pause(y + 18.5, c, x, w)); y += 37
        else:
            y += gap
    return "".join(out), y

# Muster-Montag mit Test und Notiz (dieselben Einträge prüft später «Einträge prüfen»)
TEST_LINE = (FLAG, "Bruchrechnung", "accink", "Test: ")
NOTE_LINE = (FILE, "Vokabeln Unit 3 lernen", "muted", "Notiz: ")
MO_MUSTER = [(1, "De", True, (), None, None), (2, "Ma", True, (TEST_LINE,), None, None), (3, "En", True, (NOTE_LINE,), None, None),
             (4, "Sp", True, (), None, None), (5, "Ge", True, (), None, None)]

# ════════════════ Telefon ════════════════
def p_week_head(c, eyebrow_text, title_text, with_badge=True):
    b = [eyebrow(18, 33, eyebrow_text, c), title(18, 65, title_text, c)]
    if with_badge:
        bd, _ = badge(18 + g.tw(title_text, 29, 900) * 0.93 + 10, 46, "MUSTER", c, "tint"); b.append(bd)
    b.append(round_btn(246, 33.31, c, BACK) + round_btn(290, 33.31, c, CAL) + round_btn(334, 33.31, c, CHEV_R))
    return "".join(b)

def p_muster_woche(c, theme, sub):
    """Ganze Woche in der Zukunft: alles Muster."""
    b = [p_week_head(c, "KW 41 · 6.–10. Okt · in 3 Wochen", "Oktober")]
    b.append(muster_box(18, 85.31, 354, c, [S("Muster-Stundenplan: ", 700, c["accink"]) + S("so läuft Woche B", 400, c["muted"]),
                                            g.esc("normalerweise – ohne Ausfälle und Vertretungen.")]))
    y0 = 157
    for i, (wd, d) in enumerate(KW41):
        b.append(day_head(i, wd, d, c, y=y0))
    gy = y0 + 50
    b.append(period_labels(gy, c))
    for col, day in enumerate(MUSTER):
        for row, code in enumerate(day):
            flag = "Test" if (col, row) == (0, 1) else ("Klausur" if (col, row) == (3, 5) else None)
            b.append(cell(COLS[col], gy + row * 56, code, c, sub, flag=flag))
    rows = [(FLAG, "Do · Englisch", "Klausur in der 6. Stunde", "9. Okt", True),
            (FILE, "1 Notiz · Mo, Englisch", None, None, False)]
    card, _ = card_rows(18, gy + 5 * 56 + 52 + 16, 354, rows, c); b.append(card)
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + g.nav_only(theme, "04 Woche"))
    return page(390, 844, c, "".join(b))

def p_diese_woche(c, theme, sub):
    """Diese Woche: Mo–Do echter Plan, Freitag noch Muster (Plan kommt meist am Vortag)."""
    inner, w, h = base("04 Woche", theme)
    b = [inner]
    b.append(R(311.19, 85.31, CW, 42, 14, c["paper"]) + day_head(4, "FR", "19", c, hatch=True))
    fr = ["Ma", "En", "De", "Bio", "Ge", None]
    for row, code in enumerate(fr):
        y = 131.31 + row * 56
        b.append(R(COLS[4] - 2, y - 2, CW + 4, 56, 0, c["paper"]))
        b.append(cell(COLS[4], y, code, c, sub, flag="Klausur" if row == 0 else None))
    # Zeitlinie (10:48) wieder über die neue Spalte legen
    b.append(f'<g opacity="0.35"><rect x="311.19" y="319.81" width="62.8" height="1" fill="{c["accent"]}"/></g>')
    b.append(R(18, 477.31, 354, 260, 0, c["paper"]))
    rows = [(FLAG, "Fr · Mathe", "Nächste Klausur", "in 2 Tagen", False),
            (P("M5 20V11M12 20V5M19 20v-8"), "3 fallen aus · 2 Vertretungen", None, None, False),
            (LAYERS, "Fr · noch Muster", "Der Plan kommt meist am Vortag", None, True)]
    card, _ = card_rows(18, 477.31, 354, rows, c); b.append(card)
    return page(390, 844, c, "".join(b))

def p_tag_head(c, theme, eyebrow_text, title_text, accent=False):
    inner, w, h = base("05 Tag · Liste", theme)
    clip = '<clipPath id="th"><rect x="0" y="0" width="390" height="129"/></clipPath>'
    return (f'{clip}<g clip-path="url(#th)">{inner}</g>' + R(60, 10, 330, 70, 0, c["paper"])
            + eyebrow(66, 33, eyebrow_text, c, accent) + title(66, 65, title_text, c)
            + round_btn(290, 33.31, c, BACK) + round_btn(334, 33.31, c, CHEV_R))

def p_muster_tag(c, theme, sub, sheet=False):
    b = [p_tag_head(c, theme, "Montag · in 3 Wochen", "6. Oktober")]
    b.append(muster_box(18, 135.31, 354, c, [S("Muster: ", 700, c["accink"]) + S("so ist der Montag normalerweise.", 400, c["muted"]),
                                             g.esc("Der echte Plan kommt meist am Vortag.")]))
    rows, y = day_list(207, MO_MUSTER, c, sub); b.append(rows)
    b.append(T(18, y + 20, "Meine Notizen", 12.5, 800, c["faint"]) + T(372, y + 19.5, "+ Notiz", 13, 700, c["accink"], "end"))
    b.append(T(18, y + 44, "Notizen und Tests in Muster-Stunden prüft ORBook,", 12, 400, c["faint"]))
    b.append(T(18, y + 61, "sobald der echte Plan da ist.", 12, 400, c["faint"]))
    if sheet: b.append(stunde_sheet(c, sub))
    return page(390, 1000, c, "".join(b))

def info_table(x, y, w, rows, c, lw=82, rh=45):
    out = []
    for i, (k, v, col) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(f'<line x1="{x}" y1="{ry}" x2="{x + w}" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        out.append(T(x, ry + 28, k, 14.5, 400, c["faint"]) + T(x + lw, ry + 28, v, 14.5, 400 if col != "ink" else 500, c[col]))
    return "".join(out), len(rows) * rh

def stunde_sheet(c, sub, top=470, H=1000):
    """07 «Stunde · Details» für eine Muster-Stunde: Badge MUSTER, Hinweis, «Test eintragen» (mit Recht)."""
    solid, tint, text = sub["En"]
    b = [sheet_bg(c, top, 390, H)]
    b.append(R(18, top + 30, 44, 44, 22, tint) + T(40, top + 56, "En", 11.5, 900, text, "middle"))
    b.append(T(74, top + 42, "3. Stunde · 09:25–10:10", 12.5, 800, c["faint"]))
    b.append(T(74, top + 71, "Englisch", 29, 900, text, ls=-0.43))
    bd, _ = badge(74 + g.tw("Englisch", 29, 900) * 0.93 + 8, top + 52, "MUSTER", c, "tint"); b.append(bd)
    tbl, th = info_table(18, top + 90, 354, [("Lehrer", "Sch", "ink"), ("Raum", "210", "ink"), ("Kurs", "En", "ink"),
                                             ("Info", "aus dem Muster – kann sich ändern", "muted")], c)
    b.append(tbl)
    y = top + 90 + th + 10
    b.append(R(18, y, 354, 64, 20, c["card"]) + ICON(32, y + 14, 0.67, c["muted"], FILE)
             + T(58, y + 27, "Vokabeln Unit 3 lernen", 14, 400, c["ink"])
             + ICON(58, y + 39, 0.5, c["faint"], REFRESH) + T(76, y + 49, "synchronisiert · nur für dich", 11.5, 400, c["faint"]))
    y += 76
    b.append(button(18, y, 173, "Notiz", c, "sand", FILE) + button(199, y, 173, "Teilen", c, "sand", SHARE))
    b.append(button(18, y + 56, 354, "Test oder Klausur eintragen", c, icon=FLAG))
    return "".join(b)

def p_klausur_form(c, theme, sub):
    """16 «Klausur eintragen» aus einer Muster-Stunde: Fach, Datum, Stunde vorausgefüllt + Hinweis."""
    inner, w, h = base("16 Klausur eintragen (Editor)", theme)
    dy = 76
    b = [shifted(inner, w, h + dy, [(0, w, 576, dy)], "kf"), R(0, 576, 390, dy, 0, c["paper"])]
    # Datum 06.10.2026, Stunde 2 (aus der angetippten Muster-Stunde)
    b.append(R(30, 322, 200, 30, 0, c["field"]) + T(35, 343.31, "06.10.2026", 16, 400, c["ink"]))
    b.append(T(372, 302.31, "Mo · aus dem Muster", 12, 400, c["faint"], "end"))
    b.append(g.segmented(18, 112.31, 354, ["Klausur", "Test", "Abgabe"], 1, c, 35))
    for i in (0, 1):  # Stunde 2 statt 1 gewählt
        x = 18 + i * 49
        on = i == 1
        b.append(R(x - 1, 406.31, 44, 44, 22, c["paper"]))
        b.append(R(x, 407.31, 42, 42, 21, c["accent"]) if on else R(x + .5, 407.81, 41, 41, 20.5, "none", c["rule"]))
        b.append(T(x + 21, 432.81, str(i + 1), 14, 700, c["on"] if on else c["muted"], "middle"))
    b.append(R(30, 498, 300, 32, 0, c["field"]) + T(35, 520.31, "Bruchrechnung", 16, 400, c["ink"]))
    b.append(R(18, 548, 354, 20, 0, c["paper"]) + T(18, 559, "13 von 60 Zeichen · keine Namen", 12, 400, c["faint"]))
    b.append(note_box(18, 582, 354, [S("Stunde aus dem Muster. ", 700, c["ink"]) + S("Kommt der echte", 400, c["muted"]),
                                     g.esc("Plan anders, siehst du „Einträge prüfen“.")], c, LAYERS))
    return page(w, h + dy, c, "".join(b))

def plan_da_banner(x, y, w, c, n="2 Einträge aus dem Muster prüfen"):
    """Wie 33 «Neuer Plan da»: Tint-Leiste mit Glocke und «Ansehen»."""
    return (R(x, y, w, 50, 16, c["tint"]) + ICON(x + 13, y + 15, 0.67, c["accink"], BELL)
            + T(x + 39, y + 22, "Plan ist da", 13, 800, c["accink"])
            + T(x + 39, y + 39, n, 13, 400, c["muted"])
            + T(x + w - 14, y + 30, "Prüfen", 13, 800, c["accink"], "end"))

MO_REAL = [(1, "De", False, (), None, None),
           (2, "Ma", False, ((WARN, "Bruchrechnung · prüfen", "danger", "Test: "),), "aus", None),
           (3, "En", False, ((P("M5 12h14M13 6l6 6-6 6"), "verlegt in die 6. Stunde", "muted", None),
                             (WARN, "Vokabeln Unit 3 · prüfen", "danger", "Notiz: ")), "aus", None),
           (4, "Sp", False, (), None, None), (5, "Ge", False, (), None, None),
           (6, "En", False, ((P("M5 12h14M13 6l6 6-6 6"), "verlegt aus der 3. Stunde", "muted", None),), "vertretung", None)]

def p_plan_da(c, theme, sub, state="banner"):
    b = [p_tag_head(c, theme, "Montag · morgen", "6. Oktober")]
    if state != "verschoben":
        b.append(plan_da_banner(18, 135.31, 354, c, "2 Einträge aus dem Muster prüfen")); y0 = 197
        rows, y = day_list(y0, MO_REAL, c, sub)
    else:  # nach «In die 6. Stunde»: Notiz hängt jetzt an der 6. Stunde, Test bleibt offen
        b.append(plan_da_banner(18, 135.31, 354, c, "1 Eintrag aus dem Muster prüfen")); y0 = 197
        real = list(MO_REAL)
        real[2] = (3, "En", False, ((P("M5 12h14M13 6l6 6-6 6"), "verlegt in die 6. Stunde", "muted", None),), "aus", None)
        real[5] = (6, "En", False, ((P("M5 12h14M13 6l6 6-6 6"), "verlegt aus der 3. Stunde", "muted", None),
                                    (FILE, "Vokabeln Unit 3 lernen", "muted", "Notiz: ")), "vertretung", None)
        rows, y = day_list(y0, real, c, sub)
    b.append(rows)
    H = 1000
    if state == "pruefen": b.append(pruefen_sheet(c, sub, H=H))
    if state == "verschoben": b.append(toast(18, H - 70, 354, "Notiz hängt jetzt an der 6. Stunde", c))
    return page(390, H, c, "".join(b))

def check_card(x, y, w, c, sub, kind, pc=False):
    """Eine Karte in «Einträge prüfen»: was im Muster stand → was der echte Plan sagt → Knöpfe."""
    if kind == "test":
        code, tag, ttl, was = "Ma", "TEST", "Bruchrechnung", "Mathe · 2. Stunde"
        now = [S("Echter Plan: ", 700, c["danger"]) + S("Mathe fällt aus.", 400, c["muted"])]
        btns = [("Test ändern", "sand", PEN), ("So lassen", "sand", None)]
        hint = "Ändern dürfen Lehrkräfte und Editor-Codes."
    else:
        code, tag, ttl, was = "En", "NOTIZ", "Vokabeln Unit 3 lernen", "Englisch · 3. Stunde"
        now = [S("Echter Plan: ", 700, c["accink"]) + S("Englisch in der 6. Stunde.", 400, c["muted"])]
        btns = [("In die 6. Stunde", "primary", ARROW), ("So lassen", "sand", None)]
        hint = None
    solid, tint, text = sub[code]
    h = 196 if hint else 172
    out = [R(x, y, w, h, 22, c["card"])]
    out.append(R(x + 14, y + 14, 40, 40, 20, tint) + T(x + 34, y + 38.5, code, 11.5, 900, text, "middle"))
    bd, bw = badge(x + 66, y + 14, tag, c, "tint" if kind == "notiz" else "sand"); out.append(bd)
    out.append(T(x + 66 + bw + 7, y + 27.5, f"{was} · im Muster", 11.5, 400, c["faint"]))
    out.append(T(x + 66, y + 51, ttl, 15, 800, c["ink"]))
    out.append(R(x + 14, y + 66, w - 28, 40, 14, c["dtint"] if kind == "test" else c["tint"])
               + ICON(x + 26, y + 78, 0.67, c["danger"] if kind == "test" else c["accink"], WARN if kind == "test" else ARROW)
               + T(x + 50, y + 90.5, now[0], 13, 400, c["muted"], raw=True))
    by = y + 118
    bw1 = (w - 28 - 8) * (0.58 if kind == "notiz" else 0.5)
    out.append(button(x + 14, by, bw1, btns[0][0], c, btns[0][1], btns[0][2], h=42))
    out.append(button(x + 14 + bw1 + 8, by, w - 28 - 8 - bw1, btns[1][0], c, btns[1][1], btns[1][2], h=42))
    if hint: out.append(T(x + 14, by + 64, hint, 11.5, 400, c["faint"]))
    return "".join(out), h

def pruefen_sheet(c, sub, top=396, H=1000):
    b = [sheet_bg(c, top, 390, H)]
    b.append(eyebrow(18, top + 42, "Plan für Mo, 6. Okt ist da", c, accent=True))
    b.append(title(18, top + 74, "Einträge prüfen", c, 26))
    b.append(round_btn(334, top + 32, c, CLOSE, size=38))
    b.append(T(18, top + 100, "Diese Einträge hingen an Muster-Stunden, die sich", 13, 400, c["muted"]))
    b.append(T(18, top + 119, "geändert haben. Nichts passiert ohne dich.", 13, 400, c["muted"]))
    y = top + 138
    card, h = check_card(18, y, 354, c, sub, "notiz"); b.append(card); y += h + 10
    card, h = check_card(18, y, 354, c, sub, "test"); b.append(card)
    return "".join(b)

def p_woche_waehlen(c, theme, sub):
    """11 «Woche wählen»: Wochen ohne echten Plan schraffiert, Legende «Muster»."""
    inner, w, h = base("11 Woche wählen (Blatt)", theme)
    for kw, y in (("39", 700), ("40", 740)):
        i = inner.find(f'<text x="33.52" y="{float(y) + 22.5:g}"')
        inner = inner[:i] + R(18, y, 354, 38, 12, "url(#mr)") + inner[i:]
    b = [inner, R(200, 796, 10, 10, 3, "url(#mr)") + R(200.5, 796.5, 9, 9, 2.5, "none", c["faint2"]) + T(215, 804, "Muster", 12, 400, c["muted"])]
    return page(w, h, c, "".join(b))

def p_kein_muster(c, theme, sub):
    """Woche weit voraus, aber noch kein Muster (Schuljahresanfang) — wie 35 «Plan fehlt noch»."""
    b = [p_week_head(c, "KW 37 · 8.–12. Sept · in 2 Wochen", "September", with_badge=False)]
    for i, (wd, d) in enumerate([("MO", "8"), ("DI", "9"), ("MI", "10"), ("DO", "11"), ("FR", "12")]):
        b.append(day_head(i, wd, d, c))
    b.append(R(163, 254.47, 64, 64, 32, c["tint"]) + ICON(181, 272.47, 1.17, c["accink"], LAYERS, 1.8))
    b.append(T(195, 355.47, "Noch kein Muster", 25, 900, c["ink"], "middle", -0.37))
    for i, ln in enumerate(["ORBook baut das Muster aus den echten", "Plänen der letzten Wochen. Nach zwei", "Schulwochen ist es da."]):
        b.append(T(195, 388.47 + i * 21.7, ln, 14, 400, c["muted"], "middle"))
    b.append(button(34, 470, 322, "Zur aktuellen Woche", c, icon=CAL))
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + g.nav_only(theme, "04 Woche"))
    return page(390, 844, c, "".join(b))

# ════════════════ Computer ════════════════
PCX = [342, 465.59, 589.19, 712.78, 836.38]
PCW = 115.59

def pc_cell(x, y, code, c, sub, muster=True, flag=None, state=None, h=104):
    if code is None:
        return R(x + .5, y + .5, PCW - 1, h - 1, 16, "none", c["rule"], 1, ' stroke-dasharray="3 2"') + T(x + PCW / 2, y + h / 2 + 4, "frei", 12.5, 400, c["faint"], "middle")
    solid, tint, text = sub[code]
    if state == "aus":
        out = [R(x + .5, y + .5, PCW - 1, h - 1, 16, c["paper"], c["faint2"], 1, ' stroke-dasharray="3 2"')]
        out.append(T(x + 12, y + 23, NAMES[code], 14, 800, c["faint"]) + R(x + 12, y + 18.5, g.tw(NAMES[code], 14, 800) * 0.93, 1, 0, c["faint"]))
        out.append(R(x + 12.5, y + 50.5, 64, 17, 8.5, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(x + 19, y + 62.5, "FÄLLT AUS", 9, 800, c["muted"], ls=0.5))
        return "".join(out)
    out = [R(x, y, PCW, h, 16, tint)]
    if state == "vertretung": out = [R(x, y, PCW, h, 16, c["tint"]), R(x + 1, y + 1, PCW - 2, h - 2, 15, "none", c["accent"], 2)]
    if muster: out.append(R(x, y, PCW, h, 16, "url(#mh)"))
    if flag: out.append(R(x + 1, y + 1, PCW - 2, h - 2, 15, "none", c["accent"], 2))
    out.append(T(x + 12, y + 23, NAMES[code], 14, 800, text))
    out.append(f'<g opacity="0.75">{T(x + 12, y + 44, f"{TEACH[code]} · {ROOM[code]}", 12.5, 400, text)}</g>')
    if flag:
        bd, _ = badge(x + 12, y + 54, flag, c, "accent"); out.append(bd)
    return "".join(out)

def pc_week(c, theme, sub, sel=0, muster=True, real_mo=False):
    inner, w, h = base("05 Woche · Stunden + gewählter Tag", theme, "PC")
    b = [inner, R(256, 0, 1440 - 256, 900, 0, c["paper"])]
    # Kopfzeile rechts (Knöpfe, Umschalter) aus dem Original
    b.append(f'<clipPath id="pch"><rect x="860" y="0" width="580" height="100"/></clipPath><g clip-path="url(#pch)">{inner}</g>')
    b.append(eyebrow(284, 39, "KW 41 · 6.–10. Oktober · in 3 Wochen", c) + title(284, 80, "Oktober", c, 38))
    if muster:
        bd, _ = badge(284 + g.tw("Oktober", 38, 900) * 0.93 + 14, 57, "MUSTER", c, "tint"); b.append(bd)
    # Spaltenauswahl wie im Original (Rahmen um den gewählten Tag)
    sx = PCX[sel] - 5
    b.append(R(sx, 106, PCW + 10, 776, 20, c["sand"] if not muster else "none") + R(sx + 1, 107, PCW + 8, 774, 19, "none", c["accent"], 2))
    for i, (wd, d) in enumerate(KW41):
        x = PCX[i]
        if i == sel:
            b.append(R(x - 2, 110, PCW + 4, 50, 14, c["accent"]))
            b.append(T(x + 10, 145, d, 28, 900, c["on"], ls=-0.4) + T(x + 14 + g.tw(d, 28, 900) * 0.9, 140, wd, 10, 800, c["sub"], ls=0.8))
        else:
            b.append(T(x + 12, 145, d, 28, 900, c["ink"], ls=-0.4) + T(x + 16 + g.tw(d, 28, 900) * 0.9, 140, wd, 10, 800, c["faint"], ls=0.8))
    for r in range(6):
        y = 170 + r * 112
        a, e = TIMES[r]
        b.append(T(285, y + 44, str(r + 1), 22, 900, c["ink"]) + T(285, y + 61, a, 10.5, 400, c["faint"]) + T(285, y + 75, e, 10.5, 400, c["faint"]))
        for col in range(5):
            code = MUSTER[col][r]
            flag = ("TEST" if (col, r) == (0, 1) else "KLAUSUR" if (col, r) == (3, 5) else None)
            state = None
            if real_mo and col == 0:
                if r == 1: state = "aus"
                if r == 2: state = "aus"
                if r == 5: code, state = "En", "vertretung"
            b.append(pc_cell(PCX[col], y, code, c, sub, muster and not (real_mo and col == 0), flag if state != "aus" else None, state))
    return "".join(b)

def pc_day_panel(c, sub):
    """Rechte Spalte wie PC 05: gewählter Tag, hier ein Muster-Montag."""
    b = [R(984, 110, 420, 766, 22, c["card"])]
    b.append(eyebrow(1002, 141, "Montag · in 3 Wochen", c) + title(1002, 174, "6. Oktober", c, 29))
    b.append(muster_box(1002, 192, 384, c, [S("Muster: ", 700, c["accink"]) + S("so ist der Montag normalerweise.", 400, c["muted"]),
                                           g.esc("Der echte Plan kommt meist am Vortag.")]))
    rows, y = day_list(266, MO_MUSTER, c, sub, x=1002, w=384, gap=8)
    b.append(rows)
    return "".join(b)

def pc_muster(c, theme, sub):
    return page(1440, 900, c, pc_week(c, theme, sub) + pc_day_panel(c, sub))

def pc_stunde(c, theme, sub):
    """PC 08 «Stunde · Details» als Panel rechts — Muster-Stunde mit «Test oder Klausur eintragen»."""
    b = [pc_week(c, theme, sub), pc_day_panel(c, sub), overlay(c, 1440, 900).replace("<rect", '<rect opacity="0.55"', 1)]
    for f in ("nsh0", "nsh1", None):
        b.append(R(984, 16, 440, 868, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(eyebrow(1010, 57.5, "Stunde", c))
    b.append(R(1325.13, 42, 30.88, 22, 8, c["card"], c["rule"]) + T(1332.13, 56, "Esc", 11, 600, c["muted"]) + round_btn(1364, 36, c, CLOSE, size=34))
    solid, tint, text = sub["En"]
    b.append(R(1010, 88, 44, 44, 22, tint) + T(1032, 114, "En", 11.5, 900, text, "middle"))
    b.append(T(1066, 100, "3. Stunde · 09:25–10:10", 12.5, 800, c["faint"]))
    b.append(T(1066, 129, "Englisch", 29, 900, text, ls=-0.43))
    bd, _ = badge(1066 + g.tw("Englisch", 29, 900) * 0.93 + 8, 110, "MUSTER", c, "tint"); b.append(bd)
    tbl, th = info_table(1010, 150, 388, [("Lehrer", "Sch", "ink"), ("Raum", "210", "ink"), ("Kurs", "En", "ink"),
                                          ("Info", "aus dem Muster – kann sich noch ändern", "muted")], c)
    b.append(tbl)
    y = 150 + th + 12
    b.append(R(1010, y, 388, 64, 20, c["card"]) + ICON(1024, y + 14, 0.67, c["muted"], FILE)
             + T(1050, y + 27, "Vokabeln Unit 3 lernen", 14, 400, c["ink"])
             + ICON(1050, y + 39, 0.5, c["faint"], REFRESH) + T(1068, y + 49, "synchronisiert · nur für dich", 11.5, 400, c["faint"]))
    y += 78
    b.append(button(1010, y, 190, "Notiz", c, "sand", FILE) + button(1208, y, 190, "Teilen", c, "sand", SHARE))
    b.append(button(1010, y + 58, 388, "Test oder Klausur eintragen", c, icon=FLAG))
    b.append(T(1010, y + 136, "Wird geprüft, sobald der echte Plan für Montag da ist.", 12, 400, c["faint"]))
    return page(1440, 900, c, "".join(b))

def pc_pruefen(c, theme, sub):
    """Echter Plan für Montag ist da → Fenster «Einträge prüfen» (wie PC 17 als Fenster)."""
    b = [pc_week(c, theme, sub, muster=True, real_mo=True)]
    b.append(R(984, 110, 420, 766, 22, c["card"]))
    b.append(eyebrow(1002, 141, "Montag · morgen", c) + title(1002, 174, "6. Oktober", c, 29))
    b.append(plan_da_banner(1002, 192, 384, c))
    rows, _ = day_list(256, MO_REAL[:4], c, sub, x=1002, w=384); b.append(rows)
    b.append(overlay(c, 1440, 900))
    X, Y, W, H = 440, 160, 560, 548
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(g.modal_head(X, Y, W, "Plan für Mo, 6. Okt ist da", "Einträge prüfen", c, accent=True))
    b.append(T(X + 26, Y + 100, "Diese Einträge hingen an Muster-Stunden, die sich geändert haben.", 13.5, 400, c["muted"]))
    b.append(T(X + 26, Y + 120, "Nichts passiert ohne dich.", 13.5, 400, c["muted"]))
    y = Y + 140
    card, h = check_card(X + 26, y, W - 52, c, sub, "notiz", pc=True); b.append(card); y += h + 12
    card, h = check_card(X + 26, y, W - 52, c, sub, "test", pc=True); b.append(card)
    return page(1440, 900, c, "".join(b))

def pc_waehlen(c, theme, sub):
    inner, w, h = base("12 Woche wählen (Dropdown)", theme, "PC")
    for kw, y in (("39", 286), ("40", 324)):
        i = inner.find(f'<text x="769.89" y="{y + 21.5:g}"')
        inner = inner[:i] + R(756, y, 328, 36, 12, "url(#mr)") + inner[i:]
    b = [inner, R(940, 376, 10, 10, 3, "url(#mr)") + R(940.5, 376.5, 9, 9, 2.5, "none", c["faint2"]) + T(955, 384, "Muster", 12, 400, c["muted"])]
    return page(w, h, c, "".join(b))

SCREENS = {
    "handy-01-muster-woche": p_muster_woche,
    "handy-02-diese-woche": p_diese_woche,
    "handy-03-muster-tag": p_muster_tag,
    "handy-04-stunde": lambda c, t, s: p_muster_tag(c, t, s, sheet=True),
    "handy-05-test-eintragen": p_klausur_form,
    "handy-06-plan-da": p_plan_da,
    "handy-07-pruefen": lambda c, t, s: p_plan_da(c, t, s, "pruefen"),
    "handy-08-verschoben": lambda c, t, s: p_plan_da(c, t, s, "verschoben"),
    "handy-09-woche-waehlen": p_woche_waehlen,
    "handy-10-kein-muster": p_kein_muster,
    "pc-01-muster-woche": pc_muster,
    "pc-02-stunde": pc_stunde,
    "pc-03-pruefen": pc_pruefen,
    "pc-04-woche-waehlen": pc_waehlen,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
