# Макеты части 31 «Android-App + Widget»:
#   • виджет ORBook на рабочем столе Android — те же блоки, что на «Start» (Jetzt, Heute, Woche, Tests, Aufgaben …), любой размер;
#   • «Widget einstellen» — открывается, когда виджет кладут на рабочий стол: класс, что показывать, вид;
#   • состояния виджета: выходные, нет связи, не вошёл, загрузка, доступ закончился;
#   • «Android-App» в Mehr: скачать APK, установить, обновление внутри приложения; ПК — QR-код для телефона.
# Блоки и оформление (St) — из генератора части 30, остальные помощники — из частей 15–29 (те же токены Soft).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp); sp.loader.exec_module(mod)
    return mod

p30 = _load("g30", "30-personalisierung")
m16 = _load("g16", "16-einladen")
k, g, m22, m15 = p30.k, p30.g, p30.m22, p30.m15
m17 = k.m17
T, S, R, ICON, P, struck = g.T, g.S, g.R, g.ICON, g.P, k.struck
St, HL, DOT, eyebrow, title, label, nav, block, bhead, sheet, strip = (
    p30.St, p30.HL, p30.DOT, p30.eyebrow, p30.title, p30.label, p30.nav, p30.block, p30.bhead, p30.sheet, p30.strip)
CHECK, CHEV_R, BACK, CLOSE, PLUS, SEARCH = g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.PLUS, g.SEARCH
CLOCK, LIST, WEEK_I, FLAG, LIST_CHECK, REFRESH, CAL, FILE, SUN, SLIDERS, HOME = (
    p30.CLOCK, p30.LIST, p30.WEEK_I, p30.FLAG, p30.LIST_CHECK, p30.REFRESH, p30.CAL, p30.FILE, p30.SUN, p30.SLIDERS, p30.HOME)
DOWNLOAD, LOCK, WARN, INFO = m17.DOWNLOAD, g.LOCK, m15.WARN, m15.INFO
SHIELD = P("M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z") + P("M9 12l2 2 4-4")
ANDROID = P("M6 10v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7z") + P("M6 9a6 6 0 0 1 12 0z") + P("M8 4l1.5 2M16 4l-1.5 2M3.5 11v5M20.5 11v5")
WIFI_OFF = P("M2 8.5a15 15 0 0 1 6-3.2M12 5a15 15 0 0 1 10 3.5M5 12a10 10 0 0 1 4-2.2M19 12a10 10 0 0 0-3-1.9M8.5 15.5a5 5 0 0 1 7 0M12 19h.01M3 3l18 18")
HAND = P("M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5v-2a1.5 1.5 0 0 1 3 0V12M14 10.5a1.5 1.5 0 0 1 3 0V12M17 11.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.3 15a1.5 1.5 0 0 1 2.4-1.8L8 15")
GRIP = '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>'
CAMERA = P("M4 8h3l2-3h6l2 3h3v11H4z") + '<circle cx="12" cy="13" r="3.5"/>'
IMAGE = '<rect x="3" y="4" width="18" height="16" rx="3"/>' + P("M3 16l5-5 4 4 3-3 6 6") + '<circle cx="15.5" cy="8.5" r="1.5"/>'
PHONE = P("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2")
CHAT = P("M4 5h16v11H9l-5 4z")
GLOBE = p30.GLOBE

# ════════════════════════════ Рабочий стол Android ════════════════════════════
WALL = {"hell": ("#EDE4FF", "#C9B8FF", "#FFD3DE", "#B9DCFF"), "dunkel": ("#120F1C", "#4A33B8", "#8E2F6A", "#17607F")}

def wall_defs(w):
    return f'<filter id="wall" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="{70 if w < 800 else 110}"/></filter>'

def wallpaper(st, x, y, w, h, clip=None):
    """Обои: размытые цветные пятна. clip — скруглить (превью в «Widget einstellen»)."""
    base, a, b, d = WALL[st.theme]
    inner = (R(x, y, w, h, 0, base) + f'<g filter="url(#wall)" opacity="{0.95 if st.light else 0.8}"><circle cx="{x + w * 0.1}" cy="{y + h * 0.12}" r="{w * 0.45}" fill="{a}"/>'
             f'<circle cx="{x + w * 0.95}" cy="{y + h * 0.45}" r="{w * 0.42}" fill="{b}"/><circle cx="{x + w * 0.15}" cy="{y + h * 0.85}" r="{w * 0.45}" fill="{d}"/></g>')
    if not clip: return inner
    cid, r = clip
    return f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/></clipPath><g clip-path="url(#{cid})">{inner}</g>'

def fg(st): return "#2A2433" if st.light else "#FFFFFF"   # текст и значки поверх обоев

def statusbar(st):
    col = fg(st)
    return (T(26, 30, "7:42", 14, 700, col) + f'<g fill="{col}"><path d="M316 22.5a12 12 0 0 1 16 0l-8 8.5z"/>'
            f'<rect x="340" y="19" width="20" height="10" rx="2.5" fill="none" stroke="{col}" stroke-width="1.4"/><rect x="342" y="21" width="12" height="6" rx="1.2"/>'
            f'<rect x="361" y="22" width="2" height="4" rx="1"/></g>')

def app(st, x, y, icon, name, orb=False):
    """Значок приложения на рабочем столе (обычные — без марок, просто круг со значком)."""
    c = st.c
    if orb: ic = R(x, y, 56, 56, 28, c["card"]) + m17.logo(x + 5, y + 5, c, 0.6)
    else: ic = DOT(x + 28, y + 28, 28, "#FFFFFF" if st.light else "#2B2733") + ICON(x + 16, y + 16, 1, "#6A6275" if st.light else "#C9C1D4", icon, 1.9)
    return ic + T(x + 28, y + 74, name, 12, 600, fg(st), "middle")

def dock(st, y=702):
    out = [app(st, 31 + i * 88, y, ic, nm, nm == "ORBook") for i, (ic, nm) in enumerate([(PHONE, "Telefon"), (CHAT, "Nachrichten"), (CAMERA, "Kamera"), (None, "ORBook")])]
    sb = "#FFFFFF" if st.light else "#2B2733"
    out.append(R(24, 790, 342, 44, 22, sb, extra=' fill-opacity="0.8"') + ICON(42, 802, 0.83, "#6A6275" if st.light else "#C9C1D4", SEARCH, 2))
    out.append(R(145, 836, 100, 4, 2, fg(st), extra=' fill-opacity="0.5"'))
    return "".join(out)

def home(st, body, with_dock=True):
    """Экран телефона: обои, статус-бар, содержимое, док."""
    return g.svg(390, 844, st.c, wallpaper(st, 0, 0, 390, 844) + statusbar(st) + body + (dock(st) if with_dock else ""), wall_defs(390))

# ── Виджет: тот же блок, что на Start, плюс тонкая рамка и подпись класса справа сверху ──
def widget(st, kind, x, y, w, h, cls="9b"):
    c = st.c
    out = block(st, kind, x, y, w, h) + (R(x + .5, y + .5, w - 1, h - 1, st.rc - .5, "none", c["hair"]) if st.light else "")
    if cls and kind not in ("jetzt", "tests") and w > 200:   # у узких места нет — класс виден в «Widget einstellen»
        out += R(x + w - 44, y + 12, 30, 20, 10, c["tint"]) + T(x + w - 29, y + 26, cls, 11, 900, c["accink"], "middle")
    return out

def widget_any(st, x, y, w, h, head, icon, draw, accent=False, right=None):
    """Виджет с собственным содержимым (состояния): карточка + шапка как у блоков + draw()."""
    c = st.c
    return (st.card(x, y, w, h) + (R(x + .5, y + .5, w - 1, h - 1, st.rc - .5, "none", c["hair"]) if st.light else "")
            + bhead(st, x, y, head, icon, accent, right, w) + draw)

# ════════════════════════════ 01 · Рабочий стол с виджетами ════════════════════════════
def p_home(st):
    b = [widget(st, "jetzt", 16, 52, 358, 158),
         widget(st, "tests", 16, 222, 173, 164), widget(st, "aufgaben", 201, 222, 173, 164),
         widget(st, "heute", 16, 398, 358, 280)]
    return home(st, "".join(b))

# ════════════════════════════ 02 · Большие виджеты: Woche 4×4, Countdown и Änderungen ════════════════════════════
def p_home2(st):
    b = [widget(st, "woche", 16, 52, 358, 330),
         widget(st, "aenderungen", 16, 394, 173, 164), widget(st, "ferien", 201, 394, 173, 164)]
    for i, (ic, nm) in enumerate([(CAL, "Kalender"), (IMAGE, "Fotos"), (CLOCK, "Uhr"), (GLOBE, "Browser")]):
        b.append(app(st, 31 + i * 88, 590, ic, nm))
    return home(st, "".join(b))

# ════════════════════════════ 03 · Состояния виджета ════════════════════════════
def p_states(st):
    c = st.c
    sk = c["skel"]
    b = []
    # выходные: что будет в понедельник
    x, y, w, h = 16, 52, 358, 132
    b.append(widget_any(st, x, y, w, h, "Wochenende", SUN, accent=True, right="Mo, 22. Sept", draw=(
        T(x + 14, y + 66, "Deutsch", 22, 900, c["ink"], ls=-0.3) + T(x + w - 14, y + 64, "08:00–08:45", 12, 400, c["faint"], "end")
        + T(x + 14, y + 86, "1. Stunde · Web · Raum 102", 12.5, 400, c["muted"])
        + DOT(x + 18, y + 108.5, 3.5, c["ok"]) + T(x + 28, y + 113, "Keine Änderungen", 12, 700, c["ok"]))))
    # нет связи: показан последний сохранённый план, время серым
    y = 196
    b.append(widget_any(st, x, y, w, 96, "Heute · 6 Stunden", LIST, draw=(
        DOT(x + 18, y + 51.5, 4.5, st.sub["Ma"][0]) + T(x + 32, y + 56, "2  Mathe", 13.5, 700, c["ink"]) + T(x + w - 14, y + 56, "Vertretung · Kle · 204", 12, 700, c["accink"], "end")
        + ICON(x + 14, y + 66, 0.54, c["faint"], WIFI_OFF, 2.2) + T(x + 32, y + 78, "Stand Mi 07:12", 12, 600, c["faint"]))))
    # не вошёл / доступ закончился — две маленьких
    y = 304
    w2 = 173
    b.append(widget_any(st, x, y, w2, 164, "ORBook", LOCK, draw=(
        T(x + 14, y + 66, "Nicht", 16, 900, c["ink"]) + T(x + 14, y + 86, "angemeldet", 16, 900, c["ink"])
        + R(x + 14, y + 114, w2 - 28, 36, 18, c["accent"]) + T(x + w2 / 2, y + 137, "Öffnen", 13.5, 800, c["on"], "middle"))))
    x2 = 201
    b.append(widget_any(st, x2, y, w2, 164, "Klasse 9b", WARN, draw=(
        T(x2 + 14, y + 66, "Zugang", 16, 900, c["danger"]) + T(x2 + 14, y + 86, "beendet", 16, 900, c["danger"])
        + R(x2 + 14, y + 114, w2 - 28, 36, 18, c["sand"]) + T(x2 + w2 / 2, y + 137, "Neuer Code", 13.5, 800, c["ink"], "middle"))))
    # загрузка (сразу после того, как положили)
    y = 480
    b.append(st.card(x, y, w, 132) + R(x + 14, y + 18, 90, 10, 5, sk) + R(x + 14, y + 46, 150, 20, 10, sk) + R(x + w - 100, y + 48, 86, 12, 6, sk)
             + R(x + 14, y + 76, 200, 10, 5, sk) + R(x + 14, y + 100, w - 28, 6, 3, sk))
    return home(st, "".join(b))

# ════════════════════════════ 04 · Widget einstellen ════════════════════════════
KINDS = [("jetzt", "Jetzt", "Aktuelle und nächste Stunde", CLOCK), ("heute", "Heute", "Alle Stunden, abends schon morgen", LIST),
         ("woche", "Woche", "Die ganze Woche", WEEK_I), ("tests", "Tests", "Was als Nächstes ansteht", FLAG),
         ("aufgaben", "Aufgaben", "Offene Hausaufgaben", LIST_CHECK), ("aenderungen", "Änderungen", "Ausfall und Vertretung", REFRESH),
         ("termine", "Termine", "Ferien, Elternabend, Ausflug", CAL), ("notizen", "Notizen", "Deine letzten Notizen", FILE),
         ("ferien", "Countdown", "Tage bis zu den Ferien", SUN)]

def radio(st, cx, cy, on):
    c = st.c
    if on: return DOT(cx, cy, 11, c["accent"]) + ICON(cx - 7, cy - 7, 0.58, c["on"], CHECK, 3)
    return f'<circle cx="{cx}" cy="{cy}" r="10" fill="none" stroke="{c["faint2"]}" stroke-width="2"/>'

def p_config(st, H=1300):
    c = st.c
    b = [st.rbtn(18, 33.31, CLOSE), eyebrow(66, 33, "Widget · 4 × 2", c), title(66, 65, "Einstellen", c)]
    # превью: кусок обоев с виджетом в нынешнем виде
    y = 92
    b.append(wallpaper(st, 18, y, 354, 196, clip=("pv", st.rc)))
    b.append(widget(st, "jetzt", 34, y + 18, 322, 160))
    y += 196 + 30
    b.append(label(18, y, "Klasse", c)); y += 12
    b.append(st.seg(18, y, 354, ["9b · Meine Klasse", "5a · Geschwister"], 0, h=40, fs=13)); y += 40 + 30
    b.append(label(18, y, "Inhalt", c)); y += 12
    rh = 58
    b.append(st.card(18, y, 354, rh * len(KINDS)))
    for i, (kind, name, desc, icon) in enumerate(KINDS):
        ry = y + i * rh
        if i: b.append(HL(32, 358, ry, c))
        b.append(DOT(50, ry + 29, 18, c["tint"]) + ICON(40.5, ry + 19.5, 0.79, c["accink"], icon, 2))
        b.append(T(80, ry + 26, name, 14.5, 700, c["ink"]) + T(80, ry + 44, desc, 12, 400, c["faint"]))
        b.append(radio(st, 344, ry + 29, i == 0))
    y += rh * len(KINDS) + 30
    b.append(label(18, y, "Anzeige", c)); y += 12
    b.append(st.card(18, y, 354, 58 * 3))
    b.append(T(32, y + 34.5, "Nur meine Kurse", 14.5, 500, c["ink"]) + st.switch(316, y + 17, True))
    b.append(HL(32, 358, y + 58, c) + T(32, y + 92.5, "Aussehen", 14.5, 500, c["ink"]) + st.seg(146, y + 69, 212, ["App", "Hell", "Dunkel"], 0))
    b.append(HL(32, 358, y + 116, c) + T(32, y + 150.5, "Hintergrund", 14.5, 500, c["ink"]) + st.seg(146, y + 127, 212, ["Voll", "Halb"], 0))
    y += 174
    # кнопка «Fertig» прилипает к низу
    b.append(R(0, H - 92, 390, 92, 0, c["paper"]) + HL(0, 390, H - 92, c) + st.button(18, H - 76, 354, "Fertig", "primary", CHECK))
    return g.svg(390, H, c, "".join(b), wall_defs(390))

# ════════════════════════════ 05 · Mehr → Android-App ════════════════════════════
def steps(st, x, y, w, items, rh=60):
    c = st.c
    out = [st.card(x, y, w, rh * len(items))]
    for i, (parts, icon) in enumerate(items):
        ry = y + i * rh
        if i: out.append(HL(x + 56, x + w - 14, ry, c))
        out.append(DOT(x + 30, ry + rh / 2, 14, c["tint"]) + T(x + 30, ry + rh / 2 + 5, str(i + 1), 14, 900, c["accink"], "middle"))
        out.append(T(x + 56, ry + rh / 2 + 5, "".join(S(t, wt, c["ink"]) for t, wt in parts), 14, 400, c["ink"], raw=True))
        if icon == "app": out.append(R(x + w - 46, ry + rh / 2 - 16, 32, 32, 16, c["sand"]) + m17.logo(x + w - 43, ry + rh / 2 - 13, c, 0.34))
        elif icon: out.append(R(x + w - 46, ry + rh / 2 - 16, 32, 32, 10, c["sand"]) + ICON(x + w - 40, ry + rh / 2 - 10, 0.83, c["accink"], icon, 2))
    return "".join(out), rh * len(items)

INSTALL = [([("Datei ", 400), ("öffnen", 800)], DOWNLOAD),
           ([("„", 400), ("Installation erlauben", 800), ("“", 400)], SHIELD),
           ([("ORBook ", 400), ("öffnen", 800), (" und anmelden", 400)], "app")]
WIDGET_STEPS = [([("Startbildschirm ", 400), ("lange drücken", 800)], HAND),
                ([("Widgets", 800), (" → ", 400), ("ORBook", 800)], p30.GRID)]

def app_hero(st, x, y, w, state="neu"):
    """Карточка приложения. state: neu (ещё не скачано) | installiert (открыто в самом APK) | update."""
    c = st.c
    h = 156
    out = [st.card(x, y, w, h), R(x + 16, y + 16, 60, 60, 18, c["tint"]), m17.logo(x + 22, y + 22, c, 0.63)]
    out.append(T(x + 92, y + 42, "ORBook für Android", 17, 900, c["ink"], ls=-0.2))
    if state == "installiert":
        out.append(DOT(x + 96, y + 61.5, 4, c["ok"]) + T(x + 106, y + 66, "Installiert · 0.18.0 · aktuell", 12.5, 700, c["ok"]))
        out.append(st.button(x + 16, y + 92, w - 32, "Nach Update suchen", "sand", REFRESH))
    else:
        out.append(T(x + 92, y + 64, "Version 0.18.0 · 6,4 MB", 12.5, 400, c["faint"]))
        out.append(st.button(x + 16, y + 92, w - 32, "APK herunterladen", "primary", DOWNLOAD))
    return "".join(out), h

def p_app(st, toast_text=None, H=1000):
    c = st.c
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Mehr", c), title(66, 65, "Android-App", c)]
    hc, hh = app_hero(st, 18, 92, 354); b.append(hc)
    y = 92 + hh + 30
    b.append(label(18, y, "Installieren", c)); y += 12
    sc, sh = steps(st, 18, y, 354, INSTALL); b.append(sc); y += sh + 30
    b.append(label(18, y, "Widget", c)); y += 12
    sc, sh = steps(st, 18, y, 354, WIDGET_STEPS); b.append(sc); y += sh + 30
    b.append(st.card(18, y, 354, 58) + p30.link_row(st, 18, y, 354, GLOBE, "Lieber als Web-App", "ohne APK", True))
    if toast_text:
        b.append(m15.toast(18, H - 140, 354, toast_text, c, WARN))
    b.append(f'<g transform="translate(0 {H - 844})">{nav(st, 3)}</g>')
    return st.page(390, H, "".join(b))

# ════════════════════════════ 06 · Mehr: карточка «ORBook für Android» и строка «Android-App» ════════════════════════════
def p_mehr(st, H=1100):
    c = st.c
    b = [eyebrow(18, 33, "9b · Meine Schule", c), title(18, 65, "Mehr", c)]
    x, y, w = 18, 88, 354
    b.append(R(x, y, w, 120, 22, c["tint"]) + R(x + 14, y + 16, 44, 44, 14, c["card"], c["rule"]) + m17.logo(x + 17, y + 19, c, 0.47)
             + T(x + 70, y + 34, "ORBook für Android", 15, 800, c["ink"]) + T(x + 70, y + 53, "Mit Widget für den Startbildschirm.", 12.5, 400, c["muted"])
             + g.round_btn(x + w - 42, y + 10, c, CLOSE, size=30)
             + R(x + 14, y + 72, w - 28, 36, 18, c["accent"]) + ICON(x + w / 2 - 48, y + 82, 0.67, c["on"], DOWNLOAD, 2.2)
             + T(x + w / 2 + 10, y + 95, "App laden", 13.5, 800, c["on"], "middle"))
    y = 88 + 120 + 34
    b.append(label(18, y, "Seiten", c))
    rows = [(m22.BARS, "Statistik", "Woche · Monat"), (p30.SPARK, "Neuigkeiten", "0.18"), (p30.FOLDER, "Materialien", "6 Links"),
            (g.USER, "Klasse einladen", "Link + QR"), (ANDROID, "Android-App", "APK · Widget"), (INFO, "Kurz erklärt", "3 Tipps"), (m22.I_SHIELD, "Datenschutz", None)]
    card, h = m22.rows_card(18, y + 12, 354, rows, c); b.append(card)
    nb, _ = g.badge(196, y + 12 + 4 * 52.5 + 17, "NEU", c, "tint"); b.append(nb)
    y += 12 + h + 34
    b.append(label(18, y, "Einstellungen", c))
    rows = [(m22.I_KURSE, "Meine Kurse", "7 von 8"), (m22.I_DARST, "Darstellung", "Hell"), (m22.I_FARBEN, "Fachfarben", None), (m22.I_MITT, "Mitteilungen", "3 von 4 an")]
    card, h = m22.rows_card(18, y + 12, 354, rows, c); b.append(card)
    b.append(f'<g transform="translate(0 {H - 844})">{nav(st, 3)}</g>')
    return st.page(390, H, "".join(b))

# ════════════════════════════ 07–08 · Обновление внутри APK ════════════════════════════
def p_update(st, loading=False):
    c = st.c
    top = 432
    b = [strip(p30.p_start(st)), sheet(st, top, "Version 0.18.1", "Update ist da")]
    y = top + 104
    bd, _ = g.badge(18, y, "BEHOBEN", c, "tint"); b.append(bd); y += 38
    for i, ln in enumerate(["Widget „Heute“ springt abends wieder auf morgen.", "Countdown zählt Feiertage nicht mehr mit."]):
        b.append(DOT(21.5, y - 4.5, 2.5, c["faint2"]) + T(34, y, ln, 13.5, 400, c["ink"])); y += 24
    if loading:
        y += 20
        b.append(T(18, y, "Wird geladen …", 13.5, 700, c["ink"]) + T(372, y, "4,1 von 6,4 MB", 12.5, 400, c["faint"], "end"))
        b.append(R(18, y + 14, 354, 8, 4, c["sand"]) + R(18, y + 14, 354 * 0.64, 8, 4, c["accent"]))
        b.append(HL(0, 390, 756, c) + st.button(18, 770, 354, "Abbrechen", "sand"))
    else:
        b.append(HL(0, 390, 756, c) + st.button(18, 770, 150, "Später", "sand") + st.button(176, 770, 196, "Aktualisieren", "primary", DOWNLOAD))
    return st.page(390, 844, "".join(b))

# ════════════════════════════ 09 · Внутри APK: Mehr → Android-App (установлено) ════════════════════════════
def p_app_inst(st):
    c = st.c
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Mehr", c), title(66, 65, "Android-App", c)]
    hc, hh = app_hero(st, 18, 92, 354, "installiert"); b.append(hc)
    y = 92 + hh + 30
    b.append(label(18, y, "Widgets auf diesem Handy", c)); y += 12
    rows = [("jetzt", "Jetzt", "9b · 4 × 2", CLOCK), ("heute", "Heute", "9b · 4 × 3", LIST), ("tests", "Tests", "5a · 2 × 2", FLAG)]
    b.append(st.card(18, y, 354, 58 * len(rows)))
    for i, (_, name, sub_, icon) in enumerate(rows):
        ry = y + i * 58
        if i: b.append(HL(32, 358, ry, c))
        b.append(DOT(50, ry + 29, 18, c["tint"]) + ICON(40.5, ry + 19.5, 0.79, c["accink"], icon, 2)
                 + T(80, ry + 26, name, 14.5, 700, c["ink"]) + T(80, ry + 44, sub_, 12, 400, c["faint"])
                 + ICON(342, ry + 21, 0.67, c["faint2"], CHEV_R))
    y += 58 * len(rows) + 30
    b.append(label(18, y, "Widget hinzufügen", c)); y += 12
    sc, sh = steps(st, 18, y, 354, WIDGET_STEPS); b.append(sc)
    b.append(nav(st, 3))
    return st.page(390, 844, "".join(b))

# ════════════════════════════ ПК: Mehr → Android-App с QR ════════════════════════════
def pc_app(st):
    c = st.c
    b = [p30.pc_side(st, "Mehr-"), R(30, 741, 204, 42, st.pill(42), c["accent"]), p30.dots_icon(44, 754, 0.83, c["on"]), T(73, 767, "Mehr", 14.5, 800, c["on"])]
    b.append(eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38))
    y = 130
    for head, items in [("Seiten", ["Statistik", "Neuigkeiten", "Materialien", "Android-App", "Datenschutz"]),
                        ("Einstellungen", ["Meine Kurse", "Darstellung", "Fachfarben", "Mitteilungen", "Sync", "Editor-Code"])]:
        b.append(T(290, y, head.upper(), 10.5, 800, c["faint"], ls=0.8)); y += 14
        for name in items:
            on = name == "Android-App"
            if on: b.append(R(284, y, 230, 38, st.pill(38), c["accent"]))
            b.append(T(304, y + 24, name, 13.5, 800 if on else 700, c["on"] if on else c["muted"])); y += 40
        y += 22
    X = 558
    b.append(T(X, 80, "Android-App", 26, 900, c["ink"], ls=-0.39))
    # слева: QR и кнопка
    L = 380
    b.append(st.card(X, 110, L, 460) + T(X + L / 2, 148, "Mit dem Handy scannen", 17, 900, c["ink"], "middle"))
    b.append(m16.qr(X + (L - 260) / 2, 170, 260, c))
    b.append(T(X + L / 2, 462, "Version 0.18.0 · 6,4 MB", 12.5, 400, c["faint"], "middle"))
    b.append(st.button(X + 24, 486, L - 48, "APK herunterladen", "sand", DOWNLOAD))
    # справа: шаги и как выглядят виджеты
    RX, RW = X + L + 24, 1404 - (X + L + 24)
    b.append(label(RX, 122, "Installieren", c))
    sc, sh = steps(st, RX, 134, RW, INSTALL); b.append(sc)
    y = 134 + sh + 30
    b.append(label(RX, y, "Widget", c)); y += 12
    sc, sh = steps(st, RX, y, RW, WIDGET_STEPS); b.append(sc)
    y += sh + 30
    b.append(label(RX, y, "So sieht es aus", c)); y += 12
    b.append(wallpaper(st, RX, y, RW, 884 - y, clip=("pcw", st.rc)))
    b.append(f'<g transform="translate({RX + 16} {y + 16}) scale(0.62)">{widget(st, "jetzt", 0, 0, 358, 158)}</g>')
    b.append(f'<g transform="translate({RX + 16 + 358 * 0.62 + 12} {y + 16}) scale(0.62)">{widget(st, "tests", 0, 0, 173, 164)}</g>')
    b.append(f'<g transform="translate({RX + 16} {y + 16 + 158 * 0.62 + 10}) scale(0.62)">{widget(st, "heute", 0, 0, 358 + 173 + 19, 280)}</g>')
    return g.svg(1440, 900, c, "".join(b), wall_defs(1440))

SCREENS = {
    "handy-01-startbildschirm": p_home, "handy-02-startbildschirm-gross": p_home2, "handy-03-zustaende": p_states,
    "handy-04-widget-einstellen": p_config, "handy-05-android-app": p_app, "handy-06-mehr": p_mehr,
    "handy-07-update": p_update, "handy-08-update-laedt": lambda st: p_update(st, True),
    "handy-09-fehler": lambda st: p_app(st, "Download fehlgeschlagen – keine Verbindung"),
    "handy-10-in-der-app": p_app_inst, "pc-01-android-app": pc_app,
}
if __name__ == "__main__":
    n = 0
    for theme in ("hell", "dunkel"):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(St("soft", theme)))
            n += 1
    print(n, "files")
