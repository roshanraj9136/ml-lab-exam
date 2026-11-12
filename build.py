"""Wrap src/*.html bodies with shared head, nav, and pager. Run: python build.py"""
import pathlib

ROOT = pathlib.Path(__file__).parent
PAGES = [
    ("index", "DSL501 Lab Exam Prep", "Home"),
    ("dt", "1 · Decision Tree · DSL501 Lab Exam", "1 · Decision Tree"),
    ("rf", "2 · Random Forest · DSL501 Lab Exam", "2 · Random Forest"),
    ("knn", "3 · KNN · DSL501 Lab Exam", "3 · KNN"),
    ("nn", "4 · Neural Networks · DSL501 Lab Exam", "4 · Neural Nets"),
    ("cnn", "5 · CNN · DSL501 Lab Exam", "5 · CNN"),
    ("rnn", "6 · RNN & Variants · DSL501 Lab Exam", "6 · RNN & Variants"),
    ("cheatsheet", "Cheat Sheet · DSL501 Lab Exam", "Cheat Sheet"),
]

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="Concise pen-and-paper prep for DSL501 Labs 6-11: Decision Tree, Random Forest, KNN, Neural Networks, CNN, RNN & Variants.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Zilla+Slab:wght@500;600;700&display=swap">
<link rel="stylesheet" href="style.css">
<script>
try{{const t=localStorage.getItem('dsl501.theme');if(t)document.documentElement.dataset.theme=t;}}catch(_){{}}
window.MathJax={{tex:{{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]}},svg:{{fontCache:'global'}},options:{{skipHtmlTags:['script','noscript','style','textarea','pre','code']}}}};
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js" integrity="sha384-KKWa9jJ1MZvssLeOoXG6FiOAZfAgmzsIIfw8BXwI9+kYm0lPCbC6yTQPBC00F1/L" crossorigin="anonymous"></script>
<script defer src="app.js"></script>
</head>
<body>
"""

FOOTER = """<footer>DSL501:ML-2026-27M · Offline Pen/Paper Lab Exam Prep (Covers Labs 6–11 only)</footer>
"""


def nav(active):
    links = []
    for slug, _, label in PAGES:
        href = "./" if slug == "index" else f"{slug}.html"
        cur = ' aria-current="page"' if slug == active else ""
        cls = ' class="home"' if slug == "index" else ""
        links.append(f'<a href="{href}"{cls}{cur}>{label}</a>')
    links.append('<button type="button" class="theme-btn" id="theme-toggle" aria-label="Toggle color theme">Theme</button>')
    return '<nav class="topnav" aria-label="Pages">' + "".join(links) + "</nav>\n"


def pager(i):
    prev_ = PAGES[i - 1] if i > 0 else None
    next_ = PAGES[i + 1] if i + 1 < len(PAGES) else None
    href = lambda s: "./" if s == "index" else f"{s}.html"
    left = f'<a href="{href(prev_[0])}">&larr; {prev_[2]}</a>' if prev_ else "<span></span>"
    right = f'<a href="{href(next_[0])}">{next_[2]} &rarr;</a>' if next_ else "<span></span>"
    return f'<div class="pager">{left}{right}</div>\n'


for i, (slug, title, _) in enumerate(PAGES):
    body = (ROOT / "src" / f"{slug}.html").read_text(encoding="utf-8")
    html = HEAD.format(title=title) + nav(slug) + '<div class="wrap">\n' + body + pager(i) + FOOTER + "</div>\n</body>\n</html>\n"
    (ROOT / f"{slug}.html").write_text(html, encoding="utf-8", newline="\n")
    print("built", slug)
