# KNDL — instrucciones para agentes

Rizoma vive en su propio repositorio (Astro). En este repo no está su contenido,
sus layouts ni sus datos: se construye aparte y se embebe en `/rizoma/` como
artefacto estático. Antes de tocar Rizoma, leé el `PUNTO-DE-ENTRADA.md` del repo
de Rizoma; ahí están el mapa de contexto y los ADR.

- No inventes fuentes: verificá y declarás qué no pudiste consultar.
- No corrijas en silencio: toda rectificación deja un anexo con fuente.
- No promuevas una idea al cuerpo sin la marca del autor.
- Para construir el sitio completo con Rizoma: `bash scripts/build-rizoma.sh`.
- Antes de cerrar: `bundle exec jekyll build`, `node scripts/check-links.mjs` y,
  si tocaste la integración, `bash scripts/build-rizoma.sh` seguido de
  `node scripts/check-links.mjs`.
