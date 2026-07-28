<?php

namespace App\Services;

class PhilippineTaxCalculatorService
{
    private const PHILHEALTH_RATE = 0.05;

    private const PHILHEALTH_EMPLOYEE_SHARE = 0.025;

    private const PHILHEALTH_CEILING = 100_000;

    private const PAGIBIG_CAP = 100;

    private const PAGIBIG_RATE = 0.02;

    private const MIN_WAGE_THRESHOLD = 1_500;

    private const THIRTEENTH_MONTH_EXEMPTION = 90_000;

    private const array SSS_BRACKETS = [
        ['min' => 0, 'max' => 4249.99, 'msc' => 4000, 'employee' => 180.00],
        ['min' => 4250, 'max' => 4749.99, 'msc' => 4500, 'employee' => 202.50],
        ['min' => 4750, 'max' => 5249.99, 'msc' => 5000, 'employee' => 225.00],
        ['min' => 5250, 'max' => 5749.99, 'msc' => 5500, 'employee' => 247.50],
        ['min' => 5750, 'max' => 6249.99, 'msc' => 6000, 'employee' => 270.00],
        ['min' => 6250, 'max' => 6749.99, 'msc' => 6500, 'employee' => 292.50],
        ['min' => 6750, 'max' => 7249.99, 'msc' => 7000, 'employee' => 315.00],
        ['min' => 7250, 'max' => 7749.99, 'msc' => 7500, 'employee' => 337.50],
        ['min' => 7750, 'max' => 8249.99, 'msc' => 8000, 'employee' => 360.00],
        ['min' => 8250, 'max' => 8749.99, 'msc' => 8500, 'employee' => 382.50],
        ['min' => 8750, 'max' => 9249.99, 'msc' => 9000, 'employee' => 405.00],
        ['min' => 9250, 'max' => 9749.99, 'msc' => 9500, 'employee' => 427.50],
        ['min' => 9750, 'max' => 10249.99, 'msc' => 10000, 'employee' => 450.00],
        ['min' => 10250, 'max' => 10749.99, 'msc' => 10500, 'employee' => 472.50],
        ['min' => 10750, 'max' => 11249.99, 'msc' => 11000, 'employee' => 495.00],
        ['min' => 11250, 'max' => 11749.99, 'msc' => 11500, 'employee' => 517.50],
        ['min' => 11750, 'max' => 12249.99, 'msc' => 12000, 'employee' => 540.00],
        ['min' => 12250, 'max' => 12749.99, 'msc' => 12500, 'employee' => 562.50],
        ['min' => 12750, 'max' => 13249.99, 'msc' => 13000, 'employee' => 585.00],
        ['min' => 13250, 'max' => 13749.99, 'msc' => 13500, 'employee' => 607.50],
        ['min' => 13750, 'max' => 14249.99, 'msc' => 14000, 'employee' => 630.00],
        ['min' => 14250, 'max' => 14749.99, 'msc' => 14500, 'employee' => 652.50],
        ['min' => 14750, 'max' => 15249.99, 'msc' => 15000, 'employee' => 675.00],
        ['min' => 15250, 'max' => 15749.99, 'msc' => 15500, 'employee' => 697.50],
        ['min' => 15750, 'max' => 16249.99, 'msc' => 16000, 'employee' => 720.00],
        ['min' => 16250, 'max' => 16749.99, 'msc' => 16500, 'employee' => 742.50],
        ['min' => 16750, 'max' => 17249.99, 'msc' => 17000, 'employee' => 765.00],
        ['min' => 17250, 'max' => 17749.99, 'msc' => 17500, 'employee' => 787.50],
        ['min' => 17750, 'max' => 18249.99, 'msc' => 18000, 'employee' => 810.00],
        ['min' => 18250, 'max' => 18749.99, 'msc' => 18500, 'employee' => 832.50],
        ['min' => 18750, 'max' => 19249.99, 'msc' => 19000, 'employee' => 855.00],
        ['min' => 19250, 'max' => 19749.99, 'msc' => 19500, 'employee' => 877.50],
        ['min' => 19750, 'max' => 20249.99, 'msc' => 20000, 'employee' => 900.00],
        ['min' => 20250, 'max' => 20749.99, 'msc' => 20500, 'employee' => 922.50],
        ['min' => 20750, 'max' => 21249.99, 'msc' => 21000, 'employee' => 945.00],
        ['min' => 21250, 'max' => 21749.99, 'msc' => 21500, 'employee' => 967.50],
        ['min' => 21750, 'max' => 22249.99, 'msc' => 22000, 'employee' => 990.00],
        ['min' => 22250, 'max' => 22749.99, 'msc' => 22500, 'employee' => 1012.50],
        ['min' => 22750, 'max' => 23249.99, 'msc' => 23000, 'employee' => 1035.00],
        ['min' => 23250, 'max' => 23749.99, 'msc' => 23500, 'employee' => 1057.50],
        ['min' => 23750, 'max' => 24249.99, 'msc' => 24000, 'employee' => 1080.00],
        ['min' => 24250, 'max' => 24749.99, 'msc' => 24500, 'employee' => 1102.50],
        ['min' => 24750, 'max' => 25249.99, 'msc' => 25000, 'employee' => 1125.00],
        ['min' => 25250, 'max' => 25749.99, 'msc' => 25500, 'employee' => 1147.50],
        ['min' => 25750, 'max' => 26249.99, 'msc' => 26000, 'employee' => 1170.00],
        ['min' => 26250, 'max' => 26749.99, 'msc' => 26500, 'employee' => 1192.50],
        ['min' => 26750, 'max' => 27249.99, 'msc' => 27000, 'employee' => 1215.00],
        ['min' => 27250, 'max' => 27749.99, 'msc' => 27500, 'employee' => 1237.50],
        ['min' => 27750, 'max' => 28249.99, 'msc' => 28000, 'employee' => 1260.00],
        ['min' => 28250, 'max' => 28749.99, 'msc' => 28500, 'employee' => 1282.50],
        ['min' => 28750, 'max' => 29249.99, 'msc' => 29000, 'employee' => 1305.00],
        ['min' => 29250, 'max' => 29749.99, 'msc' => 29500, 'employee' => 1327.50],
        ['min' => 29750, 'max' => PHP_FLOAT_MAX, 'msc' => 30000, 'employee' => 1350.00],
    ];

    private const array BIR_TRAIN_BRACKETS = [
        ['min' => 0, 'max' => 250_000, 'base' => 0, 'rate' => 0, 'excess_min' => 0],
        ['min' => 250_000, 'max' => 400_000, 'base' => 0, 'rate' => 0.15, 'excess_min' => 250_000],
        ['min' => 400_000, 'max' => 800_000, 'base' => 22_500, 'rate' => 0.20, 'excess_min' => 400_000],
        ['min' => 800_000, 'max' => 2_000_000, 'base' => 102_500, 'rate' => 0.25, 'excess_min' => 800_000],
        ['min' => 2_000_000, 'max' => 8_000_000, 'base' => 402_500, 'rate' => 0.30, 'excess_min' => 2_000_000],
        ['min' => 8_000_000, 'max' => PHP_FLOAT_MAX, 'base' => 2_202_500, 'rate' => 0.35, 'excess_min' => 8_000_000],
    ];

    public function computeMonthlySss(float $monthlySalary): float
    {
        foreach (self::SSS_BRACKETS as $bracket) {
            if ($monthlySalary >= $bracket['min'] && $monthlySalary <= $bracket['max']) {
                return $bracket['employee'];
            }
        }

        return end(self::SSS_BRACKETS)['employee'];
    }

    public function computeMonthlyPhilHealth(float $monthlySalary): float
    {
        $baseSalary = min($monthlySalary, self::PHILHEALTH_CEILING);

        return round($baseSalary * self::PHILHEALTH_EMPLOYEE_SHARE, 2);
    }

    public function computeMonthlyPagIbig(float $monthlySalary): float
    {
        if ($monthlySalary < self::MIN_WAGE_THRESHOLD) {
            return round($monthlySalary * 0.01, 2);
        }

        return min(round($monthlySalary * self::PAGIBIG_RATE, 2), self::PAGIBIG_CAP);
    }

    public function computeAnnualBirTax(float $annualTaxableIncome): float
    {
        if ($annualTaxableIncome <= 250_000) {
            return 0;
        }

        foreach (self::BIR_TRAIN_BRACKETS as $bracket) {
            if ($annualTaxableIncome > $bracket['min'] && $annualTaxableIncome <= $bracket['max']) {
                $excess = $annualTaxableIncome - $bracket['excess_min'];

                return $bracket['base'] + ($excess * $bracket['rate']);
            }
        }

        $last = end(self::BIR_TRAIN_BRACKETS);
        $excess = $annualTaxableIncome - $last['excess_min'];

        return $last['base'] + ($excess * $last['rate']);
    }

    public function computeMonthlyBirTax(float $monthlySalary): float
    {
        $annualTaxableIncome = $this->computeAnnualTaxableIncome($monthlySalary);
        $annualTax = $this->computeAnnualBirTax($annualTaxableIncome);

        return round($annualTax / 12, 2);
    }

    public function computeThirteenthMonthPay(float $monthlySalary): float
    {
        return $monthlySalary;
    }

    public function computeTaxableThirteenthMonth(float $monthlySalary): float
    {
        return max(0, $monthlySalary - self::THIRTEENTH_MONTH_EXEMPTION);
    }

    public function computeAnnualTaxableIncome(float $monthlySalary): float
    {
        $annualBasic = $monthlySalary * 12;
        $thirteenthMonth = $this->computeThirteenthMonthPay($monthlySalary);
        $nonTaxable13th = min($thirteenthMonth, self::THIRTEENTH_MONTH_EXEMPTION);
        $taxable13th = $thirteenthMonth - $nonTaxable13th;

        return $annualBasic + $taxable13th;
    }

    private const FREELANCE_8_EXEMPTION = 250_000;

    private const FREELANCE_8_RATE = 0.08;

    public function computeFreelanceEightTax(float $annualGrossIncome): float
    {
        if ($annualGrossIncome <= self::FREELANCE_8_EXEMPTION) {
            return 0;
        }

        return ($annualGrossIncome - self::FREELANCE_8_EXEMPTION) * self::FREELANCE_8_RATE;
    }

    public function resolveTaxConfig(?array $offerConfig, ?array $userDefaults): array
    {
        $offerConfig = $offerConfig ?? [];
        $userDefaults = $userDefaults ?? [];

        $resolved = [
            'regime' => $offerConfig['regime'] ?? $userDefaults['regime'] ?? 'ph_regular',
            'allowances' => $offerConfig['allowances'] ?? $userDefaults['allowances'] ?? [],
            'custom_deductions' => $offerConfig['custom_deductions'] ?? $userDefaults['custom_deductions'] ?? [],
            'manual_net_override' => $offerConfig['manual_net_override'] ?? null,
        ];

        return $resolved;
    }

    public function computeMonthlyNetPay(float $monthlySalary, ?array $taxConfig = null, ?array $userDefaults = null): array
    {
        $config = $this->resolveTaxConfig($taxConfig, $userDefaults);
        $regime = $config['regime'];

        if ($config['manual_net_override'] !== null) {
            $manualNet = (float) $config['manual_net_override'];

            return $this->buildResult(
                monthlySalary: $monthlySalary,
                sss: 0,
                philHealth: 0,
                pagIbig: 0,
                birTax: 0,
                regime: $regime,
                allowances: $config['allowances'],
                customDeductions: $config['custom_deductions'],
                manualNetOverride: $manualNet,
            );
        }

        $taxableAllowances = $this->sumAllowances($config['allowances'], taxable: true);
        $nonTaxableAllowances = $this->sumAllowances($config['allowances'], taxable: false);
        $totalCustomDeductions = $this->sumCustomDeductions($config['custom_deductions']);

        $effectiveMonthlySalary = $monthlySalary + $taxableAllowances;

        match ($regime) {
            'ph_regular' => $result = $this->computeRegularEmployee($effectiveMonthlySalary),
            'ph_freelance_8' => $result = $this->computeFreelanceEmployee($effectiveMonthlySalary),
            'tax_exempt' => $result = [
                'sss' => 0,
                'philhealth' => 0,
                'pagibig' => 0,
                'bir_tax' => 0,
            ],
            default => $result = [
                'sss' => 0,
                'philhealth' => 0,
                'pagibig' => 0,
                'bir_tax' => 0,
            ],
        };

        $totalStatutoryDeductions = $result['sss'] + $result['philhealth'] + $result['pagibig'] + $result['bir_tax'];
        $netPay = round($monthlySalary + $nonTaxableAllowances - $totalStatutoryDeductions - $totalCustomDeductions, 2);

        return $this->buildResult(
            monthlySalary: $monthlySalary,
            sss: $result['sss'],
            philHealth: $result['philhealth'],
            pagIbig: $result['pagibig'],
            birTax: $result['bir_tax'],
            regime: $regime,
            allowances: $config['allowances'],
            customDeductions: $config['custom_deductions'],
            netPay: $netPay,
        );
    }

    private function computeRegularEmployee(float $monthlySalary): array
    {
        return [
            'sss' => $this->computeMonthlySss($monthlySalary),
            'philhealth' => $this->computeMonthlyPhilHealth($monthlySalary),
            'pagibig' => $this->computeMonthlyPagIbig($monthlySalary),
            'bir_tax' => $this->computeMonthlyBirTax($monthlySalary),
        ];
    }

    private function computeFreelanceEmployee(float $monthlySalary): array
    {
        $annualGross = $monthlySalary * 12;
        $annualTax = $this->computeFreelanceEightTax($annualGross);

        return [
            'sss' => 0,
            'philhealth' => 0,
            'pagibig' => 0,
            'bir_tax' => round($annualTax / 12, 2),
        ];
    }

    private function sumAllowances(array $allowances, bool $taxable): float
    {
        $total = 0.0;
        foreach ($allowances as $allowance) {
            if (($allowance['taxable'] ?? false) === $taxable) {
                $total += (float) ($allowance['amount'] ?? 0);
            }
        }

        return $total;
    }

    private function sumCustomDeductions(array $deductions): float
    {
        $total = 0.0;
        foreach ($deductions as $deduction) {
            $total += (float) ($deduction['amount'] ?? 0);
        }

        return $total;
    }

    private function buildResult(
        float $monthlySalary,
        float $sss,
        float $philHealth,
        float $pagIbig,
        float $birTax,
        string $regime,
        array $allowances,
        array $customDeductions,
        ?float $netPay = null,
        ?float $manualNetOverride = null,
    ): array {
        $totalStatutory = $sss + $philHealth + $pagIbig + $birTax;
        $taxableAllowances = $this->sumAllowances($allowances, taxable: true);
        $nonTaxableAllowances = $this->sumAllowances($allowances, taxable: false);
        $totalCustomDeductions = $this->sumCustomDeductions($customDeductions);
        $totalAllowances = $taxableAllowances + $nonTaxableAllowances;

        if ($manualNetOverride !== null) {
            $netPay = $manualNetOverride;
        }

        $annualNet = $manualNetOverride !== null
            ? round(($manualNetOverride * 12) + $this->computeThirteenthMonthPay($monthlySalary), 2)
            : round(($netPay * 12) + $this->computeThirteenthMonthPay($monthlySalary), 2);

        return [
            'monthly_gross' => round($monthlySalary, 2),
            'regime' => $regime,
            'sss' => $sss,
            'philhealth' => $philHealth,
            'pagibig' => $pagIbig,
            'bir_tax' => $birTax,
            'total_statutory_deductions' => round($totalStatutory, 2),
            'taxable_allowances' => round($taxableAllowances, 2),
            'non_taxable_allowances' => round($nonTaxableAllowances, 2),
            'total_allowances' => round($totalAllowances, 2),
            'custom_deductions' => round($totalCustomDeductions, 2),
            'total_deductions' => round($totalStatutory + $totalCustomDeductions, 2),
            'monthly_net' => $netPay !== null ? round($netPay, 2) : round($monthlySalary - $totalStatutory - $totalCustomDeductions, 2),
            'manual_net_override' => $manualNetOverride,
            'thirteenth_month' => round($this->computeThirteenthMonthPay($monthlySalary), 2),
            'annual_gross' => round($monthlySalary * 13, 2),
            'annual_net' => $annualNet,
        ];
    }
}
