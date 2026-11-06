## Purpose

Keeps every section name, URL, glyph, description, and detail back-link target in one place so a rename or route change cannot drift across the home, 404, and detail pages.

## ADDED Requirements

### Requirement: Single navigation source
The site SHALL define its sections in `_data/navigation.yml`. Each entry SHALL include `name`, `url`, `glyph`, `description`, `primary`, and `detail_prefixes`.

#### Scenario: Navigation data exists
- **WHEN** the site is built
- **THEN** every primary section link rendered by the home comes from `_data/navigation.yml`
- **AND** no section name or URL is hardcoded twice in the home template

#### Scenario: Rename propagates
- **WHEN** a section's `name` or `url` changes in `_data/navigation.yml`
- **THEN** the home nav, the home closing index, the 404 explore links, and detail back links use the new value without editing those templates

### Requirement: Primary navigation rendering
The home SHALL render the hero nav and the "Umbrales" closing index from entries with `primary: true`, preserving the data order. The 404 SHALL render a compact subset of the same primary entries.

#### Scenario: Home shows Imaginario
- **WHEN** the home is rendered
- **THEN** the primary nav contains Imaginario linked to `/imaginario/`
- **AND** the closing index shows the same name, glyph, and description

#### Scenario: 404 uses the same source
- **WHEN** a missing page is rendered
- **THEN** its explore links use the navigation data and do not duplicate section names

### Requirement: Data-driven back links
Detail pages SHALL resolve their back link from the navigation entry whose `detail_prefixes` contains the current URL prefix. Section index pages with `back: false` SHALL not render the back link.

#### Scenario: Back from an Imaginario plate
- **WHEN** a visitor opens `/imaginario/ascenso/`
- **THEN** the back link points to `/imaginario/` with the label "Volver a Imaginario"

#### Scenario: No match falls back home
- **WHEN** a page has no matching detail prefix
- **THEN** the back link falls back to `/` with the label "Volver"

#### Scenario: Section index has no back link
- **WHEN** the Imaginario index is rendered
- **THEN** no back link is rendered
