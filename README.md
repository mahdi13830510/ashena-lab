# Ashna Lab website

Static site for Dr. Jafar Tanha's AI lab at the University of Tabriz. There is no build step and no dependencies, so it can be hosted anywhere (GitHub Pages, Netlify, a university server).

```
index.html                 page structure
assets/css/styles.css      design tokens + all styles (light/dark)
assets/js/app.js           interactions (hero animation, people, sheet, graph, publications)
assets/js/data.js          GENERATED — all content
tools/build_data.py        builds data.js from research/*.json + overrides
tools/overrides.json       hand-edited facts: director profile, milestones, per-person fixes
research/*.json            raw bibliographic research (OpenAlex, Semantic Scholar, ORCID, Google Scholar)
```

## Preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Updating content

Don't edit `data.js` by hand. Put changes in `tools/overrides.json` and rebuild:

```sh
python3 tools/build_data.py research
```

Add or fix a person's details under `"people"`, keyed by their id (the ids are in `ROSTER` in `build_data.py`):

```json
"people": {
  "dolati": {
    "degree": "MSc",
    "position": "PhD student, Sabancı University",
    "bio": "…",
    "photo": "assets/img/people/dolati.jpg",
    "links": { "scholar": "https://scholar.google.com/citations?user=…", "linkedin": "https://…" }
  }
}
```

Supported link keys: `scholar, orcid, researchgate, linkedin, github, dblp, semanticscholar, scopus, university, homepage`.
Photos are optional; without one, an initials monogram is shown. Use square photos of at least 300 px.

New students go in `ROSTER` in `tools/build_data.py`. Each entry takes an id, a name, a status, research areas and author-name patterns used to match their papers.

Deep links: `/#person/<id>` opens a member's profile directly. `Ctrl/⌘ + K` opens site-wide search.

After editing CSS or JS, bump the `?v=` number on the `<link>`/`<script>` tags in `index.html` so browsers fetch the new files instead of a cached copy.

## Deploy (GitHub Pages)

Push the folder to a repository, then go to **Settings → Pages → Deploy from branch → `/ (root)`**.
