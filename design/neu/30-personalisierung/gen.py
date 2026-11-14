# Макеты части 30 «Personalisierung + Animationen»:
#   • «Start» — главный экран из блоков (перетаскивать, размер, добавить/убрать);
#   • оформления: Soft (как сейчас), Glas («Liquid Glass»), Klar (строгое, с рамками) + Akzentfarbe;
#   • «Stundenplan» — что показывать в клетке урока, цвета, неделя, день;
#   • переключатель «Animationen».
# Экраны рисуются с нуля, но теми же кирпичиками и токенами, что части 14–29 (помощники — из 29-klassen/gen.py).
# Оформление — объект St: он один знает, как выглядит карточка, клетка урока и кнопка в Soft / Glas / Klar.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g29", os.path.join(HERE, "..", "29-klassen", "gen.py"))
k = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(k)
g, m19, m22, m15 = k.g, k.m19, k.m22, k.m15
T, S, R, ICON, P, est, struck = g.T, g.S, g.R, g.ICON, g.P, k.est, k.struck
CHECK, CHEV_R, CHEV_D, BACK, CLOSE, PLUS, TRASH, SEARCH, DOTS_V = g.CHECK, g.CHEV_R, g.CHEV_D, g.BACK, g.CLOSE, g.PLUS, g.TRASH, g.SEARCH, g.DOTS_V
FLAG, REFRESH, WEEK_I, GRID, SLIDERS, HOME = m19.FLAG, m19.REFRESH, k.WEEK_I, k.GRID, k.SLIDERS, m22.I_HOME
FILE, FOLDER, BARS, CAL = m15.FILE, m15.FOLDER, m22.BARS, g.CAL
LIST = P("M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01")
LIST_CHECK = P("M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9")
CLOCK = '<circle cx="12" cy="12" r="9"/>' + P("M12 7v5l3 2")
SUN = '<circle cx="12" cy="12" r="4"/>' + P("M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4")
MOON = P("M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z")
MINUS = P("M5 12h14")
RESIZE = P("M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7")
SPARK = P("M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z")
GLOBE = '<circle cx="12" cy="12" r="9"/>' + P("M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18")
UNDO = P("M4 9h10a6 6 0 0 1 0 12H8M4 9l4-4M4 9l4 4")
NAMES, TEACH, ROOM, TIMES, WEEK = g.NAMES, m19.TEACH, m19.ROOM, m19.TIMES, m19.MUSTER
WD = ["MO", "DI", "MI", "DO", "FR"]
ACCENTS = [("Violett", "#6C4DF6", "#A58BFF"), ("Blau", "#4C82EC", "#6191EE"), ("Grün", "#3FB173", "#56BA84"),
           ("Orange", "#EE8A2C", "#F09845"), ("Pink", "#E4577A", "#E76B8A"), ("Grafit", "#4A4458", "#B5ACC1")]
# Фоны для «Glas»: (имя, три цвета для светлой темы, три для тёмной)
GLASS_BG = [("Aurora", ("#C9B8FF", "#FFC2D4", "#A9D4FF"), ("#5B3FE0", "#B03C82", "#1E7FA8")),
            ("Abendrot", ("#FFC6A8", "#FFB3C7", "#D9C2FF"), ("#C2542D", "#A8356B", "#4B34B8")),
            ("Meer", ("#A9E4EF", "#A9C8FF", "#C9F0DD"), ("#167A93", "#2B50B8", "#1F8A66")),
            ("Wald", ("#BFE8C6", "#E6EBB0", "#A9E0D8"), ("#1F7A4A", "#6E7A1F", "#167A72"))]


class St:
    """Оформление: палитра + как рисовать карточку, клетку урока, кнопку. style: soft | glas | klar."""
    def __init__(s, style, theme):
        s.style, s.theme, s.light = style, theme, theme == "hell"
        c = dict(g.LIGHT if s.light else g.DARK)
        if style == "klar":   # чистый фон, тонкие рамки, почти прямые углы, цвет предмета — полоской
            c.update(dict(paper="#FFFFFF", card="#FFFFFF", sand="#F1EFF4", hair="#E4E0EA", rule="#CFC9D8", skel="#ECEAF0", seg="#FFFFFF", field="#FFFFFF") if s.light else
                     dict(paper="#0F0E13", card="#0F0E13", sand="#211F29", hair="#2A2734", rule="#454052", skel="#1F1D27", seg="#3A3644", field="#0F0E13"))
        if style == "glas":   # полупрозрачные поверхности поверх цветного фона
            c.update(dict(paper="#F3EEFB", card="rgba(255,255,255,0.48)", sand="rgba(255,255,255,0.42)", hair="rgba(42,36,51,0.08)", rule="rgba(42,36,51,0.16)",
                          seg="rgba(255,255,255,0.9)", field="rgba(255,255,255,0.6)", skel="rgba(255,255,255,0.55)", tint="rgba(108,77,246,0.15)",
                          muted="#554D61", faint="#70687F", faint2="#A9A1B5", oktint="rgba(31,157,107,0.16)", dtint="rgba(214,69,93,0.15)") if s.light else
                     dict(paper="#120F1C", card="rgba(255,255,255,0.09)", sand="rgba(255,255,255,0.09)", hair="rgba(255,255,255,0.09)", rule="rgba(255,255,255,0.18)",
                          seg="rgba(255,255,255,0.22)", field="rgba(255,255,255,0.08)", skel="rgba(255,255,255,0.1)", tint="rgba(165,139,255,0.24)",
                          muted="#D2CADF", faint="#A9A1BA", faint2="#7C7490", oktint="rgba(95,211,162,0.18)", dtint="rgba(255,138,160,0.18)"))
        s.c = c
        s.sub = m22.with_sport(g.SUBJ[theme])
        s.rc = {"soft": 22, "glas": 24, "klar": 10}[style]   # радиус карточки
        s.rz = {"soft": 14, "glas": 14, "klar": 6}[style]    # радиус клетки урока
        s.edge = "rgba(255,255,255,0.85)" if s.light else "rgba(255,255,255,0.2)"

    def pill(s, h): return 10 if s.style == "klar" else h / 2

    def defs(s, w, h):
        if s.style != "glas": return ""
        o1, o2 = (0.55, 0.0) if s.light else (0.14, 0.0)
        return (f'<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="{o1}"/><stop offset="0.55" stop-color="#fff" stop-opacity="{o2}"/></linearGradient>'
                f'<filter id="blob" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="{70 if w < 800 else 120}"/></filter>'
                f'<filter id="gsh" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="{"#3B2A7A" if s.light else "#000"}" flood-opacity="{0.1 if s.light else 0.3}"/></filter>')

    def bg(s, w, h, which=0):
        """Фон страницы. Soft и Klar — ровный цвет (его красит svg()), Glas — цветные размытые пятна."""
        if s.style != "glas": return ""
        a, b, d = GLASS_BG[which][1 if s.light else 2]
        op = 0.9 if s.light else 0.62
        return (f'<g filter="url(#blob)" opacity="{op}"><circle cx="{w * 0.12}" cy="{h * 0.1}" r="{w * 0.42}" fill="{a}"/><circle cx="{w * 0.95}" cy="{h * 0.36}" r="{w * 0.4}" fill="{b}"/>'
                f'<circle cx="{w * 0.1}" cy="{h * 0.72}" r="{w * 0.42}" fill="{d}"/><circle cx="{w * 0.9}" cy="{h * 0.98}" r="{w * 0.36}" fill="{a}"/></g>')

    def card(s, x, y, w, h, r=None, lift=False):
        r = s.rc if r is None else (min(r, 10) if s.style == "klar" else r)
        c = s.c
        if s.style == "klar": return R(x + .75, y + .75, w - 1.5, h - 1.5, r, c["card"], c["rule"], 1.5)
        if s.style == "glas":
            sh = ' filter="url(#gsh)"' if lift else ""
            return R(x, y, w, h, r, c["card"], extra=sh) + R(x, y, w, h, r, "url(#sheen)") + R(x + .5, y + .5, w - 1, h - 1, r - .5, "none", s.edge)
        return R(x, y, w, h, r, c["card"])

    def cell(s, x, y, w, h, code, r=None, state=None):
        """Клетка урока. state: None | 'aus' (выпал) | 'leer'."""
        r = s.rz if r is None else r
        c = s.c
        if code is None or state == "leer":
            return f'<g opacity="0.6">{R(x, y, w, h, r, c["sand"])}</g>'
        if state == "aus":
            return R(x + .5, y + .5, w - 1, h - 1, r, c["dtint"], c["danger"], 1, ' stroke-dasharray="3 2"')
        solid, tint, _ = s.sub[code]
        if s.style == "klar":
            return R(x + .5, y + .5, w - 1, h - 1, r, c["card"], c["rule"]) + R(x + 3.5, y + 5, 3.5, h - 10, 1.75, solid)
        if s.style == "glas":
            return R(x, y, w, h, r, tint, extra=f' fill-opacity="{0.66 if s.light else 0.72}"') + R(x, y, w, h, r, "url(#sheen)") + R(x + .5, y + .5, w - 1, h - 1, r - .5, "none", s.edge)
        return R(x, y, w, h, r, tint)

    def ctext(s, code): return s.c["ink"] if s.style == "klar" else s.sub[code][2]
    def cpad(s): return 5 if s.style == "klar" else 0   # в Klar текст клетки сдвинут: слева полоска цвета

    def rbtn(s, x, y, icon, primary=False, size=38, fg=None):
        c = s.c
        kk = 0.71
        ic = ICON(x + size / 2 - 12 * kk, y + size / 2 - 12 * kk, kk, fg or (c["on"] if primary else c["ink"]), icon, 2)
        if primary: return R(x, y, size, size, s.pill(size), c["accent"]) + ic
        return s.card(x, y, size, size, size / 2) + ic

    def button(s, x, y, w, text, kind="primary", icon=None, h=48):
        c = s.c
        fill, fg = {"primary": (c["accent"], c["on"]), "sand": (c["sand"], c["ink"]), "danger": (c["dtint"], c["danger"])}[kind]
        tw_ = len(text) * 14.5 * 0.54
        x0 = x + (w - tw_ - (24 if icon else 0)) / 2
        out = R(x, y, w, h, s.pill(h), fill)
        if s.style == "glas" and kind == "primary": out += R(x, y, w, h, s.pill(h), "url(#sheen)")
        if s.style == "klar" and kind == "sand": out += R(x + .75, y + .75, w - 1.5, h - 1.5, 10, "none", c["rule"], 1.5)
        return out + (ICON(x0, y + h / 2 - 8, 0.67, fg, icon, 2.2) if icon else "") + T(x0 + (24 if icon else 0), y + h / 2 + 5, text, 14.5, 700, fg)

    def seg(s, x, y, w, opts, active, h=36, fs=12.5):
        c = s.c
        out = [R(x, y, w, h, s.pill(h), c["sand"])]
        part = (w - 6) / len(opts)
        for i, o in enumerate(opts):
            on = i == active
            if on: out.append(R(x + 3 + i * part, y + 3, part, h - 6, s.pill(h - 6) if s.style != "klar" else 8, c["seg"]))
            out.append(T(x + 3 + i * part + part / 2, y + h / 2 + 4.5, o, fs, 800, c["ink"] if on else c["muted"], "middle"))
        return "".join(out)

    def switch(s, x, y, on):
        c = s.c
        thumb = "#FFFFFF" if (s.light or s.style == "glas") else (c["thumb"] if on else "#B5ACC1")
        return R(x, y, 42, 24, 12, c["accent"] if on else c["soff"]) + R(x + (20 if on else 2), y + 2, 20, 20, 10, thumb)

    def page(s, w, h, body, which=0):
        return g.svg(w, h, s.c, s.bg(w, h, which) + body, s.defs(w, h))


def HL(x1, x2, y, c): return f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{c["hair"]}" stroke-width="1"/>'
def DOT(cx, cy, r, col): return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{col}"/>'
def eyebrow(x, y, t, c, accent=False): return T(x, y, t, 12.5, 800, c["accink"] if accent else c["faint"])
def title(x, y, t, c, size=29): return T(x, y, t, size, 900, c["ink"], ls=round(-size * 0.015, 2))
def label(x, y, t, c): return T(x, y, t, 12.5, 800, c["faint"])
def dots_icon(x, y, scale, col):
    return f'<g transform="translate({x} {y}) scale({scale})" fill="{col}"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></g>'

# ════════════════════════════ Нижнее меню телефона: Start · Woche · Tests · Mehr ════════════════════════════
TABS = [(HOME, "Start"), (WEEK_I, "Woche"), (FLAG, "Tests"), (None, "Mehr")]

def nav(st, active, y=764):
    c = st.c
    out = [st.card(16, y, 358, 58, 29 if st.style != "klar" else 14, lift=True)]
    if st.style == "soft": out.append(R(16.5, y + .5, 357, 57, 28.5, "none", c["hair"]))
    aw = 112
    ow = (358 - 14 - aw) / 3
    x = 23
    for i, (ic, name) in enumerate(TABS):
        w = aw if i == active else ow
        if i == active:
            out.append(R(x, y + 7, w, 44, st.pill(44), c["accent"]))
            if st.style == "glas": out.append(R(x, y + 7, w, 44, 22, "url(#sheen)"))
            tx = x + (w - (est(name, 13) * 1.15 + 26)) / 2
            out.append(ICON(tx, y + 20, 0.75, c["on"], ic, 2.2) if ic else dots_icon(tx, y + 20, 0.75, c["on"]))
            out.append(T(tx + 25, y + 33.5, name, 13, 800, c["on"]))
        else:
            out.append(ICON(x + w / 2 - 10, y + 19, 0.83, c["muted"], ic, 2) if ic else dots_icon(x + w / 2 - 10, y + 19, 0.83, c["muted"]))
        x += w
    return "".join(out)

# ════════════════════════════ Блоки «Start» ════════════════════════════
BLOCKS = [("jetzt", "Jetzt", "Aktuelle und nächste Stunde", CLOCK), ("heute", "Heute", "Alle Stunden des Tages", LIST),
          ("woche", "Woche", "Die ganze Woche im Kleinen", WEEK_I), ("tests", "Tests", "Was als Nächstes ansteht", FLAG),
          ("aufgaben", "Aufgaben", "Offene Hausaufgaben", LIST_CHECK), ("aenderungen", "Änderungen", "Ausfall und Vertretung", REFRESH),
          ("termine", "Termine", "Ferien, Elternabend, Ausflug", CAL), ("notizen", "Notizen", "Deine letzten Notizen", FILE),
          ("materialien", "Materialien", "Neue Links der Klasse", FOLDER), ("statistik", "Statistik", "Ausfall in dieser Woche", BARS),
          ("ferien", "Countdown", "Tage bis zu den Ferien", SUN)]
BINFO = {b[0]: b for b in BLOCKS}
TODAY = k.CLASSES[0]["day"]   # среда 17.09.: Ma — Vertretung, En — fällt aus

def bhead(st, x, y, text, icon, accent=False, right=None, w=0):
    c = st.c
    col = c["accink"] if accent else c["faint"]
    out = ICON(x + 14, y + 13.5, 0.58, col, icon, 2.2) + T(x + 34, y + 24.5, text.upper(), 10.5, 800, col, ls=0.5)
    if right: out += T(x + w - 14, y + 24.5, right, 12, 800, c["ink"], "end")
    return out

def b_jetzt(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 3
    out = [bhead(st, x, y, "Jetzt · 2. Stunde", CLOCK, True, "noch 18 min", w)]
    out.append(T(x + 14, y + 55 + e, "Mathe", 22, 900, c["ink"], ls=-0.3) + T(x + w - 14, y + 53 + e, "08:20–09:05", 12, 400, c["faint"], "end"))
    out.append(T(x + 14, y + 74 + e, S("Vertretung", 800, c["accink"]) + S(" · Kle · Raum 204", 400, c["muted"]), 12.5, 400, c["muted"], raw=True))
    by = y + 85 + e * 2
    out.append(R(x + 14, by, w - 28, 6, 3, c["sand"]) + R(x + 14, by, (w - 28) * 0.6, 6, 3, st.sub["Ma"][0]))
    out.append(DOT(x + 18, by + 20.5, 3.5, c["danger"]) + T(x + 28, by + 25, f'09:25 · {struck("Englisch")} fällt aus', 12, 700, c["danger"], raw=True)
               + T(x + w - 14, by + 25, "dann Physik · 10:30", 12, 400, c["faint"], "end"))
    return "".join(out)

def b_tests(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 2
    return (bhead(st, x, y, "Tests", FLAG) + DOT(x + 18, y + 45.5 + e, 4, st.sub["Ma"][0]) + T(x + 29, y + 50 + e, "Mathe", 15, 800, c["ink"])
            + T(x + 14, y + 68 + e, "Fr · in 2 Tagen", 12, 700, c["accink"]) + HL(x + 14, x + w - 14, y + 80.5 + e, c)
            + DOT(x + 18, y + 96.5 + e, 4, st.sub["Bio"][0]) + T(x + 29, y + 101 + e, "Bio", 13, 700, c["ink"]) + T(x + w - 14, y + 101 + e, "Do 25.9.", 12, 400, c["faint"], "end"))

def b_aufgaben(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 2
    return (bhead(st, x, y, "Aufgaben", LIST_CHECK) + T(x + 14, y + 62 + e, "3", 30, 900, c["ink"], ls=-0.5) + T(x + 36, y + 60 + e, "offen", 13, 600, c["muted"])
            + T(x + 14, y + 85 + e, "Mathe · S. 54, Nr. 3", 12.5, 600, c["ink"]) + T(x + 14, y + 103 + e, "bis morgen", 12, 700, c["accink"]))

def b_aend(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 2
    return (bhead(st, x, y, "Änderungen", REFRESH) + T(x + 14, y + 50 + e, f'{struck("Englisch")} fällt aus', 13, 800, c["danger"], raw=True)
            + T(x + 14, y + 66 + e, "3. Stunde", 11.5, 400, c["faint"]) + T(x + 14, y + 89 + e, "Mathe vertreten", 13, 800, c["accink"])
            + T(x + 14, y + 105 + e, "2. Stunde · Kle · 204", 11.5, 400, c["faint"]))

def b_notiz(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 2
    return (bhead(st, x, y, "Notizen", FILE) + T(x + 14, y + 50 + e, "Vokabeln Unit 3", 13.5, 700, c["ink"]) + T(x + 14, y + 68 + e, "lernen, Seite 41", 13.5, 700, c["ink"])
            + DOT(x + 18, y + 98.5 + e, 3.5, st.sub["En"][0]) + T(x + 28, y + 103 + e, "Englisch · Do", 12, 400, c["faint"]))

def b_termine(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 2
    return (bhead(st, x, y, "Termine", CAL) + T(x + 14, y + 50 + e, "Elternabend", 13.5, 700, c["ink"]) + T(x + 14, y + 67 + e, "Di, 23. Sept · 19:00", 12, 400, c["faint"])
            + HL(x + 14, x + w - 14, y + 80.5 + e, c) + T(x + 14, y + 101 + e, "Herbstferien", 13, 700, c["ink"]) + T(x + w - 14, y + 101 + e, "ab 6. Okt", 12, 400, c["faint"], "end"))

def b_ferien(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 2
    return (bhead(st, x, y, "Countdown", SUN) + T(x + 14, y + 62 + e, "12", 30, 900, c["ink"], ls=-0.5) + T(x + 52, y + 60 + e, "Schultage", 13, 600, c["muted"])
            + T(x + 14, y + 85 + e, "bis zu den Herbstferien", 12.5, 600, c["ink"]) + R(x + 14, y + 98 + e, w - 28, 6, 3, c["sand"]) + R(x + 14, y + 98 + e, (w - 28) * 0.7, 6, 3, c["accent"]))

def b_woche(st, x, y, w, h):
    c = st.c
    out = [bhead(st, x, y, "Woche · KW 38", WEEK_I)]
    gap = 4
    cw = (w - 28 - 4 * gap) / 5
    top = y + 56
    ch = (h - 56 - 14 - 5 * gap) / 6
    big = ch >= 38
    for i in range(5):
        cx = x + 14 + i * (cw + gap)
        out.append(T(cx + cw / 2, y + 47, WD[i], 9.5, 800, c["accink"] if i == 2 else c["faint"], "middle", 0.8))
        for r in range(6):
            code = WEEK[i][r]
            cy = top + r * (ch + gap)
            aus = (i, r) == (2, 2)
            out.append(st.cell(cx, cy, cw, ch, code, r=min(st.rz, 9), state="aus" if aus else None))
            if not code: continue
            col = c["danger"] if aus else st.ctext(code)
            txt = struck(code) if aus else code
            if big:
                out.append(T(cx + 9 + st.cpad(), cy + 18, txt, 12.5, 900, col, raw=True) + T(cx + 9 + st.cpad(), cy + ch - 8, ROOM[code], 9.5, 600, col))
            else:
                out.append(T(cx + cw / 2 + st.cpad() / 2, cy + ch / 2 + 4, txt, 11, 900, col, "middle", raw=True))
            if (i, r) == (4, 0): out.append(DOT(cx + cw - 6, cy + 6, 3.5, c["accent"]))   # пятница, 1-й урок — тест
    return "".join(out)

def b_heute(st, x, y, w, h):
    c = st.c
    out = [bhead(st, x, y, "Heute · 6 Stunden", LIST)]
    rh = (h - 40 - 8) / 6
    for r in range(6):
        ry = y + 40 + r * rh
        code, teach, room, state = TODAY[r]
        if r: out.append(HL(x + 14, x + w - 14, ry, c))
        if r == 1: out.append(R(x + 6, ry + 2, w - 12, rh - 4, 12 if st.style != "klar" else 6, c["tint"]))   # идёт сейчас
        my = ry + rh / 2 + 4.5
        out.append(T(x + 24, my, str(r + 1), 13.5, 800, c["ink"], "middle") + T(x + 42, my, TIMES[r][0], 11, 400, c["faint"]))
        aus = state == "aus"
        out.append(DOT(x + 94, my - 4.5, 4.5, c["danger"] if aus else st.sub[code][0]))
        out.append(T(x + 108, my, struck(NAMES[code]) if aus else NAMES[code], 13.5, 700, c["danger"] if aus else c["ink"], raw=True))
        if aus: out.append(T(x + w - 14, my, "fällt aus", 12, 800, c["danger"], "end"))
        elif state == "v": out.append(T(x + w - 14, my, f"Vertretung · {teach} · {room}", 12, 700, c["accink"], "end"))
        else: out.append(T(x + w - 14, my, f"{teach} · {room}", 12, 400, c["faint"], "end"))
    return "".join(out)

DRAW = dict(jetzt=b_jetzt, tests=b_tests, aufgaben=b_aufgaben, aenderungen=b_aend, notizen=b_notiz, termine=b_termine, ferien=b_ferien, woche=b_woche, heute=b_heute)

def block(st, kind, x, y, w, h, edit=False, lift=False, ghost=False):
    """Один блок на сетке. edit — режим «Anpassen»: минус, ручка, размер. ghost — место, куда встанет перетаскиваемый блок."""
    c = st.c
    if ghost:
        return R(x + 1, y + 1, w - 2, h - 2, st.rc, c["tint"], c["accent"], 2, ' stroke-dasharray="6 5"')
    out = st.card(x, y, w, h, lift=lift) + DRAW[kind](st, x, y, w, h)
    if lift:
        out = (R(x, y, w, h, st.rc, c["card"] if st.style != "glas" else ("#FFFFFF" if st.light else "#2A2440"), extra=' filter="url(#nsh0)"')
               + (st.card(x, y, w, h) if st.style != "glas" else "") + DRAW[kind](st, x, y, w, h) + R(x + 1, y + 1, w - 2, h - 2, st.rc - 1, "none", c["accent"], 2))
    if edit:   # минус — убрать, стрелки — размер; оба висят на углах, чтобы не закрывать содержимое
        solid = c["card"] if st.style != "glas" else ("#FFFFFF" if st.light else "#3A3450")
        out += (f'<circle cx="{x + 6}" cy="{y + 6}" r="12" fill="{c["danger"]}" stroke="{c["paper"]}" stroke-width="2.5"/>' + ICON(x - 2, y - 2, 0.67, "#FFFFFF", MINUS, 2.8))
        out += (f'<circle cx="{x + w - 6}" cy="{y + h - 6}" r="12" fill="{solid}" stroke="{c["rule"] if st.style != "glas" else c["faint2"]}" stroke-width="1.5"/>'
                + ICON(x + w - 13, y + h - 13, 0.58, c["ink"], RESIZE, 2.4))
    return out

def grid(st, items, x0, y0, cw, unit, gap, edit=False):
    """items: (kind, col, row, colspan, rowspan[, флаг 'lift' | 'ghost'])."""
    out = []
    for it in items:
        kind, col, row, cs, rs = it[:5]
        flag = it[5] if len(it) > 5 else None
        if flag == "lift": continue
        out.append(block(st, kind, x0 + col * (cw + gap), y0 + row * (unit + gap), cs * cw + (cs - 1) * gap, rs * unit + (rs - 1) * gap, edit=edit and flag != "ghost", ghost=flag == "ghost"))
    return "".join(out)

P_ITEMS = [("jetzt", 0, 0, 2, 1), ("tests", 0, 1, 1, 1), ("aufgaben", 1, 1, 1, 1), ("woche", 0, 2, 2, 2), ("aenderungen", 0, 4, 1, 1), ("notizen", 1, 4, 1, 1)]
PX, PY, PCW, PU, PG = 18, 86, 172, 124, 10

def start_head(st, edit=False):
    c = st.c
    if edit:
        return eyebrow(18, 33, "Start", c) + title(18, 65, "Anpassen", c) + st.rbtn(334, 33.31, UNDO)
    return eyebrow(18, 33, "Mittwoch · 17. September", c) + title(18, 65, "Start", c) + st.rbtn(334, 33.31, SLIDERS)

def p_start(st, offer=False):
    """offer — Start ist noch nicht die Startseite: oben ein Angebot, es umzustellen (bis «Ja» oder ×)."""
    c = st.c
    dy = 0
    b = [start_head(st)]
    if offer:
        dy = 86
        b.append(R(18, PY, 354, 74, st.rc, c["tint"]) + DOT(50, PY + 37, 18, c["card"]) + ICON(40.5, PY + 27.5, 0.79, c["accink"], HOME, 2)
                 + T(80, PY + 32, "Mit Start öffnen?", 14.5, 800, c["ink"]) + T(80, PY + 51, "Statt Woche beim Öffnen der App", 12, 400, c["muted"])
                 + st.button(270, PY + 19, 62, "Ja", "primary", h=36) + ICON(342, PY + 29, 0.67, c["faint"], CLOSE, 2.2))
    b.append(grid(st, P_ITEMS, PX, PY + dy, PCW, PU, PG))
    b.append(R(0, 744, 390, 100, 0, c["paper"]) if offer and st.style != "glas" else "")
    b.append(nav(st, 0))
    return st.page(390, 844, "".join(b))

def edit_bar(st, y=764):
    c = st.c
    return (st.card(16, y, 358, 58, 29 if st.style != "klar" else 14, lift=True) + (R(16.5, y + .5, 357, 57, 28.5, "none", c["hair"]) if st.style == "soft" else "")
            + st.button(23, y + 7, 196, "Block hinzufügen", "sand", PLUS, h=44) + st.button(225, y + 7, 142, "Fertig", "primary", CHECK, h=44))

def p_edit(st, drag=True):
    """Режим «Anpassen». drag — блок «Aufgaben» подняли и несём: на его месте пунктир, сам он под пальцем."""
    c = st.c
    items = [("jetzt", 0, 0, 2, 1), ("tests", 0, 1, 1, 1), ("aufgaben", 1, 1, 1, 1, "ghost"), ("woche", 0, 2, 2, 2), ("aenderungen", 0, 4, 1, 1), ("notizen", 1, 4, 1, 1)]
    b = [start_head(st, True), grid(st, items if drag else P_ITEMS, PX, PY, PCW, PU, PG, edit=True)]
    if drag: b.append(f'<g transform="translate(150 196) rotate(-3 86 62)">{block(st, "aufgaben", 0, 0, PCW, PU, lift=True)}</g>')
    b.append(edit_bar(st))
    return st.page(390, 844, "".join(b))

def sheet(st, top, eb, ttl, H=844):
    c = st.c
    paper = c["paper"]
    return (g.overlay(c, 390, H) + f'<path d="M30,{top} H360 A30,30 0 0 1 390,{top + 30} V{H} H0 V{top + 30} A30,30 0 0 1 30,{top} Z" fill="{paper}"/>'
            + R(176, top + 10, 38, 4, 2, c["faint2"]) + eyebrow(18, top + 41, eb, c) + title(18, top + 70, ttl, c, 26) + st.rbtn(338, top + 30, CLOSE, size=34))

def size_tile(st, x, y, w, name, shape, on):
    c = st.c
    out = R(x, y, w, 88, 16 if st.style != "klar" else 8, c["tint"] if on else c["card"]) + R(x + 1, y + 1, w - 2, 86, 15 if st.style != "klar" else 7, "none", c["accent"] if on else c["rule"], 2 if on else 1)
    gx, gy = x + w / 2 - 22, y + 14
    for i in range(4):   # сетка 2×2, закрашена занятая блоком часть
        cx, cy = gx + (i % 2) * 23, gy + (i // 2) * 19
        full = (shape == "k" and i == 0) or (shape == "b" and i < 2) or shape == "g"
        out += R(cx, cy, 21, 17, 4, c["accent"] if full else c["sand"], None if full else c["rule"])
    return out + T(x + w / 2, y + 74, name, 12.5, 800, c["ink"] if on else c["muted"], "middle")

def p_block(st):
    """Нажали на блок в режиме «Anpassen»: размер, что показывать, убрать."""
    c = st.c
    top = 404
    b = [strip(p_edit(st, drag=False)), sheet(st, top, "Block", "Tests")]
    b.append(label(18, top + 108, "Größe", c))
    for i, (nm, sh) in enumerate([("Klein", "k"), ("Breit", "b"), ("Groß", "g")]):
        b.append(size_tile(st, 18 + i * 120.67, top + 120, 112.67, nm, sh, i == 0))
    y = top + 226
    b.append(st.card(18, y, 354, 116))
    b.append(T(32, y + 34, "Einträge", 14.5, 500, c["ink"]) + st.seg(232, y + 11, 126, ["2", "3", "5"], 0))
    b.append(HL(32, 358, y + 58, c) + T(32, y + 92, "Nur meine Kurse", 14.5, 500, c["ink"]) + st.switch(316, y + 75, True))
    b.append(st.button(18, y + 132, 354, "Vom Start entfernen", "danger", TRASH))
    return st.page(390, 844, "".join(b))

def strip(svg_text):
    """Содержимое готового SVG без оболочки — чтобы положить экран под шторку."""
    return svg_text[svg_text.index("</defs>") + 7: svg_text.rindex("</svg>")]

def p_add(st):
    """Шторка «Block hinzufügen»: всё, что можно поставить на Start."""
    c = st.c
    top = 96
    b = [strip(p_start(st)), sheet(st, top, "Start", "Block hinzufügen")]
    y = top + 96
    on_start = {i[0] for i in P_ITEMS}
    rows = [x for x in BLOCKS]
    b.append(st.card(18, y, 354, 58 * len(rows)))
    for i, (kind, name, desc, icon) in enumerate(rows):
        ry = y + i * 58
        if i: b.append(HL(32, 358, ry, c))
        b.append(DOT(50, ry + 29, 18, c["tint"]) + ICON(40.5, ry + 19.5, 0.79, c["accink"], icon, 2))
        b.append(T(80, ry + 26, name, 14.5, 700, c["ink"]) + T(80, ry + 44, desc, 12, 400, c["faint"]))
        if kind in on_start:
            b.append(ICON(326, ry + 20, 0.75, c["ok"], CHECK, 2.6))
        else:
            b.append(R(318, ry + 13, 32, 32, st.pill(32), c["accent"]) + ICON(326, ry + 21, 0.67, c["on"], PLUS, 2.6))
    return st.page(390, 844, "".join(b))

def p_leer(st):
    c = st.c
    b = [start_head(st)]
    cx = 195
    b.append(DOT(cx, 330, 44, c["tint"]))
    for i in range(4):
        b.append(R(cx - 24 + (i % 2) * 26, 306 + (i // 2) * 26, 22, 22, 6, "none", c["accink"], 2, ' stroke-dasharray="4 3"' if i else ""))
    b.append(T(cx, 412, "Noch keine Blöcke", 20, 900, c["ink"], "middle", -0.3))
    b.append(T(cx, 438, "Stell dir zusammen, was du", 13.5, 400, c["muted"], "middle") + T(cx, 458, "auf einen Blick sehen willst.", 13.5, 400, c["muted"], "middle"))
    b.append(st.button(85, 486, 220, "Block hinzufügen", "primary", PLUS))
    b.append(nav(st, 0))
    return st.page(390, 844, "".join(b))

def p_laden(st):
    c = st.c
    sk = c["skel"]
    b = [R(18, 22, 150, 12, 6, sk), R(18, 44, 110, 26, 13, sk), R(334, 33.31, 38, 38, 19, sk)]
    for kind, col, row, cs, rs in P_ITEMS:
        x, y = PX + col * (PCW + PG), PY + row * (PU + PG)
        w, h = cs * PCW + (cs - 1) * PG, rs * PU + (rs - 1) * PG
        b.append(st.card(x, y, w, h) + R(x + 14, y + 16, 70, 10, 5, sk) + R(x + 14, y + 40, min(w - 60, 150), 16, 8, sk) + R(x + 14, y + 66, min(w - 40, 110), 10, 5, sk))
        if rs == 2:
            for i in range(5):
                for r in range(6):
                    b.append(R(x + 14 + i * 66.4, y + 96 + r * 25, 60.4, 20, 7, sk))
    b.append(nav(st, 0))
    return st.page(390, 844, "".join(b))

# ════════════════════════════ «Was ist neu»: Start zeigen und gleich anbieten ════════════════════════════
def p_neu(st):
    c = st.c
    top = 150
    b = [strip(p_woche(st)), sheet(st, top, "Version 0.17.0 · 14.11.", "Was ist neu")]
    # kleines Bild: Start mit drei Blöcken
    y = top + 96
    b.append(R(18, y, 354, 112, 18, c["tint"]))
    b.append(st.card(30, y + 12, 205, 88, 16) + T(44, y + 34, "JETZT · 2. STUNDE", 9.5, 800, c["accink"], ls=0.5) + T(44, y + 60, "Mathe", 18, 900, c["ink"])
             + R(44, y + 74, 177, 5, 2.5, c["sand"]) + R(44, y + 74, 106, 5, 2.5, st.sub["Ma"][0]))
    b.append(st.card(243, y + 12, 117, 40, 14) + T(255, y + 37, "Tests · Fr", 11.5, 800, c["ink"]))
    b.append(st.card(243, y + 60, 117, 40, 14) + T(255, y + 85, "3 Aufgaben", 11.5, 800, c["ink"]))
    y += 112 + 26
    bd, _ = g.badge(18, y, "NEU", c, "accent"); b.append(bd); y += 38
    lines = ["Neue Seite „Start“: alles Wichtige auf einen Blick.", "Blöcke selbst wählen, verschieben und größer machen.",
             "Dazu drei Designs – Soft, Glas und Klar – und", "eine eigene Akzentfarbe."]
    for i, ln in enumerate(lines):
        if i in (0, 2): b.append(DOT(21.5, y - 4.5, 2.5, c["faint2"]))
        b.append(T(34, y, ln, 13.5, 400, c["ink"])); y += 19.5 + (5 if i == 1 else 0)
    y += 14
    b.append(st.card(18, y, 354, 58) + ICON(32, y + 19.5, 0.79, c["muted"], SLIDERS, 1.9) + T(63, y + 25, "Startansicht", 14.5, 700, c["ink"])
             + T(63, y + 43, "Mehr → Darstellung", 12, 400, c["faint"]) + T(334, y + 34, "Woche", 13, 400, c["faint"], "end") + ICON(342, y + 21, 0.67, c["faint2"], CHEV_R))
    b.append(HL(0, 390, 756, c))
    b.append(st.button(18, 770, 150, "Später", "sand") + st.button(176, 770, 196, "Mit Start öffnen", "primary", HOME))
    return st.page(390, 844, "".join(b))

# ════════════════════════════ Woche (в любом оформлении) ════════════════════════════
def p_woche(st):
    c = st.c
    b = [eyebrow(18, 33, "KW 38 · 15.–19. Sept", c), title(18, 65, "Diese Woche", c), st.rbtn(246, 33.31, BACK), st.rbtn(290, 33.31, DOTS_V), st.rbtn(334, 33.31, CHEV_R)]
    y0, COLS, CW = 85.31, m19.COLS, m19.CW
    for i, d in enumerate(["15", "16", "17", "18", "19"]):
        x = COLS[i]
        sel = i == 2
        if sel:
            b.append(R(x, y0, CW, 42, st.rz, c["accent"]) + (R(x, y0, CW, 42, st.rz, "url(#sheen)") if st.style == "glas" else ""))
        b.append(T(x + CW / 2, y0 + 14.5, WD[i], 10, 700, c["sub"] if sel else c["faint"], "middle", 0.8) + T(x + CW / 2, y0 + 34.5, d, 18, 900, c["on"] if sel else c["ink"], "middle", -0.27))
    gy = y0 + 46
    for r in range(6):
        y = gy + r * 56
        b.append(T(27, y + 24, str(r + 1), 12.5, 700, c["ink"], "middle") + T(27, y + 38, TIMES[r][0], 8.5, 400, c["faint"], "middle"))
        for i in range(5):
            code = WEEK[i][r]
            x = COLS[i]
            aus = (i, r) == (2, 2)
            b.append(st.cell(x, y, CW, 52, code, state="aus" if aus else None))
            if not code: continue
            col = c["danger"] if aus else st.ctext(code)
            px = x + 8 + st.cpad()
            b.append(T(px, y + 20, struck(code) if aus else code, 12.5, 900, col, raw=True))
            if (i, r) == (4, 0):
                b.append(m19.flag_corner(x, y, CW, c) if st.style != "klar" else (R(x + CW - 19, y + 4, 15, 15, 4, c["accent"]) + ICON(x + CW - 16.5, y + 6.5, 0.42, c["on"], FLAG, 2.6)))
                b.append(T(px, y + 42, "Test", 8.5, 800, c["accink"], ls=0.26))
            elif aus: b.append(T(px, y + 42, "fällt aus", 8.5, 800, col))
            else: b.append(f'<g opacity="0.85">{T(px, y + 42, ROOM[code], 9.5, 600, col)}</g>')
    ly = gy + 6 * 56 + 14
    b.append(st.card(18, ly, 354, 68.88) + ICON(32, ly + 25.69, 0.79, c["muted"], FLAG, 1.9) + T(63, ly + 29, "Fr · Mathe", 14.5, 500, c["ink"]) + T(63, ly + 48, "Nächster Test", 12, 400, c["faint"])
             + T(334, ly + 39.19, "in 2 Tagen", 13, 400, c["faint"], "end") + ICON(342, ly + 27.19, 0.67, c["faint2"], CHEV_R))
    b.append(nav(st, 1))
    return st.page(390, 844, "".join(b))

# ════════════════════════════ Darstellung ════════════════════════════
def theme_tile(st, x, y, w, kind, on):
    c = st.c
    out = ""
    if on: out += R(x - 4, y - 4, w + 8, 70, 18, "none", c["accent"], 2.5)
    if kind == 2:
        out += R(x, y, w, 62, 14, "#FBF7F2", c["rule"]) + f'<path d="M{x + w / 2},{y} H{x + w - 14} A14,14 0 0 1 {x + w},{y + 14} V{y + 48} A14,14 0 0 1 {x + w - 14},{y + 62} H{x + w / 2} Z" fill="#16131C"/>'
    else:
        dark = kind == 1
        out += R(x, y, w, 62, 14, "#16131C" if dark else "#FBF7F2", c["rule"]) + R(x + 14, y + 22, 54, 5, 2.5, "#F4F0F8" if dark else "#2A2433") + R(x + 14, y + 33, 36, 5, 2.5, "#877E94" if dark else "#978FA1")
    return out + T(x + w / 2, y + 84, ["Hell", "Dunkel", "System"][kind], 13, 800, c["ink"], "middle")

def design_tile(st, x, y, w, style, on):
    """Маленькая картинка оформления: фон, три клетки уроков, карточка и кнопка — нарисованы в самом этом оформлении."""
    c = st.c
    h = 118
    ms = St(style, st.theme)
    mc = ms.c
    out = ""
    if on: out += R(x - 4, y - 4, w + 8, h + 8, 20, "none", c["accent"], 2.5)
    cid = f"dt{style}{int(x)}"
    out += f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16"/></clipPath><g clip-path="url(#{cid})">'
    out += R(x, y, w, h, 0, mc["paper"])
    if style == "glas":
        a, b_, d = GLASS_BG[0][1 if ms.light else 2]
        out += (f'<g opacity="{0.95 if ms.light else 0.7}"><circle cx="{x + 14}" cy="{y + 10}" r="46" fill="{a}"/><circle cx="{x + w - 4}" cy="{y + 54}" r="44" fill="{b_}"/>'
                f'<circle cx="{x + 16}" cy="{y + h - 6}" r="40" fill="{d}"/></g>')
    cw = (w - 20 - 8) / 3
    for i, code in enumerate(["De", "Ma", "En"]):
        cx = x + 10 + i * (cw + 4)
        solid, tint, text = ms.sub[code]
        if style == "klar": out += R(cx + .5, y + 12.5, cw - 1, 27, 4, mc["card"], mc["rule"]) + R(cx + 3, y + 16, 2.5, 20, 1.2, solid)
        elif style == "glas": out += R(cx, y + 12, cw, 28, 8, tint, extra=' fill-opacity="0.7"') + R(cx + .5, y + 12.5, cw - 1, 27, 7.5, "none", ms.edge)
        else: out += R(cx, y + 12, cw, 28, 8, tint)
        out += T(cx + (9 if style == "klar" else 7), y + 30, code, 9.5, 900, mc["ink"] if style == "klar" else text)
    r = 4 if style == "klar" else 10
    if style == "klar": out += R(x + 10.5, y + 48.5, w - 21, 31, r, mc["card"], mc["rule"])
    elif style == "glas": out += R(x + 10, y + 48, w - 20, 32, r, mc["card"]) + R(x + 10.5, y + 48.5, w - 21, 31, r, "none", ms.edge)
    else: out += R(x + 10, y + 48, w - 20, 32, r, mc["card"])
    out += R(x + 18, y + 58, 40, 5, 2.5, mc["ink"]) + R(x + 18, y + 68, 26, 4, 2, mc["faint"])
    out += R(x + 10, y + 88, 52, 20, 4 if style == "klar" else 10, mc["accent"]) + R(x + 22, y + 96, 28, 4, 2, mc["on"])
    out += "</g>" + R(x + .5, y + .5, w - 1, h - 1, 15.5, "none", c["rule"])
    return out + T(x + w / 2, y + h + 22, {"soft": "Soft", "glas": "Glas", "klar": "Klar"}[style], 13, 800, c["ink"], "middle")

def accent_row(st, x, y, w, sel=0):
    c = st.c
    out = st.card(x, y, w, 64)
    step = (w - 28 - 34) / 5
    for i, (name, light, dark) in enumerate(ACCENTS):
        cx = x + 14 + 17 + i * step
        col = light if st.light else dark
        if i == sel: out += f'<circle cx="{cx}" cy="{y + 32}" r="21" fill="none" stroke="{col}" stroke-width="2.5"/>'
        out += DOT(cx, y + 32, 16, col)
        if i == sel: out += ICON(cx - 8, y + 24, 0.67, c["on"], CHECK, 3)
    return out

def bg_row(st, x, y, w, sel=0):
    c = st.c
    out = st.card(x, y, w, 158)
    tw = (w - 28 - 3 * 8) / 4
    for i, (name, light, dark) in enumerate(GLASS_BG):
        tx = x + 14 + i * (tw + 8)
        a, b_, d = light if st.light else dark
        gid = f"bgsw{i}"
        out += (f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="0.5" stop-color="{b_}"/><stop offset="1" stop-color="{d}"/></linearGradient>'
                + R(tx, y + 14, tw, 50, 12, f"url(#{gid})"))
        if i == sel: out += R(tx - 3, y + 11, tw + 6, 56, 15, "none", c["accent"], 2.5)
        out += T(tx + tw / 2, y + 84, name, 12, 800 if i == sel else 600, c["ink"] if i == sel else c["muted"], "middle")
    out += HL(x + 14, x + w - 14, y + 100, c) + T(x + 14, y + 134, "Glas-Effekt", 14.5, 500, c["ink"]) + st.seg(x + w - 14 - 156, y + 111, 156, ["Voll", "Einfach"], 0)
    return out, 158

def set_row(st, x, y, w, text, control, first=False):
    c = st.c
    return ("" if first else HL(x + 14, x + w - 14, y, c)) + T(x + 14, y + 34.5, text, 14.5, 500, c["ink"]) + control

def link_row(st, x, y, w, icon, text, right, first=False):
    c = st.c
    return (("" if first else HL(x + 14, x + w - 14, y, c)) + ICON(x + 14, y + 19.5, 0.79, c["muted"], icon, 1.9) + T(x + 45, y + 34.5, text, 14.5, 500, c["ink"])
            + T(x + w - 38, y + 34, right, 13, 400, c["faint"], "end") + ICON(x + w - 30, y + 21, 0.67, c["faint2"], CHEV_R))

def p_darstellung(st):
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Mehr", c), title(66, 65, "Darstellung", c)]
    b.append(label(x, 106, "Thema", c))
    tw = (w - 16) / 3
    for i in range(3): b.append(theme_tile(st, x + i * (tw + 8), 120, tw, i, i == (0 if st.light else 1)))
    y = 240
    b.append(label(x, y, "Design", c)); y += 14
    for i, sname in enumerate(["soft", "glas", "klar"]): b.append(design_tile(st, x + i * (tw + 8), y, tw, sname, sname == st.style))
    y += 118 + 58
    b.append(label(x, y, "Akzentfarbe", c)); y += 12
    b.append(accent_row(st, x, y, w)); y += 64 + 30
    if st.style == "glas":
        b.append(label(x, y, "Hintergrund", c)); y += 12
        card, h = bg_row(st, x, y, w); b.append(card); y += h + 30
    b.append(label(x, y, "Ansicht", c)); y += 12
    b.append(st.card(x, y, w, 58 * 4))
    b.append(set_row(st, x, y, w, "Startansicht", st.seg(x + w - 14 - 196, y + 11, 196, ["Start", "Woche", "Heute"], 1), True))
    b.append(DOT(x + w - 14 - 196 + 3 + 190 / 6 + 22, y + 17, 4, c["accent"]))   # Punkt an «Start»: neu
    b.append(set_row(st, x, y + 58, w, "Animationen", st.seg(x + w - 14 - 196, y + 69, 196, ["Voll", "Weniger", "Aus"], 0)))
    b.append(set_row(st, x, y + 116, w, "Schriftgröße", st.seg(x + w - 14 - 150, y + 127, 150, ["A", "A+", "A++"], 1)))
    b.append(set_row(st, x, y + 174, w, "Sprache", T(x + w - 38, y + 208, "Deutsch", 13, 400, c["faint"], "end") + ICON(x + w - 30, y + 195, 0.67, c["faint2"], CHEV_R)))
    y += 232 + 30
    b.append(label(x, y, "Anpassen", c)); y += 12
    b.append(st.card(x, y, w, 116) + link_row(st, x, y, w, GRID, "Start", "6 Blöcke", True) + link_row(st, x, y + 58, w, WEEK_I, "Stundenplan", "Raum · Uhrzeit"))
    y += 116 + 18
    b.append(st.button(x, y, w, "Darstellung zurücksetzen", "sand", UNDO)); y += 48 + 28
    return st.page(390, y, "".join(b))

# ════════════════════════════ Stundenplan anpassen ════════════════════════════
def preview_cell(st, x, y, w, h, code, teacher=True, room=True, flag=False):
    c = st.c
    col = st.ctext(code)
    px = x + 9 + st.cpad()
    out = st.cell(x, y, w, h, code) + T(px, y + 21, code, 13, 900, col)
    if teacher: out += T(x + w - 9, y + 21, TEACH[code], 10, 600, col, "end")
    if room: out += f'<g opacity="0.85">{T(px, y + h - 10, ROOM[code], 10, 600, col)}</g>'
    return out

def switch_row(st, x, y, w, text, on, first=False, hint=None):
    c = st.c
    return (("" if first else HL(x + 14, x + w - 14, y, c)) + T(x + 14, y + (26 if hint else 33.5), text, 14.5, 500, c["ink"])
            + (T(x + 14, y + 44, hint, 12, 400, c["faint"]) if hint else "") + st.switch(x + w - 56, y + 15, on))

def p_plan(st):
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Darstellung", c), title(66, 65, "Stundenplan", c)]
    y = 92
    b.append(st.card(x, y, w, 176) + label(x + 14, y + 26, "Vorschau", c))
    cw = (w - 28 - 30 - 8) / 3
    for i, wd in enumerate(["MO", "DI", "MI"]):
        b.append(T(x + 44 + i * (cw + 4) + cw / 2, y + 48, wd, 9.5, 800, c["accink"] if i == 2 else c["faint"], "middle", 0.8))
    for r in range(2):
        ry = y + 56 + r * 56
        b.append(T(x + 27, ry + 24, str(r + 1), 12.5, 700, c["ink"], "middle") + T(x + 27, ry + 38, TIMES[r][0], 8.5, 400, c["faint"], "middle"))
        for i in range(3):
            b.append(preview_cell(st, x + 44 + i * (cw + 4), ry, cw, 52, WEEK[i][r]))
    y += 176 + 28
    b.append(label(x, y, "In der Stunde", c)); y += 12
    b.append(st.card(x, y, w, 54 * 4))
    b.append(set_row(st, x, y - 2, w, "Fach", st.seg(x + w - 14 - 150, y + 9, 150, ["Kürzel", "Name"], 0), True))
    b.append(switch_row(st, x, y + 54, w, "Raum", True) + switch_row(st, x, y + 108, w, "Lehrkraft", True) + switch_row(st, x, y + 162, w, "Uhrzeit links", True))
    y += 216 + 28
    b.append(label(x, y, "Farben", c)); y += 12
    b.append(st.card(x, y, w, 54) + set_row(st, x, y - 2, w, "Fachfarbe", st.seg(x + w - 14 - 196, y + 9, 196, ["Fläche", "Streifen", "Aus"], 2 if st.style == "klar" else 0), True))
    y += 54 + 28
    b.append(label(x, y, "Woche", c)); y += 12
    b.append(st.card(x, y, w, 54 * 4))
    b.append(switch_row(st, x, y, w, "Wochenende zeigen", False, True) + switch_row(st, x, y + 54, w, "Kompakte Woche", True) + switch_row(st, x, y + 108, w, "Freie Stunden zeigen", True))
    b.append(set_row(st, x, y + 160, w, "Ausfall", st.seg(x + w - 14 - 196, y + 171, 196, ["Durchstreichen", "Ausblenden"], 0, fs=11.5)))
    y += 216 + 28
    b.append(label(x, y, "Tag", c)); y += 12
    b.append(st.card(x, y, w, 54 * 3))
    b.append(set_row(st, x, y - 2, w, "Anzeigen als", st.seg(x + w - 14 - 150, y + 9, 150, ["Liste", "Zeit"], 0), True) + switch_row(st, x, y + 54, w, "Pausen zeigen", True))
    b.append(HL(x + 14, x + w - 14, y + 108, c) + T(x + 14, y + 141.5, "Änderung unter dem Tag", 14.5, 500, c["ink"]) + T(x + w - 38, y + 141, "15.09.", 13, 400, c["faint"], "end")
             + ICON(x + w - 30, y + 128, 0.67, c["faint2"], CHEV_R))
    y += 162 + 28
    return st.page(390, y, "".join(b))

# ════════════════════════════ Computer ════════════════════════════
SIDE = [("Start", HOME, None), ("Woche", WEEK_I, None), ("Heute", LIST, None), ("Tests", FLAG, "5"), ("Materialien", FOLDER, None)]
SOON = [("19", "FR", "Ma", "Test · Mathe", "in 2 Tagen", True), ("23", "DI", "Ge", "Test · Geschichte", "in 6 Tagen", False), ("25", "DO", "Ph", "Test · Physik", "in 8 Tagen", False)]

def pc_side(st, active="Start"):
    c = st.c
    b = [st.card(16, 16, 232, 868, 28 if st.style != "klar" else 12, lift=True)]
    lc = "#6C4DF6" if st.light else "#A58BFF"
    b.append(f'<g transform="translate(34 36) scale(0.34)" fill="none"><ellipse cx="38" cy="38" rx="33" ry="13.5" stroke="{lc}" stroke-width="5" transform="rotate(-28 38 38)"/>'
             f'<circle cx="38" cy="38" r="11" fill="{c["ink"]}"/><circle cx="64" cy="25" r="5.5" fill="{lc}"/></g>')
    b.append(T(67, 56.5, "ORBook", 21, 900, c["ink"], ls=-0.3) + R(164, 40, 50, 22, st.pill(22), c["tint"]) + T(174, 55.3, "9b", 12, 900, c["accink"]) + ICON(194, 45, 0.5, c["accink"], CHEV_D, 2.6))
    b.append(R(30, 86, 204, 40, st.pill(40), c["sand"]) + ICON(44, 97, 0.75, c["faint"], SEARCH, 2) + T(69, 111, "Suchen", 14, 400, c["faint"]) + T(220, 110.5, "⌘K", 11, 700, c["faint"], "end"))
    for i, (name, ic, n) in enumerate(SIDE):
        by = 172 + i * 46
        on = name == active
        if on:
            b.append(R(30, by - 26, 204, 42, st.pill(42), c["accent"]) + (R(30, by - 26, 204, 42, 21, "url(#sheen)") if st.style == "glas" else ""))
        b.append(ICON(42, by - 14.5, 0.79, c["on"] if on else c["muted"], ic, 2) + T(73, by, name, 14.5, 800 if on else 700, c["on"] if on else c["muted"]))
        if n: b.append(R(200, by - 15, 22, 20, 10, c["sand"]) + T(211, by - 1.5, n, 11, 700, c["muted"], "middle"))
    b.append(T(42, 417, "Bald", 12.5, 800, c["faint"]))
    for i, (d, wd, code, ttl, when, hot) in enumerate(SOON):
        sy = 432 + i * 47
        solid, tint, text = st.sub[code]
        b.append(st.cell(38, sy, 32, 36, code, r=10) + T(54 + st.cpad() / 2, sy + 17, d, 13, 900, st.ctext(code), "middle") + T(54 + st.cpad() / 2, sy + 28.5, wd, 7.5, 700, st.ctext(code), "middle", 0.4))
        b.append(T(80, sy + 15, ttl, 13, 600, c["ink"]) + T(80, sy + 32, when, 12, 400, c["accink"] if hot else c["faint"]))
    b.append(dots_icon(44, 754, 0.83, c["muted"]) + T(73, 767, "Mehr", 14.5, 700, c["muted"]) + HL(30, 234, 795.5, c))
    b.append(DOT(42, 816, 4, c["ok"]) + T(54, 820.5, "Plan aktuell · Stand 07:12", 12, 400, c["muted"]))
    b.append(R(38, 836, 66, 30, 15, c["sand"]) + DOT(56, 851, 12, c["accent"] if st.light else "none") + DOT(86, 851, 12, "none" if st.light else c["accent"])
             + ICON(48, 843, 0.67, c["on"] if st.light else c["muted"], SUN, 2) + ICON(78, 843, 0.67, c["muted"] if st.light else c["on"], MOON, 2))
    b.append(T(226, 855.5, "Admin", 12, 400, c["faint"], "end"))
    return "".join(b)

PC_ITEMS = [("jetzt", 0, 0, 2, 1), ("tests", 2, 0, 1, 1), ("aufgaben", 3, 0, 1, 1), ("woche", 0, 1, 2, 2), ("heute", 2, 1, 2, 2),
            ("aenderungen", 0, 3, 1, 1), ("notizen", 1, 3, 1, 1), ("termine", 2, 3, 1, 1), ("ferien", 3, 3, 1, 1)]

def pc_start(st):
    c = st.c
    b = [pc_side(st), eyebrow(284, 39, "Mittwoch · 17. September", c), title(284, 80, "Start", c, 38)]
    b.append(st.button(1250, 40, 154, "Anpassen", "sand", SLIDERS, h=46))
    b.append(grid(st, PC_ITEMS, 284, 110, 268, 150, 16))
    return st.page(1440, 900, "".join(b))

def pc_edit(st):
    """ПК: сетка слева, справа список блоков. «Notizen» тянем из списка на свободное место."""
    c = st.c
    b = [pc_side(st), eyebrow(284, 39, "Start", c), title(284, 80, "Anpassen", c, 38)]
    b.append(st.button(1076, 40, 172, "Zurücksetzen", "sand", UNDO, h=46) + st.button(1262, 40, 142, "Fertig", "primary", CHECK, h=46))
    items = [("jetzt", 0, 0, 2, 1), ("tests", 2, 0, 1, 1), ("woche", 0, 1, 2, 2), ("aufgaben", 2, 1, 1, 1), ("aenderungen", 2, 2, 1, 1),
             ("termine", 0, 3, 1, 1), ("notizen", 1, 3, 1, 1, "ghost"), ("ferien", 2, 3, 1, 1)]
    cw = (804 - 32) / 3
    b.append(grid(st, items, 284, 110, cw, 150, 16, edit=True))
    px, pw = 1104, 300
    b.append(st.card(px, 110, pw, 648) + T(px + 18, 146, "Blöcke", 17, 900, c["ink"]))
    on_grid = {i[0] for i in items if len(i) == 5}
    for i, (kind, name, desc, icon) in enumerate(BLOCKS):
        ry = 164 + i * 53
        b.append(HL(px + 18, px + pw - 18, ry, c) + DOT(px + 34, ry + 26.5, 16, c["tint"]) + ICON(px + 25.5, ry + 18, 0.71, c["accink"], icon, 2)
                 + T(px + 62, ry + 24, name, 14, 700, c["ink"]) + T(px + 62, ry + 41, desc, 11.5, 400, c["faint"]))
        if kind in on_grid: b.append(ICON(px + pw - 38, ry + 17.5, 0.75, c["ok"], CHECK, 2.6))
        else: b.append(R(px + pw - 46, ry + 12.5, 28, 28, st.pill(28), c["accent"]) + ICON(px + pw - 40, ry + 18.5, 0.67, c["on"], PLUS, 2.6))
    b.append(f'<g transform="translate(612 572) rotate(-3 128 75)">{block(st, "notizen", 0, 0, cw, 150, lift=True)}</g>')
    return st.page(1440, 900, "".join(b))

def pc_darstellung(st):
    c = st.c
    b = [pc_side(st, "Mehr-"), R(30, 741, 204, 42, st.pill(42), c["accent"]), dots_icon(44, 754, 0.83, c["on"]), T(73, 767, "Mehr", 14.5, 800, c["on"])]
    b.append(eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38))
    # левое меню раздела «Mehr» (как Soft PC 24), выбран пункт «Darstellung»
    y = 130
    for head, items in [("Seiten", ["Statistik", "Neuigkeiten", "Datenschutz"]), ("Einstellungen", ["Meine Kurse", "Darstellung", "Fachfarben", "Mitteilungen", "Sync", "Editor-Code"])]:
        b.append(T(290, y, head.upper(), 10.5, 800, c["faint"], ls=0.8)); y += 14
        for name in items:
            on = name == "Darstellung"
            if on: b.append(R(284, y, 230, 38, st.pill(38), c["accent"]))
            b.append(T(304, y + 24, name, 13.5, 800 if on else 700, c["on"] if on else c["muted"])); y += 40
        y += 22
    X, W = 558, 846
    b.append(T(X, 80, "Darstellung", 26, 900, c["ink"], ls=-0.39))
    b.append(label(X, 122, "Thema", c))
    for i in range(3): b.append(theme_tile(st, X + i * 152, 136, 140, i, i == (0 if st.light else 1)))
    b.append(label(X + 480, 122, "Akzentfarbe", c) + accent_row(st, X + 480, 134, 366))
    b.append(label(X, 256, "Design", c))
    for i, sname in enumerate(["soft", "glas", "klar"]): b.append(design_tile(st, X + i * 152, 270, 140, sname, sname == st.style))
    b.append(label(X + 480, 256, "Hintergrund für Glas", c))
    card, _ = bg_row(st, X + 480, 268, 366, sel=0); b.append(card)
    y = 462
    b.append(label(X, y, "Ansicht", c)); y += 12
    b.append(st.card(X, y, W, 58 * 4))
    b.append(set_row(st, X, y, W, "Startansicht", st.seg(X + W - 14 - 240, y + 11, 240, ["Start", "Woche", "Heute"], 0), True))
    b.append(set_row(st, X, y + 58, W, "Animationen", st.seg(X + W - 14 - 240, y + 69, 240, ["Voll", "Weniger", "Aus"], 0)))
    b.append(set_row(st, X, y + 116, W, "Schriftgröße", st.seg(X + W - 14 - 180, y + 127, 180, ["A", "A+", "A++"], 1)))
    b.append(set_row(st, X, y + 174, W, "Sprache", T(X + W - 38, y + 208, "Deutsch", 13, 400, c["faint"], "end") + ICON(X + W - 30, y + 195, 0.67, c["faint2"], CHEV_R)))
    y += 232 + 28
    b.append(label(X, y, "Anpassen", c)); y += 12
    hw = (W - 16) / 2
    b.append(st.card(X, y, hw, 58) + link_row(st, X, y, hw, GRID, "Start", "9 Blöcke", True) + st.card(X + hw + 16, y, hw, 58) + link_row(st, X + hw + 16, y, hw, WEEK_I, "Stundenplan", "Raum · Uhrzeit", True))
    return st.page(1440, 900, "".join(b))

SCREENS = {   # имя файла: (функция, оформление)
    "handy-01-start": (p_start, "soft"), "handy-02-start-anpassen": (p_edit, "soft"), "handy-03-block": (p_block, "soft"),
    "handy-04-block-hinzufuegen": (p_add, "soft"), "handy-05-start-leer": (p_leer, "soft"), "handy-06-start-laden": (p_laden, "soft"),
    "handy-07-darstellung": (p_darstellung, "soft"), "handy-08-darstellung-glas": (p_darstellung, "glas"),
    "handy-09-start-glas": (p_start, "glas"), "handy-10-woche-glas": (p_woche, "glas"),
    "handy-11-start-klar": (p_start, "klar"), "handy-12-woche-klar": (p_woche, "klar"),
    "handy-13-stundenplan": (p_plan, "soft"),
    "handy-14-was-ist-neu": (p_neu, "soft"), "handy-15-start-angebot": (lambda st: p_start(st, offer=True), "soft"),
    "pc-01-start": (pc_start, "soft"), "pc-02-start-anpassen": (pc_edit, "soft"), "pc-03-start-glas": (pc_start, "glas"), "pc-04-darstellung": (pc_darstellung, "soft"),
}
if __name__ == "__main__":
    n = 0
    for theme in ("hell", "dunkel"):
        for name, (fn, style) in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(St(style, theme)))
            n += 1
    print(n, "files")
