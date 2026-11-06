## Context

See `proposal.md` for motivation. The home, Código, and Imaginario already use the shared tokens and `_data/navigation.yml`. Rastros, Poemas, and Melange still use older layouts and CSS. Their content and routes must not change.

## Goals / Non-Goals

**Goals:**
- Carry the reading frame into the three written sections.
- Preserve each section's native reading behavior: continuous notebook, poem detail, report detail.
- Reuse the existing typography, colors, rules, and navigation data.

**Non-Goals:**
- Content rewrites, route changes, or new collections.
- Redesigning Diario, Vestigios, Devices, or Música.
- New dependencies or a JavaScript framework.

## Decisions

### Shared frame, different reading behavior
Use a common 1100px outer column and a single 1000px centered content container, but keep distinct structures: Rastros has no clickable entries, Poemas has index/detail, Melange has report index/detail. A single "article card" pattern would erase the sections' identity.

### Rastros stays clickless
Rastros is an archive of continuous lines. Entries remain plain blocks with year markers; no links, no pagination, no hover effects on text. This is a deliberate anti-interaction rule.

### Poemas keeps the poem primary
The poem detail uses the title, body, optional series/caption, and previous/next in collection order. Metadata is mono; the poem is serif and full measure.

### Melange stays a field notebook
The index uses a masthead, date-led entries, and short leads. The report detail keeps the existing body and adds metadata in the shared frame.

### Navigation from data
Both section indexes and detail back links read `_data/navigation.yml`. No section name is duplicated in the templates.

## Risks / Trade-offs

- [Reading sections drift from the archive atmosphere] → Reuse the same tokens, 1px rules, and type ramp; avoid inventing a new palette.
- [Poemas previous/next order] → Use collection order and verify first/last behavior.
- [Long Rastros page] → Keep the continuous flow; no virtualized list or pagination.
- [Existing content edge cases] → Test overlong titles, empty series/caption, and missing images.

## Migration Plan

1. Introduce the shared reading frame classes without changing content.
2. Apply Rastros first (lowest risk).
3. Apply Poemas index/detail.
4. Apply Melange index/report.
5. Build, inspect at the four widths, run the detector and link checker.
6. Rollback by reverting the change; no data migration.
