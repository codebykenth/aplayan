import { router } from '@inertiajs/react';
import {
    LoaderIcon,
    BookmarkIcon,
    Trash2Icon,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SaveAsTemplateDialog from '@/components/application-templates/save-as-template-dialog';
import AiCopilotTab from '@/components/job-applications/ai-copilot-tab';
import ContactsActivityTab from '@/components/job-applications/contacts-activity-tab';
import DetailsEditTab from '@/components/job-applications/details-edit-tab';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Contact } from '@/types/contact';
import type { JobApplication, TaxConfig } from '@/types/job-application';

interface FormData {
    company_name: string;
    job_title: string;
    location: string;
    status: string;
    date_applied: string;
    expected_salary: string;
    offered_salary: string;
    currency: string;
    job_url: string;
    job_description: string;
    notes: string;
    interview_date: string;
    tax_config: TaxConfig | null;
}

function createFormData(application: JobApplication): FormData {
    return {
        company_name: application.company_name,
        job_title: application.job_title,
        location: application.location,
        status: application.status,
        date_applied: application.date_applied ?? '',
        expected_salary: application.expected_salary != null ? String(application.expected_salary) : '',
        offered_salary: application.offered_salary != null ? String(application.offered_salary) : '',
        currency: application.currency ?? 'PHP',
        job_url: application.job_url ?? '',
        job_description: application.job_description ?? '',
        notes: application.notes ?? '',
        interview_date: application.interview_date ? application.interview_date.split('T')[0] : '',
        tax_config: application.tax_config ? { ...application.tax_config } : null,
    };
}

export default function ApplicationDetailModal({
    open,
    onClose,
    application,
    availableContacts = [],
}: {
    open: boolean;
    onClose: () => void;
    application: JobApplication | null;
    availableContacts?: Contact[];
}) {
    const [updating, setUpdating] = useState(false);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const initialFormData = useMemo(() => {
        if (!application) {
return null;
}

        return createFormData(application);
    }, [application]);

    const [formData, setFormData] = useState<FormData | null>(null);

    useEffect(() => {
        if (application) {
            setFormData(createFormData(application));
            setErrors({});
        }
    }, [application]);

    const isDirty = useMemo(() => {
        if (!initialFormData || !formData) {
return false;
}

        return JSON.stringify(formData) !== JSON.stringify(initialFormData);
    }, [initialFormData, formData]);

    const handleFieldChange = useCallback((field: string, value: string | number | null) => {
        setFormData((prev) => {
            if (!prev) {
return prev;
}

            return { ...prev, [field]: value };
        });
    }, []);

    const handleTaxConfigChange = useCallback((taxConfig: TaxConfig) => {
        setFormData((prev) => {
            if (!prev) {
return prev;
}

            return { ...prev, tax_config: taxConfig };
        });
    }, []);

    const handleSave = useCallback(async () => {
        if (!application || !formData || !isDirty) {
return;
}

        setUpdating(true);
        setErrors({});

        try {
            const response = await fetch(`/job-applications/${application.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    company_name: formData.company_name,
                    job_title: formData.job_title,
                    location: formData.location,
                    status: formData.status,
                    date_applied: formData.date_applied || null,
                    expected_salary: formData.expected_salary ? Number(formData.expected_salary) : null,
                    offered_salary: formData.offered_salary ? Number(formData.offered_salary) : null,
                    currency: formData.currency,
                    job_url: formData.job_url || null,
                    job_description: formData.job_description || null,
                    notes: formData.notes || null,
                    interview_date: formData.interview_date || null,
                    tax_config: formData.tax_config,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (errorData.errors) {
                    setErrors(errorData.errors);

                    return;
                }

                throw new Error(errorData.message || 'Failed to update application.');
            }

            router.reload();
        } catch (error) {
        } finally {
            setUpdating(false);
        }
    }, [application, formData, isDirty]);

    const handleDelete = useCallback(async () => {
        if (!application) {
return;
}

        router.delete(`/job-applications/${application.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                onClose();
            },
        });
    }, [application, onClose]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [open, activeTab, application?.id]);

    if (!application) {
        return null;
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <DialogTitle className="text-lg">
                                {formData?.job_title ?? application.job_title}
                            </DialogTitle>
                            <StatusBadge status={application.status} />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setTemplateDialogOpen(true)}
                        >
                            <BookmarkIcon className="size-3.5" />
                            Save as Template
                        </Button>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value ?? 'details')} className="flex flex-col flex-1 min-h-0">
                        <TabsList variant="line" className="mx-6 shrink-0">
                            <TabsTrigger value="details">Details & Edit</TabsTrigger>
                            <TabsTrigger value="ai">AI Assist</TabsTrigger>
                            <TabsTrigger value="activity">Contacts & Activity</TabsTrigger>
                        </TabsList>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
                            <TabsContent value="details" className="mt-0 focus:outline-none">
                                {formData && (
                                    <DetailsEditTab
                                        application={application}
                                        formData={formData}
                                        onFieldChange={handleFieldChange}
                                        onTaxConfigChange={handleTaxConfigChange}
                                        errors={errors}
                                        disabled={updating}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="ai" className="mt-0 focus:outline-none">
                                <AiCopilotTab application={application} />
                            </TabsContent>

                            <TabsContent value="activity" className="mt-0 focus:outline-none">
                                <ContactsActivityTab
                                    application={application}
                                    availableContacts={availableContacts}
                                />
                            </TabsContent>
                        </div>

                        <div className="flex items-center justify-between border-t bg-muted/50 px-6 py-3 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2Icon className="size-3.5" />
                                Delete Application
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={!isDirty || updating}
                                >
                                    {updating ? (
                                        <>
                                            <LoaderIcon className="size-4 animate-spin text-current" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Tabs>

                    <SaveAsTemplateDialog
                        open={templateDialogOpen}
                        onClose={() => setTemplateDialogOpen(false)}
                        application={application}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Application</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this job application? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
