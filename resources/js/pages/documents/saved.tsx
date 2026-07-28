import { Head, Link, router } from '@inertiajs/react';
import { FileText, Mail, Trash2, Eye, Download, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ConfirmDestructiveDialog } from '@/components/ui/confirm-destructive-dialog';
import AppLayout from '@/layouts/app-layout';

type SavedResume = {
    id: number;
    name: string;
    template: string;
    profile_data: {
        full_name: string;
        email: string;
        phone: string;
        location: string;
        photo_url: string | null;
        linkedin_url: string | null;
        github_url: string | null;
        website_url: string | null;
        target_role: string | null;
        summary: string | null;
        work_experience: Array<{ company: string; position: string; duration: string; description: string }>;
        education: Array<{ institution: string; degree: string; year: string }>;
        skills: string[];
        certifications: string[];
        projects: Array<{ title: string; description: string; url: string; technologies: string }>;
    };
    photo_url: string | null;
    created_at: string;
};

type SavedCoverLetter = {
    id: number;
    job_description: string;
    target_company: string | null;
    target_job_title: string | null;
    recipient: string | null;
    content: string;
    created_at: string;
};

interface SavedDocumentsProps {
    resumes: SavedResume[];
    coverLetters: SavedCoverLetter[];
}

function getTemplateLabel(template: string): string {
    const labels: Record<string, string> = {
        clean: 'Clean Minimal',
        ats_classic: 'ATS Classic (One-Line Contact)',
        ats_executive: 'ATS Executive (High Density)',
        ats_bullet: 'ATS Bulleted (High Scannability)',
        modern: 'Modern Professional',
        philippine: 'Philippine Standard (CV)',
        cl_modern: 'Modern & Engaging',
        cl_formal: 'Classic & Formal',
        cl_executive: 'Executive & Strategic',
        cl_creative: 'Creative & Narrative',
        cl_minimal: 'Clean & Direct',
    };

    return labels[template] || template;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function ResumeCard({ resume, onDelete }: { resume: SavedResume; onDelete: (id: number) => void }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [viewingContent, setViewingContent] = useState(false);

    const data = resume.profile_data;

    function handleDelete() {
        router.delete(`/documents/resume-versions/${resume.id}`);
        setDeleteOpen(false);
    }

    function handlePreview() {
        setPreviewOpen(true);
        setViewingContent(true);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-[#706f6c]" />
                        {resume.name}
                    </CardTitle>
                    <CardDescription>
                        {getTemplateLabel(resume.template)} &middot; {formatDate(resume.created_at)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        {data.full_name}{data.email ? ` - ${data.email}` : ''}
                    </p>
                    {data.summary && (
                        <p className="mt-1 text-xs text-[#706f6c] line-clamp-2 dark:text-[#A1A09A]">
                            {data.summary}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Link href={`/documents?load_resume=${resume.id}`}>
                        <Button variant="default" size="sm">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Load & Preview
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                    </Button>
                </CardFooter>
            </Card>

            <ConfirmDestructiveDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Resume Version?"
                description={`Are you sure you want to delete "${resume.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
            />

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{resume.name}</DialogTitle>
                        <DialogDescription>{getTemplateLabel(resume.template)}</DialogDescription>
                    </DialogHeader>
                    <div className="text-sm leading-relaxed space-y-3">
                        <div>
                            <strong>{data.full_name}</strong>
                            {data.target_role && <div className="text-sm font-medium mt-0.5 text-[#1b1b18]">{data.target_role}</div>}
                            <div className="text-[#706f6c]">
                                {data.email} | {data.phone} | {data.location}
                            </div>
                            {data.linkedin_url && <div className="text-[#706f6c] text-xs">LinkedIn: {data.linkedin_url}</div>}
                            {data.github_url && <div className="text-[#706f6c] text-xs">GitHub: {data.github_url}</div>}
                            {data.website_url && <div className="text-[#706f6c] text-xs">Web: {data.website_url}</div>}
                        </div>
                        {data.summary && (
                            <div>
                                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#706f6c] mb-1">Summary</h4>
                                <p>{data.summary}</p>
                            </div>
                        )}
                        {data.work_experience?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#706f6c] mb-1">Work Experience</h4>
                                {data.work_experience.map((job, i) => (
                                    <div key={i} className="mb-2">
                                        <div className="font-medium">{job.position}</div>
                                        <div className="text-[#706f6c]">{job.company} | {job.duration}</div>
                                        {job.description && <p className="text-xs mt-0.5">{job.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                        {data.education?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#706f6c] mb-1">Education</h4>
                                {data.education.map((edu, i) => (
                                    <div key={i} className="mb-1">
                                        <span className="font-medium">{edu.degree}</span> - {edu.institution} ({edu.year})
                                    </div>
                                ))}
                            </div>
                        )}
                        {data.skills?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#706f6c] mb-1">Skills</h4>
                                <p>{data.skills.join(', ')}</p>
                            </div>
                        )}
                        {data.certifications?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#706f6c] mb-1">Certifications</h4>
                                <p>{data.certifications.join(', ')}</p>
                            </div>
                        )}
                        {data.projects?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#706f6c] mb-1">Projects</h4>
                                {data.projects.map((project, i) => (
                                    <div key={i} className="mb-2">
                                        <div className="font-medium">{project.title}</div>
                                        {project.technologies && <div className="text-xs text-[#706f6c]">{project.technologies}</div>}
                                        {project.description && <p className="text-xs mt-0.5">{project.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                            Close
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function CoverLetterCard({ letter, onDelete }: { letter: SavedCoverLetter; onDelete: (id: number) => void }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    function handleDelete() {
        router.delete(`/documents/cover-letters/${letter.id}`);
        setDeleteOpen(false);
    }

    function handleCopy() {
        navigator.clipboard.writeText(letter.content);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="h-4 w-4 text-[#706f6c]" />
                        {letter.target_company || letter.target_job_title
                            ? [letter.target_job_title, letter.target_company].filter(Boolean).join(' at ')
                            : 'Cover Letter'}
                    </CardTitle>
                    <CardDescription>
                        {formatDate(letter.created_at)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {letter.recipient && (
                        <p className="mb-2 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                            To: {letter.recipient}
                        </p>
                    )}
                    <p className="text-xs text-[#706f6c] line-clamp-2 dark:text-[#A1A09A]">
                        {letter.job_description ? (
                            <>{letter.job_description.slice(0, 200)}{letter.job_description.length > 200 ? '...' : ''}</>
                        ) : (
                            <span className="italic">No job description provided</span>
                        )}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Link href={`/documents?load_cover_letter=${letter.id}`}>
                        <Button variant="default" size="sm">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Load & Preview
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                    </Button>
                </CardFooter>
            </Card>

            <ConfirmDestructiveDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Cover Letter?"
                description="Are you sure you want to delete this cover letter? This action cannot be undone."
                onConfirm={handleDelete}
            />

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cover Letter</DialogTitle>
                        <DialogDescription>{formatDate(letter.created_at)}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#e3e3e0] bg-[#FDFDFC] p-4 text-sm leading-relaxed dark:border-[#3E3E3A] dark:bg-[#161615]">
                        {letter.content}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCopy}>
                            <Download className="mr-2 h-4 w-4" />
                            Copy to Clipboard
                        </Button>
                        <DialogClose render={<Button variant="outline" />}>
                            Close
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function SavedDocuments({ resumes, coverLetters }: SavedDocumentsProps) {
    return (
        <>
            <Head title="Saved Documents" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Saved Documents
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View and manage your saved resume versions and cover letters.
                        </p>
                    </div>
                    <Link href="/documents">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Builder
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Saved Resumes */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <FileText className="size-4" />
                            Saved Resumes
                            {resumes.length > 0 && (
                                <span className="text-xs font-normal text-[#706f6c]">({resumes.length})</span>
                            )}
                        </h2>
                        {resumes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#e3e3e0] p-8 text-center dark:border-[#3E3E3A]">
                                <FileText className="h-8 w-8 text-[#706f6c] mb-2" />
                                <p className="text-sm text-[#706f6c]">
                                    No saved resume versions yet.
                                </p>
                                <p className="text-xs text-[#706f6c] mt-1">
                                    Save a version from the Resume Builder to see it here.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {resumes.map((resume) => (
                                    <ResumeCard key={resume.id} resume={resume} onDelete={() => {}} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Saved Cover Letters */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Mail className="size-4" />
                            Saved Cover Letters
                            {coverLetters.length > 0 && (
                                <span className="text-xs font-normal text-[#706f6c]">({coverLetters.length})</span>
                            )}
                        </h2>
                        {coverLetters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#e3e3e0] p-8 text-center dark:border-[#3E3E3A]">
                                <Mail className="h-8 w-8 text-[#706f6c] mb-2" />
                                <p className="text-sm text-[#706f6c]">
                                    No saved cover letters yet.
                                </p>
                                <p className="text-xs text-[#706f6c] mt-1">
                                    Generate and save a cover letter from the Resume Builder.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {coverLetters.map((letter) => (
                                    <CoverLetterCard key={letter.id} letter={letter} onDelete={() => {}} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

SavedDocuments.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;