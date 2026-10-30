# Product Brief: AI Study Buddy

## Executive Summary

AI Study Buddy is a web application that helps students create study resources from their own course material. For the MVP, a student uploads one text-based PDF and generates summaries, flashcards, quiz questions, and key concepts.

Flashcards and quiz questions should show a page reference and a short excerpt from the uploaded PDF when returned by the app. If the app does not return a source page and excerpt for an item, the content should be marked as unverified.

The primary example user is a physiotherapy student preparing for an anatomy exam, learning Norwegian and Latin muscle names, locations, and functions. The MVP is limited to individual use, one text-based PDF at a time, and a simple web interface. The project aims to deliver and evaluate this core workflow within a three-month individual student project.

Research question: How can generative artificial intelligence be used to transform students' own course material into useful learning resources that are easier to check against their sources?

## The Problem

Physiotherapy students preparing for anatomy exams may need to study many lecture slides and course documents, including Norwegian and Latin muscle names, locations, and functions. Reviewing all the material repeatedly takes time, and making flashcards or quiz questions manually adds more work.

Students may use general AI tools to create study resources, but the output can include information from outside the course material, use different terminology, or omit topics. Without checking the sources, students may spend time studying material that is not part of their syllabus or miss material they are expected to know.


## The Solution

A student uploads one supported, text-based PDF and generates four types of study resources:

- Summaries to review the main ideas.
- Flashcards to practise remembering information.
- Quiz questions to test understanding.
- Key concepts to highlight important terms and ideas.

When the app returns a source page and excerpt for a flashcard or quiz question, it should display them so students can inspect the original material. If the app does not return both, it should mark the item as unverified.

## What Makes This Different

Tools such as NotebookLM and Quizlet already help students create learning resources from course material. AI Study Buddy explores a focused study workflow that brings summaries, flashcards, quiz questions, and key concepts together, with page references and excerpts for checking flashcards and quiz questions against the uploaded PDF.

The product does not promise that AI-generated content is always correct or complete. Its aim is to make source checking more convenient and make items marked as unverified visible to the student.

## Who This Serves 

The primary target user is a physiotherapy student preparing for an anatomy exam. The student has course PDFs to review and needs to learn Norwegian and Latin muscle names, locations, and functions. They want to spend less time creating study resources manually and have a way to check generated flashcards and quiz questions against their course material.

The MVP is designed around this use case. The underlying workflow may be useful to students in other fields, but broad subject support will not be evaluated as part of the MVP.


## Success Criteria


The MVP will be evaluated using two or three sample text-based PDFs. For each PDF, the project will document whether:

- The student can upload the PDF and generate summaries, flashcards, quiz questions, and key concepts.
- Flashcards and quiz questions show a page reference and excerpt when returned by the app.
- Items for which the app does not return a source page and excerpt are clearly marked as unverified.
- A PDF from which text cannot be extracted produces a clear error message.
- The student can complete the upload, generation, and results-viewing workflow without a blocking error.

A sample of generated flashcards and quiz questions will be checked manually against the stated PDF pages and excerpts. Any issues found will be documented. This evaluation checks whether the source references are useful to inspect; it does not establish that all generated content is accurate, complete, or representative of the full course material. A small amount of user feedback may be collected to identify usability issues.

## Scope

The MVP includes:

- Uploading and processing one text-based PDF at a time.
- Generating summaries, flashcards, quiz questions, and key concepts.
- Showing page references and short excerpts for flashcards and quiz questions when returned by the app.
- Marking items as unverified when the app does not return a source page and excerpt.
- A simple web interface for individual student use.

The MVP excludes scanned-document processing, multiple-document collections, collaborative study groups, institution-wide course integrations, native mobile applications, advanced personalisation, grading, and broad content libraries. It does not guarantee academic correctness or complete coverage of a course. These boundaries keep the work focused and achievable within three months.


## Vision

Over the next two to three years, AI Study Buddy could grow into a personal learning workspace where students organise course materials, create study resources, and build effective study habits. Future versions could support more kinds of learning materials and additional revision tools.

Its long-term direction should remain grounded in transparency: helping students learn from their own course material, inspect AI-generated resources, and identify areas they may need to practise further.