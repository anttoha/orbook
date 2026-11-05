# Builds the same JSON as /api/week, /api/day, /api/meta, /api/courses from a private copy of the prod DB.
import collections, datetime as dt, json, os, secrets, sys
out = sys.argv[1]
os.environ.update(ORBOOK_ENV="development", ORBOOK_DB_PATH=f"{out}/copy.db", ORBOOK_POLLER_ENABLED="false", ORBOOK_SECRET_KEY=__import__("base64").b64encode(secrets.token_bytes(48)).decode(), ORBOOK_BACKUP_DIR=out)
from orbook.config import Settings
from orbook.db import make_engine, make_sessionmaker
from orbook.plan.view import build_context, courses_view, day_view, meta_view, week_view
settings = Settings()
with make_sessionmaker(make_engine(settings.db_path))() as db:
    vc = build_context(db, settings, None)
    print("today", vc.today)
    dump = lambda m: json.loads(m.model_dump_json(by_alias=True))
    meta, courses = dump(meta_view(vc)), dump(courses_view(vc))
    json.dump({"meta": meta, "courses": courses}, open(f"{out}/base.json", "w"))
    monday = vc.today - dt.timedelta(days=vc.today.weekday())
    weeks, days = {}, {}
    # this week, last week, and every week with stored plans (more real cases to test)
    from sqlalchemy import text
    stored = sorted({dt.date.fromisoformat(str(r[0])[:10]) for r in db.execute(text("select date from plan_days"))})
    mondays = sorted({monday, monday - dt.timedelta(days=7), *(d - dt.timedelta(days=d.weekday()) for d in stored)})
    for m in mondays:
        w = dump(week_view(vc, m)); weeks[m.isoformat()] = w
        for offset in range(5):
            d = m + dt.timedelta(days=offset)
            days[d.isoformat()] = dump(day_view(vc, d))
    json.dump(weeks, open(f"{out}/weeks.json", "w")); json.dump(days, open(f"{out}/days.json", "w"))
    c = collections.Counter(); st = collections.Counter(); ex = {}
    for iso, day in days.items():
        st[day["status"]] += 1
        for l in day["lessons"] + day["expectedLessons"]:
            c["lessons"] += 1; c["status:" + str(l["status"])] += 1
            if l["subject"] is None: c["subject:null"] += 1; ex.setdefault("subject:null", (iso, l["period"], l["status"]))
            elif l["subject"].get("name") is None: c["subject.name:null"] += 1
            for k in ("course", "teacher", "room", "start", "end", "moved", "info"):
                if l.get(k) is None: c[k + ":null"] += 1
    print("weeks", len(weeks), "days", len(days)); print("day status", dict(st)); print(dict(sorted(c.items()))); print("first subject:null", ex)
    print("this week days:", [(d["date"], d["status"], len(d["lessons"]), len(d["expectedLessons"]), d["fetchedAt"], d["publishedAt"], d["stale"]) for d in weeks[monday.isoformat()]["days"]])
    print("last week days:", [(d["date"], d["status"], len(d["lessons"])) for d in weeks[(monday - dt.timedelta(days=7)).isoformat()]["days"]])
