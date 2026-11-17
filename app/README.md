# AI Study Buddy

A local study application that uses one PDF to provide summaries, key concepts, flashcards, and quizzes with source links. This version requires macOS with PDFKit and Node.js 24. It has no npm dependencies. The interface is in Norwegian.

## Run the demo without an API key

Run this command from the repository root:

```sh
node app/server.mjs
```

Open http://127.0.0.1:4173. Use **Velg PDF** to select `app/demo-anatomi-ai-study-buddy.pdf`, leave Gemini disabled, and select **Les PDF**. The bundled PDF includes source and licensing information. Its study resources are provided so the demo can run offline.

1. Switch between **Sammendrag** and **Nøkkelbegreper**, then open a source.
2. Select **Flashcards**, reveal the answer, and open the source.
3. Select **Quiz**. Submit with at least one incorrect or unanswered question to see the results. Retry and check that the same questions appear in a different order. If all answers are correct, **Start neste quiz** opens a round with different questions.

To use a different port, run `PORT=4175 node app/server.mjs`.

## Generate resources with Gemini

Copy `app/.env.example` to `app/.env.local` and enter your own `GEMINI_API_KEY` locally. Start the application with:

```sh
node --env-file=app/.env.local app/server.mjs
```

Enable **Lag studieressurser med Gemini** before selecting **Les PDF**. The application processes the PDF locally. It sends extractable text to Gemini only when the option is enabled. The server uses the API key. Set `GEMINI_MODEL` to override the default Gemini 3.5 Flash model.

## Scope and test evidence

- The application accepts one unlocked PDF up to 20 MB and 50 pages. It lists pages with little extractable text.
- Source links point to physical PDF pages. Gemini excerpts that the application cannot find on the cited page are labelled **Ubekreftet** (Unverified).
- With the original local `Muskler.pdf`, the application used 13 of 15 pages. Pages 7 and 15 lacked extractable text. On page 13, the application kept the mobilising and stabilising muscles in separate groups. The lecture PDF is outside this repository.
- After testing, raw text was moved behind a separate control and the summary was shown first. Flashcards and quizzes were revised to ask standalone subject questions. Quiz results distinguish correct, incorrect, and unanswered questions using text and colour.
- This release uses a local Node server and macOS PDFKit. The earlier plan specified Next.js and PDF.js. The delivered version runs on macOS.

See the [submission test log](TESTLOGG.md) for the manual test of the merged version.
