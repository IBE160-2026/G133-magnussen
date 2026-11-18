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

## Simulated countTokens request schema check, 18 November 2026

Google's v1beta REST discovery document confirms that `countTokens` accepts a
`generateContentRequest` and that its `model` field is required in the
`models/{model}` resource-name format. A simulated HTTP 500 test verifies that
the count request includes this model, the system instruction, contents, and
response schema; it also checks that failure logs contain only the HTTP status
and allowlisted error category. Simulated malformed JSON and a timeout also
verify fail-closed behavior, status fallback, and redacted logging. The provider
response body, API key, and PDF text are not logged. No real Gemini request was
made.
