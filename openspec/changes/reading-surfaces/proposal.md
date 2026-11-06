## Why

The home, Código, and Imaginario now share one design language, but Rastros, Poemas, and Melange still use the previous reading surfaces. That gap is the most visible inconsistency left in the archive, and those three sections carry most of the written work.

## What Changes

- Establish a shared reading frame from the existing tokens: 1100px outer column, 1000px centered content container, Newsreader for voice, JetBrains Mono only for metadata.
- Redesign Rastros as a continuous notebook: no cards, no click targets on entries, year markers, generous rhythm.
- Redesign the Poemas index and poem detail: index list, poem page, previous/next, series/caption metadata where present.
- Redesign the Melange index and report detail: field-notebook masthead, report list, metadata and long-form reading.
- Use `_data/navigation.yml` for section links and back labels; no hardcoded duplicate names.
- Keep all content, URLs, collections, and routes unchanged.
- Do not redesign Diario, Vestigios, Devices, or Música in this change.

## Capabilities

### New Capabilities

- `reading-surfaces`: the shared reading frame and the section-specific Rastros, Poemas, and Melange index/detail behavior.

### Modified Capabilities

None.

## Impact

- `_layouts/default.html`, `poems.html`, `melange-report.html`, and the shared reading styles.
- `fragmentos/index.md`, `poemas/index.md`, `melange/index.md`, and the poem/report templates.
- `assets/css/style.css` and `_includes/title.html` / `back-button.html` where the reading frame requires it.
- No content migration, no route changes, no new dependencies.
