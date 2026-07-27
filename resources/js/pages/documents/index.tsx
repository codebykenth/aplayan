import { Head, useForm } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { User, Briefcase, GraduationCap, Wrench, Award, FileText, Download, Mail, Camera, Upload } from 'lucide-react';

type WorkExperience = {
    company: string;
    position: string;
    duration: string;
    description: string;
};

type Education = {
    institution: string;
    degree: string;
    year: string;
};

type ResumeProfile = {
    id?: number;
    full_name: string;
    email: string;
    phone: string;
    location: string;
    photo_url: string | null;
    linkedin_url: string | null;
    summary: string | null;
    work_experience: WorkExperience[];
    education: Education[];
    skills: string[];
    certifications: string[];
};

interface DocumentsPageProps {
    profile: ResumeProfile | null;
    coverLetter?: string;
}

const TEMPLATES = [
    { id: 'clean', name: 'Clean Minimal' },
    { id: 'modern', name: 'Modern Professional' },
    { id: 'philippine', name: 'Philippine Standard' },
] as const;

const TABS = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'work', label: 'Work Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'certifications', label: 'Certifications', icon: Award },
] as const;

function PersonalInfoTab({ data, setData, errors, photoDataUrl, onPhotoDataUrlChange }: { data: ResumeProfile; setData: (key: string, value: string) => void; errors: Record<string, string>; photoDataUrl: string | null; onPhotoDataUrlChange: (url: string | null) => void }) {
    return (
        <div className="flex flex-col gap-4">
            <PhotoUploader currentDataUrl={photoDataUrl} onDataUrlChange={onPhotoDataUrlChange} />

             <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                    id="full_name"
                    value={data.full_name}
                    onChange={(e) => setData('full_name', e.target.value)}
                    placeholder="Juan Dela Cruz"
                    aria-invalid={!!errors.full_name}
                />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="juan@example.com"
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="+63 917 123 4567"
                        aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    placeholder="Metro Manila"
                    aria-invalid={!!errors.location}
                />
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="linkedin_url">LinkedIn URL (optional)</Label>
                <Input
                    id="linkedin_url"
                    value={data.linkedin_url ?? ''}
                    onChange={(e) => setData('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/juandelaCruz"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <textarea
                    id="summary"
                    value={data.summary ?? ''}
                    onChange={(e) => setData('summary', e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Experienced software developer with expertise in..."
                />
            </div>
        </div>
    );
}

function WorkExperienceTab({ data, setData }: { data: ResumeProfile; setData: (key: string, value: WorkExperience[]) => void }) {
    const experiences = data.work_experience ?? [];

    function addExperience() {
        setData('work_experience', [
            ...experiences,
            { company: '', position: '', duration: '', description: '' },
        ]);
    }

    function updateExperience(index: number, field: keyof WorkExperience, value: string) {
        const updated = [...experiences];
        updated[index] = { ...updated[index], [field]: value };
        setData('work_experience', updated);
    }

    function removeExperience(index: number) {
        setData('work_experience', experiences.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-col gap-4">
            {experiences.map((exp, index) => (
                <div key={index} className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label>Company</Label>
                                <Input
                                    value={exp.company}
                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Position</Label>
                                <Input
                                    value={exp.position}
                                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                    placeholder="Software Developer"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Duration</Label>
                            <Input
                                value={exp.duration}
                                onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                                placeholder="2020 - 2023"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Description</Label>
                            <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="Key responsibilities and achievements..."
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                            Remove
                        </Button>
                    </div>
                </div>
            ))}
            <Button variant="outline" onClick={addExperience}>
                Add Work Experience
            </Button>
        </div>
    );
}

function EducationTab({ data, setData }: { data: ResumeProfile; setData: (key: string, value: Education[]) => void }) {
    const education = data.education ?? [];

    function addEducation() {
        setData('education', [
            ...education,
            { institution: '', degree: '', year: '' },
        ]);
    }

    function updateEducation(index: number, field: keyof Education, value: string) {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value };
        setData('education', updated);
    }

    function removeEducation(index: number) {
        setData('education', education.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-col gap-4">
            {education.map((edu, index) => (
                <div key={index} className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label>Institution</Label>
                                <Input
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                    placeholder="UP Diliman"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Degree</Label>
                                <Input
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                    placeholder="BS Computer Science"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Year</Label>
                            <Input
                                value={edu.year}
                                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                placeholder="2020"
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                            Remove
                        </Button>
                    </div>
                </div>
            ))}
            <Button variant="outline" onClick={addEducation}>
                Add Education
            </Button>
        </div>
    );
}

function SkillsTab({ data, setData }: { data: ResumeProfile; setData: (key: string, value: string[]) => void }) {
    const [skillInput, setSkillInput] = useState('');
    const skills = data.skills ?? [];

    function addSkill() {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setData('skills', [...skills, trimmed]);
            setSkillInput('');
        }
    }

    function removeSkill(skill: string) {
        setData('skills', skills.filter((s) => s !== skill));
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                    Add
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f4] px-3 py-1 text-sm text-[#706f6c] dark:bg-[#1C1C1A] dark:text-[#A1A09A]"
                    >
                        {skill}
                        <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-[#706f6c] hover:text-destructive dark:text-[#A1A09A]"
                        >
                            x
                        </button>
                    </span>
                ))}
            </div>
            {skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet. Add skills like PHP, Laravel, React, etc.</p>
            )}
        </div>
    );
}

function CertificationsTab({ data, setData }: { data: ResumeProfile; setData: (key: string, value: string[]) => void }) {
    const [certInput, setCertInput] = useState('');
    const certifications = data.certifications ?? [];

    function addCertification() {
        const trimmed = certInput.trim();
        if (trimmed && !certifications.includes(trimmed)) {
            setData('certifications', [...certifications, trimmed]);
            setCertInput('');
        }
    }

    function removeCertification(cert: string) {
        setData('certifications', certifications.filter((c) => c !== cert));
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="Add a certification"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addCertification();
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={addCertification}>
                    Add
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                    <span
                        key={cert}
                        className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f4] px-3 py-1 text-sm text-[#706f6c] dark:bg-[#1C1C1A] dark:text-[#A1A09A]"
                    >
                        {cert}
                        <button
                            type="button"
                            onClick={() => removeCertification(cert)}
                            className="ml-1 text-[#706f6c] hover:text-destructive dark:text-[#A1A09A]"
                        >
                            x
                        </button>
                    </span>
                ))}
            </div>
            {certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No certifications added yet. Add certifications like AWS Solutions Architect, Google Cloud Professional, etc.</p>
            )}
        </div>
    );
}

function getPrintStyles(template: string): string {
    if (template === 'clean') {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Instrument Sans', Arial, sans-serif; color: #1b1b18; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 13px; line-height: 1.5; }
            .header { margin-bottom: 16px; }
            .name { font-size: 24px; font-weight: 600; margin-bottom: 4px; }
            .contact { font-size: 13px; color: #706f6c; display: flex; gap: 8px; flex-wrap: wrap; }
            .linkedin { font-size: 12px; color: #706f6c; margin-top: 4px; }
            h2 { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #1b1b18; padding-bottom: 4px; margin-top: 20px; margin-bottom: 12px; }
            .job, .edu { margin-bottom: 12px; }
            .job-row, .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
            .job-title, .edu-degree { font-size: 14px; font-weight: 500; }
            .job-duration, .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
            .job-company, .edu-institution { font-size: 13px; color: #706f6c; }
            .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
            .skills { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-tag { background: #f5f5f4; padding: 2px 8px; border-radius: 9999px; font-size: 12px; }
            .certs { font-size: 13px; line-height: 1.5; }
            .photo { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; float: right; margin-left: 12px; }
            @media print { body { padding: 20px; } }
        `;
    }
    if (template === 'modern') {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Instrument Sans', Arial, sans-serif; color: #1b1b18; font-size: 13px; line-height: 1.5; }
            .header { background: #1b1b18; color: white; padding: 24px; }
            .name { font-size: 24px; font-weight: 700; }
            .contact { display: flex; gap: 12px; flex-wrap: wrap; font-size: 13px; margin-top: 8px; opacity: 0.9; }
            .linkedin { font-size: 12px; margin-top: 4px; opacity: 0.75; }
            .body { padding: 24px; }
            h2 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #706f6c; margin-bottom: 8px; margin-top: 16px; }
            .job, .edu { margin-bottom: 12px; padding-left: 12px; border-left: 2px solid #1b1b18; }
            .job-row, .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
            .job-title, .edu-degree { font-size: 14px; font-weight: 500; }
            .job-duration, .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
            .job-company, .edu-institution { font-size: 13px; color: #706f6c; }
            .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
            .skills { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-tag { background: #f5f5f4; padding: 2px 8px; border-radius: 9999px; font-size: 12px; }
            .certs { font-size: 13px; line-height: 1.5; }
            .photo { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; float: right; margin-left: 12px; }
            @media print { body { padding: 0; } .header { padding: 20px; } .body { padding: 20px; } }
        `;
    }
    // Philippine Standard
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Instrument Sans', Arial, sans-serif; color: #1b1b18; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 13px; line-height: 1.5; }
        .header { text-align: center; border-bottom: 2px solid #1b1b18; padding-bottom: 16px; margin-bottom: 16px; }
        .name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .contact { font-size: 12px; color: #706f6c; margin-top: 8px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .linkedin { font-size: 12px; color: #706f6c; margin-top: 4px; }
        h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; margin-top: 16px; margin-bottom: 8px; }
        .section-line { border-top: 1px solid #e3e3e0; margin-bottom: 8px; }
        .job, .edu { margin-bottom: 10px; }
        .job-company { font-size: 14px; font-weight: 600; }
        .job-row, .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
        .job-position { font-size: 13px; font-style: italic; }
        .job-duration, .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
        .edu-degree { font-size: 13px; font-weight: 600; }
        .edu-institution { font-size: 12px; color: #706f6c; }
        .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
        .skills-text { font-size: 13px; line-height: 1.5; }
        .certs { font-size: 13px; line-height: 1.5; }
        .photo { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px; display: block; }
        @media print { body { padding: 20px; } }
    `;
}

function PhotoUploader({ currentDataUrl, onDataUrlChange }: { currentDataUrl: string | null; onDataUrlChange: (url: string | null) => void }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentDataUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            setPreviewUrl(dataUrl);
            onDataUrlChange(dataUrl);
        };
        reader.readAsDataURL(file);
    }

    function handleClear() {
        setPreviewUrl(null);
        onDataUrlChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
                {previewUrl ? (
                    <>
                        <img
                            src={previewUrl}
                            alt="Profile preview"
                            className="h-16 w-16 rounded-full object-cover border border-[#e3e3e0] dark:border-[#3E3E3A]"
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                            Remove
                        </Button>
                    </>
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f4] dark:bg-[#1C1C1A]">
                        <Camera className="h-6 w-6 text-[#706f6c] dark:text-[#A1A09A]" />
                    </div>
                )}
                <div className="flex-1">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Upload a photo (shown in preview & PDF only, never stored on server)
                    </p>
                </div>
            </div>
        </div>
    );
}

function ResumePreview({ data, template, photoDataUrl }: { data: ResumeProfile; template: string; photoDataUrl: string | null }) {
    const previewRef = useRef<HTMLDivElement>(null);

    const hasData = data.full_name || data.email || data.phone || data.summary || (data.work_experience?.length ?? 0) > 0 || (data.education?.length ?? 0) > 0 || (data.skills?.length ?? 0) > 0;

    if (!hasData) {
        return (
            <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-6 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-[#706f6c] mb-4" />
                        <h2 className="text-lg font-medium text-foreground mb-2">
                            Your Resume Preview
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Fill in your profile details on the left to see your resume preview here.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    function handleDownload() {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = previewRef.current?.innerHTML;
        if (!content) return;

        const styles = getPrintStyles(template);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume - ${data.full_name}</title>
                <style>${styles}</style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    }

    const photoHtml = photoDataUrl
        ? `<img src="${photoDataUrl}" alt="" class="photo" />`
        : data.photo_url
          ? `<img src="${data.photo_url}" alt="" class="photo" />`
          : '';

    if (template === 'clean') {
        return (
            <div className="flex flex-col gap-4">
                <div ref={previewRef} className="rounded-lg border border-[#e3e3e0] bg-white p-6 text-[#1b1b18] shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                    <div className="header" dangerouslySetInnerHTML={{ __html: photoHtml + `<div class="name">${data.full_name || 'Your Name'}</div>` }} />
                    <div className="contact">
                        {data.email && <span>{data.email}</span>}
                        {data.phone && <span>{data.phone}</span>}
                        {data.location && <span>{data.location}</span>}
                    </div>
                    {data.linkedin_url && (
                        <div className="linkedin">{data.linkedin_url}</div>
                    )}

                    {data.summary && (
                        <>
                            <h2>Summary</h2>
                            <p>{data.summary}</p>
                        </>
                    )}

                    {(data.work_experience?.length ?? 0) > 0 && (
                        <>
                            <h2>Work Experience</h2>
                            {data.work_experience?.map((job, i) => (
                                <div key={i} className="job">
                                    <div className="job-row">
                                        <span className="job-title">{job.position || 'Position'}</span>
                                        <span className="job-duration">{job.duration}</span>
                                    </div>
                                    <div className="job-company">{job.company}</div>
                                    {job.description && (
                                        <p className="job-desc">{job.description}</p>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {(data.education?.length ?? 0) > 0 && (
                        <>
                            <h2>Education</h2>
                            {data.education?.map((edu, i) => (
                                <div key={i} className="edu">
                                    <div className="edu-row">
                                        <span className="edu-degree">{edu.degree || 'Degree'}</span>
                                        <span className="edu-year">{edu.year}</span>
                                    </div>
                                    <div className="edu-institution">{edu.institution}</div>
                                </div>
                            ))}
                        </>
                    )}

                    {(data.skills?.length ?? 0) > 0 && (
                        <>
                            <h2>Skills</h2>
                            <div className="skills">
                                {data.skills?.map((skill) => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </>
                    )}

                    {(data.certifications?.length ?? 0) > 0 && (
                        <>
                            <h2>Certifications</h2>
                            <div className="certs">{data.certifications?.join(' | ')}</div>
                        </>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>
        );
    }

    if (template === 'modern') {
        return (
            <div className="flex flex-col gap-4">
                <div ref={previewRef} className="rounded-lg border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="header">
                        <div dangerouslySetInnerHTML={{ __html: photoHtml + `<div class="name">${data.full_name || 'Your Name'}</div>` }} />
                        <div className="contact">
                            {data.email && <span>{data.email}</span>}
                            {data.phone && <span>{data.phone}</span>}
                            {data.location && <span>{data.location}</span>}
                        </div>
                        {data.linkedin_url && (
                            <div className="linkedin">{data.linkedin_url}</div>
                        )}
                    </div>

                    <div className="body">
                        {data.summary && (
                            <>
                                <h2>Summary</h2>
                                <p>{data.summary}</p>
                            </>
                        )}

                        {(data.work_experience?.length ?? 0) > 0 && (
                            <>
                                <h2>Work Experience</h2>
                                {data.work_experience?.map((job, i) => (
                                    <div key={i} className="job">
                                        <div className="job-row">
                                            <span className="job-title">{job.position || 'Position'}</span>
                                            <span className="job-duration">{job.duration}</span>
                                        </div>
                                        <div className="job-company">{job.company}</div>
                                        {job.description && (
                                            <p className="job-desc">{job.description}</p>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {(data.education?.length ?? 0) > 0 && (
                            <>
                                <h2>Education</h2>
                                {data.education?.map((edu, i) => (
                                    <div key={i} className="edu">
                                        <div className="edu-row">
                                            <span className="edu-degree">{edu.degree || 'Degree'}</span>
                                            <span className="edu-year">{edu.year}</span>
                                        </div>
                                        <div className="edu-institution">{edu.institution}</div>
                                    </div>
                                ))}
                            </>
                        )}

                        {(data.skills?.length ?? 0) > 0 && (
                            <>
                                <h2>Skills</h2>
                                <div className="skills">
                                    {data.skills?.map((skill) => (
                                        <span key={skill} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </>
                        )}

                        {(data.certifications?.length ?? 0) > 0 && (
                            <>
                                <h2>Certifications</h2>
                                <div className="certs">{data.certifications?.join(' | ')}</div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Philippine Standard template
    return (
        <div className="flex flex-col gap-4">
            <div ref={previewRef} className="rounded-lg border border-[#e3e3e0] bg-white p-6 text-[#1b1b18] shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                <div className="header">
                {(photoDataUrl || data.photo_url) && (
                    <img src={photoDataUrl || data.photo_url!} alt="" className="photo" />
                )}
                    <div className="name">{data.full_name || 'Your Name'}</div>
                    <div className="contact">
                        {data.location && <span>{data.location}</span>}
                        {data.phone && <span>Tel: {data.phone}</span>}
                        {data.email && <span>Email: {data.email}</span>}
                    </div>
                    {data.linkedin_url && (
                        <div className="linkedin">LinkedIn: {data.linkedin_url}</div>
                    )}
                </div>

                {data.summary && (
                    <>
                        <h2>Objective</h2>
                        <p>{data.summary}</p>
                    </>
                )}

                {(data.work_experience?.length ?? 0) > 0 && (
                    <>
                        <h2>Work Experience</h2>
                        <div className="section-line" />
                        {data.work_experience?.map((job, i) => (
                            <div key={i} className="job">
                                <div className="job-company">{job.company || 'Company'}</div>
                                <div className="job-row">
                                    <span className="job-position">{job.position}</span>
                                    <span className="job-duration">{job.duration}</span>
                                </div>
                                {job.description && (
                                    <p className="job-desc">{job.description}</p>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {(data.education?.length ?? 0) > 0 && (
                    <>
                        <h2>Education</h2>
                        <div className="section-line" />
                        {data.education?.map((edu, i) => (
                            <div key={i} className="edu">
                                <div className="edu-row">
                                    <span className="edu-degree">{edu.degree || 'Degree'}</span>
                                    <span className="edu-year">{edu.year}</span>
                                </div>
                                <div className="edu-institution">{edu.institution}</div>
                            </div>
                        ))}
                    </>
                )}

                {(data.skills?.length ?? 0) > 0 && (
                    <>
                        <h2>Skills</h2>
                        <div className="section-line" />
                        <div className="skills-text">{data.skills?.join(' / ')}</div>
                    </>
                )}

                {(data.certifications?.length ?? 0) > 0 && (
                    <>
                        <h2>Certifications</h2>
                        <div className="section-line" />
                        <div className="certs">{data.certifications?.join(' | ')}</div>
                    </>
                )}
            </div>
            <div className="flex justify-end">
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>
        </div>
    );
}

function CoverLetterModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        job_description: '',
    });
    const [coverLetter, setCoverLetter] = useState('');
    const [showResult, setShowResult] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/documents/cover-letter', {
            onSuccess: (response) => {
                setCoverLetter((response as unknown as { cover_letter: string }).cover_letter);
                setShowResult(true);
            },
        });
    }

    function handleClose() {
        onOpenChange(false);
        setShowResult(false);
        setCoverLetter('');
        reset();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Generate Cover Letter
                    </DialogTitle>
                    <DialogDescription>
                        Paste the job description and we will craft a tailored cover letter based on your resume profile.
                    </DialogDescription>
                </DialogHeader>

                {!showResult ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="job_description">Job Description</Label>
                            <textarea
                                id="job_description"
                                value={data.job_description}
                                onChange={(e) => setData('job_description', e.target.value)}
                                rows={6}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="Paste the full job description here..."
                                aria-invalid={!!errors.job_description}
                            />
                            {errors.job_description && (
                                <p className="text-xs text-destructive">{errors.job_description}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline" />}>
                                Cancel
                            </DialogClose>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Generating...' : 'Generate Cover Letter'}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border border-[#e3e3e0] bg-[#FDFDFC] p-4 text-sm leading-relaxed dark:border-[#3E3E3A] dark:bg-[#161615]">
                            {coverLetter}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(coverLetter);
                            }}>
                                Copy to Clipboard
                            </Button>
                            <DialogClose render={<Button />}>
                                Close
                            </DialogClose>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function DocumentsIndex({ profile, coverLetter }: DocumentsPageProps) {
    const [activeTab, setActiveTab] = useState('personal');
    const [template, setTemplate] = useState<string>('clean');
    const [coverLetterOpen, setCoverLetterOpen] = useState(false);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm<ResumeProfile>({
        full_name: profile?.full_name ?? '',
        email: profile?.email ?? '',
        phone: profile?.phone ?? '',
        location: profile?.location ?? '',
        photo_url: profile?.photo_url ?? '',
        linkedin_url: profile?.linkedin_url ?? '',
        summary: profile?.summary ?? '',
        work_experience: profile?.work_experience ?? [],
        education: profile?.education ?? [],
        skills: profile?.skills ?? [],
        certifications: profile?.certifications ?? [],
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put('/documents/profile');
    }

    return (
        <>
            <Head title="Documents" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Resume Builder
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Build your ATS-friendly resume and generate tailored cover letters.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* Left: Profile Editor */}
                    <div className="flex flex-col gap-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Resume Profile
                                    </CardTitle>
                                    <CardDescription>
                                        Fill in your details to build your resume profile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    {/* Tab navigation */}
                                    <div className="flex gap-1 rounded-lg bg-[#f5f5f4] p-1 dark:bg-[#1C1C1A]">
                                        {TABS.map(({ id, label, icon: Icon }) => (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => setActiveTab(id)}
                                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    activeTab === id
                                                        ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]'
                                                        : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'
                                                }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab content */}
                                    <div className="min-h-[300px]">
                                        {activeTab === 'personal' && <PersonalInfoTab data={data} setData={setData} errors={errors} photoDataUrl={photoDataUrl} onPhotoDataUrlChange={setPhotoDataUrl} />}
                                        {activeTab === 'work' && <WorkExperienceTab data={data} setData={setData} />}
                                        {activeTab === 'education' && <EducationTab data={data} setData={setData} />}
                                        {activeTab === 'skills' && <SkillsTab data={data} setData={setData} />}
                                        {activeTab === 'certifications' && <CertificationsTab data={data} setData={setData} />}
                                    </div>
                                </CardContent>
                                <div className="flex items-center justify-between border-t px-(--card-spacing) py-(--card-spacing)">
                                    <Button type="button" variant="outline" onClick={() => setCoverLetterOpen(true)}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Cover Letter
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Profile'}
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    </div>

                    {/* Right: Resume Preview */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <Label>Template</Label>
                            <Select value={template} onValueChange={(value: string | null) => value && setTemplate(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TEMPLATES.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <ResumePreview data={data} template={template} photoDataUrl={photoDataUrl} />
                    </div>
                </div>
            </div>

            <CoverLetterModal open={coverLetterOpen} onOpenChange={setCoverLetterOpen} />
        </>
    );
}

DocumentsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
