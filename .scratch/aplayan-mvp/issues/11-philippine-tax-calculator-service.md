# 11 — Philippine Statutory Tax & Net Take-Home Pay Calculator Service

**What to build:** OOP domain service (`PhilippineTaxCalculatorService`) computing statutory Philippine deductions (SSS contribution table, PhilHealth 5%, Pag-IBIG ₱200, and BIR TRAIN Law withholding tax) and 13th-month pay breakdown.

**Blocked by:** 02 — Form Requests & CRUD Backend Controllers

**Status:** ready-for-agent

- [ ] Implement `PhilippineTaxCalculatorService` in `app/Services/PhilippineTaxCalculatorService.php` computing monthly gross, SSS, PhilHealth, Pag-IBIG, BIR tax, monthly net take-home, and annual compensation (with 13th-month pay).
- [ ] Expose net pay breakdown metrics via `JobApplicationResource` (`app/Http/Resources/JobApplicationResource.php`) when `offered_salary` or `expected_salary` is set.
- [ ] Write unit tests in `tests/Unit/PhilippineTaxCalculatorServiceTest.php` asserting exact statutory calculation accuracy across various salary brackets.
