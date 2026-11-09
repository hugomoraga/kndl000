---
title: Candil
date: 2026-11-08
kind: app
tech: Rust · egui
version: v0.2.1
status: activo
repo: https://github.com/quicio/candil
formats: macOS · Linux · Windows
platform: Desktop
description: "Lector de EPUB minimalista en Rust: tipografía cuidada, biblioteca local, anotaciones y consultas."
---

**Candil** es un lector de EPUB minimalista escrito en Rust. Una columna, scroll continuo y tipografía cuidada; sin webview ni motor HTML. La biblioteca indexa carpetas sin copiar los libros y el progreso, los destacados y las notas quedan en disco.

→ [Descargar la última versión](https://github.com/quicio/candil/releases/latest)

## Qué tiene

- **Lectura:** una columna, scroll continuo, cinco temas y tipografía Literata.
- **Biblioteca:** indexa carpetas sin copiar archivos, con portadas, búsqueda, orden y filtros.
- **Progreso:** posición estable por capítulo, bloque y fracción; no se descoloca al cambiar fuente o ventana.
- **Anotaciones:** destacados en tres colores, notas, índice global y export Markdown.
- **Búsqueda:** dentro del libro, sin acentos ni mayúsculas.
- **Consultas:** diccionario, traducción e IA desde la selección, con historial local.
- **Privacidad:** sin telemetría ni cuentas; las consultas online están apagadas por defecto.

## Motor

El EPUB se convierte a un modelo plano de bloques (`Block` + `Run`): sin DOM ni CSS del libro. Un parser estricto y otro tolerante para EPUB mal formados. El binario final pesa ~6.4 MiB y arranca sin webview.

## Estado

Probado contra 43 EPUB reales: 0 capítulos vacíos y 2279/2279 imágenes resueltas. La biblioteca indexa 50 libros en 1.65 s la primera vez. Versión actual: v0.2.1.

## Repositorio

Código abierto (MIT): [quicio/candil](https://github.com/quicio/candil).
