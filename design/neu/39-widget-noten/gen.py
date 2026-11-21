# Макеты части 39 «Widgets Noten, Neue Noten, Fehlzeiten» (Android):
#   • три новых вида виджета во всех размерах — тем же правилом fit() и «+ N weitere», что в 31d;
#   • по умолчанию оценки и числа скрыты («•••»), предметы видно; «Noten anzeigen» в «Widget einstellen» — показать;
#   • состояния: не вошёл в InfoPoint, ещё нет оценок, нет пропусков;
#   • Soft / Glas / Klar на рабочем столе, «Widget einstellen» с двенадцатью видами.
# Кирпичики: генератор 31d (виджеты, рабочий стол, настройка) и данные экрана «Noten» из части 36.
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

W = _load("g31d", "31d-widget-design")
N = _load("g36", "36-noten")
g, p30 = W.g, W.p30
T, S, R, ICON, P, HL, DOT = g.T, g.S, g.R, g.ICON, g.P, W.HL, W.DOT
bhead, label, eyebrow, title, fit, more, frame, size, style = W.bhead, W.label, W.eyebrow, W.title, W.fit, W.more, W.frame, W.size, W.style
NOTEN, FEHLZ = N.NOTEN, N.FEHLZ
NEW_I = P("M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.6-.8z")   # звезда — «Neue Noten»
CHECK, CHEV_R, CLOSE = W.CHECK, W.CHEV_R, W.CLOSE
NAMES, GR, ORDER, NEWSUBJ = N.NAMES, N.GR, N.ORDER, N.NEW
val, avg, fmt, ALL = N.val, N.avg, N.fmt, N.ALL
HIDE = "•••"
MON = {"08": "Aug", "09": "Sep"}

def gcol(st, v):
    """Цвет оценки как на экране «Noten»: до 2,5 зелёная, после 3,5 красная."""
    c = st.c
    if v <= 2.5: return c["oktint"], c["ok"]
    if v > 3.5: return c["dtint"], c["danger"]
    return c["sand"], c["ink"]

def pill(st, x, y, text, v, show, w=44, h=26, fs=13.5):
    """Оценка в плашке. Скрыто — нейтральная плашка «•••», по ней нельзя угадать оценку."""
    c = st.c
    r = h / 2 if st.style != "klar" else 6
    if not show: return R(x, y, w, h, r, c["sand"]) + T(x + w / 2, y + h / 2 + 4.5, HIDE, 12, 900, c["faint"], "middle", 1)
    bg, fg = gcol(st, v)
    return R(x, y, w, h, r, bg) + T(x + w / 2, y + h / 2 + fs * 0.36, text, fs, 900, fg, "middle")

def neu(st, x, y):
    c = st.c
    return R(x, y, 30, 16, 8 if st.style != "klar" else 4, c["accent"]) + T(x + 15, y + 11.8, "neu", 9.5, 800, c["on"], "middle")

def dot(st, cx, cy, code, r=4.5): return DOT(cx, cy, r, st.sub[code][0])
def nw(text, fs, wt=800): return g.tw(text, fs, wt) * 1.08

# ════════════════ Noten: Schnitt + предметы со средним ════════════════
def subj_items():
    # новые — первыми (важнее), остальные по порядку экрана «Noten»
    return [dict(order=i, prio=0 if code in NEWSUBJ else 1 + i, code=code) for i, code in enumerate(ORDER)]

def r_subj(st, x, ry, w, rh, mode, it, show):
    c = st.c
    code = it["code"]
    narrow = w < 170
    name = code if narrow and len(NAMES[code]) > 9 else NAMES[code]
    pw, ph = (44, 26) if mode != "dicht" else (38, 19)
    out = [dot(st, x + 18, ry + rh / 2, code)]
    if mode == "normal":   # две строки: предмет / последние оценки
        my = ry + rh / 2 - 2
        out.append(T(x + 30, my + 3, name, 14, 800, c["ink"]))
        sub = "  ·  ".join(z for *_, z in GR[code][:4]) if show else f'{len(GR[code])} Noten'
        out.append(T(x + 30, my + 19, sub, 11.5, 700 if show else 400, c["muted"] if show else c["faint"]))
        if code in NEWSUBJ: out.append(neu(st, x + 30 + nw(name, 14) + 6, my - 9.5))
    else:
        fs = 13.5 if mode == "kompakt" else 12.5
        out.append(T(x + 30, ry + rh / 2 + 4.5, name, fs, 700, c["ink"]))
        if code in NEWSUBJ: out.append(neu(st, x + 30 + nw(name, fs, 700) + 5, ry + rh / 2 - 8))
    out.append(pill(st, x + w - 14 - pw, ry + (rh - ph) / 2, fmt(avg(code)), avg(code), show, pw, ph, 13.5 if ph > 20 else 12))
    return "".join(out)

def list_rows(st, x, y, w, h, items, draw, modes, show, cols=1):
    """Строки по правилу fit(); в широком виджете — в две колонки, если в одну не влезает."""
    if cols == 2 and len(items) * modes[-1][1] > h:
        cw = (w - 8) / 2
        # две колонки = то же правило, но на строку приходится два пункта
        pairs = [dict(order=i, prio=min(it["prio"] for it in items[i * 2:i * 2 + 2])) for i in range((len(items) + 1) // 2)]
        mode, rh, keep, _ = fit(pairs, h, modes)
        per = len(keep)
        rows = sorted(sorted(items, key=lambda it: it["prio"])[:per * 2], key=lambda it: it["order"])
        hidden = len(items) - len(rows)
        out = []
        for j, it in enumerate(rows):
            col, k = divmod(j, (len(rows) + 1) // 2)
            cx, ry = x + col * (cw + 8), y + k * rh
            if k: out.append(HL(cx + 14, cx + cw - 14, ry, st.c))
            out.append(draw(st, cx, ry, cw, rh, mode, it, show))
        if hidden: out.append(more(st, x + 14, y + ((len(rows) + 1) // 2) * rh + 15, hidden))
        return "".join(out)
    mode, rh, rows, hidden = fit(items, h, modes)
    out = []
    for j, it in enumerate(rows):
        ry = y + j * rh
        if j: out.append(HL(x + 14, x + w - 14, ry, st.c))
        out.append(draw(st, x, ry, w, rh, mode, it, show))
    if hidden: out.append(more(st, x + 14, y + len(rows) * rh + 15, hidden))
    return "".join(out)

def stand(st, x, y, w): return T(x + w - 14, y + 24.5, "Stand 16.09.", 11.5, 700, st.c["faint"], "end")

def w_noten(st, x, y, w, h, show=False):
    c = st.c
    narrow = w < 200
    schnitt = fmt(ALL) if show else HIDE
    big = lambda bx, by, fs: (T(bx, by, schnitt, fs, 900, c["ink"] if show else c["faint"], ls=-0.5 if show else 2)
                              + T(bx + (nw(schnitt, fs, 900) if show else fs * 2.1) + 6, by - 1, "Schnitt", 12.5, 600, c["muted"]))
    if h < 120:   # x×1: Schnitt и что нового
        out = [ICON(x + 14, y + 13.5, 0.58, c["accink"], NOTEN, 2.2), T(x + 34, y + 24.5, "NOTEN", 10.5, 800, c["accink"], ls=0.5)]
        if narrow:
            return "".join(out) + big(x + 14, y + 55, 22) + neu(st, x + w - 44, y + 12)
        newtxt = S("Neu: ", 800, c["accink"]) + S("Mathe" + (" 3+" if show else ""), 700, c["ink"])
        return "".join(out) + stand(st, x, y, w) + big(x + 14, y + 57, 24) + T(x + w - 14, y + 55, newtxt, 13, 700, c["ink"], "end", raw=True)
    out = [bhead(st, x, y, "Noten", NOTEN, True)]
    if not narrow: out.append(stand(st, x, y, w))
    top = 76 if narrow else 74
    out.append(big(x + 14, y + top - 8, 28))
    out.append(HL(x + 14, x + w - 14, y + top + 6, c))
    modes = [("normal", 46), ("kompakt", 30), ("dicht", 23)]
    out.append(list_rows(st, x, y + top + 8, w, h - top - 8 - 8, subj_items(), r_subj, modes, show, 1 if narrow else 2))
    return "".join(out)

# ════════════════ Neue Noten: последние оценки ════════════════
LATEST = sorted(((d, mo, wd, what, wt, z, code) for code, rows in GR.items() for d, mo, wd, what, wt, z in rows),
                key=lambda r: (r[1], r[0]), reverse=True)

def when(d, mo, wd): return f"{wd.capitalize()} {d}.{mo}."

def r_grade(st, x, ry, w, rh, mode, it, show):
    c = st.c
    d, mo, wd, what, wt, z, code = it["d"]
    narrow = w < 200
    new = it["order"] == 0
    name = code if narrow and len(NAMES[code]) > 9 else NAMES[code]
    out = [dot(st, x + 18, ry + rh / 2, code)]
    pw, ph = (44, 26) if mode != "dicht" else (38, 19)
    if mode == "normal":
        my = ry + rh / 2 - 2
        out.append(T(x + 30, my + 3, name, 14, 800, c["ink"]))
        if new: out.append(neu(st, x + 30 + nw(name, 14) + 6, my - 9.5))
        out.append(T(x + 30, my + 19, what.split(" · ")[0] if narrow else f"{what} · {when(d, mo, wd)}", 11.5, 400, c["faint"]))
    else:
        fs = 13.5 if mode == "kompakt" else 12.5
        my = ry + rh / 2 + 4.5
        out.append(T(x + 30, my, name, fs, 700, c["ink"]))
        if new: out.append(neu(st, x + 30 + nw(name, fs, 700) + 5, ry + rh / 2 - 8))
        if not narrow:   # Art — своей колонкой, чтобы строки читались как таблица
            out.append(T(x + 136, my, what.split(" · ")[0], 11.5, 400, c["faint"]))
            out.append(T(x + w - 14 - pw - 10, my, f"{wd.capitalize()} {d}.{mo}.", 11.5, 400, c["faint"], "end"))
    out.append(pill(st, x + w - 14 - pw, ry + (rh - ph) / 2, z, val(z), show, pw, ph, 13.5 if ph > 20 else 12))
    return "".join(out)

def w_neue(st, x, y, w, h, show=False):
    c = st.c
    narrow = w < 200
    items = [dict(order=i, prio=i, d=d) for i, d in enumerate(LATEST)]
    d, mo, wd, what, wt, z, code = LATEST[0]
    if h < 120:
        head = ICON(x + 14, y + 13.5, 0.58, c["accink"], NEW_I, 2.2) + T(x + 34, y + 24.5, "NEUE NOTEN", 10.5, 800, c["accink"], ls=0.5)
        grade = (lambda px, py: pill(st, px, py, z, val(z), show))
        if narrow:
            return (head + T(x + 14, y + 52, NAMES[code], 16, 900, c["ink"]) + grade(x + w - 58, y + 34)
                    + T(x + 14, y + 67, f"{what.split(' ')[0]} · {wd.capitalize()}", 11.5, 400, c["faint"]))
        return (head + T(x + w - 14, y + 24.5, when(d, mo, wd), 12, 800, c["ink"], "end")
                + T(x + 14, y + 55, S(NAMES[code], 900, c["ink"]) + S(f"  {what}", 400, c["muted"]), 15, 400, c["ink"], raw=True)
                + grade(x + w - 58, y + 36))
    out = [bhead(st, x, y, "Neu" if narrow else "Neue Noten", NEW_I, True, right=None if narrow else f"{len(LATEST)} seit 26.08.", w=w)]
    modes = [("normal", 46), ("kompakt", 30), ("dicht", 23)]
    out.append(list_rows(st, x, y + 38, w, h - 38 - 8, items, r_grade, modes, show))
    return "".join(out)

# ════════════════ Fehlzeiten: Tage, Stunden, unentschuldigt ════════════════
FZ = N.FZ
NUMS = [("2", "Fehltage", False), ("16", "Fehlstunden", False), ("1", "unentschuldigt", True)]

def num(st, x, y, n, fs, bad, show):
    c = st.c
    if not show: return T(x, y, HIDE, fs * 0.8, 900, c["faint"], ls=2)
    return T(x, y, n, fs, 900, c["danger"] if bad else c["ink"], ls=-0.5)

def hw(fs): return fs * 0.8 * 1.8 + 8   # ширина «•••» вместо числа

def w_fehl(st, x, y, w, h, show=False):
    c = st.c
    narrow = w < 200
    if h < 120:
        head = ICON(x + 14, y + 13.5, 0.58, c["faint"], FEHLZ, 2.2) + T(x + 34, y + 24.5, "FEHLZEITEN", 10.5, 800, c["faint"], ls=0.5)
        if narrow:
            return (head + num(st, x + 14, y + 55, "2", 24, False, show) + T(x + (34 if show else 14 + hw(24)), y + 54, "Tage", 12.5, 700, c["muted"])
                    + T(x + 14, y + 70, S("16 Std. · ", 400, c["faint"]) + S("1 unentsch.", 700, c["danger"]) if show else "", 11.5, 400, c["faint"], raw=True))
        out = [head, T(x + w - 14, y + 24.5, "1. Halbjahr", 12, 800, c["ink"], "end")]
        for i, (n, cap, bad) in enumerate(NUMS):
            cx = x + 14 + i * (w - 28) / 3
            out.append(num(st, cx, y + 56, n, 22, bad, show) + T(cx + (nw(n, 22, 900) + 5 if show else hw(22)), y + 55, {"Fehltage": "Tage", "Fehlstunden": "Std.", "unentschuldigt": "unentsch."}[cap], 12, 700, c["danger"] if bad and show else c["muted"]))
        return "".join(out)
    out = [bhead(st, x, y, "Fehlzeiten", FEHLZ, right=None if narrow else "1. Halbjahr", w=w)]
    if narrow:   # 2×2: главное число + две строки
        out.append(num(st, x + 14, y + 74, "2", 30, False, show) + T(x + (40 if show else 14 + hw(30)), y + 73, "Fehltage", 13, 700, c["muted"]))
        for j, (n, cap, bad) in enumerate(NUMS[1:]):
            ry = y + 92 + j * 28
            out.append(HL(x + 14, x + w - 14, ry, c) + T(x + 14, ry + 19, cap, 12.5, 600, c["ink"])
                       + T(x + w - 14, ry + 19, n if show else HIDE, 13.5, 900, (c["danger"] if bad else c["ink"]) if show else c["faint"], "end"))
        return "".join(out)
    tw_ = (w - 28 - 16) / 3
    for i, (n, cap, bad) in enumerate(NUMS):
        tx = x + 14 + i * (tw_ + 8)
        out.append(R(tx, y + 40, tw_, 72, 14 if st.style != "klar" else 6, c["sand"]) + num(st, tx + 12, y + 79, n, 26, bad, show)
                   + T(tx + 12, y + 100, cap, 10.5, 700, c["muted"]))
    if h < 240: return "".join(out)
    # 4×3: последние пропуски
    out.append(label(x + 14, y + 140, "Zuletzt", c))
    for j, (d, mo, wd, what, sub, ok) in enumerate(FZ):
        ry = y + 146 + j * 31
        if ry + 31 > y + h - 6: break
        if j: out.append(HL(x + 14, x + w - 14, ry, c))
        out.append(T(x + 14, ry + 20, f"{wd.capitalize()} {d}.{mo}.", 13, 800, c["ink"]))
        out.append(T(x + 96, ry + 20, what if show else HIDE, 12.5, 400 if show else 900, c["muted"] if show else c["faint"]))
        if show:
            txt = "entschuldigt" if ok else "unentschuldigt"
            out.append(T(x + w - 14, ry + 20, txt, 11.5, 800, c["ok"] if ok else c["danger"], "end"))
    return "".join(out)

# ════════════════ Состояния ════════════════
def w_login(st, x, y, w, h, kind="noten"):
    """Не вошёл в InfoPoint (или вышел): виджет зовёт войти в приложении, нажатие открывает «Noten»."""
    c = st.c
    icon, head = {"noten": (NOTEN, "Noten"), "neue": (NEW_I, "Neue Noten"), "fehl": (FEHLZ, "Fehlzeiten")}[kind]
    out = [bhead(st, x, y, head if w > 200 or len(head) < 8 else "Noten", icon, True)]
    if h < 120:
        return out[0] + T(x + 14, y + 54, "In ORBook bei Noten anmelden", 13, 800, c["ink"]) if w > 200 else (
            out[0] + T(x + 14, y + 50, "Bei Noten", 13.5, 800, c["ink"]) + T(x + 14, y + 66, "anmelden", 13.5, 800, c["ink"]))
    cy = y + h / 2 + 10
    out.append(ICON(x + w / 2 - 14, cy - 44, 1.17, c["faint2"], NOTEN, 1.8))
    if w < 200:
        out.append(T(x + w / 2, cy + 6, "In ORBook bei", 13, 800, c["ink"], "middle") + T(x + w / 2, cy + 23, "Noten anmelden", 13, 800, c["ink"], "middle"))
    else:
        out.append(T(x + w / 2, cy + 8, "In ORBook bei Noten anmelden", 14, 800, c["ink"], "middle"))
    return "".join(out)

def w_empty(st, x, y, w, h, kind):
    c = st.c
    if kind == "neue":
        return (bhead(st, x, y, "Neue Noten", NEW_I, True, right="2. Halbjahr", w=w)
                + T(x + w / 2, y + h / 2 + 14, "Noch keine Noten", 14, 800, c["muted"], "middle"))
    return (bhead(st, x, y, "Fehlzeiten", FEHLZ, right="1. Halbjahr", w=w)
            + ICON(x + w / 2 - 12, y + h / 2 - 20, 1, c["ok"], CHECK, 2.2)
            + T(x + w / 2, y + h / 2 + 26, "Keine Fehlzeiten", 14, 800, c["ink"], "middle"))

DRAW = dict(noten=w_noten, neue=w_neue, fehl=w_fehl)

def widget(st, kind, x, y, w, h, show=False, alpha=1.0):
    return frame(st, x, y, w, h, alpha) + DRAW[kind](st, x, y, w, h, show)

# ════════════════ 01–03 · Размеры (скрыто / видно) ════════════════
KINDS = [("noten", "Noten", NOTEN, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 4)]),
         ("neue", "Neue Noten", NEW_I, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 4)]),
         ("fehl", "Fehlzeiten", FEHLZ, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 3)])]

def p_sizes(kind, name, sizes, show, theme="hell"):
    st = style("soft", theme)
    Wd = 24 + 173 + 24 + 358 + 24
    cols = {True: [24, 74], False: [24 + 173 + 24, 74]}
    body = []
    for cw, rh in sizes:
        w, h = size(cw, rh)
        col = cols[cw <= 2]
        x, y = col
        body.append(T(x + 2, y + 16, f"{cw} × {rh}", 12.5, 800, W.fg(st)))
        body.append(widget(st, kind, x, y + 26, w, h, show))
        col[1] = y + 26 + h + 24
    H = max(cols[True][1], cols[False][1]) + 8
    head = T(24, 46, name, 26, 900, W.fg(st), ls=-0.4) + T(Wd - 24, 46, "Noten anzeigen: an" if show else "Standard: verborgen", 13, 800, W.fg(st), "end")
    return g.svg(Wd, H, st.c, W.wallpaper(st, 0, 0, Wd, H) + head + "".join(body), W.wall_defs(Wd) + st.defs(Wd, H))

# ════════════════ 04 · Состояния ════════════════
def p_states(theme="hell"):
    st = style("soft", theme)
    Wd = 24 + 173 + 24 + 358 + 24
    w2, h2 = size(2, 2)
    w4, h1 = size(4, 1)
    _, h4 = size(4, 2)
    out = [T(24, 46, "Ohne Anmeldung", 26, 900, W.fg(st), ls=-0.4)]
    y = 74
    out.append(T(26, y + 16, "Noten · 2 × 2", 12.5, 800, W.fg(st)) + frame(st, 24, y + 26, w2, h2) + w_login(st, 24, y + 26, w2, h2))
    x4 = 24 + 173 + 24
    out.append(T(x4 + 2, y + 16, "Fehlzeiten · 4 × 1", 12.5, 800, W.fg(st)) + frame(st, x4, y + 26, w4, h1) + w_login(st, x4, y + 26, w4, h1, "fehl"))
    out.append(T(x4 + 2, y + 26 + h1 + 40, "Neue Noten · 4 × 2", 12.5, 800, W.fg(st)))
    yy = y + 26 + h1 + 50
    out.append(frame(st, x4, yy, w4, h4) + w_login(st, x4, yy, w4, h4, "neue"))
    y = max(y + 26 + h2, yy + h4) + 50
    out.append(T(24, y, "Leer", 26, 900, W.fg(st), ls=-0.4))
    y += 28
    out.append(T(26, y + 16, "Neue Noten · neues Halbjahr", 12.5, 800, W.fg(st)) + frame(st, 24, y + 26, w4, h4) + w_empty(st, 24, y + 26, w4, h4, "neue"))
    y += 26 + h4 + 24
    out.append(T(26, y + 16, "Fehlzeiten · keine", 12.5, 800, W.fg(st)) + frame(st, 24, y + 26, w4, h4) + w_empty(st, 24, y + 26, w4, h4, "fehl"))
    H = y + 26 + h4 + 30
    return g.svg(Wd, H, st.c, W.wallpaper(st, 0, 0, Wd, H) + "".join(out), W.wall_defs(Wd) + st.defs(Wd, H))

# ════════════════ 05 · Soft / Glas / Klar на рабочем столе ════════════════
def home_set(st):
    w2, h2 = size(2, 2)
    w4, h2w = size(4, 2)
    _, h3 = size(4, 3)
    return (widget(st, "noten", 16, 52, w4, h2w) + widget(st, "neue", 16, 228, w2, h2) + widget(st, "fehl", 201, 228, w2, h2)
            + widget(st, "fehl", 16, 404, w4, h3))

def p_designs(theme):
    Wd = 3 * 390 + 2 * 32 + 48
    H = 40 + 844 + 24
    out = []
    for i, d in enumerate(["soft", "glas", "klar"]):
        st = style(d, theme)
        ox = 24 + i * (390 + 32)
        out.append(T(ox + 4, 28, {"soft": "Soft", "glas": "Glas", "klar": "Klar"}[d], 18, 900, st.c["ink"]) + W.phone(st, ox, home_set(st)))
    return g.svg(Wd, H, style("soft", theme).c, "".join(out), W.wall_defs(390) + style("glas", theme).defs(390, 844))

# ════════════════ 06 · Widget einstellen (вид «Noten») ════════════════
ALL_KINDS = W.KINDS + [(k, n, i, s) for k, n, i, s in KINDS]

def p_config(theme="hell"):
    st = style("soft", theme)
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, CLOSE), eyebrow(66, 33, "Widget · 4 × 2", c), title(66, 65, "Einstellen", c)]
    y = 92
    pw, ph = size(4, 2)
    b.append(W.wallpaper(st, x, y, w, ph * 0.9 + 32, clip=("pv", st.rc)))
    b.append(f'<g transform="translate({x + 16} {y + 16}) scale({(w - 32) / pw})">{widget(st, "noten", 0, 0, pw, ph)}</g>')
    y += ph * 0.9 + 32 + 30
    b.append(label(x, y, "Inhalt", c)); y += 12
    ch_, _ = W.chips(st, x, y, w, ALL_KINDS, "noten"); b.append(ch_); y += 4 * 64 + 3 * 8 + 30   # 12 видов — 4 ряда плиток
    b.append(label(x, y, "Anzeige", c)); y += 12
    b.append(st.card(x, y, w, 54))
    b.append(W.row(st, x, y, w, "Noten anzeigen", st.switch(x + w - 56, y + 15, False), True))
    y += 54 + 30
    b.append(label(x, y, "Aussehen", c)); y += 12
    b.append(st.card(x, y, w, 54 * 3))
    b.append(W.row(st, x, y, w, "Design", st.seg(x + w - 14 - 224, y + 9, 224, ["Wie App", "Soft", "Glas", "Klar"], 0, fs=11.5), True))
    b.append(W.row(st, x, y + 54, w, "Hell / Dunkel", st.seg(x + w - 14 - 196, y + 63, 196, ["Wie App", "Hell", "Dunkel"], 0, fs=11.5)))
    b.append(W.row(st, x, y + 108, w, "Schrift", st.seg(x + w - 14 - 150, y + 117, 150, ["S", "M", "L"], 1)))
    y += 54 * 3 + 14
    b.append(label(x + 14, y + 6, "Akzent", c)); y += 16
    b.append(W.swatches(st, x, y, w)); y += 64 + 30
    H = y + 92
    b.append(R(0, H - 92, 390, 92, 0, c["paper"]) + HL(0, 390, H - 92, c) + st.button(18, H - 76, 354, "Fertig", "primary", CHECK))
    return g.svg(390, H, c, "".join(b), W.wall_defs(390))

SCREENS = {}
for i, (kind, name, _, sizes) in enumerate(KINDS):
    SCREENS[f"handy-{i + 1:02d}-{kind}"] = ((lambda k=kind, n=name, s=sizes: lambda th: p_sizes(k, n, s, False, th))(), ("hell",))
    SCREENS[f"handy-{i + 1:02d}-{kind}-sichtbar"] = ((lambda k=kind, n=name, s=sizes: lambda th: p_sizes(k, n, s, True, th))(), ("hell",))
SCREENS["handy-04-ohne-anmeldung"] = (p_states, ("hell",))
SCREENS["handy-05-designs"] = (p_designs, ("hell", "dunkel"))
SCREENS["handy-06-einstellen"] = (p_config, ("hell", "dunkel"))

if __name__ == "__main__":
    n = 0
    only = sys.argv[2] if len(sys.argv) > 2 else None
    for name, (fn, themes) in SCREENS.items():
        if only and only not in name: continue
        for th in themes:
            open(os.path.join(OUT, f"{name}-{th}.svg"), "w", encoding="utf-8").write(fn(th))
            n += 1
    print(n, "files")
