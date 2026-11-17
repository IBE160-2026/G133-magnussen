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
