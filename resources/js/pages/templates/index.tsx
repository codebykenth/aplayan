import { Head, router, useForm } from '@inertiajs/react';
import { FileText, PlusIcon, Trash2Icon, PencilIcon, SaveIcon, XIcon, BookmarkIcon, Mail } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { store as saveTemplate, update as updateTemplate, destroy as deleteTemplate } from '@/routes/templates';
import {
    store as saveCoverLetterTemplate,
    update as updateCoverLetterTemplate,
    destroy as deleteCoverLetterTemplate,
} from '@/routes/cover-letter-templates';
import type { ApplicationTemplate } from '@/types/application-template';
import type { CoverLetterTemplate } from '@/types/cover-letter-template';

interface ApplicationFormData {
    name: string;
    category: string;
    default_location: string;
    default_expected_salary: string;
    default_job_description_keywords: string;
    default_notes: string;
}

interface CoverLetterFormData {
    title: string;
    recipient: string;
    content: string;
}

export default function TemplatesIndex({
    templates,
    coverLetterTemplates,
    activeTab: initialActiveTab,
}: {
    templates: ApplicationTemplate[];
    coverLetterTemplates: CoverLetterTemplate[];
    activeTab?: string;
}) {
    const [activeTab, setActiveTab] = useState<'application' | 'cover-letter'>(
        (initialActiveTab as 'application' | 'cover-letter') || 'application',
    );

    return (
        <>
            <Head title="Templates" />

            <div className="flex flex-1 min-h-0 flex-col gap-6">
                <PageHeader title="Templates" />

                <div className="flex shrink-0 gap-1 rounded-lg bg-[#f5f5f4] p-1 dark:bg-[#1C1C1A]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('application')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'application'
                                ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]'
                                : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'
                        }`}
                    >
                        <BookmarkIcon className="size-4" />
                        Application Templates
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('cover-letter')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'cover-letter'
                                ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]'
                                : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'
                        }`}
                    >
                        <Mail className="size-4" />
                        Cover Letter Templates
                    </button>
                </div>

                {activeTab === 'application' ? (
                    <ApplicationTemplatesTab templates={templates} />
                ) : (
                    <CoverLetterTemplatesTab templates={coverLetterTemplates} />
                )}
            </div>
        </>
    );
}

function ApplicationTemplatesTab({ templates }: { templates: ApplicationTemplate[] }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ApplicationTemplate | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<ApplicationFormData>({
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
        if (!window.confirm(`Delete template "${template.name}"?`)) {
            return;
        }

        router.delete(deleteTemplate.url(template.id));
    }

    const grouped = templates.reduce<Record<string, ApplicationTemplate[]>>((acc, t) => {
        const key = t.category || 'Uncategorized';

        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key].push(t);

        return acc;
    }, {});

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        if (a === 'Uncategorized') {
            return 1;
        }

        if (b === 'Uncategorized') {
            return -1;
        }

        return a.localeCompare(b);
    });

    return (
        <>
            <div className="flex flex-1 min-h-0 flex-col gap-6">
                <div className="flex justify-end">
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
                                <Textarea
                                    id="default_job_description_keywords"
                                    rows={2}
                                    value={data.default_job_description_keywords}
                                    onChange={(e) => setData('default_job_description_keywords', e.target.value)}
                                    placeholder="React, TypeScript, Laravel, Remote"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="default_notes">Default Notes</Label>
                                <Textarea
                                    id="default_notes"
                                    rows={2}
                                    value={data.default_notes}
                                    onChange={(e) => setData('default_notes', e.target.value)}
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

function CoverLetterTemplatesTab({ templates }: { templates: CoverLetterTemplate[] }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CoverLetterTemplate | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<CoverLetterFormData>({
        title: '',
        recipient: '',
        content: '',
    });

    function openCreate() {
        setEditingTemplate(null);
        reset();
        clearErrors();
        setFormOpen(true);
    }

    function openEdit(template: CoverLetterTemplate) {
        setEditingTemplate(template);
        setData({
            title: template.title,
            recipient: template.recipient ?? '',
            content: template.content,
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

        if (editingTemplate) {
            put(updateCoverLetterTemplate.url(editingTemplate.id), {
                onSuccess: () => handleClose(),
            });
        } else {
            post(saveCoverLetterTemplate.url(), {
                onSuccess: () => handleClose(),
            });
        }
    }

    function handleDelete(template: CoverLetterTemplate) {
        if (!window.confirm(`Delete template "${template.title}"?`)) {
            return;
        }

        router.delete(deleteCoverLetterTemplate.url(template.id));
    }

    return (
        <>
            <div className="flex flex-1 min-h-0 flex-col gap-6">
                <div className="flex justify-end">
                    <Button onClick={openCreate}>
                        <PlusIcon data-icon="inline-start" />
                        New Cover Letter Template
                    </Button>
                </div>

                {templates.length === 0 ? (
                    <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-2 py-16 text-center">
                        <Mail className="size-12 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            No cover letter templates yet. Save reusable cover letter text to apply faster.
                        </p>
                        <Button variant="outline" onClick={openCreate}>
                            <PlusIcon data-icon="inline-start" />
                            Create your first cover letter template
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <h3 className="truncate text-sm font-semibold text-card-foreground">
                                            {template.title}
                                        </h3>
                                        {template.recipient && (
                                            <p className="text-xs text-muted-foreground">
                                                To: {template.recipient}
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

                                <p className="text-xs text-muted-foreground line-clamp-3">
                                    {template.content}
                                </p>

                                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                    {template.content.includes('[Company Name]') && (
                                        <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px]">
                                            [Company Name]
                                        </span>
                                    )}
                                    {template.content.includes('[Job Title]') && (
                                        <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px]">
                                            [Job Title]
                                        </span>
                                    )}
                                    {template.content.includes('[Recipient]') && (
                                        <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px]">
                                            [Recipient]
                                        </span>
                                    )}
                                    {template.content.includes('[Your Name]') && (
                                        <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px]">
                                            [Your Name]
                                        </span>
                                    )}
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
                            {editingTemplate ? 'Edit Cover Letter Template' : 'New Cover Letter Template'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTemplate
                                ? 'Update your cover letter template.'
                                : 'Save reusable cover letter text for future applications.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="cl_title">Template Title</Label>
                                <Input
                                    id="cl_title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    aria-invalid={!!errors.title}
                                    placeholder="e.g. General Cover Letter, Tech Role Application"
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">{errors.title}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="cl_recipient">Recipient (optional)</Label>
                                <Input
                                    id="cl_recipient"
                                    value={data.recipient}
                                    onChange={(e) => setData('recipient', e.target.value)}
                                    placeholder="e.g. Hiring Manager, HR Team, Engineering Manager"
                                />
                                {errors.recipient && (
                                    <p className="text-xs text-destructive">{errors.recipient}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="cl_content">Cover Letter Content</Label>
                                <Textarea
                                    id="cl_content"
                                    rows={12}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    aria-invalid={!!errors.content}
                                    className="font-mono text-sm leading-relaxed"
                                    placeholder="Dear [Recipient],&#10;&#10;I am writing to express my interest in the [Job Title] position at [Company Name]..."
                                />
                                {errors.content && (
                                    <p className="text-xs text-destructive">{errors.content}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Use placeholders: [Company Name], [Job Title], [Recipient], [Your Name], [Date]
                                </p>
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
