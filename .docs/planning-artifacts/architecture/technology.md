# AI Study Buddy Architecture

*Written on 16 November 2026, based on the delivered application code and setup guide.*

## Technology and code structure

AI Study Buddy runs locally on Node.js 24. The browser interface uses HTML, CSS, and JavaScript, and the server uses Node's built-in HTTP module. The application has no npm dependencies. PDFKit handles text extraction and page rendering, which makes this implementation macOS-specific. The [setup guide](../../../app/README.md) records Next.js and PDF.js as earlier choices.

| File | Responsibility |
| --- | --- |
| [`app/index.html`](../../../app/index.html) | Handles PDF selection, study resources, answers, and the source panel. |
| [`app/server.mjs`](../../../app/server.mjs) | Receives PDFs on the local server and selects the demo or Gemini workflow. |
| [`app/les-pdf.js`](../../../app/les-pdf.js) and [`app/grupper.js`](../../../app/grupper.js) | Extract text page by page. The grouping script preserves column structure for a specific slide in the original anatomy test file. |
| [`app/render-pdf-side.js`](../../../app/render-pdf-side.js) | Renders a selected PDF page as a PNG for the source panel. |
| [`app/gemini-summary.mjs`](../../../app/gemini-summary.mjs) | Requests all four study resource types and checks source excerpts against the extracted text of the cited page. |

## Data flow and storage

1. **Read a PDF.** When the student selects **Les PDF**, the browser sends the file to `POST /pdf` on the loopback server. The server writes a temporary file for PDFKit to read.
2. **Get study resources.** The server identifies the demo PDF by its file hash and returns resources from [`app/demo-ressurser.json`](../../../app/demo-ressurser.json). With Gemini enabled, the server sends page numbers, text from usable pages, and grouping information where available. PDF processing takes place locally. The server reads the API key from its environment.
3. **Open a source.** The browser sends the active PDF to `POST /pdf-page/<page-number>`. The server returns a PNG of the requested page.

The MVP uses no database. Bundled demo resources are stored as JSON. The active PDF, study resources, and answers are held in browser memory and cleared when the page is reloaded. The server removes temporary PDF and image files after processing. This supports one active PDF without saved study history.

## Validation and open items

The [submission test](../../../app/TESTLOGG.md) covers the bundled demo without an API key. Live generation with a representative PDF at the supported size limits still needs validation. The Gemini service tier for student PDFs remains open. The current implementation does not enforce the PRD's per-session request limit or spending ceiling.
