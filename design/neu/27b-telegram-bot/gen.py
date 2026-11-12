# Генератор макетов части 27b «Telegram-бот»: личный чат с ботом ORBook вместо (или вместе с) группой класса.
# Только два места в приложении: карточка «Telegram» в Mehr → Mitteilungen и раздел Admin → Kanäle.
# Диалоги самого бота — текстом в docs/specs/27b-telegram-bot/spec.md (экономим лимиты).
# Помощники и цвета — из генераторов частей 17 и 27 (те же токены Soft).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g27", os.path.join(HERE, "..", "27-kanaele", "gen.py"))
m27 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m27)
m17, g, m15, m22, m26 = m27.m17, m27.g, m27.m15, m27.m22, m27.m26
T, S, R, ICON, label, button, badge, switch, round_btn, eyebrow, title = g.T, g.S, g.R, g.ICON, g.label, g.button, g.badge, g.switch, g.round_btn, g.eyebrow, g.title
page, toast, sheet_bg, INFO, WARN, CHECK, CLOSE = m22.page, m15.toast, m15.sheet_bg, m15.INFO, m15.WARN, g.CHECK, g.CLOSE
est, wide_button, HLINE, logo = m26.est, m26.wide_button, m26.HLINE, m17.logo
SEND, MEGA, SEARCHING, BOT = m27.SEND, m27.MEGA, m27.SEARCHING, m27.BOT

# ── Карточка «Telegram» в Mitteilungen ──
def tg_card_off(x, y, w, c):
    """Ещё не подключено: значок, одна строка зачем, кнопка «Mit Telegram verbinden»."""
    h = 142
    return (R(x, y, w, h, 22, c["card"]) + f'<circle cx="{x + 30}" cy="{y + 34}" r="16" fill="{c["tint"]}"/>' + ICON(x + 21, y + 25, 0.75, c["accink"], SEND, 2)
            + T(x + 56, y + 30, "Lieber per Telegram?", 14.5, 800, c["ink"])
            + T(x + 56, y + 49, "Dasselbe als Nachricht vom ORBook-Bot.", 12.5, 400, c["muted"])
            + wide_button(x + 14, y + 74, w - 28, "Mit Telegram verbinden", c, SEND)), h

def tg_card_on(x, y, w, c):
    """Подключено: зелёная строка, что настраивается в боте, две кнопки."""
    h = 132
    half = (w - 38) / 2
    return (R(x, y, w, h, 22, c["card"]) + R(x + 8, y + 8, w - 16, 58, 16, c["oktint"])
            + f'<circle cx="{x + 34}" cy="{y + 37}" r="15" fill="{c["card"]}"/>' + ICON(x + 25, y + 28, 0.75, c["ok"], SEND, 2)
            + T(x + 58, y + 33, "Telegram · verbunden", 14.5, 800, c["ok"]) + T(x + 58, y + 52, "Was kommt, stellst du im Bot ein.", 12, 400, c["muted"])
            + button(x + 14, y + 74, half, "Bot öffnen", c, "sand", SEND, h=44)
            + R(x + 24 + half, y + 74, half, 44, 22, c["sand"])  # «Trennen» — красный текст, как «Ausschalten» в части 17
            + T(x + 24 + half + half / 2, y + 101, "Trennen", 14, 700, c["danger"], "middle")), h

def mitt_page(c, card_fn, H=1250, extra=""):
    """Mehr → Mitteilungen (часть 17), сверху статус push; новая карточка «Telegram» сразу под ним."""
    b = [m17.head(c), m17.status_on(18, 92, 354, c)]
    y = 92 + 64 + 34
    b.append(label(18, y, "Telegram", c)); bd, _ = badge(96, y - 13.5, "NEU", c, "tint"); b.append(bd)
    card, ch = card_fn(18, y + 14, 354, c); b.append(card)
    y += 14 + ch + 34
    body, end = m17.settings_body(c, y); b.append(body)
    return page(390, H, c, "".join(b) + extra)

def p_off(c, theme, sub): return mitt_page(c, tg_card_off)
def p_on(c, theme, sub): return mitt_page(c, tg_card_on)

# ── Шторка после «Mit Telegram verbinden» ──
def connect_sheet(c, top):
    b = [sheet_bg(c, top, 390, 844), eyebrow(18, top + 41, "Mitteilungen", c), title(18, top + 70, "Mit Telegram verbinden", c, 26),
         round_btn(338, top + 42, c, CLOSE, size=34)]
    y = top + 102
    b.append(m27.step_head(18, y, 1, "Telegram öffnen", [("Der Bot ", 400, "muted"), (BOT, 800, "ink")], c))
    b.append(wide_button(58, y + 46, 314, "In Telegram öffnen", c, SEND, h=44))
    y += 112
    b.append(m27.step_head(18, y, 2, "Unten auf „Starten“ tippen", [("Fertig – hier wird es grün", 400, "muted")], c))
    y += 60
    b.append(R(58, y, 314, 52, 18, c["sand"]) + ICON(72, y + 16, 0.83, c["accink"], SEARCHING, 2.4) + T(102, y + 31, "Warte auf Telegram …", 13.5, 700, c["muted"]))
    y += 52 + 26
    b.append(T(195, y, "Der Link gilt 15 Minuten und nur für dich.", 12, 400, c["faint"], "middle"))
    b.append(T(195, y + 18, S("Anderes Handy? Schick dem Bot deinen ", 400, c["faint"]) + S("Zugangscode", 800, c["muted"]) + S(".", 400, c["faint"]), 12, 400, c["faint"], "middle", raw=True))
    return "".join(b)

def p_connect(c, theme, sub):
    return page(390, 844, c, m26.strip(p_off(c, theme, sub)) + connect_sheet(c, 400))

def p_done(c, theme, sub):
    """Вернулся из Telegram: карточка зелёная + тост."""
    return page(390, 844, c, m26.strip(p_on(c, theme, sub)) + toast(18, 770, 354, "Telegram verbunden", c, CHECK))

# ── Admin → Kanäle: личный бот сверху, группа — опция ниже ──
SENT = [("Heute 13:35", "Für morgen · Fr 14.11.", "18 Chats"), ("Heute 07:14", "Neuer Plan · Do 13.11.", "21 Chats"), ("Gestern 10:02", "Fällt aus · 5. Std Physik", "6 Chats")]

def bot_card(x, y, w, c):
    """Личный бот: разрешён ли, сколько чатов, без имён."""
    rh = 67
    return (R(x, y, w, rh * 2, 22, c["card"])
            + T(x + 14, y + 30, "Persönlicher Bot erlauben", 15, 400, c["ink"]) + T(x + 14, y + 49, "Jeder verbindet sich selbst in „Mitteilungen“", 12, 400, c["faint"]) + switch(x + w - 56, y + 21.5, True, c)
            + HLINE(x + 14, x + w - 14, y + rh, c)
            + T(x + 14, y + rh + 30, "Verbundene Chats", 15, 400, c["ink"]) + T(x + 14, y + rh + 49, "ohne Namen · nur die Anzahl", 12, 400, c["faint"])
            + T(x + w - 14, y + rh + 36, "23", 17, 900, c["ink"], "end")), rh * 2

def group_row(x, y, w, c):
    """Группа класса (часть 27) — теперь одна строка-опция, внутри всё как было."""
    return (R(x, y, w, 64, 20, c["card"]) + f'<circle cx="{x + 30}" cy="{y + 32}" r="16" fill="{c["oktint"]}"/>' + ICON(x + 21, y + 23, 0.75, c["ok"], MEGA, 2)
            + T(x + 56, y + 28, "Gruppe „9b Klasse“", 14.5, 800, c["ink"]) + T(x + 56, y + 47, "verbunden · Neuer Plan, Für morgen", 12, 400, c["faint"])
            + ICON(x + w - 34, y + 22, 0.83, c["faint"], g.CHEV_R, 2)), 64

def p_admin(c, theme, sub):
    # статус бота без «Test senden»: у админа нет своего чата, тест — в самом боте командой /heute
    st = (R(18, 92, 354, 64, 20, c["oktint"]) + f'<circle cx="48" cy="124" r="16" fill="{c["card"]}"/>' + ICON(39, 115, 0.75, c["ok"], SEND, 2)
          + T(74, 120, f"Bot {BOT} läuft", 14.5, 800, c["ok"]) + T(74, 139, "Zuletzt gesendet: heute 13:35", 12, 400, c["muted"]))
    b = [m27.head(c), st]
    y = 92 + 64 + 34
    b.append(label(18, y, "Persönlicher Bot", c)); bd, _ = badge(150, y - 13.5, "NEU", c, "tint"); b.append(bd)
    card, ch = bot_card(18, y + 14, 354, c); b.append(card)
    y += 14 + ch + 14
    b.append(T(18, y + 12, "Was und wann, wählt jeder im Bot selbst.", 12, 400, c["faint"]))
    y += 46
    b.append(label(18, y, "Gruppe der Klasse", c) + T(372, y, "zusätzlich, optional", 12, 400, c["faint"], "end"))
    gr, gh = group_row(18, y + 14, 354, c); b.append(gr)
    y += 14 + gh + 34
    sc, sh = m27.sent_card(18, y, 354, c, SENT); b.append(sc)
    y += sh + 30
    return page(390, max(844, y), c, "".join(b))

SCREENS = {
    "handy-01-mitteilungen": p_off,
    "handy-02-verbinden": p_connect,
    "handy-03-verbunden": p_done,
    "handy-04-admin": p_admin,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
