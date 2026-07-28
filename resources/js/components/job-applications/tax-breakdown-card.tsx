import { PhilippinePesoIcon } from 'lucide-react';
import { useState } from 'react';
import type { TaxBreakdown } from '@/types/job-application';

function formatSalary(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

const REGIME_LABELS: Record<string, string> = {
    ph_regular: 'PH Regular',
    ph_freelance_8: 'Freelancer 8%',
    tax_exempt: 'Tax-Exempt',
    custom: 'Custom',
};

export default function TaxBreakdownCard({ taxBreakdown }: { taxBreakdown: TaxBreakdown }) {
    const [expanded, setExpanded] = useState(false);
    const tb = taxBreakdown;

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground"
            >
                <span className="flex items-center gap-1 font-medium">
                    <PhilippinePesoIcon className="size-3.5" />
                    Net Take-Home Pay Breakdown
                </span>
                <span className="text-sm tabular-nums font-bold text-foreground">
                    {formatSalary(tb.monthly_net)} / mo
                </span>
            </button>
            {expanded && (
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span>Regime</span>
                        <span className="text-xs font-medium">{REGIME_LABELS[tb.regime] ?? tb.regime}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span>Monthly Gross</span>
                        <span className="tabular-nums">{formatSalary(tb.monthly_gross)}</span>
                    </div>
                    {tb.sss > 0 && (
                        <div className="flex items-center justify-between text-destructive">
                            <span>SSS</span>
                            <span className="tabular-nums">-{formatSalary(tb.sss)}</span>
                        </div>
                    )}
                    {tb.philhealth > 0 && (
                        <div className="flex items-center justify-between text-destructive">
                            <span>PhilHealth</span>
                            <span className="tabular-nums">-{formatSalary(tb.philhealth)}</span>
                        </div>
                    )}
                    {tb.pagibig > 0 && (
                        <div className="flex items-center justify-between text-destructive">
                            <span>Pag-IBIG</span>
                            <span className="tabular-nums">-{formatSalary(tb.pagibig)}</span>
                        </div>
                    )}
                    {tb.bir_tax > 0 && (
                        <div className="flex items-center justify-between text-destructive">
                            <span>BIR Tax</span>
                            <span className="tabular-nums">-{formatSalary(tb.bir_tax)}</span>
                        </div>
                    )}
                    {tb.taxable_allowances > 0 && (
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Taxable Allowances</span>
                            <span className="tabular-nums text-foreground">+{formatSalary(tb.taxable_allowances)}</span>
                        </div>
                    )}
                    {tb.non_taxable_allowances > 0 && (
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Non-Taxable Allowances</span>
                            <span className="tabular-nums text-foreground">+{formatSalary(tb.non_taxable_allowances)}</span>
                        </div>
                    )}
                    {tb.custom_deductions > 0 && (
                        <div className="flex items-center justify-between text-destructive">
                            <span>Custom Deductions</span>
                            <span className="tabular-nums">-{formatSalary(tb.custom_deductions)}</span>
                        </div>
                    )}
                    <hr className="border-border" />
                    <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>Monthly Net Pay</span>
                        <span className="tabular-nums">
                            {tb.manual_net_override !== null ? (
                                <span className="text-primary">{formatSalary(tb.monthly_net)} (manual)</span>
                            ) : (
                                formatSalary(tb.monthly_net)
                            )}
                        </span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span>13th Month Pay</span>
                        <span className="tabular-nums">{formatSalary(tb.thirteenth_month)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span>Annual Gross</span>
                        <span className="tabular-nums">{formatSalary(tb.annual_gross)}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>Annual Net</span>
                        <span className="tabular-nums">{formatSalary(tb.annual_net)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}