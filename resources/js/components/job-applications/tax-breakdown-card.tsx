import { PhilippinePesoIcon } from 'lucide-react';
import { useState } from 'react';
import type { TaxBreakdown } from '@/types/job-application';

function formatSalary(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

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
                        <span>Monthly Gross</span>
                        <span className="tabular-nums">{formatSalary(tb.monthly_gross)}</span>
                    </div>
                    <div className="flex items-center justify-between text-destructive">
                        <span>SSS</span>
                        <span className="tabular-nums">-{formatSalary(tb.sss)}</span>
                    </div>
                    <div className="flex items-center justify-between text-destructive">
                        <span>PhilHealth</span>
                        <span className="tabular-nums">-{formatSalary(tb.philhealth)}</span>
                    </div>
                    <div className="flex items-center justify-between text-destructive">
                        <span>Pag-IBIG</span>
                        <span className="tabular-nums">-{formatSalary(tb.pagibig)}</span>
                    </div>
                    <div className="flex items-center justify-between text-destructive">
                        <span>BIR Tax</span>
                        <span className="tabular-nums">-{formatSalary(tb.bir_tax)}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>Monthly Net Pay</span>
                        <span className="tabular-nums">{formatSalary(tb.monthly_net)}</span>
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