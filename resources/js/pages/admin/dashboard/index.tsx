import { Head } from '@inertiajs/react';
import { Users, Briefcase, FileText, Cpu } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import AdminLayout from '@/layouts/admin-layout';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    description?: string;
}

function MetricCard({ title, value, icon, description }: MetricCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard({
    total_users = 0,
    active_job_applications = 0,
    total_resumes = 0,
    daily_ai_api_calls = 0,
}: {
    total_users?: number;
    active_job_applications?: number;
    total_resumes?: number;
    daily_ai_api_calls?: number;
}) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <PageHeader
                    title="Admin Dashboard"
                    description="Platform-wide metrics and system overview"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Total Users"
                        value={total_users}
                        icon={<Users className="size-4" />}
                        description="Registered accounts"
                    />
                    <MetricCard
                        title="Active Applications"
                        value={active_job_applications}
                        icon={<Briefcase className="size-4" />}
                        description="Applied / Interviewing / Offer"
                    />
                    <MetricCard
                        title="Generated Resumes"
                        value={total_resumes}
                        icon={<FileText className="size-4" />}
                        description="Saved resumes"
                    />
                    <MetricCard
                        title="AI API Calls Today"
                        value={daily_ai_api_calls}
                        icon={<Cpu className="size-4" />}
                        description="Daily AI consumption"
                    />
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
