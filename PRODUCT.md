# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual physiotherapy students preparing for anatomy exams. They use their own course material and need to learn Norwegian and Latin muscle names, locations, and functions.

## Product Purpose

AI Study Buddy turns one course PDF into summaries, key concepts, flashcards, and quiz questions. It helps students spend less time creating study resources manually and makes it easier to inspect generated items against the source PDF.

## Positioning

A focused single-PDF study workflow that brings four resource types together and displays page-level source references and excerpts so students can inspect generated resources against their own course material. Source checks do not guarantee academic correctness or complete coverage.

## Operating Context

The primary use case is a physiotherapy student studying anatomy from lecture slides or notes before an exam. The MVP is for individual use, with one text-based PDF in a temporary study session. Students can create and review multiple resource types from that PDF. Ending or closing the session clears the PDF and generated resources; refreshing or reopening starts a new session.

## Capabilities and Constraints

- Upload one text-based PDF per study session, up to 20 MB and 50 pages.
- Generate summaries, key concepts, flashcards, and quiz questions from the uploaded PDF.
- Display source page references and excerpts with generated resources, and mark missing or unverified references “Ubekreftet.”
- Let the student open a cited PDF page beside the study resource.
- Student-facing copy is Norwegian; preserve Norwegian and Latin anatomical terms from the course material.
- The MVP excludes scanned-document processing, multiple-document collections, collaboration, institution-wide integrations, and native mobile apps.
- The evaluation checks usefulness of source references; it does not establish correctness or complete course coverage.

## Evidence on Hand

- Product brief: `product-brief.md`.
- Product requirements: `.docs/planning-artifacts/prds/prd-Programmering med AI 2026-2026-11-04/prd.md`.
- A three-page demo PDF is identified in the PRD at `output/pdf/demo-anatomi-ai-study-buddy.pdf`.
- No implemented application is present in this project worktree; the requested output is a set of visual concepts.

## Product Principles

- Keep the student's own course material as the basis for generated resources.
- Make source references easy to inspect alongside the learning activity.
- Make unverified information visible without implying the rest is academically guaranteed.
- Support focused individual study with a simple, bounded workflow.

## Accessibility & Inclusion

The experience should target WCAG 2.2 AA for text, controls, focus indication, and responsive reflow, as recorded in the current experience brief. Do not rely on color alone to communicate source status or quiz correctness.
