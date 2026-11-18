---
title: 'Gemini token-based cost reservations'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'a7b02347e8efdf5a578e96bc8d1ce67935f9fe18'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The API reserves a fixed, oversized amount per Gemini request and does not derive the ceiling from the complete prompt, model pricing, and maximum output. This can exhaust the total budget prematurely and does not provide a useful message when Gemini returns HTTP 503.

**Approach:** Count tokens on the full generation request, compute a conservative maximum charge using verified model prices and the configured output cap, then atomically reserve that amount before generation. Preserve existing Redis budget accounting and show a clear Norwegian service-unavailable message.

## Boundaries & Constraints

**Always:** Keep the existing Redis keys, total budget, session request limit, and historical reservations. Count the exact prompt and schema used for generation. Reserve before generation. Use only simulated provider responses in tests; do not make real Gemini calls. Write documentation in English.

**Never:** Reset or migrate Redis counters, reserve before successful token counting, log API keys or PDF text, change the product brief, or accept an unpriced model configuration for live generation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Supported model and prompt | Full request with system instructions, contents, schema, and 8,192 output-token cap; valid count response | Count the full request, calculate a rounded-up maximum cost, atomically reserve it, then generate with the same payload | No generation before successful reservation |
| Unsupported model or invalid count | Unpriced model, missing/invalid token count, or count endpoint failure | Do not reserve or generate | Return an explicit safe error; do not expose provider details |
| Budget contention | Concurrent reservations against the existing Redis budget | Lua script admits only requests whose calculated ceiling fits; historical spend remains included | Budget-exhausted request does not generate |
| Gemini unavailable | Simulated generation response with HTTP 503 | Keep the reservation and show a clear Norwegian temporary-unavailability message while retaining PDF access | Do not expose provider response body, API key, or PDF text |

</frozen-after-approval>

## Code Map

- `api/study.mjs` — validates pages and currently reserves a fixed environment-configured amount in an atomic Lua script before calling Gemini. Preserve its Redis key names, request cap, and budget counter; pass the calculated amount into the script.
- `app/gemini-summary.mjs` — builds the system instruction, content, output schema, 8,192-token cap, model selection, and generation request. Reuse one prepared payload for token counting and generation.
- `tests/api-study.test.mjs` and `app/gemini-summary.test.mjs` — Node test-runner coverage; inject simulated fetch responses and restore global state.
- `app/README.md` and `app/.env.example` — English runtime configuration and deployment instructions; remove the obsolete per-request fixed-cost setting and document the verified pricing basis and supported models.
- `app/TESTLOGG.md` — English test record; record only simulated provider checks and explicitly state that no live Gemini call was made.

## Tasks & Acceptance

**Execution:**
- [x] `app/gemini-summary.mjs` — expose one prepared generation payload and count its complete input before reservation, reusing that payload for generation.
- [x] `app/gemini-cost.mjs` — add a pure, tested conservative cost calculation for the verified Flash model IDs, the 8,192-token output cap, and integer micro-USD rounding.
- [x] `api/study.mjs` — pass the calculated amount to the existing atomic reservation, preserve existing budget history, fail closed for unsupported models/count errors, and safely handle simulated Gemini 503 responses.
- [x] `tests/api-study.test.mjs` and `app/gemini-summary.test.mjs` — cover complete payload counting, model pricing and rounding, reserve-before-generate ordering, budget behavior, errors, 503 messaging, and ensure every provider request is mocked.
- [x] `app/README.md`, `app/.env.example`, and `app/TESTLOGG.md` — document the model/pricing assumptions, configuration changes, user-facing behavior, and simulated verification in English.

**Acceptance Criteria:**
- Given a supported model and valid input, when the API handles an AI request, then it counts the full exact generation payload and atomically reserves the computed maximum before generation.
- Given concurrent requests or historical Redis spend, when reservations run, then the existing total budget and request limit remain enforced without resetting or replacing counters.
- Given an unsupported model, invalid token count, or count failure, when the request is processed, then no cost is reserved and no generation call is made.
- Given a simulated Gemini HTTP 503, when the request completes, then the user sees a clear Norwegian temporary-unavailability message and safe logs contain neither key nor PDF text.
- Given the automated test suite runs, then all Gemini and Redis network calls are simulated and no real or paid Gemini call occurs.

## Design Notes

Google's current pricing page lists Gemini 3.6 Flash and 3.8 Flash at $0.75 input / $3.75 output per million tokens through 2026-12-31, then $1.50 / $7.50 from 2027-01-01. Use the higher published scheduled rates as the conservative bound. The repository's `gemini-3.5-flash` default is documented as automatically routed to 3.6 Flash; allow only these verified model IDs/alias and fail closed for other overrides. The bound is input tokens at the full input rate plus all 8,192 output tokens at the full output rate, rounded up to whole micro-USD. Do not rely on free-tier pricing or cache discounts.

## Verification

**Commands:**
- `npm test` — all simulated API and generation tests pass.
- `npm run build` — production web build succeeds.
- `node --check api/study.mjs && node --check app/gemini-summary.mjs && node --check app/gemini-cost.mjs` — syntax checks pass.

**Manual checks:**
- Inspect the diff to confirm Redis keys and existing total-budget history are unchanged and the product brief is untouched.
- Confirm every test intercepts provider and Redis requests and no actual Gemini endpoint is contacted.

## Implementation Notes
