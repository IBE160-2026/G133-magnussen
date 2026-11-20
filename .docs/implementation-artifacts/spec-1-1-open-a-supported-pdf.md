---
title: 'Review usable PDF pages before generation'
type: 'feature'
created: '2026-11-20'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Students currently cannot choose what to do when a PDF contains pages with too little extractable text. Processing proceeds without asking, even though those pages cannot support reliable study resources.

**Approach:** Before any study-resource request, list pages below the existing text threshold and let the student continue using only usable pages or cancel. Skip the prompt when every page is usable; when none are usable or extraction fails, explain the problem and generate nothing. Keep student-facing UI in Norwegian, documentation in English, and do not make real Gemini or paid calls during implementation or validation.

</frozen-after-approval>

## Implementation Notes

The deployed static app extracts page text with PDF.js before posting to `api/study.mjs`; the local macOS app posts the PDF to `app/server.mjs`, which extracts it with PDFKit. Apply the same decision gate to both paths so neither can invoke generation before confirmation. Keep existing page limits, threshold, demo behavior, source numbering, and other resource flows unchanged. Add accessible Norwegian continue/cancel UI, document the behavior in the English app README, and validate both the decision outcomes and that cancellation makes no resource-generation request. The local preview path must return page metadata without returning resources or invoking Gemini.

Implemented the review screen in both paths. The local server returns only page metadata when usable and unusable pages are mixed without confirmation; after **Fortsett**, it re-extracts the unchanged local file and checks that the confirmed skipped page numbers still match before returning resources. All-usable PDFs use one extraction. Browser checks used mocked page extraction and locally intercepted responses; the local bundled-demo check used no Gemini option. `npm test` and `npm run build` pass; no live Gemini or paid calls were made.

## Review Triage Log

- **medium — patched:** Both generation endpoints previously accepted mixed-page input without an explicit decision. They now require the exact skipped-page list, and API tests confirm missing or mismatched lists cause no network calls.
- **medium — patched:** Bundled demo resources could bypass the no-usable-page check. The shared page decision now runs before demo/resource handling; a regression test verifies no demo resources are returned when all pages are unusable.
- **medium — patched:** The feature lacked automated consent-gate coverage. Tests now cover backend gating; browser checks cover page listing, cancellation, continuation, and the all-usable/no-usable UI states using intercepted local responses.
- **low — rejected:** A mixed local PDF is extracted again after the student chooses to continue. This is limited to the confirmation path, all-usable PDFs use one extraction, and caching would add server-side retained state and cleanup complexity. The confirmed page numbers are checked against the second extraction before any resources are returned.
