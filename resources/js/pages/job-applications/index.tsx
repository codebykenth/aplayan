import { Head, router, useForm } from '@inertiajs/react';
import { SearchIcon, PlusIcon, DownloadIcon, UploadIcon, ZapIcon } from 'lucide-react';
import { useState, useMemo, useRef, useEffect  } from 'react';
import type {ReactNode} from 'react';
import QuickApplyDialog from '@/components/application-templates/quick-apply-dialog';
import ApplicationDetailModal from '@/components/job-applications/application-detail-modal';
import JobApplicationForm from '@/components/job-applications/job-application-form';
import KanbanBoard from '@/components/job-applications/kanban-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { destroy as jobAppDestroy, exportMethod, importMethod } from '@/routes/job-applications';
import type { ApplicationTemplate } from '@/types/application-template';
import type { Contact } from '@/types/contact';
import { STATUS_COLORS, JOB_APPLICATION_STATUSES } from '@/types/job-application';
import type { JobApplication, JobApplicationStatus } from '@/types/job-application';

const ALL_STATUS = 'all' as const;

type FilterStatus = JobApplicationStatus | typeof ALL_STATUS;

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
    { value: ALL_STATUS, label: 'All' },
    ...JOB_APPLICATION_STATUSES,
];

export default function JobApplicationsIndex({
    applications,
    templates = [],
    contacts = [],
}: {
    applications: { data: JobApplication[] } | JobApplication[];
    templates?: ApplicationTemplate[];
    contacts?: Contact[];
}) {
    const applicationList = Array.isArray(applications)
        ? applications
        : (applications?.data ?? []);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>(ALL_STATUS);
    const [formOpen, setFormOpen] = useState(false);
    const [editingApplication, setEditingApplication] =
        useState<JobApplication | null>(null);
    const [viewingApplication, setViewingApplication] =
        useState<JobApplication | null>(null);
    const [quickApplyOpen, setQuickApplyOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importForm = useForm<{ file: File | null }>({ file: null });

    function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            importForm.setData('file', file);
            importForm.post(importMethod.url(), {
                onSuccess: () => {
                    importForm.reset();

                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
                preserveScroll: true,
            });
        }
    }

    useEffect(() => {
        if (!exportOpen) {
return;
}

        function handleClickOutside() {
            setExportOpen(false);
        }

        document.addEventListener('click', handleClickOutside);

        return () => document.removeEventListener('click', handleClickOutside);
    }, [exportOpen]);

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

    function openView(app: JobApplication) {
        setViewingApplication(app);
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

            <div className="flex flex-1 min-h-0 flex-col gap-4 sm:gap-6">
                <div className="flex shrink-0 items-center justify-between">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Job Applications
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExportOpen(!exportOpen);
                                }}
                            >
                                <DownloadIcon data-icon="inline-start" />
                                Export Data
                            </Button>
                            {exportOpen && (
                                <div
                                    className="absolute right-0 top-full z-50 mt-1 min-w-36 rounded-lg border bg-popover p-1 shadow-md"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <a
                                        href={exportMethod.url({ query: { format: 'csv' } })}
                                        download
                                        className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => setExportOpen(false)}
                                    >
                                        Export as CSV
                                    </a>
                                    <a
                                        href={exportMethod.url({ query: { format: 'json' } })}
                                        download
                                        className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => setExportOpen(false)}
                                    >
                                        Export as JSON
                                    </a>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadIcon data-icon="inline-start" />
                            Import CSV
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleImportChange}
                            className="hidden"
                        />
                        {templates.length > 0 && (
                            <Button variant="secondary" onClick={() => setQuickApplyOpen(true)}>
                                <ZapIcon data-icon="inline-start" />
                                Quick Apply
                            </Button>
                        )}
                        <Button onClick={openCreate}>
                            <PlusIcon data-icon="inline-start" />
                            New Application
                        </Button>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-xs">
                        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-8"
                            placeholder="Search applications..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="hidden md:flex flex-wrap gap-2">
                        {STATUS_FILTERS.map(({ value, label }) => {
                            const count = value === ALL_STATUS
                                ? applicationList.length
                                : applicationList.filter((app) => app.status === value).length;

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setStatusFilter(value)}
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                        statusFilter === value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    <span className="capitalize">{label}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            statusFilter === value
                                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                                : value === ALL_STATUS
                                                    ? 'bg-primary/10 text-primary'
                                                    : STATUS_COLORS[value]
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-2 py-16 text-center">
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
                    <KanbanBoard
                        applications={filtered}
                        onView={(app) => openView(app)}
                        onEdit={(app) => openEdit(app)}
                        onDelete={(app) => handleDelete(app)}
                    />
                )}
            </div>

            <ApplicationDetailModal
                open={viewingApplication !== null}
                onClose={() => setViewingApplication(null)}
                application={
                    viewingApplication
                        ? (applicationList.find((a) => a.id === viewingApplication.id) ?? viewingApplication)
                        : null
                }
                availableContacts={contacts}
            />

            <JobApplicationForm
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingApplication(null);
                }}
                application={editingApplication}
            />

            <QuickApplyDialog
                open={quickApplyOpen}
                onClose={() => setQuickApplyOpen(false)}
                templates={templates}
            />
        </>
    );
}

JobApplicationsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;