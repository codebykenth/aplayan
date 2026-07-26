import { Head, router, useForm } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { FileText, PlusIcon, Trash2Icon, PencilIcon, SaveIcon, XIcon, BookmarkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { ApplicationTemplate } from '@/types/application-template';
import { store as saveTemplate, update as updateTemplate, destroy as deleteTemplate } from '@/routes/templates';

interface FormData {
    name: string;
    category: string;
    default_location: string;
    default_expected_salary: string;
    default_job_description_keywords: string;
    default_notes: string;
}

export default function TemplatesIndex({ templates }: { templates: ApplicationTemplate[] }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ApplicationTemplate | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<FormData>({
        name: '',
        category: '',
        default_location: '',
        default_expected_salary: '',
        default_job_description_keywords: '',
        default_notes: '',
    });

    function openCreate() {
        setEditingTemplate(null);
        reset();
        clearErrors();
        setFormOpen(true);
    }

    function openEdit(template: ApplicationTemplate) {
        setEditingTemplate(template);
        setData({
            name: template.name,
            category: template.category ?? '',
            default_location: template.default_location ?? '',
            default_expected_salary: template.default_expected_salary?.toString() ?? '',
            default_job_description_keywords: template.default_job_description_keywords ?? '',
            default_notes: template.default_notes ?? '',
        });
        clearErrors();
        setFormOpen(true);
    }

    function handleClose() {
        reset();
        clearErrors();
        setFormOpen(false);
        setEditingTemplate(null);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            default_expected_salary: formData.default_expected_salary
                ? Number(formData.default_expected_salary)
                : undefined,
            default_location: formData.default_location || undefined,
            default_job_description_keywords: formData.default_job_description_keywords || undefined,
            default_notes: formData.default_notes || undefined,
            category: formData.category || undefined,
        }));

        if (editingTemplate) {
            put(updateTemplate.url(editingTemplate.id), {
                onSuccess: () => handleClose(),
            });
        } else {
            post(saveTemplate.url(), {
                onSuccess: () => handleClose(),
            });
        }
    }

    function handleDelete(template: ApplicationTemplate) {
        if (!window.confirm(`Delete template "${template.name}"?`)) return;
        router.delete(deleteTemplate.url(template.id));
    }

    const grouped = templates.reduce<Record<string, ApplicationTemplate[]>>((acc, t) => {
        const key = t.category || 'Uncategorized';
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
    }, {});

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
    });

    return (
        <>
            <Head title="Application Templates" />

            <div className="flex flex-1 min-h-0 flex-col gap-6">
                <div className="flex shrink-0 items-center justify-between">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Application Templates
                    </h1>
                    <Button onClick={openCreate}>
                        <PlusIcon data-icon="inline-start" />
                        New Template
                    </Button>
                </div>

                {templates.length === 0 ? (
                    <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-2 py-16 text-center">
                        <BookmarkIcon className="size-12 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            No templates yet. Save an application pattern as a template to quickly apply later.
                        </p>
                        <Button variant="outline" onClick={openCreate}>
                            <PlusIcon data-icon="inline-start" />
                            Create your first template
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {sortedCategories.map((category) => (
                            <div key={category} className="flex flex-col gap-3">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    {category}
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {grouped[category].map((template) => (
                                        <div
                                            key={template.id}
                                            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex min-w-0 flex-col gap-1">
                                                    <h3 className="truncate text-sm font-semibold text-card-foreground">
                                                        {template.name}
                                                    </h3>
                                                    {template.default_location && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {template.default_location}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex shrink-0 gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEdit(template)}
                                                        aria-label="Edit template"
                                                    >
                                                        <PencilIcon className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(template)}
                                                        aria-label="Delete template"
                                                    >
                                                        <Trash2Icon className="size-3.5 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                {template.default_expected_salary !== null && (
                                                    <p>
                                                        Expected Salary: ₱{template.default_expected_salary.toLocaleString('en-PH')}
                                                    </p>
                                                )}
                                                {template.default_job_description_keywords && (
                                                    <p className="line-clamp-2">
                                                        Keywords: {template.default_job_description_keywords}
                                                    </p>
                                                )}
                                                {template.default_notes && (
                                                    <p className="line-clamp-2">
                                                        Notes: {template.default_notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={formOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? 'Edit Template' : 'New Template'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTemplate
                                ? 'Update your application template.'
                                : 'Save an application pattern as a reusable template.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    aria-invalid={!!errors.name}
                                    placeholder="Remote Frontend Template"
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    placeholder="e.g. Remote Frontend, BPO Cebu, Government PH"
                                />
                                {errors.category && (
                                    <p className="text-xs text-destructive">{errors.category}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="default_location">Default Location</Label>
                                    <Input
                                        id="default_location"
                                        value={data.default_location}
                                        onChange={(e) => setData('default_location', e.target.value)}
                                        placeholder="Remote"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="default_expected_salary">
                                        Expected Salary (₱)
                                    </Label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            ₱
                                        </span>
                                        <Input
                                            id="default_expected_salary"
                                            type="number"
                                            min={0}
                                            className="pl-6"
                                            value={data.default_expected_salary}
                                            onChange={(e) => setData('default_expected_salary', e.target.value)}
                                            placeholder="50000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="default_job_description_keywords">
                                    Job Description Keywords
                                </Label>
                                <textarea
                                    id="default_job_description_keywords"
                                    rows={2}
                                    value={data.default_job_description_keywords}
                                    onChange={(e) => setData('default_job_description_keywords', e.target.value)}
                                    className="h-16 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                                    placeholder="React, TypeScript, Laravel, Remote"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="default_notes">Default Notes</Label>
                                <textarea
                                    id="default_notes"
                                    rows={2}
                                    value={data.default_notes}
                                    onChange={(e) => setData('default_notes', e.target.value)}
                                    className="h-16 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                                    placeholder="Any default notes for this type of application"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Saving...'
                                    : editingTemplate
                                        ? 'Update'
                                        : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

TemplatesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;