# Макеты части 41 «Lernplan zum Test»:
#   • у теста/Klausur в шторке — «Lernplan erstellen»; потом там же — прогресс и дни плана с галочками;
#   • экран «Lernplan»: сколько дней (1–7, не больше, чем осталось), выходные, темы из описания + свои, как разложится по дням;
#   • задачи плана сами появляются в «Aufgaben» (подпись «Lernplan»), прогресс — в блоке «Tests» на «Start»;
#   • тест перенесли — план сдвигается сам (тост); тест удалили — вопрос в «Aufgaben»; удаление плана — с вопросом.
# Кирпичики: часть 24 (шторка теста, countdown, кнопки), 25 (строки Aufgaben, кружок «erledigt»),
# 30 (Start-блоки и нижняя навигация), 40 (окно-вопрос).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp); sp.loader.exec_module(mod)
    return mod

m25 = _load("g25", "25-aufgaben-sync")
m30 = _load("g30", "30-personalisierung")
m40 = _load("g40", "40-kalender-abo")
m24, g, m15, m22 = m25.m24, m25.g, m25.m15, m25.m22
T, S, R, ICON, P, label, eyebrow, title, button, badge, chip, switch, checkbox = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.badge, g.chip, g.switch, g.checkbox)
CHECK, CLOSE, PEN, PLUS, TRASH, SHARE, CAL, CHEV_R = g.CHECK, g.CLOSE, g.PEN, g.PLUS, g.TRASH, g.SHARE, g.CAL, g.CHEV_R
toast, sheet_bg, overlay, page = m15.toast, m15.sheet_bg, g.overlay, m24.page
LIST_CHECK, WARN = m25.LIST_CHECK, m25.WARN
check_circle, task_row, list_switch, subject_chips, done_head = m25.check_circle, m25.task_row, m25.list_switch, m25.subject_chips, m25.done_head
countdown, tint_button, wrap_text, circle_code, head, HLINE = m24.countdown, m24.tint_button, m24.wrap_text, m24.circle_code, m24.head, m24.HLINE
dialog = m40.dialog
NAMES = g.NAMES

# ── Daten (heute = Mi 17.09., wie in allen Soft-Mustern) ──
# Plan läuft schon: Mathe-Klausur Fr 19.09., 4 Tage, 2 erledigt
PLAN_MA = [("Mo 15.09.", "Scheitelpunktform", True), ("Di 16.09.", "Nullstellen berechnen", True),
           ("Heute", "Textaufgaben", False), ("Do 18.09.", "Alles wiederholen", False)]
# Neuer Plan: Physik-Test Do 25.09. — 6 Schultage frei (Mi 17. … Mi 24.), 4 gewählt → die letzten 4 vor dem Test
TOPICS_PH = [("Schwingungsdauer", True), ("Federkonstante bestimmen", True), ("Protokoll auswerten", True)]
PLAN_PH = [("Fr 19.09.", "Schwingungsdauer"), ("Mo 22.09.", "Federkonstante bestimmen"),
           ("Di 23.09.", "Protokoll auswerten"), ("Mi 24.09.", "Alles wiederholen")]

def progress(x, y, w, done, total, c, h=8):
    return R(x, y, w, h, h / 2, c["sand"]) + R(x, y, w * done / total, h, h / 2, c["accent"])

# ── Karte «Lernplan» in der Test-Шторке ──
def plan_card(x, y, w, c, rows=PLAN_MA, rh=52):
    """Сверху «2 von 4 erledigt» и полоска, ниже — дни с галочкой (сегодня жирным, сделанное зачёркнуто)."""
    done = sum(1 for r in rows if r[2])
    h = 62 + rh * len(rows)
    out = [R(x, y, w, h, 22, c["card"]),
           T(x + 16, y + 28, f"{done} von {len(rows)} erledigt", 14.5, 800, c["ink"]),
           progress(x + 16, y + 42, w - 32, done, len(rows), c)]
    for i, (day, text, ok) in enumerate(rows):
        ry = y + 62 + i * rh
        out.append(HLINE(x + 16, x + w - 16, ry, c))
        today = day == "Heute"
        out.append(T(x + 16, ry + 31, day, 12.5, 800 if today else 700, c["accink"] if today else c["faint"]))
        tc = c["faint"] if ok else c["ink"]
        out.append(T(x + 96, ry + 31, text, 14.5, 800 if today else 700, tc))
        if ok: out.append(R(x + 96, ry + 26, g.tw(text, 14.5, 700) * 0.84, 1.3, 0, c["faint"]))
        out.append(check_circle(x + w - 44, ry + rh / 2 - 13, ok, c))
    return "".join(out), h

def sheet_head(b, c, sub, top, code, kind, subj, ttl):
    b.append(circle_code(18, top + 30, code, sub))
    bd, bw = badge(74, top + 30, kind, c, "accent"); b.append(bd)
    b.append(T(74 + bw + 8, top + 44, subj, 13, 400, c["faint"]))
    b.append(T(74, top + 76, ttl, 26, 900, c["ink"], ls=-0.39))

def sheet_buttons(b, c, H):
    b.append(button(18, H - 132, 173, "Kalender", c, "sand", CAL) + button(199, H - 132, 173, "Teilen", c, "sand", SHARE))
    b.append(button(18, H - 76, 354, "Bearbeiten", c, icon=PEN))

def tests_base(theme):
    inner, _, _ = g.base("13 Klausuren", theme)
    return inner.replace(">Klausuren<", ">Tests<").replace(">Quadratische Funktionen<", ">Parabeln<")

# ════════════════ 01 · Test ohne Lernplan ════════════════
def p_test(c, theme, sub):
    H, top = 844, 196
    b = [tests_base(theme), sheet_bg(c, top, 390, H)]
    sheet_head(b, c, sub, top, "Ph", "TEST", "Physik", "Federpendel")
    y = top + 98
    b.append(countdown(18, y, 354, "8", "Tage bis zum Test", "Donnerstag, 25. September · 3. Stunde", c)); y += 76 + 14
    b.append(tint_button(18, y, 354, "Lernplan erstellen", c, LIST_CHECK)); y += 48 + 24
    b.append(label(18, y, "Was lernen, was mitbringen", c)); y += 12
    b.append(R(18, y, 354, 94, 20, c["card"]) + wrap_text(32, y + 30, ["Schwingungsdauer", "Federkonstante bestimmen", "Protokoll auswerten"], c))
    sheet_buttons(b, c, H)
    return page(390, H, c, "".join(b))

# ════════════════ 02 · Lernplan erstellen / ändern ════════════════
def day_chips(x, y, w, active, maxd, c, h=44):
    """1 … 7 Tage; больше, чем учебных дней до теста, — бледные."""
    gap = 8
    cw = (w - gap * 6) / 7
    out = []
    for i in range(1, 8):
        cx = x + (i - 1) * (cw + gap)
        if i == active:
            out.append(R(cx, y, cw, h, h / 2, c["accent"]) + T(cx + cw / 2, y + h / 2 + 6, str(i), 16, 800, c["on"], "middle"))
        elif i > maxd:
            out.append(f'<g opacity="0.4">{R(cx + .5, y + .5, cw - 1, h - 1, (h - 1) / 2, "none", c["rule"])}{T(cx + cw / 2, y + h / 2 + 6, str(i), 16, 800, c["faint"], "middle")}</g>')
        else:
            out.append(R(cx + .5, y + .5, cw - 1, h - 1, (h - 1) / 2, c["card"], c["rule"]) + T(cx + cw / 2, y + h / 2 + 6, str(i), 16, 800, c["ink"], "middle"))
    return "".join(out)

def topics_card(x, y, w, c, topics=TOPICS_PH, rh=52):
    h = rh * (len(topics) + 1)
    out = [R(x, y, w, h, 22, c["card"])]
    for i, (t, on) in enumerate(topics):
        ry = y + i * rh
        if i: out.append(HLINE(x + 16, x + w - 16, ry, c))
        out.append(checkbox(x + 16, ry + rh / 2 - 9.5, on, c) + T(x + 48, ry + rh / 2 + 5, t, 14.5, 700, c["ink"] if on else c["faint"]))
    ry = y + len(topics) * rh
    out.append(HLINE(x + 16, x + w - 16, ry, c) + ICON(x + 15, ry + rh / 2 - 10, 0.83, c["accink"], PLUS, 2.2)
               + T(x + 48, ry + rh / 2 + 5, "Thema hinzufügen", 14.5, 800, c["accink"]))
    return "".join(out), h

def plan_preview(x, y, w, c, rows=PLAN_PH, rh=48):
    h = rh * len(rows)
    out = [R(x, y, w, h, 22, c["card"])]
    for i, (day, text) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HLINE(x + 16, x + w - 16, ry, c))
        out.append(T(x + 16, ry + rh / 2 + 5, day, 12.5, 700, c["faint"]) + T(x + 96, ry + rh / 2 + 5, text, 14.5, 700, c["ink"]))
    return "".join(out), h

def weekend_row(x, y, w, c, on=False):
    return R(x, y, w, 54, 22, c["card"]) + T(x + 16, y + 32, "Auch am Wochenende", 14.5, 700, c["ink"]) + switch(x + w - 58, y + 15, on, c)

def editor_body(c, x, y, w, edit=False):
    b = [label(x, y, "Wie viele Tage lernen?", c)]
    b.append(day_chips(x, y + 14, w, 4, 6, c))
    b.append(T(x, y + 82, "Fr 19.09. – Mi 24.09.", 12.5, 700, c["muted"]))
    y += 98
    b.append(weekend_row(x, y, w, c)); y += 54 + 30
    b.append(label(x, y, "Themen", c))
    tc, th = topics_card(x, y + 12, w, c); b.append(tc); y += 12 + th + 30
    b.append(label(x, y, "So lernst du", c))
    pc, ph = plan_preview(x, y + 12, w, c); b.append(pc); y += 12 + ph
    return "".join(b), y

def p_editor(c, theme, sub, edit=False, extra=""):
    b = [head(c, "Physik · Test Do 25.09.", "Lernplan")]
    body, y = editor_body(c, 18, 104, 354, edit); b.append(body)
    y += 24
    if edit:
        b.append(button(18, y, 354, "Speichern", c)); y += 48 + 12
        b.append(button(18, y, 354, "Lernplan löschen", c, "danger", TRASH)); y += 48
    else:
        b.append(button(18, y, 354, "Lernplan starten", c)); y += 48
    H = max(844, round(y + 30))
    return page(390, H, c, "".join(b) + (extra(H) if extra else ""))

# ════════════════ 03 · Test mit Lernplan ════════════════
def p_test_plan(c, theme, sub):
    H, top = 920, 150
    b = [tests_base(theme), sheet_bg(c, top, 390, H)]
    sheet_head(b, c, sub, top, "Ma", "KLAUSUR", "Mathe", "Parabeln")
    y = top + 98
    b.append(countdown(18, y, 354, "2", "Tage bis zur Klausur", "Freitag, 19. September · 1. Stunde", c)); y += 76 + 24
    b.append(label(18, y, "Lernplan", c) + T(372, y, "Ändern", 12.5, 800, c["accink"], "end")); y += 12
    pc, ph = plan_card(18, y, 354, c); b.append(pc); y += ph + 24
    b.append(label(18, y, "Was lernen, was mitbringen", c)); y += 12
    b.append(R(18, y, 354, 74, 20, c["card"]) + wrap_text(32, y + 30, ["Scheitelpunktform, Nullstellen,", "Textaufgaben. Taschenrechner!"], c))
    sheet_buttons(b, c, H)
    return page(390, H, c, "".join(b))

# ════════════════ 04 · Aufgaben mit Lernplan-Aufgaben ════════════════
def plan_row(x, y, w, c, sub, day, wd, code, text, when, done=False, h=64):
    """Строка задачи из плана: как «Eigene», только подпись «Lernplan» (видно, откуда задача)."""
    out = [R(x, y, w, h, 22, c["card"]), g.date_tile(x + 12, y + 10, day, wd, code, sub)]
    hot = when in ("heute", "morgen")
    meta = S("Lernplan", 800, c["accink"]) + S(f" · {NAMES[code]}", 400, c["faint"]) + S(f" · {when}", 700 if hot else 400, c["accink"] if hot else c["faint"])
    out.append(T(x + 62, y + 24, meta, 11.5, 400, c["faint"], raw=True))
    out.append(T(x + 62, y + 48.5, text, 14.5, 800, c["ink"]))
    out.append(check_circle(x + w - 42, y + h / 2 - 13, done, c))
    return "".join(out)

def aufgaben_list(c, sub, y, x=18, w=354):
    b = []
    b.append(label(x, y + 12, "Heute", c)); y += 24
    b.append(plan_row(x, y, w, c, sub, "17", "MI", "Ma", "Textaufgaben", "heute")); y += 72 + 12
    b.append(label(x, y + 12, "Bis morgen", c)); y += 24
    b.append(task_row(x, y, w, c, sub, "18", "DO", "Ma", "Mü", "Buch S. 54, Nr. 3 a–d", "morgen", False, False)); y += 72
    b.append(plan_row(x, y, w, c, sub, "18", "DO", "Ma", "Alles wiederholen", "morgen")); y += 72 + 12
    b.append(label(x, y + 12, "Diese Woche", c)); y += 24
    b.append(task_row(x, y, w, c, sub, "19", "FR", "De", "Kle", "Gedicht lernen, Strophe 1–2", "in 2 Tagen", False, False)); y += 72 + 10
    b.append(done_head(x, y, w, c, 5, False)); y += 66
    return "".join(b), y

def nav(c, theme):
    return m30.nav(m30.St("soft", theme), 2)

def p_aufgaben(c, theme, sub, banner=False, extra=""):
    b = [eyebrow(18, 33, "Ab heute · 5 offen", c), title(18, 65, "Aufgaben", c), g.round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(list_switch(18, 85.31, 354, c))
    b.append(subject_chips(135.31, c, sub))
    y = 182
    if banner:
        # Тест удалили (учитель/редактор) — план остался: спросить один раз
        b.append(R(18, y, 354, 128, 22, c["sand"]) + ICON(32, y + 16, 0.75, c["muted"], WARN, 2)
                 + T(60, y + 30, "Klausur Mathe gelöscht", 14.5, 800, c["ink"])
                 + T(60, y + 50, "Fr 19.09. · Parabeln", 12.5, 400, c["muted"]))
        b.append(button(32, y + 68, 190, "Lernplan löschen", c, "danger", TRASH, h=44)
                 + R(230, y + 68, 128, 44, 22, c["card"]) + T(294, y + 95, "Behalten", 14.5, 700, c["ink"], "middle"))
        y += 128 + 8
    body, _ = aufgaben_list(c, sub, y); b.append(body)
    b.append(R(0, 744, 390, 100, 0, c["paper"]))
    b.append(nav(c, theme))
    if extra: b.append(extra)
    return page(390, 844, c, "".join(b))

# ════════════════ 05 · Start: Lernplan im Block «Tests» ════════════════
def b_tests_plan(st, x, y, w, h):
    c = st.c
    return (m30.bhead(st, x, y, "Tests", m30.FLAG) + m30.DOT(x + 18, y + 45.5, 4, st.sub["Ma"][0]) + T(x + 29, y + 50, "Mathe", 15, 800, c["ink"])
            + T(x + 14, y + 67, "Fr · in 2 Tagen", 12, 700, c["accink"])
            + progress(x + 14, y + 78, w - 54, 2, 4, c, 6) + T(x + w - 14, y + 84, "2/4", 11.5, 800, c["muted"], "end")
            + HL(x + 14, x + w - 14, y + 96, c)
            + m30.DOT(x + 18, y + 109.5, 4, st.sub["Bio"][0]) + T(x + 29, y + 114, "Bio", 13, 700, c["ink"]) + T(x + w - 14, y + 114, "Do 25.9.", 12, 400, c["faint"], "end"))
HL = m30.HL

def p_start(c, theme, sub):
    m30.DRAW["tests"] = b_tests_plan
    return m30.p_start(m30.St("soft", theme))

# ════════════════ 06/07 · Verschoben / gelöscht ════════════════
def p_verschoben(c, theme, sub):
    return p_aufgaben(c, theme, sub, extra=toast(18, 686, 354, "Klausur verschoben · Lernplan angepasst", c))

def p_geloescht(c, theme, sub):
    return p_aufgaben(c, theme, sub, banner=True)

# ════════════════ 08 · Lernplan löschen? ════════════════
LOESCHEN = (TRASH, "Lernplan löschen?", ["Die Lernaufgaben verschwinden", "aus «Aufgaben», auch erledigte."], "Löschen", TRASH, True)

def p_loeschen(c, theme, sub):
    return p_editor(c, theme, sub, edit=True, extra=lambda H: overlay(c, 390, H) + dialog(c, 18, 300, 354, *LOESCHEN))

# ════════════════ ПК ════════════════
def pc_tests_base(theme, c):
    inner, _, _ = g.base("15 Klausur · Details (Panel rechts)", theme, "PC")
    return inner.replace(">Klausuren<", ">Tests<").replace(">Quadratische Funktionen<", ">Parabeln<")

def pc_plan(c, theme, sub):
    """Панель справа (Soft PC 15): то же, что шторка на телефоне — countdown, Lernplan, описание, кнопки."""
    x, w = 1010, 388
    b = [pc_tests_base(theme, c), R(984, 16, 440, 868, 28, c["paper"])]
    b.append(eyebrow(x, 57, "Klausur", c) + R(1364, 35, 34, 34, 17, c["card"]) + ICON(1372.5, 43.5, 0.71, c["ink"], CLOSE))
    b.append(circle_code(x, 88, "Ma", sub))
    bd, bw = badge(x + 56, 86, "KLAUSUR", c, "accent"); b.append(bd)
    b.append(T(x + 56 + bw + 8, 100, "Mathe", 13, 400, c["faint"]) + T(x + 56, 129, "Parabeln", 25, 900, c["ink"], ls=-0.37))
    b.append(countdown(x, 152, w, "2", "Tage bis zur Klausur", "Freitag, 19. September · 1. Stunde", c))
    y = 256
    b.append(label(x, y, "Lernplan", c) + T(x + w, y, "Ändern", 12.5, 800, c["accink"], "end")); y += 12
    pc, ph = plan_card(x, y, w, c, rh=48); b.append(pc); y += ph + 22
    b.append(label(x, y, "Was lernen, was mitbringen", c)); y += 12
    b.append(R(x, y, w, 56, 18, c["card"]) + T(x + 16, y + 34, "Scheitelpunktform, Nullstellen, Textaufgaben.", 14, 400, c["ink"])); y += 56 + 24
    bw2 = (w - 8) / 2
    b.append(button(x, y, bw2, "Kalender", c, "sand", CAL) + button(x + bw2 + 8, y, bw2, "Teilen", c, "sand", SHARE))
    b.append(button(x, y + 64, w, "Bearbeiten", c, icon=PEN))
    return page(1440, 900, c, "".join(b))

def pc_editor(c, theme, sub):
    """«Lernplan» на ПК — окно поверх «Tests»: слева настройки, справа «So lernst du»."""
    inner, _, _ = g.base("14 Klausuren", theme, "PC")
    W, H = 800, 560
    x0, y0 = (1440 - W) / 2, (900 - H) / 2
    b = [inner.replace(">Klausuren<", ">Tests<"), overlay(c, 1440, 900),
         R(x0, y0, W, H, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x0, y0, W, H, 28, c["paper"])]
    b.append(eyebrow(x0 + 32, y0 + 44, "Physik · Test Do 25.09.", c, True) + title(x0 + 32, y0 + 80, "Lernplan", c, 30))
    b.append(R(x0 + W - 66, y0 + 26, 34, 34, 17, c["card"]) + ICON(x0 + W - 57.5, y0 + 34.5, 0.71, c["ink"], CLOSE))
    lx, lw = x0 + 32, 352
    y = y0 + 118
    b.append(label(lx, y, "Wie viele Tage lernen?", c) + day_chips(lx, y + 14, lw, 4, 6, c, h=40) + T(lx, y + 78, "Fr 19.09. – Mi 24.09.", 12.5, 700, c["muted"]))
    y += 94
    b.append(weekend_row(lx, y, lw, c)); y += 54 + 28
    b.append(label(lx, y, "Themen", c))
    tc, _ = topics_card(lx, y + 12, lw, c, rh=46); b.append(tc)
    rx, rw = x0 + W - 32 - 352, 352
    y = y0 + 118
    b.append(label(rx, y, "So lernst du", c))
    pc, _ = plan_preview(rx, y + 12, rw, c, rh=46); b.append(pc)
    b.append(button(x0 + W - 32 - 112 - 8 - 190, y0 + H - 32 - 48, 112, "Abbrechen", c, "sand", None) + button(x0 + W - 32 - 190, y0 + H - 32 - 48, 190, "Lernplan starten", c))
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-test": (p_test, ("hell", "dunkel")),
    "handy-02-lernplan": (p_editor, ("hell", "dunkel")),
    "handy-03-test-mit-plan": (p_test_plan, ("hell", "dunkel")),
    "handy-04-aufgaben": (lambda c, t, s: p_aufgaben(c, t, s), ("hell", "dunkel")),
    "handy-05-start": (p_start, ("hell",)),
    "handy-06-verschoben": (p_verschoben, ("hell",)),
    "handy-07-test-geloescht": (p_geloescht, ("hell",)),
    "handy-08-loeschen": (p_loeschen, ("hell",)),
    "pc-01-test-mit-plan": (pc_plan, ("hell", "dunkel")),
    "pc-02-lernplan": (pc_editor, ("hell",)),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            c = g.LIGHT if theme == "hell" else g.DARK
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
