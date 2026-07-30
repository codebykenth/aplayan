import { Calculator, PhilippinePeso } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

type TaxRegime = 'ph_regular' | 'ph_freelance_8' | 'tax_exempt';

const SSS_BRACKETS = [
    { min: 0, max: 4249.99, employee: 180.0 },
    { min: 4250, max: 4749.99, employee: 202.5 },
    { min: 4750, max: 5249.99, employee: 225.0 },
    { min: 5250, max: 5749.99, employee: 247.5 },
    { min: 5750, max: 6249.99, employee: 270.0 },
    { min: 6250, max: 6749.99, employee: 292.5 },
    { min: 6750, max: 7249.99, employee: 315.0 },
    { min: 7250, max: 7749.99, employee: 337.5 },
    { min: 7750, max: 8249.99, employee: 360.0 },
    { min: 8250, max: 8749.99, employee: 382.5 },
    { min: 8750, max: 9249.99, employee: 405.0 },
    { min: 9250, max: 9749.99, employee: 427.5 },
    { min: 9750, max: 10249.99, employee: 450.0 },
    { min: 10250, max: 10749.99, employee: 472.5 },
    { min: 10750, max: 11249.99, employee: 495.0 },
    { min: 11250, max: 11749.99, employee: 517.5 },
    { min: 11750, max: 12249.99, employee: 540.0 },
    { min: 12250, max: 12749.99, employee: 562.5 },
    { min: 12750, max: 13249.99, employee: 585.0 },
    { min: 13250, max: 13749.99, employee: 607.5 },
    { min: 13750, max: 14249.99, employee: 630.0 },
    { min: 14250, max: 14749.99, employee: 652.5 },
    { min: 14750, max: 15249.99, employee: 675.0 },
    { min: 15250, max: 15749.99, employee: 697.5 },
    { min: 15750, max: 16249.99, employee: 720.0 },
    { min: 16250, max: 16749.99, employee: 742.5 },
    { min: 16750, max: 17249.99, employee: 765.0 },
    { min: 17250, max: 17749.99, employee: 787.5 },
    { min: 17750, max: 18249.99, employee: 810.0 },
    { min: 18250, max: 18749.99, employee: 832.5 },
    { min: 18750, max: 19249.99, employee: 855.0 },
    { min: 19250, max: 19749.99, employee: 877.5 },
    { min: 19750, max: 20249.99, employee: 900.0 },
    { min: 20250, max: 20749.99, employee: 922.5 },
    { min: 20750, max: 21249.99, employee: 945.0 },
    { min: 21250, max: 21749.99, employee: 967.5 },
    { min: 21750, max: 22249.99, employee: 990.0 },
    { min: 22250, max: 22749.99, employee: 1012.5 },
    { min: 22750, max: 23249.99, employee: 1035.0 },
    { min: 23250, max: 23749.99, employee: 1057.5 },
    { min: 23750, max: 24249.99, employee: 1080.0 },
    { min: 24250, max: 24749.99, employee: 1102.5 },
    { min: 24750, max: 25249.99, employee: 1125.0 },
    { min: 25250, max: 25749.99, employee: 1147.5 },
    { min: 25750, max: 26249.99, employee: 1170.0 },
    { min: 26250, max: 26749.99, employee: 1192.5 },
    { min: 26750, max: 27249.99, employee: 1215.0 },
    { min: 27250, max: 27749.99, employee: 1237.5 },
    { min: 27750, max: 28249.99, employee: 1260.0 },
    { min: 28250, max: 28749.99, employee: 1282.5 },
    { min: 28750, max: 29249.99, employee: 1305.0 },
    { min: 29250, max: 29749.99, employee: 1327.5 },
    { min: 29750, max: Infinity, employee: 1350.0 },
];

const BIR_BRACKETS = [
    { min: 0, max: 250_000, base: 0, rate: 0, excessMin: 0 },
    { min: 250_000, max: 400_000, base: 0, rate: 0.15, excessMin: 250_000 },
    { min: 400_000, max: 800_000, base: 22_500, rate: 0.2, excessMin: 400_000 },
    {
        min: 800_000,
        max: 2_000_000,
        base: 102_500,
        rate: 0.25,
        excessMin: 800_000,
    },
    {
        min: 2_000_000,
        max: 8_000_000,
        base: 402_500,
        rate: 0.3,
        excessMin: 2_000_000,
    },
    {
        min: 8_000_000,
        max: Infinity,
        base: 2_202_500,
        rate: 0.35,
        excessMin: 8_000_000,
    },
];

const THIRTEENTH_MONTH_EXEMPTION = 90_000;
const FREELANCE_EXEMPTION = 250_000;

function computeMonthlySss(salary: number): number {
    const bracket = SSS_BRACKETS.find(
        (b) => salary >= b.min && salary <= b.max,
    );
    return bracket?.employee ?? 1350;
}

function computeMonthlyPhilHealth(salary: number): number {
    return Math.round(Math.min(salary, 100_000) * 0.025 * 100) / 100;
}

function computeMonthlyPagIbig(salary: number): number {
    if (salary < 1_500) {
        return Math.round(salary * 0.01 * 100) / 100;
    }
    return Math.min(Math.round(salary * 0.02 * 100) / 100, 100);
}

function computeAnnualTaxableIncome(salary: number): number {
    const annualBasic = salary * 12;
    const taxable13th = Math.max(0, salary - THIRTEENTH_MONTH_EXEMPTION);
    return annualBasic + taxable13th;
}

function computeAnnualBirTax(annualIncome: number): number {
    if (annualIncome <= 250_000) return 0;
    const bracket = BIR_BRACKETS.find(
        (b) => annualIncome > b.min && annualIncome <= b.max,
    );
    if (!bracket) {
        const last = BIR_BRACKETS[BIR_BRACKETS.length - 1];
        return last.base + (annualIncome - last.excessMin) * last.rate;
    }
    return bracket.base + (annualIncome - bracket.excessMin) * bracket.rate;
}

function computeMonthlyBirTax(salary: number): number {
    const annualIncome = computeAnnualTaxableIncome(salary);
    return Math.round((computeAnnualBirTax(annualIncome) / 12) * 100) / 100;
}

interface DeductionRowProps {
    label: string;
    amount: number;
}

function DeductionRow({ label, amount }: DeductionRowProps) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
                {label}
            </span>
            <span className="font-mono font-semibold text-foreground">
                ₱
                {amount.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </span>
        </div>
    );
}

export default function PhPayCalculatorWidget() {
    const [salaryInput, setSalaryInput] = useState('85000');
    const [regime, setRegime] = useState<TaxRegime>('ph_regular');

    const salary = Math.max(0, parseFloat(salaryInput.replace(/,/g, '')) || 0);

    const breakdown = useMemo(() => {
        if (salary <= 0) return null;

        let sss = 0;
        let philHealth = 0;
        let pagIbig = 0;
        let birTax = 0;

        switch (regime) {
            case 'ph_regular':
                sss = computeMonthlySss(salary);
                philHealth = computeMonthlyPhilHealth(salary);
                pagIbig = computeMonthlyPagIbig(salary);
                birTax = computeMonthlyBirTax(salary);
                break;
            case 'ph_freelance_8': {
                const annualGross = salary * 12;
                const annualTax =
                    annualGross <= FREELANCE_EXEMPTION
                        ? 0
                        : (annualGross - FREELANCE_EXEMPTION) * 0.08;
                birTax = Math.round((annualTax / 12) * 100) / 100;
                break;
            }
            case 'tax_exempt':
                break;
        }

        const totalDeductions = sss + philHealth + pagIbig + birTax;
        const netPay = Math.round((salary - totalDeductions) * 100) / 100;

        return { sss, philHealth, pagIbig, birTax, totalDeductions, netPay };
    }, [salary, regime]);

    const regimeOptions: {
        value: TaxRegime;
        label: string;
        description: string;
    }[] = [
        {
            value: 'ph_regular',
            label: 'Regular Employee',
            description: 'SSS, PhilHealth, Pag-IBIG, BIR TRAIN Law',
        },
        {
            value: 'ph_freelance_8',
            label: '8% Freelancer',
            description: 'Simplified 8% income tax',
        },
        {
            value: 'tax_exempt',
            label: 'Tax-Exempt / Overseas',
            description: 'Zero statutory deductions',
        },
    ];

    return (
        <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">
                    Philippine Net Pay Calculator
                </h3>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1fr]">
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="monthly-salary"
                            className="text-sm font-semibold text-foreground"
                        >
                            Monthly Gross Salary (₱) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                                <PhilippinePeso className="h-4 w-4" />
                            </span>
                            <input
                                id="monthly-salary"
                                type="text"
                                value={salaryInput}
                                onChange={(e) => {
                                    const cleaned = e.target.value.replace(
                                        /[^0-9,]/g,
                                        '',
                                    );
                                    setSalaryInput(cleaned);
                                }}
                                className="h-10 w-full rounded-lg border border-input bg-background/50 pr-3 pl-9 text-sm font-semibold text-foreground transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                placeholder="85,000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-foreground">
                            Tax Regime
                        </label>
                        <div className="mt-1.5 flex flex-col gap-2">
                            {regimeOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setRegime(opt.value)}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all',
                                        regime === opt.value
                                            ? 'border-primary bg-primary/15 text-foreground'
                                            : 'border-border bg-background/50 hover:border-foreground/40',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                                            regime === opt.value
                                                ? 'border-primary bg-primary'
                                                : 'border-zinc-400 dark:border-zinc-500',
                                        )}
                                    >
                                        {regime === opt.value && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                                        )}
                                    </span>
                                    <div>
                                        <span className="font-semibold text-foreground">
                                            {opt.label}
                                        </span>
                                        <span className="ml-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                            — {opt.description}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-background/70 p-5">
                    {breakdown ? (
                        <div className="space-y-3.5">
                            <div className="border-b border-border pb-3">
                                <div className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                                    Net Take-Home Pay
                                </div>
                                <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                                    ₱
                                    {breakdown.netPay.toLocaleString('en-PH', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>
                                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                                    from ₱
                                    {salary.toLocaleString('en-PH', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}{' '}
                                    gross
                                </div>
                            </div>

                            <div className="space-y-2">
                                <DeductionRow
                                    label="SSS Contribution"
                                    amount={breakdown.sss}
                                />
                                <DeductionRow
                                    label="PhilHealth"
                                    amount={breakdown.philHealth}
                                />
                                <DeductionRow
                                    label="Pag-IBIG"
                                    amount={breakdown.pagIbig}
                                />
                                <DeductionRow
                                    label="BIR Income Tax"
                                    amount={breakdown.birTax}
                                />
                            </div>

                            <div className="border-t border-border pt-3">
                                <DeductionRow
                                    label="Total Deductions"
                                    amount={breakdown.totalDeductions}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Enter a salary to see breakdown
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
