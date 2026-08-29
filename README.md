# Application Security Engineer Portfolio

A modern, GitHub-themed portfolio website for Application Security Engineers, built with
plain HTML, CSS, and JavaScript. **One document holds all career data — `resumeData.json` —
and the page reads it directly.**

## Architecture: single source of truth

```
resumeData.json   <- THE document. All content lives here (edit this, nothing else).
      │
      ├──► js/script.js fetches it on page load and renders every section.
      └──► tools/resume_tools.py --render-txt  →  resume.txt (generated, do not hand-edit)
```

- `resumeData.json` is the **only** file you edit for content changes. The site loads it
  directly via `fetch()` — no build step, no server, no re-compile.
- `resume.txt` is a **generated artifact**. Regenerate it after any JSON change:
  `python3 tools/resume_tools.py --render-txt`
- `templates/csv/` is an optional Excel bridge: `--export-csv` dumps the JSON to CSVs,
  `--import-csv` reads edited CSVs back into the JSON. Not required for normal use.

## Editing workflow

1. Edit `resumeData.json`.
2. Bump `meta.lastUpdated` (the footer shows this date).
3. Regenerate the plain-text resume: `python3 tools/resume_tools.py --render-txt`
4. Sanity check: `python3 tools/resume_tools.py --check`
5. Commit and push to the `Dev` branch — GitHub Pages serves it automatically.

## JSON structure

Top-level keys in `resumeData.json`:

| Key | Purpose | Rendered by |
|---|---|---|
| `meta` | page title, description, last-updated | site |
| `personal` | name, title, email, github, linkedin, phone, location, profile image | site + txt |
| `about` | summary bullets | site + txt (Professional Summary) |
| `skills` | SSDLC category cards | site |
| `experience` | work history (newest first) | site + txt |
| `hiddenExperience` | roles kept off the site, shown only in resume.txt (e.g. early-career roles) | txt only |
| `projects` | selected work cards | site + txt |
| `education` | degrees | site + txt |
| `certifications` | cert chips | site + txt |
| `credlyBadges` | Credly badge UUIDs (embedded live from credly.com) | site |
| `tools` | tool grid | site |
| `technicalSkills` | categorized skill list | txt only |
| `trainings` | trainings & badge list | txt only |

## Hosting on GitHub Pages

The site is published from the **`Dev`** branch (repo default). To enable on a fresh fork:

1. Push the repo, then go to **Settings → Pages**.
2. Under **Source**, select **Deploy from a branch** → branch **`Dev`** → `/ (root)` → Save.
3. The site appears at `https://<yourusername>.github.io/resume/`.

## License

MIT — see [LICENSE](/mahi0x00/resume/blob/Dev/LICENSE).

## Acknowledgments

- Font Awesome for the icons
- GitHub's design for inspiration
