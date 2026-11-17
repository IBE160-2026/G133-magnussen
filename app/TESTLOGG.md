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
