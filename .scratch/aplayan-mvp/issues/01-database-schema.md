# 01 — Job Applications Database Schema & Migration

**What to build:** Create the `job_applications` database table and Eloquent model to persist job application data (company, position, location, status, dates, salaries in ₱, and AI result fields) for authenticated users.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Create migration for `job_applications` table with `user_id` FK (indexed), `company_name`, `job_title`, `job_url`, `job_description`, `location`, `status` (enum: wishlist, applied, interviewing, offer, rejected, indexed), `date_applied`, `expected_salary`, `offered_salary`, `notes`, `ai_match_percentage`, `ai_strengths` (json), `ai_gaps` (json), `ai_salary_min`, `ai_salary_max`, `ai_salary_notes`, and `ai_evaluated_at`.
- [ ] Create `JobApplication` Eloquent model with explicit `$fillable`, model strict mode compliance, and `user()` belongsTo relationship.
- [ ] Add `jobApplications()` hasMany relationship on `User` model.
- [ ] Create `JobApplicationFactory` and database seeder for testing.
