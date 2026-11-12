# Генератор макетов части 27 «Kanäle + Für morgen»: ORBook пишет в Telegram-канал класса (новый план, сводка «für morgen»),
# для WhatsApp — кнопка «Nachricht teilen». Экран админки «Kanäle».
# Основа — Soft 45 «Admin · Einstellungen», 26 «Mitteilungen» (строки с переключателями, «So sieht es aus»), 43 «Blatt», PC 47.
# Помощники и цвета — из генератора части 17 (те же токены Soft).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g17", os.path.join(HERE, "..", "17-pwa-push", "gen.py"))
m17 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m17)
g, m15, m22, m26 = m17.g, m17.m15, m17.m22, m17.m26
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, badge, note_box, switch, segmented, overlay, svg = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.badge, g.note_box, g.switch, g.segmented, g.overlay, g.svg)
CHECK, CHEV_R, CHEV_D, BACK, CLOSE, COPY, LOCK, KEY, USER = g.CHECK, g.CHEV_R, g.CHEV_D, g.BACK, g.CLOSE, g.COPY, g.LOCK, g.KEY, g.USER
toast, sheet_bg, page, INFO, WARN = m15.toast, m15.sheet_bg, m22.page, m15.INFO, m15.WARN
est, wide_button, HLINE, logo, hero, REFRESH = m26.est, m26.wide_button, m26.HLINE, m17.logo, m17.hero, m17.REFRESH

# Значки (контур, как lucide): Megaphone — «Kanäle», Send — Telegram, MessageCircle — WhatsApp
MEGA = P("M3 11l18-5v12L3 14v-3z") + P("M11.6 16.8a3 3 0 1 1-5.8-1.6")
SEND = P("M22 2L11 13") + P("M22 2l-7 20-4-9-9-4z")
CHAT = P("M7.9 20A9 9 0 1 0 4 16.1L2 22z")
CLOCK = '<circle cx="12" cy="12" r="9"/>' + P("M12 7v5l3 2")
SEARCHING = P("M21 12a9 9 0 1 1-6.2-8.6")  # дуга «ищем…»
CHAN = "9b Klasse"        # название группы класса в примерах (без имён людей)
BOT = "@ORBookBot"        # один общий бот ORBook для всех классов
LINK = "orbook.orbitium.net"

def head(c, eb="Admin · Einstellungen", ttl="Kanäle"):
    return round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, eb, c) + title(66, 65, ttl, c)

def wpill(x, y, text, c, w=None):
    """Значение-«таблетка» со стрелкой вниз, как время в «Admin · Mitteilungen» (часть 17)."""
    w = w or est(text, 13) + 40
    return R(x + .5, y + .5, w - 1, 31, 15.5, "none", c["rule"]) + T(x + 14, y + 21, text, 13, 700, c["ink"]) + ICON(x + w - 23, y + 9.5, 0.5, c["faint"], CHEV_D, 2.2), w

# ── Статус Telegram ──
def tg_status(x, y, w, c, state="ok", pc=False):
    """Зелёная карточка «Telegram · verbunden» (или розовая «nicht angekommen») + «Test senden»/«Neu verbinden»."""
    ok = state == "ok"
    bg, fg = (c["oktint"], c["ok"]) if ok else (c["dtint"], c["danger"])
    ttl = "Telegram · verbunden" if ok else "Nicht angekommen"
    sub = f"„{CHAN}“ · 27 Mitglieder" if ok else "Bot wurde aus der Gruppe entfernt"
    btn = "Test senden" if ok else "Neu verbinden"
    bw = est(btn, 12.5) + 30
    return (R(x, y, w, 64, 20, bg) + f'<circle cx="{x + 30}" cy="{y + 32}" r="16" fill="{c["card"]}"/>' + ICON(x + 21, y + 23, 0.75, fg, SEND if ok else WARN, 2)
            + T(x + 56, y + 28, ttl, 14.5, 800, fg) + T(x + 56, y + 47, sub, 12, 400, c["muted"])
            + R(x + w - bw - 14, y + 16, bw, 32, 16, c["card"]) + T(x + w - bw / 2 - 14, y + 37, btn, 12.5, 800, c["accink"] if ok else c["danger"], "middle"))

# ── «Was wird gesendet»: (заголовок, подпись-части, вкл.) ──
def what_card(x, y, w, c, dim=False, minutes="30 Min."):
    rh = 73.5
    rows = [("Neuer Plan", [("Sofort, nur die Änderungen", 400, "faint")], True),
            ("Für morgen", [("Tests, Aufgaben, erste Stunde", 400, "faint")], True),
            ("Neuer Test eingetragen", [("Sobald er eingetragen ist", 400, "faint")], False)]
    out = [R(x, y, w, rh * 4, 22, c["card"])]
    for i, (t, parts, on) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HLINE(x + 14, x + w - 14, ry, c))
        out.append(T(x + 14, ry + 34, t, 14.5, 400, c["ink"]))
        out.append(T(x + 14, ry + 53, "".join(S(p, wt, c[col]) for p, wt, col in parts), 12, 400, c["faint"], raw=True))
        out.append(switch(x + w - 56, ry + 26, on and not dim, c))
    ry = y + 3 * rh
    out.append(HLINE(x + 14, x + w - 14, ry, c))
    out.append(T(x + 14, ry + 34, "„Für morgen“ nach Schulschluss", 14.5, 400, c["ink"]) + T(x + 14, ry + 53, "Heute um 13:35", 12, 400, c["faint"]))
    pill, pw = wpill(0, 0, minutes, c)
    out.append(f'<g transform="translate({x + w - 14 - pw} {ry + 21})">{pill}</g>')
    body = "".join(out)
    return (f'<g opacity="0.55">{body}</g>' if dim else body), rh * 4

# ── Пример сообщения в Telegram ──
PLAN_MSG = [[("Neuer Plan für Do, 13.11.", 800, "ink")],
            [("2. Std Mathe – fällt aus", 400, "ink")],
            [("4. Std Geschichte – Vertretung, Raum B12", 400, "ink")],
            [("6. Std Sport – in Raum Halle 2", 400, "ink")],
            [(LINK, 700, "accink")]]
MORGEN_MSG = [[("Für morgen, Fr 14.11.", 800, "ink")],
              [("Test: ", 800, "ink"), ("Mathe – Klassenarbeit", 400, "ink")],
              [("Aufgaben: ", 800, "ink"), ("Deutsch – Gedicht, Str. 1–2", 400, "ink")],
              [("Englisch – Workbook S. 34", 400, "ink")],
              [("Erste Stunde: ", 800, "ink"), ("07:30 Deutsch, Raum 102", 400, "ink")],
              [(LINK, 700, "accink")]]

def bubble(x, y, w, c, msg, time="15:40", head_line=True):
    """Сообщение бота в канале: песочная карточка (как «So sieht es aus» в Soft 26), логотип, имя канала, текст, время."""
    lh = 20
    h = 50 + len(msg) * lh + 14
    out = [R(x, y, w, h, 22, c["sand"]), logo(x + 14, y + 12, c), T(x + 56, y + 27, "ORBook", 13, 800, c["ink"])]
    bd, _ = badge(x + 56 + est("ORBook", 13) + 14, y + 15, "BOT", c, "tint"); out.append(bd)
    for i, parts in enumerate(msg):
        indent = 0 if i == 0 or parts[0][1] == 800 or parts[0][2] == "faint" or len(parts) > 1 or msg is not MORGEN_MSG else est("Aufgaben: ", 13.5) + 4
        out.append(T(x + 56 + indent, y + 50 + i * lh, "".join(S(t, wt, c[col]) for t, wt, col in parts), 13.5, 400, c["ink"], raw=True))
    out.append(T(x + w - 14, y + h - 12, time, 11.5, 400, c["faint"], "end"))
    return "".join(out), h

def preview(x, y, w, c, which=0):
    out = [label(x, y, "So sieht es aus", c), segmented(x, y + 12, w, ["Neuer Plan", "Für morgen"], which, c, h=36)]
    bb, bh = bubble(x, y + 60, w, c, PLAN_MSG if which == 0 else MORGEN_MSG, "07:14" if which == 0 else "13:35")
    return "".join(out) + bb, 60 + bh

# ── WhatsApp: только «Teilen» ──
def wa_card(x, y, w, c):
    h = 136
    return (label(x, y, "WhatsApp", c) + R(x, y + 14, w, h, 22, c["card"]) + f'<circle cx="{x + 30}" cy="{y + 46}" r="16" fill="{c["sand"]}"/>'
            + ICON(x + 21, y + 37, 0.75, c["muted"], CHAT, 2) + T(x + 56, y + 42, "Nur zum Teilen", 14.5, 800, c["ink"])
            + T(x + 56, y + 61, "Automatisch geht es bei WhatsApp nicht.", 12.5, 400, c["muted"])
            + button(x + 14, y + 80, w - 28, "Nachricht teilen", c, "sand", m15.SHARE, h=48)), h + 14

SENT = [("Heute 13:35", "Für morgen · Fr 14.11.", "Telegram"), ("Heute 07:14", "Neuer Plan · Do 13.11.", "Telegram"), ("Gestern 13:50", "Für morgen · Do 13.11.", "Telegram")]

def sent_card(x, y, w, c, rows=SENT):
    out = [label(x, y, "Zuletzt gesendet", c), R(x, y + 14, w, 56 * len(rows), 22, c["card"])]
    for i, (when, what, where) in enumerate(rows):
        ry = y + 14 + i * 56
        if i: out.append(HLINE(x + 14, x + w - 14, ry, c))
        out.append(T(x + 14, ry + 25, what, 14, 600, c["ink"]) + T(x + 14, ry + 43, when, 12, 400, c["faint"]) + T(x + w - 14, ry + 34, where, 12.5, 400, c["muted"], "end"))
    return "".join(out), 14 + 56 * len(rows)

def off_button(x, y, w, c, text="Telegram trennen"):
    return R(x, y, w, 48, 24, c["card"]) + ICON(x + w / 2 - est(text, 14) / 2 - 16, y + 16, 0.67, c["danger"], CLOSE, 2) + T(x + w / 2 + 10, y + 29, text, 14, 700, c["danger"], "middle")

PRIV = ""

# ════════════════ Telefon ════════════════
def main_body(c, state="ok", which=0):
    b = [head(c), tg_status(18, 92, 354, c, state)]
    y = 92 + 64 + 34
    b.append(label(18, y, "Was wird gesendet", c))
    card, ch = what_card(18, y + 14, 354, c); b.append(card); y += 14 + ch + 12
    y += 22
    pv, ph = preview(18, y, 354, c, which); b.append(pv); y += ph + 34
    wa, wh = wa_card(18, y, 354, c); b.append(wa); y += wh + 34
    sc, sh = sent_card(18, y, 354, c); b.append(sc); y += sh + 18
    b.append(off_button(18, y, 354, c)); y += 48
    return "".join(b), y + 30

def p_main(c, theme, sub):
    body, H = main_body(c)
    return page(390, H, c, body)

def p_fehler(c, theme, sub):
    """Бот удалён из канала (или канал удалён): красная карточка и «Neu verbinden» вместо «Test senden»."""
    body, H = main_body(c, "fehler")
    return page(390, 844, c, body + toast(18, 770, 354, "Nicht angekommen – bitte neu verbinden", c, WARN))

def p_test(c, theme, sub):
    body, H = main_body(c)
    return page(390, 844, c, body + toast(18, 770, 354, "Test gesendet", c, SEND))

def p_leer(c, theme, sub):
    """Ещё не подключено: большая карточка «Telegram verbinden», ниже серым — что будет приходить; WhatsApp работает и так."""
    hc, hh = hero(18, 92, 354, c, MEGA, "Noch keine Gruppe",
                  ["Neuer Plan und „Für morgen“", "direkt in die Telegram-Gruppe."],
                  "Telegram verbinden", SEND)
    y = 92 + hh + 34
    b = [head(c), hc, f'<g opacity="0.55">{label(18, y, "Was wird gesendet", c)}</g>']
    card, ch = what_card(18, y + 14, 354, c, dim=True); b.append(card); y += 14 + ch + 34
    wa, wh = wa_card(18, y, 354, c); b.append(wa); y += wh + 30
    return page(390, y, c, "".join(b))

def p_laden(c, theme, sub):
    k = c["skel"]
    b = [head(c), R(18, 92, 354, 64, 20, c["card"]) + f'<circle cx="48" cy="124" r="16" fill="{k}"/>' + R(74, 112, 150, 12, 6, k) + R(74, 132, 110, 10, 5, k)]
    y = 190
    b.append(R(18, y - 10, 110, 12, 6, k) + R(18, y + 14, 354, 294, 22, c["card"]))
    for i in range(4):
        ry = y + 14 + i * 73.5
        b.append(R(32, ry + 24, 130 + (i % 2) * 40, 12, 6, k) + R(32, ry + 44, 190, 10, 5, k) + R(316, ry + 26, 42, 24, 12, k))
    y += 14 + 294 + 46
    b.append(R(18, y - 10, 110, 12, 6, k) + R(18, y + 12, 354, 36, 18, k) + R(18, y + 60, 354, 180, 22, k))
    return page(390, 844, c, "".join(b))

# ── Шторка «Für morgen · wann?» ──
def wann_body(c, x, y, w, pc=False):
    b = [T(x, y, "Minuten nach der letzten Stunde.", 13.5, 400, c["muted"])]
    b.append(segmented(x, y + 22, w, ["15", "30", "45", "60", "90"], 1, c, h=40))
    y += 90
    rows = [("Heute · Do", "bis 13:05", "13:35"), ("Morgen · Fr", "bis 12:20", "12:50"), ("Montag · 17.11.", "bis 15:10", "15:40")]
    b.append(label(x, y, "Dann kommt die Nachricht", c) + R(x, y + 14, w, 52 * 3, 22, c["card"]))
    for i, (d, last, at) in enumerate(rows):
        ry = y + 14 + i * 52
        if i: b.append(HLINE(x + 14, x + w - 14, ry, c))
        b.append(T(x + 14, ry + 23, d, 14, 600, c["ink"]) + T(x + 14, ry + 40, "letzte Stunde " + last, 12, 400, c["faint"]))
        b.append(R(x + w - 74, ry + 12, 60, 28, 14, c["tint"]) + T(x + w - 44, ry + 31, at, 13, 800, c["accink"], "middle"))
    y += 14 + 156 + 14
    b.append(note_box(x, y, w, ["Fällt die letzte Stunde aus, zählt die davor."], c, INFO))
    return "".join(b), y + 41

def p_wann(c, theme, sub):
    top = 300
    base_, _ = main_body(c)
    b = [base_, sheet_bg(c, top, 390, 844), eyebrow(18, top + 41, "Kanäle", c), title(18, top + 70, "Für morgen · wann?", c, 26), round_btn(338, top + 42, c, CLOSE, size=34)]
    body, end = wann_body(c, 18, top + 102, 354); b.append(body)
    b.append(button(18, end + 16, 354, "Fertig", c))
    return page(390, 844, c, "".join(b))

# ── Шторка «Telegram verbinden»: 1 бот, 2 в канал, 3 ORBook находит канал ──
def step_head(x, y, n, ttl, sub, c, done=False):
    circ = (f'<circle cx="{x + 14}" cy="{y + 14}" r="14" fill="{c["oktint"] if done else c["tint"]}"/>'
            + (ICON(x + 6, y + 6, 0.67, c["ok"], CHECK, 2.4) if done else T(x + 14, y + 19, str(n), 14, 900, c["accink"], "middle")))
    return circ + T(x + 40, y + 11, ttl, 14.5, 800, c["ink"]) + T(x + 40, y + 30, "".join(S(t, wt, c[col]) for t, wt, col in sub), 12.5, 400, c["muted"], raw=True)

def connect_body(c, x, y, w, found=False):
    """1 — открыть Telegram (ссылка t.me/…?startgroup=код), 2 — выбрать группу, 3 — ORBook видит код и подключается сам."""
    b = [step_head(x, y, 1, "Telegram öffnen", [("Der Bot ", 400, "muted"), (BOT, 800, "ink")], c, done=found)]
    b.append(R(x + 40, y + 46, w - 40, 44, 22, c["accent"] if not found else c["sand"]) + ICON(x + 40 + (w - 40) / 2 + 12 - est("In Telegram öffnen", 14) / 2 - 28, y + 58, 0.83, c["on"] if not found else c["accink"], SEND, 2)
             + T(x + 40 + (w - 40) / 2 + 12, y + 73, "In Telegram öffnen", 14, 800, c["on"] if not found else c["accink"], "middle"))
    y += 112
    b.append(step_head(x, y, 2, "Gruppe der Klasse wählen", [("Telegram fügt den Bot hinzu", 400, "muted")], c, done=found))
    y += 66
    b.append(step_head(x, y, 3, "Fertig", [("ORBook verbindet sich selbst", 400, "muted")], c, done=found))
    y += 50
    if found:
        b.append(R(x + 40, y, w - 40, 64, 18, c["oktint"]) + logo(x + 52, y + 13, c) + T(x + 92, y + 28, f"„{CHAN}“", 14.5, 800, c["ink"])
                 + T(x + 92, y + 47, "Gruppe · 27 Mitglieder", 12, 400, c["muted"]) + ICON(x + w - 34, y + 22, 0.83, c["ok"], CHECK, 2.4))
        y += 64
    else:
        b.append(R(x + 40, y, w - 40, 52, 18, c["sand"]) + ICON(x + 54, y + 16, 0.83, c["accink"], SEARCHING, 2.4)
                 + T(x + 84, y + 31, "Warte auf Telegram …", 13.5, 700, c["muted"]))
        y += 52
    return "".join(b), y

def connect_sheet(c, top, found=False):
    b = [sheet_bg(c, top, 390, 844), eyebrow(18, top + 41, "Kanäle", c), title(18, top + 70, "Telegram verbinden", c, 26), round_btn(338, top + 42, c, CLOSE, size=34)]
    body, end = connect_body(c, 18, top + 102, 354, found); b.append(body)
    if found:
        b.append(button(18, end + 22, 354, "Fertig", c))
    else:
        b.append(T(195, end + 40, "Der Link gilt 15 Minuten.", 12, 400, c["faint"], "middle"))
    return "".join(b)

def p_leer_base(c, theme, sub):
    return m26.strip(p_leer(c, theme, sub))

def p_verbinden(c, theme, sub): return page(390, 844, c, p_leer_base(c, theme, sub) + connect_sheet(c, 330))
def p_gefunden(c, theme, sub): return page(390, 844, c, p_leer_base(c, theme, sub) + connect_sheet(c, 270, True))

# ── Шторка «Nachricht teilen» (WhatsApp) ──
def p_teilen(c, theme, sub):
    top = 250
    base_, _ = main_body(c)
    b = [base_, sheet_bg(c, top, 390, 844), eyebrow(18, top + 41, "WhatsApp", c), title(18, top + 70, "Nachricht teilen", c, 26), round_btn(338, top + 42, c, CLOSE, size=34)]
    b.append(segmented(18, top + 96, 354, ["Neuer Plan", "Für morgen"], 1, c, h=36))
    bb, bh = bubble(18, top + 146, 354, c, MORGEN_MSG, "jetzt"); b.append(bb)
    y = top + 146 + bh + 18
    b.append(wide_button(18, y, 354, "In WhatsApp teilen", c, CHAT))
    b.append(button(18, y + 60, 354, "Text kopieren", c, "sand", COPY))
    return page(390, 844, c, "".join(b))

# ── Диалог «Telegram trennen?» ──
def dialog(c, x, y, w):
    b = [R(x, y, w, 232, 28, c["paper"], extra=' filter="url(#nsh0)"'), f'<circle cx="{x + w / 2}" cy="{y + 44}" r="22" fill="{c["dtint"]}"/>',
         ICON(x + w / 2 - 10, y + 34, 0.83, c["danger"], CLOSE, 2.2), T(x + w / 2, y + 96, "Telegram trennen?", 18, 900, c["ink"], "middle"),
         T(x + w / 2, y + 126, f"Der Bot verlässt „{CHAN}“.", 13.5, 400, c["muted"], "middle")]
    half = (w - 52) / 2
    b.append(button(x + 20, y + 164, half, "Abbrechen", c, "sand", None) + button(x + 32 + half, y + 164, half, "Trennen", c, "danger", None))
    return "".join(b)

def p_trennen(c, theme, sub):
    base_, _ = main_body(c)
    return page(390, 844, c, base_ + overlay(c, 390, 844) + dialog(c, 24, 306, 342))

# ── Admin → Einstellungen: новая строка «Kanäle» (над «Mitteilungen») ──
def p_einstellungen(c, theme, sub):
    b = [round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, "Admin", c) + title(66, 65, "Einstellungen", c)]
    rows = [(LOCK, "Zugangscodes", "5 aktiv"), (P("M5 21V4h12l-2 4 2 4H5"), "Arten von Tests", "4"), (MEGA, "Kanäle", "Telegram")]
    card, h = m22.rows_card(18, 92, 354, rows, c); b.append(card)
    bd, _ = badge(110, 92 + 2 * 52.5 + 17, "NEU", c, "tint"); b.append(bd)
    y = 92 + h + 34
    b.append(label(18, y, "Mitteilungen", c)); y += 14
    b.append(R(18, y, 354, 67 * 2, 22, c["card"]))
    b.append(T(32, y + 30, "Mitteilungen erlauben", 15, 400, c["ink"]) + T(32, y + 49, "Schüler können sie in „Mehr“ einschalten", 12, 400, c["faint"]) + switch(316, y + 21.5, True, c))
    b.append(HLINE(32, 358, y + 67, c))
    b.append(T(32, y + 97, "Erinnerung für morgen", 15, 400, c["ink"]) + T(32, y + 116, "Tests und Hausaufgaben", 12, 400, c["faint"]))
    pill, pw = wpill(0, 0, "18:00", c, 84); b.append(f'<g transform="translate({358 - pw} {y + 85})">{pill}</g>')
    y += 134 + 14
    b.append(T(18, y + 12, "Mitteilungen gehen aufs Handy jedes Einzelnen,", 12, 400, c["faint"]))
    b.append(T(18, y + 29, "Kanäle in die Gruppe der Klasse.", 12, 400, c["faint"]))
    return page(390, 844, c, "".join(b))

# ════════════════ Computer ════════════════
g.ADMIN_NAV[:] = [
    ("Übersicht", P("M4 11l8-7 8 7v9H4z"), None), ("Editor-Codes", KEY, "4"), ("Lehrer-Codes", USER, "3"), ("Zugangscodes", LOCK, "5"),
    ("Tests", P("M5 21V4h12l-2 4 2 4H5"), "5"), ("Kurse &amp; Fächer", '<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16"), None),
    ("Muster", P("M12 3l9 5-9 5-9-5z") + P("M3 13l9 5 9-5"), None), ("Materialien", m15.FOLDER, None), ("Termine", g.CAL, None),
    ("Kanäle", MEGA, None), ("Protokoll", P("M5 4h14v16H5z") + P("M9 9h6M9 13h6M9 17h3"), None),
    ("Einstellungen", '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/>' + P("M7 7.5h.01M7 16.5h.01"), None)]

L, LW, RX, RW = 284, 550, 854, 550

def pc_head(c, test=True):
    b = [g.admin_sidebar(c, 900, "Kanäle"), eyebrow(284, 39, "Admin · 9b", c), title(284, 80, "Kanäle", c, 38)]
    if test: b.append(button(1230, 40, 174, "Test senden", c, "sand", SEND, h=46))
    return "".join(b)

def pc_main(c, theme, sub, state="ok"):
    b = [pc_head(c, False), tg_status(L, 110, LW, c, state)]  # «Test senden» — уже в зелёной карточке
    b.append(label(L, 210, "Was wird gesendet", c))
    card, ch = what_card(L, 224, LW, c); b.append(card)
    b.append(off_button(L, 224 + ch + 24, 220, c))
    pv, ph = preview(RX, 110, RW, c, 0); b.append(pv)
    wa, wh = wa_card(RX, 110 + ph + 30, RW, c); b.append(wa)
    sc, _ = sent_card(RX, 110 + ph + 30 + wh + 30, RW, c, SENT[:2]); b.append(sc)
    return page(1440, 900, c, "".join(b))

def pc_verbinden(c, theme, sub):
    b = [m26.strip(pc_leer(c, theme, sub)), overlay(c, 1440, 900)]
    X, W, H = 450, 540, 470
    Y = (900 - H) / 2
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(g.modal_head(X, Y, W, "Kanäle", "Telegram verbinden", c))
    body, end = connect_body(c, X + 26, Y + 104, W - 52, found=False); b.append(body)
    b.append(T(X + W / 2, end + 40, "Der Link gilt 15 Minuten.", 12, 400, c["faint"], "middle"))
    return page(1440, 900, c, "".join(b))

def pc_leer(c, theme, sub):
    b = [pc_head(c, False)]
    hc = (R(L, 110, LW, 150, 22, c["card"]) + f'<circle cx="{L + 44}" cy="154" r="24" fill="{c["tint"]}"/>' + ICON(L + 32, 142, 1, c["accink"], MEGA, 2)
          + T(L + 84, 148, "Noch keine Gruppe", 17, 900, c["ink"]) + T(L + 84, 169, "Neuer Plan und „Für morgen“ direkt in die Telegram-Gruppe.", 12.5, 400, c["muted"])
          + wide_button(L + 20, 196, 260, "Telegram verbinden", c, SEND, h=44))
    b.append(hc)
    b.append(f'<g opacity="0.55">{label(L, 300, "Was wird gesendet", c)}</g>')
    card, _ = what_card(L, 314, LW, c, dim=True); b.append(card)
    pv, ph = preview(RX, 110, RW, c, 1); b.append(f'<g opacity="0.55">{pv}</g>')
    wa, _ = wa_card(RX, 110 + ph + 30, RW, c); b.append(wa)
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-kanaele": p_main,
    "handy-02-leer": p_leer,
    "handy-03-verbinden": p_verbinden,
    "handy-04-gefunden": p_gefunden,
    "handy-05-wann": p_wann,
    "handy-06-teilen": p_teilen,
    "handy-07-test": p_test,
    "handy-08-fehler": p_fehler,
    "handy-09-trennen": p_trennen,
    "handy-10-laden": p_laden,
    "handy-11-einstellungen": p_einstellungen,
    "pc-01-kanaele": pc_main,
    "pc-02-leer": pc_leer,
    "pc-03-verbinden": pc_verbinden,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
