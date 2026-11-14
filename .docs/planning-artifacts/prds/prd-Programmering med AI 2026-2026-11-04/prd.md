---
title: AI Study Buddy PRD
status: final
created: 2026-11-04
updated: 2026-11-14
---

# PRD: AI Study Buddy

## 0. Purpose

This PRD defines the user-facing requirements for the AI Study Buddy MVP and provides a shared reference for design, architecture, implementation, and testing. It builds on the product brief at `product-brief.md`. The PRD is written in English to match the repository's BMAD configuration; collaboration and review with the project owner take place in Norwegian.

The MVP is a three-month individual student project. Requirements focus on observable behavior and testable outcomes. Technical implementation choices, including PDF text chunking and model selection, belong in architecture unless they change the user-visible behavior.

## 1. Vision

AI Study Buddy helps students create Study resources from one supported, text-based course PDF in a single Study session. Students can create summaries, flashcards, quiz questions, and key concepts from the same uploaded PDF during that session.

The product makes source checking part of the study flow by displaying and checking the source information required for each resource type (see FR-5–FR-8 and FR-10). These references help students inspect the course material; they do not guarantee that generated content is academically correct or complete.

The product operates in a landscape where existing tools already create Study resources from uploaded material. Gemini Notebook provides source citations alongside generated answers and study activities; Quizlet offers Study resources generated from uploaded notes and files. AI Study Buddy's product focus is a simple, single-PDF Study session that brings four resource types together and makes page-level references visible across generated resources. This is a focused workflow, not a claim that source-grounded generation is unique. [Gemini Notebook source citations](https://support.google.com/gemininotebook/answer/16179559); [Quizlet AI study tools](https://quizlet.com/features/ai-study-tools).

## 2. Target User

The primary target users are physiotherapy students preparing for anatomy exams. They need to learn the Norwegian and Latin names of muscles, their locations, and their functions from course material such as lecture slides and notes.

The MVP is designed for individual use, with one student using one text-based PDF at a time. It does not target collaborative groups, institutions, or users seeking a general course-content library.

### 2.1 What Students Want to Achieve

- Review the main ideas in course material without rereading the whole PDF repeatedly.
- Practise recalling anatomy terms and related information.
- Test understanding with quiz questions before seeing the answer.
- Check generated Study resources against the uploaded course material using page references and short source excerpts, and open the cited PDF page beside the resource.

### 2.2 How a Student Uses the App

- **UJ-1. A physiotherapy student studies course material from one PDF.**
  - **Student and situation:** A physiotherapy student preparing for an anatomy exam, using their own course material.
  - **Before using the app:** The student opens the AI Study Buddy web app and has a text-based PDF available.
  - **Path:**
    - The student uploads one supported PDF. After it is processed, they can create one or more of the four resource types from it: summaries, flashcards, quiz questions, and key concepts. The details of each resource type are specified in FR-5–FR-8.
  - **Practice with Study resources:** The student reviews and practises with the generated resources, as specified in FR-5–FR-8.
  - When the student selects a PDF viewer page number in a Source reference, the app displays that page beside the Study resource so the student can inspect the excerpt in context.
  - **End the Study session:** The student ends the session by selecting “Avslutt studieøkt” or closing the browser tab. The PDF and generated Study resources are not saved. If the student refreshes or reopens the app, a new session starts and the student must upload the PDF again.
  - **If PDF text cannot be extracted:** The app shows a clear error instead of proceeding as if the document had been processed.

## 3. Key Terms

- **Supported PDF** — A text-based PDF no larger than 20 MB (20,000,000 bytes, using decimal megabytes) and no longer than 50 pages.
- **Usable page text** — At least 20 non-whitespace characters extracted from a PDF page. A page below this threshold is listed as having insufficient extracted text.
- **PDF viewer page** — A page displayed in the app's PDF viewer and numbered from the first page of the PDF. Printed page numbers are not used.
- **Topic** — A subject grouping identified in the uploaded PDF and used to organize summaries and key concepts.
- **Summary point** — One concise statement in a Topic-level Summary.
- **Quiz** — One generated set of up to 10 quiz questions that the student submits as a whole.
- **Quiz retake** — A repeat of the same Quiz, with the same questions and answer options, cleared responses, and a different question order from the immediately preceding attempt.
- **Study session** — The period in which a student uploads one PDF and creates or reviews Study resources. A session ends when the student selects “Avslutt studieøkt” or closes the browser tab. If the student refreshes or reopens the app, a new session starts, and the PDF and generated resources are not restored. The student must upload the PDF again.
- **Study resource** — A summary, flashcard, quiz question, or key concept generated from the uploaded PDF.
- **Source reference** — Source information shown with a generated Study resource: one or more PDF viewer page numbers, each paired with the short source excerpt it supports. Every resource type has at least one page-and-excerpt pair.
- **Unverified item** — A generated Study resource that is missing required source information, or whose source excerpt cannot be found in the extracted text on its paired PDF viewer page. The app displays the Norwegian label “Ubekreftet.”
- **Generation request** — One student action that asks the app to generate one resource type (a summary, key-concept list, flashcard set, or quiz) from the uploaded PDF. All provider calls needed to complete that action count as one request for the session limit.

## 4. What the App Does

FR-1 through FR-14 collectively realize user journey UJ-1.

### 4.1 PDF Upload and Text Availability

**Description:** The student uploads one Supported PDF for the Study session. The app prepares the document's text so the student can use it to create Study resources.

**Functional Requirements:**

#### FR-1: Upload one PDF per Study session

The student must upload one Supported PDF to start a Study session. Only one PDF can be used during that Study session; the student cannot add another PDF or replace the uploaded PDF. To use a different PDF, the student ends the current Study session and starts a new one. Uploading and successfully processing the PDF is a prerequisite for generating any Study resource.

**Consequences (testable):**

- A supported text-based PDF can be selected and uploaded.
- One uploaded PDF is the source for the resource types created during that Study session.
- After one PDF has been uploaded, the app does not offer an option to add or replace it during the current Study session.
- Before a Supported PDF has been uploaded and successfully processed, the app does not allow the student to generate summaries, flashcards, quiz questions, or key concepts, and explains that a PDF is required.

#### FR-2: Enforce PDF file limits

The app accepts only PDF files no larger than 20 MB and no longer than 50 pages. [ASSUMPTION: The app can determine file size and page count before processing.]

**Consequences (testable):**

- If a PDF is over 20 MB or has more than 50 pages, the app explains which supported limit was exceeded and does not process the file or generate Study resources from it.

#### FR-3: Extract text and report pages with insufficient text

The app extracts text from each PDF page. A page with fewer than 20 non-whitespace characters of extracted text is listed to the student by PDF viewer page number before generation. If one or more pages fall below this threshold, the student can either continue using text from pages that meet the threshold or cancel processing. Text from pages below the threshold is excluded from generation, and the app waits for the student's choice before generating resources. If every page meets the threshold, no additional confirmation is required. If no page has usable text, or an unrecoverable processing error prevents the app from determining page-level text availability, the app shows a clear error and does not generate resources.

**Consequences (testable):**

- A page with 20 or more non-whitespace extracted characters is treated as having usable text; a page with fewer than 20 is listed as having insufficient extracted text.
- For a PDF containing both usable-text pages and pages with insufficient extracted text, the app lists all page numbers below the threshold and offers the student the choice to continue with the extracted text or cancel. If every page has usable text, the app proceeds without asking the student to confirm.
- If the student continues, generated resources use the extracted text and the student has been told which pages were not represented by usable extracted text.
- If the student cancels, or no page has usable text, the app does not generate resources.
- If an unrecoverable processing error prevents page-level text availability from being determined, the app shows a clear Norwegian error and does not generate resources.

### 4.2 Creating Study Resources

**Description:** During one Study session, the student can create different Study resources based on the uploaded PDF and review them in the app.

**Functional Requirements:**

#### FR-4: Choose a resource type

After a Supported PDF has been uploaded and successfully processed, the student can choose summaries, flashcards, quiz questions, or key concepts for that PDF and can return to choose another type during the same Study session. Resource-generation options are unavailable until this prerequisite is met.

#### FR-5: Generate summaries

The app organizes the uploaded PDF by Topic and generates a summary of the main ideas for each Topic. Each Summary point shows its Source reference. A Summary point with a missing or unverified Source reference is marked “Ubekreftet.”

#### FR-6: Generate key concepts

For each Topic in the uploaded PDF, the app generates a list of key concepts. Each key concept shows its Source reference. A key concept with a missing or unverified Source reference is marked “Ubekreftet.”

#### FR-7: Practise with flashcards

The app generates up to 10 flashcards per Generation request, depending on how much relevant information the PDF contains. It may generate fewer when the source material does not support more. The app presents a flashcard question first. The student can reveal the answer. The answer view shows the Source reference. If the Source reference is missing or unverified, the flashcard is marked “Ubekreftet.”

#### FR-8: Answer quiz questions

Each Quiz contains up to 10 questions, depending on how much relevant information the PDF contains. The app may generate fewer when the source material does not support more. Each question has three answer options and one correct answer. The student completes and submits the whole Quiz before seeing the results. After submission, the app marks correct answers in green with a check mark and the label “Riktig,” and the student's incorrect responses in red with an X and the label “Feil.” It provides a brief explanation grounded in the PDF for each answer and shows the Source reference. If the Source reference is missing or unverified, the Quiz item is marked “Ubekreftet.” A Quiz retake repeats the same questions and answer options, clears the student's previous responses, and presents the questions in a different order from the immediately preceding attempt. This ordering requirement applies to Quizzes with at least two questions.

### 4.3 What Happens When the Study session Ends

#### FR-9: Keep generated Study resources session-scoped

The student can use multiple resource types created from the same PDF during the current Study session. The student can end the session by selecting “Avslutt studieøkt” or by closing the browser tab. The app does not retain the PDF or generated Study resources for later sessions. Refreshing or reopening the app starts a new session, and the student must upload the PDF again.

### 4.4 Source References and Checking

Source references help students find and check information in the uploaded PDF. The app checks whether each source excerpt appears in the extracted text on its cited PDF viewer page. This check confirms that the excerpt appears on the page; it does not guarantee that generated Study resources are academically correct or cover the whole course.

#### FR-10: Verify source excerpts

For each generated Study resource, the app checks whether each source excerpt appears in the extracted text on the specific PDF viewer page paired with that excerpt. The check allows for differences in whitespace and line breaks. If any excerpt is missing from its paired page, that page cannot be checked, or required source information is missing, the Study resource is marked “Ubekreftet.” This check confirms that the excerpt appears on the page; it does not confirm that the generated content is academically correct.

#### FR-11: Open a cited PDF page beside the Study resource

When the student selects a PDF viewer page number in a Source reference, the app displays that page in a PDF viewer beside the current Study resource. The student can select any cited page number, and the Study resource remains visible while the viewer changes pages.

**Consequences (testable):**

- Selecting a cited page number opens the corresponding page of the uploaded PDF in the viewer.
- The displayed page uses PDF viewer numbering, starting at page 1, regardless of printed page labels.
- When the student selects a different cited page number, the viewer displays that page while keeping the current resource visible.

### 4.5 Generation Limits and Cost

#### FR-12: Limit live generation requests per Study session

In live mode, the student can make no more than eight Generation requests during one Study session. The app shows how many requests remain from the start of the session. Each request counts toward the limit when the student starts it, including requests that fail or time out. When the limit is reached, the app shows a clear Norwegian message and does not call the provider. Demo mode uses stored responses and does not use provider requests or incur provider usage charges.

### 4.6 Generation Reliability and Demo Mode

#### FR-13: Handle generation failures

If a Generation request fails, times out, or returns a response the app cannot parse into the expected Study resource format, the app shows a clear error message in Norwegian and does not display or retain a partial Study resource. The student can continue using Study resources that were generated successfully earlier in the Study session.

**Consequences (testable):**

- When a mock provider response is malformed, the app shows the Norwegian error message and displays no partial Study resource.
- When the provider is unavailable or a request times out, the app shows the Norwegian error message and displays no partial Study resource.

#### FR-14: Run a keyless demo mode

The app can be started in a documented demo mode without an AI provider API key. Demo mode includes a sample PDF cleared for public redistribution and stored responses that let a student complete and review all four resource types without calling a paid AI provider. Source excerpts in stored responses satisfy FR-10 against the sample PDF.

**Consequences (testable):**

- A person following the README can start demo mode without an API key or paid account.
- In demo mode, the sample PDF can be processed and stored responses for summaries, key concepts, flashcards, and quiz questions can be reviewed.
- Demo mode makes no AI provider requests and incurs no provider usage charges.

## 5. General Requirements

- Details about source information and viewing cited PDF pages, generation failures, demo mode, generation limits, PDF upload requirements, and study-session behavior are specified in FR-1–FR-14.
- **Uploaded data:** During architecture, review how the selected provider processes and retains uploaded PDFs and generated content. The app's session-only behavior does not by itself guarantee immediate deletion by the provider.
- **AI provider costs:** Students are not charged for using the MVP; the project team bears live-provider costs. The live mode is limited to eight Generation requests per Study session. Before implementation, the project records the selected provider and model's estimated cost for a full session using the supported PDF limit, and sets a project spending ceiling. The app must not make a provider request that would exceed the configured ceiling and explains in Norwegian when generation is unavailable because the limit has been reached.
- **Language:** All student-facing text in the app, including navigation, buttons, instructions, error messages, questions, answers, summaries, and explanations, is in Norwegian. Relevant Latin anatomical terms are retained. When a question asks for a term in Latin, the answer gives the term in Latin; the surrounding text remains in Norwegian.
- **Project limits:** The MVP is an individual-use web application for one text-based PDF at a time, with a three-month project horizon.
- **Limits of generated content:** The app does not guarantee academic correctness or complete coverage of the course material.

## 6. Non-Goals

The MVP does not include:

- Scanned-document processing.
- Multiple-document collections or cross-document synthesis.
- Collaborative study groups or institution-wide course integrations.
- Native mobile applications.
- Advanced personalisation or saved study history.
- Formal course grading or institutional assessment.
- Broad content libraries.
- Automatic grading of free-text quiz answers.

## 7. MVP Scope

### 7.1 In Scope

- Uploading and processing one Supported PDF at a time.
- Generating summaries, flashcards, quiz questions, and key concepts from the same PDF during a Study session.
- Flashcards with a question-first, reveal-answer interaction.
- Quiz questions with three answer options, submitted as a whole quiz, with correct answers marked green and labeled “Riktig” with a check mark, incorrect student responses marked red and labeled “Feil” with an X, and brief explanations grounded in the PDF after submission.
- Retaking a quiz with at least two questions, with the app ensuring that the questions appear in a different order from the immediately preceding attempt.
- Source information, source-excerpt verification, and “Ubekreftet” labels, as specified in FR-5–FR-8 and FR-10.
- Opening a cited PDF page beside its Study resource, as specified in FR-11.
- Clear generation-failure behavior, keyless demo mode, and a limit of eight live Generation requests per Study session, as specified in FR-12–FR-14.
- Clear PDF text-extraction and file-limit errors.
- Individual use through a simple web interface.

### 7.2 Out of Scope for MVP

- Scanned PDFs and OCR.
- Saving the uploaded PDF or generated Study resources for later sessions.
- Group study, institutional integrations, mobile apps, advanced personalisation, formal grading, and content libraries.

## 8. Success Metrics

The end-to-end study workflow will be evaluated with two or three supported sample text-based PDFs containing relevant Latin anatomical terms. Separate test files will be used in SM-3 to check extraction failures and PDFs that exceed the supported limits. SM-2 and SM-C1 measure whether source excerpts can be traced to cited pages; they do not set an academic-accuracy guarantee.

A test passes when the app meets all specified outcomes for that test. Any unmet outcome is recorded as a failure and reviewed before the MVP is accepted.

### Primary Metrics

- **SM-1 — End-to-end study workflow:** As part of the MVP evaluation, the project team tests the app with the sample PDFs described above. For each PDF, they check that a student can upload it, have its text processed, generate all four resource types, and review the results without a blocking error. They check that the interface and generated content are in Norwegian and that relevant Latin anatomical terms are retained. They also check that selecting “Avslutt studieøkt,” closing the browser tab, refreshing, or reopening the app does not restore the PDF or generated resources, and that the student must upload the PDF again to start a new session. This is a project evaluation test, not something students need to do each time they use the app. SM-1 checks the workflow in FR-1 and FR-4–FR-9, and the language requirement in Section 5. The combined evaluation across SM-1–SM-5 checks FR-1–FR-14 and the testable AI provider cost requirement in Section 5.
- **SM-2 — Source-reference inspection:** Use two or three supported sample PDFs that each produce at least 20 Study resources across the four resource types. For each PDF, select 20 generated Study resources, ensuring that at least one item from each of the four resource types is included and selecting the remaining items randomly. Verify that at least 18 of 20 items (90%) have every Source reference excerpt present in the extracted text on the specific page paired with that excerpt. Any sampled item whose required source information is missing, whose excerpt does not appear on its paired page, or whose cited page cannot be checked must be marked “Ubekreftet.” Include test items with an excerpt changed to text that does not appear on its paired page and with a cited page made unavailable to the verification check. Select cited page numbers in the app and verify that each opens the correct PDF page beside the current Study resource. Record the number of matching and mismatching references and the number correctly marked “Ubekreftet.” This test checks whether the app meets FR-5 through FR-8, FR-10, and FR-11.
- **SM-3 — PDF file limits and text availability:** Test PDFs at the supported limits of exactly 20 MB and 50 pages and verify that they are accepted. Also test a PDF larger than 20 MB and one longer than 50 pages; in each case, verify that the app identifies the exceeded limit and does not process or generate resources. Test page text with exactly 20 non-whitespace characters and with fewer than 20, including an image-only page. Verify that a page with exactly 20 characters is treated as usable and that every page below the threshold is listed and excluded from generation. When pages fall below the threshold, verify that the student can continue using text from pages above the threshold or cancel, and that no resources are generated before the student chooses to continue. When every page meets the threshold, verify that the app proceeds without asking for confirmation. Verify that the app blocks generation when no page has usable text or an unrecoverable processing error prevents page-level text availability from being determined. This test checks whether the app meets FR-2 and FR-3.
- **SM-4 — Quiz interaction:** Verify that each Quiz question has three answer options, the student submits the whole Quiz, results mark correct answers in green and label them “Riktig” with a check mark, and mark incorrect student responses in red and label them “Feil” with an X. Also verify that results provide a brief explanation grounded in the PDF and, for a Quiz with at least two questions, a Quiz retake repeats the same questions and answer options, clears previous responses, and presents the questions in a different order from the immediately preceding attempt. This test checks whether the app meets FR-8.
- **SM-5 — Generation failures, demo mode, and limits:** Use malformed mock responses, provider-unavailable responses, and timeouts to verify the app shows a Norwegian error and displays no partial Study resource. Follow the README without an API key to verify demo mode lets a student review all four resource types from the sample PDF and makes no provider requests. In live mode, verify the app allows at most eight Generation requests per Study session, counts failed requests, and makes no provider call after the request limit is reached. Configure the project spending ceiling so the next Generation request would exceed it; verify the app blocks that request before calling the provider and explains in Norwegian that the spending ceiling has been reached. This test checks whether the app meets FR-12 through FR-14 and the AI provider cost requirement in Section 5.

### Counter-metrics

- **SM-C1 — Verified-output share guardrail:** The verified-reference share is the number of sampled items for which every required Source reference excerpt appears in the extracted text on its paired page, divided by the total number of sampled items. An item with missing or unverifiable required source information does not count as verified and must be marked “Ubekreftet.” Across the same sample PDFs, record the number of generated items and the verified-reference share for each evaluated run. The first run establishes the baseline; compare each subsequent run with the previous accepted run. An increase in generated items is not considered an improvement if the verified-reference share decreases, and the share must remain at or above 90%.
- **SM-C2 — Generation safety guardrail:** The app is not considered successful if a failed or malformed generation displays a partial resource, if demo mode requires an API key or makes provider calls, or if live mode exceeds the eight-request session limit or configured spending ceiling.

A small amount of student feedback may also be collected to identify usability issues. Manual source checks show whether generated Study resources match the PDF. They do not show whether the resources cover everything the student is expected to know for the course.

## 9. Pre-implementation Decisions

The user-facing behavior for source verification, generation failures, PDF page viewing, and keyless demo mode is specified in FR-1–FR-14.

**Provider candidate — pending project validation:** The current recommendation is the paid Gemini Developer API tier with Gemini 3.8 Flash. Google's documentation lists PDF inputs up to 50 MB or 1,000 pages, a 1,048,576-token input limit, and structured-output support. These published limits exceed the PRD's 20,000,000-byte and 50-page limits. However, this does not yet prove the end-to-end workflow can handle the largest Supported PDF: the app must exclude pages below the FR-3 text threshold, and the extracted text's token count must fit the model context. Validate this with a representative 50-page PDF before locking the provider and architecture. [PDF document processing](https://ai.google.dev/gemini-api/docs/document-processing); [Gemini 3.8 Flash model limits and capabilities](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash).

**Data handling:** For paid Gemini API services, Google says prompts, uploaded files, and responses are not used to improve its products. Google may retain prompts and responses for a limited period for abuse monitoring; its usage-policy documentation states a maximum of 55 days. Files uploaded through the Gemini Files API are automatically deleted after 48 hours, and the API supports earlier manual deletion. If the implementation uses the Files API, it should delete the uploaded file when the Study session ends and explain that provider-side deletion is not immediate by default. [Gemini API terms](https://ai.google.dev/gemini-api/terms); [abuse monitoring](https://ai.google.dev/gemini-api/docs/usage-policies); [Files API retention](https://ai.google.dev/gemini-api/docs/files).

**Preliminary cost reference — not a final session estimate:** Google's listed standard Gemini 3.8 Flash rates become $1.50 per million input tokens and $7.50 per million output tokens on January 1, 2027. For scale only, if each of eight requests sends a 50-page PDF directly (258 tokens per page) and output is capped at 8,192 tokens per request, the reference total is about $0.65: approximately $0.155 for input and $0.492 for output. This direct-PDF scenario is a pricing benchmark only; sending the original PDF would not meet FR-3 if it includes pages that must be excluded from generation. The calculation assumes one provider call per request and excludes additional prompt text, extracted-text overhead, retries, or any extra calls for chunking. It is not the project's final cost estimate. Before setting the spending ceiling, use the chosen extraction flow and a representative maximum-size PDF to measure input tokens and calculate the cost of all eight requests at the rates that will apply during implementation. Set an output-token limit and an application-level spending ceiling; do not rely on provider billing alerts as the app's cost guardrail. [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing); [PDF token accounting](https://ai.google.dev/gemini-api/docs/document-processing).

**Demo PDF:** A three-page, text-based sample is available at `output/pdf/demo-anatomi-ai-study-buddy.pdf`. It uses original Norwegian wording, contains no third-party images, and documents attribution and CC BY-NC-SA 4.0 redistribution terms for its adapted OpenStax content. It supports the keyless demo and source-excerpt checks, but is not a substitute for the 50-page boundary test. Once the application and demo mode are implemented, add runnable demo setup instructions to the README.

**Remaining validation before UX, architecture, and epics are finalized:** Run the 50-page boundary test through the proposed extraction and model flow; measure token use for all four resource types and a full eight-request session; and confirm the spending ceiling against those measurements. If the measured text exceeds the model context or makes the cost ceiling impractical, revise the text-handling approach or Supported PDF limits before finalizing the design.

## 10. Assumptions Index

- **[ASSUMPTION] FR-2:** The app can determine file size and page count before processing so it can identify and report when a PDF exceeds either supported limit.
