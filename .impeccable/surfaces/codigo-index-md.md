---
version: 1
slug: "codigo-index-md"
primary_target: "codigo/index.md"
related_targets: ["_layouts/codigo.html","assets/css/style.css","assets/js/core/code-runner.js"]
---

# Código — banco de pruebas

## Scope and mode

- Primary surface: `/codigo/` (`codigo/index.md`), the index of the code archive. Mode: Read. The reader scans 17 modules, understands what each one is, and chooses one.
- Related surface: every `/codigo/:name/` detail (`_layouts/codigo.html`). Mode: Operate. The visitor reads the concept and runs or edits the snippet.
- Preserved: the full `code-runner.js` behavior (editable code, Cmd/Ctrl+Enter, inline inputs, fullscreen output, reset) and all 17 real entries.
- Out of scope: every other collection index and the shared home. The world stays fixed; this surface extends it.

## Direction contract

THESIS: Código is the archive's test bench. The index is a rack of modules; the detail is a working bench. It refuses the fake shell prompt, the rounded editor window, and the VS Code Dark+ palette.

OWN-WORLD: The chamber palette stays. Serif carries the title and the concept; mono carries address, language, and state. A vertical signal bus with one node per module; 1px rules; trace cyan for the runnable signal; amber only for an execution event; a custom syntax palette drawn from the same four inks. No cards, no shadows, no rounded corners.

STORY: The visitor sees 17 modules, distinguishes the 14 executable JavaScript pieces from the 3 read-only pieces, opens one, reads its concept, and runs or edits it. The output is the signal the module produces.

FIRST VIEWPORT: A masthead with Código, the real lede, 17 módulos · 14 ejecutables · 3 lenguajes, and a small ● ejecutable / ○ lectura legend. Then the rack: address, bus node, serif title and concept, language and state. No shell prompt, no cards. On detail: a ← Código back link, serif title, concept lead, mono language · date · state, then the bench.

FORM: Rack + bench; the bus is the signature move on the index, the runnable bench on the detail. seed: a4cf1939935810e0.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
