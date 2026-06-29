# agents.md

> **Project Constitution**
>
> **Project:** AI-Powered Study Platform (Startup MVP)
>
> This document is the single source of truth for every AI coding assistant, contributor, and developer working on this project.
>
> Every AI MUST read this file completely before making any modifications.

---

# 1. Mission

This project is an AI-powered study platform focused on helping students study smarter, not harder.

The objective is **not** to build another AI chatbot.

The objective is to build an intelligent learning companion that helps students:

* Learn efficiently
* Understand difficult topics
* Remember information longer
* Identify weaknesses
* Stay motivated
* Prepare for exams

This is an MVP startup.

The first priority is validating product-market fit.

Not building enterprise software.

---

# 2. Startup Philosophy

Every implementation must prioritize:

1. Simplicity
2. Maintainability
3. Low Cost
4. Fast Iteration
5. Excellent User Experience
6. Real Student Problems

Avoid unnecessary complexity.

Premature optimization is prohibited.

Only build features users can actually notice.

---

# 3. AI Startup Rules

AI is an assistant.

AI is NOT:

* Product Owner
* Software Architect
* Business Owner
* CTO

If requirements are unclear:

Ask.

Never assume.

---

# 4. Before Implementing Anything

Every AI MUST read this document.

Before generating code, AI must understand:

* project goals
* architecture
* folder structure
* coding standards
* API conventions
* security requirements
* database rules

Never begin implementation without understanding the project.

---

# 5. Cost Optimization

This project should remain FREE until users are willing to pay.

Always prefer:

* Open Source
* Browser APIs
* Free Tier Services
* Native Framework Features

Avoid recommending paid services.

Avoid enterprise infrastructure.

Do NOT introduce:

* Kubernetes
* Docker Swarm
* Kafka
* RabbitMQ
* ElasticSearch
* Redis (unless absolutely necessary)
* Microservices

Monolith architecture is preferred.

---

# 6. Preferred Technology Stack

Frontend

* React
* Vite
* JavaScript (ES Modules)
* Tailwind CSS
* React Router

Backend

* Node.js
* Express
* JavaScript

Database

* MongoDB Atlas Free Tier
* Mongoose

Authentication

* jsonwebtoken (JWT)
* HTTP Only Cookies
* bcrypt

State Management

* Zustand

Validation

* Joi (backend)

Storage

* Cloudinary Free

Deployment

Frontend

* Vercel or Netlify

Backend

* Render or Railway

Testing

* Vitest
* Playwright

Documentation

* Markdown

---

# 7. Architecture

Use Modular Monolith Architecture.

Do NOT create microservices.

Client (Vite + React)

/src

/components

/pages

/context

/hooks

/lib

/assets

Server (Express)

/src

/routes

/controllers

/models

/middlewares

/services

/config

/utils

/docs

---

# 8. AI Architecture

Never create one giant AI service.

Use specialized services.

Example

AI Gateway

↓

Tutor AI

↓

Quiz AI

↓

Study Planner AI

↓

Notes AI

↓

Weakness Analyzer AI

↓

Progress AI

Only the gateway communicates with the frontend.

---

# 9. Working Code Protection

Working features are protected.

AI must NEVER

* rewrite working code
* refactor unrelated files
* rename existing APIs
* replace existing architecture

unless explicitly instructed.

New features must integrate with existing functionality.

---

# 10. Protected Areas

AI cannot modify without permission:

Authentication

Authorization

Environment configuration

Database connection

Security middleware

Payment logic

AI prompts

Shared utilities

Production configuration

---

# 11. Security Rules

Never expose:

.env

JWT Secret

API Keys

OpenAI Keys

Cloudinary Secrets

Mongo URI

Webhook Secrets

Admin Routes

Internal URLs

Private Prompts

System Prompts

Even during:

logging

debugging

examples

fallbacks

documentation

---

# 12. AI Restrictions

AI must NEVER

invent APIs

invent environment variables

invent database collections

invent hidden routes

invent secret prompts

invent business logic

invent admin features

invent permissions

If missing information exists:

Explain what is missing.

Wait for confirmation.

---

# 13. Feature Development Workflow

Every feature follows:

Research

↓

Planning

↓

Architecture Review

↓

Database Review

↓

API Design

↓

UI Design

↓

Implementation

↓

Testing

↓

Documentation

↓

Merge

Skipping steps is prohibited.

---

# 14. Student First Principle

Every feature must answer:

Does this help students learn better?

If the answer is NO,

do not build it.

---

# 15. Code Standards

Always write:

Readable code.

Predictable code.

Maintainable code.

Avoid clever code.

Favor clarity over optimization.

---

# 16. Naming

Components

PascalCase

Functions

camelCase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

Files

kebab-case

Folders

lowercase

---

# 17. JavaScript

Use modern ES Modules (import/export).

Use const and let. Never var.

Use destructuring where readable.

Use template literals.

Use async/await over raw promises.

Use JSDoc comments for complex functions.

Use PropTypes for React components where helpful.

---

# 18. Error Handling

Never silently fail.

Return useful messages.

Log internal errors.

Never expose stack traces to users.

---

# 19. Logging

Never log

passwords

tokens

cookies

JWT

API Keys

Secrets

Personal student information

---

# 20. Authentication

Use JWT.

Store tokens inside HTTP Only Cookies.

Never store JWT inside Local Storage.

---

# 21. Authorization

Authentication is NOT Authorization.

Always validate permissions.

Never trust frontend validation.

---

# 22. Database

Use MongoDB.

Use Mongoose.

Collections should remain small and focused.

Avoid deeply nested documents.

Reference where appropriate.

---

# 23. API Rules

RESTful APIs.

Consistent naming.

Use proper status codes.

Always validate input.

Return predictable responses.

---

# 24. Validation

Every input must be validated.

Frontend validation is convenience.

Backend validation is mandatory.

---

# 25. AI Services

AI should never directly access database models.

AI should communicate through service layers.

Never mix AI logic with controllers.

---

# 26. UI Principles

Simple.

Clean.

Student-friendly.

Accessible.

Responsive.

Mobile First.

Dark Mode Ready.

Minimal animations.

---

# 27. Accessibility

Use semantic HTML.

Keyboard navigation.

Proper labels.

Readable contrast.

ARIA only when necessary.

---

# 28. Performance

Optimize only when necessary.

Do not prematurely optimize.

Measure first.

Optimize later.

---

# 29. Feature Scope

Implement only requested features.

Do NOT

refactor unrelated files

rename folders

replace libraries

change architecture

unless explicitly instructed.

---

# 30. Documentation

Every major feature requires documentation.

Document

purpose

architecture

API

database impact

limitations

---

# 31. Git Rules

Small commits.

Meaningful messages.

No massive commits.

One feature per pull request.

---

# 32. AI Checklist

Before coding

✓ Read agents.md

✓ Understand architecture

✓ Check folder structure

✓ Check existing APIs

✓ Check existing components

✓ Check database

✓ Check authentication

✓ Check authorization

✓ Check UI consistency

✓ Check responsiveness

✓ Check documentation

Only then write code.

---

# 33. Feature Checklist

Every feature must include

UI

API

Validation

Error Handling

Loading States

Empty States

Responsive Design

Documentation

---

# 34. Startup Mindset

Do not build for one million users.

Build for the first one hundred.

Then one thousand.

Then ten thousand.

Scale only when necessary.

---

# 35. AI Goal

The AI exists to accelerate development.

Never to control the project.

The human developer always has the final decision.

---

# 36. Final Rule

Whenever there is uncertainty:

Stop.

Explain.

Ask for clarification.

Do not guess.

This document overrides assumptions.

Every AI assistant must follow this constitution before making any modification to the project.
