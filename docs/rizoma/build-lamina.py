#!/usr/bin/env python3
"""Genera la lámina SVG de una exploración de Rizoma.

Adaptación mínima de diagram-design (cathrynlavery/diagram-design) para KNDL:
toma su contrato de SVG accesible, su grilla de 4 px y su validador, pero
rechaza sus tipos de diagrama, sus cajas de nodo y sus radios.

La página del sitio suma una lupa 2× sobre el campo (solo puntero fino) y un
ajuste por escala que conserva la figura. El SVG exportado queda estático.

Uso:
    python3 docs/rizoma/build-lamina.py > docs/rizoma/lamina-01.svg.html
    python3 docs/rizoma/build-lamina.py --site > rizoma/que-se-conserva-cuando-algo-se-repite/lamina/index.html
"""

from __future__ import annotations

from html import escape

INK = "#e9e6dc"
DIM = "#9aa3a1"
MUTED = "#7f8a88"
TRACE = "#9fc6c9"
RULE = "rgba(233,230,220,0.14)"
SERIF = "'Newsreader', Georgia, serif"
MONO = "'JetBrains Mono', ui-monospace, monospace"
EXPLORACION_URL = "/rizoma/que-se-conserva-cuando-algo-se-repite/"

CONTOURS = """
<g transform="translate(0,240)" fill="none" stroke="rgba(233,230,220,0.055)" stroke-width="1">
  <path d="M0 88 C 170 64 318 112 462 96 S 742 54 890 84 1120 120 1280 92"/>
  <path d="M0 186 C 196 160 336 208 486 192 S 770 150 918 180 1136 216 1280 190"/>
  <path d="M0 302 C 180 276 330 324 486 306 S 776 264 930 296 1140 330 1280 304"/>
  <path d="M0 410 C 200 384 340 432 496 414 S 780 372 934 404 1146 438 1280 412"/>
  <path d="M0 520 C 186 494 332 542 488 524 S 774 482 928 514 1140 548 1280 522"/>
  <path d="M0 630 C 202 604 342 652 498 634 S 782 592 936 624 1148 658 1280 632"/>
</g>
<g transform="translate(0,240)" fill="none" stroke="rgba(233,230,220,0.075)" stroke-width="1">
  <path d="M1042 130 C 1112 106 1214 122 1248 168 C 1276 208 1240 262 1178 268 C 1110 274 1052 236 1042 190 C 1036 164 1034 140 1042 130Z"/>
  <path d="M86 566 C 156 542 258 558 292 604 C 320 644 284 698 222 704 C 154 710 96 672 86 626 C 80 600 78 576 86 566Z"/>
</g>
"""

# Cada obra lleva sus nodos: la palabra aparece debajo de la obra que la lee.
# (nombre, ancla, ¿también en la 02?)
WORKS = [
    dict(x=40, y=276, href="/poemas/persistencias-del-algo/", glyph="⁂",
         kind="POEMA · SERIE", title="Persistir en el algo",
         sub="UNA CONSTANTE EN MI SER",
         quote=["Camino con las palabras", "o me enredaré en ellas."],
         nodes=[("persistencia", "persistencia", False)]),
    dict(x=40, y=520, href="/poemas/cae/", glyph="⁂",
         kind="POEMA", title="∞", sub="CAE", big=True,
         quote=["No hay palabras que", "puedan retratarlo."],
         nodes=[("repetición", "repeticion", True)]),
    dict(x=360, y=276, href="/fragmentos/", glyph="⟡",
         kind="RASTRO · FRAGMENTO", title="Rastros", sub="2026-06-15",
         quote=["El alfabeto se gasta al repetirlo.", "Las palabras también."],
         nodes=[("desgaste", "desgaste", False),
                ("memoria", "memoria", True),
                ("archivo", "archivo", True)]),
    dict(x=704, y=284, href="/codigo/espiral-fibonacci/", glyph="◊",
         kind="CÓDIGO", title="Espiral de Fibonacci", sub="RECURRENCIA",
         quote=["a(n) = a(n−1) + a(n−2)"], mono=True,
         nodes=[("recurrencia", "recurrencia", False),
                ("diferencia", "diferencia", False)]),
    dict(x=1000, y=284, href="/dispositivos/espiral/", glyph="⎔",
         kind="DISPOSITIVO", title="Espiral", sub="V0.1.1",
         quote=["Siete canales, patrones de", "16 pasos, semilla", "reproducible."],
         nodes=[("automatización", "automatizacion", True)]),
    dict(x=896, y=560, href="/codigo/experimento-shannon/", glyph="◊",
         kind="CÓDIGO", title="Experimento de Shannon",
         sub="APROXIMACIONES AL LENGUAJE",
         quote=["Del caos a la estructura."],
         nodes=[("redundancia", "redundancia", True)]),
    dict(x=360, y=700, href="/codigo/hormiga-langton/", glyph="◊",
         kind="CÓDIGO", title="Hormiga de Langton", sub="DOS REGLAS",
         quote=["El caos que emerge del orden.", "El orden que emerge del caos."],
         nodes=[]),
]


def text(x, y, s, size=14, fill=INK, family=SERIF, italic=False, anchor=None,
         weight=None, spacing=None, cls=None):
    a = [f'x="{x}"', f'y="{y}"', f'font-size="{size}"', f'fill="{fill}"',
         f'font-family="{family}"']
    if italic:
        a.append('font-style="italic"')
    if anchor:
        a.append(f'text-anchor="{anchor}"')
    if weight:
        a.append(f'font-weight="{weight}"')
    if spacing:
        a.append(f'letter-spacing="{spacing}"')
    if cls:
        a.append(f'class="{cls}"')
    return f'<text {" ".join(a)}>{escape(s)}</text>'


def link(href, inner, label):
    return f'<a href="{href}" aria-label="{escape(label)}">{inner}</a>'


linked = link


def kind(y, glyph, label, x):
    return (
        f'<text x="{x}" y="{y}" font-size="11" fill="{MUTED}" '
        f'font-family="{MONO}" letter-spacing="0.1em">'
        f'<tspan font-family="{SERIF}" font-size="12">{glyph}</tspan>'
        f'<tspan dx="6">{escape(label)}</tspan></text>'
    )


def node_line(x, y, name, anchor, also):
    inner = (f'<text x="{x}" y="{y}" font-size="11.5" fill="{MUTED}" '
             f'font-family="{MONO}"><tspan fill="rgba(233,230,220,0.30)">— </tspan>'
             f'{escape(name)}')
    if also:
        inner += '<tspan font-size="8.5" dy="-4" fill="#7f8a88">02</tspan>'
    inner += '</text>'
    return f'<a class="node" href="/rizoma/nodos/#{anchor}" aria-label="nodo {escape(name)}">{inner}</a>'


def work_block(w):
    inner = [kind(w["y"], w["glyph"], w["kind"], w["x"])]
    size = 26 if w.get("big") else 18
    inner.append(text(w["x"], w["y"] + 24, w["title"], size, INK, SERIF, cls="work-title"))
    inner.append(text(w["x"], w["y"] + 43, w["sub"], 11, MUTED, MONO, spacing="0.08em"))
    qy = w["y"] + 68
    for line in w["quote"]:
        if w.get("mono"):
            inner.append(text(w["x"], qy, line, 12, DIM, MONO))
        else:
            inner.append(text(w["x"], qy, line, 15, DIM, SERIF, italic=True))
        qy += 21
    nodes = []
    ny = w["y"] + 68 + len(w["quote"]) * 21 + 12
    for name, anchor, also in w["nodes"]:
        nodes.append(node_line(w["x"], ny, name, anchor, also))
        ny += 17
    return ('<g class="work-block">'
            + link(w["href"], "".join(inner), w["title"])
            + "".join(nodes)
            + "</g>")


def build_svg(site: bool) -> str:
    out = [f'''<svg class="plate-svg" viewBox="0 0 1280 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="lamina01-title lamina01-desc">
  <title id="lamina01-title">Lámina 01 — ¿Qué se conserva cuando algo se repite?</title>
  <desc id="lamina01-desc">Campo de la repetición: siete obras del archivo con los nodos que cada una trabaja. Cinco nodos están compartidos con la segunda deriva. El corte marca la sección Ritual retirada; el blanco, lo que la deriva todavía no dice.</desc>
  <rect width="1280" height="1024" fill="#060708"/>
''']
    out.append(CONTOURS)

    # Header
    out.append(linked("/rizoma/", text(44, 56, "KNDL · RIZOMA / LÁMINA 01", 11, MUTED, MONO, spacing="0.12em"), "Rizoma"))
    out.append(text(1236, 56, "2026-11-10 · ABIERTA", 11, MUTED, MONO, anchor="end", spacing="0.12em"))
    out.append(linked(EXPLORACION_URL,
                      text(44, 110, "¿Qué se conserva cuando algo se", 40, INK, SERIF, weight="300") +
                      text(44, 148, "repite?", 40, INK, SERIF, weight="300"),
                      "Volver a la exploración"))
    out.append(text(44, 190, "CADA BLOQUE ES UNA OBRA. CADA PALABRA, UN NODO.", 12, MUTED, MONO, spacing="0.07em"))
    out.append(text(44, 208, "LA CERCANÍA ES UNA LECTURA, NO UNA RELACIÓN. · 02 = TAMBIÉN EN LA SEGUNDA DERIVA.", 12, MUTED, MONO, spacing="0.05em"))
    out.append(f'<line x1="44" y1="224" x2="1236" y2="224" stroke="{RULE}" stroke-width="1"/>')

    # Field
    out.append('<g id="plate-field">')
    for w in WORKS:
        out.append(work_block(w))

    # Cut
    out.append(text(360, 500, "CORTE", 11, MUTED, MONO, spacing="0.12em"))
    out.append(f'<line x1="360" y1="520" x2="544" y2="520" stroke="rgba(233,230,220,0.34)" stroke-width="1"/>')
    out.append(f'<line x1="676" y1="520" x2="872" y2="520" stroke="rgba(233,230,220,0.34)" stroke-width="1"/>')
    out.append(text(544, 552, "un ritual no es una costumbre:", 13, INK, SERIF, italic=True))
    out.append(text(544, 572, "es una máquina de producir presente", 13, INK, SERIF, italic=True))

    # Blank
    out.append('<rect x="40" y="700" width="268" height="172" fill="none" stroke="rgba(233,230,220,0.16)" stroke-width="1" stroke-dasharray="4 4"/>')
    out.append(text(60, 728, "SIN TRAZO", 11, MUTED, MONO, spacing="0.12em"))
    out.append(text(60, 776, "¿qué repite una memoria", 14, DIM, SERIF, italic=True))
    out.append(text(60, 796, "que no guarda nada?", 14, DIM, SERIF, italic=True))
    out.append('</g>')

    # Loupe (only on the site page; the exported SVG stays static)
    if site:
        out.append('''<defs>
  <clipPath id="loupe-clip"><rect x="-90" y="-90" width="180" height="180"/></clipPath>
</defs>
<g id="loupe" opacity="0" pointer-events="none" aria-hidden="true">
  <rect x="-90" y="-90" width="180" height="180" fill="#060708"/>
  <g clip-path="url(#loupe-clip)">
    <use id="loupe-use" href="#plate-field" transform="scale(2)"/>
  </g>
  <rect x="-90" y="-90" width="180" height="180" fill="none" stroke="#9fc6c9" stroke-width="1"/>
  <rect x="-84" y="-82" width="30" height="18" fill="rgba(6,7,8,0.78)"/>
  <text x="-76" y="-69" font-size="11" fill="#9fc6c9" font-family="'JetBrains Mono', monospace">2×</text>
</g>''')

    # Colophon
    out.append(f'<line x1="44" y1="984" x2="1236" y2="984" stroke="{RULE}" stroke-width="1"/>')
    out.append(text(44, 1008, "Estado del campo al 2026-11-10. No es un resumen.", 11, MUTED, MONO, spacing="0.05em"))
    out.append(text(560, 1008, "Lupa 2× en escritorio; pellizco en táctil.", 11, MUTED, MONO, spacing="0.05em"))
    out.append(text(1236, 1008, "La lámina se fecha y se rehace.", 11, MUTED, MONO, anchor="end", spacing="0.05em"))

    out.append('</svg>')
    return "".join(out)


def read_alt() -> str:
    items = []
    seen = set()
    for w in WORKS:
        items.append(f'<li><a href="{w["href"]}">{escape(w["title"])} — {escape(w["kind"].lower())}</a></li>')
        for name, anchor, _also in w["nodes"]:
            if name in seen:
                continue
            seen.add(name)
            items.append(f'<li><a href="/rizoma/nodos/#{anchor}">nodo: {escape(name)}</a></li>')
    return "\n      ".join(items)


CSS = """
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      background: #060708;
      color: #e9e6dc;
      font-family: 'Newsreader', Georgia, serif;
      -webkit-font-smoothing: antialiased;
    }
    main { width: min(100% - 64px, 1280px); margin: 0 auto; padding: 40px 0; }
    .diagram-container { width: 100%; }
    .plate-svg { width: 100%; height: auto; display: block; }
    .plate-svg #plate-field { cursor: zoom-in; }
    .plate-svg a { cursor: pointer; }
    .plate-svg .work-title { text-decoration: none; text-underline-offset: 3px; }
    .plate-svg .work-block:hover .work-title,
    .plate-svg .work-block:focus-within .work-title {
      text-decoration: underline;
      text-decoration-color: #9fc6c9;
    }
    .plate-svg .node:hover text,
    .plate-svg .node:focus-visible text { fill: #9fc6c9; }
    .plate-back {
      margin-bottom: 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .plate-back a { color: #9aa3a1; text-decoration: none; }
    .plate-back a:hover, .plate-back a:focus-visible { color: #9fc6c9; }
    .plate-hint {
      display: none;
      margin: 1rem 0 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #7f8a88;
    }
    .read-alt {
      position: absolute; width: 1px; height: 1px; overflow: hidden;
      clip-path: inset(50%); white-space: nowrap;
    }
    .read-alt:focus-within {
      position: static; width: auto; height: auto; overflow: visible;
      clip-path: none; white-space: normal;
      border: 1px solid rgba(233,230,220,0.14); padding: 1rem 1.25rem; margin-bottom: 1.5rem;
      font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; line-height: 1.8;
    }
    .read-alt h2 {
      margin: 0 0 .6rem; font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem; letter-spacing: .12em; text-transform: uppercase;
      color: #7f8a88; font-weight: 400;
    }
    .read-alt ul { margin: 0; padding: 0; list-style: none; }
    .read-alt a { text-decoration: none; border-bottom: 1px solid transparent; }
    .read-alt a:hover, .read-alt a:focus-visible { color: #9fc6c9; border-bottom-color: #9fc6c9; }
    @media (hover: none) {
      #loupe { display: none; }
      .plate-hint { display: block; }
      .plate-svg #plate-field { cursor: default; }
    }
"""

SCRIPT = """
<script>
(function () {
  "use strict";
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
  var svg = document.querySelector(".plate-svg");
  var field = document.getElementById("plate-field");
  var lens = document.getElementById("loupe");
  var use = document.getElementById("loupe-use");
  if (!svg || !field || !lens || !use) return;

  var pt = svg.createSVGPoint();
  var zoom = 2;

  function hide() { lens.setAttribute("opacity", "0"); }

  function move(event) {
    pt.x = event.clientX;
    pt.y = event.clientY;
    var p = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (p.y < 240 || p.y > 960) { hide(); return; }
    lens.setAttribute("transform", "translate(" + p.x.toFixed(2) + " " + p.y.toFixed(2) + ")");
    use.setAttribute("transform", "scale(" + zoom + ") translate(" + (-p.x).toFixed(2) + " " + (-p.y).toFixed(2) + ")");
    lens.setAttribute("opacity", "1");
  }

  svg.addEventListener("pointermove", move);
  svg.addEventListener("pointerleave", hide);
  window.addEventListener("scroll", hide, { passive: true });
})();
</script>
"""

HTML = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Lámina 01 — ¿Qué se conserva cuando algo se repite? · KNDL</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>{{CSS}}</style>
</head>
<body>
<main>
{{BACK}}  <nav class="read-alt" aria-label="Lectura lineal de la lámina">
    <h2>Lectura de la lámina</h2>
    <ul>
      {{READ_ALT}}
    </ul>
  </nav>

  <div class="diagram-container">
    {{SVG}}
  </div>
  <p class="plate-hint">Pellizcá para ampliar.</p>
</main>
{{SCRIPT}}
</body>
</html>
"""


def build(site: bool = False) -> str:
    back = f'  <nav class="plate-back"><a href="{EXPLORACION_URL}">← Exploración 01</a></nav>\n' if site else ""
    html = (HTML
            .replace("{{CSS}}", CSS)
            .replace("{{BACK}}", back)
            .replace("{{READ_ALT}}", read_alt())
            .replace("{{SVG}}", build_svg(site))
            .replace("{{SCRIPT}}", SCRIPT if site else ""))
    return html


if __name__ == "__main__":
    import sys

    site = "--site" in sys.argv
    html = build(site)
    if site:
        html = (
            "---\n"
            "layout: null\n"
            'title: "Lámina 01 — ¿Qué se conserva cuando algo se repite?"\n'
            "permalink: /rizoma/que-se-conserva-cuando-algo-se-repite/lamina/\n"
            "---\n"
        ) + html
    print(html, end="")
