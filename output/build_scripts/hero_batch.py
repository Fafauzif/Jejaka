"""Render one hero still, chosen from output/hero_job.json.

Keeping each render a separate call means one slow frame cannot lose the others,
and every result is written to output/hero_render_log.json as it completes.
"""
import json
import runpy
from pathlib import Path

ROOT = Path(r"C:\Users\fauzi\OneDrive\Desktop\Budayago")
JOB = ROOT / "output" / "hero_job.json"
LOG = ROOT / "output" / "hero_render_log.json"

helper = runpy.run_path(str(ROOT / "output" / "build_scripts" / "hero_render.py"))
job = json.loads(JOB.read_text(encoding="utf-8"))

info = helper["still"](
    str(ROOT),
    job["camera"],
    job["output"],
    width=job.get("width", 1920),
    height=job.get("height", 1200),
    samples=job.get("samples", 128),
    engine=job.get("engine", "CYCLES"),
)

log = json.loads(LOG.read_text(encoding="utf-8")) if LOG.is_file() else {"renders": []}
log["renders"] = [r for r in log["renders"] if r["written"] != info["written"]]
log["renders"].append(info)
log["renders"].sort(key=lambda r: r["written"])
LOG.write_text(json.dumps(log, indent=2) + "\n", encoding="utf-8")
print("HERO " + json.dumps(info))
