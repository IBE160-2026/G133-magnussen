# Epic 1 Context: Start and end a PDF study session

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Let a student start a study session from one supported course PDF, understand which extracted pages can support study resources, and end the session without carrying its content into the next one. This establishes the source and lifecycle boundary for all later study work.

## Stories

- Story 1.1: Open a supported PDF
- Story 1.2: End a study session

## Requirements & Constraints

- Support one PDF per session, up to 20 MB and 50 pages. Explain a violated limit and stop before generating resources.
- Extract text per physical PDF page. Treat a page with at least 20 non-whitespace characters as usable. Report page numbers for pages below that threshold; do not include their text in generated resources.
- When some pages are usable and others are not, wait for the student's decision before generation. Continuing uses only usable-page text; cancelling generates nothing. If no page is usable, or extraction cannot reliably determine page-level availability, show a clear error and do not generate resources.
- Do not offer resource generation before a supported PDF has been successfully processed. Keep the active PDF and resources in browser memory only; a new session must not restore the previous session.
- Student-facing messages and controls are in Norwegian. Use concise, calm language that explains what happened and the next action. Project documentation remains in English.

## Technical Decisions

- The browser owns the active study session; do not add persistent storage or a database for PDFs, resources, or answers.
- Process PDF text locally in the Node application. Keep demo resources usable without a provider, and only send usable-page text and page metadata to the optional provider after the user has chosen to proceed.
- Keep original PDF page numbering, starting at 1. Avoid changes to the source-page numbering or reference behavior.
- Preserve the existing upload and processing limits and return explicit errors for unsupported input or indeterminate extraction. Remove temporary server files after each request.

## UX & Interaction Patterns

- The upload flow has one clear primary action and a secondary cancel/back action. During processing, do not expose resource choices.
- If review is needed, list all affected page numbers and explain that they will be excluded. Offer **Fortsett** and **Avbryt**, with keyboard-operable controls and an announced status/error.
- After continue, make the next screen show the usable-page coverage before resource selection. Cancellation returns to the upload flow and must not leave a generated resource or a partially active study session.
- On narrow screens, preserve a clear reading and focus order. Place focus on the new screen heading after a state transition, and do not rely on color or hover to explain the choice.

## Cross-Story Dependencies

Successful PDF processing establishes the session that Story 1.2 later clears. Resource-generation flows depend on the accepted PDF and its usable-page set; they must not bypass the student's decision or include pages below the text threshold.
