# KNDL — instrucciones para agentes

Rizoma vive en su propio repositorio (Astro) y se publica en
`rizoma.quicio.org`. En este repo no está su contenido ni su build: un generator
de Jekyll lee el checkout de Rizoma (`RIZOMA_DIR`, por defecto `../rizoma`; en CI
`rizoma-src`) y genera el índice `/rizoma/`, el bloque del home y redirects de
las URLs viejas y las apariciones de obras en Rizoma. Antes de tocar Rizoma, leé el `PUNTO-DE-ENTRADA.md` del repo de
Rizoma; ahí están el mapa de contexto y los ADR.

- No inventes fuentes: verificá y declarás qué no pudiste consultar.
- No corrijas en silencio: toda rectificación deja un anexo con fuente.
- No promuevas una idea al cuerpo sin la marca del autor.
- Para construir con Rizoma: `RIZOMA_DIR=../rizoma bundle exec jekyll build`.
- Antes de cerrar: `RIZOMA_DIR=../rizoma bundle exec jekyll build` y
  `node scripts/check-links.mjs`.
