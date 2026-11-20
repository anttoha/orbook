# Макеты части 31e «Offline + Mitteilungen in der Android-App»:
#   • «Mitteilungen» внутри APK: уведомления делает само приложение (без Google), включение — разрешение Android;
#   • новый блок «Vor der Stunde» — напоминание о следующем уроке (по умолчанию выключено, работает без интернета);
#   • «Kurz erklärt» — четвёртый шаг: где включить напоминание;
#   • как уведомления выглядят на экране блокировки.
# Офлайн-открытие приложения нового экрана не требует: показывается уже существующее состояние «offline» (часть 06).
# Основа — генератор части 17 (Mitteilungen) и 25 (Kurz erklärt), рабочий стол — часть 31.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp); sp.loader.exec_module(mod)
    return mod

m17 = _load("g17", "17-pwa-push")
m25 = _load("g25", "25-aufgaben-sync")
w31 = _load("g31", "31-android-widget")
g, m15, m26 = m17.g, m17.m15, m17.m26
T, S, R, ICON, P, label, eyebrow, title, button, switch, segmented, note_box = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.switch, g.segmented, g.note_box)
BELL, BELL_OFF, REFRESH, CHECK, CHEV_R, HLINE, page, head, hero, steps, pref_card, ruhe_card, app_icon, logo = (
    m17.BELL, m17.BELL_OFF, m17.REFRESH, m17.CHECK, m17.CHEV_R, m17.HLINE, m17.page, m17.head, m17.hero, m17.steps,
    m17.pref_card, m17.ruhe_card, m17.app_icon, m17.logo)
I_MITT, INFO = m17.I_MITT, m17.INFO
CLOCK = '<circle cx="12" cy="12" r="9"/>' + P("M12 7v5l3 2")
SETTINGS = '<circle cx="12" cy="12" r="3"/>' + P("M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1")
DOTS = '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'

# ── Статус «включено» в приложении: как в части 17, только «auf diesem Handy» и «Test» ──
def status_app(x, y, w, c):
    return (R(x, y, w, 64, 20, c["oktint"]) + f'<circle cx="{x + 30}" cy="{y + 32}" r="16" fill="{c["card"]}"/>' + ICON(x + 21, y + 23, 0.75, c["ok"], BELL, 2)
            + T(x + 56, y + 28, "An auf diesem Handy", 14.5, 800, c["ok"]) + T(x + 56, y + 47, "Zuletzt geprüft: 07:14", 12, 400, c["muted"])
            + R(x + w - 104, y + 16, 90, 32, 16, c["card"]) + T(x + w - 59, y + 37, "Test senden", 12.5, 800, c["accink"], "middle"))

# ── Новый блок «Vor der Stunde»: напоминание о следующем уроке ──
def before_card(x, y, w, c, on=False, dim=False):
    rh = 73.5
    h = rh + (58 if on else 0)
    out = [label(x, y, "Vor der Stunde", c), R(x, y + 14, w, h, 22, c["card"])]
    out.append(T(x + 14, y + 48, "Erinnerung vor jeder Stunde", 14.5, 400, c["faint"] if dim else c["ink"])
               + T(x + 14, y + 67, "Fach und Raum · geht auch offline", 12, 400, c["faint"]) + switch(x + w - 56, y + 40, on and not dim, c))
    if on:
        out.append(HLINE(x + 14, x + w - 14, y + 14 + rh, c))
        out.append(T(x + 14, y + 14 + rh + 34, "Wie früh", 14.5, 400, c["ink"]) + segmented(x + w - 14 - 168, y + 14 + rh + 12, 168, ["5 min", "10 min", "15 min"], 1, c, h=34))
    body = "".join(out)
    return (f'<g opacity="0.55">{body}</g>' if dim else body), 14 + h

def preview_app(x, y, w, c):
    return m17.preview(x, y, w, c, "In 10 min: 3. Std Physik · Raum 301", None)

def body_app(c, y, on=True, before=False, dim=False, x=18, w=354):
    """Всё под статусом: пример, «Benachrichtige mich», «Vor der Stunde», Ruhe."""
    b = [label(x, y, "So sieht es aus", c)]
    pv, ph = preview_app(x, y + 14, w, c); b.append(pv); y += 14 + ph + 34
    b.append(label(x, y, "Benachrichtige mich", c))
    card, ch = pref_card(x, y + 14, w, c, dim=dim); b.append(card); y += 14 + ch + 34
    bc, bh = before_card(x, y, w, c, before, dim); b.append(bc); y += bh + 34
    rc, rh = ruhe_card(x, y, w, c, not dim); b.append(f'<g opacity="0.55">{rc}</g>' if dim else rc); y += rh
    return "".join(b), y

# ════════════════ 01 · Mitteilungen in der App (an, «Vor der Stunde» aus — по умолчанию) ════════════════
def p_an(c, theme, sub, before=False):
    b = [head(c), status_app(18, 92, 354, c)]
    body, end = body_app(c, 192, before=before); b.append(body)
    return page(390, end + 40, c, "".join(b))

# ════════════════ 03 · Ещё выключено: Android спросит разрешение ════════════════
def p_aus(c, theme, sub):
    hc, hh = hero(18, 92, 354, c, BELL, "Mitteilungen sind aus",
                  ["ORBook sagt dir Bescheid, wenn sich", "dein Plan ändert oder morgen ein Test ist."],
                  "Einschalten", BELL, "Android fragt einmal, ob ORBook darf.")
    body, end = body_app(c, 92 + hh + 32, dim=True)
    return page(390, end + 40, c, head(c) + hc + body)

# ════════════════ 04 · Разрешение отклонено ════════════════
def p_blockiert(c, theme, sub):
    b = [head(c)]
    hc, hh = hero(18, 92, 354, c, BELL_OFF, "Auf dem Handy blockiert",
                  ["Du hast Mitteilungen für ORBook einmal", "abgelehnt. Erlauben geht in den Einstellungen."],
                  "Einstellungen öffnen", SETTINGS, tint="sand")
    b.append(hc)
    y = 92 + hh + 30
    b.append(label(18, y, "So erlaubst du sie wieder", c))
    items = [([("Einstellungen öffnen", 800)], SETTINGS),
             ([("Benachrichtigungen", 800), (" antippen", 400)], I_MITT),
             ([("„", 400), ("Alle ORBook-Benachrichtigungen", 800), ("“", 400)], CHECK)]
    st, sh = steps(18, y + 14, 354, c, items); b.append(st)
    y += 14 + sh + 30
    body, end = body_app(c, y, dim=True); b.append(body)
    return page(390, end + 40, c, "".join(b))

# ════════════════ 05 · Kurz erklärt · 4 von 4 ════════════════
def illu_erinnerung(x, y, w, h, c, sub):
    """Картинка: уведомление «In 10 min: Physik» и путь Mehr → Mitteilungen → Vor der Stunde."""
    out = [R(x, y, w, h, 22, c["sand"])]
    nx, ny, nw = x + 18, y + 22, w - 36
    out.append(R(nx, ny, nw, 66, 18, c["card"], extra=' filter="url(#nsh0)"') + app_icon(nx + 12, ny + 13, c, 40)
               + T(nx + 62, ny + 28, "ORBook", 13, 800, c["ink"]) + T(nx + nw - 12, ny + 28, "08:20", 12, 400, c["faint"], "end")
               + T(nx + 62, ny + 48, "In 10 min: Physik · Raum 301", 13.5, 400, c["ink"]))
    # путь: три «таблетки» со стрелками
    py = y + 120
    out.append(T(x + w / 2, py, "Einschalten unter", 12.5, 700, c["muted"], "middle"))
    chips = [("Mehr", None), ("Mitteilungen", None), ("Vor der Stunde", CLOCK)]
    widths = [g.tw(t, 12.5, 800) * 0.9 + 24 + (20 if ic else 0) for t, ic in chips]
    total = sum(widths) + 2 * 16
    cx = x + (w - total) / 2
    for i, ((t, ic), cw) in enumerate(zip(chips, widths)):
        last = i == 2
        out.append(R(cx, py + 14, cw, 36, 18, c["tint"] if last else c["card"]))
        if ic: out.append(ICON(cx + 10, py + 23, 0.75, c["accink"], ic, 2))
        out.append(T(cx + (32 if ic else 12), py + 37, t, 12.5, 800, c["accink"] if last else c["ink"]))
        cx += cw
        if not last: out.append(ICON(cx, py + 24, 0.67, c["faint"], CHEV_R, 2.2)); cx += 16
    # переключатель «включить» внизу
    sy = py + 74
    out.append(R(x + 18, sy, w - 36, 52, 16, c["card"]) + T(x + 32, sy + 31, "Erinnerung vor jeder Stunde", 13.5, 500, c["ink"]) + switch(x + w - 18 - 56, sy + 14, True, c))
    return "".join(out)

def p_tipp(c, theme, sub):
    inner, _, _ = g.base("04 Woche", theme)
    top = 96
    b = [inner, m15.sheet_bg(c, top)]
    b.append(T(372, top + 44, "Überspringen", 13.5, 700, c["muted"], "end"))
    x, y, w = 18, top + 66, 354
    b.append(illu_erinnerung(x, y, w, 256, c, sub))
    y += 256 + 30
    b.append(eyebrow(x, y, "Kurz erklärt · 4 von 4", c, True) + title(x, y + 34, "Erinnerung vor der Stunde", c, 26))
    for k, ln in enumerate(["Das Handy sagt dir kurz vorher, was kommt", "und wo – auch ohne Internet."]):
        b.append(T(x, y + 64 + k * 21, ln, 14.5, 400, c["muted"]))
    b.append(m25.dots(195, 844 - 112, 4, 3, c))
    b.append(button(18, 844 - 76, 354, "Los geht’s", c, icon=CHECK))
    return page(390, 844, c, "".join(b))

# ════════════════ 06 · Экран блокировки: так приходят уведомления ════════════════
def lock_note(x, y, w, c, when, line1, line2=None):
    h = 74 if line2 else 60
    out = [R(x, y, w, h, 20, c["card"], extra=' fill-opacity="0.94"'), app_icon(x + 12, y + 12, c, 36)]
    out.append(T(x + 58, y + 25, "ORBook", 13, 800, c["ink"]) + T(x + 58 + g.tw("ORBook", 13, 800) + 6, y + 25, "· " + when, 12, 400, c["faint"]))
    out.append(T(x + 58, y + 45, line1, 13.5, 400, c["ink"]))
    if line2: out.append(T(x + 58, y + 63, line2, 13.5, 400, c["ink"]))
    return "".join(out), h

def p_sperr(c, theme, sub):
    st = w31.St("soft", theme)
    fgc = w31.fg(st)
    b = [w31.wallpaper(st, 0, 0, 390, 844), w31.statusbar(st).replace(">7:42<", ">8:10<")]
    b.append(T(195, 150, "08:10", 72, 300, fgc, "middle", ls=-1) + T(195, 186, "Donnerstag, 20. November", 16, 600, fgc, "middle"))
    y = 236
    for when, l1, l2 in [("jetzt", "In 10 min: 3. Std Physik · Raum 301", None),
                         ("vor 25 min", "Morgen: 4. Std Geschichte fällt aus", None),
                         ("gestern 18:00", "Morgen: Test Mathe · 2. Stunde", "Hausaufgabe Englisch: Workbook p. 23")]:
        n, h = lock_note(16, y, 358, c, when, l1, l2); b.append(n); y += h + 10
    b.append(R(145, 836, 100, 4, 2, fgc, extra=' fill-opacity="0.5"'))
    return g.svg(390, 844, st.c, "".join(b), w31.wall_defs(390))

SCREENS = {
    "handy-01-mitteilungen": (p_an, ("hell", "dunkel")),
    "handy-02-vor-der-stunde-an": (lambda c, th, sub: p_an(c, th, sub, before=True), ("hell",)),
    "handy-03-aus": (p_aus, ("hell",)),
    "handy-04-blockiert": (p_blockiert, ("hell",)),
    "handy-05-kurz-erklaert": (p_tipp, ("hell", "dunkel")),
    "handy-06-sperrbildschirm": (p_sperr, ("hell",)),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            c = g.LIGHT if theme == "hell" else g.DARK
            sub = g.SUBJ[theme]
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, sub))
            n += 1
    print(n, "files")
