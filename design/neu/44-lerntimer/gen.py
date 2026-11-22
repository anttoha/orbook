# Макеты части 44 «Lerntimer» (Pomodoro):
#   • экран таймера: предмет, кольцо с минутами, 25/5 · 50/10 · Eigene, Start; идёт / пауза / перерыв;
#   • в конце фокуса — шторка «Runde geschafft», «Stoppen?» — окно-вопрос, шторка настроек (минуты, звук, вибрация);
#   • блок «Lerntimer» на «Start», раздел «Lernzeit» в «Statistik» (неделя, по предметам); ПК.
# Кирпичики — из части 43 (а через неё 41/30/24/19c), цвета — токены Soft.
import importlib.util, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp); sp.loader.exec_module(mod)
    return mod

m43 = _load("g43", "43-karteikarten")
g, m24, m30, m41, m19c = m43.g, m43.m24, m43.m30, m43.m41, m43.m19c
T, S, R, ICON, P, label, eyebrow, title, button, badge, segmented, round_btn, switch = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.badge, g.segmented, g.round_btn, g.switch)
CHECK, CLOSE, PLUS, CHEV_R = g.CHECK, g.CLOSE, g.PLUS, g.CHEV_R
page, toast, sheet_bg, overlay, head, HLINE, circle_code, dialog = (
    m43.page, m43.toast, m43.sheet_bg, m43.overlay, m43.head, m43.HLINE, m43.circle_code, m43.dialog)
NAMES = g.NAMES

# Значки: секундомер, play, pause, stop, «настройки» (ползунки), кофе для перерыва
TIMER = '<circle cx="12" cy="13" r="8"/>' + P("M12 9v4l2.5 2M10 2h4M12 2v3")
PLAY = P("M8 5.5v13l10-6.5z")
PAUSE = P("M9 5v14M15 5v14")
STOP = '<rect x="6" y="6" width="12" height="12" rx="2"/>'
SLIDERS = P("M4 7h10M18 7h2M4 17h4M12 17h8") + '<circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'
CUP = P("M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3")
SKIP = P("M6 5v14l9-7zM18 5v14")

# ── Daten (heute = Mi 17.09.) ──
MATHE = ("Ma", "Ma", "Mathe", "Mü", "204")
TODAY = [("Ma", "Mathe", "16:05", 25), ("Ma", "Mathe", "15:35", 25), ("En", "Englisch", "14:50", 25)]   # heute 1 h 15 min
WEEK = [("Mo", 50), ("Di", 75), ("Mi", 75), ("Do", 0), ("Fr", 0), ("Sa", 0), ("So", 0)]
LAST_WEEK = 150
BY_SUBJ = [("Ma", 100), ("En", 50), ("Ph", 25), ("Bio", 25)]

def hm(m):
    h, mm = divmod(m, 60)
    return f"{h} h {mm} min" if h and mm else (f"{h} h" if h else f"{mm} min")

def nav(theme, active=3):
    return m30.nav(m30.St("soft", theme), active)

# ── Кольцо: серый круг и дуга «осталось»; в центре минуты ──
def ring(cx, cy, r, part, c, col=None, big="25:00", top="FOKUS", bottom="Runde 1 von 4", sw=14, dim=False, size=58):
    col = col or c["accent"]
    L = 2 * math.pi * r
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{c["sand"]}" stroke-width="{sw}"/>']
    if part > 0:
        op = ' stroke-opacity="0.45"' if dim else ""
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-linecap="round"{op}'
                   f' stroke-dasharray="{L * part:.1f} {L:.1f}" transform="rotate(-90 {cx} {cy})"/>')
        a = -math.pi / 2 + 2 * math.pi * part   # точка на конце дуги (у полного круга не нужна)
        if part < 1: out.append(f'<circle cx="{cx + r * math.cos(a):.1f}" cy="{cy + r * math.sin(a):.1f}" r="{sw / 2 + 3}" fill="{c["card"]}" stroke="{col}" stroke-width="3"{op}/>')
    out.append(T(cx, cy - 40, top, 11, 800, c["faint"] if dim else (c["ok"] if col == c["ok"] else c["accink"]), "middle", 0.8))
    out.append(T(cx, cy + size * 0.35, big, size, 900, c["muted"] if dim else c["ink"], "middle", -1))
    out.append(T(cx, cy + 50, bottom, 13, 700, c["faint"], "middle"))
    return "".join(out)

def rounds(cx, y, done, total, c, cur=None):
    """Точки раундов под кольцом: сделано — закрашено, текущая — кольцом."""
    out, gap = [], 18
    x0 = cx - gap * (total - 1) / 2
    for i in range(total):
        x = x0 + i * gap
        if i < done: out.append(f'<circle cx="{x}" cy="{y}" r="5" fill="{c["accent"]}"/>')
        elif i == cur: out.append(f'<circle cx="{x}" cy="{y}" r="4.5" fill="none" stroke="{c["accent"]}" stroke-width="2"/>')
        else: out.append(f'<circle cx="{x}" cy="{y}" r="5" fill="{c["sand"]}"/>')
    return "".join(out)

def subj_line(cx, y, code, c, sub, right=None):
    """Предмет, пока таймер идёт: точка цвета предмета + название (сменить можно только до старта)."""
    name = NAMES[code]
    txt = name + (f" · {right}" if right else "")
    w = g.tw(txt, 14.5) * 0.92 + 40
    return (R(cx - w / 2, y, w, 34, 17, sub[code][1]) + f'<circle cx="{cx - w / 2 + 18}" cy="{y + 17}" r="5" fill="{sub[code][0]}"/>'
            + T(cx - w / 2 + 30, y + 22, txt, 14, 800, sub[code][2]))

def session_rows(x, y, w, rows, c, sub, rh=56):
    out = [R(x, y, w, rh * len(rows), 22, c["card"])]
    for i, (code, name, at, mins) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HLINE(x + 16, x + w - 16, ry, c))
        out.append(f'<circle cx="{x + 24}" cy="{ry + rh / 2}" r="5" fill="{sub[code][0]}"/>')
        out.append(T(x + 40, ry + rh / 2 + 5, name, 14.5, 700, c["ink"]) + T(x + w - 92, ry + rh / 2 + 5, at, 13, 400, c["faint"], "end")
                   + T(x + w - 16, ry + rh / 2 + 5, f"{mins} min", 13.5, 800, c["ink"], "end"))
    return "".join(out), rh * len(rows)

def timer_head(c, eb="Heute 1 h 15 min"):
    return eyebrow(18, 33, eb, c) + title(18, 65, "Lerntimer", c) + round_btn(334, 33.31, c, SLIDERS)

def phone_end(theme, c):
    return R(0, 744, 390, 100, 0, c["paper"]) + nav(theme)

# ════════════════ 01 · Bereit ════════════════
def p_bereit(c, theme, sub):
    b = [timer_head(c)]
    b.append(m19c.picker_field(18, 92, 354, c, sub, MATHE))
    b.append(ring(195, 322, 112, 1.0, c, big="25:00", bottom="dann 5 min Pause"))
    b.append(rounds(195, 466, 0, 4, c, cur=0))
    b.append(segmented(18, 494, 354, ["25 / 5", "50 / 10", "Eigene"], 0, c, h=40))
    b.append(button(18, 552, 354, "Start", c, icon=PLAY))
    b.append(label(18, 640, "Heute", c) + T(372, 640, "1 h 15 min", 12.5, 800, c["accink"], "end"))
    rows, _ = session_rows(18, 652, 354, TODAY, c, sub); b.append(rows)
    b.append(phone_end(theme, c))
    return page(390, 844, c, "".join(b))

# ════════════════ 02 · Läuft ════════════════
def p_laeuft(c, theme, sub, paused=False):
    b = [timer_head(c)]
    b.append(subj_line(195, 100, "Ma", c, sub, "Runde 3 von 4"))
    if paused:
        b.append(ring(195, 322, 112, 0.708, c, big="17:42", top="PAUSIERT", bottom="seit 2 min", dim=True))
    else:
        b.append(ring(195, 322, 112, 0.708, c, big="17:42", bottom="fertig um 16:52"))
    b.append(rounds(195, 466, 2, 4, c, cur=2))
    b.append(button(18, 552, 140, "Stopp", c, "sand", STOP))
    b.append(button(166, 552, 206, "Weiter" if paused else "Pause", c, icon=PLAY if paused else PAUSE))
    b.append(label(18, 640, "Heute", c) + T(372, 640, "1 h 15 min", 12.5, 800, c["accink"], "end"))
    rows, _ = session_rows(18, 652, 354, TODAY, c, sub); b.append(rows)
    b.append(phone_end(theme, c))
    return page(390, 844, c, "".join(b))

def p_pausiert(c, theme, sub):
    return p_laeuft(c, theme, sub, paused=True)

# ════════════════ 03 · Pause (Erholung) ════════════════
def p_erholung(c, theme, sub):
    b = [timer_head(c, "Heute 1 h 40 min")]
    b.append(subj_line(195, 100, "Ma", c, sub, "gleich Runde 4"))
    b.append(ring(195, 322, 112, 0.84, c, col=c["ok"], big="4:12", top="PAUSE", bottom="aufstehen, trinken"))
    b.append(rounds(195, 466, 3, 4, c, cur=3))
    b.append(button(18, 552, 354, "Pause überspringen", c, "sand", SKIP))
    b.append(label(18, 640, "Heute", c) + T(372, 640, "1 h 40 min", 12.5, 800, c["accink"], "end"))
    rows, _ = session_rows(18, 652, 354, [("Ma", "Mathe", "16:30", 25)] + TODAY, c, sub); b.append(rows)
    b.append(phone_end(theme, c))
    return page(390, 844, c, "".join(b))

# ════════════════ 04 · Runde geschafft (Шторка) ════════════════
def done_sheet(c, H=844, top=438):
    b = [overlay(c, 390, H), sheet_bg(c, top, 390, H)]
    b.append(R(163, top + 36, 64, 64, 32, c["oktint"]) + ICON(179, top + 52, 1.33, c["ok"], CHECK, 2.4))
    b.append(T(195, top + 140, "Runde geschafft!", 26, 900, c["ink"], "middle", -0.39))
    b.append(T(195, top + 166, S("25 min Mathe", 800, c["ink"]) + S(" · heute 1 h 40 min", 400, c["muted"]), 14, 400, c["muted"], "middle", raw=True))
    b.append(m30_rounds_card(c, top + 190))
    b.append(button(18, top + 292, 354, "5 min Pause", c, icon=CUP))
    b.append(button(18, top + 348, 354, "Fertig für heute", c, "sand", CHECK))
    return "".join(b)

def m30_rounds_card(c, y):
    return (R(18, y, 354, 64, 22, c["card"]) + T(34, y + 38, "Runde 3 von 4", 14.5, 700, c["ink"])
            + rounds(316, y + 33, 3, 4, c))

def p_geschafft(c, theme, sub):
    base = p_laeuft_raw(c, theme, sub)
    return page(390, 844, c, base + done_sheet(c))

def p_laeuft_raw(c, theme, sub):
    s = p_laeuft(c, theme, sub)
    return s[s.index("</defs>") + 7: s.rindex("</svg>")]

# ════════════════ 05 · Stoppen? ════════════════
STOPP = (STOP, "Timer stoppen?", ["Die 7 Minuten Mathe", "werden trotzdem gezählt."], "Stoppen", STOP, True)

def p_stoppen(c, theme, sub):
    return page(390, 844, c, p_laeuft_raw(c, theme, sub) + overlay(c, 390, 844) + dialog(c, 18, 300, 354, *STOPP))

# ════════════════ 06 · Einstellungen (Шторка) ════════════════
def stepper(x, y, value, c, w=136, h=38):
    return (R(x, y, w, h, h / 2, c["sand"]) + ICON(x + 9, y + 9, 0.83, c["ink"], g.P("M5 12h14"), 2.2)
            + T(x + w / 2, y + h / 2 + 5, value, 14, 800, c["ink"], "middle") + ICON(x + w - 29, y + 9, 0.83, c["ink"], PLUS, 2.2))

def set_rows(x, y, w, rows, c, rh=56):
    out = [R(x, y, w, rh * len(rows), 22, c["card"])]
    for i, (text, ctl) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HLINE(x + 16, x + w - 16, ry, c))
        out.append(T(x + 16, ry + rh / 2 + 5, text, 14.5, 700, c["ink"]))
        if isinstance(ctl, bool): out.append(switch(x + w - 58, ry + rh / 2 - 12, ctl, c))
        else: out.append(stepper(x + w - 152, ry + rh / 2 - 19, ctl, c))
    return "".join(out), rh * len(rows)

def settings_sheet(c, H=844, top=200):
    b = [overlay(c, 390, H), sheet_bg(c, top, 390, H)]
    y = top + 44
    b.append(eyebrow(18, y, "Lerntimer", c, True) + title(18, y + 32, "Einstellungen", c, 26)); y += 60
    rows, h = set_rows(18, y, 354, [("Lernen", "40 min"), ("Pause", "8 min"), ("Lange Pause", "20 min"), ("Runden", "3")], c); b.append(rows); y += h + 24
    b.append(label(18, y, "Am Ende", c)); y += 12
    rows, h = set_rows(18, y, 354, [("Ton", True), ("Vibration", True), ("Pause von selbst starten", False)], c); b.append(rows); y += h + 24
    b.append(button(18, y, 354, "Speichern", c))
    return "".join(b)

def p_einstellungen(c, theme, sub):
    s = p_bereit(c, theme, sub)
    return page(390, 844, c, s[s.index("</defs>") + 7: s.rindex("</svg>")] + settings_sheet(c))

# ════════════════ 07 · Start-Block ════════════════
def b_timer(st, x, y, w, h):
    """Läuft gerade: Restzeit groß, Fach, dünne Leiste; sonst «heute gelernt»."""
    c = st.c
    e = (h - 124) / 2
    return (m30.bhead(st, x, y, "Lerntimer", TIMER, accent=True) + T(x + 14, y + 62 + e, "17:42", 30, 900, c["ink"], ls=-0.5)
            + T(x + 112, y + 60 + e, "noch", 13, 600, c["muted"])
            + T(x + 14, y + 85 + e, "Mathe · Runde 3", 12.5, 600, c["ink"])
            + R(x + 14, y + 98 + e, w - 28, 6, 3, c["sand"]) + R(x + 14, y + 98 + e, (w - 28) * 0.29, 6, 3, c["accent"]))

def p_start(c, theme, sub):
    m30.DRAW["notizen"] = b_timer
    out = m30.p_start(m30.St("soft", theme))
    m30.DRAW["notizen"] = m30.b_notiz
    return out

# ════════════════ 08 · Statistik · Lernzeit ════════════════
def stat_card(x, y, w, n, line, note, nc, c, h=112):
    return (R(x, y, w, h, 22, c["card"]) + T(x + 14, y + 46, n, 34, 900, c["ink"], ls=-0.5)
            + T(x + 14, y + 70, line, 13, 400, c["muted"]) + (T(x + 14, y + 92, note, 12, 800, nc) if note else ""))

def week_bars(x, y, w, c, h=210, days=WEEK, mx=90):
    out = [R(x, y, w, h, 22, c["card"]), T(x + 16, y + 30, "Diese Woche nach Tag", 13, 800, c["faint"])]
    n = len(days); bw = (w - 32 - (n - 1) * 10) / n
    base = y + h - 40
    for i, (d, m) in enumerate(days):
        bx = x + 16 + i * (bw + 10)
        if m:
            bh = 110 * m / mx
            out.append(R(bx, base - bh, bw, bh, 8, c["accent"] if d != "Mi" else c["accent"]))
            out.append(T(bx + bw / 2, base - bh - 8, f"{m}", 11.5, 800, c["muted"], "middle"))
        else:
            out.append(R(bx, base - 4, bw, 4, 2, c["sand"]))
        out.append(T(bx + bw / 2, base + 22, d, 12, 700, c["accink"] if d == "Mi" else c["faint"], "middle"))
    out.append(T(x + w - 16, y + 30, "Minuten", 12, 700, c["faint"], "end"))
    return "".join(out)

def subj_bars(x, y, w, rows, c, sub, rh=29):
    out = []
    mx = max(m for _, m in rows)
    for i, (code, m) in enumerate(rows):
        ry = y + i * rh
        out.append(f'<circle cx="{x + 5}" cy="{ry}" r="5" fill="{sub[code][0]}"/>' + T(x + 19, ry + 5, NAMES[code], 14.5, 400, c["ink"]))
        bx, bw = x + 105, w - 105 - 100
        out.append(R(bx, ry - 4, bw, 8, 4, c["sand"]) + R(bx, ry - 4, bw * m / mx, 8, 4, sub[code][0]))
        out.append(T(x + w, ry + 5, hm(m), 13.5, 800, c["ink"], "end"))
    return "".join(out)

def stat_head(c, x=18, seg_x=228):
    return (round_btn(x, 33.31, c, g.BACK) + eyebrow(x + 48, 33, "Mehr · KW 38", c) + title(x + 48, 65, "Statistik", c)
            + segmented(seg_x, 37, 144, ["Woche", "Monat"], 0, c, h=36))

def p_statistik(c, theme, sub):
    b = [stat_head(c)]
    y = 96
    b.append(label(18, y + 12, "Lernzeit", c)); y += 24
    b.append(stat_card(18, y, 173, "3 h 20", "gelernt", "+50 min ggü. KW 37", c["ok"], c)
             + stat_card(199, y, 173, "8", "Runden", "Mathe am meisten", c["accink"], c)); y += 112 + 12
    b.append(week_bars(18, y, 354, c)); y += 210 + 28
    b.append(label(18, y, "Nach Fach", c)); y += 28
    b.append(subj_bars(18, y, 354, BY_SUBJ, c, sub)); y += 29 * 4 + 20
    b.append(label(18, y, "Stundenplan", c)); y += 12
    b.append(stat_card(18, y, 112, "11", "fallen aus", "+3 ggü. Aug", c["danger"], c)
             + stat_card(139, y, 112, "9", "Vertretungen", "−2 ggü. Aug", c["ok"], c)
             + stat_card(260, y, 112, "5", "Tests", "bis 30. Sept", c["faint"], c))
    return page(390, 844, c, "".join(b))

# ════════════════ ПК ════════════════
def pc_base(theme, c):
    return m43.pc_base(theme, c)

def pc_timer(c, theme, sub):
    """Links groß der Timer, rechts «Heute» und die Woche — wie Karteikarten auf dem PC."""
    b = [pc_base(theme, c), R(262, 0, 1178, 900, 0, c["paper"])]
    b.append(eyebrow(284, 39, "Heute 1 h 15 min", c) + title(284, 80, "Lerntimer", c, 38))
    lx, lw = 284, 560
    cx = lx + lw / 2
    b.append(R(lx, 116, lw, 620, 28, c["card"]))
    b.append(subj_line(cx, 150, "Ma", c, sub, "Runde 3 von 4"))
    b.append(ring(cx, 380, 150, 0.708, c, big="17:42", bottom="fertig um 16:52", sw=16, size=72))
    b.append(rounds(cx, 580, 2, 4, c, cur=2))
    b.append(button(cx - 200, 630, 150, "Stopp", c, "sand", STOP) + button(cx - 40, 630, 240, "Pause", c, icon=PAUSE))
    b.append(T(cx, 712, "Leertaste: Pause · Esc: Stopp", 12, 700, c["faint"], "middle"))
    rx, rw = 884, 520
    b.append(R(rx + rw - 38, 45, 38, 38, 19, c["card"]) + ICON(rx + rw - 30, 53, 0.92, c["ink"], SLIDERS, 2))
    b.append(label(rx, 128, "Heute", c) + T(rx + rw, 128, "1 h 15 min", 12.5, 800, c["accink"], "end"))
    rows, h = session_rows(rx, 140, rw, TODAY, c, sub); b.append(rows)
    y = 140 + h + 30
    b.append(week_bars(rx, y, rw, c)); y += 210 + 28
    b.append(label(rx, y, "Diese Woche nach Fach", c) + T(rx + rw, y, "Statistik", 12.5, 800, c["accink"], "end")); y += 28
    b.append(subj_bars(rx, y, rw, BY_SUBJ, c, sub))
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-bereit": (p_bereit, ("hell", "dunkel")),
    "handy-02-laeuft": (p_laeuft, ("hell", "dunkel")),
    "handy-03-pausiert": (p_pausiert, ("hell",)),
    "handy-04-pause": (p_erholung, ("hell", "dunkel")),
    "handy-05-geschafft": (p_geschafft, ("hell", "dunkel")),
    "handy-06-stoppen": (p_stoppen, ("hell",)),
    "handy-07-eigene-zeiten": (p_einstellungen, ("hell",)),
    "handy-08-start": (p_start, ("hell", "dunkel")),
    "handy-09-statistik": (p_statistik, ("hell", "dunkel")),
    "pc-01-lerntimer": (pc_timer, ("hell", "dunkel")),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            c = g.LIGHT if theme == "hell" else g.DARK
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
