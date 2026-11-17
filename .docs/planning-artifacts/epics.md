---
status: draft
stepsCompleted: []
inputDocuments:
  - "prds/prd-Programmering med AI 2026-2026-11-04/prd.md"
  - "architecture/technology.md"
  - "ux-designs/ux-AI-Study-Buddy-2026-11-14/designvalg.md"
---

# AI Study Buddy - Epic Breakdown

## Overview

Drafted on 17 November 2026 from the PRD and repository history. Acceptance criteria describe the intended behaviour. Evidence records what was observed in the delivered application.

## Requirements Inventory

### Functional Requirements

| PRD requirements | Coverage |
| --- | --- |
| FR-1–FR-3: PDF selection, limits, and text availability | Story 1.1 |
| FR-4–FR-6: Resource selection, summaries, and key concepts | Story 2.1 |
| FR-7–FR-8: Flashcards and quizzes | Story 2.2 |
| FR-9: Session-scoped resources | Story 1.2 |
| FR-10: Source excerpt verification | Story 3.1 |
| FR-11: Open the cited page | Story 3.2 |
| FR-12–FR-13: Live generation limits and errors | Stories 4.1 and 4.2 |
| FR-14: Keyless demo | Story 4.3 |

### Nonfunctional Requirements

The interface and errors use Norwegian and retain relevant Latin anatomy terms. Provider data handling and the spending ceiling apply to live generation. See [PRD §5](prds/prd-Programmering%20med%20AI%202026-2026-11-04/prd.md#5-general-requirements).

### Additional Requirements

AD-1 keeps study state in the browser. AD-2 keeps PDF processing local and gives the demo a keyless path. AD-3 binds source references to physical PDF page numbers. [Architecture](architecture/technology.md)

### UX Design Requirements

Show the resource and cited page side by side in wide windows and stack them in narrow windows. Keep the source control operable with a keyboard. [Design decision and test](ux-designs/ux-AI-Study-Buddy-2026-11-14/designvalg.md)

## Epic List

1. Start and end a PDF study session.
2. Study and practise with resources.
3. Check study resources against the source.
4. Run the demo and manage live generation.

## Epic 1: Start and end a PDF study session

### Story 1.1: Open a supported PDF

As a student, I want to open one course PDF and see which pages can be used, so that I understand what the resources will cover.

**Given** a study session starts with a PDF, **when** it is processed, **then** the app enforces the 20 MB and 50-page limits and lists pages with fewer than 20 non-whitespace characters. If some pages are unusable, the student can continue with usable pages or cancel before generation.

**Evidence:** The keyless demo opens successfully. The local HTTP check rejected a non-PDF payload and an oversized PDF payload. The choice before generation is missing from the current flow.

### Story 1.2: End a study session

As a student, I want to end my study session so that the next session starts with a different PDF and no previous answers.

**Given** a session with resources, **when** the student ends it or reloads the page, **then** the next session starts without the previous PDF or resources.

**Evidence:** The [browser implementation](../../app/index.html) stores session data in memory. The submission test does not cover the full session lifecycle.

## Epic 2: Study and practise with resources

### Story 2.1: Review summaries and key concepts

As a student, I want to switch between summaries and key concepts so that I can review the main ideas and terminology.

**Given** a processed PDF, **when** the student selects either resource, **then** the corresponding content and its source information are available.

**Evidence:** The HTTP check returned both resource types for the demo. The UX screenshots show the summary and its source view.

### Story 2.2: Practise with flashcards and quizzes

As a student, I want to practise recall and get feedback so that I can identify what to review.

**Given** a flashcard, **when** the student reveals the answer, **then** the answer and its source are shown. **Given** a submitted quiz, **when** the student retries, **then** the same questions appear in a different order.

**Evidence:** Both behaviours were observed in the [submission test](../../app/TESTLOGG.md).

## Epic 3: Check study resources against the source

### Story 3.1: Identify unverified excerpts

As a student, I want to see which excerpts cannot be confirmed so that I know which references to inspect.

**Given** a resource with an excerpt absent from its cited page, **when** the source check runs, **then** the resource is marked **Ubekreftet**.

**Evidence:** The [Gemini module](../../app/gemini-summary.mjs) checks excerpts against the cited page. A negative test with an altered excerpt is still needed. The PRD also requires an unverified label for missing or unverifiable references. The current Gemini validation can reject those responses instead.

### Story 3.2: Open a cited PDF page

As a student, I want to open the cited page from a study resource so that I can check the source in context.

**Given** a resource with a link to page 3, **when** the student selects it, **then** the source panel shows page 3 and the student stays in the same resource view.

**Evidence:** The browser initially displayed the whole PDF. [PR #2](https://github.com/IBE160-2026/G133-magnussen/pull/2) added selected-page rendering in commit `bace7e1`. The [submission test](../../app/TESTLOGG.md) confirmed that only page 3 appeared. The later UX test documented a keyboard-operated source link in a narrow window.

## Epic 4: Run the demo and manage live generation

### Story 4.1: Respect live generation and spending limits

As a student, I want to see the remaining request allowance so that I know when live generation will stop.

**Given** eight started attempts or a request that would exceed the configured spending ceiling, **when** the student requests generation, **then** the app explains the limit in Norwegian and makes no provider call.

**Evidence:** The session limit and spending ceiling are open implementation items.

### Story 4.2: Recover from a generation failure

As a student, I want a clear message when generation fails so that I can retry or use existing resources.

**Given** an invalid response, timeout, or unavailable provider, **when** generation fails, **then** the app shows a Norwegian error, displays no partial result, and keeps any earlier successful resources available.

**Evidence:** The server has a generation error path. Malformed responses, timeouts, and retention of earlier results remain unverified.

### Story 4.3: Run the demo without a key

As a reviewer, I want to run the bundled demo without credentials so that I can evaluate the core workflow.

**Given** the included PDF and no Gemini API key, **when** the reviewer runs the demo, **then** all four study resource types are available from stored results.

**Evidence:** The local HTTP check returned all four types without a key. The [submission test](../../app/TESTLOGG.md) records the browser checks for source viewing, flashcards, and quiz.
