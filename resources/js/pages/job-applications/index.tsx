import { Head, router } from '@inertiajs/react';
import {
    SearchIcon,
    PlusIcon,
    DownloadIcon,
    UploadIcon,
    ZapIcon,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import QuickApplyDialog from '@/components/application-templates/quick-apply-dialog';
import ApplicationDetailModal from '@/components/job-applications/application-detail-modal';
import ImportModal from '@/components/job-applications/import-modal';
import JobApplicationForm from '@/components/job-applications/job-application-form';
import KanbanBoard from '@/components/job-applications/kanban-board';
import { Button } from '@/components/ui/button';
import { ConfirmDestructiveDialog } from '@/components/ui/confirm-destructive-dialog';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import {
    destroy as jobAppDestroy,
    exportMethod,
} from '@/routes/job-applications';
import type { ApplicationTemplate } from '@/types/application-template';
import type { Contact } from '@/types/contact';
import type { JobApplication } from '@/types/job-application';

export default function JobApplicationsIndex({
    applications,
    templates = [],
    contacts = [],
}: {
    applications: { data: JobApplication[] } | JobApplication[];
    templates?: ApplicationTemplate[];
    contacts?: Contact[];
}) {
    const applicationList = useMemo(
        () =>
            Array.isArray(applications)
                ? applications
                : (applications?.data ?? []),
        [applications],
    );

    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingApplication, setEditingApplication] =
        useState<JobApplication | null>(null);
    const [viewingApplication, setViewingApplication] =
        useState<JobApplication | null>(null);
    const [quickApplyOpen, setQuickApplyOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [deletingApplication, setDeletingApplication] =
        useState<JobApplication | null>(null);
    const [importModalOpen, setImportModalOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const selectedId = params.get('selected');

        if (selectedId) {
            const found = applicationList.find(
                (app) => app.id === Number(selectedId),
            );

            if (found) {
                setViewingApplication(found);
            }
        }
    }, [applicationList]);

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
                app.company_name.toLowerCase().includes(search.toLowerCase()) ||
                app.job_title.toLowerCase().includes(search.toLowerCase()) ||
                app.location?.toLowerCase().includes(search.toLowerCase());

            return matchesSearch;
        });
    }, [applicationList, search]);

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
        setDeletingApplication(app);
    }

    return (
        <>
            <Head title="Job Applications" />

            <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-6">
                <PageHeader
                    title="Job Applications"
                    description="Track and manage your active job search pipeline"
                >
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
                                className="absolute top-full right-0 z-50 mt-1 min-w-36 rounded-lg border bg-popover p-1 shadow-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <a
                                    href={exportMethod.url({
                                        query: { format: 'csv' },
                                    })}
                                    download
                                    className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => setExportOpen(false)}
                                >
                                    Export as CSV
                                </a>
                                <a
                                    href={exportMethod.url({
                                        query: { format: 'json' },
                                    })}
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
                        onClick={() => setImportModalOpen(true)}
                    >
                        <UploadIcon data-icon="inline-start" />
                        Import Applications
                    </Button>
                    {templates.length > 0 && (
                        <Button
                            variant="secondary"
                            onClick={() => setQuickApplyOpen(true)}
                        >
                            <ZapIcon data-icon="inline-start" />
                            Quick Apply
                        </Button>
                    )}
                    <Button onClick={openCreate}>
                        <PlusIcon data-icon="inline-start" />
                        New Application
                    </Button>
                </PageHeader>

                <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-xs">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-8"
                            placeholder="Search applications..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
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
                        ? (applicationList.find(
                              (a) => a.id === viewingApplication.id,
                          ) ?? viewingApplication)
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

            <ImportModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
            />

            <ConfirmDestructiveDialog
                open={deletingApplication !== null}
                onOpenChange={(open) => !open && setDeletingApplication(null)}
                title="Delete Application?"
                description={
                    deletingApplication &&
                    `Are you sure you want to delete your application for ${deletingApplication.job_title} at ${deletingApplication.company_name}? This action cannot be undone.`
                }
                onConfirm={() => {
                    if (deletingApplication) {
                        router.delete(
                            jobAppDestroy.url(deletingApplication.id),
                        );
                    }
                }}
            />
        </>
    );
}

JobApplicationsIndex.layout = (page: ReactNode) => (
    <AppLayout>{page}</AppLayout>
);
