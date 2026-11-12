# Генератор макетов части 26 «Schnelle Aktualisierung + Verlauf des Tages»:
# «Verlauf» — какие версии плана были у дня и что менялось; значок «Live» — новый план приходит сам, за секунды;
# «Plan-Status» — что проверено по каждому дню недели (исправление 20c: «не опубликовано» ≠ «ещё не проверяли»).
# Помощники и цвета — из генераторов частей 14–22 (те же токены Soft).
# Основа — оригиналы ORBook Soft: 05 «Tag · Liste», 08 «Info zum Tag», 04 «Woche», 33 «Neuer Plan da», 35 «Plan fehlt noch»,
# PC 09 «Info zum Tag (Panel rechts)», PC 05 «Woche».
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g22", os.path.join(HERE, "..", "22-kleinigkeiten", "gen.py"))
m22 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m22)
m19, g, m15 = m22.m19, m22.g, m22.m15
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, badge, note_box = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.badge, g.note_box)
CHECK, CHEV_R, BACK, CLOSE, SHARE, TRASH = g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.SHARE, g.TRASH
toast, sheet_bg, page, INFO, WARN = m15.toast, m15.sheet_bg, m22.page, m15.INFO, m15.WARN
REFRESH, FLAG, ARROW, BELL, LAYERS = m19.REFRESH, m19.FLAG, m19.ARROW, m19.BELL, m19.LAYERS
HISTORY = P("M3.5 12a8.5 8.5 0 1 0 2.6-6.1") + P("M3 4.5V9h4.5") + P("M12 7.5V12l3 2")   # «Verlauf» — часы со стрелкой назад
HLINE = lambda x1, x2, y, c: f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{c["hair"]}" stroke-width="1"/>'

# ── Данные: среда 17 сентября из оригинала 05 (Mathe — Vertretung, Englisch fällt aus) ──
VERS = [
    dict(when="Heute 07:12", badge="AKTUELL", changes=[("En", "3. Std · Englisch", "aus", "Lehrer krank")]),
    dict(when="Gestern 15:15", changes=[("Ma", "2. Std · Mathe", "vertretung", "Kle statt Mü · Raum 204 statt 108"),
                                        (None, "Info zum Tag", "info", "Neuer Text von der Schule")]),
    dict(when="Mo 14:02", badge2="ERSTE FASSUNG", text="Veröffentlicht · 6 Stunden, alles normal"),
]
ONE = [dict(when="Mo 14:02", badge="AKTUELL", text="Veröffentlicht · 6 Stunden, alles normal")]
WEEK = [("Mo 15.", "Plan da · seit Fr 14:02", "ok"), ("Di 16.", "Plan da · geändert Mo 15:40", "ok"),
        ("Mi 17.", "Plan da · geändert heute 07:12", "ok"), ("Do 18.", "Plan da · seit Mo 14:02", "ok"),
        ("Fr 19.", "Noch kein Plan · geprüft vor 20 Sek.", "none")]
FAR = [(d, "Noch nicht geprüft", "unknown") for d in ("Mo 29.", "Di 30.", "Mi 1.", "Do 2.")] + [("Fr 3.", "Feiertag", "free")]

# ── Мелкие детали ──
def live_dot(x, y, c, on=True, r=4):
    """Зелёная точка с ореолом = связь «Live»; пустое кольцо = сейчас не live."""
    if on:
        return f'<circle cx="{x}" cy="{y}" r="{r + 4}" fill="{c["ok"]}" fill-opacity="0.18"/><circle cx="{x}" cy="{y}" r="{r}" fill="{c["ok"]}"/>'
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{c["faint"]}" stroke-width="1.6"/>'

def live_line(x, y, c, live=True, ago="vor 20 Sek.", w=354, reload=True):
    """Строка под заголовком недели: «● Live · geprüft vor 20 Sek. ›» и справа «Neu laden» (как сейчас)."""
    head = S("Live", 800, c["ok"]) if live else S("Nicht live", 800, c["muted"])
    out = live_dot(x + 6, y - 4, c, live) + T(x + 18, y, head + S(f" · geprüft {ago}", 400, c["faint"]) + S("  ›", 800, c["faint2"]), 12, 400, c["faint"], raw=True)
    if reload:
        out += ICON(x + w - 78, y - 11, 0.54, c["accink"], REFRESH, 2.2) + T(x + w, y, "Neu laden", 12, 700, c["accink"], "end")
    return out

def est(t, size): return len(t) * size * 0.47   # ширина обычного текста Nunito (точнее, чем g.tw, для длинных строк)

def wide_button(x, y, w, text, c, icon, h=48):
    """Главная кнопка на всю ширину: значок сразу перед текстом."""
    tx = x + w / 2 + 12
    return (R(x, y, w, h, h / 2, c["accent"]) + ICON(tx - est(text, 14.5) / 2 - 27, y + h / 2 - 8, 0.67, c["on"], icon, 2.2)
            + T(tx, y + h / 2 + 5, text, 14.5, 700, c["on"], "middle"))

def circle_code(x, y, code, sub, r=13):
    _, tint, text = sub[code]
    return f'<circle cx="{x + r}" cy="{y + r}" r="{r}" fill="{tint}"/>' + T(x + r, y + r + 3.5, code, 9.5, 900, text, "middle")

def status_badge(xr, y, kind, c):
    """Бейдж статуса, выровнен по правому краю xr: FÄLLT AUS (пунктир, как в 05), VERTRETUNG (Tint), INFO (Sand)."""
    if kind == "aus":
        bw = 70.75
        return (R(xr - bw, y, bw, 18, 9, "none", c["faint2"], 1, ' stroke-dasharray="3 2"') + T(xr - bw + 7.5, y + 12.5, "FÄLLT AUS", 9.5, 800, c["muted"], ls=0.57))
    text, style = {"vertretung": ("VERTRETUNG", "tint"), "info": ("NEU", "sand"), "raum": ("RAUM", "tint")}[kind]
    bd, bw = badge(0, 0, text, c, style)
    return f'<g transform="translate({xr - bw} {y})">{bd}</g>'

def tl_card(x, y, w, c, sub, vers, action=True):
    """Карточка-лента «Verlauf»: новые сверху, слева точки на линии, у старых версий — «Ansehen ›»."""
    hs = []
    for v in vers:
        h = 46 + sum(50 if ch[3] else 36 for ch in v.get("changes", [])) + (26 if v.get("text") else 0) + 8
        hs.append(h)
    H = sum(hs)
    out = [R(x, y, w, H, 22, c["card"])]
    cx = x + 24
    if len(vers) > 1:
        out.append(f'<line x1="{cx}" y1="{y + 26}" x2="{cx}" y2="{y + H - hs[-1] + 26}" stroke="{c["rule"]}" stroke-width="2"/>')
    ey = y
    for i, (v, h) in enumerate(zip(vers, hs)):
        if i: out.append(HLINE(x + 46, x + w - 14, ey, c))
        cur = bool(v.get("badge"))
        if cur:
            out.append(f'<circle cx="{cx}" cy="{ey + 26}" r="9" fill="{c["tint"]}"/><circle cx="{cx}" cy="{ey + 26}" r="5" fill="{c["accent"]}"/>')
        else:
            out.append(f'<circle cx="{cx}" cy="{ey + 26}" r="7" fill="{c["card"]}"/><circle cx="{cx}" cy="{ey + 26}" r="4.5" fill="{c["card"]}" stroke="{c["faint2"]}" stroke-width="2"/>')
        out.append(T(x + 46, ey + 31, v["when"], 14.5, 800, c["ink"]))
        bx = x + 46 + g.tw(v["when"], 14.5, 800) * 0.93 + 8
        if cur:
            bd, _ = badge(bx, ey + 17, v["badge"], c, "tint"); out.append(bd)
        elif v.get("badge2"):
            bd, _ = badge(bx, ey + 17, v["badge2"], c, "sand"); out.append(bd)
        if action and not cur:
            out.append(T(x + w - 30, ey + 30.5, "Ansehen", 12.5, 700, c["accink"], "end") + ICON(x + w - 28, ey + 19.5, 0.58, c["accink"], CHEV_R, 2.4))
        ry = ey + 46
        for code, ttl, kind, subl in v.get("changes", []):
            if code: out.append(circle_code(x + 46, ry, code, sub))
            else: out.append(f'<circle cx="{x + 59}" cy="{ry + 13}" r="13" fill="{c["sand"]}"/>' + ICON(x + 51, ry + 5, 0.67, c["muted"], INFO, 2))
            out.append(T(x + 82, ry + (12.5 if subl else 17.5), ttl, 13.5, 700, c["ink"]))
            if subl: out.append(T(x + 82, ry + 29.5, subl, 12, 400, c["faint"]))
            out.append(status_badge(x + w - 14, ry + (0 if subl else 4), kind, c))
            ry += 50 if subl else 36
        if v.get("text"): out.append(T(x + 46, ey + 54, v["text"], 13, 400, c["muted"]))
        ey += h
    return "".join(out), H

def sheet_head(c, top, eb, ttl, back=False, x=18):
    """Шапка шторки как в 08: серая строка, заголовок 26, крестик справа; back — круглая «‹» слева (к списку версий)."""
    tx = x + 48 if back else x
    out = round_btn(x, top + 32, c, BACK) if back else ""
    return out + eyebrow(tx, top + 41, eb, c) + title(tx, top + 70, ttl, c, 26) + round_btn(338, top + 42, c, CLOSE, size=34)

def btn_pair(x, y, w, c, left="Ältere", right="Neuere", h=48, right_off=False):
    """Две песочные кнопки «‹ Ältere | Neuere ›» — листать версии."""
    bw = (w - 8) / 2
    out = R(x, y, bw, h, h / 2, c["sand"]) + ICON(x + bw / 2 - g.tw(left, 14.5) / 2 - 16, y + h / 2 - 8, 0.67, c["ink"], BACK, 2.2) \
        + T(x + bw / 2 + 8, y + h / 2 + 5, left, 14.5, 700, c["ink"], "middle")
    col = c["faint2"] if right_off else c["ink"]
    out += R(x + bw + 8, y, bw, h, h / 2, c["sand"]) + T(x + bw + 8 + bw / 2 - 8, y + h / 2 + 5, right, 14.5, 700, col, "middle") \
        + ICON(x + bw + 8 + bw / 2 + g.tw(right, 14.5) / 2 - 2, y + h / 2 - 8, 0.67, col, CHEV_R, 2.2)
    return out

def day_base(c, theme, head=None):
    """Страница дня 05 как фон под шторками (1000 высотой, как оригиналы «Blatt»). head — другая дата в шапке."""
    inner, w, h = g.base("05 Tag · Liste", theme)
    out = inner
    if head:
        out += R(60, 10, 226, 70, 0, c["paper"]) + eyebrow(66, 33, head[0], c) + title(66, 65, head[1], c)
    return out

# ════════════════ Telefon: Verlauf ════════════════
def p_info(c, theme, sub):
    """08 «Info zum Tag» + новая карточка: «Verlauf des Tages» и «Zuletzt geprüft» (вместо трёх серых строк)."""
    top, H = 536, 1000
    b = [day_base(c, theme), sheet_bg(c, top, 390, H), sheet_head(c, top, "Mittwoch, 17. September", "Info zum Tag")]
    for i, (ln, col) in enumerate([("Elternabend der 9b heute um 18:00 in Raum 102.", "ink"), ("Die Bibliothek bleibt ab 13:00 geschlossen.", "ink"),
                                   ("Frau Kle vertritt Herrn Mü bis Freitag.", "muted")]):
        b.append(T(18, top + 107 + i * 34, ln, 15, 400, c[col]))
    b.append(note_box(18, top + 197, 354, ["Aus dem Vertretungsplan der Schule, Stand 07:12."], c, INFO))
    rows = [(HISTORY, "Verlauf des Tages", "3 Fassungen · zuletzt geändert heute 07:12", None, True),
            (REFRESH, "Zuletzt geprüft", None, "vor 20 Sek.", False)]
    card, ch = m19.card_rows(18, top + 250, 354, rows, c); b.append(card)
    b.append(live_dot(372 - 38 - g.tw("vor 20 Sek.", 13, 400) - 14, top + 250 + 68.88 + 26, c))
    b.append(button(18, top + 250 + ch + 14, 354, "Teilen", c, "sand", SHARE))
    return page(390, H, c, "".join(b))

def verlauf_body(c, sub, top, vers, x=18, w=354):
    b = [T(x, top + 98, "Jede Änderung am Plan für diesen Tag – neueste oben.", 13.5, 400, c["muted"])]
    card, ch = tl_card(x, top + 116, w, c, sub, vers); b.append(card)
    y = top + 116 + ch + 14
    b.append(ICON(x, y - 1, 0.54, c["faint"], TRASH) + T(x + 18, y + 10, "Fassungen bleiben 30 Tage gespeichert.", 12, 400, c["faint"]))
    return "".join(b), y + 24

def p_verlauf(c, theme, sub):
    top, H = 484, 1000
    body, _ = verlauf_body(c, sub, top, VERS)
    b = [day_base(c, theme), sheet_bg(c, top, 390, H), sheet_head(c, top, "Mittwoch, 17. September", "Verlauf des Tages"), body]
    return page(390, H, c, "".join(b))

OLD_DAY = [(1, "De", False, (), None, None),
           (2, "Ma", False, ((INFO, "statt Mü · sonst Raum 108", "accink", None),), "vertretung", None),
           (3, "En", False, ((ARROW, "fällt aus", "accink", "Jetzt: "),), None, None),
           (4, "Ph", False, (), None, None), (5, "Ge", False, (), None, None), (6, "Sp", False, (), None, None)]

def fassung_body(c, sub, y, x=18, w=354):
    """Старая версия: подсказка «So stand der Plan …» и уроки, как они были. Что сейчас иначе — строка «Jetzt: …»."""
    b = [note_box(x, y, w, ["So stand der Plan gestern um 15:15.", "Heute um 07:12 hat er sich geändert."], c, HISTORY)]
    keep = m19.TEACH["Ma"], m19.ROOM["Ma"]
    m19.TEACH["Ma"], m19.ROOM["Ma"] = "Kle", "204"          # в этой версии Mathe уже ведёт Kle в 204
    rows, end = m19.day_list(y + 74, OLD_DAY, c, sub, x=x, w=w); b.append(rows)
    m19.TEACH["Ma"], m19.ROOM["Ma"] = keep
    y3 = y + 74 + 72 + (64 + 19.19) + 37    # начало строки Englisch
    bd, bw = badge(0, 0, "JETZT ANDERS", c, "accent")
    b.append(f'<g transform="translate({x + w - 14 - bw} {y3 + 12.5})">{bd}</g>')
    return "".join(b), end

def p_fassung(c, theme, sub):
    top, H = 60, 1000
    body, end = fassung_body(c, sub, top + 94)
    b = [day_base(c, theme), sheet_bg(c, top, 390, H), sheet_head(c, top, "Fassung 2 von 3 · Mi, 17. Sept", "Gestern 15:15", back=True), body]
    b.append(btn_pair(18, H - 78, 354, c))
    return page(390, H, c, "".join(b))

def p_verlauf_eine(c, theme, sub):
    """Одна версия: с публикации ничего не менялось."""
    top, H = 716, 1000
    b = [day_base(c, theme, ("Donnerstag · morgen", "18. September")), sheet_bg(c, top, 390, H),
         sheet_head(c, top, "Donnerstag, 18. September", "Verlauf des Tages")]
    b.append(T(18, top + 98, "Seit der Veröffentlichung hat sich nichts geändert.", 13.5, 400, c["muted"]))
    card, ch = tl_card(18, top + 116, 354, c, sub, ONE); b.append(card)
    y = top + 116 + ch + 14
    b.append(ICON(18, y - 1, 0.54, c["faint"], TRASH) + T(36, y + 10, "Fassungen bleiben 30 Tage gespeichert.", 12, 400, c["faint"]))
    return page(390, H, c, "".join(b))

def p_verlauf_laden(c, theme, sub):
    top, H = 640, 1000
    b = [day_base(c, theme), sheet_bg(c, top, 390, H), sheet_head(c, top, "Mittwoch, 17. September", "Verlauf des Tages")]
    b.append(R(18, top + 88, 250, 12, 6, c["skel"]))
    b.append(R(18, top + 116, 354, 214, 22, c["card"]))
    for i in range(3):
        y = top + 116 + i * 70
        if i: b.append(HLINE(64, 358, y, c))
        b.append(f'<circle cx="42" cy="{y + 28}" r="6" fill="{c["skel"]}"/>' + R(64, y + 21, 96 + i * 14, 13, 6.5, c["skel"]) + R(64, y + 44, 210 - i * 36, 10, 5, c["skel"]))
    return page(390, H, c, "".join(b))

def p_verlauf_fehler(c, theme, sub):
    top, H = 690, 1000
    b = [day_base(c, theme), sheet_bg(c, top, 390, H), sheet_head(c, top, "Mittwoch, 17. September", "Verlauf des Tages")]
    b.append(note_box(18, top + 92, 354, ["Der Verlauf kommt gerade nicht an.", "Der Plan selbst ist gespeichert und stimmt."], c, WARN))
    b.append(button(18, top + 166, 354, "Nochmal versuchen", c, "sand", REFRESH))
    b.append(T(195, top + 240, "Den Verlauf gibt es nur mit Internet.", 12, 400, c["faint"], "middle"))
    return page(390, H, c, "".join(b))

# ════════════════ Telefon: Live und Plan-Status ════════════════
def new_plan_banner(x, y, w, c):
    """33 «Neuer Plan da»: тот же баннер, только с «gerade eben» — он появляется сам, без перезагрузки."""
    return (R(x, y, w, 60, 20, c["tint"]) + ICON(x + 14, y + 13, 0.67, c["accink"], BELL)
            + T(x + 40, y + 25, S("Neuer Plan", 800, c["accink"]) + S(" · gerade eben", 400, c["muted"]), 13, 400, c["muted"], raw=True)
            + T(x + 40, y + 44, "Morgen: 4. Std Geschichte → Vertretung", 13, 400, c["ink"])
            + T(x + w - 14, y + 35, "Ansehen", 13, 800, c["accink"], "end"))

def week_page(c, theme, sub, live=True, ago="vor 20 Sek.", banner=False, far=False):
    """Неделя (04) со строкой «Live». far — неделя через две: целиком Muster (её школа ещё не публиковала)."""
    sub = m22.with_sport(sub)
    if far: b = [m19.ab_eyebrow(18, 33, "KW 40 · 29.9.–3.10.", "A", c), title(18, 65, "In 2 Wochen", c)]
    else: b = [eyebrow(18, 33, "KW 38 · 15.–19. Sept", c), title(18, 65, "Diese Woche", c)]
    b.append(round_btn(246, 33.31, c, BACK) + round_btn(290, 33.31, c, g.DOTS_V) + round_btn(334, 33.31, c, CHEV_R))
    b.append(live_line(18, 90, c, live, ago))
    y0 = 104
    if banner: b.append(new_plan_banner(18, y0, 354, c)); y0 += 68
    days = [("MO", "29"), ("DI", "30"), ("MI", "1"), ("DO", "2"), ("FR", "3")] if far else [("MO", "15"), ("DI", "16"), ("MI", "17"), ("DO", "18"), ("FR", "19")]
    for i, (wd, d) in enumerate(days):
        b.append(m19.day_head(i, wd, d, c, sel=(i == 2 and not far), hatch=far or i == 4, y=y0))
    if banner: b.append(R(m19.COLS[3] + m19.CW - 13, y0 + 5, 7, 7, 3.5, c["accent"]))
    gy = y0 + 46
    b.append(m19.period_labels(gy, c))
    for col in range(5):
        for row in range(6):
            x, y = m19.COLS[col], gy + row * 56
            code = m19.MUSTER[col][row]
            if far and col == 4: b.append(m19.cell(x, y, None, c, sub))            # Feiertag 3. Okt
            elif far or col == 4: b.append(m19.cell(x, y, code, c, sub, muster=True))   # ещё Muster
            else: b.append(m22.wcell(x, y, m22.slot(col, row), c, sub, False))
            if banner and (col, row) == (3, 3): b.append(R(x - 1, y - 1, m19.CW + 2, 54, 15, "none", c["accent"], 2))
    ly = gy + 6 * 56 + 8
    rows = [(LAYERS, "Fr · noch Muster", "Der Plan kommt meist am Vortag", None, True)] if not far else \
           [(LAYERS, "Ganze Woche · Muster", "So läuft die Woche normalerweise", None, True)]
    card, _ = m19.card_rows(18, ly + 8, 354, rows, c); b.append(card)
    b.append(m22.bottom_nav(c, 0))
    return "".join(b)

def status_card(x, y, w, c, live=True, h=62):
    if live:
        return (R(x, y, w, h, 20, c["oktint"]) + live_dot(x + 22, y + h / 2, c, True, 5) + T(x + 42, y + 26, "Live verbunden", 14.5, 800, c["ok"])
                + T(x + 42, y + 45, "Ein neuer Plan erscheint von selbst – in Sekunden.", 12.5, 400, c["muted"]))
    return (R(x, y, w, h, 20, c["sand"]) + live_dot(x + 22, y + h / 2, c, False, 5) + T(x + 42, y + 26, "Gerade nicht live", 14.5, 800, c["ink"])
            + T(x + 42, y + 45, "ORBook fragt stattdessen jede Minute nach.", 12.5, 400, c["muted"]))

def mark(x, y, kind, c):
    """Значок справа в строке дня: ✓ план есть · пунктирный круг — плана ещё нет · «?» — ещё не проверяли · «–» — свободно."""
    if kind == "ok":
        return f'<circle cx="{x}" cy="{y}" r="10" fill="{c["oktint"]}"/>' + ICON(x - 6.5, y - 6.5, 0.54, c["ok"], CHECK, 2.8)
    if kind == "none":
        return f'<circle cx="{x}" cy="{y}" r="9.5" fill="none" stroke="{c["faint2"]}" stroke-width="1.5" stroke-dasharray="3 2.5"/>'
    if kind == "unknown":
        return f'<circle cx="{x}" cy="{y}" r="10" fill="{c["sand"]}"/>' + T(x, y + 4.5, "?", 12.5, 800, c["muted"], "middle")
    return f'<circle cx="{x}" cy="{y}" r="10" fill="{c["sand"]}"/>' + R(x - 4, y - 1, 8, 2, 1, c["faint"])

def day_rows(x, y, w, days, c, rh=46, today=None):
    out = [R(x, y, w, len(days) * rh + 4, 22, c["card"])]
    for i, (d, text, kind) in enumerate(days):
        ry = y + 2 + i * rh
        if i: out.append(HLINE(x + 14, x + w - 14, ry, c))
        out.append(T(x + 14, ry + rh / 2 + 5, d, 14, 800, c["accink"] if i == today else c["ink"]))
        out.append(T(x + 74, ry + rh / 2 + 4.5, text, 13, 400, c["faint"] if kind in ("unknown", "free") else c["muted"]))
        out.append(mark(x + w - 26, ry + rh / 2, kind, c))
    return "".join(out), len(days) * rh + 4

def status_sheet(c, top, H=844, live=True, far=False):
    b = [sheet_bg(c, top, 390, H), sheet_head(c, top, "Stundenplan", "Plan-Status")]
    y = top + 90
    b.append(status_card(18, y, 354, c, live)); y += 62 + 18
    b.append(label(18, y + 10, "KW 40 · in 2 Wochen" if far else "Diese Woche · KW 38", c)); y += 22
    rows, rh = day_rows(18, y, 354, FAR if far else WEEK, c, today=None if far else 2); b.append(rows); y += rh + 12
    if far: foot = "So weit voraus fragt ORBook die Schule nicht von selbst."
    elif live: foot = "Schule zuletzt gefragt vor 20 Sek. · wieder in 40 Sek."
    else: foot = "Schule zuletzt gefragt vor 3 Min. · Verbindung wird neu aufgebaut."
    b.append(T(18, y + 10, foot, 12, 400, c["faint"])); y += 26
    b.append(wide_button(18, y, 354, "Diese Woche jetzt prüfen", c, REFRESH))
    return "".join(b)

def p_woche_live(c, theme, sub): return page(390, 844, c, week_page(c, theme, sub))
def p_plan_status(c, theme, sub): return page(390, 844, c, week_page(c, theme, sub) + status_sheet(c, 304))
def p_status_fern(c, theme, sub): return page(390, 844, c, week_page(c, theme, sub, far=True) + status_sheet(c, 304, far=True))
def p_nicht_live(c, theme, sub): return page(390, 844, c, week_page(c, theme, sub, live=False, ago="vor 3 Min.") + status_sheet(c, 304, live=False))
def p_neuer_plan(c, theme, sub): return page(390, 844, c, week_page(c, theme, sub, ago="gerade eben", banner=True))

def check_row(x, y, w, c, text, action="Jetzt prüfen"):
    """Белая строка под подсказкой Muster: когда этот день проверяли и что вышло + «Jetzt prüfen»."""
    return (R(x, y, w, 44, 16, c["card"]) + ICON(x + 13, y + 14, 0.67, c["muted"], REFRESH, 2)
            + T(x + 39, y + 27, text, 12.5, 400, c["muted"]) + T(x + w - 14, y + 27, action, 12.5, 800, c["accink"], "end"))

def p_plan_fehlt(c, theme, sub):
    """35 «Tag · Plan fehlt noch» (с Muster из части 19): видно, что день проверен и плана правда ещё нет."""
    inner, w, h = g.base("05 Tag · Liste", theme)
    clip = '<clipPath id="th"><rect x="0" y="0" width="390" height="129"/></clipPath>'
    b = [f'{clip}<g clip-path="url(#th)">{inner}</g>', R(60, 10, 330, 70, 0, c["paper"]), R(0, 80, 390, 50, 0, c["paper"]),
         m19.ab_eyebrow(66, 33, "Freitag · in 2 Tagen", "A", c), title(66, 65, "19. September", c),
         round_btn(290, 33.31, c, BACK), round_btn(334, 33.31, c, CHEV_R)]
    b.append(m19.muster_box(18, 92, 354, c, [S("Muster: ", 700, c["accink"]) + S("so ist der Freitag normalerweise.", 400, c["muted"]),
                                              g.esc("Der echte Plan kommt meist am Vortag.")]))
    b.append(check_row(18, 160, 354, c, "Geprüft gerade eben · noch kein Plan"))
    fr = [(i + 1, code, True, (), None, None) for i, code in enumerate(m19.MUSTER[4])]
    rows, _ = m19.day_list(214, fr, c, sub); b.append(rows)
    b.append(m22.bottom_nav(c, 0))
    b.append(toast(18, 700, 354, "Geprüft · für Freitag gibt es noch keinen Plan", c))
    return page(390, 844, c, "".join(b))

# ════════════════ Computer ════════════════
PX, PW = 1010, 388   # панель справа: x 984–1424, поля 26

def pc_panel_base(c, theme, clear_from=None):
    inner, w, h = g.base("09 Info zum Tag (Panel rechts)", theme, "PC")
    if clear_from is None:   # панель целиком заново
        return inner + R(984, 16, 440, 868, 28, c["paper"])
    return inner + R(990, clear_from, 428, 884 - clear_from - 10, 0, c["paper"])

def pc_panel_head(c, small):
    return (eyebrow(PX, 57.5, small, c) + R(1325.13, 42, 30.88, 22, 8, c["card"], c["rule"]) + T(1332.13, 56, "Esc", 11, 600, c["muted"])
            + round_btn(1364, 36, c, CLOSE, size=34))

def pc_verlauf(c, theme, sub):
    """ПК: в панели «Info zum Tag» лента версий видна сразу под текстом школы — без лишнего клика."""
    b = [pc_panel_base(c, theme, 255)]
    b.append(note_box(PX, 262, PW, ["Aus dem Vertretungsplan der Schule, Stand 07:12."], c, INFO))
    b.append(label(PX, 336, "Verlauf des Tages", c))
    b.append(T(PX + PW, 336, S("Live", 800, c["ok"]) + S(" · geprüft vor 20 Sek.", 400, c["faint"]), 12, 400, c["faint"], "end", raw=True))
    b.append(live_dot(PX + PW - est("Live · geprüft vor 20 Sek.", 12) - 6, 332, c))
    card, ch = tl_card(PX, 348, PW, c, sub, VERS); b.append(card)
    y = 348 + ch + 14
    b.append(ICON(PX, y - 1, 0.54, c["faint"], TRASH) + T(PX + 18, y + 10, "Fassungen bleiben 30 Tage gespeichert.", 12, 400, c["faint"]))
    b.append(button(PX, y + 30, PW, "Teilen", c, "sand", SHARE))
    return page(1440, 900, c, "".join(b))

def pc_fassung(c, theme, sub):
    b = [pc_panel_base(c, theme), pc_panel_head(c, "Verlauf des Tages")]
    b.append(round_btn(PX, 84, c, BACK) + eyebrow(PX + 48, 93, "Fassung 2 von 3 · Mi, 17. Sept", c) + title(PX + 48, 122, "Gestern 15:15", c, 26))
    body, end = fassung_body(c, sub, 142, x=PX, w=PW); b.append(body)
    b.append(btn_pair(PX, 816, PW, c))
    return page(1440, 900, c, "".join(b))

def strip(svg_text):
    """Содержимое готовой страницы без обёртки <svg> и <defs> — чтобы дорисовать поверх."""
    s = svg_text[svg_text.index(">") + 1: svg_text.rindex("</svg>")]
    return s[s.index("</defs>") + 7:]

def pc_status(c, theme, sub):
    """ПК: строка внизу левого меню «● Live · Stand 07:12» → окошко «Plan-Status» над ней."""
    b = [strip(m22.pc_woche(c, theme, sub, alle=False))]
    b.append(R(34, 806, 204, 20, 0, c["card"]) + live_dot(42, 816, c)
             + T(54, 820, S("Live", 800, c["ok"]) + S(" · Stand 07:12", 400, c["muted"]), 12, 400, c["muted"], raw=True))
    X, W = 24, 344
    H = 474
    Y = 796 - H
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 24, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(R(X + .5, Y + .5, W - 1, H - 1, 23.5, "none", c["hair"]))
    b.append(eyebrow(X + 18, Y + 32, "Stundenplan", c) + title(X + 18, Y + 58, "Plan-Status", c, 22) + round_btn(X + W - 48, Y + 18, c, CLOSE, size=30))
    y = Y + 74
    b.append(R(X + 18, y, W - 36, 58, 18, c["oktint"]) + live_dot(X + 38, y + 29, c, True, 5) + T(X + 56, y + 25, "Live verbunden", 14, 800, c["ok"])
             + T(X + 56, y + 43, "Ein neuer Plan erscheint von selbst.", 12, 400, c["muted"]))
    y += 58 + 16
    b.append(label(X + 18, y + 10, "Diese Woche · KW 38", c)); y += 20
    rows, rh = day_rows(X + 18, y, W - 36, [(d, t.replace("Plan da · ", "").replace("Noch kein Plan · ", "kein Plan · "), k) for d, t, k in WEEK], c, rh=38, today=2)
    b.append(rows); y += rh + 10
    b.append(T(X + 18, y + 10, "Schule gefragt vor 20 Sek. · wieder in 40 Sek.", 11.5, 400, c["faint"])); y += 24
    b.append(wide_button(X + 18, y, W - 36, "Diese Woche jetzt prüfen", c, REFRESH, h=44))
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-info": p_info,
    "handy-02-verlauf": p_verlauf,
    "handy-03-fassung": p_fassung,
    "handy-04-verlauf-eine": p_verlauf_eine,
    "handy-05-verlauf-laden": p_verlauf_laden,
    "handy-06-verlauf-fehler": p_verlauf_fehler,
    "handy-07-woche-live": p_woche_live,
    "handy-08-neuer-plan": p_neuer_plan,
    "handy-09-plan-status": p_plan_status,
    "handy-10-status-fern": p_status_fern,
    "handy-11-nicht-live": p_nicht_live,
    "handy-12-plan-fehlt": p_plan_fehlt,
    "pc-01-verlauf": pc_verlauf,
    "pc-02-fassung": pc_fassung,
    "pc-03-plan-status": pc_status,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
