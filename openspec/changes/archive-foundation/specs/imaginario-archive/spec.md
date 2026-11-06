## Purpose

Makes Imaginario a mixed-format archive that can hold photographs, video, gifs, scans, and generative pieces, and lets a visitor read the plates in sequence.

## ADDED Requirements

### Requirement: Optional plate metadata
A plate SHALL accept optional `captured`, `place`, and `medium` fields. The detail SHALL display only the fields that exist and SHALL NOT display a fabricated date.

#### Scenario: Enriched photo
- **WHEN** a plate defines `captured`, `place`, and `medium`
- **THEN** the detail meta shows `foto`, the capture date, the place, and the medium
- **AND** the fields are separated consistently

#### Scenario: Existing photo without metadata
- **WHEN** a plate only defines `image`, `title`, and optional `caption`
- **THEN** the detail meta shows only `foto`
- **AND** no date is derived from the file or build time

### Requirement: Media-agnostic viewer
The detail SHALL render according to `media_type`: `foto`, `gif`, and `escaneo` as images; `video` as a video with controls and poster; `generativo` as an embed or iframe. `image` SHALL remain the poster/thumbnail for every plate.

#### Scenario: Video plate
- **WHEN** `media_type` is `video` and `media_src` is present
- **THEN** the detail renders a video element with controls and the plate image as poster

#### Scenario: Generative plate
- **WHEN** `media_type` is `generativo` and `media_embed` is present
- **THEN** the detail renders the embed instead of an image

#### Scenario: Missing media source
- **WHEN** a video or generative plate has no `media_src` or `media_embed`
- **THEN** the detail falls back to the plate image

### Requirement: Sequential plate navigation
The detail SHALL provide previous and next links in collection order, show the current position (`n / total`), and support ArrowLeft and ArrowRight when focus is not inside a control.

#### Scenario: Previous and next
- **WHEN** a plate is not first or last
- **THEN** the detail shows links to the previous and next plates
- **AND** shows the current position and total count

#### Scenario: Keyboard navigation
- **WHEN** the visitor presses ArrowLeft or ArrowRight on a plate detail outside a form control
- **THEN** the browser navigates to the previous or next plate

### Requirement: Format label
The contact sheet and the detail SHALL display the plate format from `media_type`, defaulting to `foto`.

#### Scenario: Existing plates
- **WHEN** the 16 existing photographs are rendered
- **THEN** each plate and detail shows the format `foto`
