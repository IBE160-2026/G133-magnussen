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
