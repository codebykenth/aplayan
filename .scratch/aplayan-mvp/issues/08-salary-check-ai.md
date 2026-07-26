# 08 — Philippine Salary Reality Check AI Feature

**What to build:** An AI Salary Reality Check feature generating a realistic Philippine Peso (₱) salary estimate range and Philippine market tier context for a job application, saving the results to the database record.

**Blocked by:** 05 — Mobile-Friendly Application Detail Modal & Status Picker, 06 — Google Gemini AI Service Abstraction

**Status:** ready-for-agent

- [ ] Create `JobApplicationSalaryController` with `checkSalary` action executing `GeminiService::estimateSalary()`.
- [ ] Save `ai_salary_min`, `ai_salary_max`, and `ai_salary_notes` to the `JobApplication` model.
- [ ] Add "Salary Reality Check (₱)" button inside application detail modal.
- [ ] Render salary estimate card displaying formatted ₱ range (e.g. `₱45,000 – ₱65,000 / mo`) and market context summary.
- [ ] Write Pest feature tests asserting salary calculation flow and DB updates.
