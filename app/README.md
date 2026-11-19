# AI Study Buddy

A local study application that uses one PDF to provide summaries, key concepts, flashcards, and quizzes with source links. This version requires macOS with PDFKit and Node.js 24. It has no npm dependencies. The interface is in Norwegian.

## Run the demo without an API key

Run this command from the repository root:

```sh
node app/server.mjs
```

Keep Terminal open while you use the app. When it prints `Åpne http://127.0.0.1:4173`, open `http://127.0.0.1:4173` in Safari or Chrome on the same Mac. This address only works while your local server is running.

Use **Velg PDF** to select `app/demo-anatomi-ai-study-buddy.pdf`, leave Gemini disabled, and select **Les PDF**. The bundled PDF includes source and licensing information. Its study resources are provided so the demo can run offline.

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

Only `gemini-3.5-flash`, `gemini-3.6-flash`, and `gemini-3.8-flash` are
accepted for live generation. The 3.5 alias is routed to 3.6 Flash. Other
model overrides fail closed. The 3.5 alias and 3.6/3.8 model IDs use the
conservative published scheduled Flash rates: $1.50 per million input tokens
and $7.50 per million output tokens, because the higher 2027 schedule is used
as the reservation ceiling through 2026-12-31.

## Scope and test evidence

- The application accepts one unlocked PDF up to 20 MB and 50 pages. It lists pages with little extractable text.
- Source links point to physical PDF pages. Gemini excerpts that the application cannot find on the cited page are labelled **Ubekreftet** (Unverified).
- With the original local `Muskler.pdf`, the application used 13 of 15 pages. Pages 7 and 15 lacked extractable text. On page 13, the application kept the mobilising and stabilising muscles in separate groups. The lecture PDF is outside this repository.
- After testing, raw text was moved behind a separate control and the summary was shown first. Flashcards and quizzes were revised to ask standalone subject questions. Quiz results distinguish correct, incorrect, and unanswered questions using text and colour.
- This release uses a local Node server and macOS PDFKit. The earlier plan specified Next.js and PDF.js. The delivered version runs on macOS.

See the [submission test log](TESTLOGG.md) for the manual test of the merged version.

## Publish through the course Vercel project

The repository root contains `vercel.json`. Vercel installs the locked npm
dependencies, runs `npm run build`, and serves `dist` with the
`api/study.mjs` function. Use the repository root as the Vercel project root.

In the web version, PDF.js reads the selected PDF and renders cited pages in
the browser. The PDF remains in the active tab. The server receives extracted
text, page numbers and a hash for identifying the bundled demo. The 20 MB and
50-page file limits apply in the browser. The generation endpoint accepts up
to 500,000 text characters. The bundled demo works without a Gemini key.
Download the bundled PDF from `/demo-anatomi-ai-study-buddy.pdf` on the
published site to try it.

Live generation requires these Vercel environment variables:

- `GEMINI_API_KEY` and optionally `GEMINI_MODEL`.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for durable usage counters.
  Vercel KV deployments can instead use the complete pair `KV_REST_API_URL` and
  `KV_REST_API_TOKEN`. The Upstash pair takes precedence when both pairs are set;
  a partial Upstash pair falls back to a complete Vercel KV pair. Do not mix
  variables from the two pairs. Redeploy after changing environment variables.
- `GEMINI_BUDGET_ID`, a fixed identifier for this project's budget.
- `GEMINI_BUDGET_MICRO_USD`, the total ceiling in whole micro-US dollars.

Before generation, the application counts the exact system instructions,
contents, and JSON response schema using Gemini's count-tokens endpoint. It
rounds each pricing component upward to whole micro-US dollars, reserves
`input tokens × $1.50/million + 8,192 output tokens × $7.50/million`, and
passes that amount to the existing atomic Redis Lua script. Redis keeps the
existing session and historical budget keys unchanged. Failed calls keep their
reservations. Each study session allows eight requests. Budget reservations
survive function restarts. Keep the budget identifier and settings stable
throughout that budget.

Unsupported models and missing or invalid token counts are blocked before
reservation or generation. A token-count failure other than a retryable 503
fails closed. Budget contention and the eight-request limit prevent a provider
call. A Gemini HTTP 503 during token counting or
generation allows at most one automatic retry per study request, after a
one-second delay. A token-count retry does not consume a generation request.
Every `generateContent` attempt, including a retry, receives its own atomic
reservation for the calculated maximum cost and consumes one of the eight
session requests. The retry is skipped if the budget, request limit, or
remaining execution time prevents it. The Vercel handler keeps a ten-second
safety margin within its 120-second limit and shortens the generation timeout
when necessary; no generation attempt exceeds 100 seconds. The user sees a
Norwegian status when the retry succeeds or is stopped.
Generation caps output at 8,192 tokens. Failure logs contain only an
allowlisted model identifier and operation, HTTP status, Google's numeric error
code when available, and an allowlisted error category. They never contain API
keys, request or response bodies, PDF text, provider messages, or generated
answers.

`APP_ORIGIN` can pin the accepted HTTPS origin. When omitted, the function
uses the incoming host, allowing Vercel preview domains.

The local macOS server remains available using the command above. The Vercel
build adds PDF.js as an npm dependency.
