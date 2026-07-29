import { useForm } from '@inertiajs/react';
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
import { store as saveTemplate } from '@/routes/templates';

export default function SaveAsTemplateDialog({
    open,
    onClose,
    application,
}: {
    open: boolean;
    onClose: () => void;
    application: {
        location: string | null;
        expected_salary: number | null;
        notes: string | null;
        job_description: string | null;
    } | null;
}) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm<{
        name: string;
        category: string;
        default_location: string | undefined;
        default_expected_salary: number | undefined;
        default_notes: string | undefined;
        default_job_description_keywords: string | undefined;
    }>({
        name: '',
        category: '',
        default_location: application?.location ?? undefined,
        default_expected_salary: application?.expected_salary ?? undefined,
        default_notes: application?.notes ?? undefined,
        default_job_description_keywords:
            application?.job_description
                ?.split(/\s+/)
                .filter((w) => w.length > 3)
                .slice(0, 20)
                .join(', ') || undefined,
    });

    function handleClose() {
        reset();
        clearErrors();
        onClose();
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            category: formData.category || undefined,
            default_location: formData.default_location || undefined,
            default_notes: formData.default_notes || undefined,
            default_job_description_keywords:
                formData.default_job_description_keywords || undefined,
        }));

        post(saveTemplate.url(), {
            onSuccess: () => handleClose(),
        });
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Save as Template</DialogTitle>
                    <DialogDescription>
                        Save this application's pattern as a reusable template.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="template_name">Template Name</Label>
                        <Input
                            id="template_name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            aria-invalid={!!errors.name}
                            placeholder="Remote Frontend Template"
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="template_category">Category</Label>
                        <Input
                            id="template_category"
                            value={data.category}
                            onChange={(e) =>
                                setData('category', e.target.value)
                            }
                            placeholder="e.g. Remote Frontend, BPO Cebu"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Template'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
