---
title: AI Study Buddy PRD
status: draft
created: 2026-11-04
updated: 2026-11-05
---

# PRD: AI Study Buddy

## 0. Purpose

This PRD defines the user-facing requirements for the AI Study Buddy MVP and provides a shared reference for design, architecture, implementation, and testing. It builds on the product brief at `product-brief.md`. The PRD is written in English to match the repository's BMAD configuration; collaboration and review with the project owner take place in Norwegian.

The MVP is a three-month individual student project. Requirements focus on observable behavior and testable outcomes. Technical implementation choices, including PDF text chunking and model selection, belong in architecture unless they change the user-visible behavior.

## 1. Vision

AI Study Buddy helps students create study resources from one supported, text-based course PDF in a single study session. Students can create summaries, flashcards, quiz questions, and key concepts from the same uploaded PDF during that session.

The product makes source checking part of the study flow by displaying the source information required for each resource type (see FR-5–FR-8). These references help students inspect the course material; they do not guarantee that generated content is academically correct or complete.

The product operates in a landscape where existing tools already create study resources from uploaded material. Gemini Notebook provides source citations alongside generated answers and study activities; Quizlet offers study resources generated from uploaded notes and files. AI Study Buddy's product focus is a simple, single-PDF study session that brings four resource types together and makes page-level references visible across generated resources. This is a focused workflow, not a claim that source-grounded generation is unique. [Gemini Notebook source citations](https://support.google.com/gemininotebook/answer/16179559); [Quizlet AI study tools](https://quizlet.com/features/ai-study-tools).

## 2. Target User

The primary target users are physiotherapy students preparing for anatomy exams. They need to learn the Norwegian and Latin names of muscles, their locations, and their functions from course material such as lecture slides and notes.

The MVP is designed for individual use, with one student using one text-based PDF at a time. It does not target collaborative groups, institutions, or users seeking a general course-content library.

### 2.1 What Students Want to Achieve

- Review the main ideas in course material without rereading the whole PDF repeatedly.
- Practise recalling anatomy terms and related information.
- Test understanding with quiz questions before seeing the answer.
- Check generated study resources against the uploaded course material using page references and, where available, short source excerpts.

### 2.2 How a Student Uses the App

- **UJ-1. A physiotherapy student studies course material from one PDF.**
  - **Student and situation:** A physiotherapy student preparing for an anatomy exam, using their own course material.
  - **Before using the app:** The student opens the AI Study Buddy web app and has a text-based PDF available.
  - **Path:**
    - The student uploads one supported PDF. After it is processed, they can create one or more of the four resource types from it: summaries, flashcards, quiz questions, and key concepts. The details of each resource type are specified in FR-5–FR-8.
  - **Practice with study resources:** The student reviews and practises with the generated resources, as specified in FR-5–FR-8.
  - **End the study session:** The student ends the session by selecting “Avslutt studieøkt” or closing the browser tab. The PDF and generated resources are not saved. If the student refreshes or reopens the app, a new session starts and the student must upload the PDF again.
  - **If PDF text cannot be extracted:** The app shows a clear error instead of proceeding as if the document had been processed.

## 3. Key Terms

- **Supported PDF** — A text-based PDF no larger than 20 MB and no longer than 50 pages.
- **Study session** — The period in which a student uploads one PDF and creates or reviews study resources. A session ends when the student selects “Avslutt studieøkt” or closes the browser tab. If the student refreshes or reopens the app, a new session starts, and the PDF and generated resources are not restored. The student must upload the PDF again.
- **Study resource** — A summary, flashcard, quiz question, or key concept generated from the uploaded PDF.
- **Source reference** — Source information shown with a generated study resource: the PDF viewer page number(s) for every resource type when available, and a short source excerpt for flashcards, quiz questions, and key concepts. Printed page numbers are not used.
- **Unverified item** — A summary point without a source page number, or another generated study item missing required source information. The app displays the Norwegian label “Ubekreftet.”

## 4. What the App Does

### 4.1 PDF Upload and Text Availability

**Description:** The student uploads one Supported PDF for the Study session. The app prepares the document's text so the student can use it to create study resources.

**Functional Requirements:**

#### FR-1: Upload one PDF per study session

The student must upload one Supported PDF to start a Study session. Uploading and successfully processing that PDF is a prerequisite for generating any study resource.

**Consequences (testable):**

- A supported text-based PDF can be selected and uploaded.
- One uploaded PDF is the source for the resource types created during that Study session.
- Before a Supported PDF has been uploaded and successfully processed, the app does not allow the student to generate summaries, flashcards, quiz questions, or key concepts, and explains that a PDF is required.

#### FR-2: Use the document text for generation

The app uses the text in the uploaded PDF to create the study resource selected by the student.

**Consequences (testable):**

- The app generates study resources only if it extracts readable text from every PDF page that contains selectable text. If it fails to extract readable text from any such page, it tells the student and does not generate study resources.
- If a PDF is over 20 MB or has more than 50 pages, the app explains that it exceeds the supported limits and does not generate any study resources from that file.
- Before implementation, the project confirms that the selected language-model provider can process PDFs up to 50 pages and 20 MB. If it cannot, the Supported PDF limits are revised in the PRD.

#### FR-3: Explain extraction failure

If the app cannot extract usable text from a PDF, it shows an error and stops processing the document. It does not generate any study resources.

### 4.2 Creating Study Resources

**Description:** During one Study session, the student can create different study resources based on the uploaded PDF and review them in the app.

**Functional Requirements:**

#### FR-4: Choose a resource type

After a Supported PDF has been uploaded and successfully processed, the student can choose summaries, flashcards, quiz questions, or key concepts for that PDF and can return to choose another type during the same Study session. Resource-generation options are unavailable until this prerequisite is met.

#### FR-5: Generate summaries

The app organizes the uploaded PDF by topic and generates a summary of the main ideas for each topic. Each point in a topic-level summary shows the source page number(s) for the information. A summary point without a source page number is marked “Ubekreftet.”

#### FR-6: Generate key concepts

For each topic in the uploaded PDF, the app generates a list of key concepts. Each key concept shows its source page number(s) and a short excerpt from the PDF that explains the concept. A key concept missing either its source page number(s) or source excerpt is marked “Ubekreftet.”

#### FR-7: Practise with flashcards

The app generates up to 10 flashcards per request, depending on how much relevant information the PDF contains. It may generate fewer when the source material does not support more. The app presents a flashcard question first. The student can reveal the answer. The answer view shows source page number(s) when available and a short excerpt from the source text. If either source detail is missing, the flashcard is marked “Ubekreftet.”

#### FR-8: Answer quiz questions

Each quiz contains up to 10 questions, depending on how much relevant information the PDF contains. The app may generate fewer when the source material does not support more. Each question has three answer options and one correct answer. The student completes and submits the whole quiz before seeing the results. After submission, the app marks correct answers in green with a check mark and the label “Riktig,” and the student's incorrect responses in red with an X and the label “Feil.” It provides a brief explanation grounded in the PDF for each answer. It shows source page number(s) when available and a short excerpt from the source text. If either source detail is missing, the quiz item is marked “Ubekreftet.” For quizzes with at least two questions, the app ensures that each retake presents the questions in a different order from the immediately preceding attempt.


### 4.3 What Happens When the Study Session Ends

#### FR-9: Keep generated resources session-scoped

The student can use multiple resource types created from the same PDF during the current Study session. The student can end the session by selecting “Avslutt studieøkt” or by closing the browser tab. The app does not retain the PDF or generated resources for later sessions. Refreshing or reopening the app starts a new session, and the student must upload the PDF again.

### 4.4 Source References and Checking

Source references help students find and check information in the uploaded PDF. They do not guarantee that generated study resources are correct or cover the whole course.

## 5. General Requirements

- Details about source information, error messages, PDF upload requirements, and study-session behavior are specified in FR-1–FR-9.
- **Uploaded data:** During architecture, review how the selected provider processes and retains uploaded PDFs and generated content. The app's session-only behavior does not by itself guarantee immediate deletion by the provider.
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
- Source information and “Ubekreftet” labels, as specified in FR-5–FR-8.
- Clear PDF text-extraction and file-limit errors.
- Individual use through a simple web interface.

### 7.2 Out of Scope for MVP

- Scanned PDFs and OCR.
- Saving the uploaded PDF or generated Study resources for later sessions.
- Group study, institutional integrations, mobile apps, advanced personalisation, formal grading, and content libraries.

## 8. Success Metrics

The end-to-end study workflow will be evaluated with two or three supported sample text-based PDFs containing relevant Latin anatomical terms. Separate test files will be used in SM-3 to check extraction failures and PDFs that exceed the supported limits. No numerical academic-accuracy guarantee is set.

A test passes when the app meets all specified outcomes for that test. Any unmet outcome is recorded as a failure and reviewed before the MVP is accepted.

### Primary Metrics

- **SM-1 — End-to-end study workflow:** As part of the MVP evaluation, the project team tests the app with the sample PDFs described above. For each PDF, they check that a student can upload it, have its text processed, generate all four resource types, and review the results without a blocking error. They check that the interface and generated content are in Norwegian and that relevant Latin anatomical terms are retained. They also check that selecting “Avslutt studieøkt,” closing the browser tab, refreshing, or reopening the app does not restore the PDF or generated resources, and that the student must upload the PDF again to start a new session. This is a project evaluation test, not something students need to do each time they use the app. This test checks whether the app meets FR-1 through FR-9 and the language requirement in Section 5.
- **SM-2 — Source-reference inspection:** Manually check that each summary point shows the PDF page number(s) where its information was found. Check that the cited pages and excerpts for flashcards, quiz questions, and key concepts support the information shown. Record matches, mismatches, and missing references, and check that items missing required source information are marked “Ubekreftet.” This test checks whether the app meets FR-5 through FR-8.
- **SM-3 — PDF processing and file-limit errors:** Test one PDF from which no readable text can be extracted and one with selectable text on multiple pages where the app fails to extract readable text from at least one page. Also test otherwise valid text-based PDFs: one larger than 20 MB but no longer than 50 pages, and one longer than 50 pages but no larger than 20 MB. In each case, check that the app displays a clear error and generates no study resources. This test checks whether the app meets FR-2 and FR-3.
- **SM-4 — Quiz interaction:** Verify that each quiz question has three answer options, the student submits the whole quiz, results mark correct answers in green and label them “Riktig” with a check mark, and mark incorrect student responses in red and label them “Feil” with an X. Also verify that results provide a brief explanation grounded in the PDF and, for a quiz with at least two questions, the app ensures a retake presents the questions in a different order from the immediately preceding attempt. This test checks whether the app meets FR-8.

### Counter-metric

- The app is not considered successful if it fails to mark a study resource “Ubekreftet” when it is missing source information required for its resource type.

A small amount of student feedback may also be collected to identify usability issues. Manual source checks show whether generated study resources match the PDF. They do not show whether the resources cover everything the student is expected to know for the course.

## 9. Open Questions

No unresolved user-facing product questions remain. Architecture must still confirm that the selected provider supports the defined PDF limits and review its data-retention practices.

## 10. Assumptions Index

- **[ASSUMPTION] FR-2:** The app can identify when a PDF exceeds either supported limit and can report that clearly. The selected provider's ability to process PDFs within the 50-page and 20 MB limits will be confirmed during architecture.
