# Генератор макетов части 16 «Einladen»: ссылка + QR, по которым новый ученик сразу попадает в класс.
# Основа — оригиналы ORBook Soft: 12/13 «Teilen» (шторка/окно, кнопки Kopieren + WhatsApp),
# 22 «Mehr» и PC 22 «Einstellungen · Übersicht» (строки и карточки), 01 «Zugang» (вход),
# 43/45 «Code-Aktionen», 48 «Löschen bestätigen». Помощники и токены — из частей 14, 14b, 14c.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", path))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

z = _load("g14c", "14c-zugangscodes/gen.py")  # заодно грузит 14b и 14 (помощники, цвета, меню админки)
g, p14b = z.g, z.p14b
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, note_box, svg, overlay, base = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.note_box, g.svg, g.overlay, g.base)
badge, switch, toast, error_line = g.badge, g.switch, p14b.toast, p14b.error_line
CHECK, CHEV_R, BACK, CLOSE, COPY, PEN, TRASH, LOCK, SHIELD, KEY = (
    g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.COPY, g.PEN, g.TRASH, g.LOCK, g.SHIELD, g.KEY)
USERS, PHONE, REDO, CLOCK, INFO, WARN = z.USERS, z.PHONE, z.REDO, z.CLOCK, z.INFO, z.WARN

# ── Новые иконки (контур 24×24, stroke 2 — как все иконки Soft) ──
QR_ICON = ('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>'
           '<rect x="3" y="14" width="7" height="7" rx="1.5"/>' + P("M14 14h3v3M21 14v.01M14 21h3M21 17v4h-1"))
EXPAND = P("M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5")
LINK = P("M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1")
USER_PLUS = '<circle cx="9" cy="8" r="4"/>' + P("M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6")
WHATSAPP = P("M4 20l1.3-4A8 8 0 1 1 8 18.7z") + P("M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z")  # из 12 «Teilen»

# ── Данные ──
URL = "orbook.orbitium.net/i/K7MQ-2XPA"  # короткая ссылка: /i/ + токен приглашения (не сам Zugangscode)
# QR этой ссылки (https://…), версия 4-Q — настоящий, сканируется; запас Q (25 %) позволяет логотип в центре
QR = [
    "111111101000001101011001001111111", "100000100111001111001100001000001", "101110100110000011100101001011101",
    "101110100111000100011111001011101", "101110101010111010100010001011101", "100000101110001100001000101000001",
    "111111101010101010101010101111111", "000000000010011010000111100000000", "011111110011001101000000100110001",
    "111001001100011000111101001101101", "010110110110100110100100001010110", "100110011100110010001101011011101",
    "001010111000010110100111000101011", "011110011011000110001001111001111", "000000101111001110110010011011110",
    "110111011111101001011100011011100", "011010110111111110011011110111001", "111101000010010110111101001101101",
    "100111100100111010001100110110110", "010111001100100011100111111111101", "000100100111111111011100110111011",
    "111010001110010000100001100101101", "100001111100011010001010011000110", "100101011010011110100110111110111",
    "101011110111101000100010111110010", "000000001100001001011110100010101", "111111101110110001000101101010100",
    "100000101100010101010101100011110", "101110101001111011100100111111011", "101110101110011100101100010011001",
    "101110101000100010010000111101000", "100000101110100000011101111011100", "111111100010100100110011110100010",
]
SEP = "Klasse 9b · Gruppe · 21 Geräte"

# QR всегда тёмный на белом — иначе камеры в тёмной теме его не прочтут (как белые чекбоксы в 42).
# Для кода: токены --color-qr-bg / --color-qr-ink / --color-qr-eye, одинаковые в @theme и .dark
# (eye = фиолетовый светлой темы: на белом он достаточно тёмный для камеры).
QRBG, QRINK, QREYE = "#FFFFFF", "#2A2433", "#6C4DF6"

def qr(x, y, size, c, dim=False):
    """Красивый QR: точки вместо квадратов, «глаза» в фирменном цвете (чуть скруглены — сильнее камеры путаются), логотип в центре."""
    n = len(QR)
    pad = size * 0.08  # ~3 Module ruhiger Rand
    m = (size - 2 * pad) / n
    ox, oy = x + pad, y + pad
    eyes = [(0, 0), (n - 7, 0), (0, n - 7)]
    lo, hi = n // 2 - 3, n // 2 + 3  # Mitte 7×7 frei für das Logo
    def in_eye(r, col): return any(er <= r < er + 7 and ec <= col < ec + 7 for ec, er in eyes)
    out = [R(x, y, size, size, round(size * 0.09, 1), QRBG)]
    dots = []
    for r, row in enumerate(QR):
        for col, v in enumerate(row):
            if v == "1" and not in_eye(r, col) and not (lo <= r <= hi and lo <= col <= hi):
                cx, cy = ox + (col + .5) * m, oy + (r + .5) * m
                dots.append(f"M{cx - m * .44:.2f} {cy:.2f}a{m * .44:.2f} {m * .44:.2f} 0 1 0 {m * .88:.2f} 0a{m * .44:.2f} {m * .44:.2f} 0 1 0 {-m * .88:.2f} 0")
    out.append(f'<path d="{"".join(dots)}" fill="{QRINK}"/>')
    for ec, er in eyes:
        ex, ey = ox + ec * m, oy + er * m
        out.append(R(round(ex + m / 2, 2), round(ey + m / 2, 2), round(6 * m, 2), round(6 * m, 2), round(1.2 * m, 2), "none", QREYE, round(m, 2)))
        out.append(R(round(ex + 2 * m, 2), round(ey + 2 * m, 2), round(3 * m, 2), round(3 * m, 2), round(0.6 * m, 2), QRINK))
    # Logo: dieselbe Umlaufbahn wie in der Seitenleiste (Kreis + Ellipse + Mond), auf weißem Feld
    lx, ly, lw = ox + lo * m, oy + lo * m, 7 * m
    k = lw * 0.8 / 76
    out.append(R(round(lx, 2), round(ly, 2), round(lw, 2), round(lw, 2), round(lw * 0.28, 2), QRBG))
    out.append(f'<g transform="translate({lx + lw * .1:.2f} {ly + lw * .1:.2f}) scale({k:.4f})" fill="none">'
               f'<ellipse cx="38" cy="38" rx="33" ry="13.5" stroke="{QREYE}" stroke-width="5" transform="rotate(-28 38 38)"/>'
               f'<circle cx="38" cy="38" r="11" fill="{QRINK}"/><circle cx="64" cy="25" r="5.5" fill="{QREYE}"/></g>')
    body = "".join(out)
    return f'<g opacity="0.12">{body}</g>' if dim else body

def sheet(top, c, eyebrow_text, title_text, H=844):
    """Шторка как 12 «Teilen»: скруглённый верх 30, ручка, надзаголовок, заголовок 26/900, круглая «×»."""
    b = [f'<path d="M30,{top} H360 A30,30 0 0 1 390,{top + 30} V{H}  H0  V{top + 30} A30,30 0 0 1 30,{top} Z" fill="{c["paper"]}"/>',
         R(176, top + 10, 38, 4, 2, c["faint2"]), eyebrow(18, top + 41, eyebrow_text, c), title(18, top + 70, title_text, c, 26),
         R(338, top + 42, 34, 34, 17, c["card"]) + ICON(346.5, top + 50.5, 0.71, c["ink"], CLOSE)]
    return "".join(b)

def hair(x1, x2, y, c): return f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{c["hair"]}" stroke-width="1"/>'

def rows_card(x, y, w, c, rows, rh=50):
    """Белая карточка со строками как в 22 «Mehr»/43: значок, текст, справа значение+шеврон или переключатель."""
    out = [R(x, y, w, rh * len(rows), 22, c["card"])]
    for i, (icon, name, right, kind) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(hair(x + 14, x + w - 14, ry, c))
        col = {"danger": c["danger"], "accent": c["accink"]}.get(kind, c["ink"])
        icol = {"danger": c["danger"], "accent": c["accink"]}.get(kind, c["muted"])
        out.append(ICON(x + 14, ry + rh / 2 - 9, 0.75, icol, icon) + T(x + 45, ry + rh / 2 + 5.5, name, 15, 700 if kind == "accent" else 400, col))
        if kind == "switch-on" or kind == "switch-off":
            out.append(switch(x + w - 56, ry + rh / 2 - 12, kind == "switch-on", c))
        elif kind != "danger":
            if right: out.append(T(x + w - 34, ry + rh / 2 + 4.5, right, 13, 400, c["faint"], "end"))
            out.append(ICON(x + w - 28, ry + rh / 2 - 7, 0.58, c["faint"], CHEV_R))
    return "".join(out)

def two_buttons(x, y, w, c, dim=False, web=False):
    """Kopieren (песочная) + WhatsApp (фиолетовая) — пара кнопок из 12/13 «Teilen»."""
    bw = (w - 8) / 2
    out = button(x, y, bw, "Kopieren", c, "sand", COPY) + button(x + bw + 8, y, bw, "WhatsApp Web" if web else "WhatsApp", c, icon=WHATSAPP)
    return f'<g opacity="0.4">{out}</g>' if dim else out

def link_line(cx, y, c, size=14):
    """Ссылка под QR: жирная, по центру, цвет ссылки."""
    return T(cx, y, URL, size, 800, c["accink"], "middle")

def inner_of(page):
    return page[page.index("</defs>") + 7: page.rindex("</svg>")]

# ── Список Zugangscodes (14c) с меткой «LINK» у кода, к которому есть приглашение ──
_card = z.code_card
def code_card_link(x, y, w, row, c):
    out, h = _card(x, y, w, row, c)
    if row[0] == "Klasse 9b":
        bx = x + 14 + g.tw("Klasse 9b", 15) + 10 + len("GRUPPE") * 7.1 + 16 + 6
        bd, _ = badge(bx, y + 18.5, "LINK", c, "ok")
        out = out[:-4] + bd + "</g>"
    return out, h
z.code_card = code_card_link

def admin_list(c, theme, sub):
    return inner_of(z.p_list(c, theme, sub))

# ════════════════ Telefon · Admin ════════════════
ADMIN_ACTIONS = [(QR_ICON, "Einladen", "Link + QR", "accent"), (PEN, "Umbenennen", "", None), (PHONE, "Geräte-Limit", "unbegrenzt", None),
                 (CLOCK, "Gültigkeit", "Schuljahresende", None), (PHONE, "Geräte abmelden", "21 angemeldet", None),
                 (REDO, "Neu erzeugen", "neuer Code", None), (LOCK, "Sperren", "", None), (TRASH, "Löschen", "", "danger")]

def p_aktionen(c, theme, sub):
    top = 236
    b = [admin_list(c, theme, sub), overlay(c, 390, 844), sheet(top, c, "••••-7Q · aktiv · Gruppe", "Klasse 9b", 844)]
    b.append(T(18, top + 98, "21 Geräte · unbegrenzt · zuletzt heute 07:12", 14, 400, c["muted"]))
    rows = [(i, n, r, k) for i, n, r, k in ADMIN_ACTIONS]
    b.append(rows_card(18, top + 116, 354, c, rows))
    b.append(T(18, top + 116 + 50 * len(rows) + 24, "»Einladen« gibt es nur für Gruppen-Codes.", 12, 400, c["faint"]))
    return svg(390, 844, c, "".join(b))

def einladen_body(top, c, state="normal"):
    """Inhalt der Admin-Schublade »Einladen«. state: normal | aus | laden."""
    b = []
    y = top + 92
    b.append(R(18, y, 354, 246, 22, c["card"]))
    if state == "laden":
        b.append(R(111, y + 16, 168, 168, 16, c["skel"]) + R(95, y + 202, 200, 13, 6.5, c["skel"]) + R(125, y + 224, 140, 10, 5, c["skel"]))
    else:
        b.append(qr(111, y + 16, 168, c, dim=state == "aus"))
        if state == "aus":
            b.append(R(130, y + 84, 130, 32, 16, c["sand"]) + ICON(144, y + 92, 0.67, c["muted"], LOCK) + T(166, y + 105, "Link ist aus", 13, 800, c["muted"]))
            b.append(T(195, y + 210, URL, 14, 800, c["faint"], "middle"))
            b.append(T(195, y + 230, "Niemand kommt mehr über diesen Link rein.", 12, 400, c["faint"], "middle"))
        else:
            b.append(link_line(195, y + 210, c))
            b.append(T(195, y + 230, "Mit der Handy-Kamera scannen oder Link senden", 12, 400, c["faint"], "middle"))
    y += 258
    if state == "laden":
        b.append(f'<g opacity="0.4">{two_buttons(18, y, 354, c)}</g>')
    else:
        b.append(two_buttons(18, y, 354, c, dim=state == "aus"))
    y += 64
    on = state != "aus"
    rows = [(EXPAND, "QR groß zeigen", "Beamer", None), (LINK, "Link aktiv", "", "switch-on" if on else "switch-off"),
            (USERS, "Mitschüler dürfen teilen", "", "switch-on" if on else "switch-off"), (REDO, "Neuen Link erzeugen", "alter geht aus", None)]
    if state == "laden":
        b.append(R(18, y, 354, 200, 22, c["card"]))
        for i in range(4):
            b.append(R(32, y + 19 + i * 50, 18, 12, 6, c["skel"]) + R(63, y + 19 + i * 50, 150, 12, 6, c["skel"]))
    else:
        b.append(rows_card(18, y, 354, c, rows))
    y += 222
    b.append(T(18, y, "Wer den Link hat, kommt in die 9b und zählt zu", 12, 400, c["faint"]))
    b.append(T(18, y + 17, "»Klasse 9b«. Nur in der Klassengruppe teilen.", 12, 400, c["faint"]))
    return "".join(b)

def p_einladen(c, theme, sub, state="normal", extra=""):
    top = 96
    eb = "Klasse 9b · Gruppe · 21 Geräte" if state != "aus" else "Klasse 9b · Link ausgeschaltet"
    b = [admin_list(c, theme, sub), overlay(c, 390, 844), sheet(top, c, eb, "Einladen", 844), einladen_body(top, c, state), extra]
    return svg(390, 844, c, "".join(b))

def p_kopiert(c, theme, sub):
    return p_einladen(c, theme, sub, extra=toast(18, 770, 354, "Link kopiert", c))

def dialog_neu(c, x, y, w, pc=False):
    """Окно как 48: значок, заголовок, текст, черта, две кнопки справа."""
    h = 250 if pc else 290
    b = [R(x, y, w, h, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 28, c["paper"])]
    b.append(ICON(x + 26, y + 26, 0.83, c["accink"], REDO))
    b.append(R(x + w - 52, y + 22, 30, 30, 15, c["card"]) + ICON(x + w - 44.5, y + 29.5, 0.62, c["ink"], CLOSE))
    b.append(T(x + 26, y + 80, "Neuen Link erzeugen?", 25 if pc else 22, 900, c["ink"], ls=-0.35))
    lines = (["Der alte Link und der alte QR gehen dann nicht mehr.", "Wer schon drin ist, bleibt angemeldet."] if pc else
             ["Der alte Link und der alte QR", "gehen dann nicht mehr.", "Wer schon drin ist, bleibt", "angemeldet."])
    for i, ln in enumerate(lines):
        b.append(T(x + 26, y + 112 + i * 21, ln, 14, 400, c["muted"]))
    ly = y + h - 78
    b.append(hair(x + 26, x + w - 26, ly, c))
    b.append(button(x + w - 26 - 140 - 8 - 112, ly + 14, 112, "Abbrechen", c, "sand", None))
    b.append(button(x + w - 26 - 140, ly + 14, 140, "Neuer Link", c, icon=REDO))
    return "".join(b)

def p_neu_fragen(c, theme, sub):
    page = p_einladen(c, theme, sub)
    return svg(390, 844, c, inner_of(page) + overlay(c, 390, 844) + dialog_neu(c, 18, 270, 354))

def p_gross(c, theme, sub, who="admin"):
    """Ganzer Bildschirm: großer QR zum Zeigen (Beamer, Banknachbar). Hell bleibt hell, damit Kameras ihn lesen."""
    b = [round_btn(18, 33.31, c, CLOSE), eyebrow(66, 33, "Einladung · 9b", c), title(66, 65, "Klasse 9b", c)]
    b.append(qr(31, 128, 328, c))
    b.append(T(195, 512, "Kamera drauf halten", 22, 900, c["ink"], "middle", -0.33))
    b.append(T(195, 540, "und den Link antippen — fertig.", 14, 400, c["muted"], "middle"))
    b.append(link_line(195, 586, c, 15))
    b.append(note_box(18, 640, 354, ["Der Bildschirm bleibt an, solange", "der QR offen ist."], c, INFO))
    b.append(button(18, 724, 354, "Link kopieren", c, "sand", COPY))
    return svg(390, 844, c, "".join(b))

# ════════════════ Telefon · Schüler ════════════════
def mehr_row(y, c):
    """Neue Zeile in der letzten Karte von 22 «Mehr» (zwischen Datenschutz und Klasse verlassen), 52 hoch wie dort."""
    return (R(18, y, 354, 52, 0, c["card"]) + ICON(32, y + 17, 0.79, c["muted"], USER_PLUS, 1.9)
            + T(63, y + 31.5, "Klasse einladen", 14.5, 500, c["ink"]) + T(330, y + 31, "Link + QR", 13, 400, c["faint"], "end")
            + ICON(342, y + 18.5, 0.67, c["faint2"], CHEV_R) + hair(32, 358, y + 52, c))

def mehr_inner(c, theme, H):
    inner, w, h = base("22 Mehr", theme)
    # nur der Inhalt 541–700 rutscht 52 nach unten; die untere Navigation (ab 760) bleibt, wo sie ist
    return (f'<clipPath id="mtop"><rect x="0" y="0" width="390" height="541.31"/><rect x="0" y="760" width="390" height="{H - 760}"/></clipPath>'
            f'<clipPath id="mbot"><rect x="0" y="541.31" width="390" height="158.69"/></clipPath>'
            f'<g clip-path="url(#mtop)">{inner}</g><g transform="translate(0 52)"><g clip-path="url(#mbot)">{inner}</g></g>' + mehr_row(541.31, c))

def p_mehr(c, theme, sub):
    return svg(390, 900, c, mehr_inner(c, theme, 900))

def p_schueler(c, theme, sub, state="normal"):
    b = [mehr_inner(c, theme, 900), overlay(c, 390, 900)]
    if state == "aus":
        top = 520
        b.append(sheet(top, c, "9b · Meine Schule", "Klasse einladen", 900))
        y = top + 112
        b.append(R(163, y, 64, 64, 32, c["sand"]) + ICON(182, y + 19, 1.08, c["muted"], LINK, 1.9))
        b.append(T(195, y + 101, "Einladen ist gerade aus", 20, 900, c["ink"], "middle", -0.3))
        b.append(T(195, y + 128, "Der Admin hat den Link ausgeschaltet.", 14, 400, c["muted"], "middle"))
        b.append(T(195, y + 148, "Neue können sich mit einem Zugangscode", 14, 400, c["muted"], "middle"))
        b.append(T(195, y + 168, "anmelden — den gibt es beim Admin.", 14, 400, c["muted"], "middle"))
        b.append(button(18, y + 192, 354, "Verstanden", c, "sand", None))
        return svg(390, 900, c, "".join(b))
    top = 180
    b.append(sheet(top, c, "9b · Meine Schule", "Klasse einladen", 900))
    b.append(T(18, top + 100, "Zeig den QR deinen Mitschülern oder schick", 14, 400, c["muted"]))
    b.append(T(18, top + 120, "den Link in die Klassengruppe.", 14, 400, c["muted"]))
    y = top + 140
    b.append(R(18, y, 354, 266, 22, c["card"]) + qr(105, y + 16, 180, c))
    b.append(link_line(195, y + 222, c))
    b.append(T(195, y + 244, "Ein Tippen — und der Plan der 9b ist da", 12, 400, c["faint"], "middle"))
    y += 278
    b.append(two_buttons(18, y, 354, c))
    y += 66
    b.append(button(18, y - 8, 354, "QR groß zeigen", c, "sand", EXPAND))
    y += 72
    b.append(ICON(18, y - 11, 0.58, c["faint"], SHIELD) + T(37, y, "Nur für die 9b — bitte nicht öffentlich posten.", 12, 400, c["faint"]))
    return svg(390, 900, c, "".join(b))

# ════════════════ Telefon · Link öffnen (Beitreten) ════════════════
def zugang_top(theme, c):
    inner, w, h = base("01 Zugang", theme)
    return inner + R(0, 560, 390, 284, 0, c["paper"])

def invite_card(x, y, w, c, state="normal"):
    out = [R(x, y, w, 72, 22, c["card"])]
    if state == "laden":
        return "".join(out) + R(x + 14, y + 16, 40, 40, 20, c["skel"]) + R(x + 66, y + 22, 110, 13, 6.5, c["skel"]) + R(x + 66, y + 44, 170, 10, 5, c["skel"])
    out.append(R(x + 14, y + 16, 40, 40, 20, c["tint"]) + ICON(x + 24.5, y + 26.5, 0.79, c["accink"], USERS))
    out.append(T(x + 66, y + 33, "Klasse 9b", 15, 800, c["ink"]) + T(x + 66, y + 53, "Einladung zu ORBook · Meine Schule", 12.5, 400, c["muted"]))
    return "".join(out)

def p_beitreten(c, theme, sub, state="normal"):
    b = [zugang_top(theme, c)]
    if state == "ungueltig":
        b.append(R(28, 470, 334, 76, 16, c["dtint"]) + ICON(42, 484, 0.67, c["danger"], LINK))
        b.append(T(68, 497, "Dieser Link gilt nicht mehr", 14, 800, c["danger"]))
        b.append(T(68, 516, "Der Admin hat ihn geändert oder", 12.5, 400, c["danger"]))
        b.append(T(68, 533, "ausgeschaltet. Mit Code geht es trotzdem:", 12.5, 400, c["danger"]))
        b.append(label(28, 584, "Zugangscode oder Klassenpasswort", c))
        b.append(R(28, 594, 334, 50, 16, c["field"]) + T(45, 624, "ORB-A-XXXX-XX", 16, 400, c["faint2"], ls=1))
        b.append(T(28, 662, "Vom Admin oder aus der Klassengruppe.", 12, 400, c["faint"]))
        b.append(button(28, 682, 334, "Öffnen", c, icon=CHEV_R))
    else:
        b.append(eyebrow(28, 584, "Du wurdest eingeladen", c, accent=True))
        b.append(invite_card(28, 596, 334, c, "laden" if state == "laden" else "normal"))
        if state == "voll":
            b.append(error_line(28, 692, "Kein Platz mehr: 30 von 30 Geräten.", c))
            b.append(T(47, 709, "Frag den Admin, ob er das Limit erhöht.", 12.5, 400, c["danger"]))
            b.append(button(28, 726, 334, "Nochmal versuchen", c, "sand", REDO))
        else:
            b.append(T(28, 690, "Kein Konto, keine E-Mail — ein Tippen genügt.", 12, 400, c["faint"]))
            btn = button(28, 710, 334, "Beitreten", c, icon=CHEV_R)
            b.append(f'<g opacity="0.45">{btn}</g>' if state == "laden" else btn)
    if state != "voll":
        b.append(T(195, 784, S("Schon einen Code? ", 400, c["muted"]) + S("Mit Code anmelden", 800, c["accink"]), 13.5, 400, c["muted"], "middle", raw=True)
                 if state != "ungueltig" else "")
    b.append(T(28, 818, "Datenschutz", 12, 600, c["muted"]) + T(362, 818, "Keine offizielle App von Indiware", 12, 400, c["faint"], "end"))
    return svg(390, 844, c, "".join(b))

# ════════════════ Computer · Admin ════════════════
def pc_admin(c, highlight=None):
    return z.pc_head(c) + z.pc_table(c, highlight) + badge(1186, 214 + 19, "LINK", c, "ok")[0]

def pc_menu(c, theme, sub):
    b = [pc_admin(c, highlight=0)]
    mx, my, mw = 1150, 262, 240
    rows = [(QR_ICON, "Einladen · Link und QR", "accent"), (PEN, "Umbenennen", None), (PHONE, "Geräte-Limit ändern", None),
            (CLOCK, "Gültigkeit ändern", None), (PHONE, "Alle 21 Geräte abmelden", None), (REDO, "Neu erzeugen", None), (TRASH, "Löschen", "danger")]
    hh = 12 + 40 * len(rows) + 18
    b.append(R(mx, my, mw, hh, 18, c["card"], extra=' filter="url(#nsh0)"') + R(mx, my, mw, hh, 18, c["card"], c["hair"]))
    for i, (icon, t, kind) in enumerate(rows):
        oy = my + 6 + i * 40 + (9 if i >= 1 else 0) + (9 if kind == "danger" else 0)
        if i == 1 or kind == "danger": b.append(hair(mx + 12, mx + mw - 12, oy - 4.5, c))
        col = {"danger": c["danger"], "accent": c["accink"]}.get(kind, c["ink"])
        if kind == "accent": b.append(R(mx + 6, oy, mw - 12, 36, 12, c["tint"]))
        b.append(ICON(mx + 16, oy + 11, 0.67, col if kind else c["muted"], icon) + T(mx + 44, oy + 25, t, 14, 700 if kind == "accent" else 400, col))
    return svg(1440, 900, c, "".join(b))

def pc_window(c, X, Y, W, H):
    return "".join(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else "") for f in ("nsh0", "nsh1", None))

def pc_einladen_body(X, Y, W, c, state="normal", who="admin"):
    """Окно «Einladen»: слева QR, справа ссылка, кнопки, переключатели."""
    b = []
    qx, qy = X + 26, Y + 100
    b.append(R(qx, qy, 236, 236, 22, c["card"]) + qr(qx + 18, qy + 18, 200, c, dim=state == "aus"))
    if state == "aus":
        b.append(R(qx + 53, qy + 102, 130, 32, 16, c["sand"]) + ICON(qx + 67, qy + 110, 0.67, c["muted"], LOCK) + T(qx + 89, qy + 123, "Link ist aus", 13, 800, c["muted"]))
    rx, rw = X + 280, W - 306
    b.append(label(rx, qy + 10, "Einladungslink", c))
    b.append(R(rx, qy + 22, rw, 50, 16, c["field"]) + ICON(rx + 16, qy + 39, 0.67, c["accink"], LINK) + T(rx + 40, qy + 52, URL, 13, 800, c["accink"])
             )
    b.append(T(rx, qy + 92, "Scannen oder Link in die Klassengruppe senden.", 12, 400, c["faint"]))
    b.append(two_buttons(rx, qy + 108, rw, c, web=True))
    b.append(button(rx, qy + 166, rw, "QR groß zeigen", c, "sand", EXPAND))
    if who == "admin":
        y = qy + 256
        rows = [(LINK, "Link aktiv", "", "switch-on"), (USERS, "Mitschüler dürfen teilen", "", "switch-on"), (REDO, "Neuen Link erzeugen", "alter geht aus", None)]
        b.append(rows_card(X + 26, y, W - 52, c, rows))
        b.append(T(X + 26, y + 174, "Wer den Link hat, kommt in die 9b und zählt zu »Klasse 9b« (unbegrenzt).", 12, 400, c["faint"]))
        b.append(T(X + 26, y + 191, "Nur in der Klassengruppe teilen — nicht öffentlich posten.", 12, 400, c["faint"]))
    else:
        b.append(ICON(X + 26, qy + 268 - 11, 0.58, c["faint"], SHIELD) + T(X + 45, qy + 268, "Nur für die 9b — bitte nicht öffentlich posten.", 12, 400, c["faint"]))
    return "".join(b)

def pc_einladen(c, theme, sub):
    X, W, H = 410, 620, 590
    Y = (900 - H) / 2
    b = [pc_admin(c), overlay(c, 1440, 900), pc_window(c, X, Y, W, H), g.modal_head(X, Y, W, SEP, "Einladen", c), pc_einladen_body(X, Y, W, c)]
    return svg(1440, 900, c, "".join(b))

def pc_kopiert(c, theme, sub):
    page = pc_einladen(c, theme, sub)
    return svg(1440, 900, c, inner_of(page) + toast(1044, 830, 360, "Link kopiert", c))

def pc_gross(c, theme, sub):
    """Großer QR für Beamer/Elternabend: fast der ganze Bildschirm."""
    X, W, H = 420, 600, 820
    Y = 40
    b = [pc_admin(c), overlay(c, 1440, 900), pc_window(c, X, Y, W, H)]
    kx = X + W - 120.87
    b.append(eyebrow(X + 300, Y + 50, "Einladung · Meine Schule", c, accent=False).replace('x="720"', 'x="720" text-anchor="middle"'))
    b.append(R(kx, Y + 24, 30.88, 22, 8, c["card"], c["rule"]) + T(kx + 7, Y + 38, "Esc", 11, 600, c["muted"]) + round_btn(X + W - 80, Y + 24, c, CLOSE, size=34))
    b.append(T(720, Y + 96, "Klasse 9b", 40, 900, c["ink"], "middle", -0.6))
    b.append(qr(720 - 230, Y + 130, 460, c))
    b.append(T(720, Y + 640, "Kamera drauf halten und den Link antippen.", 18, 800, c["ink"], "middle"))
    b.append(link_line(720, Y + 690, c, 22))
    b.append(T(720, Y + 740, "Esc schließt die Ansicht · der Link bleibt gültig, bis du ihn änderst.", 12.5, 400, c["faint"], "middle"))
    return svg(1440, 900, c, "".join(b))

def pc_neu_fragen(c, theme, sub):
    page = pc_einladen(c, theme, sub)
    return svg(1440, 900, c, inner_of(page) + overlay(c, 1440, 900) + dialog_neu(c, 470, 325, 500, pc=True))

def pc_aus(c, theme, sub):
    X, W, H = 410, 620, 590
    Y = (900 - H) / 2
    body = pc_einladen_body(X, Y, W, c, "aus").replace("switch-on", "")
    # переключатели в выключенном виде
    y = Y + 100 + 256
    rows = [(LINK, "Link aktiv", "", "switch-off"), (USERS, "Mitschüler dürfen teilen", "", "switch-off"), (REDO, "Neuen Link erzeugen", "alter geht aus", None)]
    b = [pc_admin(c), overlay(c, 1440, 900), pc_window(c, X, Y, W, H), g.modal_head(X, Y, W, "Klasse 9b · Link ausgeschaltet", "Einladen", c), body,
         R(X + 26, y, W - 52, 150, 22, c["card"]), rows_card(X + 26, y, W - 52, c, rows)]
    return svg(1440, 900, c, "".join(b))

# ════════════════ Computer · Schüler ════════════════
def cut2(inner, cuts, W, H, uid):
    """Wie cut_shift, aber mehrere Spalten mit eigenem Versatz: [(x0, x1, cut_y, dy), …]."""
    parts, keep = [], [f'<rect x="0" y="0" width="{W}" height="{H}"/>']
    clips = [f'<clipPath id="{uid}top">']
    for x0, x1, cy, dy in cuts:
        clips.append(f'<rect x="{x0}" y="0" width="{x1 - x0}" height="{cy}"/>')
    # alles außerhalb der Spalten bleibt unverändert
    xs = sorted((x0, x1) for x0, x1, _, _ in cuts)
    px = 0
    for x0, x1 in xs:
        if x0 > px: clips.append(f'<rect x="{px}" y="0" width="{x0 - px}" height="{H}"/>')
        px = x1
    if px < W: clips.append(f'<rect x="{px}" y="0" width="{W - px}" height="{H}"/>')
    clips.append("</clipPath>")
    for i, (x0, x1, cy, dy) in enumerate(cuts):
        clips.append(f'<clipPath id="{uid}b{i}"><rect x="{x0}" y="{cy}" width="{x1 - x0}" height="{H}"/></clipPath>')
        parts.append(f'<g transform="translate(0 {dy})"><g clip-path="url(#{uid}b{i})">{inner}</g></g>')
    return "".join(clips) + f'<g clip-path="url(#{uid}top)">{inner}</g>' + "".join(parts)

def pc_settings_inner(c, theme):
    inner, w, h = base("22 Einstellungen · Übersicht", theme, "PC")
    # links: Menüpunkt »Klasse einladen« vor dem Strich; rechts: neue Karte in Reihe 5, Fußzeile rutscht nach unten
    body = cut2(inner, [(270, 540, 432, 40), (540, 1260, 470, 80)], 1440, 900, "ein")
    b = [body]
    b.append(ICON(296, 440.03, 0.75, c["muted"], USER_PLUS) + T(326, 453.53, "Klasse einladen", 13.5, 700, c["muted"]))
    b.append(R(558, 476.11, 334, 68, 22, c["card"]) + R(574, 490.11, 40, 40, 20, c["tint"]) + ICON(584.5, 500.61, 0.79, c["accink"], USER_PLUS))
    b.append(T(628, 505.61, "Klasse einladen", 15, 700, c["ink"]) + T(628, 525.61, "Link und QR für Mitschüler", 12.5, 400, c["faint"]))
    b.append(ICON(860, 502.11, 0.67, c["faint2"], CHEV_R))
    return "".join(b)

def pc_schueler(c, theme, sub):
    return svg(1440, 900, c, pc_settings_inner(c, theme))

def pc_schueler_fenster(c, theme, sub):
    X, W, H = 410, 620, 440
    Y = (900 - H) / 2
    b = [pc_settings_inner(c, theme), overlay(c, 1440, 900), pc_window(c, X, Y, W, H),
         g.modal_head(X, Y, W, "9b · Meine Schule", "Klasse einladen", c), pc_einladen_body(X, Y, W, c, who="schueler")]
    return svg(1440, 900, c, "".join(b))

# ════════════════ Computer · Link öffnen ════════════════
def pc_beitreten(c, theme, sub, state="normal"):
    inner, w, h = base("01 Zugang", theme, "PC")
    b = [inner, R(720, 0, 720, 900, 0, c["paper"])]
    x = 890
    b.append(eyebrow(x, 300.66, "Du wurdest eingeladen", c, accent=True) + title(x, 348.66, "Klasse 9b", c, 40))
    if state == "ungueltig":
        b.append(T(x, 391.84, "Dieser Einladungslink gilt nicht mehr — mit", 15, 400, c["muted"]))
        b.append(T(x, 415.09, "Zugangscode oder Klassenpasswort geht es trotzdem.", 15, 400, c["muted"]))
        y = 453.34
        b.append(R(x, y, 380, 58, 16, c["dtint"]) + ICON(x + 14, y + 13, 0.67, c["danger"], LINK))
        b.append(T(x + 40, y + 25, "Link geändert oder ausgeschaltet", 14, 800, c["danger"]) + T(x + 40, y + 44, "Frag in der Klassengruppe nach dem neuen.", 12.5, 400, c["danger"]))
        y += 82
        b.append(label(x, y, "Zugangscode oder Klassenpasswort", c))
        b.append(R(x, y + 10, 380, 52, 16, c["field"]) + T(x + 17, y + 44, "ORB-A-XXXX-XX", 20, 900, c["faint2"], ls=1))
        b.append(button(x, y + 82, 380, "Öffnen", c, icon=CHEV_R))
        by = y + 82
    else:
        b.append(T(x, 391.84, "ORBook zeigt Stundenplan, Vertretungen und", 15, 400, c["muted"]))
        b.append(T(x, 415.09, "Klausuren der 9b. Kein Konto, keine E-Mail.", 15, 400, c["muted"]))
        b.append(invite_card(x, 453.34, 380, c))
        by = 453.34 + 96
        b.append(button(x, by, 380, "Beitreten", c, icon=CHEV_R))
    b.append(T(x, by + 79, "Datenschutz", 12.5, 600, c["muted"]))
    if state != "ungueltig":
        b.append(T(x + 380, by + 79, "Schon einen Code? Mit Code anmelden", 12.5, 700, c["accink"], "end"))
    return svg(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-aktionen": p_aktionen,
    "handy-02-einladen": p_einladen,
    "handy-03-kopiert": p_kopiert,
    "handy-04-gross": p_gross,
    "handy-05-neuer-link-fragen": p_neu_fragen,
    "handy-06-link-aus": lambda c, t, s: p_einladen(c, t, s, "aus"),
    "handy-07-laden": lambda c, t, s: p_einladen(c, t, s, "laden"),
    "handy-08-mehr": p_mehr,
    "handy-09-schueler-einladen": p_schueler,
    "handy-10-schueler-aus": lambda c, t, s: p_schueler(c, t, s, "aus"),
    "handy-11-beitreten": p_beitreten,
    "handy-12-beitreten-laden": lambda c, t, s: p_beitreten(c, t, s, "laden"),
    "handy-13-link-ungueltig": lambda c, t, s: p_beitreten(c, t, s, "ungueltig"),
    "handy-14-klasse-voll": lambda c, t, s: p_beitreten(c, t, s, "voll"),
    "pc-01-menue": pc_menu,
    "pc-02-einladen": pc_einladen,
    "pc-03-kopiert": pc_kopiert,
    "pc-04-gross": pc_gross,
    "pc-05-neuer-link-fragen": pc_neu_fragen,
    "pc-06-link-aus": pc_aus,
    "pc-07-schueler": pc_schueler,
    "pc-08-schueler-einladen": pc_schueler_fenster,
    "pc-09-beitreten": pc_beitreten,
    "pc-10-link-ungueltig": lambda c, t, s: pc_beitreten(c, t, s, "ungueltig"),
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
