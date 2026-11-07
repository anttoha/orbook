# Генератор макетов части 19b «Muster-Editor» — админ сам задаёт недели A и B и поправляет букву недели.
# Помощники и цвета — из генераторов частей 14/15/18/19 (те же токены Soft).
# Основа — оригиналы ORBook Soft: 04 «Woche» (сетка), 16 «Klausur eintragen» (выбор предмета), 42 «Neuer Code» (шапка с «назад»),
# 45/47 «Einstellungen» (карточки, сегменты), 48 «Löschen bestätigen» (окно), 38 «Toasts», PC 05 (панель справа).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g19", os.path.join(HERE, "..", "19-muster", "gen.py"))
m19 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m19)
g, m15 = m19.g, m19.m15
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, note_box, overlay, badge, segmented = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.note_box, g.overlay, g.badge, g.segmented)
CHECK, CHEV_R, CHEV_D, BACK, CLOSE, PEN, PLUS, TRASH = g.CHECK, g.CHEV_R, g.CHEV_D, g.BACK, g.CLOSE, g.PEN, g.PLUS, g.TRASH
toast, sheet_bg, INFO = m15.toast, m15.sheet_bg, m15.INFO
LAYERS, REFRESH, page, form_chip = m19.LAYERS, m19.REFRESH, m19.page, g.form_chip
NAMES, TEACH, ROOM, TIMES = g.NAMES, m19.TEACH, m19.ROOM, m19.TIMES
WARN = P("M12 4l9 16H3zM12 10v4M12 17h.01")
SWAP = P("M7 4l-3 3 3 3M4 7h13M17 20l3-3-3-3M20 17H7")  # «A und B tauschen»
DOT = lambda x, y, r, col: f'<circle cx="{x}" cy="{y}" r="{r}" fill="{col}"/>'

# ── Daten: Woche A und Woche B (Mo … Fr, Stunden 1–6). Zelle = Liste der Kurse (Parallelkurse: Kunst | Bio) ──
def one(code): return [(code, TEACH[code], ROOM[code])] if code else []
WEEK_B = [[one(x) for x in day] for day in m19.MUSTER]
WEEK_A = [[one(x) for x in day] for day in [
    ["De", "Ma", "En", "Ge", "Sp", None],
    ["Ma", "Ph", "De", "En", "Ku", None],
    ["De", "Ma", "En", "Ph", "Bio", "Sp"],
    ["Ma", "De", "Ph", "Ge", "Sp", "En"],
    ["Ma", "En", "De", "Bio", "Ge", None],
]]
WEEK_A[4][5] = [("Ku", "Lau", "012"), ("Bio", "Kra", "305")]   # Fr 6: Kunst oder Bio — Wahlpflicht, parallel
# Eigene Änderungen des Admins (gegenüber automatisch): Mo 2 → Mathe in 108 bei Mü, Do 1 → Mathe
CHANGED_A = {(0, 1), (3, 0)}
WEEK_A_ADMIN = [list(d) for d in WEEK_A]
WEEK_A_ADMIN[0][1] = [("Ma", "Mü", "108")]
WEEK_A_ADMIN[3][0] = [("Ma", "Mü", "108")]
WEEK_A_AUTO = [list(d) for d in WEEK_A]
WEEK_A_AUTO[0][1] = [("Ma", "Mü", "204")]       # automatisch: Raum aus einer Vertretungswoche
WEEK_A_AUTO[3][0] = [("De", "Web", "102")]      # automatisch falsch: Plan hatte zwei Wochen lang Tausch
WD = ["MO", "DI", "MI", "DO", "FR"]
WD_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]

# ════════════════ Bausteine ════════════════
def ed_cell(x, y, w, h, entries, c, sub, mode="admin", changed=False, sel=False, pc=False):
    """Stunde im Editor. mode: auto (schraffiert = wie Muster in der App) | admin (eigene Farbe, antippbar)."""
    out = []
    if not entries:
        if mode == "auto":
            return f'<g opacity="0.6">{R(x, y, w, h, 14 if not pc else 16, c["sand"])}</g>'
        out.append(R(x + .5, y + .5, w - 1, h - 1, 14 if not pc else 16, "none", c["faint2"], 1, ' stroke-dasharray="3 3"'))
        out.append(ICON(x + w / 2 - 8, y + h / 2 - 8, 0.67, c["faint"], PLUS, 2.2))
        if sel: out.append(R(x - 1, y - 1, w + 2, h + 2, 15 if not pc else 17, "none", c["accent"], 2))
        return "".join(out)
    rx = 14 if not pc else 16
    n = len(entries)
    gap = 3
    ph = (h - gap * (n - 1)) / n
    for i, (code, who, room) in enumerate(entries):
        py = y + i * (ph + gap)
        solid, tint, text = sub[code]
        out.append(R(x, py, w, ph, rx if n == 1 else 10, tint))
        if mode == "auto": out.append(R(x, py, w, ph, rx if n == 1 else 10, "url(#mh)"))
        if pc:
            if n == 1:
                out.append(T(x + 12, py + 24, NAMES[code], 14, 800, text))
                out.append(f'<g opacity="0.75">{T(x + 12, py + 45, f"{who} · {room}", 12.5, 400, text)}</g>')
            else:
                out.append(T(x + 12, py + ph / 2 + 5, NAMES[code], 13, 800, text))
                if w > 160: out.append(f'<g opacity="0.75">{T(x + w - 12, py + ph / 2 + 5, f"{who} · {room}", 11.5, 400, text, "end")}</g>')
        else:
            if n == 1:
                out.append(T(x + 8, py + 20, code, 12.5, 900, text))
                out.append(f'<g opacity="0.85">{T(x + 8, py + 42, room, 9.5, 600, text)}</g>')
            else:
                out.append(T(x + 8, py + ph / 2 + 4.5, code, 11.5, 900, text))
    if changed:  # eigener Eintrag (anders als automatisch): Punkt oben rechts
        out.append(DOT(x + w - 9, y + 9, 4, c["accent"]))
    if sel: out.append(R(x - 1.5, y - 1.5, w + 3, h + 3, rx + 1.5, "none", c["accent"], 2.5))
    return "".join(out)

def p_grid(y0, week, c, sub, mode, changed=(), sel=None, empty=False):
    """Raster Mo–Fr × 1.–6. Stunde wie 04 «Woche», aber ohne Datum: Muster gilt für jede Woche A (bzw. B)."""
    out = []
    for i, wd in enumerate(WD):
        out.append(T(m19.COLS[i] + m19.CW / 2, y0 + 12, wd, 10, 700, c["faint"], "middle", 0.8))
    gy = y0 + 24
    out.append(m19.period_labels(gy, c))
    for col in range(5):
        for row in range(6):
            entries = [] if empty else week[col][row]
            out.append(ed_cell(m19.COLS[col], gy + row * 56, m19.CW, 52, entries, c, sub, mode, (col, row) in changed, sel == (col, row)))
    return "".join(out), gy + 6 * 56

def head(c, eyebrow_text="Admin · Einstellungen", title_text="Muster"):
    return (R(18, 33.31, 38, 38, 19, c["card"]) + ICON(28.5, 43.81, 0.71, c["ink"], BACK)
            + eyebrow(66, 33, eyebrow_text, c) + title(66, 65, title_text, c))

def ab_row(x, y, w, c, mode="Laut Plan der Schule", letter="A", pc=False):
    """Zeile «Diese Woche (KW 45) ist A» — antippen öffnet «Wochen A und B»."""
    out = [R(x, y, w, 62, 20, c["card"])]
    out.append(T(x + 14, y + 27, "Diese Woche · KW 45", 15, 400, c["ink"]) + T(x + 14, y + 46, mode, 12, 400, c["faint"]))
    bd, bw = badge(0, 0, f"WOCHE {letter}", c, "sand")
    out.append(f'<g transform="translate({x + w - 36 - bw} {y + 21.5})">{bd}</g>' + ICON(x + w - 28, y + 23, 0.67, c["faint2"], CHEV_R))
    return "".join(out)

SRC_HINT = {"auto": "Aus den echten Plänen der letzten Wochen, ohne Ausfälle.",
            "admin": "Gilt für alle in der Klasse. Der echte Plan geht immer vor."}

def top_block(c, src, ab_mode="Laut Plan der Schule", letter="A", week_tab=0):
    b = [head(c)]
    b.append(label(18, 104, "Woher kommt das Muster?", c))
    b.append(segmented(18, 116, 354, ["Automatisch", "Vom Admin"], 0 if src == "auto" else 1, c))
    b.append(T(18, 172, SRC_HINT[src], 12, 400, c["faint"]))
    b.append(ab_row(18, 188, 354, c, ab_mode, letter))
    b.append(segmented(18, 266, 354, ["Woche A", "Woche B"], week_tab, c, h=34))
    return "".join(b)

# ════════════════ Telefon ════════════════
def p_auto(c, theme, sub):
    """Quelle «Automatisch»: nur ansehen, schraffiert wie die Muster-Woche in der App."""
    b = [top_block(c, "auto")]
    grid, y = p_grid(312, WEEK_A_AUTO, c, sub, "auto"); b.append(grid)
    b.append(note_box(18, y + 12, 354, [S("Gebaut aus KW 41–44. ", 700, c["ink"]) + S("Falsch?", 400, c["muted"]),
                                        g.esc("„Vom Admin“ wählen und ändern.")], c, LAYERS))
    return page(390, 844, c, "".join(b))

def save_bar(c, n=2, saved=False):
    if saved:
        return R(0, 764, 390, 80, 0, c["paper"]) + button(18, 776, 354, "Gespeichert", c, "sand", CHECK)
    return R(0, 764, 390, 80, 0, c["paper"]) + button(18, 776, 354, f"Speichern · {n} Änderungen", c, icon=CHECK)

def p_admin(c, theme, sub, saved=False, sel=None, extra=""):
    """Quelle «Vom Admin»: Raster in Fachfarben, Punkt = eigene Änderung, leere Stunde = «+»."""
    b = [top_block(c, "admin")]
    grid, y = p_grid(312, WEEK_A_ADMIN, c, sub, "admin", CHANGED_A, sel); b.append(grid)
    b.append(DOT(24, y + 15, 4, c["accent"]) + T(34, y + 19, "eigene Änderung", 12, 400, c["muted"])
             + T(372, y + 19, "Stunde antippen zum Ändern", 12, 400, c["faint"], "end"))
    b.append(button(18, y + 34, 354, "Aus dem Plan übernehmen", c, "sand", REFRESH, h=44))
    b.append(save_bar(c, saved=saved))
    if saved: b.append(toast(18, 708, 354, "Muster gespeichert · gilt sofort für alle", c))
    b.append(extra)
    return page(390, 844, c, "".join(b))

def field_box(x, y, w, text, c, h=48):
    return R(x, y, w, h, 16, c["field"]) + T(x + 16, y + h / 2 + 5.5, text, 16, 400, c["ink"])

COURSE_CHIPS = [("Ma", "Mathe"), ("De", "Deutsch"), ("En", "Englisch"), ("Ph", "Physik"), ("Ge", "Geschichte"),
                ("Bio", "Biologie"), ("Ku", "Kunst"), ("Sp", "Sport")]

def chips(x, y, maxw, c, sub, active="Ma", gap=8, row_h=46):
    out, cx, cy = [], x, y
    for code, name in COURSE_CHIPS:
        w = g.tw(name, 13) + 40
        if cx + w > x + maxw: cx, cy = x, cy + row_h
        chip, w = form_chip(cx, cy, code, name, c, sub, on=code == active)
        out.append(chip); cx += w + gap
    return "".join(out), cy + 38

def stunde_sheet(c, sub, top=320, H=844):
    """Blatt «Stunde bearbeiten»: Kurs (Chips wie 16), Lehrer, Raum, Parallelkurs, «Leeren» / «Übernehmen»."""
    b = [sheet_bg(c, top, 390, H)]
    b.append(eyebrow(18, top + 42, "Woche A · Montag · 2. Stunde", c, accent=True))
    b.append(title(18, top + 74, "Stunde bearbeiten", c, 26) + round_btn(334, top + 32, c, CLOSE, size=38))
    b.append(label(18, top + 110, "Kurs", c))
    ch, y = chips(18, top + 122, 354, c, sub); b.append(ch)
    y += 22
    b.append(label(18, y, "Lehrer", c) + label(199, y, "Raum", c))
    b.append(field_box(18, y + 12, 173, "Mü", c) + field_box(199, y + 12, 173, "108", c))
    y += 12 + 48 + 26
    b.append(ICON(18, y - 12, 0.67, c["accink"], PLUS, 2.2) + T(40, y + 1, "Parallelkurs in dieser Stunde", 13.5, 700, c["accink"]))
    b.append(T(18, y + 26, "Automatisch war: Mathe · Mü · Raum 204", 12, 400, c["faint"]))
    y += 46
    b.append(button(18, y, 128, "Leeren", c, "danger", TRASH) + button(154, y, 218, "Übernehmen", c, icon=CHECK))
    return "".join(b)

def p_stunde(c, theme, sub):
    return p_admin(c, theme, sub, sel=(0, 1), extra=stunde_sheet(c, sub))

def radio_rows(x, y, w, rows, active, c, rh=64):
    """Auswahl wie das Menü «Muster zeigen bis» (19): gewählte Zeile Tint + Haken."""
    out = [R(x, y, w, rh * len(rows) + 8, 22, c["card"])]
    for i, (icon, ttl, subl) in enumerate(rows):
        ry = y + 4 + i * rh
        on = i == active
        if on: out.append(R(x + 4, ry, w - 8, rh, 18, c["tint"]))
        elif i and i != active + 1: out.append(f'<line x1="{x + 14}" y1="{ry}" x2="{x + w - 14}" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        out.append(ICON(x + 16, ry + 20, 0.79, c["accink"] if on else c["muted"], icon, 1.9))
        out.append(T(x + 48, ry + 28, ttl, 15, 700 if on else 400, c["accink"] if on else c["ink"]) + T(x + 48, ry + 47, subl, 12, 400, c["muted"] if on else c["faint"]))
        if on: out.append(ICON(x + w - 36, ry + rh / 2 - 8.5, 0.71, c["accink"], CHECK, 2.4))
    return "".join(out), rh * len(rows) + 8

AB_ROWS = [(INFO, "Laut Plan der Schule", "Diese Woche ist A"),
           (SWAP, "A und B tauschen", "Falls der Plan falsch zählt: diese Woche ist B"),
           (LAYERS, "Keine Wochen A und B", "Jede Woche gleich · ein Muster für alle")]

def kw_strip(x, y, c, letters=("A", "B", "A", "B", "A"), gap=8, w=63.2, fill="card"):
    """«So zählt ORBook»: die nächsten Wochen mit Buchstabe (wie die KW-Spalte in «Woche wählen»)."""
    out = []
    for i, l in enumerate(letters):
        bx = x + i * (w + gap)
        now = i == 0
        out.append(R(bx, y, w, 50, 14, c["accent"] if now else c[fill]))
        out.append(T(bx + w / 2, y + 20, f"KW {45 + i}", 10, 700, c["sub"] if now else c["faint"], "middle", 0.5))
        out.append(T(bx + w / 2, y + 40, l, 16, 900, c["on"] if now else c["accink"], "middle"))
    return "".join(out)

def ab_sheet(c, top=330, H=844, active=0):
    b = [sheet_bg(c, top, 390, H)]
    b.append(eyebrow(18, top + 42, "Muster · Woche A und B", c, accent=True))
    b.append(title(18, top + 74, "Woche A oder B?", c, 26) + round_btn(334, top + 32, c, CLOSE, size=38))
    rows, h = radio_rows(18, top + 94, 354, AB_ROWS, active, c); b.append(rows)
    y = top + 94 + h + 26
    b.append(label(18, y, "So zählt ORBook", c))
    b.append(kw_strip(18, y + 12, c))
    b.append(T(18, y + 86, "Gilt überall: Buchstabe in Woche und Tag, Muster.", 12, 400, c["faint"]))
    return "".join(b)

def p_ab(c, theme, sub):
    inner = p_auto(c, theme, sub)
    inner = inner[inner.index("</defs>") + 7: inner.rindex("</svg>")]
    return page(390, 844, c, inner + ab_sheet(c))

def dialog(c, x, y, w, pc=False):
    """Окно как 48 «Löschen bestätigen»: значок, заголовок, текст, черта, две кнопки справа."""
    lines = (["Woche A wird mit dem automatischen Muster (KW 41–44)", "überschrieben. 2 eigene Änderungen gehen verloren."] if pc else
             ["Woche A wird mit dem automatischen", "Muster (KW 41–44) überschrieben.", "2 eigene Änderungen gehen verloren."])
    h = 236 if pc else 270
    b = [R(x, y, w, h, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 28, c["paper"])]
    b.append(ICON(x + 26, y + 26, 0.83, c["accent"], REFRESH))
    b.append(R(x + w - 52, y + 22, 30, 30, 15, c["card"]) + ICON(x + w - 44.5, y + 29.5, 0.62, c["ink"], CLOSE))
    b.append(T(x + 26, y + 80, "Aus dem Plan übernehmen?", 25 if pc else 22, 900, c["ink"], ls=-0.35))
    for i, ln in enumerate(lines):
        b.append(T(x + 26, y + 112 + i * 21, ln, 14, 400, c["muted"]))
    ly = y + h - 78
    b.append(f'<line x1="{x + 26}" y1="{ly}" x2="{x + w - 26}" y2="{ly}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(x + w - 26 - 140 - 8 - 112, ly + 14, 112, "Abbrechen", c, "sand", None))
    b.append(button(x + w - 26 - 140, ly + 14, 140, "Übernehmen", c, icon=REFRESH))
    return "".join(b)

def p_dialog(c, theme, sub):
    return p_admin(c, theme, sub, extra=overlay(c, 390, 844) + dialog(c, 18, 290, 354))

def p_leer(c, theme, sub):
    """«Vom Admin», aber noch nichts da (Schuljahresanfang): leere Stunden mit «+»."""
    b = [top_block(c, "admin", letter="A")]
    grid, y = p_grid(312, WEEK_A, c, sub, "admin", empty=True); b.append(grid)
    b.append(note_box(18, y + 12, 354, [S("Woche A ist noch leer. ", 700, c["ink"]) + S("Tippe eine", 400, c["muted"]),
                                        g.esc("Stunde an — oder übernimm sie später.")], c, LAYERS))
    b.append(R(0, 764, 390, 80, 0, c["paper"]) + f'<g opacity="0.45">{button(18, 776, 354, "Speichern", c, icon=CHECK)}</g>')
    return page(390, 844, c, "".join(b))

def p_laden(c, theme, sub):
    """Skeleton wie 29 «Woche · lädt»: Kopf bleibt, statt Inhalt graue Flächen."""
    b = [head(c)]
    b.append(R(18, 94, 170, 12, 6, c["skel"]) + R(18, 116, 354, 36, 18, c["skel"]) + R(18, 164, 260, 10, 5, c["skel"]))
    b.append(R(18, 188, 354, 62, 20, c["card"]) + R(32, 206, 150, 12, 6, c["skel"]) + R(32, 226, 100, 10, 5, c["skel"]))
    b.append(R(18, 266, 354, 34, 17, c["skel"]))
    for col in range(5):
        for row in range(6):
            b.append(R(m19.COLS[col], 336 + row * 56, m19.CW, 52, 14, c["skel"]))
    for row in range(6):
        b.append(R(20, 350 + row * 56, 14, 10, 5, c["skel"]))
    return page(390, 844, c, "".join(b))

def p_fehler(c, theme, sub):
    """Speichern ging nicht (offline/Server) — Änderungen bleiben, roter Toast mit «Nochmal»."""
    inner = p_admin(c, theme, sub)
    inner = inner[inner.index("</defs>") + 7: inner.rindex("</svg>")]
    t = (R(18, 708, 354, 46, 16, c["toastbg"]) + ICON(32, 723, 0.67, c["danger"], WARN)
         + T(58, 736, "Nicht gespeichert · offline", 13.5, 600, c["toastfg"]) + T(358, 736, "Nochmal", 13.5, 800, c["toastfg"], "end"))
    return page(390, 844, c, inner + t)

def p_settings(c, theme, sub):
    """Admin · Einstellungen: Karte «Muster-Stundenplan» aus Teil 19 — Zeile «Muster und Wochen A/B» führt zum Editor."""
    b = [eyebrow(18, 33, "Admin", c), title(18, 65, "Einstellungen", c)]
    y = 100
    b.append(label(18, y, "Muster-Stundenplan", c))
    y += 14
    b.append(R(18, y, 354, 204, 22, c["card"]))
    b.append(T(32, y + 30, "Muster zeigen bis", 15, 400, c["ink"]) + T(32, y + 49, "für Tage ohne echten Plan", 12, 400, c["faint"]))
    pw = 162
    b.append(R(358 - pw + .5, y + 18.5, pw - 1, 31, 15.5, "none", c["rule"]) + T(358 - pw + 12, y + 39, "Schuljahresende", 13, 700, c["ink"])
             + ICON(358 - 21, y + 28, 0.5, c["faint"], CHEV_D, 2.2))
    rows = [("Muster bearbeiten", "Vom Admin · Woche A und B", None), ("Wochen A und B", "Diese Woche ist B · getauscht", "B")]
    for i, (t, st, right) in enumerate(rows):
        ry = y + 68 + i * 68
        b.append(f'<line x1="32" y1="{ry}" x2="358" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(T(32, ry + 30, t, 15, 400, c["ink"]) + T(32, ry + 49, st, 12, 400, c["faint"]))
        if right:
            bd, bw = badge(0, 0, f"WOCHE {right}", c, "sand"); b.append(f'<g transform="translate({358 - 22 - bw} {ry + 24.5})">{bd}</g>')
        b.append(ICON(358 - 16, ry + 26, 0.67, c["faint2"], CHEV_R))
    y += 204 + 14
    for i, ln in enumerate(["Der echte Plan der Schule ersetzt das Muster immer,", "sobald er da ist. In Ferien gibt es kein Muster."]):
        b.append(T(18, y + 12 + i * 17, ln, 12, 400, c["faint"]))
    return page(390, 844, c, "".join(b))

# ════════════════ Computer ════════════════
LOCK, KEY, USER = g.LOCK, g.KEY, g.USER
FOLDER = P("M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z")
g.ADMIN_NAV[:] = [
    ("Übersicht", P("M4 11l8-7 8 7v9H4z"), None), ("Editor-Codes", KEY, "4"), ("Lehrer-Codes", USER, "3"), ("Passwörter", LOCK, None),
    ("Klausuren", P("M5 21V4h12l-2 4 2 4H5"), "5"), ("Kurse &amp; Fächer", '<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16"), None),
    ("Muster", LAYERS, None), ("Materialien", FOLDER, None), ("Termine", g.CAL, None),
    ("Protokoll", P("M5 4h14v16H5z") + P("M9 9h6M9 13h6M9 17h3"), None),
    ("Einstellungen", '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/>' + P("M7 7.5h.01M7 16.5h.01"), None)]

def pc_top(c, src, saved=None):
    b = [g.admin_sidebar(c, 900, "Muster"), eyebrow(284, 39, "Admin · 9b", c), title(284, 80, "Muster-Stundenplan", c, 38)]
    if saved == "dirty": b.append(button(1134, 40, 270, "Speichern · 2 Änderungen", c, icon=CHECK, h=46))
    elif saved == "saved": b.append(button(1250, 40, 154, "Gespeichert", c, "sand", CHECK, h=46))
    # Karte «Woher kommt das Muster?»
    b.append(R(284, 108, 550, 104, 22, c["card"]) + label(304, 136, "Woher kommt das Muster?", c))
    b.append(segmented(304, 150, 260, ["Automatisch", "Vom Admin"], 0 if src == "auto" else 1, c))
    hint = (["Aus den echten Plänen der letzten", "Wochen, ohne Ausfälle (KW 41–44)."] if src == "auto" else
            ["Dein Muster gilt für alle. Der echte", "Plan ersetzt es trotzdem immer."])
    for i, ln in enumerate(hint): b.append(T(584, 163 + i * 18, ln, 12, 400, c["faint"]))
    # Karte «Wochen A und B»
    b.append(R(854, 108, 550, 104, 22, c["card"]) + label(874, 136, "Wochen A und B", c))
    b.append(T(874, 170, "Diese Woche · KW 45", 15, 400, c["ink"]) + T(874, 190, "Laut Plan der Schule", 12, 400, c["faint"]))
    bd, bw = badge(874 + g.tw("Diese Woche · KW 45", 15, 400) * 0.86 + 10, 151.5, "WOCHE A", c, "sand"); b.append(bd)
    pw = 112
    b.append(R(1384 - pw + .5, 154.5, pw - 1, 31, 15.5, "none", c["rule"]) + T(1384 - pw + 14, 175, "Ändern", 13, 700, c["ink"])
             + ICON(1384 - 26, 164, 0.5, c["faint"], CHEV_D, 2.2))
    b.append(segmented(284, 232, 240, ["Woche A", "Woche B"], 0, c, h=34))
    return "".join(b)

def pc_grid(x, y, w, week, c, sub, mode, changed=(), sel=None, rows=6, step=100):
    lw = 64
    cw = (w - lw - 4 * 12) / 5
    out = []
    for i, wd in enumerate(WD_LONG):
        out.append(T(x + lw + i * (cw + 12) + 12, y + 14, wd, 12.5, 800, c["faint"]))
    gy = y + 28
    for r in range(rows):
        ry = gy + r * step
        a, e = TIMES[r]
        out.append(T(x, ry + 34, str(r + 1), 22, 900, c["ink"]) + T(x, ry + 54, a, 10.5, 400, c["faint"]) + T(x, ry + 68, e, 10.5, 400, c["faint"]))
        for col in range(5):
            out.append(ed_cell(x + lw + col * (cw + 12), ry, cw, step - 10, week[col][r], c, sub, mode, (col, r) in changed, sel == (col, r), pc=True))
    return "".join(out), cw

def pc_auto(c, theme, sub, menu=False):
    b = [pc_top(c, "auto")]
    b.append(T(1404, 254, "Nur ansehen · zum Ändern „Vom Admin“ wählen", 12.5, 400, c["faint"], "end"))
    grid, _ = pc_grid(284, 282, 1120, WEEK_A_AUTO, c, sub, "auto", step=98); b.append(grid)
    if menu: b.append(pc_ab_menu(c))
    return page(1440, 900, c, "".join(b))

def pc_ab_menu(c):
    """Auswahl unter «Ändern» (wie Dropdown 45/12 am PC)."""
    x, y, w = 1004, 194, 400
    out = [R(x, y, w, 330, 22, c["card"], extra=' filter="url(#nsh0)"'), R(x, y, w, 330, 22, c["card"], c["hair"])]
    rows, h = radio_rows(x + 6, y + 6, w - 12, AB_ROWS, 0, c, rh=62)
    out.append(rows.replace(R(x + 6, y + 6, w - 12, h, 22, c["card"]), "", 1))
    yy = y + 6 + h + 22
    out.append(label(x + 20, yy, "So zählt ORBook", c) + kw_strip(x + 20, yy + 12, c, w=64, gap=8, fill="sand"))
    return "".join(out)

def pc_panel(c, sub):
    """Rechte Spalte wie PC 05 / PC 08: gewählte Stunde bearbeiten."""
    x, y, w = 984, 282, 420
    b = [R(x, y, w, 594, 22, c["card"])]
    b.append(eyebrow(x + 20, y + 32, "Woche A · Montag · 2. Stunde", c, accent=True) + title(x + 20, y + 66, "Stunde bearbeiten", c, 26))
    b.append(label(x + 20, y + 102, "Kurs", c))
    ch, yy = chips(x + 20, y + 114, w - 40, c, sub); b.append(ch.replace(f'fill="{c["paper"]}"', f'fill="{c["card"]}"'))
    yy += 24
    b.append(label(x + 20, yy, "Lehrer", c) + label(x + 214, yy, "Raum", c))
    b.append(R(x + 20, yy + 12, 186, 48, 16, c["paper"]) + T(x + 36, yy + 41.5, "Mü", 16, 400, c["ink"])
             + R(x + 214, yy + 12, 186, 48, 16, c["paper"]) + T(x + 230, yy + 41.5, "108", 16, 400, c["ink"]))
    yy += 12 + 48 + 28
    b.append(ICON(x + 20, yy - 12, 0.67, c["accink"], PLUS, 2.2) + T(x + 42, yy + 1, "Parallelkurs in dieser Stunde", 13.5, 700, c["accink"]))
    b.append(T(x + 20, yy + 28, "Automatisch war: Mathe · Mü · Raum 204", 12, 400, c["faint"]))
    by = y + 594 - 20 - 48
    b.append(f'<line x1="{x + 20}" y1="{by - 18}" x2="{x + w - 20}" y2="{by - 18}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(x + 20, by, 140, "Leeren", c, "danger", TRASH) + button(x + 168, by, w - 188, "Übernehmen", c, icon=CHECK))
    return "".join(b)

def pc_admin(c, theme, sub, saved="dirty", extra=""):
    b = [pc_top(c, "admin", saved)]
    b.append(DOT(548, 249, 4, c["accent"]) + T(558, 253.5, "eigene Änderung", 12.5, 400, c["muted"]))
    b.append(button(1150, 228, 254, "Aus dem Plan übernehmen", c, "sand", REFRESH, h=40))
    grid, _ = pc_grid(284, 282, 680, WEEK_A_ADMIN, c, sub, "admin", CHANGED_A, sel=(0, 1), step=98); b.append(grid)
    b.append(pc_panel(c, sub))
    if saved == "saved": b.append(toast(1050, 830, 354, "Muster gespeichert · gilt sofort für alle", c))
    b.append(extra)
    return page(1440, 900, c, "".join(b))

def pc_dialog(c, theme, sub):
    return pc_admin(c, theme, sub, extra=overlay(c, 1440, 900) + dialog(c, 470, 300, 500, pc=True))

SCREENS = {
    "handy-01-einstellungen": p_settings,
    "handy-02-automatisch": p_auto,
    "handy-03-vom-admin": p_admin,
    "handy-04-stunde": p_stunde,
    "handy-05-wochen-ab": p_ab,
    "handy-06-uebernehmen": p_dialog,
    "handy-07-gespeichert": lambda c, t, s: p_admin(c, t, s, saved=True),
    "handy-08-fehler": p_fehler,
    "handy-09-leer": p_leer,
    "handy-10-laden": p_laden,
    "pc-01-automatisch": pc_auto,
    "pc-02-wochen-ab": lambda c, t, s: pc_auto(c, t, s, menu=True),
    "pc-03-vom-admin": pc_admin,
    "pc-04-uebernehmen": pc_dialog,
    "pc-05-gespeichert": lambda c, t, s: pc_admin(c, t, s, saved="saved"),
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
