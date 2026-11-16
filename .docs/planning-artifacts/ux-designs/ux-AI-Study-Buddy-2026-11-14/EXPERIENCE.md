---
name: AI Study Buddy
status: draft
sources:
  - "{planning_artifacts}/prds/prd-Programmering med AI 2026-2026-11-04/prd.md"
  - "{project-root}/product-brief.md"
design: ./DESIGN.md
updated: 2026-11-14
---

# AI Study Buddy — Experience Spine

## Foundation

Responsive web app for physiotherapy students studying anatomy from one course PDF. Laptop is the primary surface; mobile remains usable through a single-column layout. The source PDF page and the current study resource are visible together on laptop, and stacked in reading order on narrow screens.

All student-facing copy is Norwegian. Latin anatomical terms remain in the form used by the course material. The visual system is defined in [`DESIGN.md`](./DESIGN.md); this document specifies behavior and information hierarchy. The current HTML prototype uses local mock data and is not an implementation of PDF processing or a live AI provider.

The source links help a student inspect the uploaded course material. A matching excerpt confirms that the excerpt appears on the cited page; it does not guarantee academic correctness or complete coverage.

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| Upload | New or ended study session | Choose one supported PDF or enter demo mode |
| Text availability review | PDF processing, when some pages have insufficient text | List affected page numbers and let the student continue or cancel |
| Resource chooser | Successful PDF processing or return from a result | Choose one of four resource types and reopen results from this session |
| Generating | Resource choice | Show that a request is in progress |
| Resource review | Successful generation or history selection | Practise with content, inspect source excerpts, and open cited pages |
| PDF viewer | Selecting a cited page | Display the corresponding page while the resource remains available |
| Error state | Unsupported PDF, extraction failure, generation failure, or request limit | Explain what happened and offer the next available action |
| New session | Selecting “Avslutt studieøkt” or reopening after the tab closes | Start without the previous PDF or generated resources |

## Voice and Tone

Student-facing copy is brief, calm, and specific. State what happened, its effect on the study session, and the next action. Never imply that the student caused a provider or extraction error.

| Use | Avoid |
|---|---|
| “Side 7 har lite uttrekkbar tekst. Denne siden tas ikke med hvis du fortsetter.” | “Feil i PDF-en.” |
| “Vi kunne ikke lage ressursen. Ingen delvis ressurs ble lagret.” | “Noe gikk galt.” |
| “Ubekreftet” with a nearby explanation of what could not be checked | A warning icon without text |
| “Velg side 12 for å åpne den i PDF-visningen.” | “Klikk her.” |

## Component Patterns

| Component | Behavior |
|---|---|
| PDF upload | Accept one PDF up to 20 MB and 50 pages. Explain which limit was exceeded before processing. The current session cannot add or replace its PDF. |
| Text availability review | List every page below 20 non-whitespace extracted characters. “Fortsett” uses only pages meeting the threshold; “Avbryt” starts no generation. If no page is usable, show an error and do not offer resource generation. |
| Resource chooser | Offer Sammendrag, Nøkkelbegreper, Flashcards, and Quiz after successful PDF processing. Keep existing session resources available. |
| Request counter | In live mode, show remaining requests from the start of the session. Decrement when a request starts, including failures and timeouts. At zero, block provider calls and explain the limit. Demo mode makes no provider calls. |
| Source reference | Keep every page number adjacent to its excerpt. Selecting the page updates the viewer and leaves the resource visible. |
| Verification status | Mark a resource “Ubekreftet” when required source data is missing, an excerpt does not appear on its paired page, or that page cannot be checked. |
| Flashcard | Show the question first. Reveal the answer and source reference on request. |
| Quiz | Keep answers and explanations hidden until the whole quiz is submitted. After submission, mark correct and incorrect responses using both color and labels. Retake the same questions and options, clear responses, and change their order from the preceding attempt. |
| Generation error | Show a Norwegian explanation, retain no partial result, and offer retry or return to resource choice. Previously completed resources remain available. |
| End session | Clear the PDF and all generated resources when the student ends the session. A refresh or closed tab starts a new session. |

## State Patterns

| State | Treatment |
|---|---|
| No PDF | Resource generation is unavailable; explain that a PDF must be processed first. |
| Processing | Show a concise progress message. Do not show resource choices until processing succeeds. |
| Some pages below threshold | Show page numbers, explain exclusion, and wait for “Fortsett” or “Avbryt.” |
| No usable page text | Show a clear error; do not generate resources. |
| File limit exceeded | Name the exceeded size or page-count limit and stop processing. |
| Live generation in progress | Show the selected resource type being created. Count the request at start. |
| Invalid model response / provider unavailable / timeout | Show the error in Norwegian, do not show partial content, preserve earlier resources, and leave the counter decremented. |
| Source excerpt confirmed | Show the excerpt, cited page, and “Kildeutdrag bekreftet.” This is a text-match result only. |
| Source unverified | Show “Ubekreftet” next to the affected resource and retain the page link when available. Explain the match limitation without claiming academic correctness. |
| Request limit reached | Disable the live generation action and state that eight requests have been used in this session. |
| Demo mode | Make all four resource types reviewable from stored responses, without API calls or a request counter. |
| Ended session | Return to upload; previous PDF and resources are not restored. |

## Interaction Primitives

- Use buttons for actions and links/buttons for cited page navigation; all are keyboard operable.
- Upload and page-review steps follow a single primary action with a clear secondary cancel/back action.
- Keep the current resource in view when the selected PDF page changes.
- Place focus on the new screen heading after a screen transition and announce errors/status changes to assistive technology.
- Respect reduced-motion settings; transitions must not be required to understand progress or state.
- Never rely on hover alone for controls or source details.

## Accessibility Floor

- Target WCAG 2.2 AA for text, controls, focus indication, and responsive reflow.
- Maintain reading and focus order: resource first, then PDF viewer on narrow screens.
- Provide a visible keyboard focus indicator for every interactive control.
- Make the full resource-choice tile operable by keyboard and expose its name and description to assistive technology.
- Announce upload errors, page-review results, generation completion, and generation failure through appropriate live regions.
- Pair source status and quiz correctness colors with text labels and symbols; color alone never conveys meaning.
- Preserve text resizing without clipped controls or horizontal scrolling at common mobile widths.
- Keep primary touch targets at least 44 by 44 CSS pixels.

## Responsive & Platform

| Viewport | Behavior |
|---|---|
| Laptop / wide desktop (approximately 1024px and wider) | Resource and PDF viewer sit side by side; resource column is slightly wider. Keep the selected PDF page visible while the student scrolls through a resource. |
| Tablet / narrow laptop | Preserve both surfaces when there is enough width; otherwise stack the viewer after the resource. Avoid shrinking source excerpts below comfortable reading width. |
| Phone | Single column. Resource comes first and PDF viewer follows it. Cited page selection scrolls to or reveals the viewer and updates its page. |

The primary design target is laptop, as selected by the user. Mobile is a responsive web surface, not a separate native app.

## Key Flows

### Flow 1 — Check a generated summary (Nora, physiotherapy student)

1. Nora opens AI Study Buddy before an anatomy exam and selects her course PDF.
2. The app identifies four pages with insufficient text and lists their PDF viewer page numbers. Nora can continue using the remaining usable pages or cancel.
3. She continues. The chooser reports how many pages are represented and offers summaries, key concepts, flashcards, and a quiz.
4. Nora chooses a summary. A live request is counted when it starts; the app displays a generating state.
5. The summary appears with each point's excerpt and cited page. The app labels excerpts that fail verification “Ubekreftet.”
6. Nora selects one cited page. The PDF viewer changes to that page while the summary remains visible.
7. **Climax:** Nora can compare the source excerpt with the original PDF page without losing her place in the study resource.

### Flow 2 — Recover from generation failure (Nora, same study session)

1. Nora chooses Flashcards and starts a generation request.
2. The provider times out. The request counter decreases because the request started.
3. The app shows a Norwegian error, no partial flashcard set, and a retry action. Any summary she already created remains available.
4. Nora retries. The retry is counted as a new request. If successful, she sees a question-first flashcard and can reveal its answer and source.
5. **Climax:** Nora can continue studying from earlier resources even if the new generation attempt fails again.

### Flow 3 — Use the demo without an API key

1. A student starts demo mode from the upload surface.
2. The app uses the bundled example PDF and stored responses for the four resource types.
3. The student opens a source page and reviews a resource. No provider request is made and no live-generation counter appears.
4. **Climax:** The student can complete the study flow without configuring an API key or sending course material to a provider.

## Open Questions

- The exact visual palette is a first-pass proposal based on the approved calm, modern direction. Review it with the user before status is changed from draft.
- The paid versus Free Tier provider decision and final project spending ceiling remain architecture decisions documented in PRD §9.
- The current prototype simulates PDF extraction, source matching, and provider responses. Those behaviors must be implemented and validated in the application before the experience can be considered final.
