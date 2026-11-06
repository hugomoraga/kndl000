## Context

See `proposal.md` for motivation. The site is a static Jekyll build on GitHub Pages. The home, Código, and Imaginario already share tokens and components, but navigation is duplicated across `index.md`, `404.html`, and `_includes/back-button.html`; Imaginario details only show `foto`; the 16 photos are full-size JPEGs; and there is no link check before deploy. The existing `/visual/` and `/imagenes/` redirects are static client redirects, not server redirects.

## Goals / Non-Goals

**Goals:**
- One navigation dataset for primary links, the closing index, 404, and detail back links.
- Imaginario metadata, sequential navigation, and a media model that survives future formats.
- A repeatable image derivative pipeline and responsive contact-sheet markup.
- A dependency-free link checker wired into the existing GitHub Actions workflow.

**Non-Goals:**
- Redesigning Rastros, Poemas, or Melange (separate change).
- Changing the home canvas or Código runner.
- Server-side 301 redirects.
- Adding a responsive-image Jekyll plugin or a JavaScript framework.

## Decisions

### Navigation as data
Create `_data/navigation.yml` with `name`, `url`, `glyph`, `description`, `primary`, and `detail_prefixes`. The home nav and exits loop `site.data.navigation` filtered by `primary`; the 404 uses the same data. The back-button include loops the data and matches `detail_prefixes`; the first/last match wins, with a home fallback. This makes renames and route changes one-file edits.

Alternative: keep the current per-template lists and update them by hand. Rejected because the Visual → Imaginario migration already showed the drift cost.

### Imaginario sequence without a plugin
Use `site.images` order in `_layouts/imagen.html` to compute the current index and previous/next documents. Render a pager with the current position and add a small inline ArrowLeft/ArrowRight handler that ignores form controls, links, and contenteditable. This avoids a collection-pagination plugin and keeps the archive order explicit.

Alternative: Jekyll pagination. Rejected because it is page-number pagination, not previous/next within a collection.

### Derived metadata, never invented
Populate `captured`, `place`, and `medium` only where the existing plate notes state them. The detail uses `captured` instead of `page.date`, because Jekyll can expose a collection document date derived from the file. Missing fields are omitted.

### Generated WebP derivatives, committed
Add `scripts/build-image-variants.sh` using `cwebp` to generate `-480.webp` and `-960.webp` siblings next to each source. The contact sheet uses `<picture>` with a WebP `srcset` and the original JPEG as fallback; `sizes` describes the three-column contact sheet. The detail still uses the original. Derivatives are committed so CI and GitHub Pages do not need image tooling.

Alternative: a Jekyll image plugin. Rejected for an extra Ruby dependency and slower builds. Alternative: rely on lazy loading only. Rejected because the originals are several megabytes.

### Dependency-free link checker
Add `scripts/check-links.mjs` using only Node core. It scans `_site/**/*.html`, extracts `href`/`src`, ignores external URLs, anchors, `mailto:`, `tel:`, and data URLs, maps `/path/` to `_site/path/index.html` or `_site/path`, and exits non-zero with source and target on failure. The workflow runs it after `jekyll build` and before deploy.

Alternative: `html-proofer` or `lychee`. Rejected to avoid a Ruby gem or external binary in the deploy path. The checker does not need to verify external sites.

## Risks / Trade-offs

- [New Imaginario plates without derivatives] → The contact sheet falls back to the original JPEG; the generation script is documented and idempotent.
- [Stale derivatives] → The script skips files newer than the source and regenerates newer sources.
- [Back-link prefix collisions] → `detail_prefixes` are explicit per section; Melange lists both `/melange/` and `/melange-reports/`.
- [Link checker false positives on query strings or anchors] → normalize paths by stripping `?` and `#`; skip non-page schemes.
- [Arrow-key navigation can hijack inputs] → ignore events from inputs, textareas, selects, contenteditable, and interactive elements.
- [Contact-sheet dimensions differ from the cropped display] → CSS `aspect-ratio: 4 / 3` and `object-fit: cover` control the visual crop; intrinsic 960×720 attributes reserve layout space.

## Migration Plan

1. Add `_data/navigation.yml` and switch the home, 404, and back-button include to it.
2. Add metadata to the 16 plates where the notes support it; add pager and keyboard handler.
3. Run the image script; add `<picture>` and `srcset` to the contact sheet.
4. Add the link checker and the workflow step.
5. Build, run the detector and link checker, verify old redirects, deploy.
6. Rollback is a revert of the change; no data migration is required.
