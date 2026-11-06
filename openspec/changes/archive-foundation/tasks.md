## 1. Navigation source of truth

- [x] 1.1 Create `_data/navigation.yml` with the nine sections, glyphs, descriptions, `primary`, and `detail_prefixes`.
- [x] 1.2 Replace the home hero nav and "Umbrales" index with loops over `site.data.navigation` filtered by `primary`.
- [x] 1.3 Replace the 404 explore links with the same data source.
- [x] 1.4 Refactor `_includes/back-button.html` to resolve the back target from `detail_prefixes`, with the home fallback.
- [x] 1.5 Build and verify home, 404, `/imaginario/`, `/imaginario/ascenso/`, `/codigo/objeto-vacio/`, and `/melange-reports/` back links.

## 2. Imaginario metadata and sequence

- [x] 2.1 Add `captured`, `place`, and `medium` to the plates whose existing notes state them; do not invent dates or places.
- [x] 2.2 Ensure the detail meta uses `captured` and never the implicit collection `page.date`.
- [x] 2.3 Add previous/next links, current position, and total count to `_layouts/imagen.html`.
- [x] 2.4 Add ArrowLeft/ArrowRight navigation that ignores form controls and interactive elements.
- [x] 2.5 Style the pager in the existing Imaginario detail language.
- [x] 2.6 Verify a middle plate, the first plate, the last plate, and the keyboard behavior.

## 3. Responsive image delivery

- [x] 3.1 Add `scripts/build-image-variants.sh` using `cwebp` with `-480.webp` and `-960.webp` outputs, idempotent by mtime.
- [x] 3.2 Generate derivatives for the 16 Imaginario source images.
- [x] 3.3 Replace the contact-sheet `<img>` with `<picture>`, WebP `srcset`, `sizes`, and intrinsic dimensions; keep the JPEG fallback.
- [x] 3.4 Keep the detail viewer on the original image or `media_src`.
- [x] 3.5 Verify WebP selection, fallback path, missing-derivative fallback, and mobile layout stability.

## 4. Quality gate

- [x] 4.1 Add `scripts/check-links.mjs` with no external dependencies; skip external URLs, anchors, `mailto:`, `tel:`, and data URLs.
- [x] 4.2 Normalize `/path/` to `_site/path/index.html` and allow existing redirect pages.
- [x] 4.3 Add the link check to `.github/workflows/jekyll.yml` after `jekyll build` and before deploy.
- [x] 4.4 Run the checker against `_site`; fix any broken internal links it reports.

## 5. Verification and documentation

- [x] 5.1 Run `openspec validate archive-foundation --strict`.
- [x] 5.2 Build the site and run the impeccable detector on the changed home, Imaginario index, and Imaginario detail.
- [x] 5.3 Verify old `/visual/` and `/imagenes/:slug/` routes still redirect.
- [x] 5.4 Check no horizontal overflow at 320, 390, 768, and 1440 for the changed pages.
- [x] 5.5 Update `ESTRUCTURA.md` with `_data/navigation.yml`, the image script, and the link checker.
- [x] 5.6 Record the implementation outcome and leave the reading-section redesign as a follow-up OpenSpec change.
