## Purpose

Reduces the weight of the Imaginario contact sheet by serving responsive WebP derivatives with a JPEG fallback, without changing the editorial image set or the detail resolution.

## ADDED Requirements

### Requirement: Responsive derivatives
Every Imaginario plate SHALL have 480w and 960w WebP derivatives generated from its source image. A repeatable script SHALL create them and skip files that are already up to date.

#### Scenario: Derivatives exist
- **WHEN** the generation script runs for the 16 plates
- **THEN** each source image has a `-480.webp` and a `-960.webp` sibling
- **AND** running the script again does not produce duplicate files

#### Scenario: Source changes
- **WHEN** a source image is newer than its derivatives
- **THEN** the script regenerates that plate's variants

### Requirement: Contact sheet source set
The contact sheet SHALL use a `<picture>` with a WebP `srcset` (`480w`, `960w`) and the original image as the JPEG fallback. It SHALL declare `sizes` and intrinsic `width`/`height` so the grid does not shift.

#### Scenario: WebP support
- **WHEN** the browser supports WebP
- **THEN** it may choose the 480w or 960w derivative according to the viewport and DPR

#### Scenario: No WebP support
- **WHEN** the browser does not support WebP
- **THEN** it loads the original JPEG fallback

#### Scenario: Missing derivative
- **WHEN** a plate has no generated WebP variant
- **THEN** the contact sheet still renders its original image

### Requirement: Detail resolution preserved
The media detail SHALL use the original image or the plate's own `media_src`, not a contact-sheet derivative.

#### Scenario: Photo detail
- **WHEN** a photo detail is rendered
- **THEN** the viewer uses the original image path
