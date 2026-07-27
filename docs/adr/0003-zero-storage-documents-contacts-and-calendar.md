# 3. Phase 2 Architecture: Zero-Storage Document Builder, Linked Contacts, and Calendar Suite

Date: 2026-07-27

## Status
Accepted

## Context
Following Phase 1 (Action Feed, Analytics Page, Goals Page), Phase 2 expands Aplayan with three additional modules:
1. **Dynamic Resume & Cover Letter Document Builder**
2. **Networking & Contacts Management**
3. **Application & Interview Calendar Suite**

We need an architectural decision on how to deliver ATS-friendly resume generation without introducing expensive cloud file storage (S3/R2/Blob), how to structure recruiter/contact relationships cleanly, and how to build the calendar view without duplicate database state.

## Decision

### 1. Dynamic Resume & Cover Letter Builder (Zero File Storage)
- **Database Storage**: User profile data (personal info, summary, work history, education, skills, certifications) is stored as structured JSON or DB records in a `resume_profiles` table. No PDF or DOCX binary files are uploaded or stored in S3/disk.
- **Client-Side ATS Rendering & PDF Export**: React components render the resume dynamically using CSS print stylesheets / browser print API (`window.print()`) or client-side canvas/PDF rendering.
- **Multiple ATS Templates**: 3 customizable visual styles ("Clean Minimal", "Modern Professional", "Philippine Standard").
- **AI Cover Letter Integration**: Gemini API generates customized cover letter text on-demand using stored resume profile data + target `JobApplication` description.

### 2. Standalone & Linked Contacts (`Contacts`)
- **Database Schema**: `contacts` table (`name`, `email`, `phone`, `company_name`, `role`, `notes`, `last_contacted_at`).
- **Many-to-Many Relationship**: `contact_job_application` pivot table allows associating a recruiter or manager with multiple job applications across different roles.
- **UI Exposure**: Dedicated `/contacts` page for global management, plus an embedded contacts tab on individual `JobApplication` detail modals.

### 3. Read-Only Calendar Suite (`Calendar`)
- **Zero Duplicate Event Storage**: The calendar view directly queries `JobApplication` records (`interview_date`, `date_applied`, `last_contacted_at`) and generates calculated follow-up reminder events dynamically on the fly.
- **UI Exposure**: Dedicated `/calendar` page featuring month/week views with color-coded status badges and direct click-through to job application details.

## Consequences
- **Pros**:
  - Maintain $0 file hosting costs by storing zero static document files in cloud storage.
  - Full relational flexibility for recruiters and hiring managers handling multiple roles.
  - Zero DB clutter for calendar events since all dates are computed directly from application lifecycles.
- **Cons**:
  - Requires maintaining client-side CSS print styles for crisp PDF export across browsers.
