import { useForm, router } from '@inertiajs/react';
import { ZapIcon, LoaderIcon } from 'lucide-react';
import { useState, useCallback } from 'react';
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
import { store as jobAppStore } from '@/routes/job-applications';
import type { ApplicationTemplate } from '@/types/application-template';

export default function QuickApplyDialog({
    open,
    onClose,
    templates,
}: {
    open: boolean;
    onClose: () => void;
    templates: ApplicationTemplate[];
}) {
    const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { data, setData, errors, clearErrors, reset } = useForm<{
        company_name: string;
        job_url: string;
    }>({
        company_name: '',
        job_url: '',
    });

    function handleClose() {
        reset();
        clearErrors();
        setSelectedTemplate(null);
        onClose();
    }

    function handleTemplateChange(templateId: string | null) {
        if (!templateId) {
            setSelectedTemplate(null);

            return;
        }

        const template = templates.find((t) => t.id.toString() === templateId);
        setSelectedTemplate(template ?? null);
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedTemplate) {
return;
}

        setSubmitting(true);

        router.post(jobAppStore.url(), {
            company_name: data.company_name,
            job_title: selectedTemplate.name,
            job_url: data.job_url || undefined,
            location: selectedTemplate.default_location ?? '',
            status: 'wishlist',
            expected_salary: selectedTemplate.default_expected_salary ?? undefined,
            notes: [
                selectedTemplate.default_notes,
                selectedTemplate.default_job_description_keywords
                    ? `Keywords: ${selectedTemplate.default_job_description_keywords}`
                    : null,
            ].filter(Boolean).join('\n\n') || undefined,
        }, {
            onSuccess: () => handleClose(),
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Quick Apply</DialogTitle>
                    <DialogDescription>
                        Select a template, enter the company name and job URL, and we'll pre-fill the rest.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="template_select">Template</Label>
                        <Select
                            value={selectedTemplate?.id.toString() ?? ''}
                            onValueChange={(value: string | null) => handleTemplateChange(value)}
                        >
                            <SelectTrigger id="template_select">
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id.toString()}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                            id="company_name"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            aria-invalid={!!errors.company_name}
                            placeholder="Acme Corp"
                            autoFocus
                        />
                        {errors.company_name && (
                            <p className="text-xs text-destructive">{errors.company_name}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="job_url">Job URL</Label>
                        <Input
                            id="job_url"
                            type="url"
                            value={data.job_url}
                            onChange={(e) => setData('job_url', e.target.value)}
                            placeholder="https://example.com/jobs/123"
                        />
                    </div>

                    {selectedTemplate && (
                        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                            {selectedTemplate.default_location && (
                                <p>Location: {selectedTemplate.default_location}</p>
                            )}
                            {selectedTemplate.default_expected_salary !== null && (
                                <p>Expected Salary: ₱{selectedTemplate.default_expected_salary.toLocaleString('en-PH')}</p>
                            )}
                            {selectedTemplate.default_notes && (
                                <p className="line-clamp-1">Notes: {selectedTemplate.default_notes}</p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting || !selectedTemplate || !data.company_name}>
                            {submitting ? (
                                <>
                                    <LoaderIcon className="size-4 animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                <>
                                    <ZapIcon className="size-4" />
                                    Quick Apply
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}