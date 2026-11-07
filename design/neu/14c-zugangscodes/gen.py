# Генератор макетов части 14c «Zugangscodes»: много кодов входа вместо одного пароля класса.
# Основа — оригиналы ORBook Soft 41 «Editor-Codes» (карточки), 42/44 «Neuer Code», 43 «Code-Aktionen (Blatt)»,
# 48 «Löschen bestätigen», 01/02 «Zugang». Помощники и цвета — из частей 14 и 14b.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", path))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

p14b = _load("g14b", "14b-passwoerter/gen.py")  # заодно грузит часть 14 и добавляет цвета skel/toast
g = p14b.g
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, note_box, svg, overlay, base = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.note_box, g.svg, g.overlay, g.base)
badge, segmented, switch, field, toast, error_line = g.badge, g.segmented, g.switch, p14b.field, p14b.toast, p14b.error_line
LOCK, KEY, SHIELD, COPY, CHECK, CHEV_R, BACK, CLOSE, PLUS, DOTS_V, SEARCH, USER, PEN, TRASH, CAL = (
    g.LOCK, g.KEY, g.SHIELD, g.COPY, g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.PLUS, g.DOTS_V, g.SEARCH, g.USER, g.PEN, g.TRASH, g.CAL)
INFO, WARN = p14b.INFO, p14b.WARN
USERS = '<circle cx="9" cy="8" r="3.5"/>' + P("M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6")  # «Gruppe»
PHONE = '<rect x="7" y="3" width="10" height="18" rx="2.5"/>' + P("M11 17.5h2")  # «Geräte»
REDO = P("M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5")  # «Neu erzeugen», как в 43
CLOCK = '<circle cx="12" cy="12" r="9"/>' + P("M12 7v5l3 2")

# ── Данные (без настоящих имён, как требует подсказка) ──
#  name, kind(gruppe/persoenlich/alt), end, used, limit(None=unbegrenzt), last, active, valid
CODES = [
    ("Klasse 9b", "gruppe", "7Q", 21, None, "heute", True, "31. Juli"),
    ("Eltern", "gruppe", "M4", 9, 30, "gestern", True, "31. Juli"),
    ("Schüler 07", "persoenlich", "X2", 1, 1, "vor 3 Tagen", True, "31. Juli"),
    ("Vertretung", "gruppe", "K9", 0, 5, "vor 3 Wochen", False, "abgelaufen"),
    ("Klassenpasswort", "alt", None, 4, None, "vor 5 Tagen", True, "—"),
]
KIND = {"gruppe": ("GRUPPE", "tint"), "persoenlich": ("PERSÖNLICH", "sand"), "alt": ("ALT", "sand")}
NEW = "ORB-Z-4KX9-T2"  # так выглядит новый код (Z = Zugang; E = Editor, L = Lehrer)

def geraete(used, limit):
    if limit is None: return f"{used} Geräte · unbegrenzt"
    return f"{used} von {limit} Gerät" + ("" if limit == 1 else "en")

def dots(x, y, c):
    return ICON(x, y, 0.71, c["ink"], DOTS_V).replace('fill="none"', f'fill="{c["ink"]}"')

# ════════════════ Telefon ════════════════
def p_head(c, plus=True):
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Admin · Einstellungen", c), title(66, 65, "Zugangscodes", c)]
    if plus: b.append(round_btn(334, 33.31, c, PLUS, primary=True))
    return "".join(b)

def code_card(x, y, w, row, c):
    name, kind, end, used, limit, last, active, valid = row
    h = 114.36
    gg = [R(x, y, w, h, 22, c["card"]), T(x + 14, y + 33, name, 15, 700, c["ink"])]
    bx = x + 14 + g.tw(name, 15) + 10
    k, kk = KIND[kind]
    bd, bw = badge(bx, y + 18.5, k, c, kk); gg.append(bd)
    if not active:
        bd2, _ = badge(bx + bw + 6, y + 18.5, "GESPERRT", c, "off"); gg.append(bd2)
    gg.append(R(x + w - 46, y + 12, 32, 32, 16, c["card"]) + dots(x + w - 38.5, y + 19.5, c))
    if kind == "alt":
        gg.append(T(x + 14, y + 66, "••••••", 17, 900, c["ink"], ls=-0.25) + T(x + 100, y + 65.67, "gemeinsames Passwort · seit 10. Sept", 12.5, 400, c["muted"]))
    else:
        gg.append(T(x + 14, y + 66, f"••••-{end}", 17, 900, c["ink"], ls=-0.25) + T(x + 100, y + 65.67, geraete(used, limit), 12.5, 400, c["muted"]))
    tail = "abgelaufen" if valid == "abgelaufen" else ("ohne Ablauf" if valid == "—" else f"bis {valid}")
    gg.append(T(x + 14, y + 94.36, f"zuletzt {last} · {tail}", 12, 400, c["faint"]))
    gg.append(switch(x + w - 56, y + 78.36, active, c))
    return f'<g opacity="{1 if active else 0.55}">' + "".join(gg) + "</g>", h

def p_list(c, theme, sub, state="normal", extra=""):
    b = [p_head(c)]
    if state == "laden":
        b.append(R(18, 90, 354, 59.69, 16, c["skel"]))
        for i in range(4):
            y = 163 + i * 124.36
            b.append(R(18, y, 354, 114.36, 22, c["card"]) + R(32, y + 22, 110, 13, 6.5, c["skel"]) + R(32, y + 52, 190, 15, 7.5, c["skel"])
                     + R(32, y + 86, 150, 10, 5, c["skel"]) + R(316, y + 78.36, 42, 24, 12, c["skel"]))
        return svg(390, 844, c, "".join(b))
    b.append(note_box(18, 90, 354, ["Keine echten Namen — lieber »Eltern«,", "»Vertretung« oder »Schüler 07«."], c, SHIELD))
    y = 163
    rows = CODES if state != "leer" else CODES[-1:]
    if state != "leer":
        b.append(T(18, y + 4, "5 Zugänge · 35 Geräte angemeldet", 12.5, 800, c["faint"]))
        y += 18
    for row in rows:
        card, h = code_card(18, y, 354, row, c); b.append(card); y += h + 10
    if state == "leer":
        y += 22
        b.append(R(163, y, 64, 64, 32, c["tint"]) + ICON(182, y + 19, 1.08, c["accink"], KEY, 1.9))
        b.append(T(195, y + 101, "Noch keine Zugangscodes", 22, 900, c["ink"], "middle", -0.33))
        b.append(T(195, y + 132, "Ein Code für eine Gruppe (Eltern, Vertretung)", 14, 400, c["muted"], "middle"))
        b.append(T(195, y + 153, "oder einer pro Schüler — jeder einzeln", 14, 400, c["muted"], "middle"))
        b.append(T(195, y + 174, "sperrbar, mit Ablaufdatum.", 14, 400, c["muted"], "middle"))
        b.append(button(78, y + 198, 234, "Ersten Code erstellen", c, icon=PLUS))
    if state == "gesperrt":
        b.append(toast(18, 690, 354, "»Eltern« gesperrt · 9 Geräte abgemeldet", c))
    b.append(extra)
    return svg(390, 844, c, "".join(b))

def reveal(x, y, w, c, pc=False):
    """Фиолетовая карточка «nur jetzt sichtbar», как у Editor-Code 42."""
    h = 134
    out = [R(x, y, w, h, 22, c["accent"]), T(x + 16, y + 29, "Neuer Zugangscode · nur jetzt sichtbar", 12.5, 800, c["sub"])]
    out.append(T(x + 16, y + 69.43, NEW, 27, 900, c["on"], ls=1.08) + ICON(x + w - 41.5, y + 52.5, 0.71, c["on"], COPY))
    lines = ["Danach siehst du nur noch ••••-T2. Gib ihn nur", "an die Person oder Gruppe weiter, für die er ist."]
    if pc: lines = ["Danach siehst du nur noch ••••-T2. Gib ihn nur an die Person oder Gruppe", "weiter, für die er ist."]
    for i, ln in enumerate(lines):
        out.append(f'<g opacity="0.75">{T(x + 16, y + 102 + i * 16, ln, 12.5, 400, c["on"])}</g>')
    return "".join(out), h

def new_form(x, y, w, c, state, pc=False):
    """Поля «Neuer Zugangscode». state: 'form' — до создания, 'fertig' — код показан."""
    b = [label(x, y, "Bezeichnung", c)]
    b.append(R(x, y + 12, w, 50, 16, c["field"]) + T(x + 17, y + 43, "Schüler 08", 16, 400, c["ink"]))
    b.append(T(x, y + 80, "Nur für dich sichtbar · keine echten Namen", 12, 400, c["faint"]))
    y += 112
    b.append(label(x, y, "Für wen?", c))
    b.append(segmented(x, y + 12, w, ["Eine Person", "Eine Gruppe"], 0, c, 35))
    b.append(T(x, y + 66, "Eine Person: ein Gerät reicht meistens.", 12, 400, c["faint"]))
    y += 98
    b.append(label(x, y, "Geräte höchstens", c))
    b.append(segmented(x, y + 12, w, ["1", "2", "30", "Unbegrenzt"], 1, c, 35))
    b.append(T(x, y + 66, "Handy und Laptop = 2. Ist das Limit voll, geht kein neues Gerät rein.", 12, 400, c["faint"]) if pc else
             T(x, y + 66, "Handy + Laptop = 2. Voll? Dann kein neues Gerät.", 12, 400, c["faint"]))
    y += 98
    b.append(label(x, y, "Gültig bis", c))
    b.append(segmented(x, y + 12, w, ["30 Tage", "Halbjahr", "Schuljahresende"], 2, c, 35))
    b.append(T(x, y + 66, "31. Juli 2027 · danach automatisch gesperrt", 12, 400, c["faint"]))
    y += 92
    if state == "fertig":
        card, h = reveal(x, y, w, c, pc); b.append(card); y += h + 16
        bw = (w - 10) / 2
        b.append(button(x, y, bw, "Kopieren", c, "sand", COPY) + button(x + bw + 10, y, bw, "Fertig", c))
    else:
        b.append(button(x, y, w, "Code erstellen", c, icon=KEY))
    return "".join(b), y + 48

def p_new(c, theme, sub, state="form"):
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Admin · Zugangscodes", c), title(66, 65, "Neuer Code", c)]
    form, _ = new_form(18, 101, 354, c, state)
    b.append(form)
    return svg(390, 844, c, "".join(b))

def action_rows(x, y, w, c, rows, rh=56):
    out = [R(x, y, w, rh * len(rows), 22, c["card"])]
    for i, (icon, name, value, danger) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(f'<line x1="{x + 14}" y1="{ry}" x2="{x + w - 14}" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        col = c["danger"] if danger else c["ink"]
        out.append(ICON(x + 14, ry + rh / 2 - 9, 0.75, c["danger"] if danger else c["muted"], icon) + T(x + 45, ry + rh / 2 + 5.5, name, 15, 400, col))
        if not danger:
            out.append(T(x + w - 34, ry + rh / 2 + 4.5, value, 13, 400, c["faint"], "end") + ICON(x + w - 28, ry + rh / 2 - 7, 0.58, c["faint"], CHEV_R))
    return "".join(out)

ACTIONS = [(PEN, "Umbenennen", "", False), (PHONE, "Geräte-Limit", "30", False), (CLOCK, "Gültigkeit", "Schuljahresende", False),
           (PHONE, "Geräte abmelden", "9 angemeldet", False), (REDO, "Neu erzeugen", "neuer Code", False),
           (LOCK, "Sperren", "", False), (TRASH, "Löschen", "", True)]

def p_actions(c, theme, sub):
    page = p_list(c, theme, sub)
    inner = page[page.index("</defs>") + 7: page.rindex("</svg>")]
    top = 300
    b = [inner, overlay(c, 390, 844)]
    b.append(R(0, top, 390, 844 - top + 30, 30, c["paper"]) + R(171, top + 10, 48, 5, 2.5, c["faint2"]))
    b.append(eyebrow(18, top + 42, "••••-M4 · aktiv · Gruppe", c) + title(18, top + 77, "Eltern", c))
    b.append(round_btn(334, top + 47, c, CLOSE))
    b.append(T(18, top + 105, "9 von 30 Geräten · zuletzt gestern 19:40", 14, 400, c["muted"]))
    rows = ACTIONS
    b.append(action_rows(18, top + 122, 354, c, rows, rh=50))
    b.append(T(18, top + 122 + 50 * len(rows) + 24, "Sperren, Löschen, Abmelden: die Geräte müssen sich", 12, 400, c["faint"]))
    b.append(T(18, top + 122 + 50 * len(rows) + 41, "sofort neu anmelden. Andere Codes bleiben.", 12, 400, c["faint"]))
    return svg(390, 844, c, "".join(b))

def dialog(c, x, y, w, pc=False):
    """Окно как 48 «Löschen bestätigen»: значок, заголовок, текст, черта, две кнопки справа."""
    h = 250 if pc else 290
    b = [R(x, y, w, h, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 28, c["paper"])]
    b.append(ICON(x + 26, y + 26, 0.83, c["danger"], LOCK))
    b.append(R(x + w - 52, y + 22, 30, 30, 15, c["card"]) + ICON(x + w - 44.5, y + 29.5, 0.62, c["ink"], CLOSE))
    b.append(T(x + 26, y + 80, "»Eltern« sperren?", 25 if pc else 22, 900, c["ink"], ls=-0.35))
    lines = (["9 Geräte werden sofort abgemeldet. Später wieder", "einschalten geht — dann melden sie sich neu an."] if pc else
             ["9 Geräte werden sofort abgemeldet.", "Später wieder einschalten geht —", "dann melden sie sich mit dem", "gleichen Code neu an."])
    for i, ln in enumerate(lines):
        b.append(T(x + 26, y + 112 + i * 21, ln, 14, 400, c["muted"]))
    ly = y + h - 78
    b.append(f'<line x1="{x + 26}" y1="{ly}" x2="{x + w - 26}" y2="{ly}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(x + w - 26 - 124 - 8 - 112, ly + 14, 112, "Abbrechen", c, "sand", None))
    b.append(button(x + w - 26 - 124, ly + 14, 124, "Sperren", c, "danger", LOCK))
    return "".join(b)

def p_confirm(c, theme, sub):
    page = p_list(c, theme, sub)
    inner = page[page.index("</defs>") + 7: page.rindex("</svg>")]
    return svg(390, 844, c, inner + overlay(c, 390, 844) + dialog(c, 18, 280, 354))

# ── Вход (01/02): поле принимает код или старый пароль ──
def p_zugang(c, theme, sub, state="normal"):
    inner, w, h = base("01 Zugang", theme)
    b = [inner, R(0, 560, 390, 284, 0, c["paper"])]
    if state == "abgemeldet":
        b.append(R(28, 470, 334, 76, 16, c["dtint"]) + ICON(42, 484, 0.67, c["danger"], LOCK))
        b.append(T(68, 497, "Du wurdest abgemeldet", 14, 800, c["danger"]))
        b.append(T(68, 516, "Dein Zugangscode gilt nicht mehr.", 12.5, 400, c["danger"]))
        b.append(T(68, 533, "Frag den Admin nach einem neuen.", 12.5, 400, c["danger"]))
    b.append(label(28, 584, "Zugangscode oder Klassenpasswort", c))
    if state == "voll":
        b.append(R(28, 594, 334, 50, 16, c["field"]) + R(29, 595, 332, 48, 15, "none", c["danger"], 2) + T(45, 625, "ORB-Z-4KX9-T2", 17, 900, c["ink"], ls=1))
        b.append(error_line(28, 666, "Schon auf 2 von 2 Geräten angemeldet.", c))
        b.append(T(47, 683, "Admin fragen: Gerät abmelden oder Limit erhöhen.", 12.5, 400, c["danger"]))
        by = 700
    else:
        b.append(R(28, 594, 334, 50, 16, c["field"]) + T(45, 624, "ORB-Z-XXXX-XX", 16, 400, c["faint2"], ls=1))
        b.append(T(28, 662, "Vom Admin oder aus der Klassengruppe.", 12, 400, c["faint"]))
        by = 682
    b.append(button(28, by, 334, "Öffnen", c, icon=CHEV_R))
    if state != "voll":
        b.append(T(195, 770, S("Lehrkraft? ", 400, c["muted"]) + S("Mit Lehrer-Code anmelden", 800, c["accink"]), 13.5, 400, c["muted"], "middle", raw=True))
    b.append(T(28, 812, "Datenschutz", 12, 600, c["muted"]) + T(362, 812, "Keine offizielle App von Indiware", 12, 400, c["faint"], "end"))
    return svg(w, h, c, "".join(b))

# ── Einstellungen (как в 14b): строки ведут в «Zugangscodes» и «Admin-Passwort» ──
p14b.ROWS[:] = [(KEY, "Zugangscodes", "4 aktiv"), (SHIELD, "Admin-Passwort", "ändern")]
def p_settings(c, theme, sub):
    return p14b.p_settings(c, theme, sub).replace(">Passwörter<", ">Zugang<")

def p_overview(c, theme, sub):
    inner, w, h = base("40 Admin · Übersicht", theme)
    return svg(w, h, c, inner.replace(">Klassenpasswort<", ">Zugangscodes<"))

# ════════════════ Computer ════════════════
g.ADMIN_NAV[3] = ("Zugangscodes", LOCK, "4")  # на месте «Passwörter» (14b вставил его третьим)

def pc_head(c):
    b = [g.admin_sidebar(c, 900, "Zugangscodes"), eyebrow(284, 39, "Admin · 9b", c), title(284, 80, "Zugangscodes", c, 38)]
    b.append(R(1020, 45, 190, 36, 18, c["card"]) + ICON(1032, 55, 0.58, c["faint"], SEARCH) + T(1052, 68, "Code suchen", 13, 400, c["faint2"]))
    b.append(button(1220, 40, 184, "Neuer Code", c, icon=PLUS, h=46))
    return "".join(b)

COLS = [("Bezeichnung", 304), ("Für", 460), ("Code", 570), ("Geräte", 670), ("Gültig bis", 840), ("Zuletzt", 980), ("Status", 1120)]

def pc_table(c, highlight=None):
    b = [note_box(284, 110, 1120, [S("Keine echten Namen — lieber »Eltern«, »Vertretung« oder »Schüler 07«. Sperren oder Löschen meldet die Geräte dieses Codes sofort ab.", 400, c["muted"])], c, SHIELD)]
    ty = 168
    b.append(R(284, ty, 1120, 46 + 57 * len(CODES), 22, c["card"]))
    for name, cx in COLS: b.append(T(cx, ty + 30, name, 12, 800, c["faint"]))
    for i, (name, kind, end, used, limit, last, active, valid) in enumerate(CODES):
        ry = ty + 46 + i * 57
        b.append(f'<line x1="304" y1="{ry}" x2="1384" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        if highlight == i: b.append(R(292, ry + 4, 1104, 49, 16, c["tint"]))
        dim, soft = (c["ink"], c["muted"]) if active else (c["faint"], c["faint"])
        who = {"gruppe": "Gruppe", "persoenlich": "Person", "alt": "alle (alt)"}[kind]
        gg = [T(304, ry + 33, name, 14, 800, dim), T(460, ry + 33, who, 13, 400, soft),
              T(570, ry + 33, "••••••••" if kind == "alt" else f"••••-{end}", 13, 700, dim),
              T(670, ry + 33, (f"{used} · unbegrenzt" if limit is None else f"{used} von {limit}"), 13, 400, soft),
              T(840, ry + 33, "ohne Ablauf" if valid == "—" else valid, 13, 400, soft), T(980, ry + 33, last, 13, 400, soft)]
        st, kk = ("AKTIV", "ok") if active else (("ABGELAUFEN" if valid == "abgelaufen" else "GESPERRT"), "off")
        bd, _ = badge(1120, ry + 19, st, c, kk); gg.append(bd)
        if limit is not None and used >= limit and active:
            bd2, _ = badge(1186, ry + 19, "VOLL", c, "tint"); gg.append(bd2)
        gg.append(switch(1318, ry + 16.5, active, c) + dots(1366, ry + 20, c))
        b.append("".join(gg))
    yb = ty + 46 + 57 * len(CODES) + 28
    b.append(T(284, yb, "Codes werden nur als Hash gespeichert. Den vollen Code siehst du nur einmal — beim Erstellen.", 12, 400, c["faint"]))
    b.append(ICON(284, yb + 14, 0.54, c["faint"], INFO) + T(302, yb + 25, "»Klassenpasswort« ist das alte gemeinsame Passwort: ausschalten, sobald alle einen Code haben.", 12, 400, c["faint"]))
    return "".join(b)

def pc_list(c, theme, sub, state="normal"):
    b = [pc_head(c)]
    if state == "laden":
        b.append(R(284, 110, 1120, 40.84, 16, c["skel"]) + R(284, 168, 1120, 46 + 57 * 5, 22, c["card"]))
        for i in range(5):
            ry = 168 + 46 + i * 57
            b.append(R(304, ry + 22, 120, 12, 6, c["skel"]) + R(570, ry + 22, 70, 12, 6, c["skel"]) + R(670, ry + 22, 90, 12, 6, c["skel"]) + R(1318, ry + 16.5, 42, 24, 12, c["skel"]))
        return svg(1440, 900, c, "".join(b))
    b.append(pc_table(c))
    if state == "gesperrt":
        b.append(toast(1044, 830, 360, "»Eltern« gesperrt · 9 Geräte abgemeldet", c))
    return svg(1440, 900, c, "".join(b))

def pc_new(c, theme, sub, state="form"):
    b = [pc_head(c), pc_table(c), overlay(c, 1440, 900)]
    X, W = 450, 540
    H = 730 if state == "fertig" else 580
    Y = (900 - H) / 2
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(g.modal_head(X, Y, W, "Admin · Zugangscodes", "Neuer Zugangscode", c))
    form, _ = new_form(X + 26, Y + 104, W - 52, c, state, pc=True)
    b.append(form)
    return svg(1440, 900, c, "".join(b))

def pc_menu(c, theme, sub):
    """Как 45 «Code-Aktionen (Dropdown)»: меню у трёх точек строки «Eltern»."""
    b = [pc_head(c), pc_table(c, highlight=1)]
    mx, my, mw = 1150, 330, 240
    rows = [(PEN, "Umbenennen", False), (PHONE, "Geräte-Limit ändern", False), (CLOCK, "Gültigkeit ändern", False),
            (PHONE, "Alle 9 Geräte abmelden", False), (REDO, "Neu erzeugen", False), (TRASH, "Löschen", True)]
    hh = 12 + 40 * len(rows) + 9
    b.append(R(mx, my, mw, hh, 18, c["card"], extra=' filter="url(#nsh0)"') + R(mx, my, mw, hh, 18, c["card"], c["hair"]))
    for i, (icon, t, danger) in enumerate(rows):
        oy = my + 6 + i * 40 + (9 if danger else 0)
        if danger: b.append(f'<line x1="{mx + 12}" y1="{oy - 4.5}" x2="{mx + mw - 12}" y2="{oy - 4.5}" stroke="{c["hair"]}" stroke-width="1"/>')
        col = c["danger"] if danger else c["ink"]
        b.append(ICON(mx + 16, oy + 11, 0.67, c["danger"] if danger else c["muted"], icon) + T(mx + 44, oy + 25, t, 14, 400, col))
    return svg(1440, 900, c, "".join(b))

def pc_confirm(c, theme, sub):
    b = [pc_head(c), pc_table(c), overlay(c, 1440, 900), dialog(c, 470, 300, 500, pc=True)]
    return svg(1440, 900, c, "".join(b))

def pc_zugang(c, theme, sub, state="voll"):
    inner, w, h = base("01 Zugang", theme, "PC")
    b = [inner, R(720, 0, 720, 900, 0, c["paper"])]
    x = 890
    b.append(eyebrow(x, 300.66, "Klasse 9b", c, accent=True) + title(x, 348.66, "Willkommen", c, 40))
    b.append(T(x, 391.84, "Gib deinen Zugangscode ein — oder das", 15, 400, c["muted"]))
    b.append(T(x, 415.09, "Klassenpasswort, falls du noch keinen Code hast.", 15, 400, c["muted"]))
    y = 453.34
    b.append(label(x, y, "Zugangscode oder Klassenpasswort", c))
    if state == "voll":
        b.append(R(x, y + 10, 380, 52, 16, c["field"]) + R(x + 1, y + 11, 378, 50, 15, "none", c["danger"], 2) + T(x + 17, y + 44, NEW, 20, 900, c["ink"], ls=1))
        b.append(error_line(x, y + 84, "Schon auf 2 von 2 Geräten angemeldet.", c))
        b.append(T(x + 19, y + 101, "Admin fragen: Gerät abmelden oder Limit erhöhen.", 12.5, 400, c["danger"]))
        by = y + 120
    else:
        b.append(R(x, y + 10, 380, 52, 16, c["field"]) + T(x + 17, y + 44, "ORB-Z-XXXX-XX", 20, 900, c["faint2"], ls=1))
        b.append(T(x, y + 80, "Vom Admin oder aus der Klassengruppe.", 12, 400, c["faint"]))
        by = y + 100
    b.append(button(x, by, 380, "Öffnen", c, icon=CHEV_R))
    b.append(T(x, by + 79, "Datenschutz", 12.5, 600, c["muted"]) + T(x + 380, by + 79, "Lehrkraft? Mit Lehrer-Code", 12.5, 700, c["accink"], "end"))
    return svg(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-liste": p_list,
    "handy-02-neu": p_new,
    "handy-03-neu-fertig": lambda c, t, s: p_new(c, t, s, "fertig"),
    "handy-04-aktionen": p_actions,
    "handy-05-sperren-fragen": p_confirm,
    "handy-06-gesperrt": lambda c, t, s: p_list(c, t, s, "gesperrt"),
    "handy-07-leer": lambda c, t, s: p_list(c, t, s, "leer"),
    "handy-08-laden": lambda c, t, s: p_list(c, t, s, "laden"),
    "handy-09-anmelden": p_zugang,
    "handy-10-limit-voll": lambda c, t, s: p_zugang(c, t, s, "voll"),
    "handy-11-abgemeldet": lambda c, t, s: p_zugang(c, t, s, "abgemeldet"),
    "handy-12-einstellungen": p_settings,
    "pc-01-liste": pc_list,
    "pc-02-neu": pc_new,
    "pc-03-neu-fertig": lambda c, t, s: pc_new(c, t, s, "fertig"),
    "pc-04-aktionen": pc_menu,
    "pc-05-sperren-fragen": pc_confirm,
    "pc-06-gesperrt": lambda c, t, s: pc_list(c, t, s, "gesperrt"),
    "pc-07-laden": lambda c, t, s: pc_list(c, t, s, "laden"),
    "pc-08-limit-voll": pc_zugang,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
