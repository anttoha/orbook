# Макеты части 31d «Widgets: Design, Inhalt, Einstellungen»:
#   • все 9 видов виджета в 4–5 размерах (2×1 … 4×5): одно правило содержания на любой размер;
#   • оформление как в приложении: Soft / Glas / Klar, светлая и тёмная, акцентный цвет, прозрачность фона;
#   • «Widget einstellen» с новыми настройками (+ настройки, которые есть только у отдельных видов).
# Правило содержания (его же потом повторяет Kotlin — WidgetLayout.kt):
#   1) порядок важности: идущий/ближайший урок → отмены и замены → остальное → уже прошедшее;
#   2) не влезает — плотнее (normal 2 строки → kompakt 1 строка → dicht мельче), а не обрезка;
#   3) всё равно не влезает — последняя строка «+ N weitere», текст не режется молча.
# Рабочий стол, обои и St (оформления) — из генераторов частей 31 и 30.
import importlib.util, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp); sp.loader.exec_module(mod)
    return mod

w31 = _load("g31", "31-android-widget")
p30, g, k = w31.p30, w31.g, w31.k
T, S, R, ICON, P, struck = g.T, g.S, g.R, g.ICON, g.P, k.struck
St, HL, DOT, eyebrow, title, label, bhead = p30.St, p30.HL, p30.DOT, p30.eyebrow, p30.title, p30.label, p30.bhead
CLOCK, LIST, WEEK_I, FLAG, LIST_CHECK, REFRESH, CAL, FILE, SUN = (
    p30.CLOCK, p30.LIST, p30.WEEK_I, p30.FLAG, p30.LIST_CHECK, p30.REFRESH, p30.CAL, p30.FILE, p30.SUN)
CHECK, CHEV_R, CLOSE = g.CHECK, g.CHEV_R, g.CLOSE
NAMES, TEACH, ROOM, WEEK = p30.NAMES, p30.TEACH, p30.ROOM, p30.WEEK
wallpaper, wall_defs, statusbar, dock, fg = w31.wallpaper, w31.wall_defs, w31.statusbar, w31.dock, w31.fg

# ── Акценты: те же значения, что [data-accent=…] в src/index.css ──
ACC = {"violett": ("Violett", ("#6C4DF6", "#4A31C9", "#EEE9FF", "#FFFFFF"), ("#A58BFF", "#CFC2FF", "#2C2548", "#1A1333")),
       "blau": ("Blau", ("#3D6FE0", "#2A52B0", "#E3ECFD", "#FFFFFF"), ("#7AA2F5", "#C4D6FB", "#1F2B47", "#0F1A33")),
       "gruen": ("Grün", ("#1F8F5E", "#17704A", "#DFF3E9", "#FFFFFF"), ("#5FCF9C", "#B5EAD0", "#163027", "#0D2219")),
       "orange": ("Orange", ("#C8650F", "#8F4A0E", "#FBE8D6", "#FFFFFF"), ("#F5A35A", "#FBD3AE", "#3D2A1C", "#2B1806")),
       "pink": ("Pink", ("#D6456D", "#A3304F", "#FBE3EA", "#FFFFFF"), ("#F0849F", "#F8C3D0", "#3D1F2A", "#2E0F19")),
       "grafit": ("Grafit", ("#4A4458", "#2F2A3A", "#EBE8EF", "#FFFFFF"), ("#C9C2D6", "#EBE6F2", "#2E2A37", "#1A1722"))}

def style(design="soft", theme="hell", accent="violett"):
    st = St(design, theme)
    a, ink, tint, on = ACC[accent][1 if st.light else 2]
    st.c.update(accent=a, accink=ink, on=on, tint=tint)
    if design == "glas":   # в Glas оттенок полупрозрачный, как в приложении
        r, gg, b = int(a[1:3], 16), int(a[3:5], 16), int(a[5:7], 16)
        st.c["tint"] = f"rgba({r},{gg},{b},{0.15 if st.light else 0.24})"
    return st

# ── Сетка рабочего стола (4 колонки): размер виджета в точках ──
def size(cols, rows): return cols * 80.5 + (cols - 1) * 12, rows * 76 + (rows - 1) * 12

# ════════════════════════════ Данные: среда 17.9., идёт 2. Stunde ════════════════════════════
# (номер, начало, конец, предмет, учитель, кабинет, состояние) — 7 уроков, чтобы маленьким размерам было что прятать
DAY = [(1, "07:30", "08:15", "De", "Web", "102", "vorbei"), (2, "08:20", "09:05", "Ma", "Kle", "204", "v"),
       (3, "09:25", "10:10", "En", "Sch", "210", "aus"), (4, "10:30", "11:15", "Ph", "Ric", "301", None),
       (5, "11:35", "12:20", "Ge", "Bau", "108", None), (6, "12:25", "13:10", "Sp", "Hen", "Halle", None),
       (7, "13:40", "14:25", "Ku", "Lau", "012", None)]
TESTS = [("Ma", "Klassenarbeit", "Fr 19.9.", "in 2 Tagen", True), ("Ge", "Test", "Di 23.9.", "in 6 Tagen", False),
         ("Bio", "Test", "Do 25.9.", "in 8 Tagen", False), ("Ph", "Test", "Do 25.9.", "in 8 Tagen", False),
         ("En", "Vokabeltest", "Mo 29.9.", "in 12 Tagen", False), ("De", "Klassenarbeit", "Do 2.10.", "in 15 Tagen", False)]
TASKS = [("Ma", "S. 54, Nr. 3", "bis morgen", True), ("En", "Vokabeln Unit 3", "bis Do", False),
         ("De", "Gedicht auswendig lernen", "bis Fr", False), ("Ph", "Protokoll Versuch 4", "bis Mo", False)]
CHANGES = [("Heute", 2, "Ma", "v", "Vertretung · Kle · 204"), ("Heute", 3, "En", "aus", "fällt aus"),
           ("Morgen", 5, "Ku", "raum", "Raum 014 statt 012"), ("Morgen", 6, "Sp", "aus", "fällt aus")]
EVENTS = [("23", "SEP", "Elternabend", "Di · 19:00 · Aula"), ("26", "SEP", "Wandertag", "Fr · ganzer Tag"),
          ("6", "OKT", "Herbstferien", "bis 17. Okt"), ("3", "NOV", "Projektwoche", "Mo–Fr"), ("15", "NOV", "Tag der offenen Tür", "Sa · 10:00")]
NOTES = [("En", "Vokabeln Unit 3 lernen, Seite 41", "Englisch · Do"), ("Ma", "Taschenrechner mitbringen", "Mathe · Fr"),
         ("Ge", "Referat: Weimarer Republik", "Geschichte · Di"), ("Sp", "Sportsachen!", "Sport · Mi")]

# ════════════════════════════ Общая часть: карточка, шапка, «+ N weitere» ════════════════════════════
def frame(st, x, y, w, h, alpha=1.0):
    """Фон виджета. alpha < 1 — «Hintergrund» прозрачнее (сквозь него видно обои)."""
    c = st.c
    if alpha >= 1:
        out = st.card(x, y, w, h)
        if st.light and st.style == "soft": out += R(x + .5, y + .5, w - 1, h - 1, st.rc - .5, "none", c["hair"])
        return out
    fill = c["card"] if st.style != "glas" else ("#FFFFFF" if st.light else "#2A2440")
    out = R(x, y, w, h, st.rc, fill, extra=f' fill-opacity="{alpha}"')
    if st.style == "klar": out += R(x + .75, y + .75, w - 1.5, h - 1.5, st.rc, "none", c["rule"], 1.5)
    return out

def more(st, x, y, n):
    """Последняя строка, когда всё не влезло: видно, что есть ещё (и сколько), а не молча обрезано."""
    return T(x, y, f"+ {n} weitere", 11.5, 800, st.c["accink"])

def fit(items, avail, modes):
    """Правило содержания. items — по порядку показа, у каждого prio (меньше = важнее).
    modes — [(имя, высота строки)] от просторного к плотному. Возвращает (режим, высота, видимые, сколько спрятано)."""
    for i, (name, rh) in enumerate(modes):
        if len(items) * rh <= avail:
            if i == 0: rh = min(avail / max(1, len(items)), rh * 1.25)   # места больше — строки чуть свободнее
            return name, rh, items, 0
    name, rh = modes[-1]
    n = max(1, int((avail - 18) // rh))   # 18 — место под «+ N weitere»
    keep = sorted(sorted(items, key=lambda it: it["prio"])[:n], key=lambda it: it["order"])
    return name, rh, keep, len(items) - n

def subj_dot(st, cx, cy, code, aus=False, r=4.5):
    return DOT(cx, cy, r, st.c["danger"] if aus else st.sub[code][0])

# ════════════════════════════ Jetzt ════════════════════════════
def w_jetzt(st, x, y, w, h):
    c = st.c
    narrow = w < 200
    bar = lambda by, bw: R(x + 14, by, bw, 5, 2.5, c["sand"]) + R(x + 14, by, bw * 0.6, 5, 2.5, st.sub["Ma"][0])
    if h < 120:   # одна строка рабочего стола: только то, что идёт сейчас
        if narrow:
            return (T(x + 14, y + 30, "Mathe", 17, 900, c["ink"]) + T(x + w - 14, y + 29, "18 min", 12, 800, c["accink"], "end")
                    + T(x + 14, y + 49, S("Vertretung", 800, c["accink"]) + S(" · 204", 400, c["muted"]), 12, 400, c["muted"], raw=True) + bar(y + 60, w - 28))
        return (ICON(x + 14, y + 13.5, 0.58, c["accink"], CLOCK, 2.2) + T(x + 34, y + 24.5, "JETZT · 2. STUNDE", 10.5, 800, c["accink"], ls=0.5)
                + T(x + w - 14, y + 24.5, "noch 18 min", 12, 800, c["ink"], "end")
                + T(x + 14, y + 50, S("Mathe", 900, c["ink"]) + S("  Vertretung", 800, c["accink"]) + S(" · Kle · 204", 400, c["muted"]), 15, 400, c["ink"], raw=True)
                + T(x + w - 14, y + 50, "bis 09:05", 12, 400, c["faint"], "end") + bar(y + 61, w - 28))
    if narrow:
        e = (h - 164) / 2
        return (bhead(st, x, y, "Jetzt · 2.", CLOCK, True) + T(x + w - 14, y + 24.5, "18 min", 12, 800, c["ink"], "end")
                + T(x + 14, y + 64 + e, "Mathe", 21, 900, c["ink"], ls=-0.3) + T(x + 14, y + 83 + e, "Vertretung", 12.5, 800, c["accink"])
                + T(x + 14, y + 100 + e, "Kle · Raum 204", 12, 400, c["muted"]) + bar(y + 111 + e, w - 28)
                + DOT(x + 18, y + 136.5 + e * 2, 3.5, c["danger"]) + T(x + 28, y + 141 + e * 2, f'{struck("Englisch")} fällt aus', 11.5, 700, c["danger"], raw=True))
    top = p30.b_jetzt(st, x, y, w, 164)   # 4×2 — как блок «Jetzt» на Start
    if h < 240: return p30.b_jetzt(st, x, y, w, h)
    # 4×3 и выше: снизу «Danach» — следующие уроки тем же правилом, что «Heute»
    out = [top, HL(x + 14, x + w - 14, y + 160, c), label(x + 14, y + 184, "Danach", c)]
    rows = [it for it in day_items() if it["n"] > 3]
    out.append(lesson_rows(st, x, y + 194, w, h - 194 - 10, rows))
    return "".join(out)

# ════════════════════════════ Heute (и «Danach» в Jetzt) ════════════════════════════
def day_items():
    prio = {"v": 1, "aus": 1, None: 2, "vorbei": 9}
    out = []
    for i, (n, a, b, code, t, room, state) in enumerate(DAY):
        out.append(dict(order=i, n=n, a=a, b=b, code=code, t=t, room=room, state=state, now=n == 2, prio=0 if n == 2 else prio[state]))
    return out

def lesson_rows(st, x, y, w, h, items, modes=None):
    """Строки уроков. normal: 2 строки (предмет / время · учитель · кабинет); kompakt: 1 строка; dicht: 1 строка мельче."""
    c = st.c
    narrow = w < 200
    modes = modes or [("normal", 42), ("kompakt", 28), ("dicht", 21)]
    mode, rh, rows, hidden = fit(items, h, modes)
    out = []
    for j, it in enumerate(rows):
        ry = y + j * rh
        code, aus, vert = it["code"], it["state"] == "aus", it["state"] == "v"
        past = it["state"] == "vorbei"
        if j: out.append(HL(x + 14, x + w - 14, ry, c))
        if it["now"]: out.append(R(x + 6, ry + 2, w - 12, rh - 4, 10 if st.style != "klar" else 5, c["tint"]))
        fs = {"normal": 14, "kompakt": 13.5, "dicht": 12.5}[mode]
        name = NAMES[code]
        if narrow and (mode == "dicht" or len(name) > 7): name = code   # длинное имя в узкой строке — Kürzel, а не «Geschi…»
        ncol = c["danger"] if aus else (c["faint"] if past else c["ink"])
        title_ = struck(name) if aus else g.esc(name)
        if mode == "normal":
            my = ry + rh / 2 - 2
            out.append(T(x + 22, my + 4, str(it["n"]), 13.5, 800, c["faint"] if past else c["ink"], "middle"))
            out.append(subj_dot(st, x + 40, my, code, aus) + T(x + 52, my + 4.5, title_, fs, 800, ncol, raw=True))
            if narrow:   # узко: статус уходит во вторую строку, а не налезает на предмет
                if aus: out.append(T(x + 52, my + 20, "fällt aus", 11.5, 800, c["danger"]))
                elif vert: out.append(T(x + 52, my + 20, "Vertretung · 204", 11.5, 800, c["accink"]))
                else: out.append(T(x + 52, my + 20, f'{it["a"]} · {it["room"]}', 11.5, 400, c["faint"]))
                continue
            out.append(T(x + 52, my + 20, f'{it["a"]}–{it["b"]} · {it["t"]} · {it["room"]}', 11.5, 400, c["faint"]))
            if aus: out.append(T(x + w - 14, my + 4.5, "fällt aus", 12, 800, c["danger"], "end"))
            elif vert: out.append(T(x + w - 14, my + 4.5, "Vertretung", 12, 800, c["accink"], "end"))
            continue
        my = ry + rh / 2 + 4.5
        out.append(T(x + 22, my, str(it["n"]), fs - 0.5, 800, c["faint"] if past else c["ink"], "middle"))
        tx = x + 38
        if not narrow and mode == "kompakt":
            out.append(T(tx, my, it["a"], 11, 400, c["faint"])); tx += 40
        out.append(subj_dot(st, tx + 4, my - 4.5, code, aus, 4) + T(tx + 14, my, title_, fs, 700, ncol, raw=True))
        if aus: right, rc, rw = "fällt aus", c["danger"], 800
        elif vert: right, rc, rw = ("Vertr. · 204" if narrow else "Vertretung · Kle · 204"), c["accink"], 800
        else: right, rc, rw = (it["room"] if narrow else f'{it["t"]} · {it["room"]}'), c["faint"], 400
        out.append(T(x + w - 14, my, right, 11.5 if mode == "dicht" else 12, rw, rc, "end"))
    if hidden: out.append(more(st, x + 14, y + len(rows) * rh + 15, hidden))
    return "".join(out)

def w_heute(st, x, y, w, h):
    narrow = w < 200
    items = day_items()
    out = [bhead(st, x, y, "Heute · Mi" if narrow else "Heute · 7 Stunden", LIST, right=None if narrow else "bis 14:25", w=w)]
    out.append(lesson_rows(st, x, y + 38, w, h - 38 - 8, items))
    return "".join(out)

# ════════════════════════════ Woche ════════════════════════════
def w_woche(st, x, y, w, h):
    c = st.c
    narrow = w < 200
    out = [bhead(st, x, y, "KW 38" if narrow else "Woche · KW 38", WEEK_I)]
    rows = 6
    small = h < 200   # 2×2, 4×2: дни прямо под шапкой, клетки ниже — чтобы влезли Kürzel
    gap = 2 if small else 3 if narrow else 4
    cw = (w - 24 - 4 * gap) / 5
    top = y + (46 if small else 52)
    ch = (h - (top - y) - 10 - (rows - 1) * gap) / rows
    lvl = "voll" if ch >= 52 else "raum" if ch >= 36 else "kurz" if ch >= 14 else "punkt"
    for i in range(5):
        cx = x + 12 + i * (cw + gap)
        out.append(T(cx + cw / 2, y + (41 if small else 44), p30.WD[i][0] if narrow else p30.WD[i], 9.5, 800, c["accink"] if i == 2 else c["faint"], "middle", 0.8))
        for r in range(rows):
            code = WEEK[i][r]
            cy = top + r * (ch + gap)
            aus = (i, r) == (2, 2)
            out.append(st.cell(cx, cy, cw, ch, code, r=min(st.rz, 4 if lvl == "punkt" else 7 if lvl == "kurz" else 9), state="aus" if aus else None))
            if not code or lvl == "punkt": continue
            col = c["danger"] if aus else st.ctext(code)
            txt = struck(code) if aus else code
            px = cx + 7 + st.cpad()
            if lvl == "kurz":
                out.append(T(cx + cw / 2 + st.cpad() / 2, cy + ch / 2 + 3.5, txt, 9.5 if ch < 18 else 11, 900, col, "middle", raw=True))
            else:
                out.append(T(px, cy + 17, txt, 12.5, 900, col, raw=True) + T(px, cy + ch - 7, ROOM[code], 9.5, 600, col))
                if lvl == "voll": out.append(T(cx + cw - 7, cy + 17, TEACH[code], 9.5, 600, col, "end"))
            if (i, r) == (4, 0): out.append(DOT(cx + cw - 5, cy + 5, 3, c["accent"]))   # пятница, 1-й урок — тест
    return "".join(out)

# ════════════════════════════ Списки: Tests, Aufgaben, Änderungen, Termine, Notizen ════════════════════════════
def plain_rows(st, x, y, w, h, items, draw, modes):
    """Как lesson_rows, но строки рисует draw(st, x, ry, w, rh, mode, it)."""
    mode, rh, rows, hidden = fit(items, h, modes)
    out = []
    for j, it in enumerate(rows):
        ry = y + j * rh
        if j: out.append(HL(x + 14, x + w - 14, ry, st.c))
        out.append(draw(st, x, ry, w, rh, mode, it))
    if hidden: out.append(more(st, x + 14, y + len(rows) * rh + 15, hidden))
    return "".join(out)

def one_line(st, x, y, w, h, icon, head, main, sub, accent=False, main_col=None):
    """Виджет в одну строку рабочего стола (x×1): заголовок-значок, главное, подпись."""
    c = st.c
    return (ICON(x + 14, y + 13.5, 0.58, c["accink"] if accent else c["faint"], icon, 2.2) + T(x + 34, y + 24.5, head.upper(), 10.5, 800, c["accink"] if accent else c["faint"], ls=0.5)
            + T(x + 14, y + 50, main, 15, 800, main_col or c["ink"], raw=True) + T(x + 14, y + 66, sub, 11.5, 400, c["faint"]) if w < 200 else
            ICON(x + 14, y + 13.5, 0.58, c["accink"] if accent else c["faint"], icon, 2.2) + T(x + 34, y + 24.5, head.upper(), 10.5, 800, c["accink"] if accent else c["faint"], ls=0.5)
            + T(x + 14, y + 53, main, 16, 800, main_col or c["ink"], raw=True) + T(x + w - 14, y + 53, sub, 12, 700, c["accink"] if accent else c["faint"], "end"))

def r_test(st, x, ry, w, rh, mode, it):
    c = st.c
    code, kind, date, rel, soon = it["d"]
    narrow = w < 200
    if mode == "normal":
        my = ry + rh / 2 - 2
        return (subj_dot(st, x + 18, my, code) + T(x + 30, my + 4.5, NAMES[code], 14, 800, c["ink"])
                + T(x + 30, my + 20, kind if narrow else f"{kind} · {date}", 11.5, 400, c["faint"])
                + T(x + w - 14, my + (20 if narrow else 4.5), rel.replace("in ", "") if narrow else rel, 12, 800, c["accink"] if soon else c["muted"], "end"))
    my = ry + rh / 2 + 4.5
    fs = 13.5 if mode == "kompakt" else 12.5
    return (subj_dot(st, x + 18, my - 4.5, code, r=4) + T(x + 30, my, code if narrow and mode == "dicht" else NAMES[code], fs, 700, c["ink"])
            + T(x + w - 14, my, date.split(" ")[0] + " " + date.split(" ")[1] if narrow else f"{date} · {rel}", 11.5, 700 if soon else 400, c["accink"] if soon else c["faint"], "end"))

def w_tests(st, x, y, w, h):
    items = [dict(order=i, prio=i, d=d) for i, d in enumerate(TESTS)]
    if h < 120:
        return one_line(st, x, y, w, h, FLAG, "Tests", S("Mathe", 900, st.c["ink"]) + S(" · Fr", 700, st.c["muted"]), "in 2 Tagen" if w > 200 else "in 2 Tagen · + 5 weitere", True)
    return (bhead(st, x, y, "Tests", FLAG, right="6 bis 2.10." if w > 200 else None, w=w)
            + plain_rows(st, x, y + 38, w, h - 46, items, r_test, [("normal", 44), ("kompakt", 28), ("dicht", 21)]))

def r_task(st, x, ry, w, rh, mode, it):
    c = st.c
    code, what, due, soon = it["d"]
    box = f'<circle cx="{x + 22}" cy="{ry + (rh / 2 if mode != "normal" else rh / 2 - 2)}" r="{7.5 if mode != "dicht" else 6.5}" fill="none" stroke="{c["faint2"]}" stroke-width="1.8"/>'
    if mode == "normal":
        my = ry + rh / 2 - 2
        return (box + T(x + 38, my + 4.5, what, 13.5, 700, c["ink"])
                + T(x + 38, my + 20, S(NAMES[code], 700, st.sub[code][0]) + S(" · " + due, 700 if soon else 400, c["accink"] if soon else c["faint"]), 11.5, 400, c["faint"], raw=True))
    my = ry + rh / 2 + 4.5
    narrow = w < 200
    return (box + T(x + 38, my, f"{code} · {what}" if narrow else what, 13 if mode == "kompakt" else 12, 700, c["ink"])
            + ("" if narrow else T(x + w - 14, my, f"{NAMES[code]} · {due}", 11.5, 700 if soon else 400, c["accink"] if soon else c["faint"], "end")))

def w_aufgaben(st, x, y, w, h):
    c = st.c
    items = [dict(order=i, prio=i, d=d) for i, d in enumerate(TASKS)]
    if h < 120:
        return one_line(st, x, y, w, h, LIST_CHECK, "Aufgaben · 4 offen", "Mathe · S. 54, Nr. 3", "bis morgen", True)
    if w < 200 and h < 200:   # 2×2: число крупно и самое срочное
        return (bhead(st, x, y, "Aufgaben", LIST_CHECK) + T(x + 14, y + 72, "4", 30, 900, c["ink"], ls=-0.5) + T(x + 36, y + 70, "offen", 13, 600, c["muted"])
                + T(x + 14, y + 98, "Mathe · S. 54, Nr. 3", 12.5, 700, c["ink"]) + T(x + 14, y + 115, "bis morgen", 12, 700, c["accink"])
                + more(st, x + 14, y + 145, 3))
    return (bhead(st, x, y, "Aufgaben · 4 offen", LIST_CHECK)
            + plain_rows(st, x, y + 38, w, h - 46, items, r_task, [("normal", 44), ("kompakt", 28), ("dicht", 21)]))

def r_change(st, x, ry, w, rh, mode, it):
    c = st.c
    day, n, code, state, text = it["d"]
    narrow = w < 200
    aus = state == "aus"
    col = c["danger"] if aus else c["accink"]
    name = struck(NAMES[code]) if aus else g.esc(NAMES[code])
    short = {"aus": "fällt aus", "v": "Vertretung", "raum": "Raum 014"}[state]
    if mode == "normal":
        my = ry + rh / 2 - 2
        return (T(x + 22, my + 4.5, str(n), 13.5, 800, c["ink"], "middle") + subj_dot(st, x + 40, my, code, aus)
                + T(x + 52, my + 4.5, name, 14, 800, col if aus else c["ink"], raw=True)
                + T(x + 52, my + 20, (short if narrow else text) + ("" if day == "Heute" else " · morgen"), 11.5, 700, col))
    my = ry + rh / 2 + 4.5
    tom = day != "Heute"
    return (T(x + 22, my, str(n), 12.5, 800, c["ink"], "middle") + subj_dot(st, x + 36, my - 4.5, code, aus, 4)
            + T(x + 48, my, (struck(code) if aus else code) if narrow else name, 12.5 if mode == "dicht" else 13.5, 700, col if aus else c["ink"], raw=True)
            + (T(x + (72 if narrow else 130), my, "morgen", 11, 700, c["faint"]) if tom else "")
            + T(x + w - 14, my, short if narrow else text, 11.5, 800, col, "end"))

def w_aend(st, x, y, w, h):
    c = st.c
    if h < 120:
        return one_line(st, x, y, w, h, REFRESH, "Änderungen · 2" if w < 200 else "Änderungen · heute 2", f'{struck("Englisch")} fällt aus', "3. Stunde" if w < 200 else "+ Mathe Vertretung", main_col=c["danger"])
    out = [bhead(st, x, y, "Änderungen", REFRESH, right=None if w < 200 else "heute 2 · morgen 2", w=w)]
    items = [dict(order=i, prio=i, d=d) for i, d in enumerate(CHANGES)]
    if w >= 200 and h >= 300:   # большой: по дням с подзаголовком
        yy = y + 46
        for day in ("Heute", "Morgen"):
            out.append(label(x + 14, yy + 10, day, c)); yy += 16
            part = [it for it in items if it["d"][0] == day]
            out.append(plain_rows(st, x, yy, w, 44 * len(part), part, r_change, [("normal", 44)])); yy += 44 * len(part) + 10
        return "".join(out)
    modes = [("normal", 44)] if w < 200 else [("normal", 44), ("kompakt", 28), ("dicht", 21)]   # узко — всегда 2 строки
    out.append(plain_rows(st, x, y + 38, w, h - 46, items, r_change, modes))
    return "".join(out)

def r_event(st, x, ry, w, rh, mode, it):
    c = st.c
    day, mon, name, sub_ = it["d"]
    if mode == "normal":
        tile = R(x + 14, ry + 6, 36, rh - 12, 10 if st.style != "klar" else 5, c["tint"])
        return (tile + T(x + 32, ry + rh / 2 + 1, day, 14, 900, c["accink"], "middle") + T(x + 32, ry + rh / 2 + 12, mon, 8, 800, c["accink"], "middle", 0.6)
                + T(x + 60, ry + rh / 2 - 1, name, 13.5, 800, c["ink"]) + T(x + 60, ry + rh / 2 + 15, sub_, 11.5, 400, c["faint"]))
    if mode == "zwei":   # узко: имя целиком, дата второй строкой
        return T(x + 14, ry + rh / 2 - 1, name, 13, 700, c["ink"]) + T(x + 14, ry + rh / 2 + 14, f"{day}. {mon.capitalize()} · {sub_}", 11.5, 400, c["faint"])
    my = ry + rh / 2 + 4.5
    return T(x + 14, my, name, 13 if mode == "kompakt" else 12, 700, c["ink"]) + T(x + w - 14, my, f"{day}. {mon.capitalize()}", 11.5, 400, c["faint"], "end")

def w_termine(st, x, y, w, h):
    items = [dict(order=i, prio=i, d=d) for i, d in enumerate(EVENTS)]
    if h < 120:
        return one_line(st, x, y, w, h, CAL, "Termine", "Elternabend", "Di 23.9. · 19:00")
    modes = [("normal", 50), ("zwei", 40)] if w < 200 else [("normal", 50), ("kompakt", 28), ("dicht", 21)]
    return bhead(st, x, y, "Termine", CAL) + plain_rows(st, x, y + 38, w, h - 46, items, r_event, modes)

def r_note(st, x, ry, w, rh, mode, it):
    c = st.c
    code, text, sub_ = it["d"]
    narrow = w < 200
    if mode in ("normal", "zwei"):   # длинный текст переносим на вторую строку, а не «…»
        words, lines, cur = text.split(), [], ""
        lim = 20 if narrow else 40
        for wd in words:
            if len(cur) + len(wd) + 1 > lim and cur: lines.append(cur); cur = wd
            else: cur = (cur + " " + wd).strip()
        lines.append(cur)
        if mode == "zwei":
            ty = ry + (rh - 17 * len(lines[:2])) / 2 + 13
            return subj_dot(st, x + 18, ty - 4.5, code, r=4) + "".join(T(x + 30, ty + i * 17, ln, 13, 700, c["ink"]) for i, ln in enumerate(lines[:2]))
        out = "".join(T(x + 14, ry + 22 + i * 17, ln, 13.5, 700, c["ink"]) for i, ln in enumerate(lines[:2]))
        return out + subj_dot(st, x + 18, ry + 22 + len(lines[:2]) * 17 - 1, code, r=3.5) + T(x + 28, ry + 26 + len(lines[:2]) * 17 - 1, sub_, 11.5, 400, c["faint"])
    my = ry + rh / 2 + 4.5
    return subj_dot(st, x + 18, my - 4.5, code, r=4) + T(x + 30, my, text, 12.5, 700, c["ink"])

def w_notizen(st, x, y, w, h):
    items = [dict(order=i, prio=i, d=d) for i, d in enumerate(NOTES)]
    if h < 120 and w < 200:   # 2×1: одна заметка в две строки
        c = st.c
        return (ICON(x + 14, y + 13.5, 0.58, c["faint"], FILE, 2.2) + T(x + 34, y + 24.5, "NOTIZEN", 10.5, 800, c["faint"], ls=0.5)
                + T(x + 14, y + 47, "Vokabeln Unit 3", 13.5, 800, c["ink"]) + T(x + 14, y + 64, "lernen, Seite 41", 13.5, 800, c["ink"]))
    if h < 120:
        return one_line(st, x, y, w, h, FILE, "Notizen", "Vokabeln Unit 3 lernen, Seite 41", "Englisch · Do")
    modes = [("normal", 64), ("zwei", 44)] if w < 200 else [("normal", 64), ("kompakt", 28), ("dicht", 21)]
    return bhead(st, x, y, "Notizen", FILE) + plain_rows(st, x, y + 36, w, h - 44, items, r_note, modes)

# ════════════════════════════ Countdown ════════════════════════════
def w_ferien(st, x, y, w, h):
    c = st.c
    bar = lambda by: R(x + 14, by, w - 28, 6, 3, c["sand"]) + R(x + 14, by, (w - 28) * 0.7, 6, 3, c["accent"])
    if h < 120:
        if w < 200:
            return (T(x + 14, y + 40, "12", 28, 900, c["ink"], ls=-0.5) + T(x + 50, y + 38, "Schultage", 12.5, 600, c["muted"])
                    + T(x + 14, y + 56, "bis Herbstferien", 11.5, 400, c["faint"]) + bar(y + 64))
        return (ICON(x + 14, y + 13.5, 0.58, c["faint"], SUN, 2.2) + T(x + 34, y + 24.5, "COUNTDOWN", 10.5, 800, c["faint"], ls=0.5)
                + T(x + 14, y + 53, S("12", 900, c["ink"]) + S(" Schultage bis zu den Herbstferien", 600, c["muted"]), 15, 600, c["ink"], raw=True)
                + T(x + w - 14, y + 24.5, "ab 6. Okt", 12, 800, c["ink"], "end") + bar(y + 62))
    if w < 200 or h < 240: return p30.b_ferien(st, x, y, w, h) + (T(x + w - 14, y + 24.5, "ab 6. Okt", 12, 800, c["ink"], "end") if w > 200 else "")
    # большой: число, полоса и что ещё до каникул
    out = [p30.b_ferien(st, x, y, w, 132), T(x + w - 14, y + 24.5, "ab 6. Okt", 12, 800, c["ink"], "end"), HL(x + 14, x + w - 14, y + 132, c)]
    for j, (a, b) in enumerate([("Noch 3 Tests", "bis 2.10."), ("Wandertag", "26.9."), ("Letzter Schultag", "Fr 3.10.")]):
        ry = y + 140 + j * 30
        if ry + 30 > y + h - 6: break
        out.append(T(x + 14, ry + 20, a, 13, 700, c["ink"]) + T(x + w - 14, ry + 20, b, 12, 400, c["faint"], "end"))
    return "".join(out)

DRAW = dict(jetzt=w_jetzt, heute=w_heute, woche=w_woche, tests=w_tests, aufgaben=w_aufgaben,
            aenderungen=w_aend, termine=w_termine, notizen=w_notizen, ferien=w_ferien)

def widget(st, kind, x, y, w, h, alpha=1.0):
    return frame(st, x, y, w, h, alpha) + DRAW[kind](st, x, y, w, h)

# ════════════════════════════ 01–09 · Размеры каждого вида ════════════════════════════
KINDS = [("jetzt", "Jetzt", CLOCK, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 4)]),
         ("heute", "Heute", LIST, [(2, 2), (2, 4), (4, 2), (4, 3), (4, 5)]),
         ("woche", "Woche", WEEK_I, [(2, 2), (2, 3), (4, 2), (4, 4), (4, 5)]),
         ("tests", "Tests", FLAG, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 4)]),
         ("aufgaben", "Aufgaben", LIST_CHECK, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 3)]),
         ("aenderungen", "Änderungen", REFRESH, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 4)]),
         ("termine", "Termine", CAL, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 4)]),
         ("notizen", "Notizen", FILE, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 4)]),
         ("ferien", "Countdown", SUN, [(2, 1), (2, 2), (4, 1), (4, 2), (4, 3)])]

def p_sizes(kind, name, sizes, theme="hell", design="soft", accent="violett"):
    """Лист: один вид во всех размерах на обоях. Узкие (2 колонки) — слева, широкие — справа."""
    st = style(design, theme, accent)
    W = 24 + 173 + 24 + 358 + 24
    cols = {True: [24, 74], False: [24 + 173 + 24, 74]}   # x, текущий y
    body = []
    for cw, rh in sizes:
        w, h = size(cw, rh)
        col = cols[cw <= 2]
        x, y = col
        body.append(T(x + 2, y + 16, f"{cw} × {rh}", 12.5, 800, fg(st)))
        body.append(widget(st, kind, x, y + 26, w, h))
        col[1] = y + 26 + h + 24
    H = max(cols[True][1], cols[False][1]) + 8
    head = T(24, 46, name, 26, 900, fg(st), ls=-0.4)
    defs = wall_defs(W) + st.defs(W, H)
    return g.svg(W, H, st.c, wallpaper(st, 0, 0, W, H) + head + "".join(body), defs)

# ════════════════════════════ 10 · Soft / Glas / Klar рядом ════════════════════════════
def phone(st, ox, body):
    return f'<g transform="translate({ox} 40)"><clipPath id="ph{ox}"><rect width="390" height="844" rx="34"/></clipPath><g clip-path="url(#ph{ox})">{wallpaper(st, 0, 0, 390, 844)}{statusbar(st)}{body}{dock(st)}</g></g>'

def home_set(st):
    w2, h2 = size(2, 2)
    w4, h3 = size(4, 3)
    return (widget(st, "jetzt", 16, 52, *size(4, 2)) + widget(st, "heute", 16, 228, w4, h3)
            + widget(st, "tests", 16, 492, w2, h2) + widget(st, "ferien", 201, 492, w2, h2))

def p_designs(theme):
    W = 3 * 390 + 2 * 32 + 48
    H = 40 + 844 + 24
    out = []
    for i, d in enumerate(["soft", "glas", "klar"]):
        st = style(d, theme)
        ox = 24 + i * (390 + 32)
        out.append(T(ox + 4, 28, {"soft": "Soft", "glas": "Glas", "klar": "Klar"}[d], 18, 900, st.c["ink"]) + phone(st, ox, home_set(st)))
    st0 = style("soft", theme)
    defs = wall_defs(390) + style("glas", theme).defs(390, 844)
    return g.svg(W, H, st0.c, "".join(out), defs)

# ════════════════════════════ 11 · Akzent und Hintergrund ════════════════════════════
def p_accent(theme="hell"):
    W = 24 + 358 + 24 + 358 + 24
    st0 = style("soft", theme)
    out = [T(24, 46, "Akzent", 26, 900, fg(st0), ls=-0.4)]
    w, h = size(4, 2)
    y = 74
    for i, key in enumerate(ACC):
        st = style("soft", theme, key)
        x = 24 + (i % 2) * (358 + 24)
        yy = y + (i // 2) * (h + 50)
        out.append(T(x + 2, yy + 16, ACC[key][0] + (" · wie App" if key == "violett" else ""), 12.5, 800, fg(st)) + widget(st, "jetzt", x, yy + 26, w, h))
    y += 3 * (h + 50) + 24
    out.append(T(24, y + 26, "Hintergrund", 26, 900, fg(st0), ls=-0.4))
    y += 54
    w2, h2 = size(2, 2)
    for i, (alpha, lab) in enumerate([(1.0, "100 %"), (0.7, "70 %"), (0.4, "40 %"), (0.0, "Aus")]):
        x = 24 + i * (w2 + 12) * 0.98
        out.append(T(x + 2, y + 16, lab, 12.5, 800, fg(st0)) + widget(st0, "tests", x, y + 26, w2 - 8, h2, alpha))
    H = y + 26 + h2 + 30
    return g.svg(W, H, st0.c, wallpaper(st0, 0, 0, W, H) + "".join(out), wall_defs(W))

# ════════════════════════════ 12 · Widget einstellen (вид «Heute») ════════════════════════════
def row(st, x, y, w, text, control="", first=False, value=None):
    c = st.c
    out = ("" if first else HL(x + 14, x + w - 14, y, c)) + T(x + 14, y + 33.5, text, 14.5, 500, c["ink"]) + control
    if value: out += T(x + w - 38, y + 33, value, 13, 400, c["faint"], "end") + ICON(x + w - 30, y + 20, 0.67, c["faint2"], CHEV_R)
    return out

def chips(st, x, y, w, items, sel):
    """Вид виджета — сетка 3×3 маленьких плиток со значком."""
    c = st.c
    out = []
    tw_, th = (w - 2 * 8) / 3, 64
    for i, (key, name, icon, _) in enumerate(items):
        tx, ty = x + (i % 3) * (tw_ + 8), y + (i // 3) * (th + 8)
        on = key == sel
        out.append(R(tx, ty, tw_, th, 16 if st.style != "klar" else 8, c["tint"] if on else c["card"], c["accent"] if on else (c["rule"] if st.style == "klar" else None), 2 if on else 1.5))
        out.append(ICON(tx + tw_ / 2 - 10, ty + 11, 0.83, c["accink"] if on else c["muted"], icon, 2) + T(tx + tw_ / 2, ty + 51, name, 12.5, 800 if on else 700, c["accink"] if on else c["ink"], "middle"))
    return "".join(out), 3 * th + 2 * 8

def swatches(st, x, y, w, sel="app"):
    """«Wie App» + 6 акцентов."""
    c = st.c
    out = [st.card(x, y, w, 64)]
    keys = ["app"] + list(ACC)
    step = (w - 28 - 32) / 6
    for i, key in enumerate(keys):
        cx = x + 14 + 16 + i * step
        on = key == sel
        if key == "app":
            out.append(f'<circle cx="{cx}" cy="{y + 32}" r="15" fill="none" stroke="{c["faint2"]}" stroke-width="2" stroke-dasharray="3 3"/>' + T(cx, y + 36, "App", 9.5, 900, c["muted"], "middle"))
        else:
            col = ACC[key][1 if st.light else 2][0]
            out.append(DOT(cx, y + 32, 15, col))
        if on: out.append(f'<circle cx="{cx}" cy="{y + 32}" r="20" fill="none" stroke="{c["accent"]}" stroke-width="2.5"/>')
    return "".join(out)

def p_config(theme="hell"):
    st = style("soft", theme)
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, CLOSE), eyebrow(66, 33, "Widget · 4 × 3", c), title(66, 65, "Einstellen", c)]
    y = 92
    pw, ph = size(4, 3)
    b.append(wallpaper(st, x, y, w, ph * 0.9 + 32, clip=("pv", st.rc)))
    b.append(f'<g transform="translate({x + 16} {y + 16}) scale({(w - 32) / pw})">{widget(st, "heute", 0, 0, pw, ph)}</g>')
    y += ph * 0.9 + 32 + 30
    b.append(label(x, y, "Inhalt", c)); y += 12
    ch_, chh = chips(st, x, y, w, KINDS, "heute"); b.append(ch_); y += chh + 30
    b.append(label(x, y, "Klasse", c)); y += 12
    b.append(st.seg(x, y, w, ["9b · Meine Klasse", "5a · Geschwister"], 0, h=40, fs=13)); y += 40 + 30
    # что показать — у «Heute»; по умолчанию «Wie App» (берётся из «Stundenplan» в Darstellung)
    b.append(label(x, y, "Anzeige", c)); y += 12
    b.append(st.card(x, y, w, 54 * 6))
    b.append(row(st, x, y, w, "Nur meine Kurse", st.switch(x + w - 56, y + 15, True), True))
    b.append(row(st, x, y + 54, w, "Nur Änderungen", st.switch(x + w - 56, y + 69, False)))
    b.append(row(st, x, y + 108, w, "Fach", st.seg(x + w - 14 - 168, y + 117, 168, ["Wie App", "Kürzel", "Name"], 0, fs=11.5)))
    b.append(row(st, x, y + 162, w, "Raum · Lehrkraft", st.seg(x + w - 14 - 168, y + 171, 168, ["Wie App", "Raum", "Beides"], 0, fs=11.5)))
    b.append(row(st, x, y + 216, w, "Abends schon morgen", st.switch(x + w - 56, y + 231, True)))
    b.append(row(st, x, y + 270, w, "Ausfall", st.seg(x + w - 14 - 168, y + 279, 168, ["Wie App", "Ausblenden"], 0, fs=11.5)))
    y += 54 * 6 + 30
    b.append(label(x, y, "Aussehen", c)); y += 12
    b.append(st.card(x, y, w, 54 * 4))
    b.append(row(st, x, y, w, "Design", st.seg(x + w - 14 - 224, y + 9, 224, ["Wie App", "Soft", "Glas", "Klar"], 0, fs=11.5), True))
    b.append(row(st, x, y + 54, w, "Hell / Dunkel", st.seg(x + w - 14 - 196, y + 63, 196, ["Wie App", "Hell", "Dunkel"], 0, fs=11.5)))
    b.append(row(st, x, y + 108, w, "Schrift", st.seg(x + w - 14 - 150, y + 117, 150, ["S", "M", "L"], 1)))
    # прозрачность фона — ползунок
    sx, sw_ = x + 140, w - 140 - 60
    b.append(row(st, x, y + 162, w, "Hintergrund") + R(sx, y + 187, sw_, 6, 3, c["sand"]) + R(sx, y + 187, sw_, 6, 3, c["accent"])
             + DOT(sx + sw_, y + 190, 11, "#FFFFFF" if st.light else c["thumb"]) + f'<circle cx="{sx + sw_}" cy="{y + 190}" r="11" fill="none" stroke="{c["rule"]}"/>'
             + T(x + w - 14, y + 195, "100 %", 12.5, 700, c["muted"], "end"))
    y += 54 * 4 + 14
    b.append(label(x + 14, y + 6, "Akzent", c)); y += 16
    b.append(swatches(st, x, y, w)); y += 64 + 30
    b.append(label(x, y, "Verhalten", c)); y += 12
    b.append(st.card(x, y, w, 54 * 2))
    b.append(row(st, x, y, w, "Aktualisieren", st.seg(x + w - 14 - 168, y + 9, 168, ["15 min", "30 min", "1 h"], 1, fs=11.5), True))
    b.append(row(st, x, y + 54, w, "Beim Tippen öffnen", value="Tag"))
    y += 108 + 30
    H = y + 92
    b.append(R(0, H - 92, 390, 92, 0, c["paper"]) + HL(0, 390, H - 92, c) + st.button(18, H - 76, 354, "Fertig", "primary", CHECK))
    return g.svg(390, H, c, "".join(b), wall_defs(390))

# ════════════════════════════ 13 · Настройки, которые есть только у некоторых видов ════════════════════════════
def p_config_kinds(theme="hell"):
    st = style("soft", theme)
    c = st.c
    x, w = 18, 354
    b = [eyebrow(18, 33, "Einstellen · je nach Inhalt", c), title(18, 65, "Anzeige", c)]
    y = 96
    groups = [
        ("Jetzt", [("Danach zeigen", "sw", True), ("Fortschritt", "sw", True)]),
        ("Woche", [("Am Wochenende", "seg", (["Nächste Woche", "Leer"], 0)), ("In der Zelle", "seg", (["Kürzel", "+ Raum", "+ Lehrkraft"], 0))]),
        ("Tests", [("Voraus", "seg", (["1 Woche", "2 Wochen", "Alle"], 1)), ("Nur meine Kurse", "sw", True)]),
        ("Aufgaben", [("Erledigte zeigen", "sw", False), ("Sortieren nach", "seg", (["Fällig", "Fach"], 0))]),
        ("Änderungen", [("Zeitraum", "seg", (["Heute", "+ Morgen", "Woche"], 1))]),
        ("Termine", [("Voraus", "seg", (["1 Monat", "3 Monate", "Alle"], 1))]),
        ("Countdown", [("Bis", "val", "Herbstferien"), ("Zählen", "seg", (["Schultage", "Tage"], 0))]),
    ]
    for name, rows in groups:
        b.append(label(x, y, name, c)); y += 12
        b.append(st.card(x, y, w, 54 * len(rows)))
        for i, (text, kind_, val) in enumerate(rows):
            ry = y + i * 54
            if kind_ == "sw": ctl = st.switch(x + w - 56, ry + 15, val)
            elif kind_ == "seg":
                opts, sel = val
                sw_ = 76 * len(opts) if len(opts) > 2 else 172
                ctl = st.seg(x + w - 14 - sw_, ry + 9, sw_, opts, sel, fs=11.5)
            else: ctl = ""
            b.append(row(st, x, ry, w, text, ctl, i == 0, value=val if kind_ == "val" else None))
        y += 54 * len(rows) + 26
    return g.svg(390, y + 10, c, "".join(b))

SCREENS = {}
for i, (kind, name, _, sizes) in enumerate(KINDS):
    SCREENS[f"handy-{i + 1:02d}-{kind}"] = (lambda kind=kind, name=name, sizes=sizes: lambda th: p_sizes(kind, name, sizes, th))(), ("hell",)
SCREENS["handy-10-designs"] = (p_designs, ("hell", "dunkel"))
SCREENS["handy-11-akzent"] = (p_accent, ("hell",))
SCREENS["handy-12-einstellen"] = (p_config, ("hell", "dunkel"))
SCREENS["handy-13-einstellen-inhalt"] = (p_config_kinds, ("hell",))

if __name__ == "__main__":
    n = 0
    only = sys.argv[2] if len(sys.argv) > 2 else None
    for name, (fn, themes) in SCREENS.items():
        if only and only not in name: continue
        for th in themes:
            open(os.path.join(OUT, f"{name}-{th}.svg"), "w", encoding="utf-8").write(fn(th))
            n += 1
    print(n, "files")
