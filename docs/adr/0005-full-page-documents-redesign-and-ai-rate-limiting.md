# 5. Full-Page Documents Suite Redesign & Daily AI Rate Limiting Architecture

Date: 2026-07-27

## Status
Accepted

## Context
The initial Documents page used a split side-by-side layout (editor form on the left, live preview on the right) and an on-demand modal for AI cover letter generation. 

To provide a superior, distraction-free document crafting experience with full-screen editing, dedicated manual cover letter creation, and robust AI assistance without API budget overruns, we are redesigning the Documents suite.

## Decisions

### 1. View Navigation Architecture
- **Full-Page Tab Navigation**: Replace the split-screen view with full-page views switched via a top segmented navigation bar:
  1. **Resume Builder** (full-page form editor with item-level AI polish)
  2. **Cover Letter Builder** (full-page dual-mode editor: manual writing + AI generation/assist)
  3. **Resume Preview** (full-page printable A4 document view + PDF export)
  4. **Cover Letter Preview** (full-page printable document view with matched styling + export)
- **Single Page Application (SPA) State**: Navigation between builder and preview views occurs client-side without full-page server reloads, preserving transient editing state.

### 2. Dual-Mode Cover Letter Builder
- **Manual Scratchpad + AI Assist**: Support writing cover letters from scratch or generating them via Gemini API using the resume profile + job description.
- **Manual Editing Canvas**: Allow full manual customization of AI-generated content or user-written text.

### 3. Matched Document Template Engine
- **Unified Branding**: Resume Preview and Cover Letter Preview share synchronized template styles (`Clean Minimal`, `Modern Professional`, `Philippine Standard`) to ensure consistent typography, headers, and visual layout when submitting applications.

### 4. Targeted AI Improvement & Daily Active User (DAU) Rate Limiting
- **Section-Level AI Polish**: Field-level `✨ AI Polish` triggers for Resume (Summary, Work Experience, Projects) and Cover Letter editor presets (`Polish & Grammar`, `Make Concise`, `Make Formal`).
- **Daily Rate Limiting**: Enforce a strict daily quota (e.g. 20 AI requests per user/day) using Laravel Cache/RateLimiter (`RateLimiter::for('ai')`) to protect Gemini API quotas and ensure cost scalability.

## Consequences
- **Pros**:
  - Distraction-free, full-width document editing and high-fidelity preview experience.
  - Complete flexibility for job seekers wanting manual or AI-assisted cover letter creation.
  - Predictable API cost control and protection against high user request volume.
- **Cons**:
  - Requires maintaining client-side state sync between editor inputs and full-page previews.
