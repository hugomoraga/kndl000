#!/usr/bin/env python3
"""Genera la lámina SVG de una exploración de Rizoma.

Adaptación mínima de diagram-design (cathrynlavery/diagram-design) para KNDL:
toma su contrato de SVG accesible, su grilla de 4 px y su validador, pero
rechaza sus tipos de diagrama, sus cajas de nodo y sus radios. La lámina es un
campo de proximidad, no un diagrama técnico.

Uso:
    python3 docs/rizoma/build-lamina.py > docs/rizoma/lamina-01.svg.html
"""

from __future__ import annotations

from html import escape

W, H = 1280, 1024
FIELD_TOP, FIELD_H = 240, 720

INK = "#e9e6dc"
DIM = "#9aa3a1"
MUTED = "#7f8a88"
TRACE = "#9fc6c9"
RULE = "rgba(233,230,220,0.14)"
SOFT = "rgba(233,230,220,0.055)"
SERIF = "'Newsreader', Georgia, serif"
MONO = "'JetBrains Mono', ui-monospace, monospace"
SANS = "'Lato', system-ui, sans-serif"
EXPLORACION_URL = "/rizoma/que-se-conserva-cuando-algo-se-repite/"


def text(x, y, s, size=14, fill=INK, family=SERIF, italic=False, anchor=None,
         weight=None, spacing=None, extra=""):
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
    if extra:
        a.append(extra)
    return f'<text {" ".join(a)}>{escape(s)}</text>'


def linked(href, inner, label):
    return f'<a href="{href}" aria-label="{escape(label)}">{inner}</a>'


def kind(y, glyph, label, x):
    return (
        f'<text x="{x}" y="{y}" font-size="9.5" fill="{MUTED}" '
        f'font-family="{MONO}" letter-spacing="0.1em">'
        f'<tspan font-family="{SERIF}" font-size="11">{glyph}</tspan>'
        f'<tspan dx="6">{escape(label)}</tspan></text>'
    )


WORKS = [
    dict(x=40, y=276, href="/poemas/persistencias-del-algo/", glyph="⁂",
         kind="POEMA · SERIE", title="Persistir en el algo",
         sub="UNA CONSTANTE EN MI SER",
         quote=["Camino con las palabras", "o me enredaré en ellas."]),
    dict(x=40, y=484, href="/poemas/cae/", glyph="⁂",
         kind="POEMA", title="∞", sub="CAE", big=True,
         quote=["No hay palabras que", "puedan retratarlo."]),
    dict(x=360, y=276, href="/fragmentos/", glyph="⟡",
         kind="RASTRO · FRAGMENTO", title="Rastros", sub="2026-06-15",
         quote=["El alfabeto se gasta al repetirlo.", "Las palabras también."]),
    dict(x=704, y=284, href="/codigo/espiral-fibonacci/", glyph="◊",
         kind="CÓDIGO", title="Espiral de Fibonacci", sub="RECURRENCIA",
         quote=["a(n) = a(n−1) + a(n−2)"], mono=True),
    dict(x=1000, y=284, href="/dispositivos/espiral/", glyph="⎔",
         kind="DISPOSITIVO", title="Espiral", sub="V0.1.1",
         quote=["Siete canales, patrones de", "16 pasos, semilla", "reproducible."]),
    dict(x=896, y=528, href="/codigo/experimento-shannon/", glyph="◊",
         kind="CÓDIGO", title="Experimento de Shannon",
         sub="APROXIMACIONES AL LENGUAJE",
         quote=["Del caos a la estructura."]),
    dict(x=588, y=716, href="/codigo/hormiga-langton/", glyph="◊",
         kind="CÓDIGO", title="Hormiga de Langton", sub="DOS REGLAS",
         quote=["El caos que emerge del orden.", "El orden que emerge del caos."]),
]

NODES = [
    dict(x=52, y=444, name="persistencia", href="/rizoma/nodos/#persistencia"),
    dict(x=52, y=620, name="repetición", href="/rizoma/nodos/#repeticion", also=True),
    dict(x=360, y=412, name="desgaste", href="/rizoma/nodos/#desgaste"),
    dict(x=616, y=440, name="diferencia", href="/rizoma/nodos/#diferencia"),
    dict(x=704, y=412, name="recurrencia", href="/rizoma/nodos/#recurrencia"),
    dict(x=1000, y=476, name="automatización", href="/rizoma/nodos/#automatizacion", also=True),
    dict(x=780, y=464, name="memoria", href="/rizoma/nodos/#memoria", also=True),
    dict(x=476, y=672, name="archivo", href="/rizoma/nodos/#archivo", also=True),
    dict(x=924, y=676, name="redundancia", href="/rizoma/nodos/#redundancia", also=True),
]

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


def build(site: bool = False) -> str:
    out: list[str] = []
    back_nav = (
        f'  <nav class="plate-back"><a href="{EXPLORACION_URL}">← Exploración 01</a></nav>\n'
        if site else ""
    )
    out.append(f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Lámina 01 — ¿Qué se conserva cuando algo se repite? · KNDL</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    background: #060708;
    color: #e9e6dc;
    font-family: 'Newsreader', Georgia, serif;
    -webkit-font-smoothing: antialiased;
  }}
  main {{ width: min(100% - 64px, 1280px); margin: 0 auto; padding: 40px 0; }}
  .diagram-container {{ width: 100%; overflow-x: auto; }}
  svg {{ width: 100%; min-width: 1280px; display: block; }}
  a {{ color: inherit; }}
  .plate-back {{
    margin-bottom: 1.25rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: .68rem;
    letter-spacing: .08em;
    text-transform: uppercase;
  }}
  .plate-back a {{ color: #9aa3a1; text-decoration: none; }}
  .plate-back a:hover, .plate-back a:focus-visible {{ color: #9fc6c9; }}
  .read-alt {{
    position: absolute; width: 1px; height: 1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap;
  }}
  .read-alt:focus-within {{
    position: static; width: auto; height: auto; overflow: visible;
    clip-path: none; white-space: normal;
    border: 1px solid rgba(233,230,220,0.14); padding: 1rem 1.25rem; margin-bottom: 1.5rem;
    font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; line-height: 1.8;
  }}
  .read-alt h2 {{
    margin: 0 0 .6rem; font-family: 'JetBrains Mono', monospace;
    font-size: .66rem; letter-spacing: .12em; text-transform: uppercase;
    color: #7f8a88; font-weight: 400;
  }}
  .read-alt ul {{ margin: 0; padding: 0; list-style: none; }}
  .read-alt a {{ text-decoration: none; border-bottom: 1px solid transparent; }}
  .read-alt a:hover, .read-alt a:focus-visible {{ color: #9fc6c9; border-bottom-color: #9fc6c9; }}
  @media print {{
    .diagram-container {{ overflow-x: visible; }}
    svg {{ min-width: 0; }}
  }}
</style>
</head>
<body>
<main>
{back_nav}  <nav class="read-alt" aria-label="Lectura lineal de la lámina">
    <h2>Lectura de la lámina</h2>
    <ul>
''')
    for w in WORKS:
        out.append(f'      <li><a href="{w["href"]}">{escape(w["title"])} — {escape(w["kind"].lower())}</a></li>\n')
    for n in NODES:
        out.append(f'      <li><a href="{n["href"]}">nodo: {escape(n["name"])}</a></li>\n')
    out.append('''    </ul>
  </nav>

  <div class="diagram-container">
    <svg viewBox="0 0 1280 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="lamina01-title lamina01-desc">
      <title id="lamina01-title">Lámina 01 — ¿Qué se conserva cuando algo se repite?</title>
      <desc id="lamina01-desc">Campo de la repetición: siete obras del archivo, nueve nodos —cinco compartidos con la segunda deriva—, el corte de la sección Ritual y un blanco sin trazo.</desc>
      <rect width="1280" height="1024" fill="#060708"/>
''')
    out.append(CONTOURS)

    # Header
    out.append(linked("/rizoma/", text(44, 56, "KNDL · RIZOMA / LÁMINA 01", 10.5, MUTED, MONO, spacing="0.12em"), "Rizoma"))
    out.append(text(1236, 56, "2026-11-10 · ABIERTA", 10.5, MUTED, MONO, anchor="end", spacing="0.12em"))
    out.append(linked(EXPLORACION_URL,
                      text(44, 112, "¿Qué se conserva cuando algo se", 44, INK, SERIF, weight="300") +
                      text(44, 156, "repite?", 44, INK, SERIF, weight="300"),
                      "Volver a la exploración"))
    out.append(text(44, 196, "ESTADO DEL CAMPO AL 2026-11-10. NO ES UN RESUMEN.", 11, MUTED, MONO, spacing="0.08em"))
    out.append(f'<line x1="44" y1="224" x2="1236" y2="224" stroke="{RULE}" stroke-width="1"/>')

    # Works
    for w in WORKS:
        inner = [kind(w["y"], w["glyph"], w["kind"], w["x"])]
        size = 24 if w.get("big") else 17
        inner.append(text(w["x"], w["y"] + 24, w["title"], size, INK, SERIF))
        inner.append(text(w["x"], w["y"] + 42, w["sub"], 9.5, MUTED, MONO, spacing="0.08em"))
        qy = w["y"] + 66
        for line in w["quote"]:
            if w.get("mono"):
                inner.append(text(w["x"], qy, line, 11.5, DIM, MONO))
            else:
                inner.append(text(w["x"], qy, line, 14, DIM, SERIF, italic=True))
            qy += 20
        out.append(linked(w["href"], "".join(inner), w["title"]))

    # Nodes
    for n in NODES:
        inner = (f'<text x="{n["x"]}" y="{n["y"]}" font-size="10.5" fill="{MUTED}" '
                 f'font-family="{MONO}"><tspan fill="rgba(233,230,220,0.30)">— </tspan>'
                 f'{escape(n["name"])}')
        if n.get("also"):
            inner += '<tspan font-size="8" dy="-4" fill="#7f8a88">02</tspan>'
        inner += '</text>'
        out.append(linked(n["href"], inner, f'nodo {n["name"]}'))

    # Cut
    out.append(text(360, 540, "CORTE", 10, MUTED, MONO, spacing="0.12em"))
    out.append(f'<line x1="360" y1="560" x2="544" y2="560" stroke="rgba(233,230,220,0.34)" stroke-width="1"/>')
    out.append(f'<line x1="676" y1="560" x2="872" y2="560" stroke="rgba(233,230,220,0.34)" stroke-width="1"/>')
    out.append(text(544, 592, "un ritual no es una costumbre:", 15, INK, SERIF, italic=True))
    out.append(text(544, 612, "es una máquina de producir presente", 15, INK, SERIF, italic=True))

    # Blank
    out.append('<rect x="40" y="672" width="268" height="172" fill="none" stroke="rgba(233,230,220,0.16)" stroke-width="1" stroke-dasharray="4 4"/>')
    out.append(text(60, 700, "SIN TRAZO", 10, MUTED, MONO, spacing="0.12em"))
    out.append(text(60, 748, "¿qué repite una memoria", 14, DIM, SERIF, italic=True))
    out.append(text(60, 768, "que no guarda nada?", 14, DIM, SERIF, italic=True))

    # Shift
    out.append(f'<line x1="924" y1="788" x2="960" y2="788" stroke="{RULE}" stroke-width="1"/>')
    out.append(text(924, 812, "La pregunta no se movió. Se movió", 13, DIM, SERIF, italic=True))
    out.append(text(924, 832, "lo que podía responderla.", 13, DIM, SERIF, italic=True))

    # Colophon
    out.append(f'<line x1="44" y1="984" x2="1236" y2="984" stroke="{RULE}" stroke-width="1"/>')
    out.append(text(44, 1008, "Proximidad, no causalidad. La lectura es de quien cartografía.", 9.5, MUTED, MONO, spacing="0.05em"))
    out.append(text(520, 1008, "02 = también en la segunda deriva.", 9.5, MUTED, MONO, spacing="0.05em"))
    out.append(text(1236, 1008, "La lámina se fecha y se rehace.", 9.5, MUTED, MONO, anchor="end", spacing="0.05em"))

    out.append('''    </svg>
  </div>
</main>
</body>
</html>
''')
    return "".join(out)


if __name__ == "__main__":
    import sys

    html = build("--site" in sys.argv)
    if "--site" in sys.argv:
        html = (
            "---\n"
            "layout: null\n"
            'title: "Lámina 01 — ¿Qué se conserva cuando algo se repite?"\n'
            "permalink: /rizoma/que-se-conserva-cuando-algo-se-repite/lamina/\n"
            "---\n"
        ) + html
    print(html, end="")
