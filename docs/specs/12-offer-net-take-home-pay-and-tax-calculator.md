# Feature Spec: Offer Net Take-Home Pay & Tax Calculator Engine

## Problem Statement

As a job seeker in the Philippines evaluating job offers, comparing gross offered salary alone does not reflect actual monthly take-home pay. Standard Philippine job offers vary drastically based on employment type (regular corporate employee vs. 8% self-employed/freelance vs. tax-exempt overseas contract), non-taxable de minimis allowances (rice, food, internet), and company-specific deductions (HMO dependents, company loans, insurance). Without custom tax regime selection and itemized deduction/allowance tracking, offer comparisons fail to show accurate financial reality.

## Solution

A flexible, zero-cost **Offer Net Take-Home Pay & Tax Engine** integrated into the Offer Comparison Matrix (`/job-applications/offers`) and User Settings (`/settings`). It automatically computes statutory contributions (SSS, PhilHealth, Pag-IBIG, BIR TRAIN Law) by default while empowering users to select tax regimes, itemize taxable/non-taxable allowances, add custom deductions, or input manual net pay overrides. Global user defaults cascade automatically to offers, and individual offers can be customized with 1-click resets.

## User Stories

1. As a job applicant comparing job offers, I want to see my calculated monthly net take-home pay alongside the gross salary, so that I can evaluate which offer gives me more actual spendable income.
2. As a regular employee in the Philippines, I want statutory SSS, PhilHealth, Pag-IBIG, and BIR tax automatically deducted from my gross salary by default, so that I don't have to manually look up government tax tables.
3. As a freelance developer / consultant under the BIR 8% flat tax option, I want to select the "PH Freelancer (8% Flat Tax)" regime for an offer, so that my take-home pay accounts for the 8% tax rate above the ₱250,000 annual exemption without corporate employee contributions.
4. As a remote worker receiving a salary from an overseas company, I want to select the "Tax-Exempt / Overseas" regime, so that no local statutory taxes are forcibly withheld from my offer card.
5. As a job seeker receiving non-taxable de minimis benefits (e.g. ₱2,500 rice and internet allowance), I want to add itemized non-taxable allowances to an offer, so that my total net take-home pay reflects these extra tax-free earnings.
6. As a job seeker receiving taxable bonuses or monthly allowances, I want to add itemized taxable allowances to an offer, so that the tax calculator includes them in my gross taxable income before calculating withholding tax.
7. As an employee paying for HMO dependent coverage or insurance premiums, I want to add itemized custom deductions to an offer, so that my net pay reflects my actual bank deposit after corporate payroll deductions.
8. As a job seeker with a fixed agreed net salary contract, I want to enter a manual net salary override for an offer, so that the comparison matrix displays my exact contractually guaranteed take-home pay.
9. As a user on the Offer Comparison matrix page, I want to click a "Customize Net Pay" button on any offer card, so that I can tweak tax settings in an interactive modal without navigating away.
10. As a user editing an application in the Job Application modal, I want to configure tax regime and itemized deductions when updating status to "Offer", so that my preferences are captured immediately.
11. As a user, I want to configure app-wide default tax preferences in my User Settings page, so that all new and default offers automatically apply my preferred tax regime and standard allowances.
12. As a user who customized an offer's tax settings, I want to click a "Reset to Global Default" button inside the customization modal, so that I can instantly revert the offer back to my app-wide default settings.
13. As a user inspecting an offer card, I want to expand an itemized tax breakdown card, so that I can see the exact numerical amounts for SSS, PhilHealth, Pag-IBIG, BIR Tax, allowances, and custom deductions.
14. As a user viewing annual compensation, I want to see both annual gross (including 13th month pay) and estimated annual net pay, so that I can evaluate long-term financial package value.

## Implementation Decisions

### Schema & Data Persistence
- **`users` Table**: Add nullable `tax_settings` JSON column to store global defaults (`regime`, `allowances`, `custom_deductions`).
- **`job_applications` Table**: Add nullable `tax_config` JSON column to store per-offer overrides (`regime`, `allowances`, `custom_deductions`, `manual_net_override`).
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
    "manual_net_override": null
  }
  ```

### Service Layer & Resource Transformation
- Modify `App\Services\PhilippineTaxCalculatorService`:
  - Update `computeMonthlyNetPay(float $monthlySalary, ?array $taxConfig = null, ?array $userDefaults = null): array`.
  - Calculate statutory deductions based on resolved regime (`ph_regular`, `ph_freelance_8`, `tax_exempt`, `custom`).
  - Account for itemized non-taxable/taxable allowances and custom deductions.
- Modify `App\Http\Resources\JobApplicationResource`:
  - Pass resolved `$taxConfig` and `$user->tax_settings` into `PhilippineTaxCalculatorService`.
  - Include `tax_config` in resource output.
- Update `App\Http\Requests\StoreJobApplicationRequest` & `UpdateJobApplicationRequest`:
  - Validate `tax_config` structure, regime enum, array items, and numeric bounds.

### Frontend UI Components (`resources/js/`)
- Modify `resources/js/pages/job-applications/offers/index.tsx`:
  - Render "Customize Net Pay" trigger on `OfferCard`.
  - Render itemized allowances and custom deductions in `TaxBreakdownCard`.
- Create `resources/js/components/job-applications/customize-net-pay-modal.tsx`:
  - Interactive dialog for regime selection, adding/removing itemized allowance & deduction rows, and manual net override.
  - Includes "Reset to Global Default" action.
- Update `resources/js/pages/settings/index.tsx`:
  - Add Global Tax Preferences section to set default user regime and default standard allowances.

## Testing Decisions

### Good Test Principles
- Test external behavior end-to-end via Inertia request responses and domain service unit assertions.
- Verify calculations for each regime (`ph_regular`, `ph_freelance_8`, `tax_exempt`, `custom`).
- Verify fallback inheritance when `tax_config` is `null` vs per-offer custom override.

### Modules Tested
- `PhilippineTaxCalculatorServiceTest`: Unit test statutory formulas, 8% flat tax math, allowance handling, custom deduction subtraction, and manual net overrides.
- `OfferComparisonTest`: Feature test offer list endpoint returns correct transformed `tax_breakdown` prop under user global settings and per-offer `tax_config`.
- `JobApplicationCrudTest`: Feature test creating/updating `job_applications` with valid `tax_config` JSON payload.
- `UserSettingsTest`: Feature test updating user `tax_settings`.

### Prior Art
- Existing `tests/Feature/OfferComparisonTest.php` asserting `tax_breakdown` output keys and net pay presence.

## Out of Scope

- Live integration with foreign currency conversion APIs (all figures remain in PHP ₱).
- Automated tax filing or BIR tax return generation.
- Dynamic historical tax law updates past BIR TRAIN Law brackets.

## Further Notes

- Maintains $0 external API / operational cost.
- Preserves full backwards compatibility for existing job applications without `tax_config` populated.
