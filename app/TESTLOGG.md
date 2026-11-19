# AI Study Buddy submission test

| Test detail | Value |
| --- | --- |
| Date | 15 November 2026 |
| Git revision | `b870e9f` on `main` |
| Setup | Clean checkout on macOS, with the local Node server on port 4184 |
| Test file | `app/demo-anatomi-ai-study-buddy.pdf` |
| Gemini | Demo without an API key |

## Manual browser test

| Workflow | Observed result |
| --- | --- |
| Select the demo PDF, select **Les PDF**, and open **Side 3** | The source panel displayed only page 3. |
| Open **Flashcards** and select **Vis svar** | The answer and its source link appeared. |
| Submit **Quiz** with incorrect or unanswered questions and retry | The same questions appeared in a different order. |
| Answer every question correctly in the first round and select **Start neste quiz** | The next round displayed different questions. |

Source viewing was retested after [PR #2](https://github.com/IBE160-2026/G133-magnussen/pull/2) was merged. The fix displays an image of the selected page in the source panel and offers the complete PDF in a separate tab.

## Local HTTP checks, 17 November 2026

Run from a clean checkout of `261dffe` on macOS with Node.js 24.21.0 and no Gemini API key. The server was started using the README command with port 4186.

| Request | Observed result |
| --- | --- |
| `GET /` | HTTP 200. |
| `POST /pdf` with the bundled demo PDF | HTTP 200. The response included summaries, key concepts, flashcards, and quiz questions. |
| `POST /pdf-page/3` with the bundled demo PDF | HTTP 200. The response started with a PNG signature. The earlier browser test confirmed the page content. |
| `POST /pdf` with non-PDF bytes | HTTP 400 with “Velg en gyldig PDF.” |
| `POST /pdf` with the demo PDF padded beyond 20 MB | HTTP 400 with “PDF-en kan være maks 20 MB.” |

These checks exercised the local server. Browser interaction and live Gemini generation were outside this run.

## Clean checkout check, 17 November 2026

Started the server from a fresh checkout of `dc29303` on macOS with Node.js 24.21.0 using `node app/server.mjs`. The local homepage returned HTTP 200. Submitting the bundled demo PDF with the local origin and Gemini disabled returned three summary items, three key concepts, three flashcards and four quiz questions. The page 3 endpoint returned a PNG measuring 1131 × 1599 pixels.

This run covered the local HTTP flow. The manual browser test above records the interface behaviour.

## Vercel adaptation checks, 17 November 2026

The Vercel build uses browser-side PDF.js and a Node API function. The
production build and JavaScript syntax checks passed. PDF.js extracted text
from all three demo pages and its loading task cleaned up successfully. Direct handler checks
verified the keyless demo returns all four resource types, foreign origins
are rejected, invalid page numbering is rejected, and missing live
configuration returns a Norwegian explanation.

The Vercel API reserves session requests and cost atomically through Redis.
The earlier local prototype's mocked tests verified request counting and
persistent reservations. The Vercel Redis path still requires integration
testing with the configured service. A Vercel deployment, browser PDF
rendering, representative PDF generation and model-cost verification remain
pending.

## Expanded demo resources, 17 November 2026

The three-page demo now has six summary sections, ten key concepts, ten
flashcards and twenty quiz questions, presented as two rounds of ten.
Every concept, flashcard and quiz question includes an excerpt checked
against the extracted text of its cited demo page. The demo PDF itself is
unchanged. Question options and answer indices passed structural checks;
the Vercel build passed. Browser testing of the expanded rounds remains pending.

## Published demo checks and user feedback, 17 November 2026

After the browser-module fix, the production HTML at
https://g133-magnussen.vercel.app/ included the PDF.js adapter import and
activation. The user confirmed the demo worked, then requested more study
resources. Following the expansion, a production API request returned six
summary sections, ten concepts, ten flashcards and twenty quiz questions.
The user reported that this version worked better.

These observations cover the published API counts and user-reported demo
behaviour. Detailed browser verification of both quiz rounds, Redis integration
and live generation remain pending.

## Live Gemini Free Tier test, 18 November 2026

Recorded from the user's browser screenshots of the deployed application,
Vercel request details and Google AI Studio usage. The user confirmed that
the Google project uses the Free Tier. The screenshots are not included in
this repository; this entry records the reported observations.

| Check | Observation |
| --- | --- |
| Deployment and configuration | The Vercel Production environment shown in the screenshots used Gemini 3.8 Flash; the repository default is Gemini 3.5 Flash. Redis usage reservations were enabled. The configured total reservation budget was 4,000,000 micro-US dollars, with 2,000,000 reserved per provider attempt. |
| User PDF | The user selected `Muskler i kroppen.pdf` with Gemini enabled. Browser extraction found usable text on 13 of 15 pages and reported low-text pages 7 and 15. |
| First reported generation failure | The app displayed a Norwegian generation-failure message and showed seven session requests remaining. Vercel showed requests to Upstash and the Gemini API, with a total response duration of 60.3 seconds. This was consistent with the then-configured 60-second client timeout; the invocation view alone did not identify the provider failure. |
| Provider evidence | Google AI Studio's last-day usage view displayed two errors labelled `503 ServiceUnavailable` for the project. The screenshots did not establish a one-to-one mapping between each error and a specific Vercel invocation. |
| Follow-up change | Commit `ef6390f` raised the Gemini timeout from 60 to 100 seconds within Vercel's 120-second function limit, added restricted error logging, and hid Quiz when no questions exist. The Copilot report recorded six passing tests, browser checks with simulated responses, and a passing build. A later main-branch and published quiz-visibility check was reported; its specific result is not present in these screenshots. |
| Demo PDF retry | The user selected the three-page demo with Gemini enabled. Extraction found text on all three pages. The app displayed “Prosjektets kostnadstak er nådd. KI-generering er utilgjengelig.” This attempt was blocked by the budget check before a further Gemini call. |

The fixed reservation was overly conservative for this test and exhausted
the internal application allowance. The configured 2,000,000 micro-USD
reservation against a 4,000,000 micro-USD ceiling implies that two such
reservations fill the allowance, but the screenshots do not show the exact
prior Redis spend or reservation count. Reserved amounts are accounting
bounds, not evidence of actual Google charges. No successful live resource
generation was established in this test. Raising the timeout does not by
itself establish that provider 503 failures are resolved.

Remaining work includes improving reservation accounting for the confirmed
Free Tier, checking current model availability and quotas, and retesting live
generation and source references. The request limit and overall spending
ceiling must remain enforced. The stored-resource demo remains available with
Gemini disabled.

## Simulated token reservation checks, 18 November 2026

The automated suite uses mocked provider and Redis responses only. No real
Gemini or paid provider endpoint was contacted. The tests verify that the exact
generation payload is sent to a mocked count-tokens endpoint, the calculated
micro-USD ceiling is passed to the existing Redis reservation keys in an
atomic reservation call before generation, and generation reuses the same
prepared payload. They cover supported aliases, unsupported model fail-close
behaviour, invalid and failed count responses, Redis budget contention,
eight-request handling, HTTP 503 handling, and safe logging.

## Simulated Gemini failure logging, 18 November 2026

Google's v1beta REST discovery document confirms that `countTokens` accepts a
`generateContentRequest` and that its `model` field is required in the
`models/{model}` resource-name format. Simulated provider failures verify that
both `countTokens` and `generateContent` logs include only the model identifier,
operation, HTTP status, numeric Google error code when available, and an
allowlisted error category. Tests also cover malformed JSON, timeouts, safe
fallback values, and suppression of provider messages, response bodies, API
keys, PDF text, and generated answers. No real Gemini request was made.

## Live demo retest after token-count fix, 18 November 2026

Evidence is the user's screenshot of the production app after PR #23 was
merged. The selected file was `demo-anatomi-ai-study-buddy.pdf`, with
Gemini enabled. The Google project had previously been confirmed by the
user as Free Tier.

Before this retest, Redis showed 4,000,000 micro-US dollars in the budget
reservation counter. The user archived this value under
`study:budget:ai-study-buddy-2026-11:archive-2026-11-18` and reset the active
counter to zero. Both commands returned OK according to the user. This was
an accounting correction for the earlier fixed reservations, not a
measurement of actual provider charges. The configured ceiling remained
4,000,000 micro-US dollars.

| Check | Observation |
| --- | --- |
| PDF extraction | All three demo pages had sufficient extractable text. |
| Session allowance | The app displayed seven requests remaining. |
| Live generation | The app displayed “Tjenesten er midlertidig utilgjengelig. Prøv igjen senere. Du kan fortsatt åpne PDF-sidene.” |
| Result controls | The screenshot showed PDF page buttons and no Quiz button. No generated study resources were shown. |

The production handler uses this specific message when generation throws
an error with status 503. Code inspection places token counting and the
atomic budget reservation before the generation call. Together with the
displayed remaining-request count, this supports that preparation and
reservation completed and the provider generation returned 503.
This retest did not independently inspect Google's response body, measure
the reserved amount, or verify the contents of rendered source pages.

Live generation remains unverified as a successful end-to-end workflow.
A later test must check all four resource types and their cited pages.
The stored-resource demo remains available with Gemini disabled.

## Successful live demo test, 18 November 2026

Tested by the project owner at https://g133-magnussen.vercel.app/ using
`demo-anatomi-ai-study-buddy.pdf` with “Lag studieressurser med Gemini”
enabled. The latest main revision at the time of recording was `3603b47`
(PR #25). The configured production model was Gemini 3.6 Flash, following
the model change and redeployment confirmed by the user. The Google
project was reported as Free Tier.

The supplied screenshot shows three of three pages with sufficient text,
seven session requests remaining, a populated Norwegian summary with a
source excerpt and page button, and controls for summary, concepts,
flashcards and quiz. This records a successful live-generation result
after the earlier 503 failures.

The user was asked to open the cited page, inspect concepts and a flashcard
source excerpt, and submit a quiz answer to inspect feedback. The user then
confirmed that it worked. This follow-up is user-reported verification;
screenshots of each individual interaction, item counts and a complete
source-by-source review were not supplied.

The result establishes a working live demo for this attempt. It does not
establish that earlier provider availability problems are permanently
resolved. A successful live run with the user's own PDF, representative
maximum-size input and complete source checks remain to be recorded.

## Reported Gemini 3.6 Flash HTTP 503 and simulated retry checks, 19 November 2026

The project owner reported another HTTP 503 from Gemini 3.6 Flash on this
date. This is a user-provided observation; the exact operation, request ID
and provider response body were not independently recorded. No live Gemini
request was made during the retry implementation.

Simulated tests cover one retry at most across token counting and generation,
the one-second delay, a second atomic reservation before retry generation,
the eight-request and total-budget gates, insufficient Vercel execution time,
repeated 503 responses, and Norwegian user-facing status. Each generation
attempt uses the same prepared request and a separate cost reservation. All
Gemini and Redis responses were simulated.

## User-reported test with `Muskler i kroppen.pdf` after PR #27, 19 November 2026

After PR #27 was merged, the project owner tested the application with
`Muskler i kroppen.pdf`. The owner reported that 13 of 15 pages had usable
extracted text; pages 7 and 15 contained little text. The application
reported that Gemini was still unavailable after one automatic retry and
that six session requests remained.

This records the user's test and the application's displayed status only.
Successful live generation of study resources from this PDF remains
unverified. No new Gemini request was made while recording this result.

## User-reported minimal Gemini API control request, 19 November 2026

The project owner reported one minimal `generateContent` control request
from a local Terminal using model `gemini-3.8-flash`. The request contained
only the text `Svar med OK`, with no PDF, system instruction, response
schema, or retry. It returned HTTP 503 with Google's error code `503` and
status `UNAVAILABLE`.

The owner reported using the same API key as Vercel, but equivalence of the
authentication used by both environments was not independently verified.
The same model had previously responded in AI Studio; whether that test
used the same authentication is also unverified. This control request shows
that a 503 was observed without the application code or a PDF in this
request, but does not establish the root cause. The root cause remains
unknown. No new API request was made while recording this report; no key or
raw provider error message is recorded here.
