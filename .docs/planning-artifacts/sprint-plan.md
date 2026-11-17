# Sprint plan — AI Study Buddy

Consolidated on 17 November 2026 from the AI Study Buddy project chat. The chat records decisions made as work progressed, before the corresponding tasks were started. The phases below group related decisions for readability. No fixed sprint dates, durations, or assignments were recorded in the chat. Git references identify delivered work.

## Planning decisions from the chat

| Phase | What we agreed to do next | How we intended to check it |
| --- | --- | --- |
| Design and source checking | Explore five SVG concepts, then develop four variants of the calm blue direction. Use **Side by side** to make the source available beside the study resource. | Open a cited page without losing the resource. Check broad and narrow layouts and try the source control with the keyboard. |
| PDF ingestion and viewer | Build the first runnable flow in this order: choose a real PDF, check which pages contain enough text, then open a source page. Use *Muskler.pdf* as the reference case. | Read all 15 pages, report pages 7 and 15 as having too little text, and open pages 13 and 14. Preserve the two muscle groups on page 13. |
| Summary | Add a summary after ingestion and source viewing work. Organise it by topic, use short explanations, and link to source pages. Use the approved *Muskler.pdf* summary as the reference for live generation. | Check that the output conveys the main points, preserves group membership, and links to the pages supporting each theme. Try a second PDF with Gemini enabled. |
| Study resources | Add key concepts, then flashcards, then quiz using the PDF already selected. Give short explanations in Norwegian and include Latin terms where relevant. Use self-contained questions and show citations with the answers. | Switch resources without uploading again. Reveal a flashcard answer and open its source. Submit the quiz and check the score, explanations and cited pages. |
| Repository and submission test | Put the runnable app on a separate GitHub branch, document startup on macOS, and include a demo that needs no Gemini key. Test a fresh checkout, then record the result against the tested commit. | Start from the README, load the demo, open a cited page, reveal a flashcard answer and complete both quiz rounds. |

## Changes agreed during testing

- Make the summary the primary view and put raw PDF text behind a separate control.
- Remove references to slide numbers, tables and column positions from the questions themselves. Keep source navigation with the answer.
- Label correct, incorrect and unanswered quiz items explicitly. Shuffle the same questions on a retry and unlock a different set after a perfect first round.
- Show only the selected PDF page in the source panel. Keep the full document available in a separate tab.

## Delivery evidence

- [Runnable MVP and keyless demo](https://github.com/IBE160-2026/G133-magnussen/pull/1)
- [Single-page source viewer](https://github.com/IBE160-2026/G133-magnussen/pull/2)
- [Submission test log](../../app/TESTLOGG.md), recorded against commit `b870e9f`
- [Design and UX documentation](https://github.com/IBE160-2026/G133-magnussen/pull/5), including the screenshots and the narrow-layout keyboard check

## Remaining verification plan

1. Test the PDF limits in the runnable app, including the exact size and page limits, and record what happens to pages without enough text.
2. Test live generation on representative documents and check the cited excerpts against their paired pages. Record source-check results separately from judgments about academic quality.
3. Resolve the planned Gemini request and spending limits, then verify them with the live flow.
4. Confirm the submission platform. The current app uses macOS PDFKit. If Windows support is required, plan a cross-platform PDF implementation and repeat the clean-checkout test.
