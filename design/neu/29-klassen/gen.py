# Генератор макетов части 29 «Mehrere Klassen und Schulen»:
# старт «Meine Klassen» (карточки + «Nebeneinander»), добавление класса по Zugangscode, настройки класса,
# переключатель класса в шапке, админка «Schulen & Klassen».
# Основа — Soft 04 «Woche», 22 «Mehr», 40 «Admin · Übersicht», 43 «Blatt», PC 05; помощники и цвета — из частей 14–27.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g27", os.path.join(HERE, "..", "27-kanaele", "gen.py"))
m27 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m27)
m17, g, m15, m22, m26 = m27.m17, m27.g, m27.m15, m27.m22, m27.m26
m19 = m22.m19
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, badge, switch, segmented, overlay, note_box = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.badge, g.switch, g.segmented, g.overlay, g.note_box)
CHECK, CHEV_R, CHEV_D, BACK, CLOSE, PLUS, LOCK, PEN, TRASH, SEARCH, DOTS_V = (
    g.CHECK, g.CHEV_R, g.CHEV_D, g.BACK, g.CLOSE, g.PLUS, g.LOCK, g.PEN, g.TRASH, g.SEARCH, g.DOTS_V)
page, toast, sheet_bg, WARN, strip, est, HLINE = m22.page, m15.toast, m15.sheet_bg, m15.WARN, m26.strip, m26.est, m26.HLINE
FLAG, REFRESH = m19.FLAG, m19.REFRESH

def button(x, y, w, text, c, kind="primary", icon=CHECK, h=48):
    """Кнопка как g.button, но значок стоит вплотную перед текстом (в g.button он уезжает влево на длинных подписях)."""
    fill, fg = {"primary": (c["accent"], c["on"]), "sand": (c["sand"], c["ink"]), "danger": (c["dtint"], c["danger"])}[kind]
    tw_ = len(text) * 14.5 * 0.54
    x0 = x + (w - tw_ - (24 if icon else 0)) / 2
    ic = ICON(x0, y + h / 2 - 8, 0.67, fg, icon, 2.2) if icon else ""
    return R(x, y, w, h, h / 2, fill) + ic + T(x0 + (24 if icon else 0), y + h / 2 + 5, text, 14.5, 700, fg)

# Значки (контур, как lucide): Sliders — настройки класса, QrCode, School, LayoutGrid — «Alle Klassen»
SLIDERS = P("M4 6h9M19 6h1M4 12h3M13 12h7M4 18h11M21 18h-1") + '<circle cx="16" cy="6" r="2.4"/><circle cx="10" cy="12" r="2.4"/><circle cx="18" cy="18" r="2.4"/>'
QR = ('<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/>'
      + P("M14 14h2v2M20 14v2M14 20h2M18 18h2v2"))
SCHOOL = P("M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5M12 10.5v.01")
GRID = ('<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/>'
        '<rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>')
WEEK_I = '<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16M15 4v16")

# ── Данные: среда 17 сентября (как в оригиналах Soft). Урок: (Kürzel, Lehrer, Raum, Zustand: None | "aus" | "v") ──
TIMES = m19.TIMES + [("13:15", "14:00")]
CLASSES = [
    dict(name="9b", label="Meine Klasse", school="Goethe-Gymnasium", col=0, count="6 Stunden", test="Fr · Mathe-Test",
         status=[("Englisch fällt aus", 700, "danger"), (" · Mathe vertreten", 400, "muted")],
         day=[("De", "Web", "102", None), ("Ma", "Kle", "204", "v"), ("En", "Sch", "210", "aus"), ("Ph", "Ric", "301", None),
              ("Ge", "Bau", "108", None), ("Sp", "Hen", "Halle", None), None]),
    dict(name="5a", label="Geschwister", school="Goethe-Gymnasium", col=1, count="5 Stunden", test=None,
         status=[("Alles wie geplant", 700, "ok"), (" · Schluss 12:20", 400, "muted")],
         day=[("Ma", "Fri", "012", None), ("De", "Web", "014", None), ("Sp", "Kle", "Halle", None), ("En", "Sch", "014", None),
              ("Ku", "Lau", "012", None), None, None]),
    dict(name="7c", label="Nachhilfe", school="Schiller-Schule", col=2, count="7 Stunden", test="Do · Bio-Test",
         status=[("1. Stunde fällt aus", 700, "danger"), (" · Beginn 08:20", 400, "muted")],
         day=[("Bio", "Kra", "305", "aus"), ("Ma", "Mü", "108", None), ("Ma", "Mü", "108", None), ("En", "Roh", "210", None),
              ("Ge", "Bau", "108", None), ("De", "Web", "102", None), ("Sp", "Hen", "Halle", None)]),
]

def ccol(k, c, sub):
    """Цвет класса (tint, text, solid): первый — акцент приложения, дальше — из палитры Fachfarben."""
    if k == 0: return c["tint"], c["accink"], c["accent"]
    solid, tint, text = sub[["En", "Bio", "Ma", "De"][k - 1]]
    return tint, text, solid

def cbadge(x, y, name, k, c, sub, size=44):
    tint, text, _ = ccol(k, c, sub)
    return R(x, y, size, size, round(size * 0.32, 1), tint) + T(x + size / 2, y + size / 2 + size * 0.14, name, round(size * 0.4, 1), 900, text, "middle", -0.3)

def struck(t): return f'<tspan text-decoration="line-through">{g.esc(t)}</tspan>'

def day_strip(x, y, w, day, c, sub, n=7, h=36, gap=4):
    """Сегодня одной строкой: клетка на урок. Пусто = свободно, пунктир + зачёркнуто = fällt aus, точка = Vertretung."""
    sw = (w - (n - 1) * gap) / n
    out = []
    for i in range(n):
        e = day[i] if i < len(day) else None
        cx = x + i * (sw + gap)
        if not e:
            out.append(f'<g opacity="0.6">{R(cx, y, sw, h, 10, c["sand"])}</g>'); continue
        code, _, _, st = e
        _, tint, text = sub[code]
        if st == "aus":
            out.append(R(cx + .5, y + .5, sw - 1, h - 1, 10, c["dtint"], c["danger"], 1, ' stroke-dasharray="3 2"')
                       + T(cx + sw / 2, y + h / 2 + 4.2, struck(code), 12, 900, c["danger"], "middle", raw=True))
        else:
            out.append(R(cx, y, sw, h, 10, tint) + T(cx + sw / 2, y + h / 2 + 4.2, code, 12, 900, text, "middle"))
            if st == "v": out.append(f'<circle cx="{cx + sw - 5}" cy="{y + 5}" r="4" fill="{c["accent"]}" stroke="{c["card"]}" stroke-width="1.5"/>')
    return "".join(out)

def gear(x, y, c, size=34):
    return R(x, y, size, size, size / 2, c["sand"]) + ICON(x + size / 2 - 8.5, y + size / 2 - 8.5, 0.71, c["ink"], SLIDERS, 1.9)

def card_top(x, y, w, k, c, sub, with_gear=True):
    cl = CLASSES[k]
    out = cbadge(x + 14, y + 14, cl["name"], cl["col"], c, sub) + T(x + 70, y + 33, cl["label"], 15.5, 800, c["ink"]) + T(x + 70, y + 52, f'{cl["name"]} · {cl["school"]}', 12, 400, c["faint"])
    return out + (gear(x + w - 48, y + 19, c) if with_gear else "")

def class_card(x, y, w, k, c, sub, state="ok"):
    """Карточка класса на старте: кто это, сегодня одной строкой, главное одной фразой. Нажатие — план, ползунки — настройки."""
    cl = CLASSES[k]
    h = 162
    out = [R(x, y, w, h, 22, c["card"]), card_top(x, y, w, k, c, sub)]
    if state == "gesperrt":
        h = 172
        out[0] = R(x, y, w, h, 22, c["card"])
        out.append(R(x + 14, y + 70, w - 28, 44, 14, c["dtint"]) + ICON(x + 26, y + 84, 0.67, c["danger"], LOCK)
                   + T(x + 52, y + 89, "Zugang beendet", 13, 800, c["danger"]) + T(x + 52, y + 105, "Der Code dieser Klasse gilt nicht mehr.", 12, 400, c["danger"]))
        out.append(button(x + 14, y + 122, 196, "Neuen Code eingeben", c, "sand", None, h=38) + button(x + 218, y + 122, w - 232, "Entfernen", c, "danger", None, h=38))
        return "".join(out), h
    out.append(T(x + 14, y + 79, f'HEUTE · {cl["count"].upper()}', 10.5, 800, c["faint"], ls=0.5))
    if cl["test"]:
        out.append(T(x + w - 14, y + 79, cl["test"], 11.5, 700, c["accink"], "end") + ICON(x + w - 14 - est(cl["test"], 11.5) - 22, y + 68.5, 0.54, c["accink"], FLAG, 2.2))
    out.append(day_strip(x + 14, y + 88, w - 28, cl["day"], c, sub))
    out.append(T(x + 14, y + 147, "".join(S(t, wt, c[col]) for t, wt, col in cl["status"]), 12.5, 400, c["muted"], raw=True))
    out.append(ICON(x + w - 30, y + 134.5, 0.67, c["faint2"], CHEV_R))
    return "".join(out), h

def add_card(x, y, w, c, ttl="Klasse hinzufügen", sub_text="Mit Zugangscode, QR oder Einladungslink", icon=PLUS):
    return (R(x + .75, y + .75, w - 1.5, 62.5, 22, "none", c["faint2"], 1.5, ' stroke-dasharray="5 4"')
            + f'<circle cx="{x + 36}" cy="{y + 32}" r="18" fill="{c["tint"]}"/>' + ICON(x + 26.5, y + 22.5, 0.79, c["accink"], icon, 2.2)
            + T(x + 66, y + 29, ttl, 14.5, 800, c["ink"]) + T(x + 66, y + 47, sub_text, 12, 400, c["faint"])), 64

def hub_head(c, view=0):
    return (eyebrow(18, 33, "Mittwoch · 17. September", c) + title(18, 65, "Meine Klassen", c) + round_btn(334, 33.31, c, PLUS)
            + segmented(18, 86, 354, ["Karten", "Nebeneinander"], view, c))

def p_hub(c, theme, sub, n=2, toast_text=None, state=None, hint=True):
    b = [hub_head(c)]
    y = 138
    for k in range(n):
        card, h = class_card(18, y, 354, k, c, sub, "gesperrt" if (state == "gesperrt" and k == 1) else "ok"); b.append(card); y += h + 12
    card, h = add_card(18, y, 354, c); b.append(card); y += h
    if toast_text: b.append(toast(18, 770, 354, toast_text, c))
    elif hint: b.append(T(195, 806, "Karte antippen öffnet den Plan · Regler = Einstellungen der Klasse", 11.5, 400, c["faint"], "middle"))
    return page(390, 844, c, "".join(b))

def p_laden(c, theme, sub):
    k = c["skel"]
    b = [hub_head(c)]
    for i in range(2):
        y = 138 + i * 174
        b.append(R(18, y, 354, 162, 22, c["card"]) + R(32, y + 14, 44, 44, 14, k) + R(88, y + 22, 120 + i * 20, 13, 6.5, k) + R(88, y + 43, 150, 10, 5, k)
                 + R(32, y + 70, 96, 9, 4.5, k) + R(32, y + 88, 326, 36, 10, k) + R(32, y + 138, 190 - i * 40, 11, 5.5, k))
    return page(390, 844, c, "".join(b))

# ════════════════ Nebeneinander: один день, классы колонками ════════════════
def nb_cell(x, y, w, e, c, sub, h=52):
    if not e: return f'<g opacity="0.6">{R(x, y, w, h, 14, c["sand"])}</g>'
    code, teach, room, st = e
    _, tint, text = sub[code]
    name = g.NAMES[code]
    if st == "aus":
        return (R(x + .5, y + .5, w - 1, h - 1, 14, c["dtint"], c["danger"], 1, ' stroke-dasharray="3 2"') + T(x + 10, y + 21, struck(name), 13, 900, c["danger"], raw=True)
                + T(x + 10, y + 40, "fällt aus", 10.5, 800, c["danger"]))
    out = R(x, y, w, h, 14, tint) + T(x + 10, y + 21, name, 13, 900, text) + f'<g opacity="0.85">{T(x + 10, y + 40, f"{teach} · {room}", 10.5, 600, text)}</g>'
    if st == "v":
        bw = 74
        out += R(x + w - bw - 7, y + 7, bw, 17, 8.5, c["accent"]) + T(x + w - 7 - bw / 2, y + 19, "VERTRETUNG", 8, 800, c["on"], "middle", 0.4)
    return out

def p_neben(c, theme, sub):
    b = [hub_head(c, 1)]
    for i, (wd, d) in enumerate([("MO", "15"), ("DI", "16"), ("MI", "17"), ("DO", "18"), ("FR", "19")]):
        b.append(m19.day_head(i, wd, d, c, sel=(i == 2), y=134))
    x0, gap = 44, 6
    cw = (372 - x0 - gap) / 2
    for k in range(2):
        cl = CLASSES[k]; x = x0 + k * (cw + gap)
        b.append(cbadge(x, 188, cl["name"], cl["col"], c, sub, 26) + T(x + 34, 206, cl["label"], 12.5, 800, c["ink"]))
    gy = 224
    for r in range(7):
        y = gy + r * 56
        b.append(T(27, y + 24, str(r + 1), 12.5, 700, c["ink"], "middle") + T(27, y + 38, TIMES[r][0], 8.5, 400, c["faint"], "middle"))
        for k in range(2):
            b.append(nb_cell(x0 + k * (cw + gap), y, cw, CLASSES[k]["day"][r], c, sub))
    y = gy + 7 * 56 + 6
    card, _ = m19.card_rows(18, y, 354, [(FLAG, "Fr · Mathe-Test", "9b · Meine Klasse", "in 2 Tagen", False)], c); b.append(card)
    b.append(T(195, 806, "Bis zu 3 Klassen nebeneinander · Stunde antippen für Details", 11.5, 400, c["faint"], "middle"))
    return page(390, 844, c, "".join(b))

# ════════════════ Шторка «Klasse hinzufügen» ════════════════
def field(x, y, w, text, c, ph=False, state=None, h=50, ls=None, size=15.5, icon=None):
    out = R(x, y, w, h, 16, c["field"])
    if state: out += R(x + 1, y + 1, w - 2, h - 2, 15, "none", c["danger"] if state == "bad" else c["ok"], 2)
    else: out += R(x + .5, y + .5, w - 1, h - 1, 15.5, "none", c["rule"])
    out += T(x + 16, y + h / 2 + 5.5, text, size, 400 if ph else 700, c["faint2"] if ph else c["ink"], ls=ls)
    if icon: out += ICON(x + w - 36, y + h / 2 - 10, 0.83, c["ok"], icon, 2.4)
    return out

def sheet_head(c, top, eb, ttl):
    return sheet_bg(c, top, 390, 844) + eyebrow(18, top + 41, eb, c) + title(18, top + 70, ttl, c, 26) + round_btn(338, top + 42, c, CLOSE, size=34)

def add_sheet(c, sub, state="leer"):
    if state == "gefunden":
        top = 368
        b = [sheet_head(c, top, "Meine Klassen", "Klasse hinzufügen"), label(18, top + 108, "Zugangscode", c),
             field(18, top + 118, 354, "ORB-A-7TQ2-M4", c, state="ok", ls=1, icon=CHECK)]
        y = top + 182
        b.append(R(18, y, 354, 68, 18, c["oktint"]) + cbadge(30, y + 12, "5a", 1, c, sub) + T(86, y + 30, "5a · Goethe-Gymnasium", 14.5, 800, c["ink"])
                 + T(86, y + 49, "Gefunden · Code gilt bis 31.07.", 12, 400, c["muted"]))
        b.append(label(18, y + 96, "Name auf diesem Gerät", c) + field(18, y + 106, 354, "Geschwister", c)
                 + T(18, y + 176, "Nur du siehst den Namen. Kann leer bleiben.", 12, 400, c["faint"]))
        b.append(button(18, y + 196, 354, "Hinzufügen und Kurse wählen", c, icon=CHEV_R))
        return "".join(b)
    bad = state == "falsch"
    top = 474 - (44 if bad else 0)
    b = [sheet_head(c, top, "Meine Klassen", "Klasse hinzufügen"), label(18, top + 108, "Zugangscode", c)]
    if bad:
        b.append(field(18, top + 118, 354, "ORB-A-7TQ2-M5", c, state="bad", ls=1))
        b.append(ICON(18, top + 177, 0.62, c["danger"], WARN, 2.2) + T(40, top + 189, "Diesen Code kennen wir nicht.", 13, 700, c["danger"])
                 + T(40, top + 207, "Tippfehler? Sonst frag den Admin der Klasse.", 12.5, 400, c["danger"]))
        y = top + 228
    else:
        b.append(field(18, top + 118, 354, "ORB-A-XXXX-XX", c, ph=True, ls=1))
        b.append(T(18, top + 187, "Der Code sagt ORBook, welche Schule und Klasse es ist.", 12, 400, c["faint"]))
        y = top + 204
    b.append(button(18, y, 354, "QR-Code scannen", c, "sand", QR) + button(18, y + 58, 354, "Weiter", c, icon=CHEV_R))
    b.append(T(195, y + 132, "Einladungslink bekommen? Antippen genügt.", 12, 400, c["faint"], "middle"))
    return "".join(b)

def p_add(c, theme, sub, state="leer"):
    return page(390, 844, c, strip(p_hub(c, theme, sub, hint=False)) + add_sheet(c, sub, state))

# ════════════════ Шторка «Einstellungen der Klasse» (ползунки на карточке) ════════════════
def color_dots(x_right, cy, c, sub, sel=1, r=10, gap=8):
    cols = [c["accent"]] + [sub[k][0] for k in ("En", "Bio", "Ma", "De", "Ph", "Ge", "Ku")]
    out = []
    for i, col in enumerate(cols):
        cx = x_right - r - (len(cols) - 1 - i) * (2 * r + gap)
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{col}"/>')
        if i == sel:
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{r + 3.5}" fill="none" stroke="{col}" stroke-width="2"/>' + ICON(cx - 6, cy - 6, 0.5, "#FFFFFF", CHECK, 3))
    return "".join(out)

def settings_sheet(c, sub):
    top = 262
    b = [sheet_head(c, top, "5a · Goethe-Gymnasium", "Klasse einstellen")]
    y = top + 96
    b.append(R(18, y, 354, 114.5, 22, c["card"]) + T(32, y + 31, "Name", 14.5, 500, c["ink"]) + T(334, y + 31, "Geschwister", 13.5, 700, c["ink"], "end")
             + ICON(342, y + 18, 0.62, c["faint"], PEN, 2) + HLINE(32, 358, y + 52.5, c) + T(32, y + 89, "Farbe", 14.5, 500, c["ink"]) + color_dots(356, y + 84, c, sub))
    y += 114.5 + 14
    card, h = m22.rows_card(18, y, 354, [(m22.I_KURSE, "Meine Kurse", "5 von 6"), (m22.I_MITT, "Mitteilungen", "nur Ausfall"), (m22.I_KEY, "Tests eintragen", "Editor-Code")], c)
    b.append(card); y += h + 14
    b.append(g.switch_row(18, y, 354, "Beim Start öffnen", "Gleich diese Klasse statt „Meine Klassen“", False, c)); y += 67 + 14
    b.append(R(18, y, 354, 52.5, 22, c["card"]) + ICON(32, y + 16, 0.79, c["danger"], TRASH, 1.9) + T(63, y + 30.5, "Klasse entfernen", 14.5, 500, c["danger"]))
    b.append(T(18, y + 76, "Nur auf diesem Gerät. Der Zugangscode bleibt gültig.", 12, 400, c["faint"]))
    return "".join(b)

def p_settings(c, theme, sub):
    return page(390, 844, c, strip(p_hub(c, theme, sub, hint=False)) + settings_sheet(c, sub))

# ════════════════ Переключатель класса в шапке (Woche, Tag, Tests, Mehr) ════════════════
def class_chip(x, y, name, c, h=22):
    w = est(name, 12) + 34
    return R(x, y, w, h, h / 2, c["tint"]) + T(x + 10, y + h / 2 + 4.3, name, 12, 900, c["accink"]) + ICON(x + w - 20, y + h / 2 - 6, 0.5, c["accink"], CHEV_D, 2.6), w

def switch_menu(c, sub, x, y, w=292, rows=(0, 1), current=0, admin=False):
    """Окошко под чипом: мои классы (галочка у открытого, точка = есть изменения), ниже «Alle Klassen» и «hinzufügen»."""
    rh, fh = 60, 48
    foot = ([(SCHOOL, "Schulen & Klassen verwalten")] if admin else [(GRID, "Alle Klassen"), (PLUS, "Klasse hinzufügen")])
    h = 8 + rh * len(rows) + 9 + fh * len(foot) + 6
    out = [R(x, y, w, h, 22, c["card"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 22, c["card"]), R(x + .5, y + .5, w - 1, h - 1, 21.5, "none", c["hair"])]
    for i, k in enumerate(rows):
        cl = CLASSES[k]; ry = y + 8 + i * rh
        if k == current: out.append(R(x + 6, ry + 2, w - 12, rh - 4, 16, c["sand"]))
        out.append(cbadge(x + 16, ry + 12, cl["name"], cl["col"], c, sub, 36))
        out.append(T(x + 64, ry + 27, f'Klasse {cl["name"]}' if admin else cl["label"], 14.5, 800, c["ink"])
                   + T(x + 64, ry + 45, cl["school"] if admin else f'{cl["name"]} · {cl["school"]}', 12, 400, c["faint"]))
        if k == current: out.append(ICON(x + w - 38, ry + 20, 0.83, c["accink"], CHECK, 2.4))
        elif not admin and any(e and e[3] for e in cl["day"]):
            out.append(f'<circle cx="{x + w - 28}" cy="{ry + 30}" r="4.5" fill="{c["danger"]}"/>')
    fy = y + 8 + rh * len(rows) + 4
    out.append(HLINE(x + 14, x + w - 14, fy, c))
    for i, (ic, text) in enumerate(foot):
        ry = fy + 5 + i * fh
        out.append(ICON(x + 22, ry + 14, 0.8, c["muted"], ic, 1.9) + T(x + 64, ry + 29.5, text, 14, 600, c["ink"]))
    return "".join(out)

def p_woche(c, theme, sub, menu=False):
    chip, w = class_chip(18, 18.5, "9b", c)
    b = [strip(m22.p_woche(c, theme, sub)), R(0, 12, 240, 30, 0, c["paper"]), chip, eyebrow(18 + w + 8, 33, "KW 38 · 15.–19. Sept", c)]
    if menu: b.append(overlay(c, 390, 844) + chip + switch_menu(c, sub, 18, 48))
    return page(390, 844, c, "".join(b))

# ════════════════ Admin: Schulen & Klassen ════════════════
SCHOOLS = [dict(name="Goethe-Gymnasium", nr="10245678", n=42, classes=[("9b", 0, "27 Geräte · 4 Codes · 5 Tests"), ("5a", 1, "3 Geräte · 1 Code · 0 Tests")]),
           dict(name="Schiller-Schule", nr="10311204", n=24, classes=[("7c", 2, "12 Geräte · 2 Codes · 1 Test")])]

def school_card(x, y, w, sc, c, sub):
    rh = 58
    h = 66 + rh * len(sc["classes"]) + 48
    out = [R(x, y, w, h, 22, c["card"]), f'<circle cx="{x + 34}" cy="{y + 33}" r="18" fill="{c["sand"]}"/>', ICON(x + 24.5, y + 23.5, 0.79, c["muted"], SCHOOL, 1.9),
           T(x + 62, y + 30, sc["name"], 15, 800, c["ink"]), T(x + 62, y + 48, f'Nr. {sc["nr"]} · {sc["n"]} Klassen im Plan', 12, 400, c["faint"])]
    bd, bw = badge(x + w - 14 - 62, y + 17, "PLAN OK", c, "ok"); out.append(bd)
    for i, (name, k, info) in enumerate(sc["classes"]):
        ry = y + 66 + i * rh
        out.append(HLINE(x + 14, x + w - 14, ry, c) + cbadge(x + 14, ry + 11, name, k, c, sub, 36) + T(x + 62, ry + 26, f"Klasse {name}", 14.5, 700, c["ink"])
                   + T(x + 62, ry + 44, info, 12, 400, c["faint"]) + ICON(x + w - 30, ry + 21, 0.67, c["faint2"], CHEV_R))
    ry = y + 66 + rh * len(sc["classes"])
    out.append(HLINE(x + 14, x + w - 14, ry, c) + ICON(x + 22, ry + 14, 0.8, c["accink"], PLUS, 2.2) + T(x + 62, ry + 29.5, "Klasse hinzufügen", 14, 700, c["accink"]))
    return "".join(out), h

def admin_body(c, sub):
    b = [round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, "Admin · Server", c, True) + title(66, 64, "Schulen & Klassen", c, 24)]
    y = 92
    for sc in SCHOOLS:
        card, h = school_card(18, y, 354, sc, c, sub); b.append(card); y += h + 14
    card, h = add_card(18, y, 354, c, "Schule hinzufügen", "Mit den Zugangsdaten von stundenplan24.de", SCHOOL); b.append(card); y += h + 16
    b.append(note_box(18, y, 354, ["Jede Klasse hat eigene Codes, Tests und", "Einstellungen. Der Plan lädt pro Schule einmal."], c, m15.INFO))
    return "".join(b)

def p_admin(c, theme, sub):
    return page(390, 844, c, admin_body(c, sub))

def school_form(x, y, w, c, pc=False):
    """Поля новой школы: имя, Schulnummer, Benutzername + Passwort, проверка доступа. Возвращает (svg, нижний край)."""
    half = (w - 12) / 2
    b = [label(x, y + 12, "Name der Schule", c), field(x, y + 22, w, "Schiller-Schule", c),
         label(x, y + 96, "Schulnummer", c), field(x, y + 106, w, "10311204", c, ls=1),
         label(x, y + 180, "Benutzername", c), field(x, y + 190, half, "schueler", c),
         label(x + half + 12, y + 180, "Passwort", c), field(x + half + 12, y + 190, half, "••••••••", c, ls=2),
         T(x, y + 260, "Dieselben Daten wie für den Plan der Schule auf stundenplan24.de.", 12, 400, c["faint"])]
    by = y + 276
    b.append(R(x, by, w, 48, 16, c["oktint"]) + ICON(x + 14, by + 14, 0.83, c["ok"], CHECK, 2.4) + T(x + 44, by + 29.5, "Zugang passt · 24 Klassen gefunden", 13.5, 700, c["ink"]))
    by += 64
    b.append(button(x, by, 150, "Erneut testen", c, "sand", None) + button(x + 162, by, w - 162, "Schule speichern", c))
    return "".join(b), by + 48

def p_school_new(c, theme, sub):
    top = 336
    form, end = school_form(18, top + 92, 354, c)
    return page(390, 844, c, admin_body(c, sub) + sheet_head(c, top, "Schulen & Klassen", "Schule hinzufügen") + form)

def p_class_new(c, theme, sub):
    top = 262
    b = [admin_body(c, sub), sheet_head(c, top, "Schiller-Schule", "Klasse anlegen")]
    y = top + 96
    b.append(R(18, y, 354, 44, 22, c["sand"]) + ICON(32, y + 12, 0.83, c["faint"], SEARCH, 2) + T(62, y + 27.5, "Klasse suchen", 14, 400, c["faint"]))
    y += 58
    names = ["5a", "5b", "6a", "7a", "7b", "7c", "8a"]
    b.append(R(18, y, 354, 44 * len(names), 22, c["card"]))
    for i, nme in enumerate(names):
        ry = y + i * 44
        if i: b.append(HLINE(32, 358, ry, c))
        if nme == "7c": b.append(R(24, ry + 3, 342, 38, 14, c["tint"]) + ICON(334, ry + 12, 0.83, c["accink"], CHECK, 2.4))
        b.append(T(36, ry + 27.5, nme, 14.5, 800 if nme == "7c" else 600, c["accink"] if nme == "7c" else c["ink"]))
    y += 44 * len(names) + 22
    b.append(T(18, y, "Aus dem Plan der Schule. Danach: ersten Zugangscode erstellen.", 11.5, 400, c["faint"]))
    b.append(button(18, y + 18, 354, "7c anlegen", c, icon=PLUS))
    return page(390, 844, c, "".join(b))

def p_admin_switch(c, theme, sub):
    """Admin · Übersicht: вместо «Admin · 9b» — чип класса; окно со всеми классами сервера по школам."""
    inner, w, h = g.base("40 Admin · Übersicht", theme)
    aw = est("Admin ·", 12.5) + 16
    chip, cw = class_chip(18 + aw, 18.5, "9b", c)
    head = R(0, 12, 240, 30, 0, c["paper"]) + eyebrow(18, 33, "Admin ·", c, True) + chip
    return page(w, h, c, inner + head + overlay(c, w, h) + chip + switch_menu(c, sub, 18, 48, 316, (0, 1, 2), 0, admin=True))

# ════════════════════════════ Computer ════════════════════════════
def pc_pill(c, text, active=False):
    """Чип класса рядом с логотипом в левом меню (на месте старой метки «9B»)."""
    w = est(text, 12) + (20 if active else 34)   # «Alle» — без стрелки, иначе не помещается рядом со значком меню
    fill, fg = (c["accent"], c["on"]) if active else (c["tint"], c["accink"])
    return (R(160, 34, 54, 34, 0, c["card"]) + R(164, 40, w, 22, 11, fill) + T(174, 55.3, text, 12, 900, fg)
            + ("" if active else ICON(164 + w - 20, 45, 0.5, fg, CHEV_D, 2.6)))

def pc_shell(c, theme, pill="9b", pill_active=False, woche_active=True):
    inner = m22.pc_base("05 Woche · Stunden + gewählter Tag", theme)
    b = [inner, R(250, 0, 1190, 900, 0, c["paper"]), m22.pc_sidebar(inner, c, False), pc_pill(c, pill, pill_active)]
    if not woche_active:   # на «Meine Klassen» ни один пункт меню не выбран
        b.append(R(26, 142, 212, 50, 0, c["card"]) + ICON(42, 157.5, 0.79, c["muted"], WEEK_I) + T(73, 172, "Woche", 14.5, 700, c["muted"]))
    return "".join(b)

def pc_class_card(x, y, w, k, c, sub):
    """Карточка класса на ПК: то же, что на телефоне, плюс весь день списком — так классы видно рядом."""
    cl = CLASSES[k]
    rh = 46
    h = 162 + 12 + 7 * rh + 14
    out = [R(x, y, w, h, 22, c["card"]), card_top(x, y, w, k, c, sub)]
    out.append(T(x + 14, y + 79, f'HEUTE · {cl["count"].upper()}', 10.5, 800, c["faint"], ls=0.5))
    if cl["test"]:
        out.append(T(x + w - 14, y + 79, cl["test"], 11.5, 700, c["accink"], "end") + ICON(x + w - 14 - est(cl["test"], 11.5) - 22, y + 68.5, 0.54, c["accink"], FLAG, 2.2))
    out.append(day_strip(x + 14, y + 88, w - 28, cl["day"], c, sub))
    out.append(T(x + 14, y + 147, "".join(S(t, wt, c[col]) for t, wt, col in cl["status"]), 12.5, 400, c["muted"], raw=True))
    ly = y + 162
    for r in range(7):
        ry = ly + 12 + r * rh
        out.append(HLINE(x + 14, x + w - 14, ry - 0.5, c))
        e = cl["day"][r]
        out.append(T(x + 24, ry + 28, str(r + 1), 13.5, 800, c["ink"], "middle") + T(x + 44, ry + 28, TIMES[r][0], 11, 400, c["faint"]))
        if not e:
            out.append(T(x + 92, ry + 28, "frei", 13, 400, c["faint2"])); continue
        code, teach, room, st = e
        solid = sub[code][0]
        aus = st == "aus"
        out.append(R(x + 92, ry + 19, 9, 9, 4.5, c["danger"] if aus else solid))
        out.append(T(x + 110, ry + 28, struck(g.NAMES[code]) if aus else g.esc(g.NAMES[code]), 13.5, 700, c["danger"] if aus else c["ink"], raw=True))
        if aus: out.append(T(x + w - 14, ry + 28, "fällt aus", 12, 800, c["danger"], "end"))
        elif st == "v": out.append(T(x + w - 14, ry + 28, f"Vertretung · {teach} · {room}", 12, 700, c["accink"], "end"))
        else: out.append(T(x + w - 14, ry + 28, f"{teach} · {room}", 12, 400, c["faint"], "end"))
    return "".join(out), h

def pc_hub(c, theme, sub):
    b = [pc_shell(c, theme, "Alle", True, False), eyebrow(284, 39, "Mittwoch · 17. September", c), title(284, 80, "Meine Klassen", c, 38)]
    b.append(round_btn(1004, 44, c, BACK) + R(1050, 44, 76, 38, 19, c["sand"]) + T(1088, 68, "Heute", 13, 800, c["ink"], "middle") + round_btn(1134, 44, c, CHEV_R))
    b.append(button(1190, 40, 214, "Klasse hinzufügen", c, icon=PLUS, h=46))
    cw = (1120 - 2 * 20) / 3
    for k in range(3):
        card, h = pc_class_card(284 + k * (cw + 20), 110, cw, k, c, sub); b.append(card)
    b.append(T(284, 110 + h + 30, "Karte anklicken öffnet den Plan der Klasse · Regler = Einstellungen der Klasse · Reihenfolge per Ziehen ändern", 12, 400, c["faint"]))
    return page(1440, 900, c, "".join(b))

def pc_switch(c, theme, sub):
    w = strip(m22.pc_woche(c, theme, sub, alle=False))
    pill = pc_pill(c, "9b")
    return page(1440, 900, c, w + pill + overlay(c, 1440, 900) + pill + switch_menu(c, sub, 30, 70, 300, (0, 1, 2), 0))

g.ADMIN_NAV.insert(1, ("Schulen &amp; Klassen", SCHOOL, None))

def pc_school_block(x, y, w, sc, c, sub):
    rh = 57
    h = 70 + 40 + rh * len(sc["classes"])
    out = [R(x, y, w, h, 22, c["card"]), f'<circle cx="{x + 40}" cy="{y + 35}" r="20" fill="{c["sand"]}"/>', ICON(x + 30, y + 25, 0.83, c["muted"], SCHOOL, 1.9),
           T(x + 72, y + 32, sc["name"], 16, 800, c["ink"]), T(x + 72, y + 51, f'Schulnummer {sc["nr"]} · stundenplan24.de · {sc["n"]} Klassen im Plan', 12.5, 400, c["faint"])]
    bd, bw = badge(x + 72 + est(sc["name"], 16) * 1.25 + 12, y + 18, "PLAN OK", c, "ok"); out.append(bd)
    out.append(button(x + w - 20 - 170, y + 16, 170, "Klasse hinzufügen", c, "sand", PLUS, h=38) + T(x + w - 210, y + 40, "Zugang ändern", 13, 700, c["accink"], "end"))
    cols = [("Klasse", 20), ("Geräte", 260), ("Zugangscodes", 400), ("Tests", 570), ("Telegram", 700), ("Seit", 860)]
    hy = y + 70
    out.append(HLINE(x + 20, x + w - 20, hy, c))
    for nme, cx in cols: out.append(T(x + cx, hy + 26, nme, 12, 800, c["faint"]))
    for i, (nme, k, info) in enumerate(sc["classes"]):
        ry = hy + 40 + i * rh
        dev, codes, tests = [p.split(" ")[0] for p in info.split(" · ")]
        out.append(HLINE(x + 20, x + w - 20, ry, c) + cbadge(x + 20, ry + 11, nme, k, c, sub, 36) + T(x + 68, ry + 34, f"Klasse {nme}", 14, 800, c["ink"]))
        out.append(T(x + 260, ry + 34, dev, 13, 700, c["ink"]) + T(x + 400, ry + 34, f"{codes} aktiv", 13, 400, c["muted"]) + T(x + 570, ry + 34, tests, 13, 400, c["muted"])
                   + T(x + 700, ry + 34, ["Bot · 14 Chats", "–", "Gruppe"][k], 13, 400, c["muted"]) + T(x + 860, ry + 34, ["Sept. 2026", "13.11.2026", "13.11.2026"][k], 13, 400, c["muted"]))
        out.append(T(x + w - 62, ry + 34, "Öffnen", 13, 700, c["accink"], "end") + ICON(x + w - 56, ry + 20.5, 0.67, c["accink"], CHEV_R)
                   + ICON(x + w - 36, ry + 19.5, 0.71, c["ink"], DOTS_V).replace('fill="none"', f'fill="{c["ink"]}"'))
    return "".join(out), h

def pc_admin_body(c, sub):
    b = [g.admin_sidebar(c, 900, "Schulen &amp; Klassen"), eyebrow(284, 39, "Admin · Server", c, True), title(284, 80, "Schulen & Klassen", c, 38)]
    b.append(button(1200, 40, 204, "Schule hinzufügen", c, icon=PLUS, h=46))
    b.append(note_box(284, 110, 1120, [S("Jede Klasse hat eigene Codes, Tests, Kanäle und Einstellungen. Den Plan lädt ORBook pro Schule einmal — auch für mehrere Klassen.", 400, c["muted"])], c, m15.INFO))
    y = 168
    for sc in SCHOOLS:
        blk, h = pc_school_block(284, y, 1120, sc, c, sub); b.append(blk); y += h + 20
    b.append(T(284, y + 10, "Klasse löschen: im Menü ⋮ — mit dem Wort LÖSCHEN und Admin-Passwort. Die Daten der anderen Klassen bleiben.", 12, 400, c["faint"]))
    return "".join(b)

def pc_admin(c, theme, sub):
    return page(1440, 900, c, pc_admin_body(c, sub))

def pc_school_new(c, theme, sub):
    X, W, H = 450, 540, 520
    Y = (900 - H) / 2
    b = [pc_admin_body(c, sub), overlay(c, 1440, 900)]
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(g.modal_head(X, Y, W, "Schulen & Klassen", "Schule hinzufügen", c))
    form, _ = school_form(X + 26, Y + 92, W - 52, c, pc=True); b.append(form)
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-klassen": p_hub,
    "handy-02-nebeneinander": p_neben,
    "handy-03-hinzufuegen": p_add,
    "handy-04-gefunden": lambda c, t, s: p_add(c, t, s, "gefunden"),
    "handy-05-code-falsch": lambda c, t, s: p_add(c, t, s, "falsch"),
    "handy-06-drei-klassen": lambda c, t, s: p_hub(c, t, s, 3, "7c hinzugefügt"),
    "handy-07-klasse-einstellen": p_settings,
    "handy-08-woche": p_woche,
    "handy-09-wechsler": lambda c, t, s: p_woche(c, t, s, True),
    "handy-10-zugang-beendet": lambda c, t, s: p_hub(c, t, s, 2, None, "gesperrt"),
    "handy-11-laden": p_laden,
    "handy-12-admin-klassen": p_admin,
    "handy-13-admin-schule-neu": p_school_new,
    "handy-14-admin-klasse-neu": p_class_new,
    "handy-15-admin-wechsler": p_admin_switch,
    "pc-01-klassen": pc_hub,
    "pc-02-wechsler": pc_switch,
    "pc-03-admin-klassen": pc_admin,
    "pc-04-admin-schule-neu": pc_school_new,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
