# Макеты части 42 «Notenziel + Verlauf»:
#   • у предмета — цель («Ziel 2,0»): что нужно на следующей работе и «erreichbar / knapp / schwer» (развитие Notenrechner из 36b);
#   • график Schnitt по полугодию (точка = день, когда пришла оценка) с пунктиром цели — в карточке цвета предмета;
#   • «Schnitt» (нажатие на плитку в «Noten»): общий график, своя цель для общего Schnitt и список целей по предметам;
#   • в «Noten» у предмета — маленький значок «Ziel 2,0» цветом статуса; на плитке Schnitt — мини-график.
# Кирпичики — часть 36 (Noten, Fach, Notenrechner), 30 (St, шторка, строки), 35 (нижняя панель, боковое меню ПК).
import importlib.util, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g36", os.path.join(HERE, "..", "36-noten", "gen.py"))
N = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(N)
L, m, g = N.L, N.m, N.g
T, S, R, ICON, P, HL, DOT = N.T, N.S, N.R, N.ICON, N.P, N.HL, N.DOT
St, eyebrow, title, label = N.St, N.eyebrow, N.title, N.label
NOTEN, FLAG, CHEV_R, BACK = N.NOTEN, N.FLAG, N.CHEV_R, N.BACK
GR, ORDER, NAMES, avg, fmt, val, pill = N.GR, N.ORDER, N.NAMES, N.avg, N.fmt, N.val, N.pill
TARGET = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'

# ════════════════ Данные: цели (на устройстве + Sync) ════════════════
GOALS = {"Ma": 2.0, "De": 2.0, "Bio": 3.0}
GOAL_ALL = 2.0
NEXT_W = {"Ma": 2}          # следующая работа весит ×2 (у Mathe есть Klassenarbeit)

def need(code, goal, k=1):
    """Какую оценку нужно на следующей работе (вес k), чтобы Schnitt стал не хуже цели — как neededGrade в noten.js."""
    rows = GR[code]
    s = sum(val(z) * w for *_, w, z in rows)
    W = sum(w for *_, w, z in rows)
    return (goal * (W + k) - s) / k

def down(x):
    """Нужная оценка округляется в лучшую сторону (1,65 → 1,6), как в Notenrechner."""
    return max(1.0, math.floor(x * 10 + 1e-9) / 10)

def status(code, goal):
    """erreichbar — нужно не лучше своего Schnitt; knapp — лучше, но не больше чем на 0,7; schwer — сильнее или с одной нельзя."""
    x = need(code, goal, NEXT_W.get(code, 1))
    if x >= avg(code): return "erreichbar"
    if x >= 1.0 and avg(code) - x <= 0.7: return "knapp"
    return "schwer"

def stcol(st, s):
    c = st.c
    return {"erreichbar": (c["oktint"], c["ok"]), "knapp": (c["sand"], c["ink"]), "schwer": (c["dtint"], c["danger"])}[s]

def sbadge(st, x, y, s, anchor_end=True, h=22):
    """Бейдж статуса цели. x — правый край (по умолчанию)."""
    bg, fg = stcol(st, s)
    w = g.tw(s, 11.5, 800) * 0.9 + 18
    x0 = x - w if anchor_end else x
    return R(x0, y, w, h, h / 2, bg) + T(x0 + w / 2, y + h / 2 + 4, s, 11.5, 800, fg, "middle"), w

def goal_chip(st, x, y, code):
    """«Ziel 2,0» цветом статуса — в строке предмета в «Noten». x — правый край."""
    goal = GOALS[code]
    bg, fg = stcol(st, status(code, goal))
    t = f"Ziel {fmt(goal)}"
    w = g.tw(t, 11, 800) * 0.88 + 16
    return R(x - w, y, w, 20, 10, bg) + T(x - w / 2, y + 14, t, 11, 800, fg, "middle")

# ── ход Schnitt по датам оценок ──
def dkey(d, mo): return int(mo) * 100 + int(d)

def series(code):
    """[(«27.08.», Schnitt после этого дня)] — по одной точке на день с оценкой."""
    rows = sorted(GR[code], key=lambda r: dkey(r[0], r[1]))
    out, s, W = [], 0, 0
    for d, mo, wd, what, w, z in rows:
        s += val(z) * w; W += w
        out.append((f"{d}.{mo}.", s / W))
    return out

def series_all():
    """Общий Schnitt = среднее Schnitt предметов на каждый день, когда пришла какая-то оценка."""
    days = sorted({dkey(d, mo) for rows in GR.values() for d, mo, *_ in rows})
    out = []
    for k in days:
        avgs = []
        for code in ORDER:
            rows = [r for r in GR[code] if dkey(r[0], r[1]) <= k]
            if rows: avgs.append(sum(val(z) * w for *_, w, z in rows) / sum(w for *_, w, z in rows))
        out.append((f"{k % 100:02d}.{k // 100:02d}.", sum(avgs) / len(avgs)))
    return out

def chart(x, y, w, h, pts, goal, col, lo=1.0, hi=3.0, labels="ends"):
    """Линия Schnitt (1 — сверху, лучше = выше), пунктир цели, подписи 1/2/3 слева и даты снизу.
    labels: 'ends' — первая и последняя дата, 'all' — все."""
    gx, gw = x + 22, w - 22
    def Y(v): return y + (v - lo) / (hi - lo) * h
    def X(i): return gx + (gw * i / (len(pts) - 1) if len(pts) > 1 else gw / 2)
    out = []
    v = lo
    while v <= hi + 0.01:
        out.append(f'<line x1="{gx}" y1="{Y(v)}" x2="{x + w}" y2="{Y(v)}" stroke="{col}" stroke-opacity="0.16" stroke-width="1"/>'
                   + T(x, Y(v) + 4, str(int(v)), 11, 800, col, ls=0) .replace("<text", '<text opacity="0.6"', 1))
        v += 1
    if goal is not None:
        gy = Y(goal)
        out.append(f'<line x1="{gx}" y1="{gy}" x2="{x + w}" y2="{gy}" stroke="{col}" stroke-width="1.6" stroke-dasharray="5 4"/>')
        out.append(T(gx + 4, gy - 7, f"Ziel {fmt(goal)}", 11, 800, col))
    d = " ".join(f"{'M' if i == 0 else 'L'}{X(i):.1f},{Y(v):.1f}" for i, (_, v) in enumerate(pts))
    out.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>')
    for i, (lab, v) in enumerate(pts):
        last = i == len(pts) - 1
        out.append(DOT(X(i), Y(v), 5.5 if last else 3.6, col))
        if labels == "all" or i in (0, len(pts) - 1):
            out.append(T(X(i), y + h + 20, lab, 11, 700, col, "start" if i == 0 and labels == "ends" else "end" if last and labels == "ends" else "middle").replace("<text", '<text opacity="0.75"', 1))
    return "".join(out)

def spark(x, y, w, h, pts, col):
    lo, hi = min(v for _, v in pts) - 0.1, max(v for _, v in pts) + 0.1
    def Y(v): return y + (v - lo) / (hi - lo) * h
    d = " ".join(f"{'M' if i == 0 else 'L'}{x + w * i / (len(pts) - 1):.1f},{Y(v):.1f}" for i, (_, v) in enumerate(pts))
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' + DOT(x + w, Y(pts[-1][1]), 3.4, col)

# ════════════════ Кирпичики экрана ════════════════
def tiles(st, x, y, w):
    """Как в 36, но у Schnitt — шеврон (открывает «Schnitt»), мини-график и «Ziel 2,0»."""
    c = st.c
    tw = (w - 12) / 2
    out = [st.card(x, y, tw, 104), m.bhead(st, x, y, "Schnitt", NOTEN, True), ICON(x + tw - 28, y + 12, 0.62, c["faint2"], CHEV_R, 2.2),
           T(x + 14, y + 72, fmt(N.ALL), 34, 900, c["ink"], ls=-0.5), spark(x + 84, y + 50, tw - 104, 22, series_all(), c["accent"]),
           T(x + 14, y + 92, f"Ziel {fmt(GOAL_ALL)} · {N.COUNT} Noten", 12, 400, c["faint"])]
    x2 = x + tw + 12
    out += [st.card(x2, y, tw, 104), m.bhead(st, x2, y, "Fehlzeiten", N.FEHLZ), ICON(x2 + tw - 28, y + 12, 0.62, c["faint2"], CHEV_R, 2.2),
            T(x2 + 14, y + 72, "2", 34, 900, c["ink"], ls=-0.5) + T(x2 + 44, y + 71, "Tage", 15, 700, c["muted"]),
            T(x2 + 14, y + 92, S("16 Std. · ", 400, c["faint"]) + S("1 unentsch.", 700, c["danger"]), 12, 400, c["faint"], raw=True)]
    return "".join(out)

def subj_rows(st, x, y, w, sel=None, rh=62):
    """Строки предметов из 36 + значок цели слева от среднего."""
    rows, y2 = N.subj_rows(st, x, y, w, sel, rh)
    extra = [goal_chip(st, x + w - 74, y + i * rh + 21, code) for i, code in enumerate(ORDER) if code in GOALS]
    return rows + "".join(extra), y2

def schnitt_card(st, x, y, w, ttl, now, goal, pts, solid=None, empty=False, h=250):
    """Карточка цвета предмета (или фиолетовая для общего): SCHNITT 2,1 · справа цель и число оценок · график."""
    tint, text = solid if solid else (st.c["tint"], st.c["accink"])
    out = [R(x, y, w, h, st.rc, tint), T(x + 18, y + 30, "SCHNITT", 10.5, 800, text, ls=0.5), T(x + 18, y + 80, fmt(now), 42, 900, text, ls=-0.6)]
    out.append(T(x + w - 18, y + 52, f"Ziel {fmt(goal)}" if goal else "Kein Ziel", 14, 800, text, "end") + T(x + w - 18, y + 72, ttl, 12, 400, text, "end"))
    if empty:
        out.append(f'<line x1="{x + 18}" y1="{y + 170}" x2="{x + w - 18}" y2="{y + 170}" stroke="{text}" stroke-opacity="0.16"/>'
                   + T(x + w / 2, y + 160, "Verlauf ab 2 Noten", 13, 700, text, "middle"))
    else:
        out.append(chart(x + 18, y + 112, w - 36, 96, pts, goal, text, labels="all" if w > 400 else "ends"))
    return "".join(out)

def ziel_card(st, x, y, w, code):
    """Цель предмета: «Ziel 2,0» + что нужно на следующей работе + статус. Нажатие — шторка «Mein Ziel»."""
    c = st.c
    goal = GOALS[code]
    k = NEXT_W.get(code, 1)
    x_need = need(code, goal, k)
    s = status(code, goal)
    out = [st.card(x, y, w, 70), DOT(x + 34, y + 35, 20, c["tint"]), ICON(x + 24.5, y + 25.5, 0.79, c["accink"], TARGET, 2),
           T(x + 66, y + 30, f"Ziel {fmt(goal)}", 14.5, 800, c["ink"]),
           T(x + 66, y + 49, f"Nächste Note: {fmt(down(x_need))} oder besser", 12.5, 400, c["muted"])]
    bd, _ = sbadge(st, x + w - 38, y + 24, s); out.append(bd)
    out.append(ICON(x + w - 30, y + 26, 0.67, c["faint2"], CHEV_R))
    return "".join(out)

def grades_list(st, x, y, w, code, rh=64):
    c = st.c
    rows = GR[code]
    out = [label(x, y, "Noten", c), st.card(x, y + 12, w, rh * len(rows))]
    y += 12
    for i, (d, mo, wd, what, wt, z) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HL(x + 14, x + w - 14, ry, c))
        out.append(N.date_tile(st, x + 14, ry + 12, d, mo) + T(x + 66, ry + 29, what, 14.5, 800, c["ink"])
                   + T(x + 66, ry + 47, f"{wd.capitalize()} {d}.{mo}." + (f" · zählt ×{wt}" if wt > 1 else ""), 12, 400, c["faint"]))
        out.append(pill(st, x + w - 66, ry + 15, z, val(z), w=50))
    return "".join(out), y + rh * len(rows)

# ════════════════ Телефон ════════════════
# 01 · Noten — обзор с целями
def p_noten(st):
    c = st.c
    x, w = 18, 354
    b = [N.head(st), st.seg(x, 96, w, ["1. Halbjahr", "2. Halbjahr", "Zeugnis"], 0), N.stand(st, 150)]
    y = 166
    b.append(tiles(st, x, y, w)); y += 104 + 30
    b.append(label(x, y, "Fächer", c)); y += 12
    rows, y = subj_rows(st, x, y, w); b.append(rows); y += 30
    b.append(N.account(st, x, y, w)); y += 70 + 24 + 80
    b.append(N.bar(st, y - 80))
    return st.page(390, y, "".join(b))

# 02 · Fach mit Ziel und Verlauf
def p_fach(st, code="Ma"):
    c = st.c
    x, w = 18, 354
    solid, tint, text = st.sub[code]
    goal = GOALS.get(code)
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Noten · 1. Halbjahr", c), title(66, 65, NAMES[code], c)]
    n = len(GR[code])
    b.append(schnitt_card(st, x, 96, w, f"{n} Noten" if n > 1 else "1 Note", avg(code), goal, series(code), (tint, text), empty=n < 2))
    y = 96 + 250 + 14
    if goal:
        b.append(ziel_card(st, x, y, w, code)); y += 70 + 30
    else:
        b.append(st.button(x, y, w, "Ziel setzen", "sand", TARGET, h=46)); y += 46 + 30
    body, y = grades_list(st, x, y, w, code); b.append(body); y += 18
    if code == "Ma":
        b.append(st.card(x, y, w, 58) + m.link_row(st, x, y, w, FLAG, "Nächster Test", "Fr 19.09.", True)); y += 58
    H = max(844, y + 18 + 80)
    b.append(N.bar(st, H - 80))
    return st.page(390, H, "".join(b))

# 03 · Шторка «Mein Ziel» (бывший Notenrechner): цель + вес следующей → что нужно и статус; «Speichern»
def p_ziel(st):
    c = st.c
    s = p_fach(st)
    H = int(float(s.split('height="', 1)[1].split('"')[0]))
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    top = H - 472
    x, w = 18, 354
    b = [inner, m.sheet(st, top, "Mathe · jetzt 2,1", "Mein Ziel", H)]
    y = top + 98
    b.append(st.card(x, y, w, 116) + m.set_row(st, x, y, w, "Ziel", N.stepper(st, x + w - 14 - 132, y + 11, "2,0"), True)
             + m.set_row(st, x, y + 58, w, "Nächste Note zählt", st.seg(x + w - 14 - 120, y + 69, 120, ["×1", "×2"], 1)))
    y += 116 + 14
    bd, _ = sbadge(st, x + w - 18, y + 16, "knapp")
    b.append(R(x, y, w, 110, st.rc, c["tint"]) + T(x + 18, y + 30, "DU BRAUCHST", 10.5, 800, c["accink"], ls=0.5) + bd
             + T(x + 18, y + 74, "1,6", 40, 900, c["accink"], ls=-0.6) + T(x + 100, y + 73, "oder besser", 15, 700, c["ink"])
             + T(x + 18, y + 96, "Dann ist dein Schnitt in Mathe 2,0.", 12.5, 400, c["muted"]))
    y += 110 + 18
    b.append(st.button(x, y, w, "Speichern", "primary")); y += 48 + 6
    b.append(T(x + w / 2, y + 26, "Ziel entfernen", 14, 800, c["danger"], "middle"))
    return st.page(390, H, "".join(b))

# 04 · «Schnitt» — общий ход, своя цель, цели предметов
def p_schnitt(st):
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Noten · 1. Halbjahr", c), title(66, 65, "Schnitt", c)]
    b.append(schnitt_card(st, x, 96, w, f"{N.COUNT} Noten · {len(ORDER)} Fächer", N.ALL, GOAL_ALL, series_all()))
    y = 96 + 250 + 14
    b.append(st.card(x, y, w, 58) + m.link_row(st, x, y, w, TARGET, "Mein Ziel", fmt(GOAL_ALL), True)); y += 58 + 30
    b.append(label(x, y, "Ziele in Fächern", c)); y += 12
    codes = [k for k in ORDER if k in GOALS]
    rh = 62
    b.append(st.card(x, y, w, rh * len(codes)))
    for i, code in enumerate(codes):
        ry = y + i * rh
        if i: b.append(HL(x + 14, x + w - 14, ry, c))
        b.append(N.subj_cell(st, x + 14, ry + 11, code) + T(x + 66, ry + 28, NAMES[code], 14.5, 800, c["ink"])
                 + T(x + 66, ry + 47, f"jetzt {fmt(avg(code))} · Ziel {fmt(GOALS[code])}", 12.5, 400, c["faint"]))
        bd, _ = sbadge(st, x + w - 38, ry + 20, status(code, GOALS[code])); b.append(bd)
        b.append(ICON(x + w - 30, ry + 22, 0.67, c["faint2"], CHEV_R))
    b.append(N.bar(st))
    return st.page(390, 844, "".join(b))

# 05 · Fach: одна оценка и цели нет
def p_fach_leer(st): return p_fach(st, "Ge")

# ════════════════ ПК ════════════════
def pc_noten(st):
    c = st.c
    side, _ = L.pc_side_groups(st, active="Noten")
    b = [side, eyebrow(284, 39, "Leistung", c), title(284, 80, "Noten", c, 38)]
    b.append(st.seg(1060, 44, 300, ["1. Halbjahr", "2. Halbjahr", "Zeugnis"], 0) + st.rbtn(1378, 43, N.REFRESH, size=36))
    X, W = 284, 520
    b.append(N.stand(st, 104, x=X))
    b.append(tiles(st, X, 122, W))
    b.append(label(X, 258, "Fächer", c))
    rows, y = subj_rows(st, X, 270, W, sel="Ma"); b.append(rows)
    b.append(N.account(st, X, y + 26, W))
    RX, RW = 828, 596
    _, tint, text = st.sub["Ma"]
    b.append(T(RX, 104, "Mathe", 22, 900, c["ink"]) + T(RX + RW, 104, "Nächster Test · Fr 19.09.", 13, 700, c["accink"], "end"))
    b.append(schnitt_card(st, RX, 122, RW, "4 Noten · Klassenarbeit zählt ×2", avg("Ma"), GOALS["Ma"], series("Ma"), (tint, text)))
    b.append(ziel_card(st, RX, 386, RW, "Ma"))
    body, _ = grades_list(st, RX, 486, RW, "Ma"); b.append(body)
    return st.page(1440, 900, "".join(b))

SCREENS = {
    "handy-01-noten": (p_noten, ("hell", "dunkel")),
    "handy-02-fach": (p_fach, ("hell", "dunkel")),
    "handy-03-ziel": (p_ziel, ("hell", "dunkel")),
    "handy-04-schnitt": (p_schnitt, ("hell", "dunkel")),
    "handy-05-fach-ohne-ziel": (p_fach_leer, ("hell",)),
    "pc-01-noten": (pc_noten, ("hell", "dunkel")),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(St("soft", theme)))
            n += 1
    print(n, "files")
