import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureRow {
    category: string;
    excel: boolean | string;
    generic: boolean | string;
    aplayan: boolean | string;
    highlight?: boolean;
}

const features: FeatureRow[] = [
    {
        category: 'AI Resume Match Analysis',
        excel: false,
        generic: false,
        aplayan: 'Real-time AI score + skill gap detection',
        highlight: true,
    },
    {
        category: 'Philippine Statutory Tax Engine',
        excel: 'Manual formulas',
        generic: false,
        aplayan: 'Auto SSS, PhilHealth, Pag-IBIG, BIR',
        highlight: true,
    },
    {
        category: 'Zero-Storage Resume Privacy',
        excel: 'Stored on your device',
        generic: 'Cloud stored',
        aplayan: 'Ephemeral in-memory only',
        highlight: true,
    },
    {
        category: 'ATS PDF Resume Export',
        excel: false,
        generic: 'Basic export',
        aplayan: 'Multi-template ATS-optimized',
        highlight: true,
    },
    {
        category: 'Multi-Currency FX Engine',
        excel: 'Manual conversion',
        generic: false,
        aplayan: 'Live rates, auto-normalize',
        highlight: true,
    },
    {
        category: 'Smart Action Feed',
        excel: false,
        generic: 'Basic reminders',
        aplayan: 'Priority-ranked AI-driven actions',
        highlight: true,
    },
    {
        category: 'Kanban Job Board',
        excel: false,
        generic: 'List view only',
        aplayan: 'Drag-and-drop Kanban + modal',
    },
    {
        category: 'Analytics Dashboard',
        excel: 'Manual charts',
        generic: 'Basic stats',
        aplayan: '6 interactive Recharts',
    },
    {
        category: 'Free Forever',
        excel: 'License cost',
        generic: 'Subscription fee',
        aplayan: true,
        highlight: true,
    },
];

function CellValue({ value, isAplayan = false }: { value: boolean | string; isAplayan?: boolean }) {
    if (value === true) {
        return <Check className="h-4.5 w-4.5 text-emerald-500" />;
    }
    if (value === false) {
        return <X className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />;
    }
    return (
        <span
            className={cn(
                'text-xs leading-tight',
                isAplayan
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'font-medium text-zinc-700 dark:text-zinc-300',
            )}
        >
            {value}
        </span>
    );
}

export default function ComparisonMatrix() {
    return (
        <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm sm:p-8">
            <h3 className="text-xl font-bold text-foreground">
                Why teams switch to Aplayan
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                See how Aplayan compares to spreadsheets and generic application trackers.
            </p>

            <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-2.5 pr-4 text-left text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">Feature</th>
                            <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">Excel / Sheets</th>
                            <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">Generic Trackers</th>
                            <th className="py-2.5 px-3 text-center text-xs font-bold text-foreground">
                                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                                    Aplayan
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((row) => (
                            <tr
                                key={row.category}
                                className={cn(
                                    'border-b border-border/60 transition-colors hover:bg-muted/30',
                                    row.highlight && 'bg-primary/[0.03]',
                                )}
                            >
                                <td className="py-3.5 pr-4 text-sm font-semibold text-foreground">
                                    {row.category}
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <div className="flex justify-center">
                                        <CellValue value={row.excel} />
                                    </div>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <div className="flex justify-center">
                                        <CellValue value={row.generic} />
                                    </div>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <div className="flex justify-center">
                                        <CellValue value={row.aplayan} isAplayan />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
