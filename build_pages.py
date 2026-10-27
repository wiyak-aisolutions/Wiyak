"""Build the site's pages from one source: _src/site.html.

Edit content in _src/site.html (Arabic) and i18n.js (English), then run:
    python3 build_pages.py
Every page shares the head, nav, form (#contact), footer and scripts; only the
sections listed in PAGES change.
"""
import re

SRC = '_src/site.html'
PAGES = {
    # file: (page id, Arabic <title>, sections in order)
    'index.html':     ('home',      'ويّاك | حلول أعمال ذكية على مقاس نشاطك', ['top', 'why', 'features', 'industries', 'setup', 'contact']),
    'bot.html':       ('bot',       'شوف البوت شغال | ويّاك',                 ['demo', 'journey', 'contact']),
    'dashboard.html': ('dashboard', 'لوحة التحكم | ويّاك',                     ['dashboard', 'contact']),
    'clinic.html':    ('clinic',    'مثال العيادة بالتفصيل | ويّاك',           ['clinic', 'contact']),
    'pricing.html':   ('pricing',   'الباقات والأسعار | ويّاك',                ['pricing', 'contact']),
    'faq.html':       ('faq',       'أسئلة وشفافية | ويّاك',                   ['faq', 'trust', 'contact']),
}

src = open(SRC, encoding='utf-8').read()
start = src.index('<main id="main">') + len('<main id="main">')
end = src.index('</main>')
head, main, tail = src[:start], src[start:end], src[end:]

# each section block = its banner comment + the <section> itself
blocks = {}
for m in re.finditer(r'(<!-- =+ [^>]*=+ -->\s*)?<section\b[^>]*\bid="([^"]+)"[^>]*>.*?</section>', main, re.S):
    blocks[m.group(2)] = m.group(0).strip()
missing = {s for _, _, secs in PAGES.values() for s in secs} - blocks.keys()
assert not missing, f'sections not found in {SRC}: {missing}'
used = {s for _, _, secs in PAGES.values() for s in secs}
assert used == set(blocks), f'sections on no page: {set(blocks) - used}'

for file, (pid, title, secs) in PAGES.items():
    h = re.sub(r'<title>[^<]*</title>', f'<title>{title}</title>', head)
    h = h.replace('<body data-page="home">', f'<body data-page="{pid}">')
    page = h + '\n\n' + '\n\n'.join(blocks[s] for s in secs) + '\n' + tail
    if pid == 'home':  # same-page links stay as in-page jumps
        page = page.replace('href="index.html#', 'href="#').replace('href="index.html" class="nav-logo"', 'href="#top" class="nav-logo"')
    open(file, 'w', encoding='utf-8').write(page)
    print(f'{file:15} {", ".join(secs)}')
