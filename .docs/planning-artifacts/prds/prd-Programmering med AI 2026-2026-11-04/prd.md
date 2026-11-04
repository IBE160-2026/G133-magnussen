---
title: AI Study Buddy PRD
status: draft
created: 2026-11-04
updated: 2026-11-04
---

# PRD: AI Study Buddy

## 0. Purpose

This PRD defines the user-facing requirements for the AI Study Buddy MVP and provides a shared reference for design, architecture, implementation, and testing. It builds on the product brief at `product-brief.md`. The PRD is written in English to match the repository's BMAD configuration; collaboration and review with the project owner take place in Norwegian.

The MVP is a three-month individual student project. Requirements focus on observable behavior and testable outcomes. Technical implementation choices, including PDF text chunking and model selection, belong in architecture unless they change the user-visible behavior.

## 1. Vision

AI Study Buddy helps a student turn one supported, text-based course PDF into study resources during a single study session. The student can create summaries, flashcards, quiz questions, and key concepts from the same uploaded PDF during that session.

The product makes source checking part of the study flow. All four resource types display the page number(s) of their source pages when available. Each summary point shows its source page number(s) alongside the summarized information. Flashcards, quiz questions, and key concepts also show a short excerpt from the source text. A summary point without a source page number, or another resource without either a source page number or source excerpt, is marked unverified. These references help the student inspect the course material; they do not guarantee that generated content is academically correct or complete.

The product operates in a landscape where existing tools already create study resources from uploaded material. Gemini Notebook provides source citations alongside generated answers and study activities; Quizlet offers study resources generated from uploaded notes and files. AI Study Buddy's product focus is a simple, single-PDF study session that brings four resource types together and makes page-level references visible across generated resources. This is a focused workflow, not a claim that source-grounded generation is unique. [Gemini Notebook source citations](https://support.google.com/gemini/answer/16179559); [Quizlet AI study tools](https://quizlet.com/features/ai-study-tools).

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
  - **Persona + context:** A physiotherapy student preparing for an anatomy exam, using their own course material.
  - **Entry state:** The student opens the AI Study Buddy web app and has a text-based PDF available.
  - **Path:** The student uploads one supported PDF. The app makes four resource types available for that PDF. The student can choose among the four resource types—summaries, flashcards, quiz questions, and key concepts—and may create more than one type from the same PDF during the session. For summaries and key concepts, the app organizes content by topic, providing a summary of the main ideas and a list of key concepts for each topic. All four resource types display source page number(s) when available. Each point in a topic-level summary shows its source page number(s) alongside the summarized information. Key concepts, flashcards, and quiz questions also show a short excerpt from the source text. A summary point without a source page number, or another resource without either a source page number or source excerpt, is marked as unverified. On a flashcard, the question appears first; when the student taps the card, the app reveals the answer, source page, and short excerpt. For a quiz, each question has three answer options. The student completes and submits the whole quiz. After submission, the app marks correct answers in green and answers the student got wrong in red, provides a brief explanation grounded in the PDF for each answer, and shows source information. The student can retake the quiz, with the questions presented in a different order.
  - **Climax:** The student practises with a generated resource and can inspect the source information shown with it. If required source information is missing, the app marks the item as unverified.
  - **Resolution:** The student has reviewed the chosen resources in the current session. If the student closes the app, the PDF and generated resources are not saved; the student must upload the PDF again to use the app in a new session.
  - **Edge case:** If the PDF's text cannot be extracted, the app shows a clear error instead of proceeding as if the document had been processed.

## 3. Key Terms

- **Supported PDF** — A text-based PDF no larger than 20 MB and no longer than 50 pages.
- **Study session** — The period in which a student uploads one PDF and creates or reviews study resources. If the student closes the app or ends the session, the PDF and generated resources are not saved for later. To study from the same PDF in a new session, the student must upload it again.
- **Study resource** — A summary, flashcard, quiz question, or key concept generated from the uploaded PDF.
- **Source reference** — Source information shown with a generated study resource: the PDF viewer page number(s) for every resource type when available, and a short source excerpt for flashcards, quiz questions, and key concepts. Printed page numbers are not used.
- **Unverified item** — A summary point without a source page number, or another generated study item missing either a source page number or source excerpt.

## 4. What the App Does

### 4.1 PDF Upload and Text Availability

**Description:** The student uploads one Supported PDF for a Study session. The app extracts its text for use by the resource-generation features.

**Functional Requirements:**

#### FR-1: Upload one PDF per study session

The student can upload one Supported PDF at a time to start a Study session.

**Consequences (testable):**
- A supported text-based PDF can be selected and uploaded.
- One uploaded PDF is the source for the resource types created during that Study session.

#### FR-2: Use the document text for generation

The app makes the extractable text from the uploaded PDF available to the selected resource-generation feature.

**Consequences (testable):**
- The app does not silently treat a partially processed PDF as if all of its text had been processed.
- If the document exceeds either supported limit, the app tells the student that the file is outside the supported limits and does not generate resources from partially processed text.
- During architecture, confirm that the selected language-model provider can process PDFs within the defined limits of 50 pages and 20 MB. If it cannot, revise the Supported PDF limits explicitly before implementation.

#### FR-3: Explain extraction failure

If the app cannot extract usable text from a PDF, it shows a clear error and does not present generated resources as if the PDF had been processed.

### 4.2 Creating Study Resources

**Description:** The student can generate and review one or more resource types from the uploaded PDF during the same Study session.

**Functional Requirements:**

#### FR-4: Choose a resource type

The student can choose summaries, flashcards, quiz questions, or key concepts for the current PDF and can return to choose another type during the same Study session.

#### FR-5: Generate summaries and key concepts

The app organizes the uploaded PDF by topic. For each topic, it generates a summary of the main ideas and a list of key concepts. Each point in a topic-level summary shows its source page number(s) alongside the summarized information. Each key concept shows source page number(s) when available and a short excerpt from the source text. A summary point without a source page number, or a key concept without either a source page number or source excerpt, is marked as unverified.

#### FR-6: Practise with flashcards

The app generates up to 10 flashcards per request, depending on how much relevant information the PDF contains. It may generate fewer when the source material does not support more. The app presents a flashcard question first. The student can reveal the answer. The answer view shows source page number(s) when available and a short excerpt from the source text. If either source detail is missing, the flashcard is marked as unverified.

#### FR-7: Answer quiz questions

Each quiz contains up to 10 questions, depending on how much relevant information the PDF contains. The app may generate fewer when the source material does not support more. Each question has three answer options and one correct answer. The student completes and submits the whole quiz before seeing the results. After submission, the app marks correct answers in green and answers the student got wrong in red, and provides a brief explanation grounded in the PDF for each answer. It shows source page number(s) when available and a short excerpt from the source text. If either source detail is missing, the quiz item is marked as unverified. The student can retake the quiz, and the questions appear in a different order on each attempt.


### 4.3 What Happens When the Study Session Ends

#### FR-8: Keep generated resources session-scoped

The student can use multiple resource types created from the same PDF during the current Study session. When the session ends or the student closes the app, the app does not retain the PDF or generated resources for later sessions. The student must upload the PDF again to use it in a new session.

#### FR-9: Show source references for generated resources

All four resource types display source page number(s) when available. Each topic-level summary point shows its source page number(s) beside the summarized information. Flashcards, quiz questions, and key concepts also display a short excerpt from the source text. A summary point without a source page number, or another resource without either a source page number or source excerpt, is marked as unverified.

### 4.4 Source References and Checking

The app presents Source references as aids for manual checking. It does not represent them as a guarantee that generated resources are correct, complete, or representative of the whole course.

## 5. General Requirements

- **Source transparency:** All four resource types show source page number(s) when available. Each point in a topic-level summary shows its page number(s) alongside the summarized information. Flashcards, quiz questions, and key concepts also show a short excerpt from the source text. Summary points without a source page number, and other resources without either a source page number or source excerpt, are marked unverified.
- **Error handling:** The app gives a clear message when it cannot extract usable PDF text or cannot process a document within its supported limits.
- **Session scope:** The uploaded PDF and generated resources are not saved for later sessions. The student must upload the PDF again to start a new session.
- **Language-model provider data handling:** During architecture, review how the selected provider processes and retains uploaded PDFs and generated content. The app's session-only behavior does not by itself guarantee immediate deletion by the provider.
- **Language:** Norwegian is the main language for all generated resources, including questions, answers, summaries, explanations, and other text. Relevant Latin anatomical terms are retained. When a question asks for a term in Latin, the answer gives the term in Latin; the surrounding text remains in Norwegian.
- **Project constraints:** The MVP is an individual-use web application for one text-based PDF at a time, with a three-month project horizon.
- **Academic integrity:** The app does not guarantee academic correctness or complete coverage of the course material.

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
- Quiz questions with three answer options, submitted as a whole quiz, with correct answers marked green, incorrect responses marked red, and brief explanations grounded in the PDF after submission.
- Retaking a quiz with the questions in a different order.
- Source page number(s) on all resource types when available, and short source excerpts on flashcards, quiz questions, and key concepts.
- Clear Unverified item labels when a summary point lacks a source page number or another resource lacks either a source page number or source excerpt.
- Clear PDF text-extraction and file-limit errors.
- Individual use through a simple web interface.

### 7.2 Out of Scope for MVP

- Scanned PDFs and OCR.
- Saving the uploaded PDF or generated Study resources for later sessions.
- Group study, institutional integrations, mobile apps, advanced personalisation, formal grading, and content libraries.

## 8. Success Metrics

The MVP will be evaluated with two or three sample text-based PDFs. No numerical academic-accuracy guarantee is set.

**Primary**

- **SM-1 — End-to-end study workflow:** For each supported test PDF, document whether upload, text extraction, generation of all four resource types, and review of results can be completed without a blocking error. Also verify that ending or closing the study session makes the PDF and generated resources unavailable and that the student must upload the PDF again to start a new session. Validates FR-1–FR-9.
- **SM-2 — Source-reference inspection:** Manually check that each summary point shows its PDF source page number(s), and check that flashcards, quiz questions, and key concepts show source page number(s) and a short excerpt from the source text. Record matches, mismatches, missing references, and whether items missing required source information are marked Unverified. Validates FR-5–FR-7 and FR-9.
- **SM-3 — Extraction failure handling:** Test a PDF from which usable text cannot be extracted and record whether the app displays a clear error instead of proceeding as if the file were processed. Validates FR-3.

**SM-4 — Quiz interaction:** Verify that each quiz question has three answer options, the student submits the whole quiz, results mark correct answers green and incorrect responses red, provide a brief explanation grounded in the PDF, and a retake presents questions in a different order. Validates FR-7.

**Counter-metric**

- Do not treat the number of generated items as success if items missing a page or excerpt are not marked Unverified.

A small amount of student feedback may also be collected to identify usability issues. Manual source checks do not establish that all generated content is academically correct, complete, or representative of the full course.

## 9. Open Questions

No unresolved user-facing product questions remain. Architecture must still confirm that the selected provider supports the defined PDF limits and review its data-retention practices.

## 10. Assumptions Index

- **[ASSUMPTION] FR-2:** The app can identify when a PDF exceeds either supported limit and can report that clearly. The selected provider's ability to process PDFs within the 50-page and 20 MB limits will be confirmed during architecture.
