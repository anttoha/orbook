# Макеты части 50 «Wetter + Für dich jetzt»:
#   • 50a Wetter: погода дня в плашке «Woche», карточка в «Tag», шторка «Wetter» (часы школьного дня, «Losgehen»,
#     что надеть), место школы в админке (поиск города → координаты, погода идёт через наш сервер);
#   • 50b «Für dich jetzt»: блок на Start, меняется по времени дня (утро, урок, перемена, после школы, вечер/выходные, каникулы),
#     шторка настроек блока;
#   • 50c виджеты Android «Für dich jetzt» и «Wetter» во всех размерах (правило fit() из 31d), Soft/Glas/Klar, «Widget einstellen»;
#   • состояния: загрузка, офлайн («Stand …»), без места школы (погоды просто нет);
#   • ПК: Start с блоком и неделя с погодой.
# Кирпичики: 39 → 31d → 31 → 30 (Start, St, виджеты, рабочий стол), 19 (список дня). Цвета — токены Soft.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp)
    argv, sys.argv = sys.argv, [sys.argv[0]]   # чужой генератор не должен писать файлы
    try: sp.loader.exec_module(mod)
    finally: sys.argv = argv
    return mod

W39 = _load("g39", "39-widget-noten")
W = W39.W
p30, g = W.p30, W.g
m19 = p30.m19
T, S, R, ICON, P, HL, DOT, struck = g.T, g.S, g.R, g.ICON, g.P, p30.HL, p30.DOT, p30.struck
eyebrow, title, label, bhead = p30.eyebrow, p30.title, p30.label, p30.bhead
CHECK, CHEV_R, BACK, CLOSE, SEARCH, DOTS_V = g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.SEARCH, g.DOTS_V
SUN, SPARK, CLOCK, FLAG, LIST_CHECK, REFRESH, SLIDERS, MINUS = p30.SUN, p30.SPARK, p30.CLOCK, p30.FLAG, p30.LIST_CHECK, p30.REFRESH, p30.SLIDERS, p30.MINUS
PLUS = g.PLUS

# ── Значки погоды (контурные, как lucide) ──
CLOUD = P("M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z")
CLOUD_SUN = P("M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4M15.9 12.7a4 4 0 0 0-5.9-4.1") + P("M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z")
RAIN = P("M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2M16 14v6M8 14v6M12 16v6")
WIND = P("M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2")
DROP = P("M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z")
UMBRELLA = P("M22 12a10 10 0 0 0-20 0zM12 12v8a2 2 0 0 0 4 0M12 2v1")
SHIRT = P("M20.4 3.5L16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.2a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z")
BAG = P("M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 10h8M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6")
DOOR = P("M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01M13 4.6v16.1a1 1 0 0 1-1.2 1L5 20V5.6a2 2 0 0 1 1.5-1.9l4-1A2 2 0 0 1 13 4.6z")
PIN = P("M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0") + '<circle cx="12" cy="10" r="3"/>'
CALC = '<rect x="5" y="2" width="14" height="20" rx="2"/>' + P("M9 6h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01M9 19h6")

# ── Данные: среда 17.09., Hannover, как во всех макетах Soft ──
# Неделя: (день, число, «Stand», значок, макс.)
WEEKWX = [("MO", "15", "Mo 07:12", SUN, 21), ("DI", "16", "Di 07:10", CLOUD_SUN, 19), ("MI", "17", "07:08", RAIN, 17),
          ("DO", "18", "Mi 07:08", CLOUD, 15), ("FR", "19", "Mi 07:08", SUN, 18)]
# Часы школьного дня: (час, °C, значок, дождь %)
HOURS = [("07", 9, CLOUD_SUN, 0), ("08", 10, CLOUD_SUN, 0), ("09", 12, CLOUD, 10), ("10", 14, CLOUD, 20),
         ("11", 15, CLOUD, 30), ("12", 16, CLOUD, 40), ("13", 16, RAIN, 60), ("14", 15, RAIN, 70)]
NEXT = [("Do", CLOUD, 15, 8), ("Fr", SUN, 18, 7), ("Sa", SUN, 20, 9), ("So", CLOUD_SUN, 17, 10)]

def tw(t, fs, wt=800): return g.tw(t, fs, wt) * 0.93

# ════════════════ Мелкие кирпичики ════════════════
def chip(x, y, text, icon, c, kind="sand", h=28, fs=12.5):
    """Плашка «что взять/надеть». tint — из-за погоды, sand — из-за расписания (Sport, Test)."""
    fill, fg = (c["tint"], c["accink"]) if kind == "tint" else (c["sand"], c["ink"])
    w = tw(text, fs) + (36 if icon else 22)
    out = R(x, y, w, h, h / 2, fill) + (ICON(x + 10, y + h / 2 - 7.5, 0.62, fg, icon, 2.2) if icon else "")
    return out + T(x + (31 if icon else 11), y + h / 2 + fs * 0.36, text, fs, 800, fg), w

def chips(x, y, items, c, gap=6, h=28, fs=12.5):
    out = []
    for text, icon, kind in items:
        s, w = chip(x, y, text, icon, c, kind, h, fs); out.append(s); x += w + gap
    return "".join(out)

def wxmini(x, y, icon, text, c, col=None, fs=12, wt=800):
    """Маленькая погода в строку: значок + «17°»."""
    col = col or c["muted"]
    return ICON(x, y - fs + 1, fs / 24 * 1.1, col, icon, 2.2) + T(x + fs * 1.35, y, text, fs, wt, col)

def head_wx(st, x, y, w, icon, text):
    """Справа в шапке блока — погода (значок перед текстом)."""
    c = st.c
    tx = tw(text, 12)
    return T(x + w - 14, y + 24.5, text, 12, 800, c["ink"], "end") + ICON(x + w - 14 - tx - 19, y + 13, 0.62, c["muted"], icon, 2.2)

def lrow(st, x, y, w, time, code, name, right, rcol=None, kind=None, rbold=False):
    """Строка урока в блоке: время · точка предмета · предмет · справа учитель/кабинет или изменение."""
    c = st.c
    aus = kind == "aus"
    out = T(x + 14, y, time, 12, 400, c["faint"]) + DOT(x + 64, y - 4.5, 4.5, c["danger"] if aus else st.sub[code][0])
    out += T(x + 76, y, struck(name) if aus else name, 13.5, 700, c["danger"] if aus else c["ink"], raw=aus)
    return out + T(x + w - 14, y, right, 12, 800 if (rbold or aus) else 400, rcol or (c["danger"] if aus else c["faint"]), "end")

def irow(st, x, y, w, icon, text, right, icol=None, rcol=None):
    """Строка «значок — текст — справа когда»: Hausaufgaben, Test, Änderung."""
    c = st.c
    return (ICON(x + 14, y - 12, 0.62, icol or c["muted"], icon, 2.2) + T(x + 38, y, text, 13.5, 700, c["ink"])
            + T(x + w - 14, y, right, 12, 800, rcol or c["faint"], "end"))

def checkrow(st, x, y, w, code, text, right):
    c = st.c
    return (R(x + 14, y - 13, 18, 18, 6, "none", c["rule"], 1.6) + DOT(x + 44, y - 4.5, 4, st.sub[code][0])
            + T(x + 54, y, text, 13.5, 700, c["ink"]) + T(x + w - 14, y, right, 12, 800, c["accink"], "end"))

def bar(st, x, y, w, part, col):
    return R(x, y, w, 6, 3, st.c["sand"]) + R(x, y, w * part, 6, 3, col)

def hours(st, x, y, w, items=HOURS, h=76, now=None):
    """Часы школьного дня: время, значок, °C; дождь ≥ 30 % — синим под температурой."""
    c = st.c
    n = len(items)
    cw = w / n
    out = []
    for i, (hh, t, icon, rain) in enumerate(items):
        cx = x + cw * i + cw / 2
        on = hh == now
        if on: out.append(R(cx - cw / 2 + 2, y, cw - 4, h, 14 if st.style != "klar" else 6, c["tint"]))
        out.append(T(cx, y + 17, hh, 11, 800, c["accink"] if on else c["faint"], "middle"))
        out.append(ICON(cx - 10, y + 25, 0.83, c["ink"] if on else c["muted"], icon, 1.9))
        out.append(T(cx, y + 62, f"{t}°", 13, 800, c["ink"], "middle"))
        if rain >= 30: out.append(T(cx, y + h + 12, f"{rain} %", 10.5, 800, st.sub["Ma"][0], "middle"))
    return "".join(out)

# ════════════════ 50b · Блок «Für dich jetzt» — по времени дня ════════════════
def big_wx(st, x, y, icon, temp, line1, line2):
    """Крупно погода: значок, °C, две строки рядом."""
    c = st.c
    return (ICON(x + 14, y, 1.5, c["ink"], icon, 1.7) + T(x + 60, y + 30, temp, 32, 900, c["ink"], ls=-0.6)
            + T(x + 60 + tw(temp, 32, 900) + 10, y + 13, line1, 12.5, 800, c["muted"])
            + T(x + 60 + tw(temp, 32, 900) + 10, y + 31, line2, 12.5, 400, c["faint"]))

def f_morgen(st, x, y, w, h, weather=True):
    """06:40, ещё дома: погода к выходу, что взять, первый урок и изменения на сегодня."""
    c = st.c
    out = [bhead(st, x, y, "Für dich jetzt", SPARK, True, "los in 25 min", w)]
    yy = y + 44
    if weather:
        out.append(big_wx(st, x, yy, CLOUD_SUN, "9°", "Losgehen 07:05", "Heute bis 17° · Regen ab 13 Uhr"))
        out.append(chips(x + 14, yy + 52, [("Regenjacke", UMBRELLA, "tint"), ("Jacke", SHIRT, "tint"), ("Sportsachen", BAG, "sand")], c))
        yy += 96
    else:
        out.append(chips(x + 14, yy, [("Sportsachen", BAG, "sand")], c)); yy += 44
    out.append(HL(x + 14, x + w - 14, yy, c))
    out.append(lrow(st, x, yy + 24, w, "07:30", "De", "Deutsch", "Web · 102"))
    out.append(lrow(st, x, yy + 50, w, "08:20", "Ma", "Mathe", "Vertretung · Kle · 204", c["accink"], rbold=True))
    out.append(lrow(st, x, yy + 76, w, "09:25", "En", "Englisch", "fällt aus", kind="aus"))
    if h > 300: out.append(lrow(st, x, yy + 102, w, "10:30", "Ph", "Physik", "Ric · 301"))
    return "".join(out)

def f_stunde(st, x, y, w, h):
    """10:48, im Unterricht: was gerade läuft, was danach kommt."""
    c = st.c
    out = [bhead(st, x, y, "Jetzt · 4. Stunde", CLOCK, True, "noch 27 min", w)]
    out.append(T(x + 14, y + 64, "Physik", 22, 900, c["ink"], ls=-0.3) + T(x + w - 14, y + 62, "10:30–11:15", 12, 400, c["faint"], "end"))
    out.append(T(x + 14, y + 84, "Ric · Raum 301", 12.5, 400, c["muted"]))
    out.append(bar(st, x + 14, y + 96, w - 28, 0.4, st.sub["Ph"][0]))
    out.append(HL(x + 14, x + w - 14, y + 120, c) + label(x + 14, y + 143, "Danach", c))
    out.append(lrow(st, x, y + 168, w, "11:35", "Ge", "Geschichte", "Bau · 108"))
    out.append(lrow(st, x, y + 194, w, "12:25", "Sp", "Sport", "Sportsachen!", c["accink"], rbold=True))
    out.append(wxmini(x + 14, y + 232, RAIN, "Regen ab 13 Uhr · 16°", c, c["muted"], 12, 700))
    return "".join(out)

def f_pause(st, x, y, w, h):
    """11:20, Pause: wohin als Nächstes — Raum groß."""
    c = st.c
    out = [bhead(st, x, y, "Pause", CLOCK, True, "noch 15 min", w)]
    out.append(label(x + 14, y + 52, "Gleich · 11:35", c))
    out.append(T(x + 14, y + 80, "Geschichte", 22, 900, c["ink"], ls=-0.3))
    s, cw_ = chip(x + 14, y + 94, "Raum 108", DOOR, c, "tint", h=30, fs=13.5); out.append(s)
    out.append(T(x + 14 + cw_ + 10, y + 114, "bei Bau", 13, 400, c["muted"]))
    out.append(HL(x + 14, x + w - 14, y + 140, c) + label(x + 14, y + 163, "Danach", c))
    out.append(lrow(st, x, y + 188, w, "12:25", "Sp", "Sport", "Hen · Halle"))
    out.append(lrow(st, x, y + 214, w, "13:40", "Ku", "Kunst", "Raum 014 statt 012", c["accink"], rbold=True))
    return "".join(out)

def f_nachmittag(st, x, y, w, h):
    """14:30, Schule aus: Hausaufgaben für morgen, was morgen anders ist, Wetter morgen."""
    c = st.c
    out = [bhead(st, x, y, "Für morgen", SPARK, True), head_wx(st, x, y, w, CLOUD, "15° / 8°")]
    out.append(label(x + 14, y + 54, "Hausaufgaben", c) + T(x + w - 14, y + 54, "2 offen", 12, 800, c["accink"], "end"))
    out.append(checkrow(st, x, y + 82, w, "Ma", "Mathe · S. 54, Nr. 3", "bis morgen"))
    out.append(checkrow(st, x, y + 110, w, "En", "Vokabeln Unit 3", "bis morgen"))
    out.append(HL(x + 14, x + w - 14, y + 128, c) + label(x + 14, y + 151, "Donnerstag", c))
    out.append(lrow(st, x, y + 176, w, "07:30", "De", "Deutsch", "Web · 102"))
    out.append(lrow(st, x, y + 202, w, "10:30", "Ge", "Geschichte", "Vertretung · Kle · B12", c["accink"], rbold=True))
    out.append(irow(st, x, y + 232, w, FLAG, "Test Bio", "Do 25.9."))
    return "".join(out)

def f_ferien(st, x, y, w, h):
    c = st.c
    out = [bhead(st, x, y, "Herbstferien", SUN, True), head_wx(st, x, y, w, SUN, "19°")]
    out.append(T(x + 14, y + 72, "8", 34, 900, c["ink"], ls=-0.5) + T(x + 40, y + 70, "Tage frei", 14, 700, c["muted"]))
    out.append(T(x + 14, y + 94, "Schule wieder Mo, 20. Okt", 12.5, 400, c["muted"]))
    out.append(bar(st, x + 14, y + 106, w - 28, 0.43, c["accent"]))
    out.append(HL(x + 14, x + w - 14, y + 130, c))
    out.append(irow(st, x, y + 160, w, FLAG, "Test Mathe", "Do 23.10."))
    out.append(irow(st, x, y + 190, w, LIST_CHECK, "Deutsch · Lektüre lesen", "bis 20.10.", rcol=c["accink"]))
    return "".join(out)

def irow_raw(st, x, y, w, icon, text_raw, right, icol, rcol):
    c = st.c
    return (ICON(x + 14, y - 12, 0.62, icol, icon, 2.2) + T(x + 38, y, text_raw, 13.5, 700, rcol, raw=True)
            + T(x + w - 14, y, right, 12, 800, rcol, "end"))

def f_abend(st, x, y, w, h):
    """Freitag 19:30 / Wochenende: der nächste Schultag."""
    c = st.c
    out = [bhead(st, x, y, "Nächster Schultag", SPARK, True), head_wx(st, x, y, w, SUN, "16° / 7°")]
    out.append(T(x + 14, y + 66, "Montag", 22, 900, c["ink"], ls=-0.3) + T(x + 14 + tw("Montag", 22, 900) + 8, y + 65, "22. Sept", 14, 700, c["faint"]))
    out.append(T(x + 14, y + 88, S("07:30", 800, c["ink"]) + S(" · Deutsch · Web · 102", 400, c["muted"]), 12.5, 400, c["muted"], raw=True))
    out.append(HL(x + 14, x + w - 14, y + 106, c))
    out.append(irow(st, x, y + 136, w, LIST_CHECK, "Physik · Protokoll Versuch 4", "bis Mo", rcol=c["accink"]))
    out.append(irow(st, x, y + 166, w, FLAG, "Test Geschichte", "Di 23.9."))
    out.append(irow_raw(st, x, y + 196, w, REFRESH, f'{struck("Sport")} fällt aus', "Mo · 4.", c["danger"], c["danger"]))
    return "".join(out)

# Маленькие размеры блока: Breit (2×1) и Klein (1×1) — то же правило: сначала погода к выходу и что взять
def f_breit(st, x, y, w, h):
    c = st.c
    return (bhead(st, x, y, "Für dich jetzt", SPARK, True, "los in 25 min", w)
            + ICON(x + 14, y + 40, 1.0, c["ink"], CLOUD_SUN, 1.9) + T(x + 46, y + 61, "9°", 24, 900, c["ink"], ls=-0.4)
            + T(x + 82, y + 59, S("07:30 ", 800, c["ink"]) + S("Deutsch · 102", 400, c["muted"]), 12.5, 400, c["muted"], raw=True)
            + chips(x + 14, y + 80, [("Regenjacke", UMBRELLA, "tint"), ("Sportsachen", BAG, "sand")], c))

def f_klein(st, x, y, w, h):
    c = st.c
    return (bhead(st, x, y, "Für dich", SPARK, True) + T(x + w - 14, y + 24.5, "07:05", 12, 800, c["ink"], "end")
            + ICON(x + 14, y + 40, 1.0, c["ink"], CLOUD_SUN, 1.9) + T(x + 46, y + 61, "9°", 24, 900, c["ink"], ls=-0.4)
            + chips(x + 14, y + 80, [("Regenjacke", UMBRELLA, "tint")], c))

def b_fuer(st, x, y, w, h):
    if h < 140: return f_breit(st, x, y, w, h) if w > 200 else f_klein(st, x, y, w, h)
    return f_morgen(st, x, y, w, h)

def b_wetter(st, x, y, w, h):
    """Блок «Wetter» (1×1): сегодня, дождь, к выходу."""
    c = st.c
    return (bhead(st, x, y, "Wetter", CLOUD_SUN) + ICON(x + 14, y + 40, 1.0, c["ink"], RAIN, 1.9)
            + T(x + 46, y + 61, "17°", 24, 900, c["ink"], ls=-0.4) + T(x + 46 + tw("17°", 24, 900) + 4, y + 60, "/ 9°", 13, 700, c["faint"])
            + wxmini(x + 14, y + 88, DROP, "60 % ab 13 Uhr", c, c["muted"], 12, 700)
            + T(x + 14, y + 108, "Losgehen 07:05 · 9°", 12, 400, c["faint"]))

p30.DRAW["fuer"] = b_fuer
p30.DRAW["wetter"] = b_wetter

# ════════════════ Телефон: Start ════════════════
PX, PY, PCW, PU, PG = p30.PX, p30.PY, p30.PCW, p30.PU, p30.PG
ST_ITEMS = [("fuer", 0, 0, 2, 2), ("tests", 0, 2, 1, 1), ("aufgaben", 1, 2, 1, 1), ("termine", 0, 3, 1, 1), ("ferien", 1, 3, 1, 1)]

def p_start(st):
    c = st.c
    b = [p30.start_head(st), p30.grid(st, ST_ITEMS, PX, PY, PCW, PU, PG), R(0, 744, 390, 100, 0, c["paper"]) if st.style != "glas" else "", p30.nav(st, 0)]
    return st.page(390, 844, "".join(b))

# Все отрезки дня одним листом: шесть вариантов блока 2×2 + маленькие размеры
ZEITEN = [("06:40 · vor der Schule", f_morgen), ("10:48 · im Unterricht", f_stunde), ("11:20 · Pause", f_pause),
          ("14:30 · Schule aus", f_nachmittag), ("Fr 19:30 · Wochenende", f_abend), ("Ferien", f_ferien)]

def p_zeiten(st):
    c = st.c
    bw, bh = 354, 258
    Wd = 24 + bw + 24 + bw + 24
    out = [T(24, 46, "Für dich jetzt · über den Tag", 26, 900, c["ink"], ls=-0.4)]
    y0 = 74
    for i, (cap, fn) in enumerate(ZEITEN):
        x = 24 + (i % 2) * (bw + 24)
        y = y0 + (i // 2) * (bh + 54)
        out.append(T(x + 2, y + 16, cap, 13, 800, c["muted"]) + st.card(x, y + 26, bw, bh) + fn(st, x, y + 26, bw, bh))
    y = y0 + 3 * (bh + 54) + 10
    out.append(T(24, y + 20, "Kleinere Größen", 20, 900, c["ink"], ls=-0.3)); y += 34
    out.append(T(26, y + 16, "Breit · 2 × 1", 13, 800, c["muted"]) + st.card(24, y + 26, bw, PU) + f_breit(st, 24, y + 26, bw, PU))
    out.append(T(24 + bw + 26, y + 16, "Klein · 1 × 1", 13, 800, c["muted"]) + st.card(24 + bw + 24, y + 26, PCW, PU) + f_klein(st, 24 + bw + 24, y + 26, PCW, PU))
    out.append(T(24 + bw + 24 + PCW + 12, y + 16, "Wetter · 1 × 1", 13, 800, c["muted"]) + st.card(24 + bw + 24 + PCW + 10, y + 26, PCW, PU) + b_wetter(st, 24 + bw + 24 + PCW + 10, y + 26, PCW, PU))
    H = y + 26 + PU + 30
    return st.page(Wd, H, "".join(out))

# ════════════════ Шторка настроек блока ════════════════
def stepper(st, x, y, value, w=136, h=38):
    c = st.c
    return (R(x, y, w, h, h / 2, c["sand"]) + ICON(x + 9, y + 9, 0.83, c["ink"], MINUS, 2.2)
            + T(x + w / 2, y + h / 2 + 5, value, 14, 800, c["ink"], "middle") + ICON(x + w - 29, y + 9, 0.83, c["ink"], PLUS, 2.2))

def strip(s): return s[s.index("</defs>") + 7: s.rindex("</svg>")] if "</defs>" in s else s[s.index(">", s.index("<svg")) + 1: s.rindex("</svg>")]

def p_block(st):
    c = st.c
    top = 128
    b = [strip(p_start(st)), p30.sheet(st, top, "Block", "Für dich jetzt")]
    y = top + 108
    b.append(label(18, y, "Größe", c))
    for i, (nm, sh) in enumerate([("Klein", "k"), ("Breit", "b"), ("Groß", "g")]):
        b.append(p30.size_tile(st, 18 + i * 120.67, y + 12, 112.67, nm, sh, i == 2))
    y += 126
    b.append(label(18, y, "Zeigen", c)); y += 12
    rows = [("Wetter", True), ("Was mitnehmen", True), ("Hausaufgaben", True), ("Tests", True), ("Änderungen", True)]
    b.append(st.card(18, y, 354, 54 * len(rows)))
    for i, (t, on) in enumerate(rows): b.append(p30.switch_row(st, 18, y + i * 54, 354, t, on, i == 0))
    y += 54 * len(rows) + 26
    b.append(st.card(18, y, 354, 108))
    b.append(T(32, y + 34.5, "Losgehen vorher", 14.5, 500, c["ink"]) + stepper(st, 220, y + 8, "45 min"))
    b.append(p30.switch_row(st, 18, y + 54, 354, "Nur meine Kurse", True))
    return st.page(390, 844, "".join(b))

# ════════════════ 50a · Woche mit Wetter ════════════════
def week_head(st, x=18):
    c = st.c
    return (eyebrow(x, 33, "KW 38 · 15.–19. Sept", c) + title(x, 65, "Diese Woche", c)
            + DOT(x + 6, 96, 5, c["ok"]) + T(x + 18, 100.5, S("Live", 800, c["ok"]) + S(" · geprüft vor 20 Sek.", 400, c["muted"]), 13, 400, c["muted"], raw=True)
            + ICON(x + 262, 88.5, 0.67, c["accink"], REFRESH, 2.2) + T(x + 354, 100.5, "Neu laden", 13, 800, c["accink"], "end"))

def day_pill(st, x, y, w, wd, d, stand, icon, temp, sel, h=74):
    c = st.c
    out = []
    if sel: out.append(R(x, y, w, h, st.rz, c["accent"]))
    fg, sub = (c["on"], c["on"]) if sel else (c["ink"], c["faint"])
    op = ' opacity="0.75"' if sel else ""
    out.append(T(x + w / 2, y + 15, wd, 10, 700, c["on"] if sel else c["faint"], "middle", 0.8))
    out.append(T(x + w / 2, y + 36, d, 18, 900, fg, "middle", -0.27))
    sw = tw(stand, 9, 600) + 12
    out.append(f'<g{op}>' + ICON(x + w / 2 - sw / 2, y + 43, 0.4, sub, REFRESH, 2.4) + T(x + w / 2 - sw / 2 + 12, y + 51, stand, 9, 600, sub) + '</g>')
    tws = tw(f"{temp}°", 10.5) + 15
    out.append(ICON(x + w / 2 - tws / 2, y + 57, 0.5, c["on"] if sel else c["muted"], icon, 2.2) + T(x + w / 2 - tws / 2 + 15, y + 67, f"{temp}°", 10.5, 800, c["on"] if sel else c["muted"]))
    return "".join(out)

def p_woche(st):
    c = st.c
    b = [week_head(st), st.rbtn(246, 33.31, BACK), st.rbtn(290, 33.31, DOTS_V), st.rbtn(334, 33.31, CHEV_R)]
    y0 = 114
    COLS, CW = m19.COLS, m19.CW
    for i, (wd, d, stand, icon, temp) in enumerate(WEEKWX):
        b.append(day_pill(st, COLS[i], y0, CW, wd, d, stand, icon, temp, i == 2))
    gy = y0 + 82
    for r in range(6):
        y = gy + r * 56
        b.append(T(27, y + 24, str(r + 1), 12.5, 700, c["ink"], "middle") + T(27, y + 38, p30.TIMES[r][0], 8.5, 400, c["faint"], "middle"))
        for i in range(5):
            code = p30.WEEK[i][r]
            x = COLS[i]
            aus = (i, r) == (2, 2)
            b.append(st.cell(x, y, CW, 52, code, state="aus" if aus else None))
            if not code: continue
            col = c["danger"] if aus else st.ctext(code)
            b.append(T(x + 8, y + 20, struck(code) if aus else code, 12.5, 900, col, raw=True))
            b.append(T(x + 8, y + 42, "fällt aus", 8.5, 800, col) if aus else f'<g opacity="0.85">{T(x + 8, y + 42, p30.ROOM[code], 9.5, 600, col)}</g>')
    ly = gy + 6 * 56 + 12
    b.append(st.card(18, ly, 354, 68.88) + ICON(32, ly + 25.69, 0.79, c["muted"], FLAG, 1.9) + T(63, ly + 29, "Fr · Mathe", 14.5, 500, c["ink"])
             + T(63, ly + 48, "Nächste Klausur", 12, 400, c["faint"]) + T(334, ly + 39.19, "in 2 Tagen", 13, 400, c["faint"], "end") + ICON(342, ly + 27.19, 0.67, c["faint2"], CHEV_R))
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + p30.nav(st, 1))
    return st.page(390, 844, "".join(b))

# ════════════════ 50a · Tag mit Wetter ════════════════
def wx_card(st, x, y, w, offline=False, h=66):
    """Карточка погоды в «Tag»: сегодня, дождь, к выходу. Нажатие — шторка «Wetter»."""
    c = st.c
    out = [st.card(x, y, w, h), ICON(x + 14, y + 17, 1.33, c["ink"], RAIN, 1.8)]
    out.append(T(x + 58, y + 30, "17°", 18, 900, c["ink"]) + T(x + 58 + tw("17°", 18, 900) + 4, y + 30, "/ 9°", 13, 700, c["faint"]))
    out.append(T(x + 58, y + 50, "Regen 60 % ab 13 Uhr · Wind 18 km/h", 12.5, 400, c["muted"]))
    if offline:
        out.append(T(x + w - 34, y + 30, "Stand gestern 21:30", 12, 700, c["faint"], "end"))
    else:
        s, cw_ = chip(0, 0, "Regenjacke", UMBRELLA, c, "tint", h=24, fs=11.5)
        out.append(f'<g transform="translate({x + w - 34 - cw_} {y + 13})">{s}</g>')
    out.append(ICON(x + w - 28, y + h / 2 - 8, 0.67, c["faint2"], CHEV_R))
    return "".join(out)

def tag_head(st):
    c = st.c
    return (st.rbtn(18, 33.31, BACK) + eyebrow(66, 33, "Mittwoch · heute", c, True) + title(66, 65, "17. September", c)
            + st.rbtn(290, 33.31, BACK) + st.rbtn(334, 33.31, CHEV_R) + st.seg(18, 88, 354, ["Liste", "Zeitleiste"], 0, h=38, fs=13.5))

DAYROWS = [(1, "De", False, (), None, None), (2, "Ma", False, (), "vertretung", None), (3, "En", False, (), "aus", None),
           (4, "Ph", False, (), None, None), (5, "Ge", False, (), None, None)]

def p_tag(st, offline=False):
    c = st.c
    b = [tag_head(st), wx_card(st, 18, 138, 354, offline)]
    rows, _ = m19.day_list(218, DAYROWS, c, st.sub); b.append(rows)
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + p30.nav(st, 1))
    return st.page(390, 844, "".join(b))

# ════════════════ 50a · Шторка «Wetter» ════════════════
def wetter_sheet(st, top=250, H=844):
    c = st.c
    b = [p30.sheet(st, top, "Mittwoch · Hannover", "Wetter")]
    y = top + 96
    b.append(ICON(18, y, 2.0, c["ink"], RAIN, 1.6) + T(80, y + 38, "17°", 40, 900, c["ink"], ls=-0.8)
             + T(80 + tw("17°", 40, 900) + 6, y + 37, "/ 9°", 18, 800, c["faint"]))
    b.append(wxmini(240, y + 18, DROP, "60 % ab 13 Uhr", c, c["muted"], 12.5, 700) + wxmini(240, y + 40, WIND, "18 km/h", c, c["muted"], 12.5, 700))
    y += 70
    b.append(st.card(18, y, 354, 94))
    b.append(ICON(32, y + 16, 0.75, c["accink"], DOOR, 2) + T(56, y + 30, "Losgehen 07:05", 14.5, 800, c["ink"])
             + T(358, y + 30, S("9°", 800, c["ink"]) + S(" · trocken", 400, c["muted"]), 13, 400, c["muted"], "end", raw=True))
    b.append(chips(32, y + 52, [("Regenjacke", UMBRELLA, "tint"), ("Jacke", SHIRT, "tint")], c))
    y += 94 + 28
    b.append(label(18, y, "Schultag", c)); y += 12
    b.append(st.card(18, y, 354, 116) + hours(st, 24, y + 8, 342, now="07"))
    y += 116 + 22
    b.append(T(18, y, "Stand 06:12 · Wetterdaten: Open-Meteo", 12, 400, c["faint"]))
    return "".join(b)

def p_wetter(st):
    return st.page(390, 844, strip(p_tag(st)) + wetter_sheet(st))

# ════════════════ 50a · Admin: Ort der Schule ════════════════
def field(st, x, y, w, text, icon=None, focus=False, h=50):
    c = st.c
    out = R(x, y, w, h, 16, c["card"]) + R(x + .75, y + .75, w - 1.5, h - 1.5, 15.25, "none", c["accent"] if focus else c["rule"], 2 if focus else 1)
    if icon: out += ICON(x + 14, y + h / 2 - 9, 0.75, c["faint"], icon, 2)
    return out + T(x + (42 if icon else 16), y + h / 2 + 5, text, 15, 600, c["ink"])

def p_admin(st, state="ok"):
    c = st.c
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Admin · Einstellungen", c), title(66, 65, "Wetter", c)]
    y = 104
    b.append(st.card(18, y, 354, 54) + p30.switch_row(st, 18, y, 354, "Wetter anzeigen", True, True)); y += 54 + 28
    b.append(label(18, y, "Ort der Schule", c)); y += 12
    b.append(field(st, 18, y, 354, "Hannover", SEARCH, focus=state != "saved")); y += 50 + 12
    if state == "leer":
        b.append(T(18, y + 18, "Kein Ort gefunden.", 13, 700, c["danger"])); y += 40
    else:
        res = [("Hannover", "Niedersachsen, Deutschland", True), ("Hannoversch Münden", "Niedersachsen, Deutschland", False),
               ("Hannover", "Ontario, Kanada", False)]
        if state == "saved": res = res[:1]
        b.append(st.card(18, y, 354, 60 * len(res)))
        for i, (nm, reg, on) in enumerate(res):
            ry = y + i * 60
            if i: b.append(HL(32, 358, ry, c))
            b.append(ICON(32, ry + 18, 0.75, c["accink"] if on else c["muted"], PIN, 2) + T(60, ry + 27, nm, 14.5, 800 if on else 600, c["ink"])
                     + T(60, ry + 45, reg, 12, 400, c["faint"]))
            if on: b.append(ICON(334, ry + 20, 0.83, c["accink"], CHECK, 2.4))
        y += 60 * len(res) + 28
        b.append(label(18, y, "Vorschau · heute", c)); y += 12
        b.append(wx_card(st, 18, y, 354)); y += 66 + 28
    b.append(st.button(18, y, 354, "Gespeichert" if state == "saved" else "Speichern", "sand" if state == "saved" else "primary", CHECK))
    return st.page(390, 844, "".join(b))

# ════════════════ Состояния ════════════════
def skel_block(st, x, y, w, h):
    c = st.c
    sk = c["skel"]
    return (bhead(st, x, y, "Für dich jetzt", SPARK, True) + R(x + 14, y + 44, 36, 36, 12, sk) + R(x + 60, y + 46, 54, 30, 10, sk)
            + R(x + 128, y + 48, 120, 11, 5.5, sk) + R(x + 128, y + 66, 180, 11, 5.5, sk) + R(x + 14, y + 96, 104, 28, 14, sk) + R(x + 124, y + 96, 70, 28, 14, sk)
            + "".join(R(x + 14, y + 158 + i * 26, w - 28 - i * 40, 12, 6, sk) for i in range(3)))

def p_zustaende(st):
    c = st.c
    bw, bh = 354, 258
    Wd = 24 + bw + 24 + bw + 24
    out = [T(24, 46, "Zustände", 26, 900, c["ink"], ls=-0.4)]
    y = 74
    out.append(T(26, y + 16, "Lädt", 13, 800, c["muted"]) + st.card(24, y + 26, bw, bh) + skel_block(st, 24, y + 26, bw, bh))
    x2 = 24 + bw + 24
    out.append(T(x2 + 2, y + 16, "Ohne Wetter · Schule hat keinen Ort", 13, 800, c["muted"]) + st.card(x2, y + 26, bw, bh) + f_morgen(st, x2, y + 26, bw, bh, weather=False))
    y += 26 + bh + 40
    out.append(T(26, y + 16, "Offline · letzter Stand", 13, 800, c["muted"]) + wx_card(st, 24, y + 26, bw, offline=True))
    sk = c["skel"]
    out.append(T(x2 + 2, y + 16, "Wetter lädt", 13, 800, c["muted"]) + st.card(x2, y + 26, bw, 66) + R(x2 + 14, y + 43, 32, 32, 10, sk)
               + R(x2 + 58, y + 44, 70, 14, 7, sk) + R(x2 + 58, y + 64, 200, 11, 5.5, sk))
    y += 26 + 66 + 40
    out.append(T(26, y + 16, "Admin · nichts gefunden", 13, 800, c["muted"]))
    out.append(field(st, 24, y + 26, bw, "Hanover", SEARCH, True) + T(24, y + 26 + 50 + 30, "Kein Ort gefunden.", 13, 700, c["danger"]))
    H = y + 26 + 50 + 60
    return st.page(Wd, H, "".join(out))

# ════════════════ 50c · Виджеты Android ════════════════
def wf_fuer(st, x, y, w, h):
    """Виджет «Für dich jetzt»: то же правило, что блок; на маленьких — погода к выходу и главное, что взять."""
    c = st.c
    narrow = w < 200
    if h < 120:
        if narrow:
            return (ICON(x + 12, y + 12, 0.92, c["ink"], CLOUD_SUN, 2) + T(x + 40, y + 31, "9°", 20, 900, c["ink"]) + T(x + w - 12, y + 30, "07:05", 12, 800, c["accink"], "end")
                    + chips(x + 12, y + 44, [("Regenjacke", UMBRELLA, "tint")], c, h=22, fs=11.5))
        return (ICON(x + 14, y + 12, 0.92, c["ink"], CLOUD_SUN, 2) + T(x + 42, y + 31, "9°", 20, 900, c["ink"])
                + T(x + 72, y + 30, S("Losgehen 07:05", 800, c["ink"]) + S(" · 07:30 Deutsch", 400, c["muted"]), 12.5, 400, c["muted"], raw=True)
                + chips(x + 14, y + 44, [("Regenjacke", UMBRELLA, "tint"), ("Jacke", SHIRT, "tint"), ("Sportsachen", BAG, "sand")], c, h=22, fs=11.5))
    if narrow:
        return (bhead(st, x, y, "Für dich", SPARK, True) + T(x + w - 14, y + 24.5, "07:05", 12, 800, c["ink"], "end")
                + ICON(x + 14, y + 40, 1.0, c["ink"], CLOUD_SUN, 1.9) + T(x + 46, y + 61, "9°", 24, 900, c["ink"])
                + chips(x + 14, y + 76, [("Regenjacke", UMBRELLA, "tint")], c, h=24, fs=11.5)
                + chips(x + 14, y + 106, [("Sportsachen", BAG, "sand")], c, h=24, fs=11.5)
                + T(x + 14, y + 150, S("07:30 ", 800, c["ink"]) + S("Deutsch", 400, c["muted"]), 12.5, 400, c["muted"], raw=True))
    if h < 240:
        return (bhead(st, x, y, "Für dich jetzt", SPARK, True, "los in 25 min", w)
                + big_wx(st, x, y + 40, CLOUD_SUN, "9°", "Losgehen 07:05", "Heute bis 17° · Regen ab 13 Uhr")
                + chips(x + 14, y + 90, [("Regenjacke", UMBRELLA, "tint"), ("Jacke", SHIRT, "tint"), ("Sportsachen", BAG, "sand")], c, h=26, fs=12)
                + T(x + 14, y + 146, S("07:30 ", 800, c["ink"]) + S("Deutsch · Web · 102", 400, c["muted"]), 12.5, 400, c["muted"], raw=True)
                + T(x + w - 14, y + 146, "+ 2 Änderungen", 11.5, 800, c["accink"], "end"))
    return f_morgen(st, x, y, w, 258) + HL(x + 14, x + w - 14, y + h - 98, c) + hours(st, x + 6, y + h - 90, w - 12, now="07", h=70)

def wf_wetter(st, x, y, w, h):
    c = st.c
    narrow = w < 200
    t2 = lambda tx, ty, fs: T(tx, ty, "17°", fs, 900, c["ink"], ls=-0.4) + T(tx + tw("17°", fs, 900) + 4, ty - 1, "/ 9°", fs * 0.55, 700, c["faint"])
    if h < 120:
        if narrow:
            return ICON(x + 12, y + 14, 1.08, c["ink"], RAIN, 1.9) + t2(x + 46, y + 38, 22) + wxmini(x + 12, y + 62, DROP, "60 % ab 13 Uhr", c, c["muted"], 11.5, 700)
        return (ICON(x + 14, y + 20, 1.5, c["ink"], RAIN, 1.7) + t2(x + 60, y + 48, 26)
                + wxmini(x + 172, y + 32, DROP, "60 % ab 13 Uhr", c, c["muted"], 12, 700) + T(x + 172, y + 54, "Losgehen 07:05 · 9°", 12, 400, c["faint"]))
    if narrow:
        return (bhead(st, x, y, "Wetter", CLOUD_SUN) + T(x + w - 14, y + 24.5, "Mi", 12, 800, c["ink"], "end")
                + ICON(x + 14, y + 42, 1.33, c["ink"], RAIN, 1.8) + t2(x + 56, y + 70, 26)
                + wxmini(x + 14, y + 104, DROP, "60 % ab 13 Uhr", c, c["muted"], 12, 700) + wxmini(x + 14, y + 124, WIND, "18 km/h", c, c["muted"], 12, 700)
                + T(x + 14, y + 148, "Losgehen 07:05 · 9°", 12, 400, c["faint"]))
    out = [bhead(st, x, y, "Wetter · Hannover", CLOUD_SUN) + T(x + w - 14, y + 24.5, "Stand 06:12", 11.5, 700, c["faint"], "end")]
    out.append(ICON(x + 14, y + 38, 1.17, c["ink"], RAIN, 1.8) + t2(x + 52, y + 63, 24))
    out.append(wxmini(x + 150, y + 52, DROP, "60 % ab 13 Uhr", c, c["muted"], 12, 700) + T(x + 150, y + 70, "Losgehen 07:05 · 9°", 12, 400, c["faint"]))
    out.append(hours(st, x + 6, y + 82, w - 12, h=66, now="07"))
    if h > 240:
        out.append(HL(x + 14, x + w - 14, y + 172, c))
        cw = (w - 28) / 4
        for i, (d, icon, mx, mn) in enumerate(NEXT):
            cx = x + 14 + cw * i + cw / 2
            out.append(T(cx, y + 194, d, 11.5, 800, c["faint"], "middle") + ICON(cx - 10, y + 202, 0.83, c["muted"], icon, 1.9)
                       + T(cx, y + 240, S(f"{mx}°", 800, c["ink"]) + S(f" {mn}°", 600, c["faint"]), 12.5, 800, c["ink"], "middle", raw=True))
    return "".join(out)

WDRAW = dict(fuer=wf_fuer, wetter=wf_wetter)
def widget(st, kind, x, y, w, h):
    return W.frame(st, x, y, w, h) + (WDRAW[kind](st, x, y, w, h) if kind in WDRAW else W.DRAW[kind](st, x, y, w, h))

KINDS = [("fuer", "Für dich jetzt", SPARK, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 4)]),
         ("wetter", "Wetter", CLOUD_SUN, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 3)])]

def p_sizes(kind, name, sizes, theme="hell"):
    st = W.style("soft", theme)
    Wd = 24 + 173 + 24 + 358 + 24
    cols = {True: [24, 74], False: [24 + 173 + 24, 74]}
    body = []
    for cw, rh in sizes:
        w, h = W.size(cw, rh)
        col = cols[cw <= 2]
        x, y = col
        body.append(T(x + 2, y + 16, f"{cw} × {rh}", 12.5, 800, W.fg(st)) + widget(st, kind, x, y + 26, w, h))
        col[1] = y + 26 + h + 24
    H = max(cols[True][1], cols[False][1]) + 8
    return g.svg(Wd, H, st.c, W.wallpaper(st, 0, 0, Wd, H) + T(24, 46, name, 26, 900, W.fg(st), ls=-0.4) + "".join(body), W.wall_defs(Wd) + st.defs(Wd, H))

def home_set(st):
    w4, h2 = W.size(4, 2)
    w2, h2s = W.size(2, 2)
    return (widget(st, "fuer", 16, 52, w4, h2) + widget(st, "wetter", 16, 228, w2, h2s) + widget(st, "jetzt", 201, 228, w2, h2s)
            + widget(st, "wetter", 16, 404, *W.size(4, 3)))

def p_designs(theme):
    Wd = 3 * 390 + 2 * 32 + 48
    H = 40 + 844 + 24
    out = []
    for i, d in enumerate(["soft", "glas", "klar"]):
        st = W.style(d, theme)
        ox = 24 + i * (390 + 32)
        out.append(T(ox + 4, 28, {"soft": "Soft", "glas": "Glas", "klar": "Klar"}[d], 18, 900, st.c["ink"]) + W.phone(st, ox, home_set(st)))
    return g.svg(Wd, H, W.style("soft", theme).c, "".join(out), W.wall_defs(390) + W.style("glas", theme).defs(390, 844))

ALL_KINDS = W39.ALL_KINDS + KINDS

def p_config(theme="hell"):
    st = W.style("soft", theme)
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, CLOSE), eyebrow(66, 33, "Widget · 4 × 2", c), title(66, 65, "Einstellen", c)]
    y = 92
    pw, ph = W.size(4, 2)
    b.append(W.wallpaper(st, x, y, w, ph * 0.9 + 32, clip=("pv", st.rc)))
    b.append(f'<g transform="translate({x + 16} {y + 16}) scale({(w - 32) / pw})">{widget(st, "fuer", 0, 0, pw, ph)}</g>')
    y += ph * 0.9 + 32 + 30
    b.append(label(x, y, "Inhalt", c)); y += 12
    ch_, _ = W.chips(st, x, y, w, ALL_KINDS, "fuer"); b.append(ch_)
    rows = (len(ALL_KINDS) + 2) // 3
    y += rows * 64 + (rows - 1) * 8 + 30
    b.append(label(x, y, "Zeigen", c)); y += 12
    rws = [("Wetter", True), ("Was mitnehmen", True), ("Hausaufgaben", True), ("Tests", True), ("Änderungen", True)]
    b.append(st.card(x, y, w, 54 * len(rws)))
    for i, (t, on) in enumerate(rws): b.append(p30.switch_row(st, x, y + i * 54, w, t, on, i == 0))
    y += 54 * len(rws) + 24
    b.append(st.card(x, y, w, 108) + T(x + 14, y + 34.5, "Losgehen vorher", 14.5, 500, c["ink"]) + stepper(st, x + w - 150, y + 8, "45 min")
             + p30.switch_row(st, x, y + 54, w, "Nur meine Kurse", True))
    y += 108 + 30
    H = y + 92
    b.append(R(0, H - 92, 390, 92, 0, c["paper"]) + HL(0, 390, H - 92, c) + st.button(18, H - 76, 354, "Fertig", "primary", CHECK))
    return g.svg(390, H, c, "".join(b), W.wall_defs(390))

# ════════════════ ПК ════════════════
PC_ITEMS = [("fuer", 0, 0, 2, 2), ("tests", 2, 0, 1, 1), ("aufgaben", 3, 0, 1, 1), ("heute", 2, 1, 2, 2),
            ("woche", 0, 2, 2, 2), ("wetter", 2, 3, 1, 1), ("ferien", 3, 3, 1, 1)]

def pc_start(st):
    c = st.c
    b = [p30.pc_side(st), eyebrow(284, 39, "Mittwoch · 17. September", c), title(284, 80, "Start", c, 38)]
    b.append(st.button(1250, 40, 154, "Anpassen", "sand", SLIDERS, h=46))
    b.append(p30.grid(st, PC_ITEMS, 284, 110, 268, 150, 16))
    return st.page(1440, 900, "".join(b))

def pc_woche(st):
    """ПК-неделя: под датой в шапке колонки — погода; справа шторка «Wetter» не нужна — ПК показывает часы в «Tag»."""
    c = st.c
    b = [p30.pc_side(st, "Woche"), eyebrow(284, 39, "KW 38 · 15.–19. Sept", c), title(284, 80, "Diese Woche", c, 38)]
    b.append(DOT(290, 112, 5, c["ok"]) + T(302, 116.5, S("Live", 800, c["ok"]) + S(" · geprüft vor 20 Sek.", 400, c["muted"]), 13, 400, c["muted"], raw=True))
    x0, cw, gap = 340, 206, 12
    for i, (wd, d, stand, icon, temp) in enumerate(WEEKWX):
        x = x0 + i * (cw + gap)
        sel = i == 2
        if sel: b.append(R(x, 136, cw, 64, st.rz, c["accent"]))
        fg = c["on"] if sel else c["ink"]
        b.append(T(x + 16, 162, wd, 11, 800, c["on"] if sel else c["faint"], ls=0.8) + T(x + 16, 188, d, 22, 900, fg))
        b.append(f'<g opacity="{0.75 if sel else 1}">' + ICON(x + 50, 177, 0.42, c["on"] if sel else c["faint"], REFRESH, 2.4) + T(x + 62, 187, stand, 10.5, 600, c["on"] if sel else c["faint"]) + '</g>')
        b.append(ICON(x + cw - 72, 154, 0.92, c["on"] if sel else c["muted"], icon, 2) + T(x + cw - 16, 174, f"{temp}°", 16, 900, fg, "end"))
    for r in range(6):
        y = 214 + r * 104
        b.append(T(304, y + 46, str(r + 1), 15, 800, c["ink"], "middle") + T(304, y + 64, p30.TIMES[r][0], 10.5, 400, c["faint"], "middle"))
        for i in range(5):
            code = p30.WEEK[i][r]
            x = x0 + i * (cw + gap)
            aus = (i, r) == (2, 2)
            b.append(st.cell(x, y, cw, 96, code, state="aus" if aus else None))
            if not code: continue
            col = c["danger"] if aus else st.ctext(code)
            b.append(T(x + 14, y + 30, struck(g.NAMES[code]) if aus else g.NAMES[code], 15, 900, col, raw=True))
            b.append(T(x + 14, y + 52, "fällt aus" if aus else f"{p30.TEACH[code]} · {p30.ROOM[code]}", 12.5, 600 if not aus else 800, col))
    return st.page(1440, 900, "".join(b))

# ════════════════ Einstellungen «Für dich jetzt» — всё личное (пожелание владельца 26.11.) ════════════════
def step_row(st, x, y, w, text, value, icon=None, first=False, sw=128):
    """Строка «название — [− значение +]». Минимум у правил погоды — «Aus»."""
    c = st.c
    out = ("" if first else HL(x + 14, x + w - 14, y, c))
    tx = x + 14
    if icon: out += ICON(x + 14, y + 17, 0.83, c["muted"], icon, 2); tx = x + 46
    return out + T(tx, y + 34.5, text, 14.5, 500, c["ink"]) + stepper(st, x + w - 14 - sw, y + 8, value, w=sw)

def link_row(st, x, y, w, text, right, first=False):
    c = st.c
    return (("" if first else HL(x + 14, x + w - 14, y, c)) + T(x + 14, y + 34.5, text, 14.5, 500, c["ink"])
            + T(x + w - 36, y + 34, right, 13, 400, c["faint"], "end") + ICON(x + w - 30, y + 19, 0.67, c["faint2"], CHEV_R))

def p_settings(st):
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Mehr", c), title(66, 65, "Für dich jetzt", c)]
    y = 112
    b.append(label(x, y, "Losgehen", c)); y += 12
    b.append(st.card(x, y, w, 108) + step_row(st, x, y, w, "Vor der 1. Stunde", "45 min", first=True)
             + step_row(st, x, y + 54, w, "Abends schon morgen", "ab 17:00")); y += 108 + 28
    b.append(label(x, y, "Zeigen", c)); y += 12
    rows = [("Wetter", True), ("Was mitnehmen", True), ("Hausaufgaben", True), ("Tests", True), ("Änderungen", True), ("Termine", False), ("Nur meine Kurse", True)]
    b.append(st.card(x, y, w, 54 * len(rows)))
    for i, (t, on) in enumerate(rows): b.append(p30.switch_row(st, x, y + i * 54, w, t, on, i == 0))
    y += 54 * len(rows) + 28
    b.append(label(x, y, "Wetter-Tipps", c)); y += 12
    tips = [("Regenjacke", UMBRELLA, "ab 50 %"), ("Jacke", SHIRT, "unter 12°"), ("Mütze & Schal", SNOWF, "unter 3°"), ("Sonnencreme", SUN, "Aus")]
    b.append(st.card(x, y, w, 54 * len(tips)))
    for i, (t, ic, v) in enumerate(tips): b.append(step_row(st, x, y + i * 54, w, t, v, ic, i == 0, sw=140))
    y += 54 * len(tips) + 28
    b.append(label(x, y, "Mitnehmen", c)); y += 12
    b.append(st.card(x, y, w, 108) + link_row(st, x, y, w, "Pro Fach", "4 Fächer", True)
             + p30.switch_row(st, x, y + 54, w, "Am Testtag erinnern", True)); y += 108 + 28
    return st.page(390, y + 10, "".join(b))

SNOWF = P("M12 2v20M4.9 7l14.2 10M4.9 17l14.2-10M9 4l3 3 3-3M9 20l3-3 3 3")

MITNEHMEN = [("Sp", "Sport", ["Sportsachen", "Duschzeug"]), ("Ku", "Kunst", ["Malkasten"]), ("Ma", "Mathe", ["Taschenrechner", "Geodreieck"]),
             ("En", "Englisch", ["Wörterbuch"]), ("De", "Deutsch", []), ("Ph", "Physik", []), ("Ge", "Geschichte", [])]

def item_chip(st, x, y, text, h=32):
    c = st.c
    w = tw(text, 13) + 44
    return (R(x, y, w, h, h / 2, c["sand"]) + T(x + 13, y + h / 2 + 4.7, text, 13, 800, c["ink"])
            + ICON(x + w - 25, y + h / 2 - 6.5, 0.54, c["faint"], CLOSE, 2.4)), w

def add_chip(st, x, y, h=32, text="Hinzufügen"):
    c = st.c
    w = tw(text, 13) + 40
    return (R(x + .75, y + .75, w - 1.5, h - 1.5, h / 2, "none", c["rule"], 1.5, ' stroke-dasharray="4 3"')
            + ICON(x + 11, y + h / 2 - 7, 0.58, c["accink"], PLUS, 2.4) + T(x + 30, y + h / 2 + 4.7, text, 13, 800, c["accink"])), w

def p_mitnehmen(st, adding=False):
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Für dich jetzt", c), title(66, 65, "Mitnehmen", c)]
    y = 100
    for code, name, items in MITNEHMEN:
        chips_, cx, cy = [], x + 14, 52
        for it in items + [None]:   # плашки переносятся на новую строку, а не вылезают за край
            s, cw_ = item_chip(st, 0, 0, it) if it else add_chip(st, 0, 0, text="Hinzufügen" if not items else "Neu")
            if cx + cw_ > x + w - 14: cx, cy = x + 14, cy + 40
            chips_.append(f'<g transform="translate({cx} {y + cy})">{s}</g>'); cx += cw_ + 8
        hh = cy + 52
        b.append(st.card(x, y, w, hh) + DOT(x + 20, y + 26, 5, st.sub[code][0]) + T(x + 34, y + 31, name, 15, 800, c["ink"]) + "".join(chips_))
        y += hh + 12
        if y > 700: break
    if adding:   # Шторка «Neu bei Kunst»: поле и готовые подсказки
        top = 470
        b.append(p30.sheet(st, top, "Kunst", "Mitnehmen"))
        b.append(field(st, x, top + 98, w, "Zeichenblock", focus=True))
        yy = top + 172
        b.append(label(x, yy, "Oft gebraucht", c)); yy += 12
        cx = x
        for t in ["Pinsel", "Schere", "Kleber"]:
            s2, cw_ = add_chip(st, cx, yy, text=t); b.append(s2); cx += cw_ + 8
        b.append(st.button(x, yy + 56, w, "Hinzufügen", "primary", PLUS))
    return st.page(390, 844, "".join(b))

def pc_settings(st):
    """ПК: настройки слева, справа «Mitnehmen pro Fach» — одна страница."""
    c = st.c
    s1 = strip(p_settings(st))
    s2 = strip(p_mitnehmen(st))
    b = [p30.pc_side(st, "Start")]
    b.append(eyebrow(284, 39, "Mehr", c) + title(284, 80, "Für dich jetzt", c, 38))
    b.append(f'<g transform="translate(266 20) scale(0.84)">{s1.split(title(66, 65, "Für dich jetzt", c), 1)[1]}</g>')
    b.append(f'<g transform="translate(830 20) scale(1)">{s2.split(title(66, 65, "Mitnehmen", c), 1)[1]}</g>')
    b.append(label(848, 108, "Mitnehmen pro Fach", c))
    return st.page(1440, 900, "".join(b))

# ════════════════ Список экранов ════════════════
def soft(fn): return lambda th: fn(W.style("soft", th))

SCREENS = {
    "handy-01-start": (soft(p_start), ("hell", "dunkel")),
    "handy-02-tageszeiten": (soft(p_zeiten), ("hell", "dunkel")),
    "handy-03-block-einstellen": (soft(p_block), ("hell",)),
    "handy-04-woche": (soft(p_woche), ("hell", "dunkel")),
    "handy-05-tag": (soft(p_tag), ("hell", "dunkel")),
    "handy-06-wetter": (soft(p_wetter), ("hell", "dunkel")),
    "handy-07-admin-ort": (soft(p_admin), ("hell", "dunkel")),
    "handy-08-zustaende": (soft(p_zustaende), ("hell",)),
    "handy-09-widget-fuer-dich": ((lambda th: p_sizes("fuer", "Für dich jetzt", KINDS[0][3], th)), ("hell",)),
    "handy-10-widget-wetter": ((lambda th: p_sizes("wetter", "Wetter", KINDS[1][3], th)), ("hell",)),
    "handy-11-widget-designs": (p_designs, ("hell", "dunkel")),
    "handy-12-widget-einstellen": (p_config, ("hell",)),
    "pc-01-start": (soft(pc_start), ("hell", "dunkel")),
    "pc-02-woche": (soft(pc_woche), ("hell",)),
    "handy-13-einstellungen": (soft(p_settings), ("hell", "dunkel")),
    "handy-14-mitnehmen": (soft(p_mitnehmen), ("hell", "dunkel")),
    "handy-15-mitnehmen-neu": (soft(lambda st: p_mitnehmen(st, True)), ("hell",)),
    "pc-03-einstellungen": (soft(pc_settings), ("hell",)),
}

if __name__ == "__main__":
    n = 0
    only = sys.argv[2] if len(sys.argv) > 2 else None
    for name, (fn, themes) in SCREENS.items():
        if only and only not in name: continue
        for th in themes:
            open(os.path.join(OUT, f"{name}-{th}.svg"), "w", encoding="utf-8").write(fn(th))
            n += 1
    print(n, "files")
