# Генератор макетов части 18 «Termine» — Ausflug, Elternabend, freie Tage заранее.
# Помощники и цвета — из генераторов частей 14 и 15 (те же токены Soft).
# Основа — оригиналы ORBook Soft: 04 «Woche», 05 «Tag · Liste», 13/14 «Klausuren» + «Details», 16 «Klausur eintragen»,
# 17 «löschen», 36 «leer», 38 «Toasts», 42 «neuer Code», PC 05 «Woche», PC 14/15/17.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g15", os.path.join(HERE, "..", "15-materialien", "gen.py"))
m15 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m15)
g = m15.g
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, note_box, svg, overlay, base, chip, badge, checkbox = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.note_box, g.svg, g.overlay, g.base,
    g.chip, g.badge, g.checkbox)
CHECK, CHEV_R, BACK, CLOSE, PLUS, PEN, TRASH, SHARE, USER, CAL, SEARCH = (
    g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.PLUS, g.PEN, g.TRASH, g.SHARE, g.USER, g.CAL, g.SEARCH)
toast, sheet_bg, INFO = m15.toast, m15.sheet_bg, m15.INFO
NAMES = g.NAMES
PIN = P("M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z") + '<circle cx="12" cy="10" r="2.5"/>'
CLOCK = '<circle cx="12" cy="12" r="9"/>' + P("M12 7v5l3 2")
SUN = '<circle cx="12" cy="12" r="4"/>' + P("M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4")

def fit(t, maxw, size):
    """Обрезать текст с «…», если не влезает (как text-overflow: ellipsis)."""
    if g.tw(t, size) <= maxw: return t
    while t and g.tw(t + "…", size) > maxw: t = t[:-1]
    return t.rstrip() + "…"

# ── Данные-примеры (сегодня — Mi, 17. Sept, как в оригиналах) ──
# (Abschnitt, Tag, Wochentag, Art, Titel, Für, Zeit/Ort, von, rechts)
TERMINE = [
    ("Diese Woche", "17", "MI", "Sonstiges", "Klassenfoto", None, "3. Std · Aula", None, "heute"),
    (None, "18", "DO", "Elternabend", "Elternabend 9b", None, "19:00 · Raum 102", "Mü", "morgen"),
    ("Später", "29", "MO", "Ausflug", "Exkursion Phänomenta", "Ph", "07:45–15:00", "Ric", "in 12 Tagen"),
    (None, "02", "DO", "Frei", "Pädagogischer Tag", None, "kein Unterricht", None, "2. Okt"),
    (None, "13", "MO", "Frei", "Herbstferien", None, "bis Sa, 25. Okt", None, "13. Okt"),
]
KIND_BADGE = {"Ausflug": "AUSFLUG", "Elternabend": "ELTERNABEND", "Frei": "FREI", "Sonstiges": "TERMIN"}

def kind_colors(kind, c):  # «frei» — зелёный (как «Plan aktuell»), остальное — фиолетовый tint
    return (c["oktint"], c["ok"], "ok") if kind == "Frei" else (c["tint"], c["accink"], "tint")

def for_text(code):  # «Physik» или «Ganze Klasse»
    return NAMES[code] if code else "Ganze Klasse"

def t_meta(t):
    _, _, _, kind, _, code, when, who, _ = t
    head = f"{NAMES[code]} · " if code else ""  # Fach nur bei Kurs-Terminen; sonst gilt er für alle
    return head + when + (f" · von {who}" if who else "")

def t_tile(x, y, day, wd, kind, c, w=38, h=44):
    tint, ink, _ = kind_colors(kind, c)
    return (R(x, y, w, h, 12, tint) + T(x + w / 2, y + 21.5, day, 19, 900, ink, "middle", -0.28)
            + T(x + w / 2, y + 34.5, wd, 9, 700, ink, "middle", 0.54))

def t_row(x, y, w, t, c, sel=False, fresh=False):
    _, day, wd, kind, ttl, code, _, _, right = t
    out = [R(x, y, w, 64, 22, c["card"])]
    if sel: out.append(R(x + .5, y + .5, w - 1, 63, 21.5, "none", c["accent"]))
    out.append(t_tile(x + 12, y + 10, day, wd, kind, c))
    bd, bw = badge(x + 62, y + 11, KIND_BADGE[kind], c, kind_colors(kind, c)[2]); out.append(bd)
    out.append(T(x + 62 + bw + 7, y + 24.5, fit(t_meta(t), w - 62 - bw - 7 - 78, 11.5), 11.5, 400, c["faint"]))
    out.append(T(x + 62, y + 48.5, ttl, 14.5, 800, c["ink"]))
    if fresh:
        nb, nw = badge(x + w - 14 - 40, y + 36, "NEU", c, "tint"); out.append(nb)
    else:
        out.append(T(x + w - 14, y + 37, right, 12, 700, c["accink"] if sel else c["faint"], "end"))
    return "".join(out)

def t_list(x, y, w, c, sel=None, fresh=None):
    out = []
    for i, t in enumerate(TERMINE):
        if t[0]:
            if i: y += 18
            out.append(T(x, y + 12, t[0], 12.5, 800, c["faint"])); y += 26
        out.append(t_row(x, y, w, t, c, sel=t[4] == sel, fresh=t[4] == fresh)); y += 72
    return "".join(out), y

def shifted(inner, W, H, moves, uid):
    """Оригинал с вставками: каждая колонка (x0, x1) ниже cut сдвигается на dy, остальное стоит на месте."""
    static = []
    xs = 0
    for x0, x1, cut, dy in sorted(moves):
        static.append(f'<rect x="{xs}" y="0" width="{x0 - xs}" height="{H}"/>')
        static.append(f'<rect x="{x0}" y="0" width="{x1 - x0}" height="{cut}"/>')
        xs = x1
    static.append(f'<rect x="{xs}" y="0" width="{W - xs}" height="{H}"/>')
    out = [f'<clipPath id="{uid}s">{"".join(static)}</clipPath><g clip-path="url(#{uid}s)">{inner}</g>']
    for i, (x0, x1, cut, dy) in enumerate(moves):
        out.append(f'<clipPath id="{uid}m{i}"><rect x="{x0}" y="{cut}" width="{x1 - x0}" height="{H}"/></clipPath>'
                   f'<g transform="translate(0 {dy})"><g clip-path="url(#{uid}m{i})">{inner}</g></g>')
    return "".join(out)

def plain_chip(x, y, text, c, on=False, dot=None, h=38):
    """Выбор в форме как 16 «Fach»: выбранный — tint и рамка 2 px; с точкой — в цвете предмета."""
    w = g.tw(text, 13) + (40 if dot else 28)
    if on:
        fill, line = (dot[1], dot[0]) if dot else (c["tint"], c["accent"])
        out = R(x, y, w, h, h / 2, fill) + R(x + 1, y + 1, w - 2, h - 2, h / 2 - 1, "none", line, 2)
    else:
        out = R(x + .5, y + .5, w - 1, h - 1, h / 2 - .5, "none", c["rule"])
    tx = x + 14
    if dot: out += R(x + 14, y + h / 2 - 4, 8, 8, 4, dot[0]); tx = x + 28
    return out + T(tx, y + h / 2 + 4.5, text, 13, 700, c["ink"]), w

def field(x, y, w, text, c, placeholder=False, icon=None, error=False, h=52):
    out = [R(x, y, w, h, 16, c["field"])]
    if error: out.append(R(x + 1, y + 1, w - 2, h - 2, 15, "none", c["danger"], 2))
    out.append(T(x + 17, y + h / 2 + 5.5, text, 16, 400, c["faint2"] if placeholder else c["ink"]))
    if icon: out.append(ICON(x + w - 32, y + h / 2 - 9, 0.75, c["faint"], icon))
    return "".join(out)

def countdown(x, y, w, n, unit, sub_text, c):
    """Как «2 Tage bis zur Klausur» в 14: белая карточка с рамкой accent, большая цифра."""
    return (R(x, y, w, 84, 22, c["card"]) + R(x + .5, y + .5, w - 1, 83, 21.5, "none", c["accent"])
            + T(x + 16, y + 59, n, 44, 900, c["accink"], ls=-0.66)
            + T(x + 16 + g.tw(n, 44) + 12, y + 36, unit, 15, 800, c["ink"]) + T(x + 16 + g.tw(n, 44) + 12, y + 57, sub_text, 12.5, 400, c["muted"]))

def info_rows(x, y, w, rows, c):
    """Белая карточка «Ort / Hinweis»: иконка, строки текста."""
    hh = sum(26 + 20 * len(r[1]) for r in rows)
    out = [R(x, y, w, hh, 22, c["card"])]
    yy = y
    for i, (icon, lines) in enumerate(rows):
        if i: out.append(f'<line x1="{x + 14}" y1="{yy}" x2="{x + w - 14}" y2="{yy}" stroke="{c["hair"]}" stroke-width="1"/>')
        out.append(ICON(x + 14, yy + 13, 0.67, c["muted"], icon))
        for j, ln in enumerate(lines):
            out.append(T(x + 40, yy + 27 + j * 20, ln, 14, 400, c["ink"]))
        yy += 26 + 20 * len(lines)
    return "".join(out), hh

def delete_dialog(c, x, y, w, pc=False):
    """Bestätigung wie 17 «Klausur löschen»."""
    h = 236 if pc else 250
    b = [R(x, y, w, h, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 28, c["paper"])]
    b.append(R(x + 26, y + 24, 44, 44, 22, c["dtint"]) + ICON(x + 36, y + 34, 1, c["danger"], TRASH, 1.9))
    b.append(T(x + 26, y + 102, "Termin löschen?", 25 if pc else 22, 900, c["ink"], ls=-0.35))
    lines = (["„Elternabend 9b“ verschwindet für die ganze Klasse –", "auch aus Woche und Tag. Das lässt sich nicht rückgängig machen."] if pc else
             ["„Elternabend 9b“ verschwindet für die", "ganze Klasse – auch aus Woche und Tag."])
    for i, ln in enumerate(lines):
        b.append(T(x + 26, y + 130 + i * 20, ln, 14, 400, c["muted"]))
    ly = y + h - 66
    if pc:
        b.append(f'<line x1="{x + 26}" y1="{ly}" x2="{x + w - 26}" y2="{ly}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(button(x + w - 26 - 112 - 8 - 112, ly + 12, 112, "Abbrechen", c, "sand", None))
        b.append(button(x + w - 26 - 112, ly + 12, 112, "Löschen", c, "danger", TRASH))
    else:
        bw = (w - 52 - 8) / 2
        b.append(button(x + 26, ly + 6, bw, "Abbrechen", c, "sand", None) + button(x + 26 + bw + 8, ly + 6, bw, "Löschen", c, "danger", TRASH))
    return "".join(b)

# ════════════════ Telefon ════════════════
def p_head(c, eyebrow_text="Ab heute · 5 Termine"):
    b = [eyebrow(18, 33, eyebrow_text, c), title(18, 65, "Termine", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(g.segmented(18, 85.31, 354, ["Klausuren", "Hausaufgaben", "Termine"], 2, c))
    return "".join(b)

def p_list(c, theme, sub, state="normal"):
    b = [p_head(c, "Ab heute" if state == "laden" else "Ab heute · 5 Termine")]
    if state == "laden":
        y = 140
        for n in (2, 3):
            b.append(R(18, y + 2, 90, 11, 5.5, c["skel"])); y += 26
            for _ in range(n):
                b.append(R(18, y, 354, 64, 22, c["card"]) + R(30, y + 10, 38, 44, 12, c["skel"])
                         + R(80, y + 14, 150, 11, 5.5, c["skel"]) + R(80, y + 36, 190, 13, 6.5, c["skel"]))
                y += 72
            y += 18
        b.append(g.nav_only(theme)); return svg(390, 844, c, "".join(b))
    rows, y = t_list(18, 140, 354, c, sel="Exkursion Phänomenta" if state == "details" else None,
                     fresh="Exkursion Phänomenta" if state == "gespeichert" else None)
    b.append(rows)
    b.append(ICON(18, y + 3, 0.54, c["faint"], TRASH) + T(36, y + 14, "Vergangene Termine verschwinden nach 30 Tagen.", 12, 400, c["faint"]))
    b.append(g.nav_only(theme))
    if state == "details": b.append(p_sheet(c, sub))
    if state == "gespeichert": b.append(toast(18, 698, 354, "Gespeichert · die Klasse sieht den Termin", c))
    if state == "loeschen": b.append(overlay(c, 390, 844) + delete_dialog(c, 18, 287, 354))
    return svg(390, 844, c, "".join(b))

def p_sheet(c, sub, top=318):
    """Blatt «Termin» wie 14 «Klausur · Details»: Fach-Kreis, Art, Titel, Countdown, Ort/Hinweis, Autor."""
    solid, tint, text = sub["Ph"]
    b = [sheet_bg(c, top)]
    b.append(R(18, top + 30.45, 44, 44, 22, tint) + T(40, top + 56.45, "Ph", 11.5, 900, text, "middle"))
    bd, bw = badge(74, top + 28, "AUSFLUG", c, "tint"); b.append(bd)
    b.append(T(74 + bw + 8, top + 42, "Physik", 12.5, 400, c["faint"]))
    b.append(title(74, top + 71, "Exkursion Phänomenta", c, 24))
    y = top + 91
    b.append(countdown(18, y, 354, "12", "Tage bis zum Ausflug", "Montag, 29. September · 07:45–15:00", c))
    y += 96
    rows, hh = info_rows(18, y, 354, [(PIN, ["Phänomenta Lüdenscheid"]),
                                      (INFO, ["Treffpunkt 07:30 am Bahnhof,", "8 € mitbringen."])], c)
    b.append(rows); y += hh + 12
    b.append(note_box(18, y, 354, [S("Eingetragen von ", 400, c["muted"]) + S("Ric", 800, c["ink"]) + S(" · Lehrkraft", 400, c["muted"]),
                                   "Gilt für alle mit dem Kurs Physik."], c, USER))
    y += 59.69 + 12
    b.append(button(18, y, 173, "Kalender", c, "sand", CAL) + button(199, y, 173, "Teilen", c, "sand", SHARE))
    return "".join(b)

def p_form(c, theme, sub, state="ok"):
    H = 1080
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Lehrkraft · Ric", c, accent=True), title(66, 65, "Neuer Termin", c)]
    y = 105
    b.append(label(18, y, "Art", c))
    x, cy = 18, y + 12
    for k in ("Ausflug", "Elternabend", "Frei", "Sonstiges"):
        ch, w = plain_chip(x, cy, k, c, on=k == "Ausflug")
        if x + w > 372: x, cy = 18, cy + 46; ch, w = plain_chip(x, cy, k, c, on=k == "Ausflug")
        b.append(ch); x += w + 8
    y = cy + 38 + 28
    b.append(label(18, y, "Für", c))
    ch, w = plain_chip(18, y + 12, "Ganze Klasse", c); b.append(ch)
    ch, w2 = plain_chip(18 + w + 8, y + 12, "Physik", c, on=True, dot=sub["Ph"]); b.append(ch)
    b.append(T(18, y + 70, "Physik: sehen nur Schüler mit diesem Kurs.", 12, 400, c["faint"]))
    y += 104
    b.append(label(18, y, "Titel", c))
    b.append(field(18, y + 10, 354, "Exkursion Phänomenta", c))
    b.append(T(18, y + 82, "20 von 60 Zeichen · keine Namen von Schülern", 12, 400, c["faint"]))
    y += 118
    b.append(label(18, y, "Von", c) + label(199, y, "Bis · optional", c))
    b.append(field(18, y + 10, 173, "29.09.2026", c, icon=CAL))
    err = state == "fehler"
    b.append(field(199, y + 10, 173, "25.09.2026" if err else "mehrtägig?", c, placeholder=not err, icon=CAL, error=err))
    b.append(T(18, y + 82, "Das Ende liegt vor dem Anfang." if err else "Montag · in 12 Tagen", 12.5 if err else 12, 400, c["danger"] if err else c["faint"]))
    y += 118
    b.append(label(18, y, "Uhrzeit · optional", c))
    b.append(field(18, y + 10, 173, "07:45", c, icon=CLOCK) + field(199, y + 10, 173, "15:00", c, icon=CLOCK))
    b.append(T(18, y + 82, "Leer lassen = ganzer Tag.", 12, 400, c["faint"]))
    y += 118
    b.append(label(18, y, "Ort · optional", c))
    b.append(field(18, y + 10, 354, "Phänomenta Lüdenscheid", c, icon=PIN))
    y += 90
    b.append(label(18, y, "Hinweis · optional", c))
    b.append(R(18, y + 10, 354, 84, 16, c["field"]))
    for i, ln in enumerate(["Treffpunkt 07:30 am Bahnhof,", "8 € mitbringen."]):
        b.append(T(35, y + 38 + i * 23, ln, 16, 400, c["ink"]))
    y += 108
    b.append(note_box(18, y, 354, ["Die Klasse sieht „eingetragen von Ric“. Wird", "30 Tage nach dem Termin gelöscht."], c, USER))
    save = button(18, H - 80, 354, "Speichern", c)
    b.append(f'<g opacity="0.45">{save}</g>' if err else save)
    return svg(390, H, c, "".join(b))

def p_leer(c, theme, sub):
    b = [p_head(c, "Ab heute · nichts geplant")]
    b.append(R(163, 254.47, 64, 64, 32, c["tint"]) + ICON(181, 272.47, 1.17, c["accink"], CAL, 1.8))
    b.append(T(195, 355.47, "Keine Termine", 25, 900, c["ink"], "middle", -0.37))
    for i, ln in enumerate(["Ausflüge, Elternabende und freie Tage", "stehen hier, sobald die Schule oder", "eine Lehrkraft sie einträgt."]):
        b.append(T(195, 388.47 + i * 21.7, ln, 14, 400, c["muted"], "middle"))
    b.append(g.nav_only(theme))
    return svg(390, 844, c, "".join(b))

# Woche: Termin-Streifen über der Stundentabelle (wie ganztägige Termine im Kalender)
P_COLS = [44, 110.8, 177.59, 244.39, 311.19]
WEEK_PILLS = {2: ("Klassenfoto", "Sonstiges"), 3: ("Elternabend", "Elternabend")}

def pill(x, y, w, text, kind, c, h=20, size=9.5):
    tint, ink, _ = kind_colors(kind, c)
    return R(x, y, w, h, h / 2, tint) + T(x + 7, y + h / 2 + size * 0.36, fit(text, w - 12, size), size, 800, ink)

def p_woche(c, theme, sub):
    inner, w, h = base("04 Woche", theme)
    dy = 26
    b = [shifted(inner, 390, 844, [(0, 390, 129, dy)], "pw"), R(0, 129, 390, dy, 0, c["paper"])]
    for col, (t, kind) in WEEK_PILLS.items():
        b.append(pill(P_COLS[col], 131.5, 62.8, t, kind, c))
    # Karte unter der Woche: neue Zeile «Termin» zwischen Klausur und Ausfällen
    y = 477.31 + dy
    b.append(R(18, y, 354, 121.38 + 52.5, 22, c["card"]))
    b.append(ICON(32, y + 25.69, 0.79, c["muted"], P("M5 21V4h12l-2 4 2 4H5"), 1.9))
    b.append(T(63, y + 23, "Fr · Mathe", 14.5, 500, c["ink"]) + T(63, y + 42, "Nächste Klausur · Quadratische", 12, 400, c["faint"])
             + T(63, y + 58.19, "Funktionen", 12, 400, c["faint"]) + T(340, y + 39.19, "in 2 Tagen", 13, 400, c["faint"], "end"))
    b.append(ICON(342, y + 27.19, 0.67, c["faint2"], CHEV_R))
    rows = [(CAL, "Do · Elternabend 19:00", "morgen"), (P("M5 20V11M12 20V5M19 20v-8"), "3 fallen aus · 2 Vertretungen", None)]
    for i, (ic, t, right) in enumerate(rows):
        ry = y + 68.88 + i * 52.5
        b.append(f'<line x1="32" y1="{ry}" x2="358" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(ICON(32, ry + 16, 0.79, c["accink"] if i == 0 else c["muted"], ic, 1.9) + T(63, ry + 30.5, t, 14.5, 500, c["ink"]))
        if right: b.append(T(334, ry + 30, right, 13, 400, c["faint"], "end"))
        b.append(ICON(342, ry + 17.5, 0.67, c["faint2"], CHEV_R))
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + g.nav_only(theme, "04 Woche"))  # Navigation bleibt unten
    return svg(390, 844, c, "".join(b))

def termin_box(x, y, w, c, lines, h=59.69):
    """Wie «Info zum Tag», nur in Tint: Termin des Tages, Tippen öffnet das Blatt."""
    out = [R(x, y, w, h, 16, c["tint"]), ICON(x + 13, y + 12, 0.67, c["accink"], CAL)]
    for i, ln in enumerate(lines):
        out.append(T(x + 39, y + 24 + i * 18.85, ln, 13, 400, c["muted"], raw=True))
    out.append(ICON(x + w - 28, y + h / 2 - 8, 0.67, c["faint2"], CHEV_R))
    return "".join(out)

def p_tag(c, theme, sub):
    inner, w, h = base("05 Tag · Liste", theme)
    dy = 72
    b = [shifted(inner, 390, 1000, [(0, 390, 201, dy)], "pt"), R(0, 201, 390, dy, 0, c["paper"])]
    # «Info zum Tag» bekommt einen anderen Text, damit es nicht wie der Termin aussieht
    b.append(R(18, 135.31, 354, 59.69, 16, c["sand"]) + ICON(31, 147.31, 0.67, c["muted"], INFO))
    b.append(T(57, 159.31, S("Info zum Tag: ", 700, c["ink"]) + S("Die Bibliothek ist heute", 400, c["muted"]), 13, 400, c["muted"], raw=True))
    b.append(T(57, 178.16, "ab 13:00 geschlossen.", 13, 400, c["muted"]) + ICON(344, 157, 0.67, c["faint2"], CHEV_R))
    b.append(termin_box(18, 207, 354, c, [S("Termin: ", 700, c["accink"]) + S("Klassenfoto in der 3. Stunde,", 400, c["muted"]),
                                          g.esc("Aula. Eingetragen von der Schule.")]))
    return svg(390, 1000, c, "".join(b))

def p_codes(c, theme, sub):
    """42 «Neuer Code»: neues Recht «Termine eintragen» (Lehrer-Codes haben es immer)."""
    inner, w, h = base("42 Admin · neuer Code", theme)
    dy = 64
    b = [shifted(inner, w, h + dy, [(0, w, 352, dy)], "pc"), R(0, 352, 390, dy, 0, c["paper"])]
    bd, _ = badge(22 + 34 + 134, 366.81, "NEU", c, "tint")
    b.append(checkbox(22, 366.31, False, c) + T(56, 380.81, "Termine eintragen", 14.5, 400, c["ink"]) + bd)
    b.append(T(56, 399, "Ausflüge, Elternabende, freie Tage", 12, 400, c["faint"]))
    return svg(w, h + dy, c, "".join(b))

# ════════════════ Computer ════════════════
def pc_base(c, theme):
    inner, w, h = base("14 Klausuren", theme, "PC")
    return inner + g.cover_main(c)

def mini_cal(x, y, w, c):
    """Monat wie in PC 14 rechts: Punkte = Termine, grün = frei."""
    out = [R(x, y, w, 300, 22, c["card"])]
    out.append(ICON(x + 16, y + 18, 0.67, c["ink"], BACK) + ICON(x + w - 32, y + 18, 0.67, c["ink"], CHEV_R))
    out.append(T(x + w / 2, y + 32, "September 2026", 17, 800, c["ink"], "middle"))
    cols = ["KW", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    cw = (w - 20) / 8
    for i, t in enumerate(cols):
        out.append(T(x + 10 + cw * i + cw / 2, y + 62, t, 10.5, 700, c["faint"], "middle"))
    weeks = [(36, list(range(1, 8))), (37, list(range(8, 15))), (38, list(range(15, 22))), (39, list(range(22, 29))), (40, [29, 30, 1, 2, 3, 4, 5])]
    dots = {17: "t", 18: "t", 29: "t"}
    for r, (kw, days) in enumerate(weeks):
        ry = y + 92 + r * 40
        if kw == 38: out.append(R(x + 8, ry - 20, w - 16, 32, 16, c["tint"]))
        out.append(T(x + 10 + cw / 2, ry, str(kw), 10.5, 700, c["faint"], "middle"))
        for i, d in enumerate(days):
            cx = x + 10 + cw * (i + 1) + cw / 2
            other = r == 4 and i >= 2
            if r == 4 and i == 3:  # 2. Okt Pädagogischer Tag — frei
                out.append(R(cx - 15, ry - 19, 30, 30, 15, c["oktint"]))
            if kw == 38 and d == 17:
                out.append(R(cx - 15, ry - 19, 30, 30, 15, c["accent"]))
                out.append(T(cx, ry, str(d), 13.5, 800, c["on"], "middle"))
            else:
                col = c["ok"] if (r == 4 and i == 3) else (c["faint2"] if other or i >= 5 else c["ink"])
                out.append(T(cx, ry, str(d), 13.5, 800 if kw == 38 else 400, col, "middle"))
            if dots.get(d) and not other:
                out.append(R(cx - 2.5, ry + 6, 5, 5, 2.5, c["accent"] if not (kw == 38 and d == 17) else c["on"]))
    out.append(R(x + 20, y + 300 - 26, 6, 6, 3, c["accent"]) + T(x + 32, y + 300 - 19, "Termin", 11.5, 400, c["muted"]))
    out.append(R(x + 92, y + 300 - 29, 12, 12, 6, c["oktint"]) + T(x + 110, y + 300 - 19, "frei · 2. Okt Päd. Tag", 11.5, 400, c["muted"]))
    return "".join(out)

def pc_list(c, state="normal"):
    empty = state == "leer"
    b = [eyebrow(284, 39, "Ab heute · nichts geplant" if empty else "Ab heute · 5 Termine", c), title(284, 80, "Termine", c, 38)]
    b.append(R(939.7, 45, 158, 36, 18, c["card"]) + ICON(951.7, 55, 0.58, c["faint"], SEARCH) + T(971.7, 68, "Titel oder Ort", 13, 400, c["faint2"]))
    b.append(button(1106, 40, 298, "Termin eintragen", c, icon=PLUS, h=46))
    b.append(g.segmented(284, 109, 450, ["Klausuren · 5", "Hausaufgaben · 4", "Termine · 5"], 2, c, 37))
    if empty:
        cx = 656
        b.append(R(cx - 32, 300, 64, 64, 32, c["tint"]) + ICON(cx - 14, 318, 1.17, c["accink"], CAL, 1.8))
        b.append(T(cx, 404, "Keine Termine", 28, 900, c["ink"], "middle", -0.42))
        for i, ln in enumerate(["Ausflüge, Elternabende und freie Tage stehen hier,", "sobald die Schule oder eine Lehrkraft sie einträgt."]):
            b.append(T(cx, 438 + i * 22, ln, 14.5, 400, c["muted"], "middle"))
        b.append(button(cx - 110, 494, 220, "Termin eintragen", c, "sand", PLUS))
        b.append(T(cx, 566, "Eintragen dürfen die Schule, Lehrkräfte und Codes mit Recht.", 12, 400, c["faint"], "middle"))
        return "".join(b)
    rows, y = t_list(284, 160, 744, c, sel="Elternabend 9b" if state == "panel" else None)
    b.append(rows)
    b.append(ICON(284, y + 3, 0.54, c["faint"], TRASH) + T(302, y + 14, "Vergangene Termine verschwinden nach 30 Tagen.", 12, 400, c["faint"]))
    if state != "panel":
        b.append(R(1064, 110, 340, 92, 22, c["accent"]))
        b.append(T(1084, 175, "1", 52, 900, c["on"], ls=-0.78))
        b.append(T(1128, 137, "Tag bis", 12.5, 800, c["sub"]) + T(1128, 158, "Elternabend 9b", 15, 800, c["on"]))
        b.append(f'<g opacity="0.75">{T(1128, 177, "Do, 18. Sept · 19:00 · Raum 102", 12, 400, c["on"])}</g>')
        b.append(mini_cal(1064, 218, 340, c))
    return "".join(b)

def pc_panel(c):
    """Rechtes Panel wie PC 15 «Klausur · Details» — eigener Termin der Lehrkraft (mit Bearbeiten)."""
    b = [overlay(c, 1440, 900).replace("<rect", '<rect opacity="0.55"', 1)]
    for f in ("nsh0", "nsh1", None):
        b.append(R(984, 16, 440, 868, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(eyebrow(1010, 57.5, "Termin", c))
    b.append(R(1325.13, 42, 30.88, 22, 8, c["card"], c["rule"]) + T(1332.13, 56, "Esc", 11, 600, c["muted"]) + round_btn(1364, 36, c, CLOSE, size=34))
    b.append(R(1010, 88.45, 44, 44, 22, c["tint"]) + ICON(1020, 98.45, 1, c["accink"], CAL, 1.9))
    bd, bw = badge(1066, 86, "ELTERNABEND", c, "tint"); b.append(bd)
    b.append(T(1066 + bw + 8, 100, "Ganze Klasse", 12.5, 400, c["faint"]))
    b.append(title(1066, 129, "Elternabend 9b", c, 24))
    b.append(countdown(1010, 150.91, 388, "1", "Tag bis zum Elternabend", "Donnerstag, 18. September · 19:00–20:30", c))
    rows, hh = info_rows(1010, 246.91, 388, [(PIN, ["Raum 102"]), (INFO, ["Themen: Klassenfahrt im Frühjahr und", "Betriebspraktikum."])], c)
    b.append(rows)
    y = 246.91 + hh + 12
    b.append(note_box(1010, y, 388, [S("Eingetragen von ", 400, c["muted"]) + S("Ihnen (Mü)", 800, c["ink"]) + S(" · heute 08:12", 400, c["muted"]),
                                     "Wird am 18. Oktober automatisch gelöscht."], c, USER))
    y += 59.69 + 12
    b.append(button(1010, y, 190, "Kalender", c, "sand", CAL) + button(1208, y, 190, "Teilen", c, "sand", SHARE))
    b.append(button(1010, y + 64, 388, "Bearbeiten", c, icon=PEN))
    b.append(button(1010, y + 120, 388, "Löschen", c, "danger", TRASH))
    return "".join(b)

def pc_page(c, theme, sub, state="normal"):
    b = [pc_base(c, theme), pc_list(c, state)]
    if state == "panel": b.append(pc_panel(c))
    if state == "gespeichert": b.append(toast(1044, 830, 360, "Gespeichert · die Klasse sieht den Termin", c))
    if state == "loeschen": b.append(overlay(c, 1440, 900) + delete_dialog(c, 470, 330, 500, pc=True))
    return svg(1440, 900, c, "".join(b))

def pc_form(c, theme, sub, state="ok"):
    b = [pc_base(c, theme), pc_list(c), overlay(c, 1440, 900)]
    X, Y, W, H = 340, 104, 760, 692
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(g.modal_head(X, Y, W, "Lehrkraft · Ric", "Neuer Termin", c, accent=True))
    L, Rx, cw = X + 26, X + 392, 342
    y = Y + 107
    b.append(label(L, y, "Art", c))
    x = L
    for k in ("Ausflug", "Elternabend", "Frei", "Sonstiges"):
        ch, w = plain_chip(x, y + 12, k, c, on=k == "Ausflug"); b.append(ch); x += w + 8
    b.append(label(Rx + 120, y, "Für", c))
    ch, w = plain_chip(Rx + 120, y + 12, "Ganze Klasse", c); b.append(ch)
    ch, _ = plain_chip(Rx + 120 + w + 8, y + 12, "Physik", c, on=True, dot=sub["Ph"]); b.append(ch)
    y += 82
    b.append(label(L, y, "Titel", c))
    b.append(field(L, y + 10, W - 52, "Exkursion Phänomenta", c))
    b.append(T(L, y + 82, "20 von 60 Zeichen · keine Namen von Schülern", 12, 400, c["faint"]))
    y += 106
    err = state == "fehler"
    hw = (cw - 10) / 2
    b.append(label(L, y, "Von", c) + label(L + hw + 10, y, "Bis · optional", c))
    b.append(field(L, y + 10, hw, "29.09.2026", c, icon=CAL))
    b.append(field(L + hw + 10, y + 10, hw, "25.09.2026" if err else "mehrtägig?", c, placeholder=not err, icon=CAL, error=err))
    b.append(T(L, y + 82, "Das Ende liegt vor dem Anfang." if err else "Montag · in 12 Tagen", 12.5 if err else 12, 400, c["danger"] if err else c["faint"]))
    b.append(label(Rx, y, "Uhrzeit · optional", c))
    b.append(field(Rx, y + 10, hw, "07:45", c, icon=CLOCK) + field(Rx + hw + 10, y + 10, hw, "15:00", c, icon=CLOCK))
    b.append(T(Rx, y + 82, "Leer lassen = ganzer Tag.", 12, 400, c["faint"]))
    y += 106
    b.append(label(L, y, "Ort · optional", c))
    b.append(field(L, y + 10, cw, "Phänomenta Lüdenscheid", c, icon=PIN))
    b.append(label(Rx, y, "Hinweis · optional", c))
    b.append(R(Rx, y + 10, cw, 84, 16, c["field"]))
    for i, ln in enumerate(["Treffpunkt 07:30 am Bahnhof,", "8 € mitbringen."]):
        b.append(T(Rx + 17, y + 38 + i * 23, ln, 16, 400, c["ink"]))
    y += 112
    b.append(note_box(L, y, W - 52, ["Die Klasse sieht „eingetragen von Ric“. Nur Schüler mit dem Kurs Physik sehen den Termin.",
                                      "Wird 30 Tage nach dem Termin gelöscht."], c, USER))
    y = Y + H - 78
    b.append(f'<line x1="{L}" y1="{y}" x2="{X + W - 26}" y2="{y}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(X + W - 26 - 126.77 - 8 - 109.3, y + 16.5, 109.3, "Abbrechen", c, "sand", None))
    save = button(X + W - 26 - 126.77, y + 16.5, 126.77, "Speichern", c)
    b.append(f'<g opacity="0.45">{save}</g>' if err else save)
    return svg(1440, 900, c, "".join(b))

# PC-Woche: Streifen unter den Tageskopfzeilen, Termin-Karte im Tagespanel rechts
PC_COLS = [342, 465.59, 589.19, 712.78, 836.38]

def pc_woche(c, theme, sub):
    inner, w, h = base("05 Woche · Stunden + gewählter Tag", theme, "PC")
    dy, dp = 30, 72
    b = [shifted(inner, 1440, 900, [(260, 976, 166, dy), (984, 1404, 258, dp)], "kw")]
    b.append(R(260, 166, 716, dy, 0, c["paper"]))
    # ausgewählte Spalte (Mi) bleibt durchgehend
    b.append(R(583.19, 166, 127.59, dy, 0, c["sand"]) + f'<line x1="584.19" y1="166" x2="584.19" y2="{166 + dy}" stroke="{c["accent"]}" stroke-width="2"/>'
             + f'<line x1="709.78" y1="166" x2="709.78" y2="{166 + dy}" stroke="{c["accent"]}" stroke-width="2"/>')
    for col, (t, kind) in WEEK_PILLS.items():
        tint, ink, _ = kind_colors(kind, c)
        x = PC_COLS[col]
        b.append(R(x, 168, 115.59, 24, 12, tint) + ICON(x + 8, 173, 0.58, ink, CAL, 2.2)
                 + T(x + 26, 184.5, fit(t + (" · 3. Std" if col == 2 else " · 19:00"), 84, 11), 11, 800, ink))
    # Panel rechts: Termin unter «Info zum Tag»
    b.append(R(984, 258, 420, dp, 0, c["card"]))
    b.append(termin_box(1002, 264, 384, c, [S("Termin: ", 700, c["accink"]) + S("Klassenfoto in der 3. Stunde, Aula.", 400, c["muted"]),
                                            g.esc("Eingetragen von der Schule.")]))
    # «Info zum Tag» mit anderem Text (wie auf dem Handy)
    b.append(R(1002, 192.27, 384, 59.69, 16, c["sand"]) + ICON(1015, 204.27, 0.67, c["muted"], INFO))
    b.append(T(1041, 216.27, S("Info zum Tag: ", 700, c["ink"]) + S("Die Bibliothek ist heute ab 13:00", 400, c["muted"]), 13, 400, c["muted"], raw=True))
    b.append(T(1041, 235.11, "geschlossen.", 13, 400, c["muted"]))
    return svg(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-termine": p_list,
    "handy-02-details": lambda c, t, s: p_list(c, t, s, "details"),
    "handy-03-neu": p_form,
    "handy-04-datum-falsch": lambda c, t, s: p_form(c, t, s, "fehler"),
    "handy-05-gespeichert": lambda c, t, s: p_list(c, t, s, "gespeichert"),
    "handy-06-loeschen": lambda c, t, s: p_list(c, t, s, "loeschen"),
    "handy-07-leer": p_leer,
    "handy-08-laden": lambda c, t, s: p_list(c, t, s, "laden"),
    "handy-09-woche": p_woche,
    "handy-10-tag": p_tag,
    "handy-11-code-recht": p_codes,
    "pc-01-termine": pc_page,
    "pc-02-details": lambda c, t, s: pc_page(c, t, s, "panel"),
    "pc-03-neu": pc_form,
    "pc-04-datum-falsch": lambda c, t, s: pc_form(c, t, s, "fehler"),
    "pc-05-gespeichert": lambda c, t, s: pc_page(c, t, s, "gespeichert"),
    "pc-06-loeschen": lambda c, t, s: pc_page(c, t, s, "loeschen"),
    "pc-07-leer": lambda c, t, s: pc_page(c, t, s, "leer"),
    "pc-08-woche": pc_woche,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
