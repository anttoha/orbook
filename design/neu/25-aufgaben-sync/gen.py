# Генератор макетов части 25 «Aufgaben + Sync + QR»:
#  · «Aufgaben» вместо «Hausaufgaben» во вкладке Tests: домашки класса и свои дела, галочка «erledigt»;
#  · Sync-Code синхронизирует всё (Notizen, Aufgaben, Kurse, Darstellung), QR для второго устройства;
#  · QR у Lehrer-/Editor-Codes, лист A4 для класса (Aushang / Kärtchen) и для учителя;
#  · «Kurz erklärt» — три карточки при первом входе.
# Помощники и токены — из генераторов частей 14–24 (те же цвета, шрифт, радиусы Soft).
# Основа — оригиналы ORBook Soft: 13 «Klausuren», 05 «Tag · Liste», 21 «Notizen synchronisieren», 22 «Mehr»,
# 12 «Teilen» (шторка), 42 «Admin · neuer Code», PC 14 «Klausuren», PC 27 «Notizen-Sync».
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", path))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

m24 = _load("g24", "24-eintraege/gen.py")
m16 = _load("g16", "16-einladen/gen.py")
m22, m19, g, m15 = m24.m22, m24.m19, m24.g, m24.m15
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, segmented, badge, note_box, chip, switch = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.segmented, g.badge, g.note_box, g.chip, g.switch)
CHECK, CHEV_R, CHEV_D, BACK, CLOSE, PEN, PLUS, TRASH, SHARE, CAL, BOOK, LOCK, COPY, KEY, USER = (
    g.CHECK, g.CHEV_R, g.CHEV_D, g.BACK, g.CLOSE, g.PEN, g.PLUS, g.TRASH, g.SHARE, g.CAL, g.BOOK, g.LOCK, g.COPY, g.KEY, g.USER)
FLAG, FILE, INFO, WARN = m19.FLAG, m15.FILE, m15.INFO, m15.WARN
toast, sheet_bg, overlay, page = m15.toast, m15.sheet_bg, g.overlay, m19.page
NAMES = g.NAMES
field, hint, head, tint_button = m24.field, m24.hint, m24.head, m24.tint_button
qr, sheet, two_buttons = m16.qr, m16.sheet, m16.two_buttons
QR_ICON, EXPAND, LINK, USER_PLUS = m16.QR_ICON, m16.EXPAND, m16.LINK, m16.USER_PLUS
I_KURSE, I_DARST, I_FARBEN, I_SYNC, I_KEY, I_SHIELD, I_LOGOUT = m22.I_KURSE, m22.I_DARST, m22.I_FARBEN, m22.I_SYNC, m22.I_KEY, m22.I_SHIELD, m22.I_LOGOUT
BARS = m22.BARS
HLINE = m24.HLINE

# ── Новые иконки (контур 24×24, stroke 2) ──
PRINT = P("M7 9V3h10v6") + '<rect x="3" y="9" width="18" height="8" rx="2"/>' + P("M7 14h10v7H7z")
LIST_CHECK = P("M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9")
SPARK = P("M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z")
SCISSORS = '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>' + P("M8.1 8.1L20 20M8.1 15.9L20 4")
PHONE = '<rect x="7" y="2" width="10" height="20" rx="2.5"/>' + P("M11 18h2")
MONITOR = '<rect x="3" y="4" width="18" height="12" rx="2"/>' + P("M12 16v4M8 20h8")
CAMERA = P("M4 8h3l2-3h6l2 3h3v11H4z") + '<circle cx="12" cy="13" r="3.5"/>'
TAP = P("M9 11V5a2 2 0 0 1 4 0v5l4.5 1a2 2 0 0 1 1.5 2.3L18 19a3 3 0 0 1-3 2h-3.5a3 3 0 0 1-2.4-1.2L5.5 15a1.6 1.6 0 0 1 2.4-2.1L9 14")
ARROW = m24.ARROW

# ── Aufgaben: Daten (heute = Mi 17.09., wie in allen Soft-Mustern) ──
# (Abschnitt, Tag, Wochentag, Fach|None, von, Text, wann, eigene?, erledigt?)
AUFGABEN = [
    ("Bis morgen", "18", "DO", "Ma", "Mü", "Buch S. 54, Nr. 3 a–d", "morgen", False, False),
    (None, "18", "DO", None, None, "Sportsachen einpacken", "morgen", True, False),
    ("Diese Woche", "19", "FR", "De", "Kle", "Gedicht lernen, Strophe 1–2", "in 2 Tagen", False, False),
    (None, "19", "FR", "En", None, "Workbook p. 23, ex. 4", "in 2 Tagen", False, False),
]
ERLEDIGT = [
    ("18", "DO", "Ph", "Ric", "Protokoll Federpendel", "morgen", False),
    ("17", "MI", "Ge", None, "Quelle M3 lesen", "heute", False),
    ("16", "DI", None, None, "Bücherei: Buch abgeben", "gestern", True),
]

def check_circle(x, y, on, c, r=13):
    """Kreis zum Abhaken (rechts in der Zeile): leer — dünner Rand, erledigt — Akzent mit Häkchen."""
    cx, cy = x + r, y + r
    if on:
        return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{c["accent"]}"/>'
                f'<path d="M{cx - 5.5},{cy + .2} L{cx - 1.6},{cy + 4} L{cx + 5.6},{cy - 4}" fill="none" stroke="{c["on"]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>')
    return f'<circle cx="{cx}" cy="{cy}" r="{r - 1}" fill="none" stroke="{c["faint2"]}" stroke-width="2"/>'

def own_tile(x, y, day, wd, c, w=38, h=44):
    """Datumsfeld eigener Aufgaben: ohne Fach — sandfarben."""
    return (R(x, y, w, h, 12, c["sand"]) + T(x + w / 2, y + 21.5, day, 19, 900, c["muted"], "middle", -0.28)
            + T(x + w / 2, y + 34.5, wd, 9, 700, c["muted"], "middle", 0.54))

def task_row(x, y, w, c, sub, day, wd, code, who, text, when, own, done, sel=False, h=64):
    """Zeile in «Aufgaben»: Datumsfeld, «Mathe · von Mü · morgen», Aufgabe fett, rechts Kreis zum Abhaken."""
    out = [R(x, y, w, h, 22, c["card"])]
    if sel: out.append(R(x + .5, y + .5, w - 1, h - 1, 21.5, "none", c["accent"]))
    tile = own_tile(x + 12, y + 10, day, wd, c) if not code else g.date_tile(x + 12, y + 10, day, wd, code, sub)
    out.append(f'<g opacity="0.5">{tile}</g>' if done else tile)
    parts = []
    if own: parts.append(S("Eigene", 800, c["faint"] if done else c["accink"]))
    if code: parts.append(S((" · " if own else "") + NAMES[code], 400, c["faint"]))
    if who: parts.append(S(f" · von {who}", 400, c["faint"]))
    parts.append(S(f" · {when}", 700 if when == "morgen" and not done else 400, c["accink"] if when == "morgen" and not done else c["faint"]))
    out.append(T(x + 62, y + 24, "".join(parts), 11.5, 400, c["faint"], raw=True))
    out.append(T(x + 62, y + 48.5, text, 14.5, 800, c["faint"] if done else c["ink"]))
    if done: out.append(R(x + 62, y + 43.5, g.tw(text, 14.5, 800) * 0.87, 1.3, 0, c["faint"]))
    out.append(check_circle(x + w - 42, y + h / 2 - 13, done, c))
    return "".join(out)

def list_switch(x, y, w, c, active=1, counts=None):
    opts = ["Tests", "Aufgaben", "Termine"] if not counts else [f"Tests · {counts[0]}", f"Aufgaben · {counts[1]}", f"Termine · {counts[2]}"]
    return segmented(x, y, w, opts, active, c)

def done_head(x, y, w, c, n, open_):
    """Zeile «Erledigt · 3» — zugeklappt als Karte, aufgeklappt als Überschrift."""
    if open_:
        return (label(x, y + 12, f"Erledigt · {n}", c) + T(x + w, y + 12, "Zuklappen", 12.5, 700, c["accink"], "end"))
    return (R(x, y, w, 50, 22, c["card"]) + check_circle(x + 14, y + 13, True, c, 12) + T(x + 48, y + 30, f"Erledigt · {n}", 14.5, 700, c["ink"])
            + T(x + w - 38, y + 30, "anzeigen", 13, 400, c["faint"], "end") + ICON(x + w - 30, y + 17, 0.67, c["faint2"], CHEV_D))

def subject_chips(y, c, sub):
    """Chips der Fächer wie in Hausaufgaben (14): «Alle» + Fächer mit Punkt; gilt für Tests und Aufgaben."""
    out, x = [], 18
    on, w = chip(x, y, "Alle", c, on=True); out.append(on); x += w + 6.5
    for code in ("Ma", "De", "En", "Ph", "Ge"):
        ch, w = chip(x, y, code, c, dot=sub[code][0]); out.append(ch); x += w + 6.5
    return "".join(out)

def p_aufgaben(c, theme, sub):
    b = [eyebrow(18, 33, "Ab heute · 4 offen", c), title(18, 65, "Aufgaben", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(list_switch(18, 85.31, 354, c))
    b.append(subject_chips(135.31, c, sub))
    y = 182
    for i, a in enumerate(AUFGABEN):
        sec, day, wd, code, who, text, when, own, done = a
        if sec:
            if i: y += 12
            b.append(label(18, y + 12, sec, c)); y += 24
        b.append(task_row(18, y, 354, c, sub, day, wd, code, who, text, when, own, done, sel=i == 0)); y += 72
    y += 10
    b.append(done_head(18, y, 354, c, 3, False)); y += 66
    b.append(hint(18, y, "Abhaken merkt sich nur dein Gerät — mit Sync-Code auch", c))
    b.append(hint(18, y + 17, "deine anderen. Die Klasse sieht davon nichts.", c))
    b.append(m24.nav_tests(c))
    return page(390, 844, c, "".join(b))

def p_abgehakt(c, theme, sub):
    """Nach dem Abhaken: Zeile wandert nach «Erledigt» (aufgeklappt), unten Toast mit «Rückgängig»."""
    b = [eyebrow(18, 33, "Ab heute · 3 offen", c), title(18, 65, "Aufgaben", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(list_switch(18, 85.31, 354, c))
    b.append(subject_chips(135.31, c, sub))
    y = 182
    b.append(label(18, y + 12, "Bis morgen", c)); y += 24
    a = AUFGABEN[1]; b.append(task_row(18, y, 354, c, sub, *a[1:9])); y += 72 + 12
    b.append(label(18, y + 12, "Diese Woche", c)); y += 24
    for a in AUFGABEN[2:]:
        b.append(task_row(18, y, 354, c, sub, *a[1:9])); y += 72
    y += 12
    b.append(done_head(18, y, 354, c, 4, True)); y += 24
    a = AUFGABEN[0]; b.append(task_row(18, y, 354, c, sub, a[1], a[2], a[3], a[4], a[5], a[6], a[7], True)); y += 72
    for e in ERLEDIGT[:1]:
        b.append(task_row(18, y, 354, c, sub, e[0], e[1], e[2], e[3], e[4], e[5], e[6], True)); y += 72
    b.append(R(0, 744, 390, 100, 0, c["paper"]))
    b.append(R(18, 680, 354, 46, 16, c["toastbg"]) + ICON(32, 695, 0.67, c["toastfg"], CHECK) + T(58, 708, "Erledigt", 13.5, 600, c["toastfg"])
             + T(358, 708, "Rückgängig", 13.5, 800, c["toastfg"], "end"))
    b.append(m24.nav_tests(c))
    return page(390, 844, c, "".join(b))

def date_chips(x, y, maxw, active, c, names):
    out, cx = [], x
    for n in names:
        s, w = chip(cx, y, n, c, on=n == active, h=36); out.append(s); cx += w + 8
    return "".join(out)

def p_eigene(c, theme, sub):
    """Blatt «Eigene Aufgabe»: Text, bis wann (Chips), Fach optional — nur für mich."""
    inner = p_aufgaben(c, theme, sub)
    inner = inner[inner.index("</defs>") + 7: inner.rindex("</svg>")]
    top = 300
    b = [inner, sheet_bg(c, top), eyebrow(18, top + 42, "Nur für dich", c), title(18, top + 72, "Eigene Aufgabe", c, 26),
         R(338, top + 42, 34, 34, 17, c["card"]) + ICON(346.5, top + 50.5, 0.71, c["ink"], CLOSE)]
    y = top + 112
    b.append(label(18, y, "Was ist zu tun?", c)); y += 12
    b.append(field(18, y, 354, ["Referat-Thema aussuchen"], c)); y += 52 + 26
    b.append(label(18, y, "Bis wann?", c)); y += 12
    b.append(date_chips(18, y, 300, "Fr 19.09.", c, ["Morgen", "Fr 19.09.", "Ohne Datum"]))
    b.append(R(334.5, y + .5, 37, 35, 17.5, "none", c["rule"]) + ICON(345, y + 10, 0.67, c["muted"], CAL, 2)); y += 36 + 26
    b.append(label(18, y, "Fach · optional", c)); y += 12
    _, tint, text = sub["De"]
    b.append(R(18, y, 354, 52, 16, c["field"]) + R(34, y + 22, 8, 8, 4, sub["De"][0]) + T(50, y + 31, "Deutsch", 15.5, 400, c["ink"])
             + ICON(340, y + 18, 0.67, c["muted"], CHEV_D, 2)); y += 52 + 18
    b.append(hint(18, y, "Sieht nur du. Steht in „Aufgaben“ und im Tag.", c))
    b.append(button(18, 844 - 76, 354, "Speichern", c))
    return page(390, 844, c, "".join(b))

def p_leer(c, theme, sub):
    b = [eyebrow(18, 33, "Ab heute · nichts offen", c), title(18, 65, "Aufgaben", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(list_switch(18, 85.31, 354, c))
    cy = 330
    b.append(f'<circle cx="195" cy="{cy}" r="42" fill="{c["oktint"]}"/>' + ICON(177, cy - 18, 1.5, c["ok"], CHECK, 2.2))
    b.append(T(195, cy + 82, "Alles erledigt", 22, 900, c["ink"], "middle"))
    b.append(T(195, cy + 110, "Neue Hausaufgaben der Klasse erscheinen hier", 14, 400, c["muted"], "middle"))
    b.append(T(195, cy + 130, "von selbst. Eigene Aufgaben: +", 14, 400, c["muted"], "middle"))
    b.append(done_head(18, 600, 354, c, 5, False))
    b.append(m24.nav_tests(c))
    return page(390, 844, c, "".join(b))

def p_tag(c, theme, sub):
    """05 «Tag · Liste»: «Hausaufgaben · fällig heute» bekommt Kreise zum Abhaken; eigene Aufgaben stehen mit drin."""
    inner, _, _ = g.base("05 Tag · Liste", theme)
    b = ['<clipPath id="th"><rect x="0" y="0" width="390" height="129"/></clipPath>', f'<g clip-path="url(#th)">{inner}</g>',
         R(0, 10, 390, 70, 0, c["paper"]), eyebrow(18, 33, "Donnerstag · morgen", c), title(18, 65, "18. September", c),
         round_btn(290, 33.31, c, BACK), round_btn(334, 33.31, c, CHEV_R)]
    rows = [(1, "De", False, (), None, None),
            (2, "Ma", False, ((BOOK, "Buch S. 54, Nr. 3 a–d", "muted", "Hausaufgabe: "),), None, None),
            (3, "Ph", False, (), None, None)]
    lst, y = m19.day_list(135.31, rows, c, sub); b.append(lst)
    y += 14
    b.append(label(18, y + 12, "Aufgaben · fällig an diesem Tag", c) + T(372, y + 12, "1 von 3", 12.5, 700, c["faint"], "end")); y += 24
    items = [("Ma", "Buch S. 54, Nr. 3 a–d", "Mathe · von Mü", False), ("Ph", "Protokoll Federpendel", "Physik · von Ric", True),
             (None, "Sportsachen einpacken", "Eigene Aufgabe", False)]
    rh = 62
    b.append(R(18, y, 354, rh * len(items), 22, c["card"]))
    for i, (code, text, subl, done) in enumerate(items):
        ry = y + i * rh
        if i: b.append(HLINE(32, 358, ry, c))
        if code:
            _, tint, tcol = sub[code]
            b.append(R(32, ry + 15, 32, 32, 16, tint) + T(48, ry + 35.5, code, 11, 900, tcol, "middle"))
        else:
            b.append(R(32, ry + 15, 32, 32, 16, c["sand"]) + ICON(40, ry + 23, 0.67, c["muted"], USER, 2))
        if done: b.append(f'<g opacity="0.5">{R(32, ry + 15, 32, 32, 16, c["card"])}</g>')
        b.append(T(76, ry + 28, text, 15, 400, c["faint"] if done else c["ink"]))
        if done: b.append(R(76, ry + 23.5, g.tw(text, 15, 400) * 0.9, 1.2, 0, c["faint"]))
        b.append(T(76, ry + 46, subl, 12, 400, c["accink"] if code is None else c["faint"]))
        b.append(check_circle(330, ry + rh / 2 - 13, done, c))
    y += rh * len(items) + 18
    b.append(label(18, y + 12, "Meine Notizen", c) + T(372, y + 12, "+ Notiz", 13, 700, c["accink"], "end"))
    b.append(m22.bottom_nav(c, 0))
    return page(390, 844, c, "".join(b))

# ════════════════ Sync ════════════════
SYNC_CODE = "K7QM-4TXP-R2AB-9CDE-FGHJ"
SYNC_ROWS = [(FILE, "Notizen", "6 Notizen", True), (LIST_CHECK, "Aufgaben", "erledigt + eigene", True),
             (I_KURSE, "Meine Kurse", "7 von 8", True), (I_DARST, "Darstellung & Fachfarben", "Hell · A+", True)]

def what_card(x, y, w, c, rows=SYNC_ROWS, rh=58):
    out = [R(x, y, w, rh * len(rows), 22, c["card"])]
    for i, (icon, name, subl, on) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HLINE(x + 14, x + w - 14, ry, c))
        out.append(ICON(x + 14, ry + rh / 2 - 9.5, 0.79, c["muted"], icon, 1.9))
        out.append(T(x + 45, ry + 25, name, 14.5, 500, c["ink"]) + T(x + 45, ry + 43, subl, 12, 400, c["faint"]))
        out.append(switch(x + w - 56, ry + rh / 2 - 12, on, c))
    return "".join(out), rh * len(rows)

def code_card(x, y, w, c, qr_btn=True):
    """«Dein Sync-Code» aus 21: Code (20 Zeichen, zwei Zeilen), Kopieren, neu: Knopf «QR» daneben, Status darunter."""
    h = 142
    out = [R(x, y, w, h, 22, c["card"]), T(x + 16, y + 28, "Dein Sync-Code", 12.5, 800, c["faint"])]
    out.append(T(x + 16, y + 62, "K7QM-4TXP-", 22, 900, c["ink"], ls=1.6) + T(x + 16, y + 90, "R2AB-9CDE-FGHJ", 22, 900, c["ink"], ls=1.6))
    out.append(R(x + w - 52, y + 42, 38, 38, 19, c["sand"]) + ICON(x + w - 41.5, y + 52.5, 0.71, c["ink"], COPY, 2))
    if qr_btn: out.append(R(x + w - 98, y + 42, 38, 38, 19, c["tint"]) + ICON(x + w - 87.5, y + 52.5, 0.71, c["accink"], QR_ICON, 2))
    out.append(ICON(x + 16, y + 113, 0.58, c["ok"], CHECK, 2.2) + T(x + 34, y + 124, "Zuletzt synchronisiert heute 07:40 · alles aktuell", 12, 400, c["ok"]))
    return "".join(out), h

def p_sync(c, theme, sub):
    H = 990
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Einstellungen", c), title(66, 65, "Synchronisieren", c)]
    for i, ln in enumerate(["Alles von diesem Gerät auch auf deinem", "anderen — ohne Konto und ohne Namen.", "Code eingeben oder QR scannen, fertig."]):
        b.append(T(18, 105 + i * 21, ln, 14, 400, c["muted"]))
    y = 170
    card, h = code_card(18, y, 354, c); b.append(card); y += h + 26
    b.append(label(18, y, "Was wird synchronisiert", c)); y += 12
    card, h = what_card(18, y, 354, c); b.append(card); y += h + 12
    b.append(R(18, y, 354, 44, 16, c["tint"]) + ICON(31, y + 14, 0.67, c["accink"], WARN, 2) + T(57, y + 27, "Code weg = Daten weg. Schreib ihn dir auf.", 13, 400, c["accink"])); y += 44 + 30
    b.append(label(18, y, "Anderes Gerät verbinden", c)); y += 12
    b.append(R(18, y, 354, 54, 16, c["field"]) + T(35, y + 35, "XXXX-XXXX-XXXX-…", 20, 900, c["faint2"], ls=1.2)); y += 54 + 12
    b.append(button(18, y, 354, "Verbinden", c, icon=I_SYNC)); y += 48 + 12
    b.append(T(195, y + 16, S("Oder: ", 400, c["faint"]) + S("am anderen Gerät QR scannen", 700, c["muted"]), 12.5, 400, c["faint"], "middle", raw=True)); y += 44
    b.append(button(18, y, 354, "Neuen Code erzeugen", c, "sand", m16.REDO))
    return page(390, H, c, "".join(b))

def p_sync_qr(c, theme, sub):
    """Шторка «Sync-Code als QR»: показать своему второму телефону. Код в ссылке после # — на сервер не уходит."""
    inner = p_sync(c, theme, sub)
    inner = inner[inner.index("</defs>") + 7: inner.rindex("</svg>")]
    top = 190
    b = [f'<svg x="0" y="0" width="390" height="844" viewBox="0 0 390 844">{inner}</svg>', overlay(c, 390, 844),
         sheet(top, c, "Nur für deine Geräte", "Sync-Code als QR")]
    y = top + 96
    b.append(R(18, y, 354, 330, 26, c["card"]) + qr(91, y + 22, 208, c))
    b.append(T(195, y + 262, SYNC_CODE, 15, 900, c["ink"], "middle", ls=1.2))
    b.append(T(195, y + 290, "Mit der Kamera des anderen Handys scannen", 12.5, 400, c["faint"], "middle"))
    y += 330 + 14
    b.append(note_box(18, y, 354, [S("Wer den QR scannt, sieht deine Notizen.", 700, c["ink"]), g.esc("Nicht in die Klassengruppe schicken.")], c, LOCK))
    y += 60 + 16
    b.append(button(18, 844 - 76, 354, "Fertig", c, "sand", None))
    return page(390, 844, c, "".join(b))

def p_verbinden(c, theme, sub):
    """Auf dem neuen Gerät nach dem Scannen: was passiert, ein Knopf."""
    b = [eyebrow(18, 33, "Sync-Code aus dem QR", c, True), title(18, 65, "Gerät verbinden?", c)]
    b.append(R(18, 92, 354, 70, 22, c["card"]) + R(32, 107, 40, 40, 20, c["tint"]) + ICON(42, 117, 0.83, c["accink"], I_SYNC, 1.9)
             + T(86, 122, SYNC_CODE, 14, 900, c["ink"], ls=0.8) + T(86, 142, "zuletzt geändert heute 07:40 am PC", 12, 400, c["faint"]))
    y = 192
    b.append(label(18, y, "Das kommt auf dieses Gerät", c)); y += 12
    rows = [(FILE, "Notizen", "werden zusammengeführt"), (LIST_CHECK, "Aufgaben", "Häkchen und eigene — zusammengeführt"),
            (I_KURSE, "Meine Kurse", "vom anderen Gerät übernommen"), (I_DARST, "Darstellung & Fachfarben", "vom anderen Gerät übernommen")]
    rh = 58
    b.append(R(18, y, 354, rh * 4, 22, c["card"]))
    for i, (icon, name, subl) in enumerate(rows):
        ry = y + i * rh
        if i: b.append(HLINE(32, 358, ry, c))
        b.append(ICON(32, ry + rh / 2 - 9.5, 0.79, c["muted"], icon, 1.9) + T(63, ry + 25, name, 14.5, 500, c["ink"]) + T(63, ry + 43, subl, 12, 400, c["faint"]))
        b.append(ICON(340, ry + rh / 2 - 8, 0.67, c["ok"], CHECK, 2.4))
    y += rh * 4 + 14
    b.append(hint(18, y + 6, "Nichts geht verloren: Notizen von beiden Geräten bleiben.", c))
    b.append(hint(18, y + 23, "Was übertragen wird, kannst du später in Sync ändern.", c))
    b.append(button(18, 844 - 132, 354, "Verbinden", c, icon=I_SYNC))
    b.append(button(18, 844 - 76, 354, "Abbrechen", c, "sand", None))
    return page(390, 844, c, "".join(b))

def p_mehr(c, theme, sub):
    """22 «Mehr» (Stand Teil 24) mit «Synchronisieren» statt «Notizen synchronisieren» und neu «Kurz erklärt»."""
    rows_card = m22.rows_card
    b = [eyebrow(18, 33, "9b · Meine Schule", c), title(18, 65, "Mehr", c)]
    b.append(label(18, 104, "Seiten", c) + T(372, 104, "weitere Bereiche der App", 12, 400, c["faint"], "end"))
    card, h = rows_card(18, 116, 354, [(BARS, "Statistik", "Woche · Monat"), (SPARK, "Neuigkeiten", "0.10"), (m15.FOLDER, "Materialien", "6 Links"),
                                       (USER_PLUS, "Klasse einladen", "Link + QR"), (INFO, "Kurz erklärt", "3 Tipps"), (I_SHIELD, "Datenschutz", None)], c)
    b.append(card)
    b.append(R(20, 116 + 52.5 * 4 + 2, 3, 48, 1.5, c["accent"]))
    y = 116 + h + 30
    b.append(label(18, y, "Einstellungen", c) + T(372, y, "so soll ORBook bei dir sein", 12, 400, c["faint"], "end"))
    card, h2 = rows_card(18, y + 12, 354, [(I_KURSE, "Meine Kurse", "7 von 8"), (I_DARST, "Darstellung", "Hell"), (I_FARBEN, "Fachfarben", None),
                                           (I_SYNC, "Synchronisieren", "K7QM-…"), (I_KEY, "Tests eintragen", "Editor-Code")], c)
    b.append(card)
    b.append(R(20, y + 12 + 52.5 * 3 + 2, 3, 48, 1.5, c["accent"]))
    b.append(m22.bottom_nav(c, 2).replace('fill="{}"'.format(c["paper"]), 'fill="{}"'.format(c["paper"]), 1))
    return page(390, 844, c, "".join(b))

# ════════════════ QR und Drucken ════════════════
def p_einladen(c, theme, sub):
    """Шторка «Klasse einladen» (часть 16, ученик/учитель) + новая строка «Blatt für die Klasse drucken»."""
    inner = m16.p_schueler(c, theme, sub)
    inner = inner[inner.index("</defs>") + 7: inner.rindex("</svg>")]
    b = [inner]
    y = 716
    b.append(R(18, y, 354, 56, 22, c["card"]) + R(18.5, y + .5, 353, 55, 21.5, "none", c["accent"], 1.2)
             + ICON(32, y + 18.5, 0.79, c["accink"], PRINT, 1.9) + T(63, y + 25, "Blatt für die Klasse drucken", 14.5, 700, c["accink"])
             + T(63, y + 43, "A4 · Aushang oder Kärtchen zum Verteilen", 12, 400, c["faint"]) + ICON(342, y + 20, 0.67, c["faint2"], CHEV_R))
    return page(390, 844, c, "".join(b))

def mini_a4(x, y, w, c, kind):
    """Kleine Vorschau des A4-Blatts (Papier immer weiß)."""
    h = w * 1.414
    out = [R(x, y, w, h, 6, "#FFFFFF", c["rule"], 1)]
    ink, acc, faint = "#2A2433", "#6C4DF6", "#C0B8C6"
    if kind == "aushang":
        out.append(R(x + w * .12, y + h * .07, w * .5, h * .035, 2, ink) + R(x + w * .12, y + h * .13, w * .7, h * .02, 1, faint))
        q = w * .56
        out.append(f'<g transform="translate({x + (w - q) / 2} {y + h * .2}) scale({q / 208:.4f})">{qr(0, 0, 208, c)}</g>')
        for i in range(3):
            yy = y + h * (.66 + i * .09)
            out.append(f'<circle cx="{x + w * .16}" cy="{yy + 4}" r="{w * .045}" fill="{acc}"/>' + R(x + w * .26, yy, w * .58, h * .02, 1, faint))
    else:
        cw, ch = w / 2, h / 4
        for r in range(4):
            for col in range(2):
                cx, cy = x + col * cw, y + r * ch
                q = ch * .62
                out.append(f'<g transform="translate({cx + cw * .1} {cy + (ch - q) / 2}) scale({q / 208:.4f})">{qr(0, 0, 208, c)}</g>')
                out.append(R(cx + cw * .1 + q + 4, cy + ch * .35, cw * .3, ch * .08, 1, ink) + R(cx + cw * .1 + q + 4, cy + ch * .55, cw * .25, ch * .06, 1, faint))
        for r in range(1, 4):
            out.append(f'<line x1="{x}" y1="{y + r * ch}" x2="{x + w}" y2="{y + r * ch}" stroke="{faint}" stroke-dasharray="3 2"/>')
        out.append(f'<line x1="{x + cw}" y1="{y}" x2="{x + cw}" y2="{y + h}" stroke="{faint}" stroke-dasharray="3 2"/>')
    return "".join(out)

def print_choice(x, y, w, c, kind, active, ttl, subl):
    h = 236
    out = [R(x, y, w, h, 22, c["tint"] if active else c["card"])]
    if active: out.append(R(x + .5, y + .5, w - 1, h - 1, 21.5, "none", c["accent"], 1.5))
    out.append(mini_a4(x + (w - 96) / 2, y + 16, 96, c, kind))
    out.append(T(x + w / 2, y + 180, ttl, 14.5, 800, c["accink"] if active else c["ink"], "middle"))
    out.append(T(x + w / 2, y + 199, subl, 12, 400, c["muted"] if active else c["faint"], "middle"))
    if active: out.append(check_circle(x + w - 36, y + 10, True, c, 12))
    return "".join(out)

def p_drucken(c, theme, sub):
    """Шторка «Blatt drucken»: выбрать вид, галочка «Anleitung», дальше — окно печати браузера."""
    inner = p_einladen(c, theme, sub)
    inner = inner[inner.index("</defs>") + 7: inner.rindex("</svg>")]
    top = 230
    b = [inner, overlay(c, 390, 844), sheet(top, c, "Klasse 9b · Link aus Einladen", "Blatt drucken")]
    y = top + 96
    b.append(print_choice(18, y, 173, c, "aushang", True, "Aushang", "1 großer QR"))
    b.append(print_choice(199, y, 173, c, "kaertchen", False, "Kärtchen", "8 zum Ausschneiden"))
    y += 236 + 16
    b.append(R(18, y, 354, 67, 22, c["card"]) + T(32, y + 30, "Kurze Anleitung aufs Blatt", 15, 400, c["ink"])
             + T(32, y + 49, "3 Schritte: scannen, Kurse wählen, fertig", 12, 400, c["faint"]) + switch(316, y + 21.5, True, c))
    y += 67 + 14
    b.append(hint(18, y + 6, "Auf dem Blatt steht nur der Einladungslink — keine", c) + hint(18, y + 23, "Namen. Link aus = Blatt geht nicht mehr.", c))
    b.append(button(18, 844 - 76, 354, "Drucken", c, icon=PRINT))
    return page(390, 844, c, "".join(b))

def p_code_qr(c, theme, sub):
    """Admin · Lehrer-Codes: nach «Code erstellen» — Code nur jetzt sichtbar, neu mit QR und «Drucken»."""
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Admin", c), title(66, 65, "Lehrer-Codes", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(R(18, 100, 354, 150, 22, c["card"]))
    for i, (who, subj) in enumerate([("Mü", "Mathe, Physik"), ("Kle", "Deutsch")]):
        ry = 100 + i * 75
        if i: b.append(HLINE(32, 358, ry, c))
        b.append(T(32, ry + 32, who, 15, 800, c["ink"]) + T(32, ry + 52, subj, 12, 400, c["faint"]))
    top = 170
    b.append(overlay(c, 390, 844) + sheet(top, c, "Lehrer-Code · Ric · Physik", "Code erstellt"))
    y = top + 96
    b.append(R(18, y, 354, 300, 26, c["card"]) + qr(105, y + 20, 180, c))
    b.append(T(195, y + 236, "ORB-L-4M8T-K2QX", 22, 900, c["ink"], "middle", ls=1.4))
    b.append(T(195, y + 266, "Scannen = Code schon eingetragen", 12.5, 400, c["faint"], "middle"))
    y += 300 + 14
    b.append(R(18, y, 354, 44, 16, c["tint"]) + ICON(31, y + 14, 0.67, c["accink"], WARN, 2) + T(57, y + 27, "Nur jetzt sichtbar. Danach nur noch „…K2QX“.", 13, 400, c["accink"]))
    y += 44 + 16
    bw = 173
    b.append(button(18, y, bw, "Kopieren", c, "sand", COPY) + button(199, y, bw, "Drucken", c, "sand", PRINT))
    b.append(button(18, 844 - 76, 354, "Fertig", c))
    return page(390, 844, c, "".join(b))

# ════════════════ Kurz erklärt (erster Start) ════════════════
TIPS = [
    ("1 von 3", "Tippe auf einen Tag", ["Oben die Woche, darunter der Tag. Ausfälle", "und Vertretungen sind farbig markiert."]),
    ("2 von 3", "Stunde lange drücken", ["Notiz schreiben, Hausaufgabe oder Test", "eintragen, Fachfarbe ändern."]),
    ("3 von 3", "Aufgaben abhaken", ["Hausaufgaben und eigene Aufgaben in einer", "Liste. Mit Sync-Code auch auf dem PC."]),
]

def illu_woche(x, y, w, h, c, sub):
    out = [R(x, y, w, h, 22, c["sand"])]
    cols, cw, chh = 5, (w - 40 - 4 * 6) / 5, 34
    codes = [["De", "Ma", "En", "Ph"], ["Ma", "Ge", "De", "Sp"], ["En", "Ma", "Ph", "Ku"], ["De", "Bio", "Ma", "En"], ["Ge", "De", "Sp", "Ma"]]
    for i in range(cols):
        cx = x + 20 + i * (cw + 6)
        sel = i == 2
        out.append(T(cx + cw / 2, y + 30, ["MO", "DI", "MI", "DO", "FR"][i], 10, 800, c["accink"] if sel else c["faint"], "middle"))
        if sel: out.append(R(cx - 3, y + 40, cw + 6, 4 * (chh + 5) + 6, 12, "none", c["accent"], 2))
        for r in range(4):
            code = codes[i][r]
            _, tint, tcol = sub[code]
            aus = (i, r) == (1, 2)
            out.append(R(cx, y + 44 + r * (chh + 5), cw, chh, 9, c["card"] if aus else tint)
                       + T(cx + 8, y + 44 + r * (chh + 5) + 21, code, 11, 800, c["faint"] if aus else tcol))
            if aus: out.append(R(cx + 8, y + 44 + r * (chh + 5) + 16.5, 14, 1, 0, c["faint"]))
    out.append(f'<g transform="translate({x + 20 + 2 * (cw + 6) + cw * .45} {y + 44 + 2 * (chh + 5)})">'
               f'<circle cx="12" cy="12" r="20" fill="{c["accent"]}" fill-opacity="0.18"/>'
               f'<g transform="scale(1.3)" fill="{c["card"]}" stroke="{c["ink"]}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{TAP}</g></g>')
    return "".join(out)

def illu_menu(x, y, w, h, c, sub):
    out = [R(x, y, w, h, 22, c["sand"])]
    _, tint, tcol = sub["Ma"]
    out.append(R(x + 20, y + 22, w - 40, 54, 16, tint) + T(x + 34, y + 46, "2. Stunde", 11, 700, c["muted"]) + T(x + 34, y + 64, "Mathe", 15, 800, tcol))
    mx, my, mw = x + 60, y + 88, w - 80
    out.append(R(mx, my, mw, 4 * 38 + 8, 18, c["card"], extra=' filter="url(#nsh0)"'))
    for i, (ic, t, acc) in enumerate([(FILE, "Notiz zur Stunde", False), (BOOK, "Hausaufgabe geben", True), (FLAG, "Test eintragen", True), (I_FARBEN, "Fachfarbe ändern", False)]):
        ry = my + 4 + i * 38
        col = c["accink"] if acc else c["muted"]
        out.append(ICON(mx + 14, ry + 10, 0.71, col, ic, 1.9) + T(mx + 42, ry + 24, t, 13.5, 600 if acc else 500, c["accink"] if acc else c["ink"]))
    out.append(f'<g transform="translate({x + w - 110} {y + 40})"><circle cx="12" cy="12" r="20" fill="{c["accent"]}" fill-opacity="0.18"/>'
               f'<g transform="scale(1.3)" fill="{c["card"]}" stroke="{c["ink"]}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{TAP}</g></g>')
    return "".join(out)

def illu_aufgaben(x, y, w, h, c, sub):
    out = [R(x, y, w, h, 22, c["sand"])]
    rows = [("Ma", "Buch S. 54, Nr. 3", True), ("En", "Workbook p. 23", False), (None, "Sportsachen", False)]
    for i, (code, t, done) in enumerate(rows):
        ry = y + 22 + i * 58
        out.append(R(x + 20, ry, w - 40, 50, 16, c["card"]))
        if code:
            _, tint, tcol = sub[code]
            out.append(R(x + 30, ry + 9, 32, 32, 10, tint) + T(x + 46, ry + 30, code, 11, 900, tcol, "middle"))
        else:
            out.append(R(x + 30, ry + 9, 32, 32, 10, c["sand"]) + ICON(x + 38, ry + 17, 0.67, c["muted"], USER, 2))
        out.append(T(x + 74, ry + 30, t, 14, 800, c["faint"] if done else c["ink"]))
        if done: out.append(R(x + 74, ry + 25, g.tw(t, 14, 800) * .87, 1.2, 0, c["faint"]))
        out.append(check_circle(x + w - 58, ry + 12, done, c))
    sy = y + 22 + 3 * 58 + 4
    out.append(ICON(x + w / 2 - 70, sy + 3, 0.67, c["accink"], PHONE, 2) + ICON(x + w / 2 - 50, sy + 3, 0.67, c["accink"], I_SYNC, 2)
               + ICON(x + w / 2 - 30, sy + 3, 0.67, c["accink"], MONITOR, 2) + T(x + w / 2 - 4, sy + 16, "per Sync-Code", 12.5, 700, c["accink"]))
    return "".join(out)

ILLU = [illu_woche, illu_menu, illu_aufgaben]

def dots(cx, y, n, active, c):
    out = []
    x = cx - (n * 8 + (n - 1) * 6 + 14) / 2
    for i in range(n):
        w = 22 if i == active else 8
        out.append(R(x, y, w, 8, 4, c["accent"] if i == active else c["faint2"])); x += w + 6
    return "".join(out)

def tip_body(x, y, w, c, sub, i, ih=256, pc=False):
    ey, ttl, lines = TIPS[i]
    if pc and i == 1: ttl = "Rechtsklick auf eine Stunde"
    out = [ILLU[i](x, y, w, ih, c, sub)]
    y += ih + 30
    out.append(eyebrow(x, y, f"Kurz erklärt · {ey}", c, True) + title(x, y + 34, ttl, c, 26))
    for k, ln in enumerate(lines):
        out.append(T(x, y + 64 + k * 21, ln, 14.5, 400, c["muted"]))
    return "".join(out)

def p_tipp(c, theme, sub, i):
    inner, w, h = g.base("04 Woche", theme)
    top = 96
    b = [inner, sheet_bg(c, top)]
    b.append(T(372, top + 44, "Überspringen", 13.5, 700, c["muted"], "end"))
    b.append(tip_body(18, top + 66, 354, c, sub, i))
    b.append(dots(195, 844 - 112, 3, i, c))
    last = i == 2
    b.append(button(18, 844 - 76, 354, "Los geht’s" if last else "Weiter", c, icon=CHECK if last else ARROW))
    return page(390, 844, c, "".join(b))

# ════════════════ A4 (Papier, immer hell) ════════════════
A4W, A4H = 794, 1123
LOGO = lambda x, y, k, c: (f'<g transform="translate({x} {y}) scale({k})" fill="none">'
                           f'<ellipse cx="38" cy="38" rx="33" ry="13.5" stroke="#6C4DF6" stroke-width="5" transform="rotate(-28 38 38)"/>'
                           f'<circle cx="38" cy="38" r="11" fill="#2A2433"/><circle cx="64" cy="25" r="5.5" fill="#6C4DF6"/></g>')
STEPS = [("Kamera öffnen und QR scannen", "Oder den Link oben eintippen."), ("Deine Kurse antippen", "Nur einmal — ändern geht unter Mehr."),
         ("Fertig: Plan, Tests, Aufgaben", "Tipp: auf den Home-Bildschirm legen.")]

def a4_page(body):
    c = g.LIGHT
    return page(A4W, A4H, c, R(0, 0, A4W, A4H, 0, "#FFFFFF") + body)

def a4_aushang(c_, theme, sub):
    c = g.LIGHT
    b = [LOGO(64, 56, 0.6, c), T(118, 88, "ORBook", 26, 900, c["ink"]), T(730, 88, "Klasse 9b · Meine Schule", 15, 700, c["faint"], "end")]
    b.append(T(64, 172, "Unser Stundenplan", 46, 900, c["ink"], ls=-0.7) + T(64, 226, "aufs Handy", 46, 900, c["accent"], ls=-0.7))
    b.append(T(64, 266, "Vertretungen, Tests und Hausaufgaben der 9b — immer aktuell.", 17, 400, c["muted"]))
    b.append(R(64, 300, 666, 420, 34, c["sand"]) + qr(227, 324, 340, c))
    b.append(T(397, 758, "orbook.orbitium.net/i/K7MQ-2XPA", 22, 900, c["accink"], "middle"))
    y = 798
    for i, (t1, t2) in enumerate(STEPS):
        x = 64 + i * 230
        b.append(R(x, y, 206, 172, 24, c["sand"]) + f'<circle cx="{x + 34}" cy="{y + 36}" r="18" fill="{c["accent"]}"/>'
                 + T(x + 34, y + 42, str(i + 1), 17, 900, "#FFFFFF", "middle"))
        l1 = _wrap(t1, 17)
        for k, ln in enumerate(l1):
            b.append(T(x + 18, y + 84 + k * 21, ln, 16, 800, c["ink"]))
        for k, ln in enumerate(_wrap(t2, 24)):
            b.append(T(x + 18, y + 84 + 21 * len(l1) + 6 + k * 18, ln, 13, 400, c["muted"]))
    b.append(f'<line x1="64" y1="1012" x2="730" y2="1012" stroke="{c["rule"]}"/>')
    b.append(T(64, 1044, "Kein Konto, keine E-Mail, keine Namen. Der Link gilt bis 31.07.2027.", 13, 400, c["muted"]))
    b.append(T(64, 1066, "Fragen? Admin der Klasse. Bitte nur in der Klasse aufhängen.", 13, 400, c["muted"]))
    b.append(T(730, 1066, "Teil von ORBitium", 13, 700, c["faint"], "end"))
    return a4_page("".join(b))

def _wrap(text, n):
    out, cur = [], ""
    for w in text.split():
        if cur and len(cur) + 1 + len(w) > n: out.append(cur); cur = w
        else: cur = f"{cur} {w}".strip()
    return out + [cur]

def a4_kaertchen(c_, theme, sub):
    c = g.LIGHT
    cw, ch, m = A4W / 2, A4H / 4, 0
    b = []
    for r in range(4):
        for col in range(2):
            x, y = col * cw, r * ch
            b.append(qr(x + 28, y + 40, 200, c))
            tx = x + 246
            b.append(LOGO(tx, y + 44, 0.36, c) + T(tx + 34, y + 64, "ORBook", 16, 900, c["ink"]))
            b.append(T(tx, y + 98, "Klasse 9b", 20, 900, c["ink"]))
            b.append(T(tx, y + 120, "Plan, Tests, Aufgaben", 12.5, 400, c["muted"]))
            for k, ln in enumerate(["1 Scannen", "2 Kurse antippen", "3 Fertig"]):
                b.append(T(tx, y + 152 + k * 19, ln[0], 12.5, 900, c["accent"]) + T(tx + 14, y + 152 + k * 19, ln[2:], 12.5, 700, c["ink"]))
            b.append(T(x + 28, y + 262, "orbook.orbitium.net/i/K7MQ-2XPA", 11.5, 800, c["accink"]))
    dash = f'stroke="{c["faint2"]}" stroke-width="1" stroke-dasharray="6 4"'
    for r in range(1, 4): b.append(f'<line x1="0" y1="{r * ch}" x2="{A4W}" y2="{r * ch}" {dash}/>')
    b.append(f'<line x1="{cw}" y1="0" x2="{cw}" y2="{A4H}" {dash}/>')
    b.append(f'<g transform="translate({cw - 9} {ch - 10})" fill="#FFFFFF">{R(-4, 0, 26, 20, 4, "#FFFFFF")}</g>'
             + ICON(cw - 9, ch - 9, 0.75, c["faint"], SCISSORS, 1.8))
    return a4_page("".join(b))

def a4_lehrer(c_, theme, sub):
    c = g.LIGHT
    b = [LOGO(64, 56, 0.6, c), T(118, 88, "ORBook", 26, 900, c["ink"]), T(730, 88, "Klasse 9b · Meine Schule", 15, 700, c["faint"], "end")]
    b.append(T(64, 172, "Ihr Zugang", 46, 900, c["ink"], ls=-0.7) + T(64, 226, "als Lehrkraft", 46, 900, c["accent"], ls=-0.7))
    b.append(T(64, 266, "Für Ric · Physik. Persönlich — bitte nicht weitergeben.", 17, 400, c["muted"]))
    b.append(R(64, 300, 300, 300, 30, c["sand"]) + qr(84, 320, 260, c))
    b.append(T(400, 344, "Lehrer-Code", 14, 800, c["faint"]) + T(400, 386, "ORB-L-4M8T-K2QX", 30, 900, c["ink"], ls=1.6))
    for i, (t1, t2) in enumerate([("QR scannen", "Der Code ist dann schon eingetragen."),
                                  ("Oder: orbook.orbitium.net", "„Lehrkraft? Mit Lehrer-Code anmelden“"),
                                  ("„Anmelden“ tippen", "Gilt auf diesem Gerät bis Schuljahresende.")]):
        y = 432 + i * 56
        b.append(f'<circle cx="{414}" cy="{y + 6}" r="14" fill="{c["accent"]}"/>' + T(414, y + 11.5, str(i + 1), 14, 900, "#FFFFFF", "middle"))
        b.append(T(440, y + 4, t1, 15.5, 800, c["ink"]) + T(440, y + 24, t2, 13, 400, c["muted"]))
    b.append(T(64, 664, "Was Sie damit können", 20, 900, c["ink"]))
    for i, (t1, t2) in enumerate([("Den Plan der 9b sehen", "wie die Schülerinnen und Schüler, mit allen Kursen"),
                                  ("Tests und Hausaufgaben eintragen", "für Physik — die Klasse sieht sie sofort"),
                                  ("Materialien teilen", "Links von Google Drive oder OneDrive")]):
        y = 700 + i * 58
        b.append(R(64, y, 666, 48, 16, c["sand"]) + ICON(82, y + 14, 0.83, c["accink"], CHECK, 2.2)
                 + T(114, y + 30, S(t1, 800, c["ink"]) + S("  " + t2, 400, c["muted"]), 14.5, 400, c["ink"], raw=True))
    b.append(f'<line x1="64" y1="1012" x2="730" y2="1012" stroke="{c["rule"]}"/>')
    b.append(T(64, 1044, "Code verloren? Der Admin sperrt ihn und gibt Ihnen einen neuen.", 13, 400, c["muted"]))
    b.append(T(64, 1066, "Ausgedruckt am 17.09.2026", 13, 400, c["muted"]) + T(730, 1066, "Teil von ORBitium", 13, 700, c["faint"], "end"))
    return a4_page("".join(b))

# ════════════════ Computer ════════════════
def pc_aufgaben(c, theme, sub):
    inner = m24.pc_page("14 Klausuren", theme, c, [(">Klausuren<", ">Tests<")])[0]
    b = [inner, R(262, 0, 1178, 900, 0, c["paper"])]
    b.append(eyebrow(284, 39, "Ab heute · 4 offen · 3 erledigt", c) + title(284, 80, "Aufgaben", c, 38))
    b.append(R(940, 45, 274, 36, 18, c["card"], c["rule"]) + ICON(956, 54, 0.67, c["faint"], g.SEARCH, 2) + T(980, 68, "Aufgabe oder Fach suchen", 13.5, 400, c["faint2"]))
    b.append(R(1224, 40, 180, 48, 24, c["accent"]) + ICON(1244, 56, 0.67, c["on"], PLUS, 2.2) + T(1268, 69, "Eigene Aufgabe", 14.5, 800, c["on"]))
    b.append(list_switch(284, 110, 420, c, 1, (4, 4, 2)))
    x, w, y = 284, 744, 170
    for i, a in enumerate(AUFGABEN):
        sec, day, wd, code, who, text, when, own, done = a
        if sec:
            if i: y += 10
            b.append(label(x, y + 12, sec, c)); y += 24
        b.append(task_row(x, y, w, c, sub, day, wd, code, who, text, when, own, done, sel=i == 0, h=60)); y += 68
    y += 10
    b.append(label(x, y + 12, "Erledigt · 3", c) + T(x + w, y + 12, "Zuklappen", 12.5, 700, c["accink"], "end")); y += 24
    for e in ERLEDIGT:
        b.append(task_row(x, y, w, c, sub, e[0], e[1], e[2], e[3], e[4], e[5], e[6], True, h=60)); y += 68
    # rechte Spalte: Fortschritt + Hinweis
    rx, rw = 1064, 340
    b.append(R(rx, 110, rw, 150, 24, c["card"]) + T(rx + 22, 146, "Diese Woche", 12.5, 800, c["faint"])
             + T(rx + 22, 190, "3", 40, 900, c["accink"]) + T(rx + 60, 190, "von 7 erledigt", 16, 800, c["ink"]))
    b.append(R(rx + 22, 210, rw - 44, 10, 5, c["sand"]) + R(rx + 22, 210, (rw - 44) * 3 / 7, 10, 5, c["accent"]))
    b.append(T(rx + 22, 242, "Noch offen bis morgen: 2", 12.5, 400, c["faint"]))
    b.append(note_box(rx, 280, rw, [S("Abhaken sieht nur du.", 700, c["ink"]), g.esc("Mit Sync-Code auch auf dem Handy.")], c, LOCK))
    return page(1440, 900, c, "".join(b))

PC_SUB = [("Seiten", [("Statistik", BARS), ("Neuigkeiten", SPARK), ("Materialien", m15.FOLDER), ("Kurz erklärt", INFO), ("Datenschutz", I_SHIELD)]),
          ("Einstellungen", [("Meine Kurse", I_KURSE), ("Darstellung", I_DARST), ("Fachfarben", I_FARBEN), ("Synchronisieren", I_SYNC), ("Editor-Code", I_KEY)])]

def pc_sync(c, theme, sub):
    inner = m22.pc_base("22 Einstellungen · Übersicht", theme)
    old = m22.SUBNAV
    m22.SUBNAV = PC_SUB
    b = [inner, R(250, 0, 1190, 900, 0, c["paper"]), m22.pc_sidebar(inner, c, True)]
    b.append(eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38))
    b.append(m22.pc_subnav(c, "Synchronisieren"))
    m22.SUBNAV = old
    X = 558
    b.append(T(X, 132, "Synchronisieren", 26, 900, c["ink"], ls=-0.39))
    b.append(T(X, 166, "Alles von diesem Gerät auch auf deinem Handy — ohne Konto und ohne Namen.", 14, 400, c["muted"]))
    card, h = code_card(X, 190, 470, c, qr_btn=False); b.append(card)
    b.append(label(X, 364, "Was wird synchronisiert", c))
    card, h2 = what_card(X, 376, 470, c); b.append(card)
    y = 376 + h2 + 12
    b.append(R(X, y, 470, 44, 16, c["tint"]) + ICON(X + 13, y + 14, 0.67, c["accink"], WARN, 2) + T(X + 39, y + 27, "Code weg = Daten weg. Schreib ihn dir auf.", 13, 400, c["accink"]))
    y += 44 + 28
    b.append(label(X, y, "Anderes Gerät verbinden", c)); y += 12
    b.append(R(X, y, 330, 52, 16, c["field"]) + T(X + 17, y + 34, "XXXX-XXXX-XXXX-…", 19, 900, c["faint2"], ls=1.2))
    b.append(button(X + 342, y + 2, 128, "Verbinden", c, icon=I_SYNC))
    # QR rechts: Hauptweg PC → Handy
    qx, qw = 1060, 344
    b.append(R(qx, 190, qw, 430, 26, c["card"]) + T(qx + 22, 218, "Aufs Handy holen", 12.5, 800, c["faint"]) + qr(qx + 52, 236, 240, c))
    b.append(T(qx + qw / 2, 512, "Mit der Handy-Kamera scannen", 14.5, 800, c["ink"], "middle"))
    b.append(T(qx + qw / 2, 534, "ORBook öffnet sich und fragt kurz nach.", 12.5, 400, c["faint"], "middle"))
    b.append(R(qx + 22, 560, qw - 44, 40, 14, c["sand"]) + ICON(qx + 36, 572, 0.67, c["muted"], LOCK, 2) + T(qx + 62, 585, "Nur deinen eigenen Geräten zeigen", 12.5, 400, c["muted"]))
    b.append(button(X, 790, 220, "Neuen Code erzeugen", c, "sand", m16.REDO))
    return page(1440, 900, c, "".join(b))

def pc_drucken(c, theme, sub):
    """Окно «Blatt drucken» на ПК: слева выбор, справа большое превью A4."""
    inner = m22.pc_base("22 Einstellungen · Übersicht", theme)
    X, Y, W, H = 300, 60, 840, 780
    b = [inner, overlay(c, 1440, 900), R(X, Y, W, H, 28, c["paper"], extra=' filter="url(#nsh0)"')]
    b.append(eyebrow(X + 28, Y + 40, "Klasse 9b · Link aus Einladen", c) + title(X + 28, Y + 74, "Blatt drucken", c, 28))
    b.append(R(X + W - 64, Y + 22, 36, 36, 18, c["card"]) + ICON(X + W - 54, Y + 32, 0.67, c["ink"], CLOSE, 2.2))
    lx, lw = X + 28, 300
    ly = Y + 104
    b.append(label(lx, ly, "Art", c)); ly += 12
    for i, (kind, ttl, subl) in enumerate([("aushang", "Aushang", "1 großer QR für die Pinnwand"), ("kaertchen", "Kärtchen", "8 pro Blatt zum Ausschneiden")]):
        on = i == 0
        b.append(R(lx, ly, lw, 72, 20, c["tint"] if on else c["card"]))
        if on: b.append(R(lx + .5, ly + .5, lw - 1, 71, 19.5, "none", c["accent"], 1.5))
        b.append(mini_a4(lx + 14, ly + 10, 37, c, kind))
        b.append(T(lx + 66, ly + 32, ttl, 15, 800, c["accink"] if on else c["ink"]) + T(lx + 66, ly + 51, subl, 12, 400, c["faint"]))
        if on: b.append(check_circle(lx + lw - 38, ly + 23, True, c, 12))
        ly += 82
    ly += 12
    b.append(R(lx, ly, lw, 67, 22, c["card"]) + T(lx + 14, ly + 30, "Kurze Anleitung", 15, 400, c["ink"]) + T(lx + 14, ly + 49, "scannen, Kurse wählen, fertig", 12, 400, c["faint"]) + switch(lx + lw - 56, ly + 21.5, True, c))
    ly += 67 + 16
    b.append(hint(lx, ly + 6, "Auf dem Blatt steht nur der Einladungs-", c) + hint(lx, ly + 23, "link — keine Namen. Link aus = Blatt", c) + hint(lx, ly + 40, "geht nicht mehr.", c))
    # Vorschau
    px, py, pw = X + 360, Y + 96, 452
    ph = H - 96 - 96
    b.append(R(px, py, pw, ph, 20, c["sand"]))
    a4 = a4_aushang(c, theme, sub)
    a4 = a4[a4.index("</defs>") + 7: a4.rindex("</svg>")]
    k = (ph - 40) / A4H
    aw = A4W * k
    b.append(f'<g transform="translate({px + (pw - aw) / 2:.1f} {py + 20}) scale({k:.4f})" filter="url(#nsh1)">{a4}</g>')
    fy = Y + H - 76
    b.append(R(X + 28, fy - 8, W - 56, 1, 0, c["hair"]))
    b.append(T(X + 28, fy + 37, "Öffnet das Druckfenster · Strg + P", 12, 400, c["faint"]))
    b.append(button(X + W - 28 - 160 - 10 - 130, fy + 8, 130, "Abbrechen", c, "sand", None) + button(X + W - 28 - 160, fy + 8, 160, "Drucken", c, icon=PRINT))
    return page(1440, 900, c, "".join(b))

def pc_tipp(c, theme, sub):
    inner, w, h = g.base("05 Woche · Stunden + gewählter Tag", theme, "PC")
    X, W, H = 470, 500, 640
    Y = (900 - H) / 2
    b = [inner, overlay(c, 1440, 900), R(X, Y, W, H, 28, c["paper"], extra=' filter="url(#nsh0)"')]
    b.append(T(X + W - 28, Y + 44, "Überspringen", 13.5, 700, c["muted"], "end"))
    b.append(tip_body(X + 28, Y + 64, W - 56, c, sub, 1, ih=280, pc=True))
    b.append(dots(X + W / 2, Y + H - 108, 3, 1, c))
    b.append(button(X + 28, Y + H - 76, W - 56, "Weiter", c, icon=ARROW))
    b.append(T(X + W / 2, Y + H - 92 - 26, "", 1, 400, c["faint"]))
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-aufgaben": p_aufgaben,
    "handy-02-abgehakt": p_abgehakt,
    "handy-03-eigene-aufgabe": p_eigene,
    "handy-04-aufgaben-leer": p_leer,
    "handy-05-tag": p_tag,
    "handy-06-mehr": p_mehr,
    "handy-07-sync": p_sync,
    "handy-08-sync-qr": p_sync_qr,
    "handy-09-verbinden": p_verbinden,
    "handy-10-einladen": p_einladen,
    "handy-11-drucken": p_drucken,
    "handy-12-lehrer-code-qr": p_code_qr,
    "handy-13-tipp-1": lambda c, t, s: p_tipp(c, t, s, 0),
    "handy-14-tipp-2": lambda c, t, s: p_tipp(c, t, s, 1),
    "handy-15-tipp-3": lambda c, t, s: p_tipp(c, t, s, 2),
    "pc-01-aufgaben": pc_aufgaben,
    "pc-02-sync": pc_sync,
    "pc-03-drucken": pc_drucken,
    "pc-04-tipp": pc_tipp,
}
PAPER = {"a4-01-aushang": a4_aushang, "a4-02-kaertchen": a4_kaertchen, "a4-03-lehrer-code": a4_lehrer}

if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    for name, fn in PAPER.items():
        open(os.path.join(OUT, f"{name}.svg"), "w", encoding="utf-8").write(fn(g.LIGHT, "hell", g.SUBJ["hell"]))
        n += 1
    print(n, "files")
