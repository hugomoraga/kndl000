#!/usr/bin/env python3
"""Genera la lámina SVG de una exploración de Rizoma.

El esqueleto (obras, nodos, tipos, compartidos, fechas) se genera desde la
exploración y las colecciones con --sync. La anotación editorial (posiciones,
citas, corte, blanco, colofón) vive en lamina-01.annotations.yml.

Uso:
    python3 docs/rizoma/build-lamina.py --sync
    python3 docs/rizoma/build-lamina.py --check
    python3 docs/rizoma/build-lamina.py --verify
    python3 docs/rizoma/build-lamina.py --write
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import date, datetime
from html import escape
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
PLATES = {
    "01": {
        "exploracion": ROOT / "content/collections/_exploraciones/que-se-conserva-cuando-algo-se-repite.md",
        "data": ROOT / "docs/rizoma/lamina-01.data.yml",
        "annotations": ROOT / "docs/rizoma/lamina-01.annotations.yml",
        "html": ROOT / "docs/rizoma/lamina-01-svg.html",
        "svg": ROOT / "docs/rizoma/lamina-01.svg",
        "site_svg": ROOT / "assets/media/rizoma/lamina-01.svg",
    },
    "02": {
        "exploracion": ROOT / "content/collections/_exploraciones/archivo.md",
        "data": ROOT / "docs/rizoma/lamina-02.data.yml",
        "annotations": ROOT / "docs/rizoma/lamina-02.annotations.yml",
        "html": ROOT / "docs/rizoma/lamina-02-svg.html",
        "svg": ROOT / "docs/rizoma/lamina-02.svg",
        "site_svg": ROOT / "assets/media/rizoma/lamina-02.svg",
    },
}
DEFAULT_PLATE = "01"
EXPLORACION = PLATES[DEFAULT_PLATE]["exploracion"]
DATA = PLATES[DEFAULT_PLATE]["data"]
ANNOTATIONS = PLATES[DEFAULT_PLATE]["annotations"]
DOCS_HTML = PLATES[DEFAULT_PLATE]["html"]
SVG_OUT = PLATES[DEFAULT_PLATE]["svg"]
SITE_SVG = PLATES[DEFAULT_PLATE]["site_svg"]

INK = "#e9e6dc"
DIM = "#9aa3a1"
MUTED = "#7f8a88"
TRACE = "#9fc6c9"
RULE = "rgba(233,230,220,0.14)"
SERIF = "'Newsreader', Georgia, serif"
MONO = "'JetBrains Mono', ui-monospace, monospace"

KINDS = {
    "/poemas/": ("_poems", "POEMA", "⁂"),
    "/codigo/": ("_codigos", "CÓDIGO", "◊"),
    "/dispositivos/": ("_dispositivos", "DISPOSITIVO", "⎔"),
    "/imaginario/": ("_images", "IMAGEN", "◉"),
    "/vestigios/": ("_vestigios", "VESTIGIO", "⏚"),
    "/melange-reports/": ("_melange_reports", "REPORTE", "🜏"),
}
SPECIAL = {
    "/fragmentos/": {
        "url": "/fragmentos/",
        "titulo": "Rastros",
        "tipo": "RASTRO",
        "glyph": "⟡",
    }
}
FRONTMATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.S)
NUM_WORDS = {
    1: "una", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
    6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
}


def read_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER.match(text)
    if not match:
        raise ValueError(f"Sin frontmatter: {path}")
    return yaml.safe_load(match.group(1)) or {}


def load_yaml(path: Path) -> dict:
    if not path.exists():
        raise ValueError(f"Falta {path}. Corré --sync o creá la anotación.")
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def date_str(value) -> str:
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return str(value or "")


def as_slug(text: str) -> str:
    raw = unicodedata.normalize("NFKD", str(text)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def num_word(value: int) -> str:
    return NUM_WORDS.get(value, str(value))


def collection_works() -> dict:
    works = {}
    for prefix, (folder, tipo, glyph) in KINDS.items():
        for path in sorted((ROOT / "content/collections" / folder).glob("*.md")):
            fm = read_frontmatter(path)
            if fm.get("published") is False:
                continue
            url = f"{prefix}{path.stem}/"
            item = {"url": url, "titulo": fm.get("title", ""), "tipo": tipo, "glyph": glyph}
            if fm.get("series"):
                item["series"] = fm["series"]
            if fm.get("version"):
                item["version"] = fm["version"]
            works[url] = item
    works.update(SPECIAL)
    return works


def all_explorations():
    for path in sorted((ROOT / "content/collections/_exploraciones").glob("*.md")):
        fm = read_frontmatter(path)
        if fm.get("published") is False:
            continue
        yield path, fm


def collect_data() -> dict:
    fm = read_frontmatter(EXPLORACION)
    url = f"/rizoma/{EXPLORACION.stem}/"
    works = collection_works()
    obras = []
    for item in fm.get("corpus") or []:
        work_url = item.get("url") if isinstance(item, dict) else item
        base = works.get(work_url)
        if not base:
            print(f"AVISO: obra sin resolver: {work_url}", file=sys.stderr)
            base = {"url": work_url, "titulo": work_url, "tipo": "ARCHIVO", "glyph": ""}
        obras.append(dict(base))

    explorations = list(all_explorations())
    nodes = []
    for title in fm.get("nodos") or []:
        shared = []
        for path, other in explorations:
            if path.resolve() == EXPLORACION.resolve():
                continue
            if title in (other.get("nodos") or []):
                shared.append(other.get("title", path.stem))
        nodes.append({
            "nombre": title,
            "ancla": as_slug(title),
            "compartido": bool(shared),
            "compartido_en": shared,
        })

    return {
        "exploracion": {
            "url": url,
            "titulo": fm.get("title", ""),
            "pregunta": fm.get("question", ""),
            "orden": str(fm.get("order", "")),
            "estado": fm.get("status", "abierta"),
            "actualizado": date_str(fm.get("updated") or fm.get("date")),
        },
        "obras": obras,
        "nodos": nodes,
    }


def sync_data() -> None:
    data = collect_data()
    DATA.write_text(
        yaml.safe_dump(data, sort_keys=False, allow_unicode=True, width=1000),
        encoding="utf-8",
    )
    obras = data["obras"]
    nodes = data["nodos"]
    print(f"Esqueleto actualizado: {DATA}")
    print(f"  {len(obras)} obras · {len(nodes)} nodos · {sum(1 for n in nodes if n['compartido'])} compartidos")


def data_problems(expected: dict, actual: dict) -> list:
    problems = []
    if expected.get("exploracion") != actual.get("exploracion"):
        problems.append("El bloque 'exploracion' cambió.")
    exp_works = {w["url"]: w for w in expected.get("obras") or []}
    act_works = {w["url"]: w for w in actual.get("obras") or []}
    for url in sorted(set(exp_works) - set(act_works)):
        problems.append(f"Obra nueva sin sincronizar: {url}")
    for url in sorted(set(act_works) - set(exp_works)):
        problems.append(f"Obra retirada del corpus: {url}")
    for url in sorted(set(exp_works) & set(act_works)):
        if exp_works[url] != act_works[url]:
            problems.append(f"La obra cambió en el corpus: {url}")
    exp_nodes = {n["nombre"]: n for n in expected.get("nodos") or []}
    act_nodes = {n["nombre"]: n for n in actual.get("nodos") or []}
    for name in sorted(set(exp_nodes) - set(act_nodes)):
        problems.append(f"Nodo nuevo sin sincronizar: {name}")
    for name in sorted(set(act_nodes) - set(exp_nodes)):
        problems.append(f"Nodo retirado de la exploración: {name}")
    for name in sorted(set(exp_nodes) & set(act_nodes)):
        if exp_nodes[name] != act_nodes[name]:
            problems.append(f"El nodo cambió: {name}")
    return problems


def date_problems(data: dict, ann: dict) -> list:
    fecha = date_str(ann.get("fecha_lamina"))
    updated = date_str(data["exploracion"].get("actualizado"))
    try:
        if date.fromisoformat(updated) > date.fromisoformat(fecha):
            return [
                f"La lámina está fechada {fecha} y la exploración se actualizó {updated}. "
                "Rehacé la lámina y actualizá fecha_lamina en la anotación."
            ]
    except ValueError:
        return [f"Fechas inválidas: lámina={fecha!r}, exploración={updated!r}"]
    return []


def verify() -> None:
    expected = collect_data()
    actual = load_yaml(DATA)
    problems = data_problems(expected, actual)
    ann = load_yaml(ANNOTATIONS)
    try:
        works = merge(expected, ann)
    except ValueError as error:
        problems.append(str(error))
        works = []
    problems.extend(date_problems(expected, ann))
    if problems:
        print("La lámina está desincronizada:", file=sys.stderr)
        for problem in problems:
            print("  - " + problem, file=sys.stderr)
        print("Corré --sync, anotá lo que falte y después --write.", file=sys.stderr)
        sys.exit(1)
    print(f"Lámina verificada · {date_str(ann.get('fecha_lamina'))} · {len(works)} obras · "
          f"{len(expected.get('nodos') or [])} nodos")


def merge(data: dict, ann: dict) -> list:
    works_by_url = {w["url"]: w for w in data.get("obras") or []}
    nodes_by_name = {n["nombre"]: n for n in data.get("nodos") or []}
    seen = set()
    merged = []
    for item in ann.get("obras") or []:
        url = item.get("url")
        base = works_by_url.get(url)
        if not base:
            raise ValueError(f"La anotación referencia una obra que no está en el esqueleto: {url}")
        if url in seen:
            raise ValueError(f"Obra duplicada en la anotación: {url}")
        nodes = []
        for name in item.get("nodos") or []:
            node = nodes_by_name.get(name)
            if not node:
                raise ValueError(f"Nodo anotado que no está en la exploración: {name}")
            nodes.append(node)
        if "x" not in item or "y" not in item:
            raise ValueError(f"Falta posición para {url}")
        merged.append({
            "url": url,
            "href": url,
            "glyph": base.get("glyph", ""),
            "tipo": item.get("tipo") or base.get("tipo", "ARCHIVO"),
            "titulo": item.get("titulo") or base.get("titulo", url),
            "sub": item.get("sub", ""),
            "cita": item.get("cita") or [],
            "mono": bool(item.get("mono")),
            "big": bool(item.get("big")),
            "x": int(item["x"]),
            "y": int(item["y"]),
            "nodos": nodes,
        })
        seen.add(url)

    missing = [w["url"] for w in data.get("obras") or [] if w["url"] not in seen]
    if missing:
        raise ValueError("Hay obras del corpus sin anotar: " + ", ".join(missing))
    used = {n["nombre"] for w in merged for n in w["nodos"]}
    unused = [n["nombre"] for n in data.get("nodos") or [] if n["nombre"] not in used]
    if unused:
        raise ValueError("Hay nodos sin ubicar: " + ", ".join(unused))
    return merged


def text(x, y, s, size=14, fill=INK, family=SERIF, italic=False, anchor=None,
         weight=None, spacing=None, cls=None):
    attrs = [f'x="{x}"', f'y="{y}"', f'font-size="{size}"', f'fill="{fill}"',
             f'font-family="{family}"']
    if italic:
        attrs.append('font-style="italic"')
    if anchor:
        attrs.append(f'text-anchor="{anchor}"')
    if weight:
        attrs.append(f'font-weight="{weight}"')
    if spacing:
        attrs.append(f'letter-spacing="{spacing}"')
    if cls:
        attrs.append(f'class="{cls}"')
    return f'<text {" ".join(attrs)}>{escape(s)}</text>'


def link(href, inner, label):
    return f'<a href="{href}" aria-label="{escape(label)}">{inner}</a>'


def kind(y, glyph, label, x):
    return (
        f'<text x="{x}" y="{y}" font-size="11" fill="{MUTED}" '
        f'font-family="{MONO}" letter-spacing="0.1em">'
        f'<tspan font-family="{SERIF}" font-size="12">{glyph}</tspan>'
        f'<tspan dx="6">{escape(label)}</tspan></text>'
    )


def node_line(x, y, node, marker):
    name = node["nombre"].lower()
    inner = (f'<text x="{x}" y="{y}" font-size="11.5" fill="{MUTED}" '
             f'font-family="{MONO}"><tspan fill="rgba(233,230,220,0.30)">— </tspan>'
             f'{escape(name)}')
    if node["compartido"]:
        inner += f'<tspan font-size="8.5" dy="-4" fill="#7f8a88">{escape(marker)}</tspan>'
    inner += '</text>'
    return f'<a class="node" href="/rizoma/nodos/#{node["ancla"]}" aria-label="nodo {escape(name)}">{inner}</a>'


def work_block(work, marker):
    inner = [kind(work["y"], work["glyph"], work["tipo"], work["x"])]
    size = 26 if work["big"] else 18
    inner.append(text(work["x"], work["y"] + 24, work["titulo"], size, INK, SERIF, cls="work-title"))
    if work["sub"]:
        inner.append(text(work["x"], work["y"] + 43, work["sub"], 11, MUTED, MONO, spacing="0.08em"))
    qy = work["y"] + 68
    for line in work["cita"]:
        if work["mono"]:
            inner.append(text(work["x"], qy, line, 12, DIM, MONO))
        else:
            inner.append(text(work["x"], qy, line, 15, DIM, SERIF, italic=True))
        qy += 21
    nodes = []
    ny = work["y"] + 68 + len(work["cita"]) * 21 + 12
    for node in work["nodos"]:
        nodes.append(node_line(work["x"], ny, node, marker))
        ny += 17
    return ('<g class="work-block">'
            + link(work["href"], "".join(inner), work["titulo"])
            + "".join(nodes)
            + "</g>")


def build_svg(data: dict, ann: dict, works: list) -> str:
    orden = data["exploracion"]["orden"]
    titulo = data["exploracion"]["titulo"]
    fecha = date_str(ann.get("fecha_lamina"))
    estado = data["exploracion"].get("estado", "abierta")
    compartidos = sum(1 for n in data.get("nodos") or [] if n.get("compartido"))
    desc = ann["descripcion"].format(
        campo=ann.get("campo", "Campo"),
        obras=num_word(len(works)),
        nodos=num_word(len(data.get("nodos") or [])),
        compartidos=num_word(compartidos),
        fecha=fecha,
        orden=orden,
    )
    out = [f'''<svg class="plate-svg" viewBox="0 0 1280 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="lamina{orden}-title lamina{orden}-desc">
  <title id="lamina{orden}-title">Lámina {orden} — {escape(titulo)}</title>
  <desc id="lamina{orden}-desc">{escape(desc)}</desc>
  <rect width="1280" height="1024" fill="#060708"/>
''']
    out.append(CONTOURS)
    out.append(link("/rizoma/", text(44, 56, f"KNDL · RIZOMA / LÁMINA {orden}", 11, MUTED, MONO, spacing="0.12em"), "Rizoma"))
    out.append(text(1236, 56, f"{fecha} · {estado.upper()}", 11, MUTED, MONO, anchor="end", spacing="0.12em"))
    lines = ann.get("titulo_lineas") or [titulo]
    title_html = "".join(text(44, 110 + i * 38, line, 40, INK, SERIF, weight="300") for i, line in enumerate(lines))
    out.append(link(data["exploracion"]["url"], title_html, "Volver a la exploración"))
    for i, line in enumerate(ann.get("clave") or []):
        out.append(text(44, 190 + i * 18, line, 12, MUTED, MONO, spacing="0.05em"))
    out.append(f'<line x1="44" y1="224" x2="1236" y2="224" stroke="{RULE}" stroke-width="1"/>')

    out.append('<g id="plate-field">')
    marker = str(ann.get("marca_compartido", "02"))
    for work in works:
        out.append(work_block(work, marker))

    cut = ann["corte"]
    out.append(text(cut["x"], cut["y"], cut["etiqueta"], 11, MUTED, MONO, spacing="0.12em"))
    out.append(f'<line x1="{cut["x"]}" y1="{cut["regla_y"]}" x2="{cut["hueco_ini"]}" y2="{cut["regla_y"]}" stroke="rgba(233,230,220,0.34)" stroke-width="1"/>')
    out.append(f'<line x1="{cut["hueco_fin"]}" y1="{cut["regla_y"]}" x2="{cut["fin"]}" y2="{cut["regla_y"]}" stroke="rgba(233,230,220,0.34)" stroke-width="1"/>')
    for i, line in enumerate(cut.get("cita") or []):
        out.append(text(cut["cita_x"], cut["cita_y"] + i * 20, line, 13, INK, SERIF, italic=True))

    blank = ann["blanco"]
    out.append(f'<rect x="{blank["x"]}" y="{blank["y"]}" width="{blank["ancho"]}" height="{blank["alto"]}" fill="none" stroke="rgba(233,230,220,0.16)" stroke-width="1" stroke-dasharray="4 4"/>')
    out.append(text(blank["x"] + 20, blank["y"] + 28, blank["etiqueta"], 11, MUTED, MONO, spacing="0.12em"))
    for i, line in enumerate(blank.get("pregunta") or []):
        out.append(text(blank["x"] + 20, blank["y"] + 76 + i * 20, line, 14, DIM, SERIF, italic=True))
    out.append('</g>')

    colofon = ann["colofon"]
    out.append(f'<line x1="44" y1="984" x2="1236" y2="984" stroke="{RULE}" stroke-width="1"/>')
    out.append(text(44, 1008, colofon["izquierda"].format(fecha=fecha, orden=orden), 11, MUTED, MONO, spacing="0.05em"))
    out.append(text(560, 1008, colofon["centro"].format(fecha=fecha, orden=orden), 11, MUTED, MONO, spacing="0.05em"))
    out.append(text(1236, 1008, colofon["derecha"].format(fecha=fecha, orden=orden), 11, MUTED, MONO, anchor="end", spacing="0.05em"))
    out.append('</svg>')
    return "".join(out)


def read_alt(works: list) -> str:
    items = []
    seen = set()
    for work in works:
        items.append(f'<li><a href="{work["href"]}">{escape(work["titulo"])} — {escape(work["tipo"].lower())}</a></li>')
        for node in work["nodos"]:
            if node["nombre"] in seen:
                continue
            seen.add(node["nombre"])
            items.append(f'<li><a href="/rizoma/nodos/#{node["ancla"]}">nodo: {escape(node["nombre"].lower())}</a></li>')
    return items


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
    .plate-shell { position: relative; }
    .diagram-container { width: 100%; }
    .plate-svg { width: 100%; height: auto; display: block; }
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
    .plate-tools { display: none; }
    .plate-loupe { display: none; }
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
      .plate-tools {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1.25rem;
      }
      .plate-toggle {
        min-height: 44px;
        min-width: 72px;
        padding: 0 .9rem;
        border: 1px solid rgba(233,230,220,0.22);
        background: transparent;
        color: #e9e6dc;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        letter-spacing: .12em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .plate-toggle[aria-pressed="true"] { color: #9fc6c9; border-color: #9fc6c9; }
      .plate-hint {
        margin: 0;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        letter-spacing: .04em;
        line-height: 1.5;
        color: #7f8a88;
      }
      .plate-loupe {
        display: none;
        position: absolute;
        width: 180px;
        height: 180px;
        overflow: hidden;
        border: 1px solid #9fc6c9;
        background: #060708;
        pointer-events: none;
        z-index: 3;
      }
      .plate-loupe.is-on { display: block; }
      .plate-loupe svg { width: 100%; height: 100%; display: block; }
      .plate-shell.is-lens .plate-svg a { pointer-events: none; }
      .plate-shell.is-lens .plate-svg #plate-field { touch-action: none; }
    }
"""

SCRIPT = """
<script>
(function () {
  "use strict";
  if (!window.matchMedia || !window.matchMedia("(hover: none)").matches) return;
  var shell = document.querySelector(".plate-shell");
  if (!shell) return;
  var svg = shell.querySelector(".plate-svg");
  var field = document.getElementById("plate-field");
  var toggle = shell.querySelector(".plate-toggle");
  var lens = shell.querySelector(".plate-loupe");
  var lensSvg = lens && lens.querySelector(".plate-loupe__svg");
  var content = lens && lens.querySelector(".plate-loupe__content");
  if (!svg || !field || !toggle || !lens || !lensSvg || !content) return;

  var clone = field.cloneNode(true);
  clone.removeAttribute("id");
  clone.querySelectorAll("a").forEach(function (a) { a.setAttribute("tabindex", "-1"); });
  content.appendChild(clone);

  var vb = 148;
  var active = false;
  var pt = svg.createSVGPoint();

  function point(event) {
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function focus(p) {
    lensSvg.setAttribute("viewBox", (p.x - vb / 2) + " " + (p.y - vb / 2) + " " + vb + " " + vb);
  }

  function place(event) {
    var shellRect = shell.getBoundingClientRect();
    var svgRect = svg.getBoundingClientRect();
    var minL = svgRect.left - shellRect.left;
    var minT = svgRect.top - shellRect.top;
    var maxL = minL + svgRect.width - 180;
    var maxT = minT + svgRect.height - 180;
    var left = event.clientX - shellRect.left - 90;
    var top = event.clientY - shellRect.top - 200;
    if (top < minT) top = event.clientY - shellRect.top + 20;
    left = Math.max(minL, Math.min(left, maxL));
    top = Math.max(minT, Math.min(top, maxT));
    lens.style.left = left + "px";
    lens.style.top = top + "px";
  }

  function move(event) {
    if (!active) return;
    var p = point(event);
    focus(p);
    place(event);
  }

  function setActive(on) {
    active = on;
    shell.classList.toggle("is-lens", on);
    lens.classList.toggle("is-on", on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.textContent = on ? "Cerrar" : "Lupa";
    if (on) {
      var rect = svg.getBoundingClientRect();
      focus({ x: 640, y: 620 });
      place({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height * 0.6 });
    }
  }

  toggle.addEventListener("click", function () { setActive(!active); });
  svg.addEventListener("pointerdown", move);
  svg.addEventListener("pointermove", move);
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

  <div class="plate-shell">
    <div class="diagram-container">
      {{SVG}}
    </div>
    {{TOOLS}}
  </div>
</main>
{{SCRIPT}}
</body>
</html>
"""



def build_html(site: bool, data: dict, ann: dict, works: list) -> str:
    orden = data["exploracion"]["orden"]
    titulo = data["exploracion"]["titulo"]
    url = data["exploracion"]["url"]
    back = f'  <nav class="plate-back"><a href="{url}">← Exploración {orden}</a></nav>\n' if site else ""
    tools = """
    <div class="plate-tools">
      <button class="plate-toggle" type="button" aria-pressed="false">Lupa</button>
      <p class="plate-hint">Arrastrá sobre el campo para mover la lupa.</p>
    </div>
    <div class="plate-loupe" aria-hidden="true">
      <svg class="plate-loupe__svg" viewBox="0 0 148 148" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g class="plate-loupe__content"></g>
      </svg>
    </div>
""" if site else ""
    html = re.sub(r"<title>.*?</title>", f"<title>Lámina {orden} — {escape(titulo)} · KNDL</title>", HTML, count=1, flags=re.S)
    return (html
            .replace("{{CSS}}", CSS)
            .replace("{{BACK}}", back)
            .replace("{{READ_ALT}}", "\n      ".join(read_alt(works)))
            .replace("{{SVG}}", build_svg(data, ann, works))
            .replace("{{TOOLS}}", tools)
            .replace("{{SCRIPT}}", SCRIPT if site else ""))


def frontmatter(data: dict) -> str:
    orden = data["exploracion"]["orden"]
    titulo = data["exploracion"]["titulo"]
    url = data["exploracion"]["url"]
    title = f"Lámina {orden} — {titulo}"
    return (
        "---\n"
        "layout: null\n"
        f"title: {json.dumps(title, ensure_ascii=False)}\n"
        f"permalink: {url}lamina/\n"
        "---\n"
    )


def extract_svg(html: str) -> str:
    start = html.index('<svg class="plate-svg"')
    end = html.index("</svg>", start) + len("</svg>")
    svg = html[start:end]
    fonts = (
        "<style>@import url('https://fonts.googleapis.com/css2?"
        "family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800"
        "&amp;family=Lato:ital,wght@0,300;0,400;0,700;1,400"
        "&amp;family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,400"
        "&amp;display=swap');</style>"
    )
    svg = svg.replace("</desc>", "</desc>\n  " + fonts, 1)
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + svg + "\n"


def check(data: dict, ann: dict, works: list) -> None:
    errors = date_problems(data, ann)
    if errors:
        for error in errors:
            print("ERROR: " + error, file=sys.stderr)
        sys.exit(1)
    compartidos = sum(1 for n in data.get("nodos") or [] if n.get("compartido"))
    print(f"Lámina OK · {date_str(ann.get('fecha_lamina'))} · {len(works)} obras · "
          f"{len(data.get('nodos') or [])} nodos · {compartidos} compartidos")


def write_outputs(data: dict, ann: dict, works: list) -> None:
    docs = build_html(False, data, ann, works)
    DOCS_HTML.write_text(docs, encoding="utf-8")

    site = frontmatter(data) + build_html(True, data, ann, works)
    site_path = ROOT / data["exploracion"]["url"].strip("/") / "lamina/index.html"
    site_path.parent.mkdir(parents=True, exist_ok=True)
    site_path.write_text(site, encoding="utf-8")

    svg = extract_svg(docs)
    SVG_OUT.write_text(svg, encoding="utf-8")
    SITE_SVG.parent.mkdir(parents=True, exist_ok=True)
    SITE_SVG.write_text(svg, encoding="utf-8")

    print(f"HTML de la lámina: {DOCS_HTML}")
    print(f"Página del sitio: {site_path}")
    print(f"SVG exportado: {SVG_OUT}")
    print(f"SVG del sitio: {SITE_SVG}")


def main() -> None:
    args = sys.argv[1:]
    plate = DEFAULT_PLATE
    if "--plate" in args:
        index = args.index("--plate")
        if index + 1 >= len(args):
            print("ERROR: --plate requiere 01 o 02", file=sys.stderr)
            sys.exit(1)
        plate = args[index + 1]
    if plate not in PLATES:
        print(f"ERROR: lámina desconocida: {plate}", file=sys.stderr)
        sys.exit(1)
    config = PLATES[plate]
    globals().update({
        "EXPLORACION": config["exploracion"],
        "DATA": config["data"],
        "ANNOTATIONS": config["annotations"],
        "DOCS_HTML": config["html"],
        "SVG_OUT": config["svg"],
        "SITE_SVG": config["site_svg"],
    })

    if "--sync" in args:
        sync_data()
        return
    if "--verify" in args:
        try:
            verify()
        except ValueError as error:
            print("ERROR: " + str(error), file=sys.stderr)
            sys.exit(1)
        return
    try:
        data = load_yaml(DATA)
        ann = load_yaml(ANNOTATIONS)
        works = merge(data, ann)
    except ValueError as error:
        print("ERROR: " + str(error), file=sys.stderr)
        sys.exit(1)

    if "--check" in args:
        check(data, ann, works)
        return

    if "--write" in args:
        write_outputs(data, ann, works)
        return

    site = "--site" in args
    html = build_html(site, data, ann, works)
    if site:
        html = frontmatter(data) + html
    print(html, end="")


if __name__ == "__main__":
    main()
