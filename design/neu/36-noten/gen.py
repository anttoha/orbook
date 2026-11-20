# Макеты части 36 «Noten» (оценки и пропуски из cevex Home.InfoPoint):
#   • вход в InfoPoint своим логином (и ошибка);
#   • «Noten»: средний балл, пропуски, предметы со средним и последними оценками; полугодие / Zeugnis;
#   • предмет: все оценки с весом, «Notenrechner» — что нужно на следующей работе;
#   • «Fehlzeiten»; блок «Noten» на Start; загрузка, InfoPoint недоступен, «слишком часто», выход;
#   • ПК: список предметов слева, выбранный предмет справа.
# Кирпичики: части 30 (St, карточки, шторки) и 35 (нижняя панель с группой «Leistung», боковое меню).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g35", os.path.join(HERE, "..", "35-untere-leiste", "gen.py"))
L = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(L)
m, g = L.m, L.g
T, S, R, ICON, P, HL, DOT = g.T, g.S, g.R, g.ICON, g.P, m.HL, m.DOT
St, eyebrow, title, label = m.St, m.eyebrow, m.title, m.label
NOTEN, FEHLZ, FLAG, CHEV_R, BACK, MINUS, PLUS, KEY, USER = L.NOTEN, L.FEHLZ, m.FLAG, m.CHEV_R, m.BACK, m.MINUS, m.PLUS, g.KEY, g.USER
REFRESH = P("M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5")
CALC = '<rect x="5" y="3" width="14" height="18" rx="2.5"/>' + P("M8.5 7h7M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18h.01M12 18h.01M15.5 18h.01")
EYE = P("M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z") + '<circle cx="12" cy="12" r="3"/>'
ALERT = '<circle cx="12" cy="12" r="9"/>' + P("M12 8v5M12 16.5v.01")
LOGOUT = P("M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4")
NAMES = g.NAMES

# ════════════════ Данные (1. Halbjahr, сегодня — среда 17.09.) ════════════════
# (день, месяц, д.н., что, вес, оценка) — новые сверху. «3+» = 2,7, «2-» = 2,3.
GR = {
    "Ma": [("16", "09", "DI", "Klassenarbeit 1", 2, "3+"), ("10", "09", "MI", "Test · Brüche", 1, "2"), ("03", "09", "MI", "Mündlich", 1, "1"), ("27", "08", "MI", "Hausaufgabe", 1, "2-")],
    "De": [("12", "09", "FR", "Aufsatz", 2, "2"), ("01", "09", "MO", "Mündlich", 1, "2+")],
    "En": [("15", "09", "MO", "Vokabeltest", 1, "1-"), ("05", "09", "FR", "Mündlich", 1, "2")],
    "Ph": [("11", "09", "DO", "Test · Kräfte", 1, "3"), ("28", "08", "DO", "Mündlich", 1, "2-")],
    "Ge": [("09", "09", "DI", "Referat", 1, "1")],
    "Bio": [("04", "09", "DO", "Test · Zelle", 1, "4-"), ("26", "08", "DI", "Mündlich", 1, "3")],
    "Ku": [("08", "09", "MO", "Zeichnung", 1, "2")],
}
ORDER = ["Ma", "De", "En", "Ph", "Ge", "Bio", "Ku"]
NEW = {"Ma"}   # оценка, которую ещё не видели

def val(z): return float(z[0]) + (-0.3 if z.endswith("+") else 0.3 if z.endswith("-") else 0)
def avg(code):
    rows = GR[code]
    return sum(val(z) * w for *_, w, z in rows) / sum(w for *_, w, z in rows)
def fmt(v): return f"{v:.1f}".replace(".", ",")
ALL = sum(avg(c) for c in ORDER) / len(ORDER)
COUNT = sum(len(v) for v in GR.values())

def gcol(st, v):
    """Цвет оценки: до 2,5 — зелёная, после 3,5 — красная, между — нейтральная."""
    c = st.c
    if v <= 2.5: return c["oktint"], c["ok"]
    if v > 3.5: return c["dtint"], c["danger"]
    return c["sand"], c["ink"]

def pill(st, x, y, text, v, w=52, h=34, size=16):
    bg, fg = gcol(st, v)
    return R(x, y, w, h, 12, bg) + T(x + w / 2, y + h / 2 + size * 0.36, text, size, 900, fg, "middle")

def subj_cell(st, x, y, code, size=40):
    return st.cell(x, y, size, size, code, r=12) + T(x + size / 2, y + size / 2 + 4.5, code, 12.5 if len(code) < 3 else 11, 900, st.ctext(code), "middle")

def date_tile(st, x, y, day, mon):
    c = st.c
    mn = {"08": "AUG", "09": "SEP"}[mon]
    return R(x, y, 40, 40, 12, c["sand"]) + T(x + 20, y + 20, day, 14, 900, c["ink"], "middle") + T(x + 20, y + 32, mn, 8, 800, c["faint"], "middle", 0.4)

def bar(st, y=764, here="noten"):
    # оценка ширины текста в панели части 35 мерилась на «Tests»; для «Noten» чуть шире, иначе стрелка залезает на слово
    est = m.est
    m.est = lambda t, size: est(t, size) * 1.25
    try: return L.bar(st, L.TABS, 2, y=y, here=here)
    finally: m.est = est

def head(st, eb="Leistung", ttl="Noten", refresh=True):
    c = st.c
    return eyebrow(18, 33, eb, c) + title(18, 65, ttl, c) + (st.rbtn(334, 33.31, REFRESH) if refresh else "")

def stand(st, y, text="Stand 16.09. · geholt 07:41", x=18):
    c = st.c
    return DOT(x + 4, y - 4, 4, c["ok"]) + T(x + 14, y, text, 12, 400, c["faint"])

def tiles(st, x, y, w):
    """Две плитки: средний балл и пропуски (нажал — Fehlzeiten)."""
    c = st.c
    tw = (w - 12) / 2
    out = [st.card(x, y, tw, 104), m.bhead(st, x, y, "Schnitt", NOTEN, True),
           T(x + 14, y + 72, fmt(ALL), 34, 900, c["ink"], ls=-0.5), T(x + 14, y + 92, f"{COUNT} Noten · {len(ORDER)} Fächer", 12, 400, c["faint"])]
    x2 = x + tw + 12
    out += [st.card(x2, y, tw, 104), m.bhead(st, x2, y, "Fehlzeiten", FEHLZ), ICON(x2 + tw - 28, y + 12, 0.62, c["faint2"], CHEV_R, 2.2),
            T(x2 + 14, y + 72, "2", 34, 900, c["ink"], ls=-0.5) + T(x2 + 44, y + 71, "Tage", 15, 700, c["muted"]),
            T(x2 + 14, y + 92, S("16 Std. · ", 400, c["faint"]) + S("1 unentsch.", 700, c["danger"]), 12, 400, c["faint"], raw=True)]
    return "".join(out)

def subj_rows(st, x, y, w, sel=None, rh=62):
    c = st.c
    out = [st.card(x, y, w, rh * len(ORDER))]
    for i, code in enumerate(ORDER):
        ry = y + i * rh
        if code == sel: out.append(R(x + 6, ry + 4, w - 12, rh - 8, 16, c["tint"]))
        elif i: out.append(HL(x + 14, x + w - 14, ry, c))
        out.append(subj_cell(st, x + 14, ry + 11, code))
        name = NAMES[code]
        out.append(T(x + 66, ry + 28, name, 14.5, 800, c["ink"]))
        if code in NEW:
            nx = x + 66 + g.tw(name, 14.5, 800) * 1.08 + 8
            out.append(R(nx, ry + 15, 34, 18, 9, c["accent"]) + T(nx + 17, ry + 28, "neu", 10.5, 800, c["on"], "middle"))
        out.append(T(x + 66, ry + 47, "  ·  ".join(z for *_, z in GR[code]), 12.5, 700, c["muted"]))
        out.append(pill(st, x + w - 66, ry + 14, fmt(avg(code)), avg(code)))
    return "".join(out), y + rh * len(ORDER)

def account(st, x, y, w):
    c = st.c
    return (label(x, y, "InfoPoint", c) + st.card(x, y + 12, w, 58) + ICON(x + 14, y + 31.5, 0.79, c["muted"], USER, 1.9)
            + T(x + 45, y + 46.5, "anna.mueller", 14.5, 500, c["ink"]) + T(x + w - 16, y + 46.5, "Abmelden", 13.5, 800, c["danger"], "end"))

# ════════════════ Телефон ════════════════
# 01 · Noten — обзор (длинная страница: внизу вход в InfoPoint и «Abmelden»)
def p_noten(st, state=None):
    """state: None | 'offline' (InfoPoint не отвечает) | 'oft' (обновляли только что — тост)."""
    c = st.c
    x, w = 18, 354
    b = [head(st), st.seg(x, 96, w, ["1. Halbjahr", "2. Halbjahr", "Zeugnis"], 0)]
    y = 150
    if state == "offline":
        b.append(R(x, 144, w, 66, 18, c["dtint"]) + ICON(x + 14, 163, 0.92, c["danger"], ALERT, 2)
                 + T(x + 50, 171, "InfoPoint nicht erreichbar", 14, 800, c["ink"]) + T(x + 50, 190, "Stand vom 16.09.", 12, 400, c["muted"])
                 + st.button(x + w - 104, 160, 90, "Nochmal", "sand", h=34))
        y = 226
    else:
        b.append(stand(st, y)); y += 16
    b.append(tiles(st, x, y, w)); y += 104 + 30
    b.append(label(x, y, "Fächer", c)); y += 12
    rows, y = subj_rows(st, x, y, w); b.append(rows); y += 30
    b.append(account(st, x, y, w)); y += 70 + 24 + 80
    H = y
    if state == "oft":
        b.append(R(18, H - 140, 354, 46, 16, c["toastbg"]) + ICON(32, H - 125, 0.67, c["toastfg"], ALERT)
                 + T(58, H - 112, "Gerade geholt – wieder in 4 Min.", 13.5, 600, c["toastfg"]))
    b.append(bar(st, H - 80))
    return st.page(390, H, "".join(b))

# 02 · Предмет
def fach(st, x, y, w, code="Ma", rh=64, pc=False):
    c = st.c
    solid, tint, text = st.sub[code]
    v = avg(code)
    rows = GR[code]
    out = [R(x, y, w, 112, st.rc, tint), T(x + 18, y + 30, "SCHNITT", 10.5, 800, text, ls=0.5), T(x + 18, y + 80, fmt(v), 42, 900, text, ls=-0.6),
           T(x + w - 18, y + 52, f"{len(rows)} Noten", 14, 800, text, "end"), T(x + w - 18, y + 72, "Klassenarbeit zählt ×2", 12, 400, text, "end")]
    y += 112 + 14
    if not pc:
        out.append(st.button(x, y, w, "Notenrechner", "sand", CALC, h=46)); y += 46 + 30
    else: y += 16
    out.append(label(x, y, "Noten", c)); y += 12
    out.append(st.card(x, y, w, rh * len(rows)))
    for i, (d, mo, wd, what, wt, z) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HL(x + 14, x + w - 14, ry, c))
        out.append(date_tile(st, x + 14, ry + 12, d, mo))
        out.append(T(x + 66, ry + 29, what, 14.5, 800, c["ink"]))
        sub = f"{wd.capitalize()} {d}.{mo}." + (f" · zählt ×{wt}" if wt > 1 else "")
        out.append(T(x + 66, ry + 47, sub, 12, 400, c["faint"]))
        if i == 0 and code in NEW:
            out.append(R(x + w - 112, ry + 23, 34, 18, 9, c["accent"]) + T(x + w - 95, ry + 36, "neu", 10.5, 800, c["on"], "middle"))
        out.append(pill(st, x + w - 66, ry + 15, z, val(z), w=50))
    y += rh * len(rows)
    return "".join(out), y

def p_fach(st):
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Noten · 1. Halbjahr", c), title(66, 65, "Mathe", c)]
    body, y = fach(st, x, 96, w); b.append(body); y += 18
    b.append(st.card(x, y, w, 58) + m.link_row(st, x, y, w, FLAG, "Nächster Test", "Fr 19.09.", True))
    b.append(bar(st))
    return st.page(390, 844, "".join(b))

# 03 · Notenrechner (шторка над предметом)
def stepper(st, x, y, text):
    c = st.c
    return (R(x, y, 36, 36, 18, c["sand"]) + ICON(x + 9, y + 9, 0.75, c["ink"], MINUS, 2.4) + T(x + 66, y + 24, text, 17, 900, c["ink"], "middle")
            + R(x + 96, y, 36, 36, 18, c["sand"]) + ICON(x + 105, y + 9, 0.75, c["ink"], PLUS, 2.4))

def rechner(st, x, y, w, small=False):
    """Карточка с настройками и результат. Mathe сейчас 2,14; цель 2,0, следующая весит ×2 → нужно ≤ 1,65."""
    c = st.c
    out = [st.card(x, y, w, 116), m.set_row(st, x, y, w, "Mein Ziel", stepper(st, x + w - 14 - 132, y + 11, "2,0"), True),
           m.set_row(st, x, y + 58, w, "Nächste Note zählt", st.seg(x + w - 14 - 120, y + 69, 120, ["×1", "×2"], 1))]
    y += 116 + 14
    out.append(R(x, y, w, 110, st.rc, c["tint"]) + T(x + 18, y + 30, "DU BRAUCHST", 10.5, 800, c["accink"], ls=0.5)
               + T(x + 18, y + 74, "1,6", 40, 900, c["accink"], ls=-0.6) + T(x + 100, y + 73, "oder besser", 15, 700, c["ink"])
               + T(x + 18, y + 96, "Dann steht Mathe auf 2,0.", 12.5, 400, c["muted"]))
    return "".join(out), y + 110

def p_rechner(st):
    s = p_fach(st)
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    top = 372
    b = [inner, m.sheet(st, top, "Mathe · jetzt 2,1", "Notenrechner")]
    body, _ = rechner(st, 18, top + 98, 354); b.append(body)
    return st.page(390, 844, "".join(b))

# 04 · Вход в InfoPoint (и 05 — неверный пароль)
def p_login(st, wrong=False):
    c = st.c
    x, w = 18, 354
    b = [head(st, refresh=False)]
    b.append(st.card(x, 96, w, 74) + DOT(x + 37, 133, 20, c["tint"]) + ICON(x + 27.5, 123.5, 0.79, c["accink"], NOTEN, 2)
             + T(x + 70, 128, "Home.InfoPoint", 16, 800, c["ink"]) + T(x + 70, 148, "Petrischule", 12.5, 400, c["faint"]))
    y = 200
    b.append(label(x, y, "Benutzername", c) + R(x, y + 12, w, 50, 16, c["field"], c["rule"]) + T(x + 16, y + 43, "anna.mueller", 15.5, 600, c["ink"]))
    y += 12 + 50 + 26
    b.append(label(x, y, "Passwort", c))
    b.append(R(x, y + 12, w, 50, 16, c["field"], c["danger"] if wrong else c["rule"], 2 if wrong else 1)
             + T(x + 16, y + 44, "••••••••••", 17, 700, c["ink"], ls=1) + ICON(x + w - 40, y + 25, 0.92, c["faint"], EYE, 1.9))
    y += 62
    if wrong:
        b.append(T(x + 2, y + 20, "Benutzername oder Passwort falsch", 12.5, 600, c["danger"])); y += 30
    y += 18
    b.append(st.card(x, y, w, 58) + m.switch_row(st, x, y, w, "Angemeldet bleiben", True, True)); y += 58 + 18
    b.append(st.button(x, y, w, "Anmelden", "primary", KEY))
    b.append(bar(st))
    return st.page(390, 844, "".join(b))

# 06 · Загрузка
def p_laden(st):
    c = st.c
    x, w = 18, 354
    k = c["skel"]
    b = [head(st), st.seg(x, 96, w, ["1. Halbjahr", "2. Halbjahr", "Zeugnis"], 0), R(x, 142, 150, 10, 5, k)]
    tw = (w - 12) / 2
    for i in range(2):
        tx = x + i * (tw + 12)
        b.append(st.card(tx, 166, tw, 104) + R(tx + 14, 182, 70, 10, 5, k) + R(tx + 14, 212, 60, 28, 10, k) + R(tx + 14, 250, 100, 9, 4.5, k))
    y = 312
    b.append(R(x, y - 10, 50, 10, 5, k) + st.card(x, y + 4, w, 62 * 6))
    for i in range(6):
        ry = y + 4 + i * 62
        if i: b.append(HL(x + 14, x + w - 14, ry, c))
        b.append(R(x + 14, ry + 11, 40, 40, 12, k) + R(x + 66, ry + 17, 90 + (i % 3) * 18, 11, 5.5, k) + R(x + 66, ry + 37, 70, 9, 4.5, k) + R(x + w - 66, ry + 14, 52, 34, 12, k))
    b.append(bar(st))
    return st.page(390, 844, "".join(b))

# 09 · Fehlzeiten
FZ = [("15", "09", "MO", "Ganzer Tag", "6 Std.", True), ("11", "09", "DO", "3 Stunden", "1.–3. Stunde", True),
      ("02", "09", "DI", "1 Stunde", "5. Stunde", False), ("25", "08", "MO", "Ganzer Tag", "6 Std.", True)]

def p_fehlzeiten(st):
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Noten", c), title(66, 65, "Fehlzeiten", c)]
    b.append(st.seg(x, 96, w, ["1. Halbjahr", "2. Halbjahr"], 0) + stand(st, 150))
    tw = (w - 16) / 3
    for i, (n, cap, bad) in enumerate([("2", "Fehltage", False), ("16", "Fehlstunden", False), ("1", "unentschuldigt", True)]):
        tx = x + i * (tw + 8)
        b.append(st.card(tx, 166, tw, 88) + T(tx + 12, 214, n, 30, 900, c["danger"] if bad else c["ink"], ls=-0.5) + T(tx + 12, 238, cap, 11, 700, c["muted"]))
    y = 290
    b.append(label(x, y, "Einträge", c)); y += 12
    b.append(st.card(x, y, w, 64 * len(FZ)))
    for i, (d, mo, wd, what, sub, ok) in enumerate(FZ):
        ry = y + i * 64
        if i: b.append(HL(x + 14, x + w - 14, ry, c))
        b.append(date_tile(st, x + 14, ry + 12, d, mo) + T(x + 66, ry + 29, what, 14.5, 800, c["ink"]) + T(x + 66, ry + 47, f"{wd.capitalize()} {d}.{mo}. · {sub}", 12, 400, c["faint"]))
        txt = "entschuldigt" if ok else "unentschuldigt"
        pw = g.tw(txt, 11.5, 800) * 0.9 + 18
        b.append(R(x + w - 14 - pw, ry + 21, pw, 22, 11, c["oktint"] if ok else c["dtint"]) + T(x + w - 14 - pw / 2, ry + 36, txt, 11.5, 800, c["ok"] if ok else c["danger"], "middle"))
    b.append(bar(st))
    return st.page(390, 844, "".join(b))

# 10 · Start с блоком «Noten»
def b_noten(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 2
    return (m.bhead(st, x, y, "Noten", NOTEN) + T(x + 14, y + 62 + e, fmt(ALL), 30, 900, c["ink"], ls=-0.5) + T(x + 70, y + 60 + e, "Schnitt", 13, 600, c["muted"])
            + T(x + 14, y + 85 + e, S("Neu: ", 800, c["accink"]) + S("Mathe 3+", 600, c["ink"]), 12.5, 600, c["ink"], raw=True)
            + T(x + 14, y + 103 + e, "Di 16.09.", 12, 400, c["faint"]))
m.DRAW["noten"] = b_noten

def p_start(st):
    keep = m.P_ITEMS
    m.P_ITEMS = [it if it[0] != "aenderungen" else ("noten",) + it[1:] for it in keep]
    s = m.p_start(st)
    m.P_ITEMS = keep
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    inner = inner[:inner.rindex('<rect x="16" y="764"')]
    return st.page(390, 844, inner + L.bar(st, L.TABS, 0))

# 11 · Abmelden — вопрос перед удалением
def p_abmelden(st):
    c = st.c
    s = p_noten(st)
    H = int(float(s.split('height="', 1)[1].split('"')[0]))
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    x, y, w = 32, 330, 326
    b = [inner, g.overlay(c, 390, H), R(x, y, w, 194, 26, c["card"]),
         DOT(x + 40, y + 42, 20, c["dtint"]) + ICON(x + 30.5, y + 32.5, 0.79, c["danger"], LOGOUT, 2),
         T(x + 72, y + 49, "Abmelden?", 19, 900, c["ink"]),
         T(x + 22, y + 92, "Login und geholte Noten", 14, 400, c["muted"]), T(x + 22, y + 112, "werden gelöscht.", 14, 400, c["muted"]),
         st.button(x + 18, y + 134, 136, "Abbrechen", "sand", h=44), st.button(x + 172, y + 134, 136, "Abmelden", "danger", h=44)]
    return st.page(390, H, "".join(b))

# ════════════════ ПК ════════════════
def pc_noten(st):
    c = st.c
    side, _ = L.pc_side_groups(st, active="Noten")
    b = [side, eyebrow(284, 39, "Leistung", c), title(284, 80, "Noten", c, 38)]
    b.append(st.seg(1060, 44, 300, ["1. Halbjahr", "2. Halbjahr", "Zeugnis"], 0) + st.rbtn(1378, 43, REFRESH, size=36))
    X, W = 284, 520
    b.append(stand(st, 104, x=X))
    b.append(tiles(st, X, 122, W))
    b.append(label(X, 258, "Fächer", c))
    rows, y = subj_rows(st, X, 270, W, sel="Ma"); b.append(rows)
    b.append(account(st, X, y + 26, W))
    # справа — выбранный предмет: оценки и Notenrechner рядом
    RX, RW = 828, 596
    b.append(T(RX, 104, "Mathe", 22, 900, c["ink"]) + T(RX + RW, 104, "Nächster Test · Fr 19.09.", 13, 700, c["accink"], "end"))
    body, y = fach(st, RX, 122, RW, pc=True); b.append(body)
    y += 30
    b.append(label(RX, y, "Notenrechner", c))
    body, _ = rechner(st, RX, y + 12, RW); b.append(body)
    return st.page(1440, 900, "".join(b))

SCREENS = {   # имя: (функция, темы)
    "handy-01-noten": (p_noten, ("hell", "dunkel")),
    "handy-02-fach": (p_fach, ("hell", "dunkel")),
    "handy-03-notenrechner": (p_rechner, ("hell", "dunkel")),
    "handy-04-anmelden": (p_login, ("hell", "dunkel")),
    "handy-05-anmelden-falsch": (lambda st: p_login(st, wrong=True), ("hell",)),
    "handy-06-laden": (p_laden, ("hell",)),
    "handy-07-nicht-erreichbar": (lambda st: p_noten(st, "offline"), ("hell",)),
    "handy-08-zu-oft": (lambda st: p_noten(st, "oft"), ("hell",)),
    "handy-09-fehlzeiten": (p_fehlzeiten, ("hell", "dunkel")),
    "handy-10-start": (p_start, ("hell",)),
    "handy-11-abmelden": (p_abmelden, ("hell",)),
    "pc-01-noten": (pc_noten, ("hell", "dunkel")),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(St("soft", theme)))
            n += 1
    print(n, "files")
