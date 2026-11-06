## 1. Shared reading frame

- [x] 1.1 Extract the shared reading classes and tokens used by the reading surfaces.
- [x] 1.2 Apply the frame to the default layout without changing content or routes.
- [x] 1.3 Verify the frame at 320, 390, 768, and 1440.

## 2. Rastros

- [x] 2.1 Apply the continuous-notebook layout and year markers.
- [x] 2.2 Remove any clickable-card behavior from Rastro entries.
- [x] 2.3 Verify long pages, empty state, and mobile measure.

## 3. Poemas

- [x] 3.1 Redesign the Poemas index with the shared metadata voice.
- [x] 3.2 Apply the poem detail frame and optional series/caption.
- [x] 3.3 Add previous/next in collection order.
- [x] 3.4 Verify first/last poems, long titles, and keyboard focus.

## 4. Melange

- [x] 4.1 Redesign the Melange index as a field notebook.
- [x] 4.2 Apply the report detail frame and metadata.
- [x] 4.3 Verify long reports, empty state, and mobile reading.

## 5. Verification

- [x] 5.1 Build the site and run the internal link checker.
- [x] 5.2 Run the impeccable detector on the three index and detail surfaces.
- [x] 5.3 Update `DESIGN.md` with the reading frame and section rules.
- [x] 5.4 Record the outcome and leave CodeMirror / server redirects out of scope.

## Resultado

- Build de Jekyll correcto.
- `node scripts/check-links.mjs`: 90 HTML, 506 enlaces internos, 0 roto.
- Detector: 0 hallazgos en `/fragmentos/`, `/poemas/`, `/poemas/cae/` y `/melange/` con el contenedor final. El contenedor interior es único: 1000px centrados.
- Sin overflow horizontal en 320, 390, 768 y 1440.
- Pager de Poemas verificado en primero (1/7), medio (6/7) y último (7/7); relacionados por serie y foco cian visibles.
- Melange mantiene cuatro reportes `wip` con estado de borrador y un reporte completo con lead extraído del cuerpo.
