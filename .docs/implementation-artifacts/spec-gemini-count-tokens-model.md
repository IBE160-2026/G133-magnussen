---
title: 'Fix Gemini countTokens request model'
type: 'bugfix'
created: '2026-11-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
baseline_commit: '15948a559a3c2ce62abd0965c409c78fc52d6fb6'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Gemini token counting fails because its embedded `GenerateContentRequest` omits the required model resource name. Count failures are also returned without diagnostic logging.

**Approach:** Include `model: "models/" + prepared.model` in `generateContentRequest`, preserving the complete generation payload so instructions and response schema remain counted. Log only the HTTP status and allowlisted error category, and verify the exact request structure and safe diagnostics with simulated responses.

</frozen-after-approval>

## Implementation Notes

- Google's v1beta REST discovery schema confirms `CountTokensRequest.generateContentRequest` accepts `GenerateContentRequest`, whose required model is `models/{model}`. The containing request description confirms this counts system instructions and other model steering information. Source: https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta
- Added the model resource name to the embedded count request without changing the generation payload. HTTP failures retain their status; count errors log only a bounded status value and the existing allowlisted category.
- Updated simulated request-shape, HTTP error, malformed JSON, timeout, fail-closed, and safe-logging assertions in `app/gemini-summary.test.mjs` and `tests/api-study.test.mjs`; documented the verification in `app/TESTLOGG.md`.
- Verification passed: `npm test` (18 tests), `npm run build`, JavaScript syntax checks, and `git diff --check`. All Gemini and Redis responses were simulated.

## Review Triage Log

- low — Patched: Added simulated malformed-JSON count coverage to verify it fails closed and logs only status/category.
- low — Patched: Added simulated timeout coverage to verify the no-response status fallback and allowlisted category are logged without sensitive data.
- low — Patched: Extended invalid-count assertions to verify API key and PDF text remain absent from logs.
