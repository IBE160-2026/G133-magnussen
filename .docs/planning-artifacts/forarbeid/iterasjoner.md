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
