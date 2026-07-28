import { Head, Link } from '@inertiajs/react';
import { MapPinIcon, ExternalLinkIcon, TrendingUp, CalendarDays, Briefcase, PhilippinePesoIcon, SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import type {ReactNode} from 'react';
import TaxBreakdownCard from '@/components/job-applications/tax-breakdown-card';
import CustomizeNetPayModal from '@/components/job-applications/customize-net-pay-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { JobApplication, TaxConfig } from '@/types/job-application';

function formatSalary(amount: number | null): string | null {
    if (amount === null) {
return null;
}

    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

function formatDate(date: string | null): string | null {
    if (!date) {
return null;
}

    const d = new Date(date);

    return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function OfferCard({ offer, userDefaults }: { offer: JobApplication; userDefaults: TaxConfig | null }) {
    const tb = offer.tax_breakdown;
    const [customizeOpen, setCustomizeOpen] = useState(false);

    return (
        <>
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <CardTitle className="text-base leading-tight">
                                {offer.job_title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {offer.company_name}
                            </p>
                            {offer.location && (
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPinIcon className="size-3" />
                                    {offer.location}
                                </p>
                            )}
                        </div>
                        <StatusBadge status="offer" />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                    {offer.offered_salary !== null && (
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                            <span className="text-sm text-muted-foreground">Offered Salary</span>
                            <span className="text-lg font-bold tabular-nums text-foreground">
                                {formatSalary(offer.offered_salary)}
                            </span>
                        </div>
                    )}

                    {tb && (
                        <TaxBreakdownCard taxBreakdown={tb} />
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-1.5 text-xs text-muted-foreground"
                        onClick={() => setCustomizeOpen(true)}
                    >
                        <SettingsIcon className="size-3.5" />
                        Customize Net Pay
                    </Button>

                    {offer.ai_match_percentage !== null && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="size-3.5" />
                            <span>Match Score: </span>
                            <span
                                className={`font-semibold ${
                                    offer.ai_match_percentage >= 70
                                        ? 'text-green-600 dark:text-green-400'
                                        : offer.ai_match_percentage >= 40
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                                {offer.ai_match_percentage}%
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        <span>Received: {formatDate(offer.date_applied) ?? formatDate(offer.created_at)}</span>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-2">
                        {offer.job_url && (
                            <a
                                href={offer.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                            >
                                <ExternalLinkIcon className="size-3" />
                                View Job Posting
                            </a>
                        )}
                        <Link
                                    href={`/job-applications`}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <Briefcase className="size-3.5" />
                                    View Details
                                </Link>
                    </div>
                </CardContent>
            </Card>

            <CustomizeNetPayModal
                offer={offer}
                userDefaults={userDefaults}
                open={customizeOpen}
                onOpenChange={setCustomizeOpen}
            />
        </>
    );
}

export default function OfferComparisonIndex({
    offers,
    userDefaults,
}: {
    offers: { data: JobApplication[] } | JobApplication[];
    userDefaults: TaxConfig | null;
}) {
    const offerList = Array.isArray(offers) ? offers : (offers?.data ?? []);

    return (
        <>
            <Head title="Offer Comparison" />

            <div className="flex flex-col gap-6">
                <PageHeader title="Offer Comparison" description="Compare your job offers side by side" />

                {offerList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                        <PhilippinePesoIcon className="size-12 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            No offers yet. Move an application to "Offer" status to see it here.
                        </p>
                        <Link
                            href="/job-applications"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted hover:text-foreground"
                        >
                            Go to Applications
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {offerList.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} userDefaults={userDefaults} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

OfferComparisonIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;