# Product Brief: AI Study Buddy

## Executive Summary

AI Study Buddy is a web application designed to help students learn more effectively from their own course material. Students upload text-based PDFs, such as lecture slides, course notes, or readings, and use generative AI to create four types of learning resources: summaries, flashcards, quiz questions, and key concepts. The aim is to help students understand, practise, and review their course material through one straightforward study workflow.

The project addresses a key challenge in using generative AI for education: AI-generated content can be useful, but students need a simple way to check whether it accurately reflects their course material. AI Study Buddy therefore focuses on source traceability and verification. Flashcards and quiz questions should include page references and short excerpts so students can check the information against the original document. If information cannot be verified against the uploaded material, the application should clearly indicate this.

The primary example user is a physiotherapy student preparing for an anatomy exam who needs to learn the Norwegian and Latin names of muscles, their locations, and their functions. However, the application is intended to support students across different fields of study. The MVP is limited to individual use, text-based PDFs, and a simple web interface, making it realistic to develop and test within a three-month individual student project.

The research question is: “How can generative artificial intelligence be used to transform students' own course material into useful and verifiable learning resources?”

## The Problem

Physiotherapy students need to learn the muscles covered in their anatomy course material, including their Norwegian and Latin names, locations, and functions. Before an anatomy exam, students may have many lecture slides and a large amount of course material to study. Remembering all the names, locations, and functions can be challenging, especially when they need to learn so much information in a limited amount of time.

To save time, students may use AI tools such as ChatGPT or Claude to create flashcards and quiz questions. However, these tools may include information from sources outside the course material, use different terminology, or leave out important topics. If students trust the generated content without checking the sources, they may spend time learning information that is not part of their syllabus while missing information they are expected to know.

This can make exam preparation less effective. Students may believe they are well prepared because they have practised many AI-generated questions, but the questions may not cover the material they will be tested on. They therefore risk being less prepared for the exam than they think.

## The Solution

AI Study Buddy helps students prepare for exams by allowing them to upload their own course material and generate four types of learning resources: summaries, flashcards, quiz questions, and key concepts.

The app is designed to generate content based on the uploaded material. Flashcards and quiz questions should include page references and short excerpts, allowing students to check the information against the original document. If the app cannot find sufficient support for an answer in the uploaded material, it should flag the answer as unverified.

The primary example is a physiotherapy student preparing for an anatomy exam, but the app can be used by students across different fields of study. By bringing these learning resources together and making their sources easier to check, AI Study Buddy aims to make exam preparation more efficient and reliable.

## What Makes This Different

Existing tools such as NotebookLM and Quizlet already help students create learning resources from course material. AI Study Buddy aims to offer a focused study workflow by bringing summaries, flashcards, quiz questions, and key concepts together in one application.

A key focus is making generated content easier to verify. Flashcards and quiz questions should include page references and short excerpts from the uploaded material, allowing students to check the information against the original source.

Rather than guaranteeing that AI-generated content is always correct, AI Study Buddy aims to make studying more transparent and help students identify information that needs further checking.

## Who This Serves 

AI Study Buddy is designed for students who want to study more effectively using their own course material. The primary target user is a physiotherapy student preparing for an anatomy exam.

The student has many lecture slides and documents to study and needs to understand and remember the Norwegian and Latin names of muscles, their locations, and their functions. Reading through all the material repeatedly can be time-consuming, and creating study resources manually takes additional effort. The student also needs to know which topics they understand well and which ones require more practice.

AI Study Buddy helps by turning the student's own course material into summaries, flashcards, quiz questions, and key concepts. Summaries help the student review the main ideas, flashcards support memorisation, quiz questions allow the student to test their understanding, and key concepts highlight important information. Page references and short excerpts in flashcards and quiz questions also help the student check the original material and verify that the information comes from their course content.

Although the primary example is a physiotherapy student studying anatomy, AI Study Buddy can support students in other fields who want to understand, practise, and review their own course material throughout the learning process.

## Success Criteria

The MVP will be considered successful if it meets the following criteria:

Four resource types: A student can upload a supported PDF and generate summaries, flashcards, quiz questions, and key concepts.

Source verification: Flashcards and quiz questions include page numbers and short excerpts that can be checked against the uploaded PDF.

Unsupported information: The app flags answers that cannot be sufficiently supported by the uploaded material.

Error handling: If the app cannot extract text from an uploaded PDF, it displays a clear error message.

Usable workflow: A student can upload a supported PDF, generate all four resource types, and view the results without blocking errors.

These criteria will be tested using two or three sample PDFs. The generated resources, source references, and error handling will be checked and documented for each PDF. A small amount of user feedback may also be collected to identify usability issues.

## Scope

The first version includes uploading and processing text-based PDFs, generating summaries, flashcards, quiz questions, and key concepts, and providing page references and short excerpts that allow students to check generated content against the original course material. It should support individual students using their own documents through a simple web interface.

The MVP excludes scanned-document processing, collaborative study groups, institution-wide course integrations, native mobile applications, advanced personalisation, grading, and broad content libraries. It does not guarantee academic correctness, but aims to make generated content easier to verify by allowing students to inspect the source material. These boundaries keep the project achievable within three months and maintain focus on the research question.

## Vision

Over the next two to three years, AI Study Buddy could become a trusted personal learning workspace where students organise their course material, create study resources, and develop effective study habits. As the product develops, it could support a wider range of learning materials, more advanced revision tools, and features that help students identify topics they need to review.

Its long-term value should remain grounded in transparency. Rather than encouraging students to passively rely on AI-generated answers, AI Study Buddy should help them learn from their own course material, question generated content, and better understand what they know and what they still need to practise.