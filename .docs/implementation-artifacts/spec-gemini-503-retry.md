---
title: 'Retry transient Gemini 503 responses safely'
type: 'feature'
created: '2026-11-19'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'cf1f41eba0776faf3b2dad42c26dc29d320b7c68'
context:
  - 'app/README.md'
  - 'app/TESTLOGG.md'
  - '.docs/planning-artifacts/forarbeid/iterasjoner.md'
  - '.docs/implementation-artifacts/spec-gemini-token-cost-reservation.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Gemini can return a transient HTTP 503 during token counting or generation, causing a study request to fail even when a short retry could succeed. Retrying generation without accounting would bypass the per-session limit, cost ceiling, or Vercel's 120-second execution limit.

**Approach:** Allow at most one automatic retry across Gemini operations in a user request, after a short delay. Before every `generateContent` call, atomically reserve its full calculated cost and one of the session's eight requests. Skip retry when the request allowance, budget, or execution deadline prevents it. Return clear Norwegian status text.

**Always:** Apply the retry and reservation guarantee to the Vercel `/api/study` path only; leave `app/server.mjs` unchanged. Reuse the prepared payload and existing Redis keys, Lua accounting, total budget, and historical reservations. Keep a safety margin inside Vercel's configured 120-second function limit. Test only with simulated provider and Redis responses. Record the reported 503 as user-observed, not as a new live test.

**Never:** Make real Gemini calls, reset or refund Redis history, retry more than once, or send a generation request without a successful reservation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Transient count failure | `countTokens` returns 503; retry succeeds | Wait briefly and repeat token counting once, then continue normal reservation and generation | No generation or cost reservation before a valid count |
| Transient generation failure | First generation returns 503; retry reservation succeeds; second generation succeeds | Wait briefly, reserve again atomically, call generation once more, return resources and Norwegian recovery status | Both generation calls have separate reservations |
| Retry already used | `countTokens` retry was used; generation later returns 503 | Do not make another Gemini call | Explain in Norwegian that the automatic retry has already been used |
| Request cap or budget blocks retry | First generation returns 503; second reservation is rejected | Do not make a second generation call; preserve existing accounting and explain the block in Norwegian | Show remaining requests when available |
| Insufficient execution time | First generation returns 503 too near the function deadline | Skip retry reservation/call when preflight says the retry cannot fit; report the deadline limit in Norwegian | Keep the first call's reservation |
| Retry still fails | First generation returns 503; one retry is permitted but also fails | Stop after the retry and return Norwegian temporary-unavailability status | Safe error logging only |
| Non-503 generation failure | Generation returns another status or transport failure | Do not retry; return the existing safe failure behavior | No extra reservation |

</frozen-after-approval>

## Code Map

- `api/study.mjs` — Vercel handler, atomic `reserve()` Lua script, request count and budget gate, current single `generateSummary()` call and Norwegian failure responses. Reserve again before a retry generation; do not change Redis keys or the eight-request rule.
- `app/gemini-summary.mjs` — `generateSummary()` currently uses a fixed 100-second timeout. Allow the handler to set a smaller per-attempt timeout based on remaining function time; keep the default for other callers.
- `vercel.json` — sets `api/study.mjs` `maxDuration` to 120 seconds.
- `tests/api-study.test.mjs` — injects simulated Gemini and Redis responses; extend it for retry success, accounting gates, deadline, retry exhaustion, one-retry maximum, and redacted user-facing status.
- `app/gemini-summary.test.mjs` — verifies generated request shape and timeout; cover the configurable timeout.
- `app/index.html` — `showPages()` displays API `summaryStatus` to users. Reuse this surface for Norwegian retry outcome messages; no live status channel exists while the API request is pending.
- `app/README.md`, `app/TESTLOGG.md`, `.docs/planning-artifacts/forarbeid/iterasjoner.md` — English behavior documentation and dated evidence record.
- Prior evidence: `app/TESTLOGG.md` records an earlier user-reported 503 path. The current request reports another Gemini 3.6 Flash 503 on 19 November 2026; no live call is authorized.

## Tasks & Acceptance

**Execution:**
- [x] `api/study.mjs` — add one total bounded retry for transient Gemini 503 across count and generation, with a second atomic reservation before retry generation and preflight/deadline guards.
- [x] `app/gemini-summary.mjs` and `app/gemini-summary.test.mjs` — support and test a bounded per-attempt timeout without changing the existing default.
- [x] `tests/api-study.test.mjs` — simulate success, repeated 503, non-503, request-cap/budget rejection, deadline rejection, call ordering, and one-retry maximum.
- [x] `app/README.md` — document retry limits, reservations, and execution-time safeguards in English.
- [x] `app/TESTLOGG.md` and `.docs/planning-artifacts/forarbeid/iterasjoner.md` — record the 19 November Gemini 3.6 Flash 503 as reported by the user, distinguish it from simulated verification, and state that no live call was made.

**Acceptance Criteria:**
- Given a first `generateContent` 503, when the request has time, budget, and request allowance, then exactly one delayed retry is made after a second atomic reservation and the user receives Norwegian recovery or failure status.
- Given a first `countTokens` 503, when enough function time remains, then exactly one delayed count retry occurs; generation remains blocked until a valid count and reservation are obtained.
- Given no remaining request allowance, insufficient budget, or inadequate Vercel time, when the first generation returns 503, then no retry generation is sent and the user receives a Norwegian reason.
- Given a non-503 failure or a second 503, when generation ends, then no further retry occurs.
- Given the automated tests run, then all Gemini and Redis responses are simulated and no live or paid provider call occurs.

## Implementation Notes

Use a one-second retry delay, reserve ten seconds of the 120-second Vercel limit as a safety margin, and require at least five seconds for a retry generation. A deadline-aware generation timeout must never exceed the existing 100-second maximum. Every successful reservation remains historical even if that reserved provider attempt later fails.

## Spec Change Log

## Review Triage Log

- `low / patch` — The retry-reservation error path already returns without sending another Gemini generation, but tests did not verify failed Redis reservations. Added a simulated second-reservation HTTP failure test asserting fail-closed behavior and safe logging.
- `low / patch` — Existing deadline coverage stopped before the post-reservation checks. Added simulated initial and retry reservation-delay cases asserting generation is not sent when less than five seconds remain.

## Verification

**Commands:**
- `npm test` — all simulated Gemini and Redis tests pass.
- `npm run build` — production web build succeeds.
- `node --check api/study.mjs && node --check app/gemini-summary.mjs` — syntax checks pass.
- `git diff --check` — no whitespace errors.

**Manual checks:**
- Confirm each `generateContent` invocation is preceded by its own atomic reservation, the second reservation preserves the existing budget/session keys, and no retry can exceed one.
- Confirm documentation labels the 19 November 503 as user-reported and no live call was made.

The Vercel handler now shares a single retry allowance between `countTokens` and `generateContent`. A retried generation uses the same prepared payload and obtains a second reservation before the provider call; the reservation's remaining-request count is returned. The handler uses a 1-second delay, 10-second safety margin, 10-second Redis timeout, 5-second minimum generation window, and a per-attempt generation timeout capped at 100 seconds. Local `app/server.mjs` remains unchanged as decided during clarification.

English README, test log, and development iteration notes document the retry behavior and the owner-reported Gemini 3.6 Flash 503 from 19 November 2026. Verification: 32 simulated tests pass, build and syntax checks pass, and `git diff --check` passes. No live Gemini calls were made. A first build attempt failed because the fresh worktree lacked `node_modules`; `npm ci` restored lockfile dependencies and the subsequent build passed.
