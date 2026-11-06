## Purpose

Catches broken internal links and stale routes after a rename or section migration before the site is deployed.

## ADDED Requirements

### Requirement: Internal link check
The quality gate SHALL scan every HTML file in `_site` and verify that internal `href` and `src` targets exist, ignoring external URLs, anchors, mailto, and data URLs.

#### Scenario: Valid site passes
- **WHEN** every internal link points to a built file or directory index
- **THEN** the check exits successfully

#### Scenario: Broken link fails
- **WHEN** a page links to an internal path that has no file in `_site`
- **THEN** the check exits with a non-zero status and names the source file and target

#### Scenario: Redirect routes pass
- **WHEN** an old route such as `/visual/` or `/imagenes/ascenso/` exists as a redirect page
- **THEN** the link check treats it as valid

### Requirement: Build workflow gate
The GitHub Actions workflow SHALL build the site, run the internal link check, and fail before deploy when the check fails.

#### Scenario: Deploy blocked by broken link
- **WHEN** the build produces a broken internal link
- **THEN** the workflow stops before the deploy step
