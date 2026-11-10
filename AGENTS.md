# KNDL — instrucciones para agentes

Antes de tocar Rizoma, leé `docs/rizoma/PUNTO-DE-ENTRADA.md`. Es el mapa de
contexto; los ADR son la fuente de las decisiones.

- No inventes fuentes: verificá y declarás qué no pudiste consultar.
- No corrijas en silencio: toda rectificación deja un anexo con fuente.
- No promuevas una idea al cuerpo sin la marca del autor.
- Abrí una deriva con `node scripts/nueva-exploracion.mjs`.
- Antes de cerrar: `bundle exec jekyll build`, `node scripts/check-links.mjs` y,
  si tocaste Rizoma, `python3 docs/rizoma/build-lamina.py --verify --plate 01`
  y `--plate 02`.
