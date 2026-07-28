# 9. Automated & Customizable Offer Net Take-Home Pay Engine

Date: 2026-07-28

## Status

Accepted

## Context

When users compare job offers on the Offer Comparison matrix (`/job-applications/offers`), relying solely on gross offered salary is misleading. Offers vary widely based on tax regimes (e.g. PH Regular Employee vs. 8% Freelancer vs. Tax-Exempt Remote/Overseas), non-taxable de minimis allowances (e.g. rice, tech, food), company deductions (e.g. HMO dependent fees, insurance), and custom statutory contribution structures.

Previously, `PhilippineTaxCalculatorService` automatically applied fixed PH regular employee statutory contribution rates (SSS, PhilHealth, Pag-IBIG, BIR tax) without allowing users to customize tax regimes, override statutory amounts, add itemized allowances, or specify custom deductions.

## Decision

We adopt a **Hybrid Zero-Cost Tax Engine Strategy with Global Defaults, Manual Statutory Overrides, and Strict Input Validation**:

1. **Tax Regimes Supported**:
   - `ph_regular`: Standard PH statutory deductions (SSS, PhilHealth 2.5%, Pag-IBIG cap ₱100, BIR TRAIN Law withholding).
   - `ph_freelance_8`: 8% flat tax on annual income above ₱250k exemption (zero mandatory statutory employee contributions unless added).
   - `tax_exempt`: Tax-free / overseas contract (Net Pay = Gross Pay + Non-Taxable Allowances - Custom Deductions).
   - `custom`: Manual net pay override or custom tax percentage.

2. **Manual Statutory Overrides**:
   - Support optional numeric overrides for SSS (`override_sss`), PhilHealth (`override_philhealth`), Pag-IBIG (`override_pagibig`), and BIR Tax (`override_bir_tax`). When set, the engine bypasses government formulas and applies the user's manual contribution values.

3. **Itemized Allowances & Custom Deductions**:
   - Allowances: itemized array of `{ name: string, amount: number, taxable: boolean }`.
   - Custom Deductions: itemized array of `{ name: string, amount: number }`.

4. **Strict Input & API Validation**:
   - All monetary amounts in `allowances`, `custom_deductions`, `manual_net_override`, and statutory overrides require strict numeric validation (`numeric|min:0`).
   - Frontend components block submitting empty amounts or non-numeric strings and display inline validation feedback.

5. **Data Persistence**:
   - `users.tax_settings`: Nullable JSON column on `users` table storing user-level global default tax regime, default allowances, and default deductions.
   - `job_applications.tax_config`: Nullable JSON column on `job_applications` table storing per-offer overrides (including manual statutory overrides). If `null`, calculation automatically inherits the user's `tax_settings` or system default.

6. **UI & User Experience**:
   - Each card on `/job-applications/offers` features a **"Customize Net Pay & Deductions"** modal trigger.
   - Collapsible **"Statutory Deduction Overrides"** section allows overriding SSS, PhilHealth, Pag-IBIG, and BIR Tax figures individually.
   - A **"Reset to Global Defaults"** button reverts offer overrides back to global settings.

## Consequences

- **Pros**:
  - $0 external API/service costs.
  - Flexibility for local employees, freelancers, and remote workers with unique statutory arrangements.
  - Prevention of invalid data entry through robust backend and frontend validation.
- **Cons**:
  - Requires additional JSON schema fields and service layer priority logic.
