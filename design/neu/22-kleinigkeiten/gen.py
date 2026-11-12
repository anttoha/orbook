# Генератор макетов части 22 «Kleinigkeiten»: Mehr (Seiten + Einstellungen, Statistik внутри), Darstellung (дата изменения с превью),
# переключатель «Mein Plan / Alle Kurse» в неделе и дне, Sport Mädchen/Jungen.
# Помощники и цвета — из генераторов частей 14–19c (те же токены Soft).
# Основа — оригиналы ORBook Soft: 22 «Mehr», 24 «Darstellung», 23 «Meine Kurse», 19 «Statistik», 05 «Tag · Liste»,
# PC 22 «Einstellungen · Übersicht», PC 24 «Darstellung», PC 05 «Woche».
import importlib.util, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g19b", os.path.join(HERE, "..", "19b-muster-editor", "gen.py"))
m = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m)
m19, g, m15 = m.m19, m.g, m.m15
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, segmented, badge = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.segmented, g.badge)
CHECK, CHEV_R, BACK, CLOSE = g.CHECK, g.CHEV_R, g.BACK, g.CLOSE
toast, page = m15.toast, m.page
REFRESH, FLAG = m19.REFRESH, m19.FLAG
BARS = P("M5 20V11M12 20V5M19 20v-8")
SOFT = g.SOFT

# ── Sport für Mädchen und Jungen: eigene Kürzel, Farbe wie «Sp» ──
for code, name in (("SpMä", "Sport · Mädchen"), ("SpJu", "Sport · Jungen")):
    g.NAMES[code] = name; m19.TEACH[code] = "Hen" if code == "SpJu" else "Kle"; m19.ROOM[code] = "Halle"
def with_sport(sub):
    s = dict(sub); s["SpMä"] = s["SpJu"] = s["Sp"]; return s

def icons_of(name, folder="1 Handy Hell", scale="0.79"):
    """Innenleben der Icons (der Reihe nach) aus einem Original-SVG — damit Symbole exakt wie in Soft sind."""
    s = open(os.path.join(SOFT, folder, name + ".svg"), encoding="utf-8").read()
    return re.findall(r'<g transform="translate\([\d. ]+\) scale\(%s %s\)"[^>]*>(.*?)</g>' % (scale, scale), s, re.S)
IC = icons_of("22 Mehr")   # 0 Kurse, 1 Darstellung, 2 Fachfarben, 3 Mitteilungen, 4 Sync, 5 Editor-Code, 6 Datenschutz, 7 Verlassen
I_KURSE, I_DARST, I_FARBEN, I_MITT, I_SYNC, I_KEY, I_SHIELD, I_LOGOUT = IC[:8]
I_KEYS = '<rect x="3" y="6" width="18" height="12" rx="3"/>' + P("M7 10h.01M11 10h.01M15 10h.01M8 14h8")
I_HOME = P("M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z")

def dots_icon(x, y, scale, col):
    return (f'<g transform="translate({x} {y}) scale({scale} {scale})" fill="{col}" stroke="{col}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
            '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></g>')

def nav3(c, active):
    """Untere Navigation mit drei Plätzen: Woche · Klausuren · Mehr (Statistik wandert in «Mehr»)."""
    out = [R(16, 764, 358, 58, 29, c["card"]), R(16.5, 764.5, 357, 57, 28.5, "none", c["hair"])]
    icons = [('<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16M15 4v16"), "Woche"), (FLAG, "Klausuren"), (None, "Mehr")]
    pill_w = {"Woche": 105.64, "Klausuren": 120, "Mehr": 105.64}
    for i, (ic, name) in enumerate(icons):
        cx = 16 + 358 * (i + 0.5) / 3
        if i == active:
            w = pill_w[name]; x = cx - w / 2
            out.append(R(x, 771, w, 44, 22, c["accent"]))
            if ic: out.append(f'<g transform="translate({x + 25} 784) scale(0.75 0.75)" fill="none" stroke="{c["on"]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{ic}</g>')
            else: out.append(dots_icon(x + 25, 784, 0.75, c["on"]))
            out.append(T(x + 49, 797, name, 13, 800, c["on"]))
        else:
            if ic: out.append(ICON(cx - 10, 783, 0.83, c["muted"], ic, 2))
            else: out.append(dots_icon(cx - 10, 783, 0.83, c["muted"]))
    return "".join(out)

def bottom_nav(c, active):
    return R(0, 744, 390, 100, 0, c["paper"]) + nav3(c, active)

# ════════════════════════════ Mehr ════════════════════════════
def rows_card(x, y, w, rows, c, rh=52.5):
    """Karte mit Zeilen «Icon · Titel · Wert · ›» wie in 22 «Mehr»."""
    out = [R(x, y, w, rh * len(rows), 22, c["card"])]
    for i, (icon, text, right) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(f'<line x1="{x + 14}" y1="{ry}" x2="{x + w - 14}" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        out.append(ICON(x + 14, ry + 16, 0.79, c["muted"], icon, 1.9) + T(x + 45, ry + 30.5, text, 14.5, 500, c["ink"]))
        if right: out.append(T(x + w - 38, ry + 30, right, 13, 400, c["faint"], "end"))
        out.append(ICON(x + w - 30, ry + 17.5, 0.67, c["faint2"], CHEV_R))
    return "".join(out), rh * len(rows)

def p_mehr(c, theme, sub):
    b = [eyebrow(18, 33, "9b · Meine Schule", c), title(18, 65, "Mehr", c)]
    b.append(label(18, 104, "Seiten", c) + T(372, 104, "weitere Bereiche der App", 12, 400, c["faint"], "end"))
    card, h = rows_card(18, 116, 354, [(BARS, "Statistik", "Woche · Monat"), (I_SHIELD, "Datenschutz", None)], c); b.append(card)
    y = 116 + h + 32
    b.append(label(18, y, "Einstellungen", c) + T(372, y, "so soll ORBook bei dir sein", 12, 400, c["faint"], "end"))
    card, h2 = rows_card(18, y + 12, 354, [(I_KURSE, "Meine Kurse", "7 von 8"), (I_DARST, "Darstellung", "Hell"), (I_FARBEN, "Fachfarben", None),
                                           (I_MITT, "Mitteilungen", "an"), (I_SYNC, "Notizen synchronisieren", "K7QM-…"), (I_KEY, "Klausuren eintragen", "Editor-Code")], c)
    b.append(card)
    y = y + 12 + h2 + 18
    b.append(R(18, y, 354, 52.5, 22, c["card"]) + ICON(32, y + 16, 0.79, c["danger"], I_LOGOUT, 1.9) + T(63, y + 30.5, "Klasse verlassen", 14.5, 500, c["danger"]))
    b.append(T(18, y + 83, "ORBook 1.0 · Teil von ORBitium", 12, 400, c["faint"]) + T(372, y + 83, "Admin", 12, 400, c["faint"], "end"))
    b.append(bottom_nav(c, 2))
    return page(390, 844, c, "".join(b))

def p_statistik(c, theme, sub):
    """19 «Statistik» — jetzt eine Seite unter «Mehr»: Zurück-Pfeil, «Mehr» als Zeile darüber, Navigation ohne eigenen Platz."""
    inner, w, h = g.base("19 Statistik", theme)
    b = [inner, R(0, 10, 246, 72, 0, c["paper"]), round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, "Mehr · September", c) + title(66, 65, "Statistik", c)]
    b.append(bottom_nav(c, 2))
    return page(390, 844, c, "".join(b))

# ════════════════════════════ Darstellung ════════════════════════════
# Beispieltage für die Vorschau (heute = Mi 17.): (Wochentag, Tag, geändert: (Wochentag, "TT.MM.", Uhrzeit, derselbe Tag?) | None)
PREVIEW = [("MO", "15", ("Fr", "12.09.", "16:40", False)), ("DI", "16", ("Mo", "15.09.", "15:15", False)), ("MI", "17", ("Mi", "17.09.", "07:08", True)),
           ("DO", "18", ("Mi", "17.09.", "06:50", False)), ("FR", "19", None)]
FORMATS = ["Mi 15:15", "15.09.", "15.09. 15:15"]

def stand_text(ch, fmt):
    """Dieselbe Regel wie `changedLabel`: am selben Tag nur die Uhrzeit, sonst nach Format."""
    wd, date, time, same = ch
    if same: return time
    return [f"{wd} {time}", date, f"{date} {time}"][fmt]

def preview_tiles(x, y, w, c, fmt, tw=62.8, th=62, gap=3.0, fs=7.5):
    out = []
    step = tw + gap
    for i, (wd, d, ch) in enumerate(PREVIEW):
        tx = x + i * step
        today = wd == "MI"
        out.append(R(tx, y, tw, th, 14, c["accent"] if today else c["paper"]))
        out.append(T(tx + tw / 2, y + 16, wd, 9.5, 700, c["sub"] if today else c["faint"], "middle", 0.8))
        out.append(T(tx + tw / 2, y + 36, d, 18, 900, c["on"] if today else c["ink"], "middle", -0.27))
        if ch:
            txt = stand_text(ch, fmt)
            col = c["sub"] if today else c["faint"]
            wtxt = len(txt) * fs * 0.52
            x0 = tx + tw / 2 - (wtxt + 9) / 2
            out.append(ICON(x0, y + 44.5, 0.3, col, REFRESH, 2.8) + T(x0 + 9.5, y + 51.5, txt, fs, 600, col))
    return "".join(out)

def stand_card(x, y, w, c, fmt, wide=False):
    """Neue Karte in «Darstellung»: Format der Änderungszeit unter dem Tag, mit Vorschau."""
    h = 222 if not wide else 200
    out = [R(x, y, w, h, 22, c["card"])]
    out.append(T(x + 14, y + 30, "Änderung unter dem Tag", 14.5, 400, c["ink"]))
    out.append(T(x + 14, y + 49, "So steht es unter jedem Tag in der Woche.", 12, 400, c["faint"]))
    if wide:
        sx, sw = x + w - 14 - 300, 300
        out.append(segmented(sx, y + 18, sw, FORMATS, fmt, c))
        py = y + 82
    else:
        out.append(segmented(x + 14, y + 62, w - 28, FORMATS, fmt, c, h=38))
        py = y + 124
    out.append(T(x + 14, py - 8 if not wide else py - 8, "Vorschau", 12, 800, c["faint"]))
    tw = (w - 28 - 4 * 3) / 5 if not wide else 112
    out.append(preview_tiles(x + 14, py, w - 28, c, fmt, tw=tw, th=62, gap=3 if not wide else 8, fs=7.5 if not wide else 9))
    out.append(T(x + 14, py + 62 + 22, "Am selben Tag steht nur die Uhrzeit, z. B. 07:08.", 12, 400, c["faint"]))
    return "".join(out), h

def p_darstellung(c, theme, sub, fmt=1):
    inner, w, h = g.base("24 Darstellung", theme)
    b = [inner, label(18, 620, "Plan", c)]
    card, ch = stand_card(18, 632, 354, c, fmt); b.append(card)
    return page(w, max(h, 632 + ch + 24), c, "".join(b))

# ════════════════════════════ Meine Kurse (Sport) ════════════════════════════
def course_row(x, y, w, code, name, who, on, c, sub, last=False):
    solid, tint, text = sub[code]
    out = []
    if not last: out.append(f'<line x1="{x + 14}" y1="{y + 53.5}" x2="{x + w - 14}" y2="{y + 53.5}" stroke="{c["hair"]}" stroke-width="1"/>')
    code_txt = code if len(code) <= 3 else code
    out.append(R(x + 14, y + 11.5, 32, 32, 16, tint if on else c["sand"]))
    fs = 11.5 if len(code_txt) <= 2 else 9.5
    out.append(T(x + 30, y + 31.5, code_txt, fs, 900, text if on else c["faint"], "middle"))
    out.append(T(x + 58, y + 24, name, 14.5, 600, c["ink"] if on else c["faint"]) + T(x + 58, y + 42, who, 12, 400, c["faint"] if on else c["faint2"]))
    out.append(g.switch(x + w - 56, y + 15, on, c))
    return "".join(out)

def p_kurse(c, theme, sub):
    sub = with_sport(sub)
    b = [round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, "Mehr", c) + title(66, 65, "Meine Kurse", c)]
    b.append(T(18, 100.3, "Ausgeblendete Kurse erscheinen nicht im Plan und nicht", 14, 400, c["muted"]) + T(18, 121.3, "in der Statistik.", 14, 400, c["muted"]))
    b.append(label(18, 160.8, "Wahl", c))
    rows = [("Ku", "Kunst", "Lau", True), ("SpMä", "Sport · Mädchen", "Kle", True), ("SpJu", "Sport · Jungen", "Hen", False), ("Bio", "Biologie Profil", "Kra", True)]
    b.append(R(18, 175.3, 354, 54 * len(rows), 22, c["card"]))
    for i, (code, name, who, on) in enumerate(rows):
        b.append(course_row(18, 175.3 + i * 54, 354, code, name, who, on, c, sub, last=i == len(rows) - 1))
    b.append(note_hint(18, 175.3 + 54 * len(rows) + 16, c, "Sport: Mädchen, Jungen oder beide wählen."))
    return page(390, 844, c, "".join(b))

def note_hint(x, y, c, text):
    return ICON(x, y - 10, 0.6, c["faint"], '<circle cx="12" cy="12" r="9"/>' + P("M12 11v5M12 8h.01"), 2) + T(x + 20, y + 2, text, 12, 400, c["faint"])

# ════════════════════════════ Woche / Tag: Mein Plan · Alle Kurse ════════════════════════════
# Slot = Liste (Kürzel, Raum, gehört zu meinen Kursen?). Standard: ein Kurs, meiner.
def slot(col, row):
    code = m19.MUSTER[col][row]
    special = {(0, 3): [("SpMä", True), ("SpJu", False)], (2, 5): [("SpMä", True), ("SpJu", False)], (4, 4): [("Ge", True)],
               (1, 4): [("Ku", False)], (3, 4): [("SpJu", False)], (4, 5): [("Ku", True), ("Bio", False)]}
    if (col, row) in special: return special[(col, row)]
    return [(code, True)] if code else []

def tiny_cell(x, y, code, mine, c, sub, w, h):
    solid, tint, text = sub[code]
    if mine:
        return R(x, y, w, h, 9, tint) + T(x + 7, y + h / 2 + 4, code, 11, 900, text) + (T(x + w - 6, y + h / 2 + 3.5, m19.ROOM[code], 8.5, 600, text, "end") if len(code) <= 2 else "")
    return (R(x + .5, y + .5, w - 1, h - 1, 9, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(x + 7, y + h / 2 + 4, code, 11, 800, c["faint"])
            + (T(x + w - 6, y + h / 2 + 3.5, m19.ROOM[code], 8.5, 600, c["faint2"], "end") if len(code) <= 2 else ""))

def wcell(x, y, items, c, sub, alle, w=m19.CW, h=52, flag=None):
    """Zelle der Wochentabelle. Mein Plan: nur meine Kurse. Alle Kurse: auch die anderen — gestrichelt."""
    shown = items if alle else [it for it in items if it[1]]
    if not shown: return m19.cell(x, y, None, c, sub)
    if len(shown) == 1:
        code, mine = shown[0]
        if mine: return m19.cell(x, y, code, c, sub, muster=False, flag=flag, w=w, h=h)
        return (R(x + .5, y + .5, w - 1, h - 1, 14, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(x + 8, y + 20, code, 12.5, 800, c["faint"])
                + T(x + 8, y + 42, m19.ROOM[code], 9.5, 600, c["faint2"]))
    hh = (h - 2) / 2
    return tiny_cell(x, y, shown[0][0], shown[0][1], c, sub, w, hh) + tiny_cell(x, y + hh + 2, shown[1][0], shown[1][1], c, sub, w, hh)

def plan_button(x, y, alle, c, size=38):
    """Runde Taste «Alle Kurse» (Stapel-Symbol) im Kopf: aus = weiß wie die anderen, an = Akzentfarbe."""
    return round_btn(x, y, c, m19.LAYERS, primary=alle, size=size)

def plan_pill(x, y, alle, c, h=36):
    """Computer: Taste mit Text. Aus = Karte, an = Akzentfarbe."""
    w = 134
    fill, fg = (c["accent"], c["on"]) if alle else (c["card"], c["ink"])
    return R(x, y, w, h, h / 2, fill) + ICON(x + 14, y + h / 2 - 8, 0.67, fg, m19.LAYERS, 2) + T(x + 40, y + h / 2 + 4.5, "Alle Kurse", 13, 700, fg)

def view_switch(x, y, w, c, h=38):
    """«Liste | Zeitleiste» wie im Original 05, nur schmaler gezeichnet, damit die Taste «Alle Kurse» danebenpasst."""
    out = [R(x, y, w, h, h / 2, c["sand"]), R(x + 3, y + 3, (w - 6) / 2, h - 6, (h - 6) / 2, c["seg"])]
    items = [(P("M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"), "Liste", c["ink"]), (P("M4 6h10M4 12h16M4 18h7"), "Zeitleiste", c["muted"])]
    for i, (ic, t_, col) in enumerate(items):
        cx = x + 3 + (w - 6) / 2 * (i + 0.5)
        out.append(ICON(cx - 38, y + h / 2 - 8, 0.67, col, ic, 2) + T(cx - 14, y + h / 2 + 4.5, t_, 12.5, 800, col))
    return "".join(out)

def legend(x, y, c, alle):
    if alle:
        return (R(x + .5, y - 9.5, 15, 11, 4, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(x + 22, y, "Gestrichelt: nicht in deinen Kursen", 12, 400, c["faint"]))
    return ""

def p_woche(c, theme, sub, alle=False, with_toast=False, menu=False):
    sub = with_sport(sub)
    b = [eyebrow(18, 33, "KW 38 · 15.–19. Sept", c), title(18, 65, "Diese Woche", c)]
    b.append(round_btn(246, 33.31, c, BACK) + round_btn(290, 33.31, c, g.DOTS_V) + round_btn(334, 33.31, c, CHEV_R))
    if alle: b.append(R(319, 33, 11, 11, 5.5, c["accent"], c["paper"], 2))   # Punkt am ⋮: «Alle Kurse» ist an
    y0 = 85.31
    for i, (wd, d) in enumerate([("MO", "15"), ("DI", "16"), ("MI", "17"), ("DO", "18"), ("FR", "19")]):
        b.append(m19.day_head(i, wd, d, c, sel=(i == 2), y=y0))
    gy = y0 + 46
    b.append(m19.period_labels(gy, c))
    for col in range(5):
        for row in range(6):
            flag = "Klausur" if (col, row) == (4, 0) else None
            b.append(wcell(m19.COLS[col], gy + row * 56, slot(col, row), c, sub, alle, flag=flag))
    ly = gy + 6 * 56 + 8
    b.append(legend(18, ly + 6, c, alle))
    rows = [(FLAG, "Fr · Mathe", "Nächste Klausur", "in 2 Tagen", False)]
    card, _ = m19.card_rows(18, ly + 24, 354, rows, c); b.append(card)
    if with_toast: b.append(toast(18, 690, 354, "Alle Kurse der Klasse · wird gemerkt", c))
    b.append(bottom_nav(c, 0))
    if menu: b.append(week_menu(c, alle))
    return page(390, 844, c, "".join(b))

def week_menu(c, alle):
    """Menü ⋮ wie Soft 10 «Woche · Menü oben», neu: «Alle Kurse zeigen» mit Schalter."""
    x, y, w, rh = 120, 78, 252, 48
    rows = [(CAL_I, "Zu heute springen", None), (P("M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"), "Heute öffnen", None),
            ('<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16M15 4v16"), "Wochenende anzeigen", None),
            (m19.LAYERS, "Alle Kurse zeigen", "switch"), (REFRESH, "Plan neu laden", None), (g.SHARE, "Woche teilen", None)]
    out = [g.overlay(c, 390, 844)]
    h = rh * len(rows) + 10
    for f in ("nsh0", None):
        out.append(R(x, y, w, h, 22, c["card"], extra=f' filter="url(#{f})"' if f else ""))
    out.append(R(x + .5, y + .5, w - 1, h - 1, 22, "none", c["hair"]))
    for i, (ic, text, kind) in enumerate(rows):
        ry = y + 5 + i * rh
        if i in (3, 4): out.append(f'<line x1="{x + 14}" y1="{ry}" x2="{x + w - 14}" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        hot = kind == "switch"
        out.append(ICON(x + 16, ry + 14, 0.8, c["accink"] if hot else c["muted"], ic, 1.9) + T(x + 46, ry + 29.5, text, 14.5, 500, c["ink"]))
        if hot: out.append(g.switch(x + w - 58, ry + 12, alle, c))
    return "".join(out)

CAL_I = g.CAL

def lesson_other(y, p, code, c, x=18, w=354):
    """Zeile eines Kurses, den ich nicht gewählt habe: gestrichelt, grau, mit Hinweis."""
    h = 64
    a, e = m19.TIMES[p - 1]
    out = [R(x + .5, y + .5, w - 1, h - 1, 20, "none", c["faint2"], 1, ' stroke-dasharray="3 2"')]
    out.append(T(x + 14, y + 26, a, 13, 700, c["faint"]) + T(x + 14, y + 43, e, 11, 400, c["faint2"]))
    out.append(T(x + 68, y + 27, g.NAMES[code], 15, 800, c["faint"]) + T(x + 68, y + 48, f"{m19.TEACH[code]} · Raum {m19.ROOM[code]}", 12.5, 400, c["faint2"]))
    bw = 112
    out.append(R(x + w - 14.5 - bw, y + 13, bw, 18, 9, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(x + w - 14.5 - bw + 8, y + 25.5, "NICHT DEIN KURS", 9.5, 800, c["muted"], ls=0.57))
    return "".join(out), h

def day_rows(y, entries, c, sub, x=18, w=354):
    out = []
    for i, (p, code, mine) in enumerate(entries):
        if mine: r, h = m19.lesson_row(y, p, code, c, sub, False, (), None, w, x)
        else: r, h = lesson_other(y, p, code, c, x, w)
        out.append(r); y += h
        nxt = entries[i + 1][0] if i + 1 < len(entries) else None
        if nxt and nxt != p and p in (2, 3, 4):
            out.append(m19.pause(y + 18.5, c, x, w)); y += 37
        else: y += 8
    return "".join(out), y

DAY_ENTRIES = [(1, "De", True), (2, "Ma", True), (3, "En", True), (4, "Ph", True), (5, "Ge", True), (6, "SpMä", True), (6, "SpJu", False)]

def p_tag(c, theme, sub, alle=True):
    sub = with_sport(sub)
    inner, w, h = g.base("05 Tag · Liste", theme)
    clip = '<clipPath id="th"><rect x="0" y="0" width="390" height="129"/></clipPath>'
    b = [f'{clip}<g clip-path="url(#th)">{inner}</g>', R(60, 10, 330, 70, 0, c["paper"]), R(0, 80, 390, 50, 0, c["paper"]),
         eyebrow(66, 33, "Mittwoch · heute", c, accent=True) + title(66, 65, "17. September", c),
         round_btn(290, 33.31, c, BACK) + round_btn(334, 33.31, c, CHEV_R),
         view_switch(18, 85, 306, c), plan_button(334, 85, alle, c)]
    rows, y = day_rows(140, DAY_ENTRIES if alle else [e for e in DAY_ENTRIES if e[2]], c, sub); b.append(rows)
    b.append(bottom_nav(c, 0))
    return page(390, 844, c, "".join(b))

# ════════════════════════════ Computer ════════════════════════════
def pc_base(name, theme):
    inner, w, h = g.base(name, theme, "PC")
    return inner

def pc_sidebar(inner, c, mehr_active):
    """Seitenleiste aus dem Original: «Statistik» weg (Bald-Liste rückt hoch), unten «Einstellungen» → «Mehr»."""
    cut = (f'<clipPath id="sb"><rect x="16" y="340" width="232" height="190"/></clipPath>'
           + R(20, 288, 224, 244, 0, c["card"]) + f'<g transform="translate(0 -46)"><g clip-path="url(#sb)">{inner}</g></g>')
    if mehr_active:
        bottom = R(38, 749, 190, 28, 0, c["accent"]) + dots_icon(44, 754, 0.83, c["on"]) + T(73, 767, "Mehr", 14.5, 800, c["on"])
    else:
        bottom = R(36, 748, 196, 30, 0, c["card"]) + dots_icon(44, 754, 0.83, c["muted"]) + T(73, 767, "Mehr", 14.5, 700, c["muted"])
    return cut + bottom

SUBNAV = [("Seiten", [("Statistik", BARS), ("Datenschutz", I_SHIELD)]),
          ("Einstellungen", [("Meine Kurse", I_KURSE), ("Darstellung", I_DARST), ("Fachfarben", I_FARBEN), ("Mitteilungen", I_MITT),
                             ("Notizen-Sync", I_SYNC), ("Editor-Code", I_KEY)])]

def pc_subnav(c, active):
    out = []
    base_y = 110.03
    if active == "Übersicht":
        out.append(R(284, base_y, 230, 38, 19, c["accent"]) + ICON(300, base_y + 10, 0.75, c["on"], I_HOME, 2) + T(326, 133.53, "Übersicht", 13.5, 800, c["on"]))
    else:
        out.append(ICON(300, base_y + 10, 0.75, c["muted"], I_HOME, 2) + T(326, 133.53, "Übersicht", 13.5, 700, c["muted"]))
    y = 133.53 + 40
    for head, items in SUBNAV:
        out.append(T(290, y + 4, head.upper(), 10.5, 800, c["faint"], ls=0.8)); y += 28
        for name, ic in items:
            if name == active:
                out.append(R(284, y - 23.5, 230, 38, 19, c["accent"]) + ICON(300, y - 13.5, 0.75, c["on"], ic, 2) + T(326, y, name, 13.5, 800, c["on"]))
            else:
                out.append(ICON(300, y - 13.5, 0.75, c["muted"], ic, 2) + T(326, y, name, 13.5, 700, c["muted"]))
            y += 40
        y += 4
    out.append(f'<line x1="284" y1="{y - 20}" x2="514" y2="{y - 20}" stroke="{c["hair"]}" stroke-width="1"/>')
    out.append(ICON(300, y - 9.5, 0.75, c["danger"], I_LOGOUT, 2) + T(326, y + 4, "Klasse verlassen", 13.5, 700, c["danger"]))
    return "".join(out)

def hub_card(x, y, w, icon, ttl, sub_text, c):
    return (R(x, y, w, 68, 22, c["card"]) + R(x + 16, y + 14, 40, 40, 20, c["tint"]) + ICON(x + 26, y + 24, 0.83, c["accink"], icon, 1.9)
            + T(x + 70, y + 29.5, ttl, 15, 700, c["ink"]) + T(x + 70, y + 49.5, sub_text, 12.5, 400, c["faint"]) + ICON(x + w - 34, y + 25, 0.75, c["faint2"], CHEV_R))

def pc_mehr(c, theme, sub):
    inner = pc_base("22 Einstellungen · Übersicht", theme)
    b = [inner, R(250, 0, 1190, 900, 0, c["paper"]), pc_sidebar(inner, c, True)]
    b.append(eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38))
    b.append(pc_subnav(c, "Übersicht"))
    b.append(T(558, 132, "Übersicht", 26, 900, c["ink"], ls=-0.39))
    X1, X2, W = 558, 904, 334
    b.append(label(X1, 176, "Seiten", c) + T(X1 + 62, 176, "weitere Bereiche der App", 12, 400, c["faint"]))
    b.append(hub_card(X1, 188, W, BARS, "Statistik", "Stunden, Ausfälle, Vertretungen", c) + hub_card(X2, 188, W, I_SHIELD, "Datenschutz", "Keine Konten, kein Tracking", c))
    b.append(hub_card(X1, 268, W, I_KEYS, "Tastenkürzel", "⌘K, T, ←, →, N …", c))
    b.append(label(X1, 380, "Einstellungen", c) + T(X1 + 124, 380, "so soll ORBook bei dir sein", 12, 400, c["faint"]))
    cards = [(I_KURSE, "Meine Kurse", "7 von 8 Kursen"), (I_DARST, "Darstellung", "Hell · Start mit Woche"), (I_FARBEN, "Fachfarben", "8 Fächer"),
             (I_MITT, "Mitteilungen", "3 von 4 an"), (I_SYNC, "Notizen-Sync", "K7QM-… · heute 07:40"), (I_KEY, "Editor-Code", "nicht freigeschaltet")]
    for i, (ic, t_, s_) in enumerate(cards):
        b.append(hub_card(X1 if i % 2 == 0 else X2, 392 + (i // 2) * 80, W, ic, t_, s_, c))
    b.append(T(558, 664, "ORBook 1.0 · Teil von ORBitium", 12.5, 400, c["faint"]) + T(1238, 664, "Admin", 12.5, 400, c["faint"], "end"))
    return page(1440, 900, c, "".join(b))

def pc_darstellung(c, theme, sub, fmt=1):
    inner = pc_base("24 Einstellungen · Darstellung", theme)
    b = [inner, R(250, 0, 306, 900, 0, c["paper"]), pc_sidebar(inner, c, True)]
    b.append(R(270, 20, 330, 80, 0, c["paper"]) + eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38))
    b.append(pc_subnav(c, "Darstellung"))
    b.append(label(558, 692, "Plan", c))
    card, h = stand_card(558, 704, 680, c, fmt, wide=True); b.append(card)
    return page(1440, 900, c, "".join(b))

PCX, PCW = m19.PCX, m19.PCW
def pc_slot_cell(x, y, items, c, sub, alle, h=104, flag=None):
    shown = items if alle else [it for it in items if it[1]]
    if not shown: return R(x + .5, y + .5, PCW - 1, h - 1, 16, "none", c["rule"], 1, ' stroke-dasharray="3 2"') + T(x + PCW / 2, y + h / 2 + 4, "frei", 12.5, 400, c["faint"], "middle")
    if len(shown) == 1:
        code, mine = shown[0]
        if mine: return m19.pc_cell(x, y, code, c, sub, muster=False, flag=flag, h=h)
        return (R(x + .5, y + .5, PCW - 1, h - 1, 16, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(x + 12, y + 23, g.NAMES[code], 14, 800, c["faint"])
                + T(x + 12, y + 44, f"{m19.TEACH[code]} · {m19.ROOM[code]}", 12.5, 400, c["faint2"]) + T(x + 12, y + 66, "nicht dein Kurs", 11, 600, c["faint2"]))
    out, hh = [], (h - 4) / 2
    for i, (code, mine) in enumerate(shown):
        yy = y + i * (hh + 4)
        short = g.NAMES[code] if len(code) <= 2 else code
        if mine:
            solid, tint, text = sub[code]
            out.append(R(x, yy, PCW, hh, 14, tint) + T(x + 12, yy + 21, short, 13, 800, text) + T(x + 12, yy + 39, f"{m19.TEACH[code]} · {m19.ROOM[code]}", 11.5, 400, text))
        else:
            out.append(R(x + .5, yy + .5, PCW - 1, hh - 1, 14, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(x + 12, yy + 21, short, 13, 800, c["faint"])
                       + T(x + 12, yy + 39, f"{m19.TEACH[code]} · {m19.ROOM[code]}", 11.5, 400, c["faint2"]))
    return "".join(out)

def pc_woche(c, theme, sub, alle=True):
    sub = with_sport(sub)
    inner = pc_base("05 Woche · Stunden + gewählter Tag", theme)
    b = [inner, R(250, 0, 1190, 900, 0, c["paper"]), pc_sidebar(inner, c, False)]
    b.append(f'<clipPath id="pch"><rect x="860" y="0" width="580" height="100"/></clipPath><g clip-path="url(#pch)">{inner}</g>')
    b.append(eyebrow(284, 39, "KW 38 · 15.–19. September", c) + title(284, 80, "Diese Woche", c, 38))
    b.append(plan_pill(560, 52, alle, c))
    sel = 2
    sx = PCX[sel] - 5
    b.append(R(sx, 106, PCW + 10, 776, 20, c["sand"]) + R(sx + 1, 107, PCW + 8, 774, 19, "none", c["accent"], 2))
    for i, (wd, d) in enumerate([("MO", "15"), ("DI", "16"), ("MI", "17"), ("DO", "18"), ("FR", "19")]):
        x = PCX[i]
        if i == sel:
            b.append(R(x - 2, 110, PCW + 4, 50, 14, c["accent"]) + T(x + 10, 145, d, 28, 900, c["on"], ls=-0.4) + T(x + 14 + g.tw(d, 28, 900) * 0.9, 140, wd, 10, 800, c["sub"], ls=0.8))
        else:
            b.append(T(x + 12, 145, d, 28, 900, c["ink"], ls=-0.4) + T(x + 16 + g.tw(d, 28, 900) * 0.9, 140, wd, 10, 800, c["faint"], ls=0.8))
    for r in range(6):
        y = 170 + r * 112
        a, e = m19.TIMES[r]
        b.append(T(285, y + 44, str(r + 1), 22, 900, c["ink"]) + T(285, y + 61, a, 10.5, 400, c["faint"]) + T(285, y + 75, e, 10.5, 400, c["faint"]))
        for col in range(5):
            b.append(pc_slot_cell(PCX[col], y, slot(col, r), c, sub, alle, flag="KLAUSUR" if (col, r) == (4, 0) else None))
    # Tag rechts
    b.append(R(984, 110, 420, 766, 22, c["card"]))
    b.append(eyebrow(1002, 141, "Mittwoch · heute", c, accent=True) + title(1002, 174, "17. September", c, 29))
    b.append(legend(1002, 204, c, alle))
    rows, _ = day_rows(228, [e for e in DAY_ENTRIES if e[0] >= 3], c, sub, x=1002, w=384); b.append(rows)
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-mehr": p_mehr,
    "handy-02-statistik": p_statistik,
    "handy-03-darstellung": lambda c, t, s: p_darstellung(c, t, s, 1),
    "handy-04-darstellung-datum-zeit": lambda c, t, s: p_darstellung(c, t, s, 2),
    "handy-05-woche-mein-plan": p_woche,
    "handy-06-woche-alle-kurse": lambda c, t, s: p_woche(c, t, s, True, True),
    "handy-09-woche-menue": lambda c, t, s: p_woche(c, t, s, True, False, True),
    "handy-07-tag-alle-kurse": p_tag,
    "handy-08-meine-kurse": p_kurse,
    "pc-01-mehr": pc_mehr,
    "pc-02-darstellung": pc_darstellung,
    "pc-03-woche-alle-kurse": pc_woche,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
