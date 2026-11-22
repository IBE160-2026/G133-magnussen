# AI Study Buddy development iterations

Summarised on 16 November 2026 from the design work and application tests.

| First attempt | Feedback or observation | Change |
| --- | --- | --- |
| Five visual concepts followed by four blue variants | The calm, blue direction was preferred. | We chose **Side by Side** to let students read a study resource while checking the PDF source. |
| The summary displayed raw text and combined two columns from an anatomy slide. | Muscle names lost their group labels, and the resulting text was hard to follow. | We organised the summary into explanatory topics and kept the mobilising and stabilising muscles in separate groups in the test example. |
| Flashcards asked which column a muscle name appeared in. | Students needed the slide to answer, and the question tested little subject knowledge. | We rewrote the cards as standalone questions and placed the page link with the answer. |
| Quiz results showed a basic answer key, and retries kept the same order. | The student wanted clear feedback and a new set after a perfect score. | Results label correct, incorrect, and unanswered questions. Retries shuffle the same set. A perfect first round unlocks a new set. |
| A source link could open the full PDF in the panel. | During the submission test, the browser displayed the entire document. | The panel now displays the selected slide. We retested the fix from a clean checkout of `main`. |

See the [source-viewing fix](https://github.com/IBE160-2026/G133-magnussen/pull/2) and [submission test log](../../../app/TESTLOGG.md).

## Human review of AI-assisted work

| Review decision | Evidence |
| --- | --- |
| The BMAD coach initially left the PDF limits undecided. The user approved 50 pages and 20 MB for text-based PDFs and required a provider check. The PRD records the limits and the architecture records the remaining live validation. | [BMAD PRD session log](../prds/prd-Programmering%20med%20AI%202026-2026-11-04/.memlog.md), [architecture](../architecture/technology.md) |
| The first UX draft proposed teal and system typography for the requested calm academic style. The user compared five concepts and four blue variants, then selected the blue side-by-side layout for checking sources while studying. | [BMAD UX session log](../ux-designs/ux-AI-Study-Buddy-2026-11-14/.memlog.md), [design decision](../ux-designs/ux-AI-Study-Buddy-2026-11-14/designvalg.md) |
| Manual testing caught the full PDF opening in the source panel. The implementation was revised to render only the selected page, and the browser retest confirmed page 3. | [PR #2](https://github.com/IBE160-2026/G133-magnussen/pull/2), [submission test log](../../../app/TESTLOGG.md) |

The session logs record decisions and assumptions as summaries of the design and planning sessions.

## Web deployment and demo feedback — 17 November 2026

Recorded during deployment and user testing. User feedback below is translated
from the project conversation.

| Observation or user feedback | Decision and change | Evidence |
| --- | --- | --- |
| The local address stopped working when the server stopped. The user expected the app to open on other computers. | The course instructions established Vercel as the supported host. We moved PDF text extraction and source-page rendering into the browser with PDF.js and added a Vercel API for study resources. The user deployed the project from GitHub. | [PR #15](https://github.com/IBE160-2026/G133-magnussen/pull/15), commit `2cf5b13`. |
| The deployed app reported an unexpected JSON token. | Investigation found that the build script failed to inject the browser PDF module because it matched a different script tag. The app therefore called the local-server route. We corrected the injection, added a build check, and added a Norwegian message for non-JSON responses. The published HTML was checked for the module import and activation. The user then confirmed that the app worked. | [Fix commit](https://github.com/IBE160-2026/G133-magnussen/commit/70bdd21), [test log](../../../app/TESTLOGG.md). |
| The user found that there were too few resources in the working demo. | We expanded the three-page demo from three summary sections, three concepts, three flashcards and four quiz questions to six summary sections, ten concepts, ten flashcards and twenty questions in two rounds. Source excerpts were checked against their cited PDF pages and the build passed. | [Expansion commit](https://github.com/IBE160-2026/G133-magnussen/commit/7126461), [demo resources](../../../app/demo-ressurser.json). |
| After publication, the user reported that the expanded demo worked better. | A request to the deployed API confirmed the new resource counts. This records user feedback on the expanded demo. Full browser checks of both quiz rounds and live generation remain pending. | [Published app](https://g133-magnussen.vercel.app/), [test log](../../../app/TESTLOGG.md). |

The browser retains the PDF during the active session. Live generation sends
extracted text to the API and requires Gemini and durable Redis usage counters.
The published keyless demo uses stored resources. Gemini configuration,
Redis integration tests and verification of the per-request cost bound remain
open.

## Live generation feedback — 18 November 2026

The deployed app extracted text from the user's 15-page PDF, but live
generation failed. Vercel recorded a 60.3-second response and external calls
to both Upstash and Gemini. Google AI Studio subsequently showed two
`503 ServiceUnavailable` errors, and the user confirmed use of the Free Tier.
The available screenshots do not map each Google error to an individual
Vercel invocation.

Commit `ef6390f` raised the Gemini request timeout from 60 to 100 seconds
within Vercel's 120-second function limit and hid Quiz navigation when no
questions were returned.
Simulated tests and the build passed according to the implementation report.
A later attempt with the three-page demo was blocked by the application's
cost reservation ceiling. The configured 2 USD reservation per attempt
exhausted the internal 4 USD allowance before the retry. The available
screenshots do not show the exact prior Redis reservation history. These
reservations do not establish actual provider charges.

This user test exposed provider availability and reservation-accounting
issues. Successful live generation and source checking remain open. The
keyless demo is still available. See the dated evidence and remaining checks
in the [test log](../../../app/TESTLOGG.md).

## Token counting fixed; live demo still blocked — 18 November 2026

PR #23 added the required model field to the token-count request. After
deployment, the user retried the three-page demo with Gemini enabled.
The app reported usable text on all three pages and seven session requests
remaining. It then displayed the specific Norwegian service-unavailable
message that the handler associates with a 503 generation response.
No generated study resources or empty Quiz button were visible.

The earlier fixed budget reservations were archived and the active counter
was corrected before the retest. The total configured ceiling stayed at
4 USD. These are application accounting values; the test did not establish
actual Google charges.

This retest supports that token counting and reservation progressed past
the earlier preparation error. Successful live generation still needs
verification. See the [dated test log](../../../app/TESTLOGG.md) for the
observations, code-based inference and evidence limits.

## Successful live demo after diagnostics — 18 November 2026

Following the token-count correction, token-based budget reservations,
model configuration and improved failure logging, the user ran the
three-page demo with Gemini enabled. Production had been configured for
Gemini 3.6 Flash. A screenshot shows generated Norwegian summary content,
source controls, all four resource-type controls and seven session
requests remaining.

After being asked to check source viewing, concepts, flashcards and quiz
feedback, the user confirmed that the workflow worked. The
[test log](../../../app/TESTLOGG.md) identifies the screenshot evidence,
the user-reported follow-up and the remaining checks.

The first successful live demo follows several failed attempts. The
available evidence does not isolate a single change as the cause of
success. Live testing with the user's own PDF and representative supported
input sizes remains open.

## Reported Gemini 3.6 Flash HTTP 503 — 19 November 2026

The project owner reported another HTTP 503 from Gemini 3.6 Flash. The
operation and provider response details were not independently captured.
This report motivated bounded retry handling in the Vercel study API.

The API now allows one retry per request after a one-second delay. Every
generation attempt first obtains a separate atomic cost reservation and
consumes one of the eight session requests. The retry stops when either
limit or the Vercel execution budget prevents it. Automated verification
uses simulated Gemini and Redis responses only; this implementation did
not make a live provider request. See the [test log](../../../app/TESTLOGG.md)
for the test scope and evidence limits.

## User-reported `Muskler i kroppen.pdf` test after PR #27 — 19 November 2026

After PR #27 was merged, the project owner tested the application with
`Muskler i kroppen.pdf`. The owner reported 13 of 15 pages with usable
extracted text and little text on pages 7 and 15. The application showed
that Gemini remained unavailable after one automatic retry and that six
session requests remained.

This is a user-reported application test, not evidence of successful live
generation. Generation of study resources from this PDF remains
unverified. No new Gemini request was made during this documentation update;
see the [test log](../../../app/TESTLOGG.md).

## User-reported minimal Gemini API control request — 19 November 2026

The project owner reported one minimal `generateContent` request from a
local Terminal using `gemini-3.8-flash`. The request contained only
`Svar med OK`, without a PDF, system instruction, response schema, or retry.
Google returned HTTP 503, error code `503`, status `UNAVAILABLE`.

The owner reported that the request used the same API key as Vercel, but
authentication equivalence was not independently verified. The model had
previously responded in AI Studio; whether that test used the same
authentication is unknown. This single control request demonstrates a 503
outside the application's request path and without PDF input, but it does
not identify the root cause. The cause remains unknown. No new API call was
made for this documentation update, and no secret or raw error message is
recorded. See the [test log](../../../app/TESTLOGG.md).

## User-confirmed demo and PDF checks; Google forum response — 19–20 November 2026

On 19 November, the project owner confirmed that the demo works without
Gemini: summary, key concepts, flashcards and quiz were available and
working. In the owner’s test with `Muskler i kroppen.pdf`, the displayed PDF
pages were correct and 13 of 15 pages had extracted text. Viewing the
extracted raw text was not confirmed. Live resource generation from the
owner’s PDF remained blocked by HTTP 503.

On 20 November, a Google forum responder said 503 errors result from
services being temporarily overloaded and pointed to the
[Gemini API 503 guidance](https://discuss.ai.google.dev/t/handling-429-503-errors-from-the-gemini-api/124640#p-234342-h-503-errors-4)
for backoff/retry suggestions. See the
[response in the Gemini 3.8 Flash thread](https://discuss.ai.google.dev/t/gemini-3-8-flash-returns-503-unavailable-even-for-a-minimal-rest-request/202644/2).
This is a general explanation and does not independently confirm the cause
of the owner’s specific request. The app already allows one automatic retry
after a one-second delay; the PDF generation still encountered 503 after
that retry. No new API calls were made for this documentation update.
Further live generation remains unverified.

## Groq provider and AI-generated study resources — 21–22 November 2026

Gemini repeatedly returned HTTP 503 errors during live generation, including a minimal API request without PDF content. We therefore tested Groq as an alternative AI provider rather than continuing to rely on Gemini.

The implementation added support for Groq using the `openai/gpt-oss-120b` model while keeping Gemini as the default provider. This allowed us to compare providers without removing the existing Gemini implementation.

The change was developed on the `feat/groq-provider` branch and documented in [PR #33](https://github.com/IBE160-2026/G133-magnussen/pull/33).

During testing, we reviewed the study resources generated by Groq. Some flashcards initially used short topic labels instead of complete questions, making them less useful for self-testing. We revised the AI instructions to request standalone Norwegian questions ending with a question mark.

We also improved the quiz instructions to request 8–12 multiple-choice questions and require source references. This demonstrates that we evaluated the AI output and adjusted the prompts rather than accepting the first result unchanged.

The Groq implementation was tested locally with a PDF. The project owner confirmed that summaries, key concepts, flashcards and quizzes worked, including source references.

The automated test suite was run using `npm test` on 22 November 2026. All 48 tests passed, with zero failures. The tests use mocked AI provider responses and therefore do not require live API calls.

The Groq version was also tested in Vercel Preview. PR #33 passed both GitHub checks and had no merge conflicts. The pull request remained open, and the changes were not merged into `main` at the time of this documentation.
