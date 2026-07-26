import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { SearchIcon, PlusIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import JobApplicationCard from '@/components/job-applications/job-application-card';
import JobApplicationForm from '@/components/job-applications/job-application-form';
import { STATUS_COLORS, JOB_APPLICATION_STATUSES } from '@/types/job-application';
import type { JobApplication, JobApplicationStatus } from '@/types/job-application';
import { destroy as jobAppDestroy } from '@/routes/job-applications';

const ALL_STATUS = 'all' as const;

type FilterStatus = JobApplicationStatus | typeof ALL_STATUS;

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
    { value: ALL_STATUS, label: 'All' },
    ...JOB_APPLICATION_STATUSES,
];

export default function JobApplicationsIndex({
    applications,
}: {
    applications: { data: JobApplication[] } | JobApplication[];
}) {
    const applicationList = Array.isArray(applications)
        ? applications
        : (applications?.data ?? []);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>(ALL_STATUS);
    const [formOpen, setFormOpen] = useState(false);
    const [editingApplication, setEditingApplication] =
        useState<JobApplication | null>(null);

    const filtered = useMemo(() => {
        return applicationList.filter((app) => {
            const matchesSearch =
                !search ||
                app.company_name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                app.job_title.toLowerCase().includes(search.toLowerCase()) ||
                app.location?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === ALL_STATUS || app.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [applicationList, search, statusFilter]);

    function openCreate() {
        setEditingApplication(null);
        setFormOpen(true);
    }

    function openEdit(app: JobApplication) {
        setEditingApplication(app);
        setFormOpen(true);
    }

    function handleDelete(app: JobApplication) {
        if (
            !window.confirm(
                `Delete application for ${app.job_title} at ${app.company_name}?`,
            )
        ) {
            return;
        }

        router.delete(jobAppDestroy.url(app.id));
    }

    return (
        <>
            <Head title="Job Applications" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Job Applications
                    </h1>
                    <Button onClick={openCreate}>
                        <PlusIcon data-icon="inline-start" />
                        New Application
                    </Button>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-xs">
                        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-8"
                            placeholder="Search applications..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTERS.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setStatusFilter(value)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                    statusFilter === value
                                        ? value !== ALL_STATUS
                                            ? STATUS_COLORS[value]
                                            : 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                {value === ALL_STATUS
                                    ? label
                                    : label}
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                            {applicationList.length === 0
                                ? 'No job applications yet.'
                                : 'No applications match your filters.'}
                        </p>
                        {applicationList.length === 0 && (
                            <Button variant="outline" onClick={openCreate}>
                                <PlusIcon data-icon="inline-start" />
                                Add your first application
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((app) => (
                            <JobApplicationCard
                                key={app.id}
                                application={app}
                                onEdit={() => openEdit(app)}
                                onDelete={() => handleDelete(app)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <JobApplicationForm
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingApplication(null);
                }}
                application={editingApplication}
            />
        </>
    );
}