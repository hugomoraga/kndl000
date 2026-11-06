## Purpose

Gives Rastros, Poemas, and Melange a shared reading frame that matches the archive's visual world while preserving the different reading behavior of each section.

## ADDED Requirements

### Requirement: Shared reading frame
Rastros, Poemas, and Melange SHALL use the existing archive tokens: Newsreader for reading text, JetBrains Mono only for metadata, a 1100px outer column, and a single 1000px centered content container.

#### Scenario: Long-form reading
- **WHEN** a reader opens a poem, a Rastro block, or a Melange report
- **THEN** the running text uses Newsreader within the 1000px centered container
- **AND** metadata is set in mono at 11px or more

#### Scenario: Shared navigation
- **WHEN** any of the three sections is rendered
- **THEN** its links and back labels come from `_data/navigation.yml`
- **AND** the page remains readable without JavaScript

### Requirement: Rastros continuous notebook
Rastros SHALL remain a continuous notebook: entries are not links, year markers organize the sequence, and there are no cards or pagination.

#### Scenario: Reading Rastros
- **WHEN** the reader scrolls the Rastros index
- **THEN** the text flows continuously with year markers
- **AND** no entry behaves like a clickable card

#### Scenario: Mobile Rastros
- **WHEN** the viewport is 390px
- **THEN** the reading measure stays readable
- **AND** the page has no horizontal overflow

### Requirement: Poemas index and detail
The Poemas index SHALL list poems by date/series, and the poem detail SHALL keep the poem as the protagonist, show series and caption when present, and offer previous/next navigation.

#### Scenario: Poem detail
- **WHEN** a poem is opened
- **THEN** the title, poem body, series/caption, and previous/next links are readable in the shared frame

#### Scenario: Poem index
- **WHEN** the Poemas index is opened
- **THEN** the list is scannable and uses the same metadata voice as Código and Imaginario

### Requirement: Melange field notebook
The Melange index SHALL read as a field notebook with report titles, dates, and short leads; the report detail SHALL keep long-form reading, metadata, and the existing body unchanged.

#### Scenario: Melange report
- **WHEN** a report is opened
- **THEN** its title, date, place/kind metadata, and body use the shared reading frame

### Requirement: States and adaptation
The three surfaces SHALL provide readable empty states, long-content behavior, focus states, and responsive layouts at 320, 390, 768, and 1440.

#### Scenario: Empty section
- **WHEN** a section has no published entries
- **THEN** it shows a quiet empty state instead of a blank page

#### Scenario: Keyboard reading
- **WHEN** the reader navigates by keyboard
- **THEN** links, previous/next, and focus rings remain visible
