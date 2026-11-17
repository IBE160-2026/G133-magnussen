# AI Study Buddy research

Written on 16 November 2026 as a summary of the project's earlier research and technical trials.

## Research question

How can generative AI turn a student's own course material into useful study resources that the student can readily check against the source?

## Product research and source checking

The product brief identifies NotebookLM and Quizlet as tools in the same area. The project used these examples for orientation. It documented no systematic feature comparison or user interviews. The MVP focused on a single course document, with source checking available in the same view as the study resource.

## Technical trials

| Trial | Result and implications |
| --- | --- |
| Three-page Norwegian demo PDF | The sample supported testing the four resource types, source links, and operation without an API key. [Demo PDF](../../../app/demo-anatomi-ai-study-buddy.pdf) |
| Pilot with a public 50-page anatomy PDF | PRD § 9 records 46 pages with sufficient extractable text and about 10,960 input tokens per request before counting the system instruction and schema. Six generation attempts returned HTTP 503, leaving output size and source quality unmeasured. [PRD § 9](../prds/prd-Programmering%20med%20AI%202026-2026-11-04/prd.md#9-pre-implementation-decisions) |
| Local lecture PDF | The application found enough text on 13 of 15 pages. Flattening the text combined the columns on page 13. The runnable macOS version preserves the groups for that test case. [Setup guide](../../../app/README.md) |
| Submission test of the runnable version | After a fix, the source panel displayed only the selected PDF page. The test also exercised flashcards and both quiz rounds. [Test log](../../../app/TESTLOGG.md) |

## Remaining questions

The 50-page pilot and the submission test were separate trials. End-to-end generation at the supported PDF limits, cost per study session, and subject-matter quality across several course documents still need evaluation.
