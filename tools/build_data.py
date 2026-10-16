#!/usr/bin/env python3
"""Assemble assets/js/data.js from research JSON + the lab roster.

Usage: python3 tools/build_data.py <research_dir>
Expects tanha.json, graduates.json, current.json in <research_dir>.
Hand edits belong in tools/overrides.json (merged last), not in data.js.
"""
import json, re, sys, unicodedata, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RES = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'research'

AREAS = [
    dict(id='ssl', short='Semi-supervised', name='Semi-supervised learning',
         description='Learning from a few labels and many unlabelled examples: self-training, co-training, boosting, pseudo-labelling and consistency regularisation. This is the lab\'s founding theme.',
         keywords=['Self-training', 'Boosting', 'Pseudo-labels', 'Consistency', 'Label propagation']),
    dict(id='med', short='Medical imaging', name='Medical image analysis',
         description='Segmentation, classification and super-resolution for clinical images, often with scarce annotations.',
         keywords=['Segmentation', 'Classification', 'Super-resolution']),
    dict(id='ts', short='Time-series', name='Time-series & data streams',
         description='Forecasting, activity recognition and online learning on non-stationary streams.',
         keywords=['Forecasting', 'Concept drift', 'HAR']),
    dict(id='cv', short='Computer vision', name='Computer vision & detection',
         description='Object detection, recognition and visual understanding in real-world scenes.',
         keywords=['Detection', 'Recognition']),
    dict(id='da', short='Domain & generative', name='Domain adaptation & generative models',
         description='Transferring knowledge across domains, and generative adversarial networks for synthesis and augmentation.',
         keywords=['Transfer', 'GANs']),
    dict(id='bio', short='Biomedical signals', name='Biomedical signals & applied AI',
         description='Sleep medicine, physiological signals, bioinformatics and energy systems.',
         keywords=['Sleep staging', 'ECG / EEG', 'Bioinformatics']),
]

# id, name, status, area text, areas, match patterns (regex on a single normalised author name)
ROSTER = [
    ('samadi', 'Negin Samadi', 'alumni', 'Data streams', ['ts', 'ssl'], [r'^n\w* samadi$']),
    ('hassanzadeh', 'Sahar Hassanzadeh Mostafaei', 'alumni', 'Sleep medicine', ['bio'], [r'^s\w* hassanzadeh mostafaei$', r'^s\w* (h\.? )?mostafaei$']),
    ('rmohammadi', 'Razieh Mohammadi', 'alumni', 'Energy harvesting', ['bio'], [r'^r\w* mohammadi$']),
    ('kazempour', 'Amin Kazempour', 'alumni', 'Semi-supervised learning · Medical image analysis', ['ssl', 'med'], [r'^a\w* kazempour$']),
    ('zarrin', 'Mahdi Zarrin', 'alumni', 'Semi-supervised learning · Medical image analysis', ['ssl', 'med'], [r'^m\w* zarrin$']),
    ('tarhib', 'Sanaz Tarhib', 'alumni', 'Generative adversarial networks', ['da'], [r'^s\w* tarhib$']),
    ('imanzadeh', 'Soodabeh Imanzadeh', 'alumni', 'Time-series', ['ts'], [r'^s\w* imanzadeh$']),
    ('chaychi', 'Sana Chaychi', 'alumni', 'Semi-supervised learning', ['ssl'], [r'^s\w* chaychi$']),
    ('iraji', 'Mohammad Saber Iraji', 'alumni', 'Medical image analysis', ['med'], [r'^m\w*( s\w*)? iraji$']),
    ('fakhim', 'Alireza Fakhim Babaei', 'alumni', 'Biomedical signal processing', ['bio'], [r'^(alireza|a) fakhim( ?baba?ei)?$']),
    ('shahi', 'Nasrin Shahi', 'alumni', 'Medical image analysis', ['med'], [r'^n\w* shahi$']),
    ('rasi', 'Nima Rasi Baghmishe', 'alumni', 'Computer vision', ['cv'], [r'^n\w* rasi( baghmish\w*)?$', r'^n\w* baghmish\w*$']),
    ('dolati', 'Mahdi Dolati', 'alumni', 'Medical image analysis', ['med'], [r'^m\w* dolati$']),
    ('roshan', 'SeyedEhsan Roshan', 'current', 'Semi-supervised learning · Medical image analysis', ['ssl', 'med'], [r'^(s\w* )?(s\w* )?e\w* roshan$', r'^seyedehsan roshan$']),
    ('baghaei', 'Mahdi Baghaei Oskouei', 'current', 'Domain adaptation', ['da'], [r'^m\w* baghaei( oskouei)?$']),
    ('nikkhah', 'Hanieh Nikkhah', 'current', 'Semi-supervised learning · Medical image analysis', ['ssl', 'med'], [r'^h\w* nikkhah$']),
    ('jafari', 'Somayeh Jafari', 'current', 'Semi-supervised learning', ['ssl'], [r'^s\w* jafari$']),
    ('jalili', 'Hamed Jalili Majdi', 'current', 'Medical image analysis · Image segmentation', ['med'], [r'^h\w* jalili( majdi)?$', r'^h\w* majdi$']),
    ('afraz', 'Pouya Afraz', 'current', 'Medical image segmentation', ['med'], [r'^p\w* afraz$']),
    ('ghanbari', 'Mohammadreza Ghanbari', 'current', 'Object detection', ['cv'], [r'^m\w* ghanbari( matin)?$', r'^m\w* ganbari matin$', r'^m\w* matin$']),
    ('sattari', 'Fardis Sattari', 'current', 'Time-series', ['ts'], [r'^f\w* sattari$']),
    ('behzad', 'Zahra Behzad', 'current', 'Time-series', ['ts'], [r'^z\w* behzad$']),
    ('mehdipour', 'Aidin Mehdipour', 'current', 'Semi-supervised learning', ['ssl'], [r'^a\w* mehdipour$']),
    ('maghsoudi', 'Borhan Maghsoudi', 'current', 'Semi-supervised learning', ['ssl'], [r'^b\w* maghsoudi$']),
    ('mirzaei', 'Sanaz Mirzaei', 'current', 'Semi-supervised learning', ['ssl'], [r'^s\w* mirzaei$']),
    ('ghazal', 'Mohammed Talal Ghazal', 'current', 'Medical image analysis', ['med'], [r'^m\w*( t\w*)? ghazal$']),
]
TANHA_RE = [r'^j\w* tanha$']

AREA_KW = {
    'ssl': r'semi-?supervis|self-?train|co-?train|pseudo|unlabel|label propagation|few labels|limited label|weakly|boost',
    'med': r'medical|segment|mri|\bct\b|x-?ray|skin|lesion|covid|cancer|tumou?r|retin|polyp|clinical|patholog|ultrasound|brain|breast|lung|disease|diagnos|super-?resolution',
    'ts': r'time[- ]?series|stream|forecast|activity recognition|sensor|drift|temporal|traffic|load|stock|smartphone',
    'cv': r'object detect|detection|vision|recogni|yolo|image classif|scene|face|visual|meter',
    'da': r'domain adapt|transfer|generative|\bgan\b|adversarial|cross-?domain',
    'bio': r'sleep|ecg|eeg|apnea|signal|protein|drug|gene|energy|harvest|bioinform',
}


def norm(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'[^a-z0-9 .\-]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def tkey(title):
    return re.sub(r'[^a-z0-9]', '', norm(title))[:90]


def split_authors(a):
    if isinstance(a, list):
        return [x if isinstance(x, str) else x.get('name', '') for x in a]
    return [x.strip() for x in re.split(r',| and |;', a or '') if x.strip()]


def matches(name, pats):
    n = norm(name).replace('.', ' ').replace('-', ' ')
    n = re.sub(r'\s+', ' ', n).strip()
    # Collapse "s. e. roshan" style initials
    return any(re.search(p, n) for p in pats)


def norm_degree(d):
    d = (d or '').lower()
    if 'phd' in d or 'ph.d' in d or 'doctor' in d:
        return 'PhD'
    if re.search(r'\bm\.?sc|\bme\b|master|m\.?eng', d):
        return 'MSc'
    return None


def load(name):
    p = RES / name
    return json.loads(p.read_text()) if p.exists() else None


def clean_links(links):
    out = {}
    for k, v in (links or {}).items():
        if not v or not isinstance(v, str):
            continue
        if k == 'dblp' and '/search' in v:  # name-search URLs aren't profiles
            continue
        if k == 'openalex':
            continue
        out[k] = v
    return out


def main():
    tanha = load('tanha.json') or {}
    people_raw = (load('graduates.json') or []) + (load('current.json') or [])
    overrides = json.loads((ROOT / 'tools/overrides.json').read_text()) if (ROOT / 'tools/overrides.json').exists() else {}
    by_name = {norm(p.get('name', '')): p for p in people_raw}

    pubs = {}
    def add_pub(p, src_member=None):
        title = (p.get('title') or '').strip().rstrip('.')
        if not title:
            return
        doi = (p.get('doi') or '').lower().replace('https://doi.org/', '') or None
        k = doi or tkey(title)
        alt = tkey(title)
        existing = pubs.get(k) or next((v for v in pubs.values() if v['_t'] == alt), None)
        authors = split_authors(p.get('authors'))
        cit = p.get('citations')
        if existing:
            if cit is not None and (existing['citations'] is None or cit > existing['citations']):
                existing['citations'] = cit
            if len(authors) > len(existing['_a']):
                existing['_a'] = authors
            for f in ('venue', 'url', 'doi', 'year'):
                if not existing.get(f) and p.get(f):
                    existing[f] = p[f]
            if src_member:
                existing['_m'].add(src_member)
            return
        typ = (p.get('type') or '').lower()
        venue = p.get('venue') or ''
        if typ not in ('journal', 'conference', 'preprint'):
            vl = venue.lower()
            typ = 'preprint' if re.search(r'arxiv|biorxiv|medrxiv|ssrn|preprint|research square', vl) else \
                  'conference' if re.search(r'conf|proc|symposium|workshop|iccke|icee|csicc|ipria|aisp|iccia|icwr|ickm|ieee .*international', vl) else \
                  'journal' if venue else 'other'
        pubs[k] = dict(title=title, _a=authors, year=p.get('year'), venue=venue, type=typ, url=p.get('url') or (f'https://doi.org/{doi}' if doi else ''),
                       doi=doi, citations=cit, _t=alt, _m={src_member} if src_member else set())

    for p in tanha.get('publications', []):
        add_pub(p, 'tanha')
    roster_by_id = {r[0]: r for r in ROSTER}
    for r in ROSTER:
        raw = by_name.get(norm(r[1])) or next((v for kk, v in by_name.items() if norm(r[1]).split()[-1] in kk and norm(r[1]).split()[0][:3] in kk), None)
        for p in (raw or {}).get('publications', []) or []:
            add_pub(p, r[0])

    # Never name-match people whose research found nothing verifiable (common names → false positives).
    raw_of = lambda nm: by_name.get(norm(nm)) or {}
    no_match = {r[0] for r in ROSTER if (raw_of(r[1]).get('confidence') or '').lower().startswith('none')}
    aliases = {}
    out_pubs = []
    for p in pubs.values():
        members = set(p['_m'])
        for a in p['_a']:
            for r in ROSTER:
                if matches(a, r[5]):
                    aliases.setdefault(r[0], set()).add(a.strip())
            if matches(a, TANHA_RE):
                members.add('tanha')
            for r in ROSTER:
                if r[0] not in no_match and matches(a, r[5]):
                    members.add(r[0])
        text = norm(p['title'] + ' ' + (p['venue'] or ''))
        areas = [a for a, rx in AREA_KW.items() if re.search(rx, text)]
        try:
            year = int(p['year']) if p['year'] else None
        except (TypeError, ValueError):
            year = None
        out_pubs.append(dict(title=p['title'], authors=', '.join(p['_a']), year=year, venue=p['venue'], type=p['type'],
                             url=p['url'], doi=p['doi'], citations=p['citations'], members=sorted(members), areas=areas[:3]))
    out_pubs.sort(key=lambda x: (-(x['year'] or 0), -(x['citations'] or 0)))
    for p in sorted(out_pubs, key=lambda x: -(x['citations'] or 0))[:6]:
        p['highlight'] = True

    people = []
    for r in ROSTER:
        pid, name, status, area_text, areas, _ = r
        raw = by_name.get(norm(name)) or next((v for kk, v in by_name.items() if norm(name).split()[-1] in kk and norm(name).split()[0][:3] in kk), {}) or {}
        conf = 'none' if (raw.get('confidence') or '').lower().startswith('none') else 'ok'
        person = dict(id=pid, name=name, status=status, areaText=area_text, areas=areas,
                      degree=norm_degree(raw.get('degree')),
                      position=raw.get('current_position') or None,
                      bio=raw.get('bio') if conf != 'none' else None,
                      links=clean_links(raw.get('links')) if conf != 'none' else {},
                      metrics={k: v for k, v in (raw.get('metrics') or {}).items() if k in ('citations', 'hindex') and v is not None} if conf != 'none' else {},
                      achievements=raw.get('achievements') or [] if conf != 'none' else [],
                      aliases=sorted(x for x in aliases.get(pid, ()) if pid not in no_match and x != name),
                      photo=None)
        person.update(overrides.get('people', {}).get(pid, {}))
        people.append(person)

    prof = tanha.get('profile', {})
    pi = dict(name=f"Dr. {prof.get('name') or 'Jafar Tanha'}".replace('Dr. Dr. ', 'Dr. '), aliases=['J. Tanha', 'Jafar Tanha'],
              title=prof.get('title') or 'Associate Professor', affiliation=prof.get('affiliation') or 'University of Tabriz',
              bio=[b for b in (prof.get('bio') if isinstance(prof.get('bio'), list) else [prof.get('bio')]) if b],
              education=prof.get('education') or [], interests=prof.get('interests') or [],
              achievements=tanha.get('achievements') or [], email=prof.get('email'),
              links=clean_links(prof.get('links')), metrics=tanha.get('metrics') or {}, photo=None)
    pi.update(overrides.get('pi', {}))

    data = dict(asOf=datetime.date.today().strftime('%B %Y'), areas=AREAS, pi=pi, people=people,
                publications=out_pubs, milestones=overrides.get('milestones', []))
    js = '/* Generated by tools/build_data.py — edit tools/overrides.json, then rebuild. */\nwindow.LAB = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
    (ROOT / 'assets/js/data.js').write_text(js)
    print(f"pubs={len(out_pubs)} people={len(people)}")
    for r in ROSTER:
        n = sum(1 for p in out_pubs if r[0] in p['members'])
        print(f"  {r[1]:32s} {n}")
    print('  tanha', sum(1 for p in out_pubs if 'tanha' in p['members']))


if __name__ == '__main__':
    main()
