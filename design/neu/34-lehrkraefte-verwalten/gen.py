# Макеты части 34 «Lehrkräfte verwalten» (админка): список учителей, добавить / изменить / скрыть / удалить.
# Основа — части 14 (Lehrer-Codes), 14b, 14c (список, карточки, окно «Neu», меню, диалог), 13-admin-kurse (чипы предметов).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", path))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

k = _load("g14c", "14c-zugangscodes/gen.py")   # грузит 14 и 14b, добавляет цвета skel/toast
p14b, g = k.p14b, k.g
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, svg, overlay, base = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.svg, g.overlay, g.base)
badge, segmented, switch, toast, error_line, dots = g.badge, g.segmented, g.switch, p14b.toast, p14b.error_line, k.dots
KEY, CHECK, CHEV_R, BACK, CLOSE, PLUS, SEARCH, USER, PEN, TRASH, LOCK = k.KEY, k.CHECK, k.CHEV_R, k.BACK, k.CLOSE, k.PLUS, k.SEARCH, k.USER, k.PEN, k.TRASH, k.LOCK
REDO, INFO, EYE, USERS = k.REDO, k.INFO, p14b.EYE, k.USERS
EYE_OFF = EYE + P("M4 4l16 16")  # «Ausblenden»

# ── Данные: Kürzel (как в плане, нужен всегда) + необязательное полное имя (видит только админ) ──
# Kürzel, предметы, источник (plan / angepasst / eigen / aus), Lehrer-Code (конец) или None, полное имя или None
TEACHERS = [
    ("Mü", ["Ma", "Ph"], "plan", "K3", "Anna Müller"),
    ("Kraus", ["De", "En", "Ge"], "angepasst", "T7", "Thomas Kraus"),
    ("Weber", ["En"], "plan", None, None),
    ("Lenz", ["Sp", "Bio"], "eigen", "P2", "Sabine Lenz"),
    ("Haas", ["Ku"], "eigen", None, None),
    ("Vogt", ["Ph"], "aus", None, None),
]
SOURCE = {"plan": ("PLAN", "sand"), "angepasst": ("ANGEPASST", "tint"), "eigen": ("EIGEN", "accent"), "aus": ("AUSGEBLENDET", "off")}
ALL_SUBJ = ["Ma", "De", "En", "Ph", "Ge", "Ku", "Sp", "Bio"]
NAMES = g.NAMES

def small_chip(x, y, code, c, sub):
    """Fach in der Liste: Tint-Fläche in Fachfarbe, Name in Fach-Textfarbe (wie die Kästchen in «Kurse & Fächer»)."""
    _, tint, text = sub[code]
    w = g.tw(NAMES[code], 12) + 22
    return R(x, y, w, 26, 13, tint) + T(x + 11, y + 17.5, NAMES[code], 12, 700, text), w

def chip_rows(x, y, w, codes, c, sub, gap=6):
    """Чипы в строки по ширине w. → (svg, число строк)"""
    out, cx, row = [], x, 0
    for code in codes:
        s, cw = small_chip(cx, y + row * 32, code, c, sub)
        if cx + cw > x + w and cx > x:
            row += 1; cx = x; s, cw = small_chip(cx, y + row * 32, code, c, sub)
        out.append(s); cx += cw + gap
    return "".join(out), row + 1

def code_line(code):
    return f"Lehrer-Code ••••-{code} · aktiv" if code else "Kein Lehrer-Code"

# ════════════════ Телефон ════════════════
def head(c, ttl="Lehrkräfte", eb="Admin · Einstellungen", plus=True):
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, eb, c), title(66, 65, ttl, c)]
    if plus: b.append(round_btn(334, 33.31, c, PLUS, primary=True))
    return "".join(b)

def card(x, y, w, row, c, sub):
    short, subj, src, code, full = row
    name = full or short
    off = src == "aus"
    chips, n = chip_rows(x + 14, y + 52, w - 28, subj, c, sub)
    h = 52 + n * 32 + 32
    b = [R(x, y, w, h, 22, c["card"]), T(x + 14, y + 33, name, 15, 700, c["ink"])]
    bx = x + 14 + g.tw(name, 15) + 10
    if full:  # рядом с именем — Kürzel из плана
        b.append(T(bx, y + 33, short, 12.5, 400, c["faint"])); bx += g.tw(short, 12.5) + 10
    bd, _ = badge(bx, y + 18.5, *SOURCE[src][:1], c, SOURCE[src][1]); b.append(bd)
    b.append(R(x + w - 46, y + 12, 32, 32, 16, c["card"]) + dots(x + w - 38.5, y + 19.5, c))
    b.append(chips)
    b.append(T(x + 14, y + h - 14, code_line(code), 12, 400, c["faint"]))
    return f'<g opacity="{0.55 if off else 1}">' + "".join(b) + "</g>", h

def p_list(c, theme, sub, state="normal"):
    b = [head(c)]
    if state == "laden":
        b.append(R(18, 100, 150, 12, 6, c["skel"]))
        for i in range(4):
            y = 126 + i * 118
            b.append(R(18, y, 354, 108, 22, c["card"]) + R(32, y + 20, 80, 14, 7, c["skel"]) + R(32, y + 50, 74, 26, 13, c["skel"])
                     + R(114, y + 50, 90, 26, 13, c["skel"]) + R(32, y + 88, 160, 10, 5, c["skel"]))
        return svg(390, 844, c, "".join(b))
    if state == "leer":
        y = 230
        b.append(R(163, y, 64, 64, 32, c["tint"]) + ICON(182, y + 19, 1.08, c["accink"], USER, 1.9))
        b.append(T(195, y + 101, "Keine Lehrkräfte", 22, 900, c["ink"], "middle", -0.33))
        b.append(T(195, y + 132, "Im Plan stehen noch keine. Sobald er da ist,", 14, 400, c["muted"], "middle"))
        b.append(T(195, y + 153, "erscheinen sie hier — oder trag selbst eine ein.", 14, 400, c["muted"], "middle"))
        b.append(button(78, y + 180, 234, "Lehrkraft hinzufügen", c, icon=PLUS))
        return svg(390, 844, c, "".join(b))
    b.append(T(18, 104, "6 Lehrkräfte · 4 aus dem Plan", 12.5, 800, c["faint"]))
    y = 120
    for row in [TEACHERS[i] for i in (0, 1, 2, 3, 5)]:
        cd, h = card(18, y, 354, row, c, sub); b.append(cd); y += h + 10
    if state == "gespeichert":
        b.append(toast(18, 770, 354, "»Thomas Kraus« gespeichert", c))
    return svg(390, 844, c, "".join(b))

def text_field(x, y, w, c, text=None, placeholder=None, error=False, locked=False):
    out = R(x, y, w, 50, 16, c["sand"] if locked else c["field"])
    if error: out += R(x + 1, y + 1, w - 2, 48, 15, "none", c["danger"], 2)
    if text: out += T(x + 17, y + 31, text, 16, 400, c["faint"] if locked else c["ink"])
    elif placeholder: out += T(x + 17, y + 31, placeholder, 16, 400, c["faint2"])
    if locked: out += ICON(x + w - 36, y + 15, 0.83, c["faint"], LOCK)
    return out

def subject_grid(x, y, w, on, c, sub):
    """Fach-Auswahl wie 16/17: Punkt + Name, gewählt = Tint + Rand in Fachfarbe; am Ende «Anderes Fach»."""
    out, cx, cy = [], x, y
    for code in ALL_SUBJ:
        s, cw = g.form_chip(cx, cy, code, NAMES[code], c, sub, code in on)
        if cx + cw > x + w and cx > x:
            cx = x; cy += 46; s, cw = g.form_chip(cx, cy, code, NAMES[code], c, sub, code in on)
        out.append(s); cx += cw + 8
    pw = g.tw("Anderes Fach", 13) + 40
    if cx + pw > x + w: cx = x; cy += 46
    out.append(R(cx + .5, cy + .5, pw - 1, 37, 18.5, "none", c["faint2"], 1.5) + ICON(cx + 12, cy + 10, 0.67, c["muted"], PLUS, 2.2) + T(cx + 34, cy + 23, "Anderes Fach", 13, 700, c["muted"]))
    return "".join(out), cy + 38

def link_card(x, y, w, c, text, value):
    return (R(x, y, w, 56, 22, c["card"]) + ICON(x + 16, y + 19, 0.75, c["muted"], KEY) + T(x + 48, y + 33.5, text, 15, 400, c["ink"])
            + T(x + w - 38, y + 32.5, value, 13, 400, c["faint"], "end") + ICON(x + w - 32, y + 21, 0.58, c["faint"], CHEV_R))

def form_body(x, y, w, c, sub, mode, error=False, pc=False):
    """mode: neu | plan (Kürzel gesperrt) | eigen. Поля: Name (необязательно) и Kürzel. → (svg, Ende-y)"""
    nm = {"neu": "Sabine Lenz", "plan": "Thomas Kraus", "eigen": "Sabine Lenz"}[mode] if not error else "Maria Müller"
    ks = {"neu": "Lenz", "plan": "Kraus", "eigen": "Lenz"}[mode] if not error else "Mü"
    b = [label(x, y, "Name", c), text_field(x, y + 12, w, c, nm), label(x, y + 80, "Kürzel", c),
         text_field(x, y + 92, w, c, ks, error=error, locked=mode == "plan")]
    yy = y + 160
    if error:
        b.append(error_line(x, y + 164, "»Mü« gibt es schon.", c)); yy = y + 188
    b.append(label(x, yy, "Fächer", c))
    on = {"neu": ["Sp", "Bio"], "plan": ["De", "En", "Ge"], "eigen": ["Sp", "Bio"]}[mode] if not error else []
    grid, gy = subject_grid(x, yy + 14, w, on, c, sub)
    b.append(grid)
    yy = gy + 26
    if mode == "plan":
        b.append(link_card(x, yy, w, c, "Lehrer-Code", "••••-T7")); yy += 76
    return "".join(b), yy

def p_form(c, theme, sub, mode="neu", error=False):
    ttl = {"neu": "Neue Lehrkraft", "plan": "Thomas Kraus", "eigen": "Sabine Lenz"}[mode]
    b = [head(c, ttl, "Admin · Lehrkräfte", plus=False)]
    body, y = form_body(18, 101, 354, c, sub, mode, error)
    b.append(body)
    if mode == "neu": b.append(button(18, y, 354, "Hinzufügen", c, icon=PLUS))
    else:
        b.append(button(18, y, 354, "Speichern", c))
        if mode == "plan": b.append(button(18, y + 58, 354, "Auf Plan zurücksetzen", c, "sand", REDO))
    return svg(390, 844, c, "".join(b))

def sheet_rows(x, y, w, c, rows, rh=50):
    return k.action_rows(x, y, w, c, rows, rh)

def p_actions(c, theme, sub):
    page = p_list(c, theme, sub)
    inner = page[page.index("</defs>") + 7: page.rindex("</svg>")]
    top = 330
    b = [inner, overlay(c, 390, 844), R(0, top, 390, 844 - top + 30, 30, c["paper"]) + R(171, top + 10, 48, 5, 2.5, c["faint2"])]
    b.append(eyebrow(18, top + 42, "Kraus · Angepasst · Lehrer-Code ••••-T7", c) + title(18, top + 77, "Thomas Kraus", c) + round_btn(334, top + 47, c, CLOSE))
    b.append(T(18, top + 105, "Deutsch, Englisch, Geschichte", 14, 400, c["muted"]))
    rows = [(PEN, "Bearbeiten", "", False), (KEY, "Lehrer-Code", "••••-T7", False), (REDO, "Auf Plan zurücksetzen", "", False), (EYE_OFF, "Ausblenden", "", False)]
    b.append(sheet_rows(18, top + 122, 354, c, rows))
    return svg(390, 844, c, "".join(b))

def dialog(c, x, y, w, pc=False):
    """Wie 48 «Löschen bestätigen» (und 14c «Sperren»): Symbol, Titel, Text, Linie, zwei Knöpfe."""
    h = 250 if pc else 290
    b = [R(x, y, w, h, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 28, c["paper"])]
    b.append(ICON(x + 26, y + 26, 0.83, c["danger"], TRASH))
    b.append(R(x + w - 52, y + 22, 30, 30, 15, c["card"]) + ICON(x + w - 44.5, y + 29.5, 0.62, c["ink"], CLOSE))
    b.append(T(x + 26, y + 80, "»Sabine Lenz« löschen?", 25 if pc else 22, 900, c["ink"], ls=-0.35))
    lines = (["Sabine Lenz darf dann keine Materialien und Termine für", "Sport und Biologie mehr eintragen. Bisherige Einträge und", "der Lehrer-Code bleiben."] if pc else
             ["Sabine Lenz darf dann keine", "Materialien und Termine für Sport", "und Biologie mehr eintragen.", "Einträge und Lehrer-Code bleiben."])
    for i, ln in enumerate(lines): b.append(T(x + 26, y + 112 + i * 21, ln, 14, 400, c["muted"]))
    ly = y + h - 78
    b.append(f'<line x1="{x + 26}" y1="{ly}" x2="{x + w - 26}" y2="{ly}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(x + w - 26 - 124 - 8 - 112, ly + 14, 112, "Abbrechen", c, "sand", None))
    b.append(button(x + w - 26 - 124, ly + 14, 124, "Löschen", c, "danger", TRASH))
    return "".join(b)

def p_confirm(c, theme, sub):
    page = p_list(c, theme, sub)
    inner = page[page.index("</defs>") + 7: page.rindex("</svg>")]
    return svg(390, 844, c, inner + overlay(c, 390, 844) + dialog(c, 18, 280, 354))

def p_settings(c, theme, sub):
    p14b.ROWS[:] = [(KEY, "Zugangscodes", "4 aktiv"), (SHIELD_ICON, "Admin-Passwort", "ändern"), (USER, "Lehrkräfte", "6")]
    return p14b.p_settings(c, theme, sub).replace(">Passwörter<", ">Zugang<")
SHIELD_ICON = k.SHIELD

# ════════════════ Computer ════════════════
g.ADMIN_NAV.insert(2, ("Lehrkräfte", USERS, "6"))  # vor «Lehrer-Codes»

COLS = [("Name", 304), ("Kürzel", 480), ("Fächer", 570), ("Quelle", 860), ("Lehrer-Code", 1000)]

def pc_head(c):
    b = [g.admin_sidebar(c, 900, "Lehrkräfte"), eyebrow(284, 39, "Admin · 9b", c), title(284, 80, "Lehrkräfte", c, 38)]
    b.append(R(1000, 45, 210, 36, 18, c["card"]) + ICON(1012, 55, 0.58, c["faint"], SEARCH) + T(1032, 68, "Lehrkraft suchen", 13, 400, c["faint2"]))
    b.append(button(1220, 40, 184, "Neue Lehrkraft", c, icon=PLUS, h=46))
    return "".join(b)

def pc_table(c, sub, highlight=None):
    b = []
    ty = 110
    b.append(R(284, ty, 1120, 46 + 57 * len(TEACHERS), 22, c["card"]))
    for name, cx in COLS: b.append(T(cx, ty + 30, name, 12, 800, c["faint"]))
    for i, (short, subj, src, code, full) in enumerate(TEACHERS):
        ry = ty + 46 + i * 57
        b.append(f'<line x1="304" y1="{ry}" x2="1384" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        if highlight == i: b.append(R(292, ry + 4, 1104, 49, 16, c["tint"]))
        off = src == "aus"
        gg = [T(304, ry + 33, full or short, 14, 800, c["faint"] if off else c["ink"]), T(480, ry + 33, short, 13, 400, c["muted"] if full else c["faint"])]
        cx = 570
        for cd in subj:
            s, cw = small_chip(cx, ry + 16, cd, c, sub); gg.append(s); cx += cw + 6
        bd, _ = badge(860, ry + 19, SOURCE[src][0], c, SOURCE[src][1]); gg.append(bd)
        gg.append(T(1000, ry + 33, f"••••-{code} · aktiv" if code else "—", 13, 700 if code else 400, c["muted"] if code else c["faint"]))
        gg.append(dots(1366, ry + 20, c))
        b.append(f'<g opacity="{0.55 if off else 1}">' + "".join(gg) + "</g>")
    return "".join(b)

def pc_list(c, theme, sub, state="normal"):
    b = [pc_head(c)]
    if state == "laden":
        b.append(R(284, 110, 1120, 46 + 57 * 5, 22, c["card"]))
        for i in range(5):
            ry = 110 + 46 + i * 57
            b.append(R(304, ry + 22, 110, 12, 6, c["skel"]) + R(480, ry + 22, 40, 12, 6, c["skel"]) + R(570, ry + 16, 80, 26, 13, c["skel"]) + R(656, ry + 16, 80, 26, 13, c["skel"]) + R(860, ry + 20, 60, 18, 9, c["skel"]) + R(1000, ry + 22, 120, 12, 6, c["skel"]))
        return svg(1440, 900, c, "".join(b))
    if state == "leer":
        y = 300
        b.append(R(688, y, 64, 64, 32, c["tint"]) + ICON(707, y + 19, 1.08, c["accink"], USER, 1.9))
        b.append(T(720, y + 101, "Keine Lehrkräfte", 22, 900, c["ink"], "middle", -0.33))
        b.append(T(720, y + 132, "Im Plan stehen noch keine. Sobald er da ist, erscheinen sie hier —", 14, 400, c["muted"], "middle"))
        b.append(T(720, y + 153, "oder trag selbst eine ein.", 14, 400, c["muted"], "middle"))
        b.append(button(603, y + 180, 234, "Lehrkraft hinzufügen", c, icon=PLUS))
        return svg(1440, 900, c, "".join(b))
    b.append(pc_table(c, sub))
    if state == "gespeichert":
        b.append(toast(1044, 830, 360, "»Thomas Kraus« gespeichert", c))
    return svg(1440, 900, c, "".join(b))

def pc_modal(c, theme, sub, mode="neu", error=False):
    b = [pc_head(c), pc_table(c, sub), overlay(c, 1440, 900)]
    X, W = 450, 540
    body, yend = form_body(X + 26, 0 + 104, W - 52, c, sub, mode, error, pc=True)
    H = int(yend + 48 + 28)  # до кнопки + кнопка + отступ
    Y = (900 - H) / 2
    body, yend = form_body(X + 26, Y + 104, W - 52, c, sub, mode, error, pc=True)
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    ttl = {"neu": "Neue Lehrkraft", "plan": "Thomas Kraus", "eigen": "Sabine Lenz"}[mode]
    b.append(g.modal_head(X, Y, W, "Admin · Lehrkräfte", ttl, c) + body)
    bw = (W - 52 - 10) / 2
    if mode == "neu": b.append(button(X + 26, yend, W - 52, "Hinzufügen", c, icon=PLUS))
    elif mode == "plan": b.append(button(X + 26, yend, bw, "Auf Plan zurücksetzen", c, "sand", REDO) + button(X + 26 + bw + 10, yend, bw, "Speichern", c))
    else: b.append(button(X + 26, yend, W - 52, "Speichern", c))
    return svg(1440, 900, c, "".join(b))

def pc_menu(c, theme, sub):
    b = [pc_head(c), pc_table(c, sub, highlight=1)]
    mx, my, mw = 1130, 250, 260
    rows = [(PEN, "Bearbeiten", False), (KEY, "Lehrer-Code", False), (REDO, "Auf Plan zurücksetzen", False), (EYE_OFF, "Ausblenden", False), (TRASH, "Löschen", True)]
    hh = 12 + 40 * len(rows) + 9
    b.append(R(mx, my, mw, hh, 18, c["card"], extra=' filter="url(#nsh0)"') + R(mx, my, mw, hh, 18, c["card"], c["hair"]))
    for i, (icon, t, danger) in enumerate(rows):
        oy = my + 6 + i * 40 + (9 if danger else 0)
        if danger: b.append(f'<line x1="{mx + 12}" y1="{oy - 4.5}" x2="{mx + mw - 12}" y2="{oy - 4.5}" stroke="{c["hair"]}" stroke-width="1"/>')
        col = c["danger"] if danger else c["ink"]
        b.append(ICON(mx + 16, oy + 11, 0.67, c["danger"] if danger else c["muted"], icon) + T(mx + 44, oy + 25, t, 14, 400, col))
    return svg(1440, 900, c, "".join(b))

def pc_confirm(c, theme, sub):
    return svg(1440, 900, c, pc_head(c) + pc_table(c, sub) + overlay(c, 1440, 900) + dialog(c, 470, 300, 500, pc=True))

SCREENS = {
    "handy-01-liste": p_list,
    "handy-02-neu": p_form,
    "handy-03-neu-doppelt": lambda c, t, s: p_form(c, t, s, "neu", True),
    "handy-04-bearbeiten-plan": lambda c, t, s: p_form(c, t, s, "plan"),
    "handy-05-bearbeiten-eigen": lambda c, t, s: p_form(c, t, s, "eigen"),
    "handy-06-aktionen": p_actions,
    "handy-07-loeschen-fragen": p_confirm,
    "handy-08-gespeichert": lambda c, t, s: p_list(c, t, s, "gespeichert"),
    "handy-09-leer": lambda c, t, s: p_list(c, t, s, "leer"),
    "handy-10-laden": lambda c, t, s: p_list(c, t, s, "laden"),
    "handy-11-einstellungen": p_settings,
    "pc-01-liste": pc_list,
    "pc-02-neu": pc_modal,
    "pc-03-neu-doppelt": lambda c, t, s: pc_modal(c, t, s, "neu", True),
    "pc-04-bearbeiten-plan": lambda c, t, s: pc_modal(c, t, s, "plan"),
    "pc-05-menue": pc_menu,
    "pc-06-loeschen-fragen": pc_confirm,
    "pc-07-gespeichert": lambda c, t, s: pc_list(c, t, s, "gespeichert"),
    "pc-08-leer": lambda c, t, s: pc_list(c, t, s, "leer"),
    "pc-09-laden": lambda c, t, s: pc_list(c, t, s, "laden"),
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
