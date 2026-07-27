import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store as jobAppStore, update as jobAppUpdate } from '@/routes/job-applications';
import { JOB_APPLICATION_STATUSES } from '@/types/job-application';
import type { JobApplication } from '@/types/job-application';

interface FormData {
    company_name: string;
    job_title: string;
    job_url: string;
    job_description: string;
    location: string;
    status: string;
    date_applied: string;
    expected_salary: string;
    offered_salary: string;
    notes: string;
}

export default function JobApplicationForm({
    open,
    onClose,
    application,
}: {
    open: boolean;
    onClose: () => void;
    application?: JobApplication | null;
}) {
    const isEditing = !!application;

    const { data, setData, post, put, processing, errors, reset, transform, clearErrors } =
        useForm<FormData>({
            company_name: application?.company_name ?? '',
            job_title: application?.job_title ?? '',
            job_url: application?.job_url ?? '',
            job_description: application?.job_description ?? '',
            location: application?.location ?? '',
            status: application?.status ?? 'wishlist',
            date_applied: application?.date_applied ?? '',
            expected_salary:
                application?.expected_salary != null
                    ? String(application.expected_salary)
                    : '',
            offered_salary:
                application?.offered_salary != null
                    ? String(application.offered_salary)
                    : '',
            notes: application?.notes ?? '',
        });

    useEffect(() => {
        if (open && application) {
            setData({
                company_name: application.company_name,
                job_title: application.job_title,
                job_url: application.job_url ?? '',
                job_description: application.job_description ?? '',
                location: application.location,
                status: application.status,
                date_applied: application.date_applied ?? '',
                expected_salary:
                    application?.expected_salary != null
                        ? String(application.expected_salary)
                        : '',
                offered_salary:
                    application?.offered_salary != null
                        ? String(application.offered_salary)
                        : '',
                notes: application.notes ?? '',
            });
        }
    }, [open, application, setData]);

    function handleClose() {
        reset();
        clearErrors();
        onClose();
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            expected_salary: formData.expected_salary
                ? Number(formData.expected_salary)
                : undefined,
            offered_salary: formData.offered_salary
                ? Number(formData.offered_salary)
                : undefined,
            job_url: formData.job_url || undefined,
            job_description: formData.job_description || undefined,
            notes: formData.notes || undefined,
            date_applied: formData.date_applied || undefined,
        }));

        if (isEditing) {
            put(jobAppUpdate.url(application!.id), {
                onSuccess: () => handleClose(),
            });
        } else {
            post(jobAppStore.url(), {
                onSuccess: () => handleClose(),
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Application' : 'New Application'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details of your job application.'
                            : 'Add a new job application to track.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="company_name">
                                    Company Name
                                </Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) =>
                                        setData('company_name', e.target.value)
                                    }
                                    aria-invalid={!!errors.company_name}
                                    placeholder="Acme Corp"
                                />
                                {errors.company_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.company_name}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="job_title">Job Title</Label>
                                <Input
                                    id="job_title"
                                    value={data.job_title}
                                    onChange={(e) =>
                                        setData('job_title', e.target.value)
                                    }
                                    aria-invalid={!!errors.job_title}
                                    placeholder="Software Engineer"
                                />
                                {errors.job_title && (
                                    <p className="text-xs text-destructive">
                                        {errors.job_title}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) =>
                                        setData('location', e.target.value)
                                    }
                                    aria-invalid={!!errors.location}
                                    placeholder="Remote"
                                />
                                {errors.location && (
                                    <p className="text-xs text-destructive">
                                        {errors.location}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value: string | null) => {
                                        if (value) {
setData('status', value);
}
                                    }}
                                >
                                    <SelectTrigger aria-invalid={!!errors.status}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JOB_APPLICATION_STATUSES.map(
                                            (status) => (
                                                <SelectItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-xs text-destructive">
                                        {errors.status}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="expected_salary">
                                    Expected Salary (₱)
                                </Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        ₱
                                    </span>
                                    <Input
                                        id="expected_salary"
                                        type="number"
                                        min={0}
                                        className="pl-6"
                                        value={data.expected_salary}
                                        onChange={(e) =>
                                            setData('expected_salary', e.target.value)
                                        }
                                        placeholder="50000"
                                    />
                                </div>
                                {errors.expected_salary && (
                                    <p className="text-xs text-destructive">
                                        {errors.expected_salary}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="offered_salary">
                                    Offered Salary (₱)
                                </Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        ₱
                                    </span>
                                    <Input
                                        id="offered_salary"
                                        type="number"
                                        min={0}
                                        className="pl-6"
                                        value={data.offered_salary}
                                        onChange={(e) =>
                                            setData('offered_salary', e.target.value)
                                        }
                                        placeholder="60000"
                                    />
                                </div>
                                {errors.offered_salary && (
                                    <p className="text-xs text-destructive">
                                        {errors.offered_salary}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
<div className="flex flex-col gap-2">
                                 <Label htmlFor="job_url">Job URL</Label>
                                 <Input
                                     id="job_url"
                                     type="url"
                                     value={data.job_url}
                                     onChange={(e) =>
                                         setData('job_url', e.target.value)
                                     }
                                     placeholder="https://example.com/job"
                                 />
                                 {errors.job_url && (
                                     <p className="text-xs text-destructive">
                                         {errors.job_url}
                                     </p>
                                 )}
                             </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="date_applied">
                                    Date Applied
                                </Label>
                                <Input
                                    id="date_applied"
                                    type="date"
                                    value={data.date_applied}
                                    onChange={(e) =>
                                        setData('date_applied', e.target.value)
                                    }
                                />
                                {errors.date_applied && (
                                    <p className="text-xs text-destructive">
                                        {errors.date_applied}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="job_description">
                                Job Description
                            </Label>
                            <textarea
                                id="job_description"
                                rows={3}
                                value={data.job_description}
                                onChange={(e) =>
                                    setData('job_description', e.target.value)
                                }
                                className="h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30"
                                placeholder="Paste the job description here..."
                            />
                            {errors.job_description && (
                                <p className="text-xs text-destructive">
                                    {errors.job_description}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                rows={2}
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                className="h-16 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30"
                                placeholder="Any additional notes..."
                            />
                            {errors.notes && (
                                <p className="text-xs text-destructive">
                                    {errors.notes}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update'
                                  : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}