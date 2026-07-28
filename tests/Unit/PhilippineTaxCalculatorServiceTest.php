<?php

use App\Services\PhilippineTaxCalculatorService;

beforeEach(function () {
    $this->calculator = new PhilippineTaxCalculatorService;
});

it('computes SSS for minimum wage earner', function () {
    expect($this->calculator->computeMonthlySss(10_000))->toBe(450.00);
});

it('computes SSS for mid-range salary', function () {
    expect($this->calculator->computeMonthlySss(25_000))->toBe(1125.00);
});

it('computes SSS for high salary', function () {
    expect($this->calculator->computeMonthlySss(50_000))->toBe(1350.00);
});

it('computes SSS for below minimum bracket', function () {
    expect($this->calculator->computeMonthlySss(1_000))->toBe(180.00);
});

it('computes PhilHealth at 2.5% employee share', function () {
    $result = $this->calculator->computeMonthlyPhilHealth(30_000);
    $expected = round(30_000 * 0.025, 2);

    expect($result)->toBe($expected);
});

it('computes PhilHealth with cap at 100k', function () {
    $result = $this->calculator->computeMonthlyPhilHealth(150_000);
    $expected = round(100_000 * 0.025, 2);

    expect($result)->toBe($expected);
});

it('computes Pag-IBIG at 100 cap for mid salary', function () {
    expect($this->calculator->computeMonthlyPagIbig(30_000))->toBe(100.00);
});

it('computes Pag-IBIG at 2% for above minimum wage', function () {
    expect($this->calculator->computeMonthlyPagIbig(3_000))->toBe(60.00);
});

it('computes Pag-IBIG at 1% for below threshold', function () {
    expect($this->calculator->computeMonthlyPagIbig(1_000))->toBe(10.00);
});

it('computes zero BIR tax for annual income under 250k', function () {
    $annual = 240_000;

    expect($this->calculator->computeAnnualBirTax($annual))->toBe(0.0);
});

it('computes BIR tax for 300k annual income', function () {
    $annual = 300_000;
    $expected = (300_000 - 250_000) * 0.15;

    expect($this->calculator->computeAnnualBirTax($annual))->toBe($expected);
});

it('computes BIR tax for 600k annual income', function () {
    $annual = 600_000;
    $expected = 22_500 + (600_000 - 400_000) * 0.20;

    expect($this->calculator->computeAnnualBirTax($annual))->toBe($expected);
});

it('computes BIR tax for 1.5M annual income', function () {
    $annual = 1_500_000;
    $expected = 102_500 + (1_500_000 - 800_000) * 0.25;

    expect($this->calculator->computeAnnualBirTax($annual))->toBe($expected);
});

it('computes BIR tax for 5M annual income', function () {
    $annual = 5_000_000;
    $expected = 402_500 + (5_000_000 - 2_000_000) * 0.30;

    expect($this->calculator->computeAnnualBirTax($annual))->toBe($expected);
});

it('computes BIR tax for 10M annual income', function () {
    $annual = 10_000_000;
    $expected = 2_202_500 + (10_000_000 - 8_000_000) * 0.35;

    expect($this->calculator->computeAnnualBirTax($annual))->toBe($expected);
});

it('returns full net pay breakdown for a given salary', function () {
    $result = $this->calculator->computeMonthlyNetPay(25_000);

    expect($result)->toHaveKeys([
        'monthly_gross', 'sss', 'philhealth', 'pagibig', 'bir_tax',
        'total_deductions', 'monthly_net', 'thirteenth_month',
        'annual_gross', 'annual_net',
    ]);

    expect($result['monthly_gross'])->toBe(25000.00);
    expect($result['sss'])->toBe(1125.00);
    expect($result['philhealth'])->toBe(625.00);
    expect($result['pagibig'])->toBe(100.00);
    expect($result['thirteenth_month'])->toBe(25000.00);
    expect($result['annual_gross'])->toBe(325000.00);
});

it('computes monthly net pay for 25k salary correctly', function () {
    $result = $this->calculator->computeMonthlyNetPay(25_000);

    expect($result['bir_tax'])->toBe(625.00);

    $expectedDeductions = $result['sss'] + $result['philhealth'] + $result['pagibig'] + $result['bir_tax'];
    expect($result['total_deductions'])->toBe($expectedDeductions);

    $expectedNet = round(25000 - $expectedDeductions, 2);
    expect($result['monthly_net'])->toBe($expectedNet);
});

it('computes monthly net pay for 50k salary correctly', function () {
    $result = $this->calculator->computeMonthlyNetPay(50_000);

    expect($result['sss'])->toBe(1350.00);
    expect($result['philhealth'])->toBe(1250.00);
    expect($result['pagibig'])->toBe(100.00);

    $annualTaxable = 50_000 * 12; // 600000, 13th month fully exempt under 90k
    $annualTax = 22_500 + ($annualTaxable - 400_000) * 0.20; // 22500 + 40000 = 62500
    $expectedMonthlyTax = round($annualTax / 12, 2);

    expect($result['bir_tax'])->toBe($expectedMonthlyTax);
});

it('returns ph_regular regime by default', function () {
    $result = $this->calculator->computeMonthlyNetPay(25_000);

    expect($result['regime'])->toBe('ph_regular');
});

it('computes tax-exempt regime with zero deductions', function () {
    $result = $this->calculator->computeMonthlyNetPay(50_000, ['regime' => 'tax_exempt']);

    expect($result['regime'])->toBe('tax_exempt');
    expect($result['sss'])->toBe(0.0);
    expect($result['philhealth'])->toBe(0.0);
    expect($result['pagibig'])->toBe(0.0);
    expect($result['bir_tax'])->toBe(0.0);
    expect($result['monthly_net'])->toBe(50_000.00);
});

it('computes freelance 8% flat tax regime', function () {
    $result = $this->calculator->computeMonthlyNetPay(50_000, ['regime' => 'ph_freelance_8']);

    expect($result['regime'])->toBe('ph_freelance_8');
    expect($result['sss'])->toBe(0.0);
    expect($result['philhealth'])->toBe(0.0);
    expect($result['pagibig'])->toBe(0.0);

    $annualGross = 50_000 * 12;
    $expectedTax = ($annualGross - 250_000) * 0.08;
    expect($result['bir_tax'])->toBe(round($expectedTax / 12, 2));
});

it('computes freelance 8% with zero tax under 250k annual', function () {
    $result = $this->calculator->computeMonthlyNetPay(20_000, ['regime' => 'ph_freelance_8']);

    expect($result['bir_tax'])->toBe(0.0);
    expect($result['monthly_net'])->toBe(20_000.00);
});

it('includes taxable allowances in gross for tax computation', function () {
    $config = [
        'regime' => 'ph_regular',
        'allowances' => [
            ['name' => 'Monthly Bonus', 'amount' => 5000, 'taxable' => true],
        ],
    ];

    $result = $this->calculator->computeMonthlyNetPay(25_000, $config);

    expect($result['taxable_allowances'])->toBe(5000.00);
    expect($result['total_allowances'])->toBe(5000.00);

    $withoutAllowance = $this->calculator->computeMonthlyNetPay(25_000);
    expect($result['bir_tax'])->toBeGreaterThan($withoutAllowance['bir_tax']);
});

it('adds non-taxable allowances to net pay after deductions', function () {
    $config = [
        'regime' => 'ph_regular',
        'allowances' => [
            ['name' => 'Rice Allowance', 'amount' => 2500, 'taxable' => false],
        ],
    ];

    $result = $this->calculator->computeMonthlyNetPay(25_000, $config);
    $base = $this->calculator->computeMonthlyNetPay(25_000);

    expect($result['non_taxable_allowances'])->toBe(2500.00);
    expect($result['monthly_net'])->toBe($base['monthly_net'] + 2500);
});

it('subtracts custom deductions from net pay', function () {
    $config = [
        'regime' => 'ph_regular',
        'custom_deductions' => [
            ['name' => 'HMO Dependent', 'amount' => 1200],
        ],
    ];

    $result = $this->calculator->computeMonthlyNetPay(25_000, $config);
    $base = $this->calculator->computeMonthlyNetPay(25_000);

    expect($result['custom_deductions'])->toBe(1200.00);
    expect($result['monthly_net'])->toBe($base['monthly_net'] - 1200);
});

it('returns manual net override when provided', function () {
    $config = [
        'regime' => 'ph_regular',
        'manual_net_override' => 30000,
    ];

    $result = $this->calculator->computeMonthlyNetPay(50_000, $config);

    expect($result['monthly_net'])->toBe(30000.00);
    expect($result['manual_net_override'])->toBe(30000.00);
    expect($result['sss'])->toBe(0.0);
    expect($result['bir_tax'])->toBe(0.0);
});

it('resolves offer config over user defaults', function () {
    $userDefaults = [
        'regime' => 'ph_regular',
        'allowances' => [
            ['name' => 'Rice', 'amount' => 2000, 'taxable' => false],
        ],
    ];

    $offerConfig = [
        'regime' => 'tax_exempt',
        'allowances' => [],
    ];

    $result = $this->calculator->computeMonthlyNetPay(30_000, $offerConfig, $userDefaults);

    expect($result['regime'])->toBe('tax_exempt');
    expect($result['monthly_net'])->toBe(30_000.00);
});

it('falls back to user defaults when offer config is null', function () {
    $userDefaults = [
        'regime' => 'ph_freelance_8',
    ];

    $result = $this->calculator->computeMonthlyNetPay(40_000, null, $userDefaults);

    expect($result['regime'])->toBe('ph_freelance_8');
    expect($result['sss'])->toBe(0.0);
});

it('combines taxable and non-taxable allowances with custom deductions', function () {
    $config = [
        'regime' => 'ph_regular',
        'allowances' => [
            ['name' => 'Bonus', 'amount' => 5000, 'taxable' => true],
            ['name' => 'Rice', 'amount' => 2500, 'taxable' => false],
        ],
        'custom_deductions' => [
            ['name' => 'HMO', 'amount' => 1200],
            ['name' => 'Loan', 'amount' => 800],
        ],
    ];

    $result = $this->calculator->computeMonthlyNetPay(25_000, $config);

    expect($result['taxable_allowances'])->toBe(5000.00);
    expect($result['non_taxable_allowances'])->toBe(2500.00);
    expect($result['total_allowances'])->toBe(7500.00);
    expect($result['custom_deductions'])->toBe(2000.00);
});

it('computes annual net with 13th month for regular regime', function () {
    $result = $this->calculator->computeMonthlyNetPay(25_000);

    $expectedAnnualNet = round(($result['monthly_net'] * 12) + 25_000, 2);
    expect($result['annual_net'])->toBe($expectedAnnualNet);
});

it('computes annual net with 13th month for manual override', function () {
    $config = ['manual_net_override' => 30000];
    $result = $this->calculator->computeMonthlyNetPay(50_000, $config);

    $expectedAnnualNet = round((30000 * 12) + 50_000, 2);
    expect($result['annual_net'])->toBe($expectedAnnualNet);
});
