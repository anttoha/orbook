# Макеты части 52 «Rundgang» — интерактивный тур для новичка прямо по настоящим экранам.
# Поверх экрана: затемнение (токен overlay) с вырезом-«прожектором» вокруг настоящего элемента,
# рядом пузырь: заголовок, одна строка, точки шагов, «Überspringen» и «Weiter».
# Шаг-действие (Woche, Heute): вместо «Weiter» пульсирующее кольцо — человек сам нажимает элемент.
# Фоновые экраны берём готовыми из части 50 (Start, Woche, Tag) — ничего не перерисовываем.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp)
    argv, sys.argv = sys.argv, [sys.argv[0]]
    try: sp.loader.exec_module(mod)
    finally: sys.argv = argv
    return mod

W50 = _load("g50", "50-wetter")
W, p30, g = W50.W, W50.p30, W50.g
T, R, ICON, P = g.T, g.R, g.ICON, g.P
CHEV_R, CHECK = g.CHEV_R, g.CHECK
tw = W50.tw
STEPS = 7

# ════════════════ Кирпичики тура ════════════════
def strip(s):
    """Тело SVG без обёртки — чтобы положить поверх него тур."""
    return s[s.index("</defs>") + 7: s.rindex("</svg>")]

def scrim(c, w, h, hole=None, r=24):
    """Затемнение с вырезом: evenodd — внутренний скруглённый прямоугольник остаётся прозрачным."""
    col, op = c["overlay"]
    d = f"M0 0H{w}V{h}H0Z"
    if hole:
        x, y, hw, hh = hole
        d += (f"M{x + r} {y}H{x + hw - r}A{r} {r} 0 0 1 {x + hw} {y + r}V{y + hh - r}A{r} {r} 0 0 1 {x + hw - r} {y + hh}"
              f"H{x + r}A{r} {r} 0 0 1 {x} {y + hh - r}V{y + r}A{r} {r} 0 0 1 {x + r} {y}Z")
    return f'<path d="{d}" fill="{col}" fill-opacity="{op}" fill-rule="evenodd"/>'

def ring(c, hole, r, pulse=False):
    """Рамка прожектора; у шага-действия — ещё два мягких кольца (кадр пульсации)."""
    x, y, w, h = hole
    out = R(x, y, w, h, r, "none", c["accent"], 2.5)
    if pulse:
        out += f'<g opacity="0.45">{R(x - 7, y - 7, w + 14, h + 14, r + 7, "none", c["accent"], 2)}</g>'
        out += f'<g opacity="0.18">{R(x - 15, y - 15, w + 30, h + 30, r + 15, "none", c["accent"], 2)}</g>'
    return out

def dots(c, x, y, n):
    """Точки шагов: текущий — вытянутая лиловая «пилюля»."""
    out = []
    for i in range(STEPS):
        on = i == n - 1
        out.append(R(x, y, 16 if on else 6, 6, 3, c["accent"] if on else c["faint2"]))
        x += (16 if on else 6) + 5
    return "".join(out)

def bubble(st, x, y, w, n, ttl, line, action=False, last=False, arrow=None, line2=None):
    """Пузырь шага. arrow = ('up'|'down', x) — хвостик к элементу."""
    c = st.c
    h = 142 if line2 else 124
    out = []
    if arrow:
        side, ax = arrow
        ty = y if side == "up" else y + h
        dy = -9 if side == "up" else 9
        out.append(f'<path d="M{ax - 10} {ty}L{ax} {ty + dy}L{ax + 10} {ty}Z" fill="{c["card"]}"/>')
    out.insert(0, f'<g filter="url(#nsh0)">{R(x, y, w, h, 24, c["card"])}</g>')
    out.append(T(x + 18, y + 31, ttl, 17, 900, c["ink"], ls=-0.2) + T(x + w - 18, y + 30, f"{n}/{STEPS}", 12, 800, c["faint"], "end"))
    out.append(T(x + 18, y + 54, line, 13.5, 400, c["muted"]))
    if line2: out.append(T(x + 18, y + 72, line2, 13.5, 400, c["muted"]))
    by = y + h - 50
    out.append(dots(c, x + 18, by + 16, n))
    if action:
        out.append(T(x + w - 18, by + 23, "Überspringen", 13.5, 800, c["muted"], "end"))
    else:
        bw = 112 if last else 104
        out.append(T(x + w - bw - 30, by + 23, "Überspringen" if not last else "", 13.5, 800, c["muted"], "end"))
        out.append(st.button(x + w - 18 - bw, by, bw, "Fertig" if last else "Weiter", "primary", CHECK if last else None, h=38))
    return "".join(out)

def tour(st, base, hole, r, bub, pulse=False, size=(390, 844)):
    """Экран + затемнение с вырезом + рамка + пузырь."""
    w, h = size
    return st.page(w, h, strip(base) + scrim(st.c, w, h, hole, r) + ring(st.c, hole, r, pulse) + bub)

# ════════════════ Телефон ════════════════
NAV_Y = 764
def nav_hole(i):
    """Вырез вокруг вкладки нижней панели (на неактивных вкладках — круг побольше)."""
    xs = {0: (23, 112), 1: (135, 77), 2: (212, 77), 3: (289, 77)}   # Start активен
    x, w = xs[i]
    return (x - 2, NAV_Y + 3, w + 4, 52)

def p_welcome(st):
    """Первый вход: короткое приветствие поверх Start. «Los geht's» — тур, «Später» — закрыть (повтор в Mehr)."""
    c = st.c
    base = W50.p_start(st)
    x, y, w, h = 24, 250, 342, 300
    lc = c["accent"]
    b = [strip(base), scrim(c, 390, 844), f'<g filter="url(#nsh0)">{R(x, y, w, h, 30, c["card"])}</g>']
    b.append(R(x + w / 2 - 36, y + 30, 72, 72, 24, c["tint"])
             + f'<g transform="translate({x + w / 2 - 26} {y + 40}) scale(0.68)" fill="none"><ellipse cx="38" cy="38" rx="33" ry="13.5" stroke="{lc}" stroke-width="5" transform="rotate(-28 38 38)"/>'
             f'<circle cx="38" cy="38" r="11" fill="{c["ink"]}"/><circle cx="64" cy="25" r="5.5" fill="{lc}"/></g>')
    b.append(T(x + w / 2, y + 140, "Willkommen bei ORBook", 22, 900, c["ink"], "middle", -0.3))
    b.append(T(x + w / 2, y + 166, "Kurzer Rundgang in 7 Schritten?", 14, 400, c["muted"], "middle"))
    b.append(st.button(x + 20, y + 190, w - 40, "Los geht's", "primary", None, h=48))
    b.append(T(x + w / 2, y + 268, "Später", 14, 800, c["muted"], "middle"))
    return st.page(390, 844, "".join(b))

def p1_fuer(st):
    hole = (12, 80, 366, 270)
    return tour(st, W50.p_start(st), hole, 30,
                bubble(st, 18, 372, 354, 1, "Für dich jetzt", "Weg, Wetter und Änderungen für heute —", line2="passt sich der Uhrzeit an.", arrow=("up", 195)))

def p2_woche(st):
    hole = nav_hole(1)
    return tour(st, W50.p_start(st), hole, 26,
                bubble(st, 18, 600, 354, 2, "Deine Woche", "Öffne den Stundenplan.", action=True, arrow=("down", 173)), pulse=True)

def p3_ausfall(st):
    COLS, CW = p30.m19.COLS, p30.m19.CW
    gy = 114 + 82
    hole = (COLS[0] - 6, gy + 2 * 56 - 6, COLS[4] + CW - COLS[0] + 12, 64)
    return tour(st, W50.p_woche(st), hole, 20,
                bubble(st, 18, gy + 3 * 56 + 20, 354, 3, "Ausfall und Vertretung", "Rot gestrichelt — die Stunde fällt aus.", line2="Neue Änderungen kommen von selbst.", arrow=("up", COLS[2] + CW / 2)))

def p4_heute(st):
    COLS, CW = p30.m19.COLS, p30.m19.CW
    hole = (COLS[2] - 4, 110, CW + 8, 82)
    return tour(st, W50.p_woche(st), hole, 22,
                bubble(st, 18, 214, 354, 4, "Heute", "Öffne den heutigen Tag.", action=True, arrow=("up", COLS[2] + CW / 2)), pulse=True)

def p5_stunde(st):
    hole = (12, 206, 366, 70)
    return tour(st, W50.p_tag(st), hole, 26,
                bubble(st, 18, 292, 354, 5, "Eine Stunde", "Lehrkraft, Raum, Notiz und Hausaufgaben —", line2="alles in den Details der Stunde.", arrow=("up", 120)))

def p6_tests(st):
    base = W50.p_tag(st)
    hole = nav_hole(2)
    return tour(st, base, hole, 26,
                bubble(st, 18, 618, 354, 6, "Tests", "Alle Tests und Klausuren deiner Klasse.", arrow=("down", 250)))

def p7_mehr(st):
    base = W50.p_tag(st)
    hole = nav_hole(3)
    return tour(st, base, hole, 26,
                bubble(st, 18, 600, 354, 7, "Mehr", "Noten, Einstellungen, Sync —", line2="und diesen Rundgang noch mal.", last=True, arrow=("down", 327)))

def p8_ende(st):
    """Nach «Fertig» oder «Später»: zurück auf Start, kurzer Toast."""
    c = st.c
    base = strip(W50.p_start(st))
    t = R(18, 686, 354, 50, 18, c["toastbg"]) + ICON(34, 702, 0.75, c["toastfg"], CHECK, 2.2) + T(62, 716, "Rundgang findest du in Mehr", 14, 700, c["toastfg"])
    return st.page(390, 844, base + t)

# ════════════════ Mehr: строка «Rundgang» ════════════════
def p9_mehr(st):
    """Mehr: в группе «Hilfe» строка «Rundgang» — запускает тур заново."""
    c = st.c
    HELP = P("M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01") + '<circle cx="12" cy="12" r="10"/>'
    NEWS = P("M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6l-4.9 3.6 1.9-5.8L4 8.8h6.1z")
    LOCK = '<rect x="4" y="11" width="16" height="10" rx="2"/>' + P("M8 11V7a4 4 0 0 1 8 0v4")
    b = [p30.eyebrow(18, 33, "Klasse 9b", c), p30.title(18, 65, "Mehr", c)]
    y = 100
    b.append(p30.label(18, y, "Hilfe", c))
    b.append(st.card(18, y + 12, 354, 3 * 54))
    for i, (ic, name, right) in enumerate([(HELP, "Rundgang", "7 Schritte"), (NEWS, "Was ist neu", "v0.33"), (LOCK, "Datenschutz", "")]):
        ry = y + 12 + i * 54
        if i: b.append(p30.HL(56, 358, ry, c))
        b.append(ICON(32, ry + 15, 1, c["accink"] if i == 0 else c["muted"], ic, 2) + T(66, ry + 33, name, 15, 700, c["ink"]))
        if right: b.append(T(334, ry + 33, right, 13, 400, c["faint"], "end"))
        b.append(ICON(342, ry + 19, 0.67, c["faint2"], CHEV_R))
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + p30.nav(st, 3))
    return st.page(390, 844, "".join(b))

# ════════════════ ПК ════════════════
def pc1_fuer(st):
    hole = (276, 102, 552, 332)
    c = st.c
    return tour(st, W50.pc_start(st), hole, 32,
                bubble(st, 848, 150, 380, 1, "Für dich jetzt", "Weg, Wetter und Änderungen für heute —", line2="passt sich der Uhrzeit an."),
                size=(1440, 900)) .replace("</svg>", f'<path d="M848 210L839 220L848 230Z" fill="{c["card"]}"/></svg>')

def pc2_woche(st):
    hole = (26, 186, 212, 50)    # пункт «Woche» в боковой панели
    c = st.c
    return tour(st, W50.pc_start(st), hole, 25,
                bubble(st, 262, 150, 360, 2, "Deine Woche", "Öffne den Stundenplan.", action=True),
                pulse=True, size=(1440, 900)).replace("</svg>", f'<path d="M262 201L253 211L262 221Z" fill="{c["card"]}"/></svg>')

def soft(fn): return lambda th: fn(W.style("soft", th))

SCREENS = {
    "handy-00-willkommen": (soft(p_welcome), ("hell", "dunkel")),
    "handy-01-fuer-dich": (soft(p1_fuer), ("hell", "dunkel")),
    "handy-02-woche-tippen": (soft(p2_woche), ("hell",)),
    "handy-03-ausfall": (soft(p3_ausfall), ("hell", "dunkel")),
    "handy-04-heute-tippen": (soft(p4_heute), ("hell",)),
    "handy-05-stunde": (soft(p5_stunde), ("hell",)),
    "handy-06-tests": (soft(p6_tests), ("hell",)),
    "handy-07-mehr-fertig": (soft(p7_mehr), ("hell", "dunkel")),
    "handy-08-ende-toast": (soft(p8_ende), ("hell",)),
    "handy-09-mehr-rundgang": (soft(p9_mehr), ("hell", "dunkel")),
    "pc-01-fuer-dich": (soft(pc1_fuer), ("hell", "dunkel")),
    "pc-02-woche-klicken": (soft(pc2_woche), ("hell",)),
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
