# 34 — Automated & Customizable Offer Net Take-Home Pay & Tax Calculator Engine

## Problem Statement

When comparing job offers on the Offer Comparison matrix (`/job-applications/offers`), evaluating gross offered salary alone is misleading. Standard Philippine job offers vary significantly based on tax regimes (regular corporate employee vs. 8% self-employed/freelance vs. tax-exempt overseas contract), non-taxable de minimis allowances (rice, internet, tech), and company-specific deductions (HMO dependents, company loans, insurance). Without custom tax regime selection, itemized deduction/allowance tracking, and manual statutory overrides, offer comparisons fail to show accurate financial reality. Furthermore, saving incomplete or invalid input (such as entering text in amount fields or submitting empty amounts with descriptions) causes silent state corruption without proper validation errors.

## Solution

Build a flexible, zero-cost **Offer Net Take-Home Pay & Tax Engine** integrated into the Offer Comparison Matrix (`/job-applications/offers`), Job Application Form modal, and User Settings (`/settings`). Automatically compute statutory contributions (SSS, PhilHealth, Pag-IBIG, BIR TRAIN Law) by default while empowering users to select tax regimes, itemize taxable/non-taxable allowances, add custom deductions, set manual net pay overrides, or configure **manual statutory deduction overrides** (SSS, PhilHealth, Pag-IBIG, BIR Tax) via a collapsible section. Enforce strict backend FormRequest and frontend input validation to ensure empty or invalid amounts trigger clear inline validation errors rather than silently saving incomplete entries.

## User Stories

1. As a job applicant comparing job offers, I want to see my calculated monthly net take-home pay alongside the gross salary, so that I can evaluate which offer gives me more actual spendable income.
2. As a regular employee in the Philippines, I want statutory SSS, PhilHealth, Pag-IBIG, and BIR tax automatically deducted from my gross salary by default, so that I don't have to manually look up government tax tables.
3. As a job applicant with non-standard employment contributions, I want a collapsible "Statutory Deduction Overrides" section in the Customize Net Pay modal to manually override individual SSS, PhilHealth, Pag-IBIG, or BIR Tax figures, so that the engine accommodates my specific compensation structure.
4. As a user adding itemized allowances or custom deductions, I want strict input validation so that leaving an amount empty or entering invalid characters displays a clear validation error instead of saving an incomplete item.
5. As a freelance developer / consultant under the BIR 8% flat tax option, I want to select the "PH Freelancer (8% Flat Tax)" regime for an offer, so that my take-home pay accounts for the 8% tax rate above the ₱250,000 annual exemption without corporate employee contributions.
6. As a remote worker receiving a salary from an overseas company, I want to select the "Tax-Exempt / Overseas" regime, so that no local statutory taxes are forcibly withheld from my offer card.
7. As a job seeker receiving non-taxable de minimis benefits (e.g. ₱2,500 rice and internet allowance), I want to add itemized non-taxable allowances to an offer, so that my total net take-home pay reflects these extra tax-free earnings.
8. As a job seeker receiving taxable bonuses or monthly allowances, I want to add itemized taxable allowances to an offer, so that the tax calculator includes them in my gross taxable income before calculating withholding tax.
9. As an employee paying for HMO dependent coverage or insurance premiums, I want to add itemized custom deductions to an offer, so that my net pay reflects my actual bank deposit after corporate payroll deductions.
10. As a job seeker with a fixed agreed net salary contract, I want to enter a manual net salary override for an offer, so that the comparison matrix displays my exact contractually guaranteed take-home pay.
11. As a user on the Offer Comparison matrix page, I want to click a "Customize Net Pay & Deductions" action on any offer card, so that I can tweak tax settings in an interactive modal without navigating away.
12. As a user editing an application in the Job Application modal, I want to configure tax regime, statutory overrides, and itemized deductions in Tab 1, so that my preferences are captured immediately.
13. As a user, I want to configure app-wide default tax preferences in my User Settings page, so that all new and default offers automatically apply my preferred tax regime and standard allowances.
14. As a user who customized an offer's tax settings, I want to click a "Reset to Global Default" button inside the customization modal, so that I can instantly revert the offer back to my app-wide default settings.
15. As a user inspecting an offer card, I want to expand an itemized tax breakdown card, so that I can see the exact numerical amounts for SSS, PhilHealth, Pag-IBIG, BIR Tax, allowances, and custom deductions.
16. As a user viewing annual compensation, I want to see both annual gross (including 13th month pay) and estimated annual net pay, so that I can evaluate long-term financial package value.

## Implementation Decisions

### Schema & Data Persistence
- **`users` Table**: Add nullable `tax_settings` JSON column to store global defaults (`regime`, `allowances`, `custom_deductions`).
- **`job_applications` Table**: Add nullable `tax_config` JSON column to store per-offer overrides (`regime`, `allowances`, `custom_deductions`, `manual_net_override`, `override_sss`, `override_philhealth`, `override_pagibig`, `override_bir_tax`).
- **JSON Structure**:
  ```json
  {
    "regime": "ph_regular",
    "allowances": [
      { "name": "Rice & Internet Allowance", "amount": 2500, "taxable": false }
    ],
    "custom_deductions": [
      { "name": "HMO Dependent", "amount": 1200 }
    ],
    "manual_net_override": null,
    "override_sss": null,
    "override_philhealth": null,
    "override_pagibig": null,
    "override_bir_tax": null
  }
  ```

### Service Layer & Resource Transformation
- Modify `App\Services\PhilippineTaxCalculatorService`:
  - Calculate statutory deductions based on resolved regime (`ph_regular`, `ph_freelance_8`, `tax_exempt`, `custom`).
  - Check for manual statutory overrides (`override_sss`, `override_philhealth`, `override_pagibig`, `override_bir_tax`); if set, use manual override over computed statutory defaults.
  - Account for itemized non-taxable/taxable allowances and custom deductions.
- Modify `App\Http\Requests\StoreJobApplicationRequest`, `UpdateJobApplicationRequest`, & `UpdateTaxSettingsRequest`:
  - Require `tax_config.allowances.*.name` (`required|string|max:255`).
  - Require `tax_config.allowances.*.amount` (`required|numeric|min:0`).
  - Require `tax_config.custom_deductions.*.name` (`required|string|max:255`).
  - Require `tax_config.custom_deductions.*.amount` (`required|numeric|min:0`).
  - Validate `override_sss`, `override_philhealth`, `override_pagibig`, `override_bir_tax` as `nullable|numeric|min:0`.

### Frontend UI Components (`resources/js/`)
- Modify `resources/js/components/job-applications/customize-net-pay-modal.tsx`:
  - Collapsible **"Statutory Deduction Overrides"** section containing numeric input fields for SSS, PhilHealth, Pag-IBIG, and BIR Tax.
  - Enforce frontend type validation (`type="number"`, `min="0"`, `step="any"`). Prevent submitting item rows with empty or non-numeric amount fields, displaying inline validation feedback.
- Update `resources/js/components/job-applications/application-detail-modal.tsx`:
  - Include the collapsible Statutory Deduction Overrides section inside Tab 1's Offer & Tax Configuration accordion.

## Testing Decisions

### Good Test Criteria
Tests verify end-to-end tax calculation output, regime handling, statutory deduction manual overrides, validation error triggers on invalid/missing amounts, and per-offer override inheritance via HTTP Inertia responses and service unit assertions.

### Tested Modules & Seams
- **Unit Tests (`tests/Unit/PhilippineTaxCalculatorServiceTest.php`)**:
  - Test statutory formulas for PH regular employee.
  - Test manual statutory deduction overrides (`override_sss`, `override_philhealth`, `override_pagibig`, `override_bir_tax`).
  - Test 8% flat tax for PH freelancer.
  - Test tax-exempt overseas calculation.
  - Test taxable vs. non-taxable allowances.
  - Test custom itemized deductions.
  - Test manual net pay override.
- **Feature Tests (`tests/Feature/JobApplicationCrudTest.php`)**:
  - Test creating/updating `job_applications` with valid `tax_config` JSON payload.
  - Test validation failure when `allowances` or `custom_deductions` contain empty/non-numeric amounts.

## Out of Scope

- Live integration with foreign currency conversion APIs (all figures remain in PHP ₱).
- Automated tax filing or BIR tax return form generation.
- Dynamic historical tax law updates past BIR TRAIN Law brackets.

## Further Notes

- Maintains $0 external API / operational cost.
- Preserves full backwards compatibility for existing job applications without `tax_config` populated.
