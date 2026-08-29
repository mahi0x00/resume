#!/usr/bin/env python3
"""
resume_tools.py — single source of truth tooling for mahi0x00/resume.

The one document that holds ALL career data is `resumeData.json` (the site reads it
directly via js/script.js). This script:

  --check       validate resumeData.json structure              (no writes)
  --render-txt  regenerate resume.txt FROM resumeData.json      (derived artifact)
  --export-csv  resumeData.json -> templates/csv/*.csv          (optional: bulk-edit in Excel)
  --import-csv  templates/csv/*.csv -> resumeData.json          (after an Excel round-trip)

Workflow for content edits:
  1. Edit resumeData.json (the single source of truth).
  2. Bump meta.lastUpdated (or let --import-csv set it to today).
  3. python3 tools/resume_tools.py --render-txt
  4. Commit + push to Dev. The site and resume.txt now both derive from the JSON.

Stdlib only — runs anywhere python3 exists.
"""
import argparse
import csv
import json
import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT, "resumeData.json")
TXT_PATH = os.path.join(ROOT, "resume.txt")
TEMPLATE_DIR = os.path.join(ROOT, "templates", "csv")

# Section name -> (csv filename, kind). kind:
#   kv         field,value rows            (meta, personal)
#   lines      one value per row           (about, trainings)
#   items      category,item rows          (skills, technicalSkills)
#   experience title,company,location,logo,period,responsibilities,skills,site
#   projects   title,description,tags
#   education  title,institution,location,logo,period
#   certs      title,year,logo
#   badges     badge_id per row
#   tools      name,logo
SECTIONS = [
    ("meta", "meta.csv", "kv"),
    ("personal", "personal.csv", "kv"),
    ("about", "about.csv", "lines"),
    ("skills", "skills.csv", "items"),
    ("education", "education.csv", "education"),
    ("experience", "experience.csv", "experience"),
    ("certifications", "certifications.csv", "certs"),
    ("credlyBadges", "credly_badges.csv", "badges"),
    ("projects", "projects.csv", "projects"),
    ("tools", "tools.csv", "tools"),
    ("technicalSkills", "technical_skills.csv", "items"),
    ("trainings", "trainings.csv", "lines"),
]


def read_csv(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.reader(f))
    return [r for r in rows if any((c or "").strip() for c in r)]


def write_csv(path, rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(rows)


def pipe_split(cell):
    return [s.strip() for s in (cell or "").split("|") if s.strip()]


def pipe_join(items):
    return " | ".join(str(i) for i in items)


def is_true(cell):
    return (cell or "").strip().upper() in ("TRUE", "1", "YES", "Y")


# ---------------------------------------------------------------- validation
def validate(data):
    required = ["meta", "personal", "about", "skills", "experience", "projects",
                "education", "certifications", "credlyBadges", "tools"]
    missing = [k for k in required if k not in data or data[k] in (None, [], {})]
    if missing:
        sys.exit(f"Validation failed — missing/empty sections: {missing}")
    if "email" not in data["personal"] or "name" not in data["personal"]:
        sys.exit("Validation failed — personal must have at least 'name' and 'email'.")
    n = (len(data["about"]) + len(data["skills"]) + len(data["experience"]) + len(data["projects"])
         + len(data["education"]) + len(data["certifications"]) + len(data["credlyBadges"]) + len(data["tools"]))
    print(f"Validation OK: {len(required)} required sections, {n} data rows.")


def load_json():
    with open(JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------- resume.txt
def render_txt(data=None):
    if data is None:
        data = load_json()
    validate(data)
    p = data["personal"]
    jobs = list(data.get("experience", [])) + list(data.get("hiddenExperience", []))
    L = []
    L.append(f"**{p['name']}**\\")
    L.append(f"{p['title']}\\")
    L.append(f"{p.get('location', 'Hyderabad, Telangana, India')}\\")
    phone, email = p.get("phone", ""), p.get("email", "")
    if phone and email:
        L.append(f"{phone} | [{email}](mailto:{email})\\")
    elif email:
        L.append(f"[{email}](mailto:{email})\\")
    L.append(f"[LinkedIn](https://www.linkedin.com/in/{p.get('linkedin', '')}/) | "
             f"[Portfolio](https://mahi0x00.github.io/resume/)")
    L += ["", "---", "", "### **Professional Summary**", ""]
    L += [f"- {a}" for a in data.get("about", [])]
    if data.get("technicalSkills"):
        L += ["", "---", "", "### **Technical Skills**", ""]
        for cat in data["technicalSkills"]:
            L.append(f"- **{cat['category']}:** {', '.join(cat['items'])}")
    L += ["", "---", "", "### **Professional Experience**", ""]
    for job in jobs:
        L.append(f"**{job['company']}, {job['location']}**  ")
        L.append(f"{job['title']}  ")
        L.append(f"*{job['period']}*")
        L.append("")
        for r in job.get("responsibilities", []):
            L.append(f"- {r}")
        if job.get("skills"):
            L.append(f"  \n*Skills: {', '.join(job['skills'])}*")
        L.append("")
    if data.get("education"):
        L += ["### **Education & Certifications**", ""]
        for e in data["education"]:
            L.append(f"- **{e['title']}** – {e['institution']} ({e['period']})")
        if data.get("certifications"):
            L.append("- **Certifications:**")
            for c in data["certifications"]:
                L.append(f"  - {c['title']} ({c['year']})")
        L.append("")
    if data.get("trainings"):
        L += ["---", "", "### **Trainings & Badges**", ""]
        L += [f"- {t}" for t in data["trainings"]]
        L.append("")
    if data.get("projects"):
        L += ["---", "", "### **Projects & Contributions**", ""]
        for prj in data["projects"]:
            tags = f" ({', '.join(prj['tags'])})" if prj.get("tags") else ""
            L.append(f"- **{prj['title']}:** {prj['description']}{tags}")
        L.append("")
    L += ["---", "", "### **Public Profiles & Portfolio**", ""]
    L.append(f"- GitHub: [{p.get('github', '')}](https://github.com/{p.get('github', '')})")
    L.append("- Resume: [mahi0x00.github.io/resume](https://mahi0x00.github.io/resume)")
    L.append("")
    L.append(f"*Updated {data['meta']['lastUpdated']} · Generated from resumeData.json (single source of truth).*")
    with open(TXT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")
    print(f"Wrote {TXT_PATH}")


# ---------------------------------------------------------------- CSV bridge
def export_csv(data):
    all_exp = list(data.get("experience", [])) + list(data.get("hiddenExperience", []))
    for key, fname, kind in SECTIONS:
        val = data.get(key, [])
        rows = []
        if key == "experience":
            rows = [["title", "company", "location", "logo", "period", "responsibilities", "skills", "site"]]
            for job in all_exp:
                rows.append([job["title"], job["company"], job["location"], job.get("logo", ""),
                             job["period"], pipe_join(job.get("responsibilities", [])),
                             pipe_join(job.get("skills", [])),
                             "FALSE" if job.get("site") is False else "TRUE"])
        elif kind == "kv":
            rows = [["field", "value"]] + [[k, str(v)] for k, v in val.items()]
        elif kind == "lines":
            rows = [["line"]] + [[str(v)] for v in val]
        elif kind == "items":
            rows = [["category", "item"]]
            for cat in val:
                for item in cat.get("items", []):
                    rows.append([cat["category"], item])
        elif kind == "projects":
            rows = [["title", "description", "tags"]]
            for prj in val:
                rows.append([prj["title"], prj["description"], pipe_join(prj.get("tags", []))])
        elif kind == "education":
            rows = [["title", "institution", "location", "logo", "period"]]
            for e in val:
                rows.append([e["title"], e["institution"], e["location"], e.get("logo", ""), e["period"]])
        elif kind == "certs":
            rows = [["title", "year", "logo"]]
            for c in val:
                rows.append([c["title"], c["year"], c.get("logo", "")])
        elif kind == "badges":
            rows = [["badge_id"]] + [[str(b)] for b in val]
        elif kind == "tools":
            rows = [["name", "logo"]]
            for t in val:
                rows.append([t["name"], t.get("logo", "")])
        write_csv(os.path.join(TEMPLATE_DIR, fname), rows)
        print(f"  wrote templates/csv/{fname} ({len(rows) - 1} data rows)")
    print("Export done — edit these in Excel if you like, then run --import-csv.")


def import_csv(csv_dir, keep_date):
    data = {}
    for key, fname, kind in SECTIONS:
        path = os.path.join(csv_dir, fname)
        if not os.path.exists(path):
            sys.exit(f"Missing CSV for section '{key}': {path}")
        rows = read_csv(path)
        body = rows[1:]
        if kind == "kv":
            data[key] = {r[0].strip(): r[1] for r in body if len(r) >= 2 and r[0].strip()}
        elif kind == "lines":
            data[key] = [r[0] for r in body if len(r) >= 1 and r[0].strip()]
        elif kind == "items":
            cats = {}
            for r in body:
                if len(r) < 2 or not r[0].strip():
                    continue
                cats.setdefault(r[0].strip(), []).append(r[1].strip())
            data[key] = [{"category": c, "items": items} for c, items in cats.items()]
        elif kind == "experience":
            visible, hidden = [], []
            for r in body:
                if len(r) < 5 or not r[0].strip():
                    continue
                rec = {"title": r[0].strip(), "company": r[1].strip(), "location": r[2].strip(),
                       "logo": (r[3] or "").strip(), "period": r[4].strip(),
                       "responsibilities": pipe_split(r[5]) if len(r) > 5 else [],
                       "skills": pipe_split(r[6]) if len(r) > 6 else []}
                (hidden if len(r) > 7 and not is_true(r[7]) else visible).append(rec)
            data["experience"] = visible
            if hidden:
                data["hiddenExperience"] = hidden
        elif kind == "projects":
            data[key] = [{"title": r[0].strip(), "description": r[1].strip(),
                          "tags": pipe_split(r[2]) if len(r) > 2 else []}
                         for r in body if len(r) >= 2 and r[0].strip()]
        elif kind == "education":
            data[key] = [{"title": r[0].strip(), "institution": r[1].strip(), "location": r[2].strip(),
                          "logo": (r[3] or "").strip(), "period": r[4].strip()}
                         for r in body if len(r) >= 5 and r[0].strip()]
        elif kind == "certs":
            data[key] = [{"title": r[0].strip(), "year": (r[1] if len(r) > 1 else "").strip(),
                          "logo": (r[2] if len(r) > 2 else "").strip()}
                         for r in body if len(r) >= 1 and r[0].strip()]
        elif kind == "badges":
            data[key] = [r[0].strip() for r in body if r and r[0].strip()]
        elif kind == "tools":
            data[key] = [{"name": r[0].strip(), "logo": (r[1] if len(r) > 1 else "").strip()}
                         for r in body if len(r) >= 1 and r[0].strip()]
    if keep_date:
        try:
            old = load_json()
            data["meta"]["lastUpdated"] = old["meta"]["lastUpdated"]
        except Exception:
            pass
    else:
        data["meta"]["lastUpdated"] = datetime.now(ZoneInfo("Asia/Kolkata")).strftime("%Y-%m-%d")
    validate(data)
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Wrote {JSON_PATH} (lastUpdated={data['meta']['lastUpdated']})")
    render_txt(data)


def main():
    ap = argparse.ArgumentParser(description="Single source of truth tooling for mahi0x00/resume")
    ap.add_argument("--check", action="store_true", help="validate resumeData.json only")
    ap.add_argument("--render-txt", action="store_true", help="regenerate resume.txt from resumeData.json")
    ap.add_argument("--export-csv", action="store_true", help="resumeData.json -> templates/csv/*.csv")
    ap.add_argument("--import-csv", action="store_true", help="templates/csv/*.csv -> resumeData.json + resume.txt")
    ap.add_argument("--dir", default=TEMPLATE_DIR, help="CSV source dir for --import-csv")
    ap.add_argument("--keep-date", action="store_true", help="keep existing meta.lastUpdated on import")
    args = ap.parse_args()

    if args.check:
        validate(load_json())
        return
    if args.export_csv:
        export_csv(load_json())
        return
    if args.import_csv:
        import_csv(args.dir, args.keep_date)
        return
    if args.render_txt:
        render_txt()
        return
    ap.print_help()


if __name__ == "__main__":
    main()
