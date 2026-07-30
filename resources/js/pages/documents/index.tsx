import type { DragEndEvent } from '@dnd-kit/core';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    User,
    Briefcase,
    GraduationCap,
    Wrench,
    Award,
    FolderGit2,
    FileText,
    Download,
    Mail,
    Camera,
    Save,
    Sparkles,
    Eye,
    Edit3,
    FilePenLine,
    Wand2,
    Loader2,
    AlertCircle,
    BookText,
    ArrowUp,
    ArrowDown,
    GripVertical,
    BookmarkIcon,
    Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { ConfirmDestructiveDialog } from '@/components/ui/confirm-destructive-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';

type WorkExperience = {
    company: string;
    position: string;
    duration: string;
    description: string;
    location?: string;
};

type Education = {
    institution: string;
    degree: string;
    year: string;
    location?: string;
};

type Project = {
    title: string;
    description: string;
    url: string;
    github_url?: string;
    technologies: string;
    duration?: string;
};

type SectionTitles = {
    summary?: string;
    skills?: string;
    work?: string;
    education?: string;
    projects?: string;
    certifications?: string;
    additional_info?: string;
};

type ResumeProfile = {
    id?: number;
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
    work_experience: WorkExperience[];
    education: Education[];
    skills: string[];
    certifications: string[];
    projects: Project[];
    additional_info?: AdditionalInfo[];
    section_order?: string[];
    section_titles?: SectionTitles;
};

type AdditionalInfo = {
    label: string;
    value: string;
};

type AiLimit = {
    remaining: number;
    total: number;
    exhausted: boolean;
};

interface SavedResumeProp {
    id: number;
    name: string;
    template: string;
    profile_data: ResumeProfile;
    photo_url: string | null;
}

interface SavedCoverLetterProp {
    id: number;
    content: string;
    target_company: string | null;
    target_job_title: string | null;
    template: string | null;
    job_description: string | null;
    recipient: string | null;
}

interface DocumentsPageProps {
    profile: ResumeProfile | null;
    aiLimit: AiLimit;
    loadedResume?: SavedResumeProp | null;
    loadedCoverLetter?: SavedCoverLetterProp | null;
    flash?: {
        success?: string;
        error?: string;
    };
}

const TEMPLATES = [
    { id: 'clean', name: 'Clean Minimal' },
    { id: 'ats_classic', name: 'ATS Classic (One-Line Contact)' },
    { id: 'ats_executive', name: 'ATS Executive (High Density)' },
    { id: 'ats_bullet', name: 'ATS Bulleted (High Scannability)' },
    { id: 'ats_single_column', name: 'ATS Single Column' },
    { id: 'ats_classic_serif', name: 'ATS Classic Serif' },
    { id: 'modern', name: 'Modern Professional' },
    { id: 'philippine', name: 'Philippine Standard (CV)' },
] as const;

const COVER_LETTER_TEMPLATES = [
    { id: 'cl_modern', name: 'Modern & Engaging' },
    { id: 'cl_formal', name: 'Classic & Formal' },
    { id: 'cl_executive', name: 'Executive & Strategic' },
    { id: 'cl_creative', name: 'Creative & Narrative' },
    { id: 'cl_minimal', name: 'Clean & Direct' },
] as const;

const COVER_LETTER_PREDEFINED_TEXTS: Record<string, string> = {
    cl_modern: `Dear Hiring Team,

I am writing to express my strong interest in the [Target Job Title] position at [Target Company]. Having closely followed your recent achievements and industry leadership, I am eager to bring my hands-on expertise, technical drive, and problem-solving mindset to your dynamic team.

Throughout my career, I have consistently focused on building scalable, reliable, and user-centric solutions. At my previous roles, I led initiatives that streamlined operational workflows and improved product performance. I thrive in collaborative, fast-paced environments where innovation and continuous improvement are prioritized.

What excites me most about [Target Company] is your commitment to pushing technological boundaries and delivering meaningful impact. I am confident that my background in full-stack development, system architecture, and cross-functional team collaboration aligns exceptionally well with your goals.

Thank you for your time and consideration. I would welcome the opportunity to discuss how my experience and passion can contribute to the ongoing success of [Target Company].

Sincerely,
[Your Name]`,

    cl_formal: `Dear Hiring Manager,

Please accept this letter as my formal application for the [Target Job Title] vacancy currently available at [Target Company]. With a proven track record of professional excellence and a disciplined approach to execution, I am eager to contribute to your organization's continued success.

In my previous positions, I have successfully executed complex technical projects, ensured strict adherence to industry standards, and consistently delivered high-quality results within demanding timelines. My core competencies include technical architecture, system optimization, and strategic project delivery.

I am particularly drawn to [Target Company] because of your established reputation for excellence, integrity, and market leadership. I am eager to apply my skills and rigorous work ethic toward achieving your strategic objectives.

Enclosed is my resume for your review. I look forward to the opportunity to participate in an interview to discuss how my qualifications meet your requirements.

Sincerely,
[Your Name]`,

    cl_executive: `Dear Members of the Executive Search Committee,

I am writing to submit my candidacy for the [Target Job Title] position at [Target Company]. As an experienced leader with a deep commitment to driving technical innovation, operational excellence, and organizational growth, I am inspired by [Target Company]'s vision and market positioning.

Over the course of my leadership career, I have successfully guided cross-functional teams through complex technological transformations, scaled engineering infrastructure, and aligned technology initiatives with core business growth metrics. Key highlights of my trajectory include:

• Architecting resilient enterprise systems that reduced operational overhead and improved system reliability.
• Championing high-performing engineering cultures centered on accountability, mentorship, and continuous delivery.
• Collaborating directly with executive stakeholders to translate high-level business vision into actionable technical roadmaps.

I welcome the opportunity to bring strategic vision, technical leadership, and execution excellence to [Target Company]. Thank you for your time and consideration.

Sincerely,
[Your Name]`,

    cl_creative: `Dear [Target Company] Team,

Great products are built at the intersection of curiosity, craft, and relentless execution—values that clearly define [Target Company]. When I saw the opening for [Target Job Title], I immediately recognized an alignment of vision and passion.

My journey in software engineering has been fueled by a desire to solve non-trivial problems and build intuitive, human-centered experiences. Whether optimizing complex database queries or refining user-facing interfaces, I approach every challenge with strategic intent and a high standard of quality.

At [Target Company], your commitment to engineering quality and product innovation stands out. I am excited about the prospect of contributing my creative problem-solving capabilities, technical foundation, and collaborative energy to your upcoming milestones.

I would love the opportunity to connect and share more about how my background and enthusiasm can elevate your team. Thank you for considering my application!

Warm regards,
[Your Name]`,

    cl_minimal: `Dear Hiring Team,

I am applying for the [Target Job Title] role at [Target Company]. My background spans full-stack software development, cloud infrastructure, and technical leadership with a focused commitment to delivering measurable business value.

Key achievements from my background include:
• Delivering high-availability web applications supporting thousands of active users.
• Optimizing backend data pipelines to reduce latency and enhance overall throughput.
• Partnering closely with product managers and designers to launch key platform features on schedule.

I am impressed by [Target Company]'s product trajectory and would appreciate the opportunity to contribute directly to your team's engineering goals.

Thank you for your time. I look forward to connecting.

Best regards,
[Your Name]`,
};

function getPredefinedCoverLetter(
    templateId: string,
    jobTitle: string,
    companyName: string,
    fullName: string,
): string {
    const raw =
        COVER_LETTER_PREDEFINED_TEXTS[templateId] ||
        COVER_LETTER_PREDEFINED_TEXTS.cl_modern;

    return raw
        .replaceAll('[Target Job Title]', jobTitle || 'Software Developer')
        .replaceAll('[Target Company]', companyName || 'Target Company')
        .replaceAll('[Your Name]', fullName || 'Applicant');
}

const TABS = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'work', label: 'Work Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'additional_info', label: 'Additional Info', icon: BookText },
] as const;

const VIEWS = [
    { id: 'resume-edit', label: 'Resume Builder', icon: Edit3 },
    {
        id: 'cover-letter-edit',
        label: 'Cover Letter Builder',
        icon: FilePenLine,
    },
    { id: 'resume-preview', label: 'Resume Preview', icon: Eye },
    {
        id: 'cover-letter-preview',
        label: 'Cover Letter Preview',
        icon: BookText,
    },
] as const;

function getPrintStyles(template: string): string {
    const base = `
        @page { margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Instrument Sans', Arial, sans-serif; color: #1b1b18; font-size: 13px; line-height: 1.5; padding: 32px; }
        .bullet-list { margin-top: 4px; padding-left: 20px; list-style-type: disc; }
        .bullet-list li { margin-bottom: 3px; line-height: 1.45; }
    `;

    if (template === 'ats_classic') {
        return (
            base +
            `
            .ats-header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1b1b18; padding-bottom: 12px; }
            .ats-name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
            .target-role { font-size: 13px; font-weight: 500; margin-bottom: 6px; }
            .ats-contact-line { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .ats-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1.5px solid #1b1b18; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px; }
            .ats-item { margin-bottom: 10px; }
            .ats-item-header { display: flex; justify-content: space-between; align-items: baseline; }
            .ats-title { font-size: 14px; font-weight: 700; }
            .ats-date { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .ats-company { font-size: 13px; font-weight: 600; color: #4a4a46; font-style: italic; }
            .ats-desc { font-size: 13px; margin-top: 4px; line-height: 1.45; }
            .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
        `
        );
    }

    if (template === 'ats_executive') {
        return (
            base +
            `
            .exec-header { margin-bottom: 16px; border-bottom: 1px solid #dcdcd8; padding-bottom: 12px; }
            .exec-name { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
            .target-role { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
            .exec-contact-line { font-size: 12px; color: #555450; font-weight: 500; }
            .exec-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-left: 4px solid #1b1b18; padding-left: 8px; margin-top: 14px; margin-bottom: 8px; }
            .job, .edu { margin-bottom: 10px; }
            .job-row, .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
            .job-title, .edu-degree { font-size: 14px; font-weight: 600; }
            .job-duration, .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
            .job-company, .edu-institution { font-size: 13px; color: #706f6c; }
            .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
            .skills, .certs { font-size: 13px; line-height: 1.5; }
            .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
            .project { margin-bottom: 10px; }
            .project-title { font-size: 14px; font-weight: 600; }
            .project-tech { font-size: 12px; color: #706f6c; }
            .project-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
        `
        );
    }

    if (template === 'ats_bullet') {
        return (
            base +
            `
            .bullet-header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1b1b18; padding-bottom: 12px; }
            .bullet-name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
            .target-role { font-size: 13px; font-weight: 500; margin-bottom: 6px; }
            .bullet-contact { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .bullet-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1.5px solid #1b1b18; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px; }
            .bullet-item { margin-bottom: 10px; }
            .bullet-item-header { display: flex; justify-content: space-between; align-items: baseline; }
            .bullet-title { font-size: 14px; font-weight: 700; }
            .bullet-date { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .bullet-company { font-size: 13px; font-weight: 600; color: #4a4a46; font-style: italic; }
            .bullet-list { margin-top: 4px; padding-left: 20px; list-style-type: disc; }
            .bullet-list li { font-size: 13px; margin-bottom: 3px; line-height: 1.45; }
            .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
        `
        );
    }

    if (template === 'ats_single_column') {
        return (
            base +
            `
            body { font-family: 'Instrument Sans', Inter, Arial, sans-serif; color: #111827; }
            .header { text-align: left; border-bottom: 1px solid #d1d5db; padding-bottom: 12px; margin-bottom: 16px; }
            .name { font-size: 20px; font-weight: 700; letter-spacing: -0.01em; color: #111827; }
            .target-role { font-size: 12px; font-weight: 500; color: #4b5563; margin-top: 2px; }
            .contact { font-size: 11px; color: #6b7280; margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap; }
            .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #374151; margin-top: 12px; margin-bottom: 6px; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
            .item-header { display: flex; justify-content: space-between; align-items: baseline; }
            .item-title { font-size: 13px; font-weight: 600; color: #111827; }
            .item-date { font-size: 11px; color: #6b7280; white-space: nowrap; }
            .item-subtitle { font-size: 12px; color: #6b7280; }
            .item-desc { font-size: 12px; margin-top: 4px; line-height: 1.45; }
            .bullet-list { padding-left: 18px; list-style-type: disc; margin-top: 4px; }
            .bullet-list li { font-size: 12px; margin-bottom: 3px; line-height: 1.45; }
            .photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; float: right; margin-left: 16px; display: block; }
        `
        );
    }

    if (template === 'ats_classic_serif') {
        return (
            base +
            `
            body { font-family: 'Times New Roman', Garamond, Georgia, serif; color: #111827; }
            .header { text-align: center; border-bottom: 3px double #d1d5db; padding-bottom: 12px; margin-bottom: 16px; }
            .name { font-size: 22px; font-weight: 700; letter-spacing: 0.02em; color: #111827; }
            .target-role { font-size: 12px; font-weight: 500; font-style: italic; color: #374151; margin-top: 4px; }
            .contact { font-size: 11px; color: #6b7280; margin-top: 6px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
            .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #111827; margin-top: 14px; margin-bottom: 8px; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
            .item-header { display: flex; justify-content: space-between; align-items: baseline; }
            .item-title { font-size: 13px; font-weight: 700; color: #111827; }
            .item-date { font-size: 11px; font-weight: 500; font-style: italic; color: #6b7280; white-space: nowrap; }
            .item-subtitle { font-size: 12px; font-style: italic; color: #6b7280; }
            .item-desc { font-size: 12px; margin-top: 4px; line-height: 1.45; }
            .bullet-list { padding-left: 18px; list-style-type: disc; margin-top: 4px; }
            .bullet-list li { font-size: 12px; margin-bottom: 3px; line-height: 1.45; }
            .photo { width: 80px; height: 80px; border-radius: 4px; object-fit: cover; float: right; margin-left: 16px; }
        `
        );
    }

    if (template === 'clean') {
        return (
            base +
            `
            .header { margin-bottom: 16px; }
            .name { font-size: 24px; font-weight: 600; margin-bottom: 4px; }
            .target-role { font-size: 14px; font-style: italic; color: #706f6c; margin-bottom: 6px; }
            .contact { font-size: 13px; color: #706f6c; display: flex; gap: 8px; flex-wrap: wrap; }
            .linkedin { font-size: 12px; color: #706f6c; margin-top: 4px; }
            h2 { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #1b1b18; padding-bottom: 4px; margin-top: 20px; margin-bottom: 12px; }
            .job, .edu { margin-bottom: 12px; }
            .job-row, .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
            .job-title, .edu-degree { font-size: 14px; font-weight: 500; }
            .job-duration, .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
            .job-company, .edu-institution { font-size: 13px; color: #706f6c; }
            .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
            .skills, .certs { font-size: 13px; line-height: 1.5; }
            .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
            .project { margin-bottom: 12px; }
            .project-title { font-size: 14px; font-weight: 500; }
            .project-tech { font-size: 12px; color: #706f6c; }
            .project-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
        `
        );
    }

    if (template === 'modern') {
        return (
            base +
            `
            .header { background: #1b1b18; color: white; padding: 24px; }
            .name { font-size: 24px; font-weight: 700; color: white; }
            .target-role { font-size: 14px; color: white; opacity: 0.9; margin-top: 2px; }
            .contact { display: flex; gap: 12px; flex-wrap: wrap; font-size: 13px; margin-top: 8px; opacity: 0.9; color: white; }
            .linkedin { font-size: 12px; margin-top: 4px; opacity: 0.75; color: white; }
            .body { padding: 24px; }
            h2 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #706f6c; margin-bottom: 8px; margin-top: 16px; }
            .job, .edu { margin-bottom: 12px; padding-left: 12px; border-left: 2px solid #1b1b18; }
            .job-row, .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
            .job-title, .edu-degree { font-size: 14px; font-weight: 500; }
            .job-duration, .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
            .job-company, .edu-institution { font-size: 13px; color: #706f6c; }
            .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
            .skills, .certs { font-size: 13px; line-height: 1.5; }
            .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
            .project { margin-bottom: 12px; padding-left: 12px; border-left: 2px solid #1b1b18; }
            .project-title { font-size: 14px; font-weight: 500; }
            .project-tech { font-size: 12px; color: #706f6c; }
            .project-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
        `
        );
    }

    return (
        base +
        `
        .header { text-align: center; border-bottom: 2px solid #1b1b18; padding-bottom: 16px; margin-bottom: 16px; }
        .cv-title { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #706f6c; margin-bottom: 4px; }
        .name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .target-role { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #706f6c; margin-top: 4px; }
        .contact { font-size: 12px; color: #706f6c; margin-top: 8px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .linkedin { font-size: 12px; color: #706f6c; margin-top: 4px; }
        h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 16px; margin-bottom: 4px; }
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
        .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; margin: 0 auto 12px; display: block; }
        .project { margin-bottom: 10px; }
        .project-title { font-size: 14px; font-weight: 600; }
        .project-tech { font-size: 12px; color: #706f6c; }
        .project-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; }
    `
    );
}

function getScopedResumeStyles(template: string): string {
    const base = `
        .resume-paper-preview { font-family: 'Instrument Sans', Arial, sans-serif; color: #1b1b18; font-size: 13px; line-height: 1.5; }
        .resume-paper-preview .bullet-list { margin-top: 4px; padding-left: 20px; list-style-type: disc; }
        .resume-paper-preview .bullet-list li { margin-bottom: 3px; line-height: 1.45; }
    `;

    if (template === 'ats_classic') {
        return (
            base +
            `
            .resume-paper-preview .ats-header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1b1b18; padding-bottom: 12px; }
            .resume-paper-preview .ats-name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1b1b18; margin-bottom: 6px; }
            .resume-paper-preview .target-role { font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #1b1b18; }
            .resume-paper-preview .ats-contact-line { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .resume-paper-preview .ats-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1.5px solid #1b1b18; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px; color: #1b1b18; }
            .resume-paper-preview .ats-item { margin-bottom: 10px; }
            .resume-paper-preview .ats-item-header { display: flex; justify-content: space-between; align-items: baseline; }
            .resume-paper-preview .ats-title { font-size: 14px; font-weight: 700; color: #1b1b18; }
            .resume-paper-preview .ats-date { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .resume-paper-preview .ats-company { font-size: 13px; font-weight: 600; color: #4a4a46; font-style: italic; }
            .resume-paper-preview .ats-desc { font-size: 13px; margin-top: 4px; line-height: 1.45; color: #1b1b18; }
            .resume-paper-preview .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
        `
        );
    }

    if (template === 'ats_executive') {
        return (
            base +
            `
            .resume-paper-preview .exec-header { margin-bottom: 16px; border-bottom: 1px solid #dcdcd8; padding-bottom: 12px; }
            .resume-paper-preview .exec-name { font-size: 24px; font-weight: 700; color: #1b1b18; margin-bottom: 4px; }
            .resume-paper-preview .target-role { font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #1b1b18; }
            .resume-paper-preview .exec-contact-line { font-size: 12px; color: #555450; font-weight: 500; }
            .resume-paper-preview .exec-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-left: 4px solid #1b1b18; padding-left: 8px; margin-top: 14px; margin-bottom: 8px; color: #1b1b18; }
            .resume-paper-preview .job, .resume-paper-preview .edu { margin-bottom: 10px; }
            .resume-paper-preview .job-row, .resume-paper-preview .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
            .resume-paper-preview .job-title, .resume-paper-preview .edu-degree { font-size: 14px; font-weight: 600; color: #1b1b18; }
            .resume-paper-preview .job-duration, .resume-paper-preview .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
            .resume-paper-preview .job-company, .resume-paper-preview .edu-institution { font-size: 13px; color: #706f6c; }
            .resume-paper-preview .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; color: #1b1b18; }
            .resume-paper-preview .skills, .resume-paper-preview .certs { font-size: 13px; line-height: 1.5; color: #1b1b18; }
            .resume-paper-preview .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
            .resume-paper-preview .project { margin-bottom: 10px; }
            .resume-paper-preview .project-title { font-size: 14px; font-weight: 600; color: #1b1b18; }
            .resume-paper-preview .project-tech { font-size: 12px; color: #706f6c; }
            .resume-paper-preview .project-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; color: #1b1b18; }
        `
        );
    }

    if (template === 'ats_bullet') {
        return (
            base +
            `
            .resume-paper-preview .bullet-header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1b1b18; padding-bottom: 12px; }
            .resume-paper-preview .bullet-name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1b1b18; margin-bottom: 6px; }
            .resume-paper-preview .target-role { font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #1b1b18; }
            .resume-paper-preview .bullet-contact { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .resume-paper-preview .bullet-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1.5px solid #1b1b18; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px; color: #1b1b18; }
            .resume-paper-preview .bullet-item { margin-bottom: 10px; }
            .resume-paper-preview .bullet-item-header { display: flex; justify-content: space-between; align-items: baseline; }
            .resume-paper-preview .bullet-title { font-size: 14px; font-weight: 700; color: #1b1b18; }
            .resume-paper-preview .bullet-date { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .resume-paper-preview .bullet-company { font-size: 13px; font-weight: 600; color: #4a4a46; font-style: italic; }
            .resume-paper-preview .bullet-list { margin-top: 4px; padding-left: 20px; list-style-type: disc; }
            .resume-paper-preview .bullet-list li { font-size: 13px; margin-bottom: 3px; line-height: 1.45; color: #1b1b18; }
            .resume-paper-preview .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
        `
        );
    }

    if (template === 'ats_single_column') {
        return (
            base +
            `
            .resume-paper-preview { font-family: 'Instrument Sans', Inter, Arial, sans-serif; }
            .resume-paper-preview .bullet-list { padding-left: 18px; list-style-type: disc; }
            .resume-paper-preview .bullet-list li { font-size: 12px; margin-bottom: 3px; line-height: 1.45; }
        `
        );
    }

    if (template === 'ats_classic_serif') {
        return (
            base +
            `
            .resume-paper-preview { font-family: 'Times New Roman', Garamond, Georgia, serif; }
            .resume-paper-preview .bullet-list { padding-left: 18px; list-style-type: disc; }
            .resume-paper-preview .bullet-list li { font-size: 12px; margin-bottom: 3px; line-height: 1.45; }
        `
        );
    }

    if (template === 'clean') {
        return (
            base +
            `
            .resume-paper-preview .header { margin-bottom: 16px; }
            .resume-paper-preview .name { font-size: 24px; font-weight: 600; margin-bottom: 4px; color: #1b1b18; }
            .resume-paper-preview .target-role { font-size: 14px; font-style: italic; color: #706f6c; margin-bottom: 6px; }
            .resume-paper-preview .contact { font-size: 13px; color: #706f6c; display: flex; gap: 8px; flex-wrap: wrap; }
            .resume-paper-preview .linkedin { font-size: 12px; color: #706f6c; margin-top: 4px; }
            .resume-paper-preview h2 { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #1b1b18; padding-bottom: 4px; margin-top: 20px; margin-bottom: 12px; color: #1b1b18; }
            .resume-paper-preview .job, .resume-paper-preview .edu { margin-bottom: 12px; }
            .resume-paper-preview .job-row, .resume-paper-preview .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
            .resume-paper-preview .job-title, .resume-paper-preview .edu-degree { font-size: 14px; font-weight: 500; color: #1b1b18; }
            .resume-paper-preview .job-duration, .resume-paper-preview .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
            .resume-paper-preview .job-company, .resume-paper-preview .edu-institution { font-size: 13px; color: #706f6c; }
            .resume-paper-preview .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; color: #1b1b18; }
            .resume-paper-preview .skills, .resume-paper-preview .certs { font-size: 13px; line-height: 1.5; color: #1b1b18; }
            .resume-paper-preview .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
            .resume-paper-preview .project { margin-bottom: 12px; }
            .resume-paper-preview .project-title { font-size: 14px; font-weight: 500; color: #1b1b18; }
            .resume-paper-preview .project-tech { font-size: 12px; color: #706f6c; }
            .resume-paper-preview .project-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; color: #1b1b18; }
        `
        );
    }

    if (template === 'modern') {
        return (
            base +
            `
            .resume-paper-preview .header { background: #1b1b18; color: white; padding: 24px; border-radius: 6px 6px 0 0; margin: -32px -32px 24px -32px; }
            .resume-paper-preview .name { font-size: 24px; font-weight: 700; color: white; }
            .resume-paper-preview .target-role { font-size: 14px; color: white; opacity: 0.9; margin-top: 2px; }
            .resume-paper-preview .contact { display: flex; gap: 12px; flex-wrap: wrap; font-size: 13px; margin-top: 8px; opacity: 0.9; color: white; }
            .resume-paper-preview .linkedin { font-size: 12px; margin-top: 4px; opacity: 0.75; color: white; }
            .resume-paper-preview .body { padding: 0; display: flex; flex-direction: column; }
            .resume-paper-preview h2 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #706f6c; margin-bottom: 8px; margin-top: 16px; }
            .resume-paper-preview .job, .resume-paper-preview .edu { margin-bottom: 12px; padding-left: 12px; border-left: 2px solid #1b1b18; }
            .resume-paper-preview .job-row, .resume-paper-preview .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
            .resume-paper-preview .job-title, .resume-paper-preview .edu-degree { font-size: 14px; font-weight: 500; color: #1b1b18; }
            .resume-paper-preview .job-duration, .resume-paper-preview .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
            .resume-paper-preview .job-company, .resume-paper-preview .edu-institution { font-size: 13px; color: #706f6c; }
            .resume-paper-preview .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; color: #1b1b18; }
            .resume-paper-preview .skills, .resume-paper-preview .certs { font-size: 13px; line-height: 1.5; color: #1b1b18; }
            .resume-paper-preview .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; float: right; margin-left: 16px; }
            .resume-paper-preview .project { margin-bottom: 12px; padding-left: 12px; border-left: 2px solid #1b1b18; }
            .resume-paper-preview .project-title { font-size: 14px; font-weight: 500; color: #1b1b18; }
            .resume-paper-preview .project-tech { font-size: 12px; color: #706f6c; }
            .resume-paper-preview .project-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; color: #1b1b18; }
        `
        );
    }

    return (
        base +
        `
        .resume-paper-preview .header { text-align: center; border-bottom: 2px solid #1b1b18; padding-bottom: 16px; margin-bottom: 16px; }
        .resume-paper-preview .name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1b1b18; }
        .resume-paper-preview .target-role { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #706f6c; margin-top: 4px; }
        .resume-paper-preview .contact { font-size: 12px; color: #706f6c; margin-top: 8px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .resume-paper-preview .linkedin { font-size: 12px; color: #706f6c; margin-top: 4px; }
        .resume-paper-preview h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; margin-top: 16px; margin-bottom: 8px; color: #1b1b18; }
        .resume-paper-preview .section-line { border-top: 1px solid #e3e3e0; margin-bottom: 8px; }
        .resume-paper-preview .job, .resume-paper-preview .edu { margin-bottom: 10px; }
        .resume-paper-preview .job-company { font-size: 14px; font-weight: 600; color: #1b1b18; }
        .resume-paper-preview .job-row, .resume-paper-preview .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
        .resume-paper-preview .job-position { font-size: 13px; font-style: italic; color: #1b1b18; }
        .resume-paper-preview .job-duration, .resume-paper-preview .edu-year { font-size: 12px; color: #706f6c; white-space: nowrap; margin-left: 12px; }
        .resume-paper-preview .edu-degree { font-size: 13px; font-weight: 600; color: #1b1b18; }
        .resume-paper-preview .edu-institution { font-size: 12px; color: #706f6c; }
        .resume-paper-preview .job-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; color: #1b1b18; }
        .resume-paper-preview .skills-text { font-size: 13px; line-height: 1.5; color: #1b1b18; }
.resume-paper-preview .certs { font-size: 13px; line-height: 1.5; color: #1b1b18; }
        .resume-paper-preview .photo { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; margin: 0 auto 12px; display: block; }
        .resume-paper-preview .project { margin-bottom: 10px; }
        .resume-paper-preview .project-title { font-size: 14px; font-weight: 600; color: #1b1b18; }
        .resume-paper-preview .project-tech { font-size: 12px; color: #706f6c; }
        .resume-paper-preview .project-desc { font-size: 13px; margin-top: 4px; line-height: 1.4; color: #1b1b18; }
    `
    );
}

function getCoverLetterPrintStyles(template: string): string {
    const base = `
        @page { margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Instrument Sans', Arial, sans-serif; color: #1b1b18; font-size: 13px; line-height: 1.6; padding: 32px; }
    `;

    if (template === 'cl_formal' || template === 'ats_classic') {
        return (
            base +
            `
            .letter-header { text-align: center; border-bottom: 2px solid #1b1b18; padding-bottom: 12px; margin-bottom: 20px; }
            .letter-name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1b1b18; margin-bottom: 6px; }
            .letter-contact-line { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .letter-date { color: #4a4a46; font-size: 12px; margin-bottom: 16px; text-align: right; font-weight: 500; }
            .letter-recipient { font-size: 13px; line-height: 1.5; margin-bottom: 20px; color: #1b1b18; }
            .letter-salutation { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #1b1b18; }
            .letter-body { font-size: 13px; line-height: 1.7; color: #1b1b18; }
            .letter-body p { margin-bottom: 14px; text-align: justify; }
            .letter-closing { margin-top: 28px; color: #1b1b18; }
            .letter-signature { margin-top: 6px; font-weight: 700; font-size: 14px; color: #1b1b18; }
        `
        );
    }

    if (template === 'cl_executive' || template === 'ats_executive') {
        return (
            base +
            `
            .letter-header { border-left: 4px solid #1b1b18; padding-left: 12px; margin-bottom: 20px; }
            .letter-name { font-size: 24px; font-weight: 700; color: #1b1b18; margin-bottom: 4px; }
            .letter-contact-line { font-size: 12px; color: #555450; font-weight: 500; }
            .letter-date { color: #706f6c; font-size: 12px; margin-bottom: 16px; }
            .letter-recipient { font-size: 13px; line-height: 1.5; margin-bottom: 20px; color: #1b1b18; }
            .letter-salutation { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #1b1b18; }
            .letter-body { font-size: 13px; line-height: 1.7; color: #1b1b18; }
            .letter-body p { margin-bottom: 14px; }
            .letter-closing { margin-top: 28px; color: #1b1b18; }
            .letter-signature { margin-top: 6px; font-weight: 700; color: #1b1b18; }
        `
        );
    }

    if (template === 'cl_modern' || template === 'modern') {
        return (
            base +
            `
            .letter-header { background: #1b1b18; color: white; padding: 24px; margin-bottom: 24px; border-radius: 6px; }
            .letter-header .letter-name { font-size: 24px; font-weight: 700; color: white; margin-bottom: 4px; }
            .letter-header .letter-contact-line { font-size: 12px; color: rgba(255,255,255,0.85); }
            .letter-header .letter-date { color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 8px; }
            .letter-body-wrapper { padding: 0; }
            .letter-salutation { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #1b1b18; }
            .letter-body { font-size: 13px; line-height: 1.7; color: #1b1b18; }
            .letter-body p { margin-bottom: 14px; }
            .letter-closing { margin-top: 28px; color: #1b1b18; }
            .letter-signature { margin-top: 6px; font-weight: 700; color: #1b1b18; }
        `
        );
    }

    if (template === 'cl_creative' || template === 'philippine') {
        return (
            base +
            `
            .letter-header { text-align: left; border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px; }
            .letter-name { font-size: 26px; font-weight: 800; color: #4338ca; letter-spacing: -0.02em; }
            .letter-contact-line { font-size: 12px; color: #6366f1; margin-top: 4px; font-weight: 500; }
            .letter-date { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
            .letter-salutation { font-size: 15px; font-weight: 700; color: #3730a3; margin-bottom: 16px; }
            .letter-body { font-size: 13.5px; line-height: 1.75; color: #1f2937; }
            .letter-body p { margin-bottom: 16px; }
            .letter-closing { margin-top: 32px; font-weight: 600; color: #3730a3; }
            .letter-signature { margin-top: 8px; font-weight: 800; font-size: 15px; color: #3730a3; }
        `
        );
    }

    return (
        base +
        `
        .letter-header { margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
        .letter-name { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; color: #111827; }
        .letter-contact-line { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .letter-date { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
        .letter-salutation { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #111827; }
        .letter-body { font-size: 13px; line-height: 1.7; color: #1f2937; }
        .letter-body p { margin-bottom: 14px; }
        .letter-closing { margin-top: 24px; }
        .letter-signature { margin-top: 4px; font-weight: 600; color: #111827; }
    `
    );
}

function getScopedCoverLetterStyles(template: string): string {
    const base = `
        .cover-letter-paper-preview { font-family: 'Instrument Sans', Arial, sans-serif; color: #1b1b18; font-size: 13px; line-height: 1.6; }
    `;

    if (template === 'cl_formal' || template === 'ats_classic') {
        return (
            base +
            `
            .cover-letter-paper-preview .letter-header { text-align: center; border-bottom: 2px solid #1b1b18; padding-bottom: 12px; margin-bottom: 20px; }
            .cover-letter-paper-preview .letter-name { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1b1b18; margin-bottom: 6px; }
            .cover-letter-paper-preview .letter-contact-line { font-size: 12px; color: #4a4a46; font-weight: 500; }
            .cover-letter-paper-preview .letter-date { color: #4a4a46; font-size: 12px; margin-bottom: 16px; text-align: right; font-weight: 500; }
            .cover-letter-paper-preview .letter-recipient { font-size: 13px; line-height: 1.5; margin-bottom: 20px; color: #1b1b18; }
            .cover-letter-paper-preview .letter-salutation { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #1b1b18; }
            .cover-letter-paper-preview .letter-body { font-size: 13px; line-height: 1.7; color: #1b1b18; }
            .cover-letter-paper-preview .letter-body p { margin-bottom: 14px; text-align: justify; }
            .cover-letter-paper-preview .letter-closing { margin-top: 28px; color: #1b1b18; }
            .cover-letter-paper-preview .letter-signature { margin-top: 6px; font-weight: 700; font-size: 14px; color: #1b1b18; }
        `
        );
    }

    if (template === 'cl_executive' || template === 'ats_executive') {
        return (
            base +
            `
            .cover-letter-paper-preview .letter-header { border-left: 4px solid #1b1b18; padding-left: 12px; margin-bottom: 20px; }
            .cover-letter-paper-preview .letter-name { font-size: 24px; font-weight: 700; color: #1b1b18; margin-bottom: 4px; }
            .cover-letter-paper-preview .letter-contact-line { font-size: 12px; color: #555450; font-weight: 500; }
            .cover-letter-paper-preview .letter-date { color: #706f6c; font-size: 12px; margin-bottom: 16px; }
            .cover-letter-paper-preview .letter-recipient { font-size: 13px; line-height: 1.5; margin-bottom: 20px; color: #1b1b18; }
            .cover-letter-paper-preview .letter-salutation { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #1b1b18; }
            .cover-letter-paper-preview .letter-body { font-size: 13px; line-height: 1.7; color: #1b1b18; }
            .cover-letter-paper-preview .letter-body p { margin-bottom: 14px; }
            .cover-letter-paper-preview .letter-closing { margin-top: 28px; }
            .cover-letter-paper-preview .letter-signature { margin-top: 6px; font-weight: 700; color: #1b1b18; }
        `
        );
    }

    if (template === 'cl_modern' || template === 'modern') {
        return (
            base +
            `
            .cover-letter-paper-preview .letter-header { background: #1b1b18; color: white; padding: 24px; margin-bottom: 24px; border-radius: 6px; }
            .cover-letter-paper-preview .letter-header .letter-name { font-size: 24px; font-weight: 700; color: white; margin-bottom: 4px; }
            .cover-letter-paper-preview .letter-header .letter-contact-line { font-size: 12px; color: rgba(255,255,255,0.85); }
            .cover-letter-paper-preview .letter-header .letter-date { color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 8px; }
            .cover-letter-paper-preview .letter-body-wrapper { padding: 0; }
            .cover-letter-paper-preview .letter-salutation { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #1b1b18; }
            .cover-letter-paper-preview .letter-body { font-size: 13px; line-height: 1.7; color: #1b1b18; }
            .cover-letter-paper-preview .letter-body p { margin-bottom: 14px; }
            .cover-letter-paper-preview .letter-closing { margin-top: 28px; color: #1b1b18; }
            .cover-letter-paper-preview .letter-signature { margin-top: 6px; font-weight: 700; color: #1b1b18; }
        `
        );
    }

    if (template === 'cl_creative' || template === 'philippine') {
        return (
            base +
            `
            .cover-letter-paper-preview .letter-header { text-align: left; border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px; }
            .cover-letter-paper-preview .letter-name { font-size: 26px; font-weight: 800; color: #4338ca; letter-spacing: -0.02em; }
            .cover-letter-paper-preview .letter-contact-line { font-size: 12px; color: #6366f1; margin-top: 4px; font-weight: 500; }
            .cover-letter-paper-preview .letter-date { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
            .cover-letter-paper-preview .letter-salutation { font-size: 15px; font-weight: 700; color: #3730a3; margin-bottom: 16px; }
            .cover-letter-paper-preview .letter-body { font-size: 13.5px; line-height: 1.75; color: #1f2937; }
            .cover-letter-paper-preview .letter-body p { margin-bottom: 16px; }
            .cover-letter-paper-preview .letter-closing { margin-top: 32px; font-weight: 600; color: #3730a3; }
            .cover-letter-paper-preview .letter-signature { margin-top: 8px; font-weight: 800; font-size: 15px; color: #3730a3; }
        `
        );
    }

    return (
        base +
        `
        .cover-letter-paper-preview .letter-header { margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
        .cover-letter-paper-preview .letter-name { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; color: #111827; }
        .cover-letter-paper-preview .letter-contact-line { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .cover-letter-paper-preview .letter-date { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
        .cover-letter-paper-preview .letter-salutation { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #111827; }
        .cover-letter-paper-preview .letter-body { font-size: 13px; line-height: 1.7; color: #1f2937; }
        .cover-letter-paper-preview .letter-body p { margin-bottom: 14px; }
        .cover-letter-paper-preview .letter-closing { margin-top: 24px; }
        .cover-letter-paper-preview .letter-signature { margin-top: 4px; font-weight: 600; color: #111827; }
    `
    );
}

function PersonalInfoTab({
    data,
    setData,
    errors,
    photoDataUrl,
    onPhotoDataUrlChange,
    onAiPolish,
}: {
    data: ResumeProfile;
    setData: (key: string, value: string) => void;
    errors: Record<string, string>;
    photoDataUrl: string | null;
    onPhotoDataUrlChange: (url: string | null) => void;
    onAiPolish: (section: string, content: string) => void;
}) {
    const hasPhotoUrl = !!(data.photo_url && data.photo_url.trim());
    const hasUploadedPhoto = !!photoDataUrl;
    const previewSrc =
        photoDataUrl ||
        (hasPhotoUrl ? getDirectImageUrl(data.photo_url) : null) ||
        null;

    return (
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                    {previewSrc ? (
                        <img
                            src={previewSrc}
                            alt="Profile preview"
                            referrerPolicy="no-referrer"
                            className="h-16 w-16 rounded-full border border-[#e3e3e0] object-cover dark:border-[#3E3E3A]"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Camera className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                    {!hasPhotoUrl && (
                        <PhotoUploader
                            currentDataUrl={photoDataUrl}
                            onDataUrlChange={onPhotoDataUrlChange}
                            hidePreview
                        />
                    )}
                </div>
            </div>

            {!hasUploadedPhoto && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="photo_url">Photo URL (optional)</Label>
                    <Input
                        id="photo_url"
                        type="url"
                        value={data.photo_url ?? ''}
                        onChange={(e) => setData('photo_url', e.target.value)}
                        placeholder="https://example.com/my-photo.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                        Paste an online image URL for your profile photo.
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                    id="full_name"
                    value={data.full_name}
                    onChange={(e) => setData('full_name', e.target.value)}
                    onFocus={() => {
                        if (data.full_name === 'Juan Dela Cruz') {
                            setData('full_name', '');
                        }
                    }}
                    placeholder="Juan Dela Cruz"
                    aria-invalid={!!errors.full_name}
                />
                {errors.full_name && (
                    <p className="text-xs text-destructive">
                        {errors.full_name}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="target_role">Target Role (optional)</Label>
                <Input
                    id="target_role"
                    value={data.target_role ?? ''}
                    onChange={(e) => setData('target_role', e.target.value)}
                    onFocus={() => {
                        if (data.target_role === 'Senior Software Developer') {
                            setData('target_role', '');
                        }
                    }}
                    placeholder="e.g. Senior Software Developer"
                    aria-invalid={!!errors.target_role}
                />
                {errors.target_role && (
                    <p className="text-xs text-destructive">
                        {errors.target_role}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        onFocus={() => {
                            if (data.email === 'juan@example.com') {
                                setData('email', '');
                            }
                        }}
                        placeholder="juan@example.com"
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        onFocus={() => {
                            if (data.phone === '+63 917 123 4567') {
                                setData('phone', '');
                            }
                        }}
                        placeholder="+63 917 123 4567"
                        aria-invalid={!!errors.phone}
                    />
                    {errors.phone && (
                        <p className="text-xs text-destructive">
                            {errors.phone}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    onFocus={() => {
                        if (data.location === 'Metro Manila') {
                            setData('location', '');
                        }
                    }}
                    placeholder="Metro Manila"
                    aria-invalid={!!errors.location}
                />
                {errors.location && (
                    <p className="text-xs text-destructive">
                        {errors.location}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="linkedin_url">LinkedIn URL (optional)</Label>
                <Input
                    id="linkedin_url"
                    value={data.linkedin_url ?? ''}
                    onChange={(e) => setData('linkedin_url', e.target.value)}
                    onFocus={() => {
                        if (
                            data.linkedin_url ===
                            'https://linkedin.com/in/juandelacruz'
                        ) {
                            setData('linkedin_url', '');
                        }
                    }}
                    placeholder="https://linkedin.com/in/juandelacruz"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="github_url">GitHub URL (optional)</Label>
                <Input
                    id="github_url"
                    value={data.github_url ?? ''}
                    onChange={(e) => setData('github_url', e.target.value)}
                    onFocus={() => {
                        if (
                            data.github_url ===
                            'https://github.com/juandelacruz'
                        ) {
                            setData('github_url', '');
                        }
                    }}
                    placeholder="https://github.com/juandelacruz"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="website_url">
                    Website / Portfolio URL (optional)
                </Label>
                <Input
                    id="website_url"
                    value={data.website_url ?? ''}
                    onChange={(e) => setData('website_url', e.target.value)}
                    onFocus={() => {
                        if (data.website_url === 'https://juanportfolio.com') {
                            setData('website_url', '');
                        }
                    }}
                    placeholder="https://juanportfolio.com"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <button
                        type="button"
                        onClick={() =>
                            onAiPolish('summary', data.summary ?? '')
                        }
                        disabled={!data.summary}
                        className="inline-flex items-center gap-1 text-xs text-[#706f6c] transition-colors hover:text-[#1b1b18] disabled:opacity-40 dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                    >
                        <Sparkles className="size-3" />
                        AI Polish
                    </button>
                </div>
                <Textarea
                    id="summary"
                    value={data.summary ?? ''}
                    onChange={(e) => setData('summary', e.target.value)}
                    onFocus={() => {
                        if (
                            data.summary ===
                            'Experienced software developer with expertise in building scalable web applications...'
                        ) {
                            setData('summary', '');
                        }
                    }}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
                    placeholder="Experienced software developer with expertise in building scalable web applications..."
                />
                <p className="text-xs text-muted-foreground">
                    Use <code className="rounded bg-muted px-1">**bold text**</code> for emphasis. Press Enter to start a new paragraph.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="summary_title" className="text-xs text-muted-foreground">Summary Section Title (optional)</Label>
                <Input
                    id="summary_title"
                    value={data.section_titles?.summary ?? ''}
                    onChange={(e) =>
                        setData('section_titles', {
                            ...(data.section_titles || {}),
                            summary: e.target.value,
                        })
                    }
                    placeholder="e.g. Professional Summary, Executive Summary, About Me"
                />
            </div>
        </div>
    );
}

function WorkExperienceTab({
    data,
    setData,
    onAiPolish,
}: {
    data: ResumeProfile;
    setData: (key: any, value: any) => void;
    onAiPolish: (section: string, content: string) => void;
}) {
    const experiences = data.work_experience ?? [];

    function addExperience() {
        setData('work_experience', [
            ...experiences,
            { company: '', position: '', duration: '', description: '' },
        ]);
    }

    function updateExperience(
        index: number,
        field: keyof WorkExperience,
        value: string,
    ) {
        const updated = [...experiences];
        updated[index] = { ...updated[index], [field]: value };
        setData('work_experience', updated);
    }

    function removeExperience(index: number) {
        setData(
            'work_experience',
            experiences.filter((_, i) => i !== index),
        );
    }

    function moveExperience(index: number, direction: 'up' | 'down') {
        const target = direction === 'up' ? index - 1 : index + 1;

        if (target < 0 || target >= experiences.length) {
            return;
        }

        const updated = [...experiences];
        [updated[index], updated[target]] = [updated[target], updated[index]];
        setData('work_experience', updated);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Title (optional)</Label>
                    <Input
                        value={data.section_titles?.work ?? ''}
                        onChange={(e) =>
                            setData('section_titles', {
                                ...(data.section_titles || {}),
                                work: e.target.value,
                            })
                        }
                        placeholder="e.g. Work Experience, Professional Experience, Employment History"
                    />
                </div>
            </div>
            {experiences.map((exp, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-border bg-card p-4"
                >
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label>Company</Label>
                                <Input
                                    value={exp.company}
                                    onChange={(e) =>
                                        updateExperience(
                                            index,
                                            'company',
                                            e.target.value,
                                        )
                                    }
                                    onFocus={() => {
                                        if (exp.company === 'Acme Corp') {
                                            updateExperience(
                                                index,
                                                'company',
                                                '',
                                            );
                                        }
                                    }}
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Position</Label>
                                <Input
                                    value={exp.position}
                                    onChange={(e) =>
                                        updateExperience(
                                            index,
                                            'position',
                                            e.target.value,
                                        )
                                    }
                                    onFocus={() => {
                                        if (
                                            exp.position ===
                                            'Software Developer'
                                        ) {
                                            updateExperience(
                                                index,
                                                'position',
                                                '',
                                            );
                                        }
                                    }}
                                    placeholder="Software Developer"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Duration</Label>
                            <Input
                                value={exp.duration}
                                onChange={(e) =>
                                    updateExperience(
                                        index,
                                        'duration',
                                        e.target.value,
                                    )
                                }
                                onFocus={() => {
                                    if (exp.duration === '2020 - 2023') {
                                        updateExperience(index, 'duration', '');
                                    }
                                }}
                                placeholder="2020 - 2023"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Location (optional)</Label>
                            <Input
                                value={exp.location || ''}
                                onChange={(e) =>
                                    updateExperience(
                                        index,
                                        'location',
                                        e.target.value,
                                    )
                                }
                                placeholder="Makati City, Metro Manila"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Description</Label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onAiPolish(
                                            'work_experience',
                                            exp.description,
                                        )
                                    }
                                    disabled={!exp.description}
                                    className="inline-flex items-center gap-1 text-xs text-[#706f6c] transition-colors hover:text-[#1b1b18] disabled:opacity-40 dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                >
                                    <Sparkles className="size-3" />
                                    AI Polish
                                </button>
                            </div>
                            <Textarea
                                value={exp.description}
                                onChange={(e) =>
                                    updateExperience(
                                        index,
                                        'description',
                                        e.target.value,
                                    )
                                }
                                onFocus={() => {
                                    if (
                                        exp.description ===
                                        'Developed and maintained various web applications using Laravel and React.'
                                    ) {
                                        updateExperience(
                                            index,
                                            'description',
                                            '',
                                        );
                                    }
                                }}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                Use <code className="rounded bg-muted px-1">**bold text**</code> for emphasis. Press Enter to start a new bullet point.
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveExperience(index, 'up')}
                                disabled={index === 0}
                                className="rounded-sm p-1 text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                            >
                                <ArrowUp className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveExperience(index, 'down')}
                                disabled={index === experiences.length - 1}
                                className="rounded-sm p-1 text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                            >
                                <ArrowDown className="size-4" />
                            </button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(index)}
                        >
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

function EducationTab({
    data,
    setData,
}: {
    data: ResumeProfile;
    setData: (key: any, value: any) => void;
}) {
    const education = data.education ?? [];

    function addEducation() {
        setData('education', [
            ...education,
            { institution: '', degree: '', year: '' },
        ]);
    }

    function updateEducation(
        index: number,
        field: keyof Education,
        value: string,
    ) {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value };
        setData('education', updated);
    }

    function removeEducation(index: number) {
        setData(
            'education',
            education.filter((_, i) => i !== index),
        );
    }

    function moveEducation(index: number, direction: 'up' | 'down') {
        const target = direction === 'up' ? index - 1 : index + 1;

        if (target < 0 || target >= education.length) {
            return;
        }

        const updated = [...education];
        [updated[index], updated[target]] = [updated[target], updated[index]];
        setData('education', updated);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Title (optional)</Label>
                    <Input
                        value={data.section_titles?.education ?? ''}
                        onChange={(e) =>
                            setData('section_titles', {
                                ...(data.section_titles || {}),
                                education: e.target.value,
                            })
                        }
                        placeholder="e.g. Education, Educational Background, Academic Qualifications"
                    />
                </div>
            </div>
            {education.map((edu, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-border bg-card p-4"
                >
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label>Institution</Label>
                                <Input
                                    value={edu.institution}
                                    onChange={(e) =>
                                        updateEducation(
                                            index,
                                            'institution',
                                            e.target.value,
                                        )
                                    }
                                    onFocus={() => {
                                        if (edu.institution === 'UP Diliman') {
                                            updateEducation(
                                                index,
                                                'institution',
                                                '',
                                            );
                                        }
                                    }}
                                    placeholder="UP Diliman"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Degree</Label>
                                <Input
                                    value={edu.degree}
                                    onChange={(e) =>
                                        updateEducation(
                                            index,
                                            'degree',
                                            e.target.value,
                                        )
                                    }
                                    onFocus={() => {
                                        if (
                                            edu.degree === 'BS Computer Science'
                                        ) {
                                            updateEducation(
                                                index,
                                                'degree',
                                                '',
                                            );
                                        }
                                    }}
                                    placeholder="BS Computer Science"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Year</Label>
                            <Input
                                value={edu.year}
                                onChange={(e) =>
                                    updateEducation(
                                        index,
                                        'year',
                                        e.target.value,
                                    )
                                }
                                onFocus={() => {
                                    if (edu.year === '2020') {
                                        updateEducation(index, 'year', '');
                                    }
                                }}
                                placeholder="2020"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Location (optional)</Label>
                            <Input
                                value={edu.location || ''}
                                onChange={(e) =>
                                    updateEducation(
                                        index,
                                        'location',
                                        e.target.value,
                                    )
                                }
                                placeholder="Quezon City"
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveEducation(index, 'up')}
                                disabled={index === 0}
                                className="rounded-sm p-1 text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                            >
                                <ArrowUp className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveEducation(index, 'down')}
                                disabled={index === education.length - 1}
                                className="rounded-sm p-1 text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                            >
                                <ArrowDown className="size-4" />
                            </button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                        >
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

function SkillsTab({
    data,
    setData,
}: {
    data: ResumeProfile;
    setData: (key: any, value: any) => void;
}) {
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
        setData(
            'skills',
            skills.filter((s) => s !== skill),
        );
    }

    const sampleCategories = [
        'Languages: PHP, TypeScript, JavaScript, SQL, Python',
        'Frameworks: Laravel, React, Vue.js, Express.js, Django',
        'Tools: Docker, Kubernetes, AWS, CI/CD, Git, Linux',
        'Databases: PostgreSQL, MySQL, MongoDB, Redis',
    ];

    function addCategoryPreset(preset: string) {
        if (!skills.includes(preset)) {
            setData('skills', [...skills, preset]);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Title (optional)</Label>
                    <Input
                        value={data.section_titles?.skills ?? ''}
                        onChange={(e) =>
                            setData('section_titles', {
                                ...(data.section_titles || {}),
                                skills: e.target.value,
                            })
                        }
                        placeholder="e.g. Technical Skills, Core Competencies, Skills & Tools"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="e.g. Languages: PHP, TypeScript, SQL or React"
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
                <p className="text-xs text-muted-foreground">
                    Tip: Use <code className="rounded bg-muted px-1">Category: Skill 1, Skill 2</code> (e.g., <code className="rounded bg-muted px-1">Languages: PHP, Python</code>) to display bold category headers like on the landing page preview.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Quick Add Sample Categories:</Label>
                <div className="flex flex-wrap gap-2">
                    {sampleCategories.map((preset) => {
                        const categoryName = preset.split(':')[0];
                        const isAdded = skills.includes(preset);

                        return (
                            <Button
                                key={categoryName}
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isAdded}
                                onClick={() => addCategoryPreset(preset)}
                                className="text-xs"
                            >
                                + {categoryName} Category
                            </Button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                    >
                        {skill}
                        <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-muted-foreground hover:text-destructive"
                        >
                            x
                        </button>
                    </span>
                ))}
            </div>
            {skills.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No skills added yet. Add individual skills or categorized items above.
                </p>
            )}
        </div>
    );
}

function CertificationsTab({
    data,
    setData,
}: {
    data: ResumeProfile;
    setData: (key: any, value: any) => void;
}) {
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
        setData(
            'certifications',
            certifications.filter((c) => c !== cert),
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Title (optional)</Label>
                    <Input
                        value={data.section_titles?.certifications ?? ''}
                        onChange={(e) =>
                            setData('section_titles', {
                                ...(data.section_titles || {}),
                                certifications: e.target.value,
                            })
                        }
                        placeholder="e.g. Certifications, Licenses & Certifications, Professional Credentials"
                    />
                </div>
            </div>
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
                <Button
                    type="button"
                    variant="outline"
                    onClick={addCertification}
                >
                    Add
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                    <span
                        key={cert}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                    >
                        {cert}
                        <button
                            type="button"
                            onClick={() => removeCertification(cert)}
                            className="ml-1 text-muted-foreground hover:text-destructive"
                        >
                            x
                        </button>
                    </span>
                ))}
            </div>
            {certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No certifications added yet. Add certifications like AWS
                    Solutions Architect, Google Cloud Professional, etc.
                </p>
            )}
        </div>
    );
}

function ProjectsTab({
    data,
    setData,
    onAiPolish,
}: {
    data: ResumeProfile;
    setData: (key: any, value: any) => void;
    onAiPolish: (section: string, content: string) => void;
}) {
    const projects = data.projects ?? [];

    function addProject() {
        setData('projects', [
            ...projects,
            {
                title: '',
                description: '',
                url: '',
                github_url: '',
                technologies: '',
            },
        ]);
    }

    function updateProject(index: number, field: keyof Project, value: string) {
        const updated = [...projects];
        updated[index] = { ...updated[index], [field]: value };
        setData('projects', updated);
    }

    function removeProject(index: number) {
        setData(
            'projects',
            projects.filter((_, i) => i !== index),
        );
    }

    function moveProject(index: number, direction: 'up' | 'down') {
        const target = direction === 'up' ? index - 1 : index + 1;

        if (target < 0 || target >= projects.length) {
            return;
        }

        const updated = [...projects];
        [updated[index], updated[target]] = [updated[target], updated[index]];
        setData('projects', updated);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Title (optional)</Label>
                    <Input
                        value={data.section_titles?.projects ?? ''}
                        onChange={(e) =>
                            setData('section_titles', {
                                ...(data.section_titles || {}),
                                projects: e.target.value,
                            })
                        }
                        placeholder="e.g. Projects, Featured Projects, Key Projects"
                    />
                </div>
            </div>
            {projects.map((project, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-border bg-card p-4"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Project Title</Label>
                            <Input
                                value={project.title}
                                onChange={(e) =>
                                    updateProject(
                                        index,
                                        'title',
                                        e.target.value,
                                    )
                                }
                                onFocus={() => {
                                    if (
                                        project.title === 'E-commerce Platform'
                                    ) {
                                        updateProject(index, 'title', '');
                                    }
                                }}
                                placeholder="E-commerce Platform"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Date / Duration (optional)</Label>
                            <Input
                                value={project.duration || ''}
                                onChange={(e) =>
                                    updateProject(
                                        index,
                                        'duration',
                                        e.target.value,
                                    )
                                }
                                placeholder="February 2026 - Present"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Description</Label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onAiPolish(
                                            'projects',
                                            project.description,
                                        )
                                    }
                                    disabled={!project.description}
                                    className="inline-flex items-center gap-1 text-xs text-[#706f6c] transition-colors hover:text-[#1b1b18] disabled:opacity-40 dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                >
                                    <Sparkles className="size-3" />
                                    AI Polish
                                </button>
                            </div>
                            <Textarea
                                value={project.description}
                                onChange={(e) =>
                                    updateProject(
                                        index,
                                        'description',
                                        e.target.value,
                                    )
                                }
                                onFocus={() => {
                                    if (
                                        project.description ===
                                        'Built a full-stack e-commerce platform with Next.js and Stripe.'
                                    ) {
                                        updateProject(index, 'description', '');
                                    }
                                }}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                Use <code className="rounded bg-muted px-1">**bold text**</code> for emphasis. Press Enter to start a new bullet point.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Technologies Used</Label>
                            <Input
                                value={project.technologies}
                                onChange={(e) =>
                                    updateProject(
                                        index,
                                        'technologies',
                                        e.target.value,
                                    )
                                }
                                onFocus={() => {
                                    if (
                                        project.technologies ===
                                        'Laravel, React, PostgreSQL'
                                    ) {
                                        updateProject(
                                            index,
                                            'technologies',
                                            '',
                                        );
                                    }
                                }}
                                placeholder="Laravel, React, PostgreSQL"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label>Live Demo URL (optional)</Label>
                                <Input
                                    value={project.url}
                                    onChange={(e) =>
                                        updateProject(
                                            index,
                                            'url',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://myproject.com"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>GitHub Repository URL (optional)</Label>
                                <Input
                                    value={project.github_url || ''}
                                    onChange={(e) =>
                                        updateProject(
                                            index,
                                            'github_url',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://github.com/user/project"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveProject(index, 'up')}
                                disabled={index === 0}
                                className="rounded-sm p-1 text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                            >
                                <ArrowUp className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveProject(index, 'down')}
                                disabled={index === projects.length - 1}
                                className="rounded-sm p-1 text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                            >
                                <ArrowDown className="size-4" />
                            </button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProject(index)}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ))}
            <Button variant="outline" onClick={addProject}>
                Add Project
            </Button>
        </div>
    );
}

function AdditionalInfoTab({
    data,
    setData,
}: {
    data: ResumeProfile;
    setData: (key: any, value: any) => void;
}) {
    const items = data.additional_info ?? [];

    function addItem() {
        setData('additional_info', [...items, { label: '', value: '' }]);
    }

    function updateItem(
        index: number,
        field: keyof AdditionalInfo,
        value: string,
    ) {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setData('additional_info', updated);
    }

    function removeItem(index: number) {
        setData(
            'additional_info',
            items.filter((_, i) => i !== index),
        );
    }

    function moveItem(index: number, direction: 'up' | 'down') {
        const target = direction === 'up' ? index - 1 : index + 1;

        if (target < 0 || target >= items.length) {
            return;
        }

        const updated = [...items];
        [updated[index], updated[target]] = [updated[target], updated[index]];
        setData('additional_info', updated);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Title (optional)</Label>
                    <Input
                        value={data.section_titles?.additional_info ?? ''}
                        onChange={(e) =>
                            setData('section_titles', {
                                ...(data.section_titles || {}),
                                additional_info: e.target.value,
                            })
                        }
                        placeholder="e.g. Additional Information, Languages & Interests, Honors"
                    />
                </div>
            </div>
            {items.map((item, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-border bg-card p-4"
                >
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label>Label</Label>
                                <Input
                                    value={item.label}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'label',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Languages"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Value</Label>
                                <Input
                                    value={item.value}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'value',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="English, Filipino, Japanese"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0}
                                className="rounded-sm p-1 text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                            >
                                <ArrowUp className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === items.length - 1}
                                className="rounded-sm p-1 text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                            >
                                <ArrowDown className="size-4" />
                            </button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ))}
            <Button variant="outline" onClick={addItem}>
                Add Additional Info
            </Button>
            {items.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Add items like Languages, Certificates, Volunteer Work, etc.
                </p>
            )}
        </div>
    );
}

function renderFormattedBullet(text: string): React.ReactNode {
    if (!text || !text.trim()) {
        return null;
    }

    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
}

function renderSkillsWithCategoryBold(
    skills: string[],
    separator: string = ', ',
): React.ReactNode {
    return skills
        .map((skill, i) => {
            const colonIndex = skill.indexOf(':');

            if (colonIndex > 0 && colonIndex < 30) {
                const prefix = skill.substring(0, colonIndex);
                const rest = skill.substring(colonIndex + 1);

                return (
                    <span key={i}>
                        <strong>{prefix}:</strong>
                        {rest}
                    </span>
                );
            }

            return <span key={i}>{skill}</span>;
        })
        .reduce<React.ReactNode[]>((acc, curr, i, arr) => {
            acc.push(curr);

            if (i < arr.length - 1) {
                acc.push(separator);
            }

            return acc;
        }, []);
}

function getDirectImageUrl(url: string | null): string | null {
    if (!url || !url.trim()) {
        return null;
    }

    const trimmed = url.trim();

    // Check Google Drive file viewer URLs:
    // e.g. https://drive.google.com/file/d/1dsfk6o2fdsfdsdfsi1lAUiIDvH/view?usp=sharing
    const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);

    if (driveFileMatch && driveFileMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
    }

    // Check Google Drive parameter URLs:
    // e.g. https://drive.google.com/open?id=1dsfk6o2fdsfdsdfsi1lAUiIDvH or https://drive.google.com/uc?id=...
    const driveParamMatch = trimmed.match(
        /drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/,
    );

    if (driveParamMatch && driveParamMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${driveParamMatch[1]}`;
    }

    return trimmed;
}

function PhotoUploader({
    currentDataUrl,
    onDataUrlChange,
    hidePreview = false,
}: {
    currentDataUrl: string | null;
    onDataUrlChange: (url: string | null) => void;
    hidePreview?: boolean;
}) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        getDirectImageUrl(currentDataUrl),
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreviewUrl(getDirectImageUrl(currentDataUrl));
    }, [currentDataUrl]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

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

    if (hidePreview) {
        return (
            <div className="flex flex-1 items-center gap-2">
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />
                <p className="text-xs whitespace-nowrap text-muted-foreground">
                    Upload a local file
                </p>
            </div>
        );
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
                            referrerPolicy="no-referrer"
                            className="h-16 w-16 rounded-full border border-[#e3e3e0] object-cover dark:border-[#3E3E3A]"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                        >
                            Remove
                        </Button>
                    </>
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Camera className="h-6 w-6 text-muted-foreground" />
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
                        Upload a photo for preview and PDF download (not saved
                        to server).
                    </p>
                </div>
            </div>
        </div>
    );
}

const DEFAULT_COVER_LETTER = `I am writing to express my enthusiastic interest in the Software Developer position at Acme Corp. With a solid foundation in modern web development technologies including Laravel and React, I am confident in my ability to contribute effectively to your team.

Throughout my experience, I have successfully built and maintained scalable web applications, optimized database queries, and collaborated with cross-functional teams to deliver high-quality software solutions. My background aligns closely with the qualifications you are seeking.

Thank you for considering my application. I welcome the opportunity to discuss how my skills and experience can benefit Acme Corp.`;

function ResumePreview({
    data,
    template,
    photoDataUrl,
}: {
    data: ResumeProfile;
    template: string;
    photoDataUrl: string | null;
}) {
    const previewRef = useRef<HTMLDivElement>(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [versionName, setVersionName] = useState('');

    const scopedStyles = getScopedResumeStyles(template);
    const printStyles = getPrintStyles(template);

    function handleDownload() {
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            return;
        }

        const content = previewRef.current?.innerHTML;

        if (!content) {
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume - ${data.full_name}</title>
                <style>${printStyles}</style>
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

    function handleSaveVersion() {
        setSaveDialogOpen(true);
        setVersionName(
            `${data.full_name || 'Resume'} - ${TEMPLATES.find((t) => t.id === template)?.name || template}`,
        );
    }

    function confirmSaveVersion() {
        router.post('/documents/save-resume', {
            name: versionName,
            template,
            profile_data: data,
            photo_url: data.photo_url,
        });
        setSaveDialogOpen(false);
    }

    function formatDisplayUrl(url?: string | null): string {
        if (!url || !url.trim()) {
            return '';
        }

        return url.trim().replace(/^https?:\/\/(www\.)?/, '');
    }

    function ensureHttpUrl(url?: string | null): string {
        if (!url || !url.trim()) {
            return '#';
        }

        const trimmed = url.trim();

        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed;
        }

        return `https://${trimmed}`;
    }

    function renderLink(url?: string | null) {
        if (!url || !url.trim()) {
            return null;
        }

        const href = ensureHttpUrl(url);
        const text = formatDisplayUrl(url);

        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
            >
                {text}
            </a>
        );
    }

    function renderAsBullets(text?: string | null) {
        if (!text || !text.trim()) {
            return null;
        }

        const lines = text
            .split(/\n|(?<=[\.\?!])\s+(?=[A-Z0-9])|•|▪/)
            .map((l) => l.trim().replace(/^[-•▪]\s*/, ''))
            .filter((l) => l.length > 0);

        if (lines.length === 0) {
            return null;
        }

        return (
            <ul className="bullet-list">
                {lines.map((line, idx) => (
                    <li key={idx}>{renderFormattedBullet(line)}</li>
                ))}
            </ul>
        );
    }
    const photoSrc = getDirectImageUrl(photoDataUrl || data.photo_url) || '';
    const hasPhoto = !!photoSrc;

    const defaultSectionOrder =
        template === 'ats_single_column' || template === 'ats_classic_serif'
            ? [
                  'personal',
                  'skills',
                  'work',
                  'education',
                  'projects',
                  'certifications',
                  'additional_info',
              ]
            : [
                  'personal',
                  'work',
                  'education',
                  'skills',
                  'projects',
                  'certifications',
                  'additional_info',
              ];

    const isDefaultStandardOrder =
        !data.section_order ||
        JSON.stringify(data.section_order) ===
            JSON.stringify([
                'personal',
                'work',
                'education',
                'skills',
                'projects',
                'certifications',
                'additional_info',
            ]);

    const sectionOrder =
        (template === 'ats_single_column' || template === 'ats_classic_serif') &&
        isDefaultStandardOrder
            ? defaultSectionOrder
            : data.section_order || defaultSectionOrder;
    const getOrder = (id: string) => sectionOrder.indexOf(id);

    const getTitle = (key: keyof SectionTitles, fallback: string) => {
        return data.section_titles?.[key] || fallback;
    };

    const SectionWrapper = ({
        id,
        children,
        className,
    }: {
        id: string;
        children: React.ReactNode;
        className?: string;
    }) => (
        <div style={{ order: getOrder(id) }} className={className}>
            {children}
        </div>
    );

    return (
        <div className="flex max-w-full min-w-0 flex-col gap-4 overflow-x-auto overflow-y-hidden pb-4">
            <div
                ref={previewRef}
                className={`resume-paper-preview template-${template} mx-auto flex min-h-[297mm] w-full max-w-[210mm] min-w-fit shrink-0 flex-col rounded-xl bg-white p-6 text-[#1b1b18] shadow-lg ring-1 ring-black/5 md:min-w-[210mm] md:p-8`}
            >
                <style>{scopedStyles}</style>

                {template === 'ats_classic' && (
                    <>
                        <SectionWrapper id="personal">
                            <div className="ats-header">
                                {hasPhoto && (
                                    <img
                                        src={photoSrc}
                                        alt=""
                                        className="photo"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <div className="ats-name">
                                    {data.full_name || 'Your Name'}
                                </div>
                                {data.target_role && (
                                    <div className="target-role">
                                        {data.target_role}
                                    </div>
                                )}
                                <div className="ats-contact-line">
                                    {[
                                        data.location ? (
                                            <span key="loc">
                                                {data.location}
                                            </span>
                                        ) : null,
                                        data.phone ? (
                                            <span key="phone">
                                                {data.phone}
                                            </span>
                                        ) : null,
                                        data.email ? (
                                            <a
                                                key="email"
                                                href={`mailto:${data.email}`}
                                                style={{
                                                    color: 'inherit',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                {data.email}
                                            </a>
                                        ) : null,
                                        data.linkedin_url ? (
                                            <span key="li">
                                                {renderLink(data.linkedin_url)}
                                            </span>
                                        ) : null,
                                        data.github_url ? (
                                            <span key="gh">
                                                {renderLink(data.github_url)}
                                            </span>
                                        ) : null,
                                        data.website_url ? (
                                            <span key="web">
                                                {renderLink(data.website_url)}
                                            </span>
                                        ) : null,
                                    ]
                                        .filter(Boolean)
                                        .reduce(
                                            (
                                                acc: React.ReactNode[],
                                                curr,
                                                i,
                                                arr,
                                            ) => {
                                                acc.push(curr);

                                                if (i < arr.length - 1) {
                                                    acc.push(
                                                        <span key={`sep-${i}`}>
                                                            {' '}
                                                            •{' '}
                                                        </span>,
                                                    );
                                                }

                                                return acc;
                                            },
                                            [],
                                        )}
                                </div>
                            </div>

                            {data.summary && (
                                <>
                                    <div className="ats-section-title">
                                        {getTitle('summary', 'Professional Summary')}
                                    </div>
                                    <p className="ats-desc">{data.summary}</p>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="work">
                            {(data.work_experience?.length ?? 0) > 0 && (
                                <>
                                    <div className="ats-section-title">
                                        {getTitle('work', 'Work Experience')}
                                    </div>
                                    {data.work_experience?.map((job, i) => (
                                        <div key={i} className="ats-item">
                                            <div className="ats-item-header">
                                                <span className="ats-title">
                                                    {job.position || 'Position'}
                                                </span>
                                                <span className="ats-date">
                                                    {job.duration}
                                                </span>
                                            </div>
                                            <div className="ats-company">
                                                {job.company}
                                            </div>
                                            {job.description && (
                                                <p className="ats-desc">
                                                    {job.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="education">
                            {(data.education?.length ?? 0) > 0 && (
                                <>
                                    <div className="ats-section-title">
                                        {getTitle('education', 'Education')}
                                    </div>
                                    {data.education?.map((edu, i) => (
                                        <div key={i} className="ats-item">
                                            <div className="ats-item-header">
                                                <span className="ats-title">
                                                    {edu.degree || 'Degree'}
                                                </span>
                                                <span className="ats-date">
                                                    {edu.year}
                                                </span>
                                            </div>
                                            <div className="ats-company">
                                                {edu.institution}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="skills">
                            {(data.skills?.length ?? 0) > 0 && (
                                <>
                                    <div className="ats-section-title">
                                        {getTitle('skills', 'Skills & Technologies')}
                                    </div>
                                    <div className="ats-desc">
                                        {renderSkillsWithCategoryBold(
                                            data.skills || [],
                                        )}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="certifications">
                            {(data.certifications?.length ?? 0) > 0 && (
                                <>
                                    <div className="ats-section-title">
                                        {getTitle('certifications', 'Certifications')}
                                    </div>
                                    <div className="ats-desc">
                                        {data.certifications?.join(' | ')}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="projects">
                            {(data.projects?.length ?? 0) > 0 && (
                                <>
                                    <div className="ats-section-title">
                                        {getTitle('projects', 'Projects')}
                                    </div>
                                    {data.projects?.map((project, i) => (
                                        <div key={i} className="ats-item">
                                            <div className="ats-item-header">
                                                <span className="ats-title">
                                                    {project.title}
                                                </span>
                                                {project.technologies && (
                                                    <span className="ats-date">
                                                        {project.technologies}
                                                    </span>
                                                )}
                                            </div>
                                            {project.description && (
                                                <p className="ats-desc">
                                                    {project.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="additional_info">
                            {(data.additional_info?.length ?? 0) > 0 && (
                                <>
                                    <div className="ats-section-title">
                                        {getTitle('additional_info', 'Additional Information')}
                                    </div>
                                    {data.additional_info?.map((item, i) => (
                                        <div
                                            key={i}
                                            className="ats-desc"
                                            style={{ marginBottom: '4px' }}
                                        >
                                            <strong>
                                                {renderFormattedBullet(
                                                    item.label,
                                                )}
                                                :
                                            </strong>{' '}
                                            {renderFormattedBullet(item.value)}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>
                    </>
                )}

                {template === 'ats_executive' && (
                    <>
                        <SectionWrapper id="personal">
                            <div className="exec-header">
                                {hasPhoto && (
                                    <img
                                        src={photoSrc}
                                        alt=""
                                        className="photo"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <div className="exec-name">
                                    {data.full_name || 'Your Name'}
                                </div>
                                {data.target_role && (
                                    <div className="target-role">
                                        {data.target_role}
                                    </div>
                                )}
                                <div className="exec-contact-line">
                                    {[
                                        data.location ? (
                                            <span key="loc">
                                                {data.location}
                                            </span>
                                        ) : null,
                                        data.phone ? (
                                            <span key="phone">
                                                {data.phone}
                                            </span>
                                        ) : null,
                                        data.email ? (
                                            <a
                                                key="email"
                                                href={`mailto:${data.email}`}
                                                style={{
                                                    color: 'inherit',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                {data.email}
                                            </a>
                                        ) : null,
                                        data.linkedin_url ? (
                                            <span key="li">
                                                {renderLink(data.linkedin_url)}
                                            </span>
                                        ) : null,
                                        data.github_url ? (
                                            <span key="gh">
                                                {renderLink(data.github_url)}
                                            </span>
                                        ) : null,
                                        data.website_url ? (
                                            <span key="web">
                                                {renderLink(data.website_url)}
                                            </span>
                                        ) : null,
                                    ]
                                        .filter(Boolean)
                                        .reduce(
                                            (
                                                acc: React.ReactNode[],
                                                curr,
                                                i,
                                                arr,
                                            ) => {
                                                acc.push(curr);

                                                if (i < arr.length - 1) {
                                                    acc.push(
                                                        <span key={`sep-${i}`}>
                                                            {' '}
                                                            |{' '}
                                                        </span>,
                                                    );
                                                }

                                                return acc;
                                            },
                                            [],
                                        )}
                                </div>
                            </div>

                            {data.summary && (
                                <>
                                    <div className="exec-section-title">
                                        Executive Summary
                                    </div>
                                    <p className="job-desc">{data.summary}</p>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="work">
                            {(data.work_experience?.length ?? 0) > 0 && (
                                <>
                                    <div className="exec-section-title">
                                        Professional Experience
                                    </div>
                                    {data.work_experience?.map((job, i) => (
                                        <div key={i} className="job">
                                            <div className="job-row">
                                                <span className="job-title">
                                                    {job.position || 'Position'}
                                                </span>
                                                <span className="job-duration">
                                                    {job.duration}
                                                </span>
                                            </div>
                                            <div className="job-company">
                                                {job.company}
                                            </div>
                                            {job.description && (
                                                <p className="job-desc">
                                                    {job.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="education">
                            {(data.education?.length ?? 0) > 0 && (
                                <>
                                    <div className="exec-section-title">
                                        Education
                                    </div>
                                    {data.education?.map((edu, i) => (
                                        <div key={i} className="edu">
                                            <div className="edu-row">
                                                <span className="edu-degree">
                                                    {edu.degree || 'Degree'}
                                                </span>
                                                <span className="edu-year">
                                                    {edu.year}
                                                </span>
                                            </div>
                                            <div className="edu-institution">
                                                {edu.institution}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="skills">
                            {(data.skills?.length ?? 0) > 0 && (
                                <>
                                    <div className="exec-section-title">
                                        Core Competencies
                                    </div>
                                    <div className="skills">
                                        {renderSkillsWithCategoryBold(
                                            data.skills || [],
                                        )}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="certifications">
                            {(data.certifications?.length ?? 0) > 0 && (
                                <>
                                    <div className="exec-section-title">
                                        Certifications
                                    </div>
                                    <div className="certs">
                                        {data.certifications?.join(' | ')}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="projects">
                            {(data.projects?.length ?? 0) > 0 && (
                                <>
                                    <div className="exec-section-title">
                                        Featured Projects
                                    </div>
                                    {data.projects?.map((project, i) => (
                                        <div key={i} className="project">
                                            <div className="project-title">
                                                {project.title}
                                            </div>
                                            {project.technologies && (
                                                <div className="project-tech">
                                                    {project.technologies}
                                                </div>
                                            )}
                                            {project.description && (
                                                <p className="project-desc">
                                                    {project.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="additional_info">
                            {(data.additional_info?.length ?? 0) > 0 && (
                                <>
                                    <div className="exec-section-title">
                                        Additional Information
                                    </div>
                                    {data.additional_info?.map((item, i) => (
                                        <div
                                            key={i}
                                            className="job-desc"
                                            style={{ marginBottom: '4px' }}
                                        >
                                            <strong>
                                                {renderFormattedBullet(
                                                    item.label,
                                                )}
                                                :
                                            </strong>{' '}
                                            {renderFormattedBullet(item.value)}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>
                    </>
                )}

                {template === 'ats_bullet' && (
                    <>
                        <SectionWrapper id="personal">
                            <div className="bullet-header">
                                {hasPhoto && (
                                    <img
                                        src={photoSrc}
                                        alt=""
                                        className="photo"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <div className="bullet-name">
                                    {data.full_name || 'Your Name'}
                                </div>
                                {data.target_role && (
                                    <div className="target-role">
                                        {data.target_role}
                                    </div>
                                )}
                                <div className="bullet-contact">
                                    {[
                                        data.location ? (
                                            <span key="loc">
                                                {data.location}
                                            </span>
                                        ) : null,
                                        data.phone ? (
                                            <span key="phone">
                                                {data.phone}
                                            </span>
                                        ) : null,
                                        data.email ? (
                                            <a
                                                key="email"
                                                href={`mailto:${data.email}`}
                                                style={{
                                                    color: 'inherit',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                {data.email}
                                            </a>
                                        ) : null,
                                        data.linkedin_url ? (
                                            <span key="li">
                                                {renderLink(data.linkedin_url)}
                                            </span>
                                        ) : null,
                                        data.github_url ? (
                                            <span key="gh">
                                                {renderLink(data.github_url)}
                                            </span>
                                        ) : null,
                                        data.website_url ? (
                                            <span key="web">
                                                {renderLink(data.website_url)}
                                            </span>
                                        ) : null,
                                    ]
                                        .filter(Boolean)
                                        .reduce(
                                            (
                                                acc: React.ReactNode[],
                                                curr,
                                                i,
                                                arr,
                                            ) => {
                                                acc.push(curr);

                                                if (i < arr.length - 1) {
                                                    acc.push(
                                                        <span key={`sep-${i}`}>
                                                            {' '}
                                                            •{' '}
                                                        </span>,
                                                    );
                                                }

                                                return acc;
                                            },
                                            [],
                                        )}
                                </div>
                            </div>

                            {data.summary && (
                                <>
                                    <div className="bullet-section-title">
                                        Professional Summary
                                    </div>
                                    {renderAsBullets(data.summary)}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="work">
                            {(data.work_experience?.length ?? 0) > 0 && (
                                <>
                                    <div className="bullet-section-title">
                                        Work Experience
                                    </div>
                                    {data.work_experience?.map((job, i) => (
                                        <div key={i} className="bullet-item">
                                            <div className="bullet-item-header">
                                                <span className="bullet-title">
                                                    {job.position || 'Position'}
                                                </span>
                                                <span className="bullet-date">
                                                    {job.duration}
                                                </span>
                                            </div>
                                            <div className="bullet-company">
                                                {job.company}
                                            </div>
                                            {job.description &&
                                                renderAsBullets(
                                                    job.description,
                                                )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="education">
                            {(data.education?.length ?? 0) > 0 && (
                                <>
                                    <div className="bullet-section-title">
                                        Education
                                    </div>
                                    {data.education?.map((edu, i) => (
                                        <div key={i} className="bullet-item">
                                            <div className="bullet-item-header">
                                                <span className="bullet-title">
                                                    {edu.degree || 'Degree'}
                                                </span>
                                                <span className="bullet-date">
                                                    {edu.year}
                                                </span>
                                            </div>
                                            <div className="bullet-company">
                                                {edu.institution}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="skills">
                            {(data.skills?.length ?? 0) > 0 && (
                                <>
                                    <div className="bullet-section-title">
                                        Skills & Core Competencies
                                    </div>
                                    <ul className="bullet-list">
                                        {data.skills?.map((skill, i) => (
                                            <li key={i}>{skill}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="certifications">
                            {(data.certifications?.length ?? 0) > 0 && (
                                <>
                                    <div className="bullet-section-title">
                                        Certifications
                                    </div>
                                    <ul className="bullet-list">
                                        {data.certifications?.map((cert, i) => (
                                            <li key={i}>{cert}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="projects">
                            {(data.projects?.length ?? 0) > 0 && (
                                <>
                                    <div className="bullet-section-title">
                                        Projects
                                    </div>
                                    {data.projects?.map((project, i) => (
                                        <div key={i} className="bullet-item">
                                            <div className="bullet-item-header">
                                                <span className="bullet-title">
                                                    {project.title}
                                                </span>
                                                {project.technologies && (
                                                    <span className="bullet-date">
                                                        {project.technologies}
                                                    </span>
                                                )}
                                            </div>
                                            {(project.url ||
                                                project.github_url) && (
                                                <div
                                                    className="bullet-company"
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    {[
                                                        project.url
                                                            ? `Demo: ${project.url}`
                                                            : null,
                                                        project.github_url
                                                            ? `GitHub: ${project.github_url}`
                                                            : null,
                                                    ]
                                                        .filter(Boolean)
                                                        .join('  •  ')}
                                                </div>
                                            )}
                                            {project.description &&
                                                renderAsBullets(
                                                    project.description,
                                                )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="additional_info">
                            {(data.additional_info?.length ?? 0) > 0 && (
                                <>
                                    <div className="bullet-section-title">
                                        Additional Information
                                    </div>
                                    {data.additional_info?.map((item, i) => (
                                        <div
                                            key={i}
                                            className="bullet-item"
                                            style={{ marginBottom: '4px' }}
                                        >
                                            <span style={{ fontWeight: 600 }}>
                                                {renderFormattedBullet(
                                                    item.label,
                                                )}
                                                :
                                            </span>{' '}
                                            <span>
                                                {renderFormattedBullet(
                                                    item.value,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>
                    </>
                )}

                {template === 'clean' && (
                    <>
                        <SectionWrapper id="personal">
                            <div className="header">
                                {hasPhoto && (
                                    <img
                                        src={photoSrc}
                                        alt=""
                                        className="photo"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <div className="name">
                                    {data.full_name || 'Your Name'}
                                </div>
                                {data.target_role && (
                                    <div className="target-role">
                                        {data.target_role}
                                    </div>
                                )}
                            </div>
                            <div className="contact">
                                {data.email && (
                                    <a
                                        href={`mailto:${data.email}`}
                                        style={{
                                            color: 'inherit',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        {data.email}
                                    </a>
                                )}
                                {data.phone && <span>{data.phone}</span>}
                                {data.location && <span>{data.location}</span>}
                                {data.linkedin_url && (
                                    <span>{renderLink(data.linkedin_url)}</span>
                                )}
                                {data.github_url && (
                                    <span>{renderLink(data.github_url)}</span>
                                )}
                                {data.website_url && (
                                    <span>{renderLink(data.website_url)}</span>
                                )}
                            </div>

                            {data.summary && (
                                <>
                                    <h2>Summary</h2>
                                    <p>{data.summary}</p>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="work">
                            {(data.work_experience?.length ?? 0) > 0 && (
                                <>
                                    <h2>Work Experience</h2>
                                    {data.work_experience?.map((job, i) => (
                                        <div key={i} className="job">
                                            <div className="job-row">
                                                <span className="job-title">
                                                    {job.position || 'Position'}
                                                </span>
                                                <span className="job-duration">
                                                    {job.duration}
                                                </span>
                                            </div>
                                            <div className="job-company">
                                                {job.company}
                                            </div>
                                            {job.description && (
                                                <p className="job-desc">
                                                    {job.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="education">
                            {(data.education?.length ?? 0) > 0 && (
                                <>
                                    <h2>Education</h2>
                                    {data.education?.map((edu, i) => (
                                        <div key={i} className="edu">
                                            <div className="edu-row">
                                                <span className="edu-degree">
                                                    {edu.degree || 'Degree'}
                                                </span>
                                                <span className="edu-year">
                                                    {edu.year}
                                                </span>
                                            </div>
                                            <div className="edu-institution">
                                                {edu.institution}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="skills">
                            {(data.skills?.length ?? 0) > 0 && (
                                <>
                                    <h2>Skills</h2>
                                    <div className="skills">
                                        {renderSkillsWithCategoryBold(
                                            data.skills || [],
                                        )}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="certifications">
                            {(data.certifications?.length ?? 0) > 0 && (
                                <>
                                    <h2>Certifications</h2>
                                    <div className="certs">
                                        {data.certifications?.join(' | ')}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="projects">
                            {(data.projects?.length ?? 0) > 0 && (
                                <>
                                    <h2>Projects</h2>
                                    {data.projects?.map((project, i) => (
                                        <div key={i} className="project">
                                            <div className="project-title">
                                                {project.title}
                                            </div>
                                            {project.technologies && (
                                                <div className="project-tech">
                                                    {project.technologies}
                                                </div>
                                            )}
                                            {(project.url ||
                                                project.github_url) && (
                                                <div
                                                    className="project-tech"
                                                    style={{
                                                        fontSize: '11px',
                                                        opacity: 0.85,
                                                    }}
                                                >
                                                    {[
                                                        project.url ? (
                                                            <span key="demo">
                                                                {renderLink(
                                                                    project.url,
                                                                )}
                                                            </span>
                                                        ) : null,
                                                        project.github_url ? (
                                                            <span key="gh">
                                                                {renderLink(
                                                                    project.github_url,
                                                                )}
                                                            </span>
                                                        ) : null,
                                                    ]
                                                        .filter(Boolean)
                                                        .reduce(
                                                            (
                                                                acc: React.ReactNode[],
                                                                curr,
                                                                i,
                                                                arr,
                                                            ) => {
                                                                acc.push(curr);

                                                                if (
                                                                    i <
                                                                    arr.length -
                                                                        1
                                                                ) {
                                                                    acc.push(
                                                                        <span
                                                                            key={`psep-${i}`}
                                                                        >
                                                                            {' '}
                                                                            •{' '}
                                                                        </span>,
                                                                    );
                                                                }

                                                                return acc;
                                                            },
                                                            [],
                                                        )}
                                                </div>
                                            )}
                                            {project.description && (
                                                <p className="project-desc">
                                                    {project.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="additional_info">
                            {(data.additional_info?.length ?? 0) > 0 && (
                                <>
                                    <h2>Additional Information</h2>
                                    {data.additional_info?.map((item, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                marginBottom: '4px',
                                                fontSize: '13px',
                                            }}
                                        >
                                            <strong>
                                                {renderFormattedBullet(
                                                    item.label,
                                                )}
                                                :
                                            </strong>{' '}
                                            {renderFormattedBullet(item.value)}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>
                    </>
                )}

                {template === 'modern' && (
                    <>
                        <div className="header">
                            {hasPhoto && (
                                <img
                                    src={photoSrc}
                                    alt=""
                                    className="photo"
                                    referrerPolicy="no-referrer"
                                />
                            )}
                            <div className="name">
                                {data.full_name || 'Your Name'}
                            </div>
                            {data.target_role && (
                                <div className="target-role">
                                    {data.target_role}
                                </div>
                            )}
                            <div className="contact">
                                {data.email && (
                                    <a
                                        href={`mailto:${data.email}`}
                                        style={{
                                            color: 'inherit',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        {data.email}
                                    </a>
                                )}
                                {data.phone && <span>{data.phone}</span>}
                                {data.location && <span>{data.location}</span>}
                            </div>
                            {data.linkedin_url && (
                                <div className="linkedin">
                                    {renderLink(data.linkedin_url)}
                                </div>
                            )}
                            {data.github_url && (
                                <div className="linkedin">
                                    {renderLink(data.github_url)}
                                </div>
                            )}
                            {data.website_url && (
                                <div className="linkedin">
                                    {renderLink(data.website_url)}
                                </div>
                            )}
                        </div>

                        <div className="body">
                            <SectionWrapper id="personal">
                                {data.summary && (
                                    <>
                                        <h2>Summary</h2>
                                        <p>{data.summary}</p>
                                    </>
                                )}
                            </SectionWrapper>

                            <SectionWrapper id="work">
                                {(data.work_experience?.length ?? 0) > 0 && (
                                    <>
                                        <h2>Work Experience</h2>
                                        {data.work_experience?.map((job, i) => (
                                            <div key={i} className="job">
                                                <div className="job-row">
                                                    <span className="job-title">
                                                        {job.position ||
                                                            'Position'}
                                                    </span>
                                                    <span className="job-duration">
                                                        {job.duration}
                                                    </span>
                                                </div>
                                                <div className="job-company">
                                                    {job.company}
                                                </div>
                                                {job.description && (
                                                    <p className="job-desc">
                                                        {job.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </SectionWrapper>

                            <SectionWrapper id="education">
                                {(data.education?.length ?? 0) > 0 && (
                                    <>
                                        <h2>Education</h2>
                                        {data.education?.map((edu, i) => (
                                            <div key={i} className="edu">
                                                <div className="edu-row">
                                                    <span className="edu-degree">
                                                        {edu.degree || 'Degree'}
                                                    </span>
                                                    <span className="edu-year">
                                                        {edu.year}
                                                    </span>
                                                </div>
                                                <div className="edu-institution">
                                                    {edu.institution}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </SectionWrapper>

                            <SectionWrapper id="skills">
                                {(data.skills?.length ?? 0) > 0 && (
                                    <>
                                        <h2>Skills</h2>
                                        <div className="skills">
                                            {renderSkillsWithCategoryBold(
                                                data.skills || [],
                                            )}
                                        </div>
                                    </>
                                )}
                            </SectionWrapper>

                            <SectionWrapper id="certifications">
                                {(data.certifications?.length ?? 0) > 0 && (
                                    <>
                                        <h2>Certifications</h2>
                                        <div className="certs">
                                            {data.certifications?.join(' | ')}
                                        </div>
                                    </>
                                )}
                            </SectionWrapper>

                            <SectionWrapper id="projects">
                                {(data.projects?.length ?? 0) > 0 && (
                                    <>
                                        <h2>Projects</h2>
                                        {data.projects?.map((project, i) => (
                                            <div key={i} className="project">
                                                <div className="project-title">
                                                    {project.title}
                                                </div>
                                                {project.technologies && (
                                                    <div className="project-tech">
                                                        {project.technologies}
                                                    </div>
                                                )}
                                                {(project.url ||
                                                    project.github_url) && (
                                                    <div
                                                        className="project-tech"
                                                        style={{
                                                            fontSize: '11px',
                                                            opacity: 0.85,
                                                        }}
                                                    >
                                                        {[
                                                            project.url ? (
                                                                <span key="demo">
                                                                    {renderLink(
                                                                        project.url,
                                                                    )}
                                                                </span>
                                                            ) : null,
                                                            project.github_url ? (
                                                                <span key="gh">
                                                                    {renderLink(
                                                                        project.github_url,
                                                                    )}
                                                                </span>
                                                            ) : null,
                                                        ]
                                                            .filter(Boolean)
                                                            .reduce(
                                                                (
                                                                    acc: React.ReactNode[],
                                                                    curr,
                                                                    i,
                                                                    arr,
                                                                ) => {
                                                                    acc.push(
                                                                        curr,
                                                                    );

                                                                    if (
                                                                        i <
                                                                        arr.length -
                                                                            1
                                                                    ) {
                                                                        acc.push(
                                                                            <span
                                                                                key={`psep-${i}`}
                                                                            >
                                                                                {' '}
                                                                                •{' '}
                                                                            </span>,
                                                                        );
                                                                    }

                                                                    return acc;
                                                                },
                                                                [],
                                                            )}
                                                    </div>
                                                )}
                                                {project.description && (
                                                    <p className="project-desc">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </SectionWrapper>

                            <SectionWrapper id="additional_info">
                                {(data.additional_info?.length ?? 0) > 0 && (
                                    <>
                                        <h2>Additional Information</h2>
                                        {data.additional_info?.map(
                                            (item, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        marginBottom: '4px',
                                                        fontSize: '13px',
                                                    }}
                                                >
                                                    <strong>
                                                        {renderFormattedBullet(
                                                            item.label,
                                                        )}
                                                        :
                                                    </strong>{' '}
                                                    {renderFormattedBullet(
                                                        item.value,
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </>
                                )}
                            </SectionWrapper>
                        </div>
                    </>
                )}

                {template === 'philippine' && (
                    <>
                        <SectionWrapper id="personal">
                            <div className="header">
                                {hasPhoto && (
                                    <img
                                        src={photoSrc}
                                        alt=""
                                        className="photo"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <div className="name">
                                    {data.full_name || 'Your Name'}
                                </div>
                                {data.target_role && (
                                    <div className="target-role">
                                        {data.target_role}
                                    </div>
                                )}
                                <div className="contact">
                                    {data.location && (
                                        <span>{data.location}</span>
                                    )}
                                    {data.phone && <span>{data.phone}</span>}
                                    {data.email && (
                                        <a
                                            href={`mailto:${data.email}`}
                                            style={{
                                                color: 'inherit',
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            {data.email}
                                        </a>
                                    )}
                                </div>
                                {data.linkedin_url && (
                                    <div className="linkedin">
                                        {renderLink(data.linkedin_url)}
                                    </div>
                                )}
                                {data.github_url && (
                                    <div className="linkedin">
                                        {renderLink(data.github_url)}
                                    </div>
                                )}
                                {data.website_url && (
                                    <div className="linkedin">
                                        {renderLink(data.website_url)}
                                    </div>
                                )}
                            </div>

                            {data.summary && (
                                <>
                                    <h2>I. CAREER OBJECTIVE</h2>
                                    <div className="section-line" />
                                    <p>{data.summary}</p>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="work">
                            {(data.work_experience?.length ?? 0) > 0 && (
                                <>
                                    <h2>II. WORK EXPERIENCE</h2>
                                    <div className="section-line" />
                                    {data.work_experience?.map((job, i) => (
                                        <div key={i} className="job">
                                            <div className="job-company">
                                                {job.company || 'Company'}
                                            </div>
                                            <div className="job-row">
                                                <span className="job-position">
                                                    {job.position}
                                                </span>
                                                <span className="job-duration">
                                                    {job.duration}
                                                </span>
                                            </div>
                                            {job.description && (
                                                <p className="job-desc">
                                                    {job.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="education">
                            {(data.education?.length ?? 0) > 0 && (
                                <>
                                    <h2>III. EDUCATIONAL BACKGROUND</h2>
                                    <div className="section-line" />
                                    {data.education?.map((edu, i) => (
                                        <div key={i} className="edu">
                                            <div className="edu-row">
                                                <span className="edu-degree">
                                                    {edu.degree || 'Degree'}
                                                </span>
                                                <span className="edu-year">
                                                    {edu.year}
                                                </span>
                                            </div>
                                            <div className="edu-institution">
                                                {edu.institution}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="skills">
                            {(data.skills?.length ?? 0) > 0 && (
                                <>
                                    <h2>IV. SKILLS & COMPETENCIES</h2>
                                    <div className="section-line" />
                                    <div className="skills-text">
                                        {renderSkillsWithCategoryBold(
                                            data.skills || [],
                                            ' / ',
                                        )}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="certifications">
                            {(data.certifications?.length ?? 0) > 0 && (
                                <>
                                    <h2>V. CERTIFICATIONS & SEMINARS</h2>
                                    <div className="section-line" />
                                    <div className="certs">
                                        {data.certifications?.join(' | ')}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="projects">
                            {(data.projects?.length ?? 0) > 0 && (
                                <>
                                    <h2>VI. KEY PROJECTS</h2>
                                    <div className="section-line" />
                                    {data.projects?.map((project, i) => (
                                        <div key={i} className="project">
                                            <div className="project-title">
                                                {project.title}
                                            </div>
                                            {project.technologies && (
                                                <div className="project-tech">
                                                    {project.technologies}
                                                </div>
                                            )}
                                            {(project.url ||
                                                project.github_url) && (
                                                <div
                                                    className="project-tech"
                                                    style={{
                                                        fontSize: '11px',
                                                        opacity: 0.85,
                                                    }}
                                                >
                                                    {[
                                                        project.url
                                                            ? `Demo: ${project.url}`
                                                            : null,
                                                        project.github_url
                                                            ? `GitHub: ${project.github_url}`
                                                            : null,
                                                    ]
                                                        .filter(Boolean)
                                                        .join('  •  ')}
                                                </div>
                                            )}
                                            {project.description && (
                                                <p className="project-desc">
                                                    {project.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="additional_info">
                            {(data.additional_info?.length ?? 0) > 0 && (
                                <>
                                    <h2>VII. ADDITIONAL INFORMATION</h2>
                                    <div className="section-line" />
                                    {data.additional_info?.map((item, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                marginBottom: '4px',
                                                fontSize: '13px',
                                            }}
                                        >
                                            <strong>
                                                {renderFormattedBullet(
                                                    item.label,
                                                )}
                                                :
                                            </strong>{' '}
                                            {renderFormattedBullet(item.value)}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <div
                            style={{ order: 999 }}
                            className="ph-certification-block-wrapper w-full"
                        >
                            <div
                                className="ph-certification-block"
                                style={{
                                    marginTop: '24px',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #e3e3e0',
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '11px',
                                        fontStyle: 'italic',
                                        color: '#706f6c',
                                    }}
                                >
                                    I hereby declare that the information
                                    contained herein is true and correct to the
                                    best of my knowledge and ability.
                                </p>
                                <div
                                    style={{
                                        marginTop: '32px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            minWidth: '200px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                borderBottom:
                                                    '1px solid #1b1b18',
                                                paddingBottom: '2px',
                                                fontWeight: 600,
                                                fontSize: '13px',
                                            }}
                                        >
                                            {data.full_name || 'Your Name'}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: '#706f6c',
                                                marginTop: '2px',
                                            }}
                                        >
                                            Signature over Printed Name
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {template === 'ats_single_column' && (
                    <>
                        <SectionWrapper id="personal">
                            <div
                                style={{
                                    textAlign: 'left',
                                    marginBottom: '16px',
                                    borderBottom: '1px solid #d1d5db',
                                    paddingBottom: '12px',
                                }}
                            >
                                {hasPhoto && (
                                    <img
                                        src={photoSrc}
                                        alt=""
                                        className="photo"
                                        referrerPolicy="no-referrer"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            float: 'right',
                                            marginLeft: '16px',
                                            display: 'block',
                                        }}
                                    />
                                )}
                                <div
                                    style={{
                                        fontFamily:
                                            "'Instrument Sans', Inter, Arial, sans-serif",
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        letterSpacing: '-0.01em',
                                        color: '#111827',
                                    }}
                                >
                                    {data.full_name || 'Your Name'}
                                </div>
                                {data.target_role && (
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: '#4b5563',
                                            marginTop: '2px',
                                        }}
                                    >
                                        {data.target_role}
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontSize: '11px',
                                        color: '#6b7280',
                                        marginTop: '6px',
                                    }}
                                >
                                    {[
                                        data.phone ? (
                                            <span key="phone">
                                                {data.phone}
                                            </span>
                                        ) : null,
                                        data.email ? (
                                            <a
                                                key="email"
                                                href={`mailto:${data.email}`}
                                                style={{
                                                    color: 'inherit',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                {data.email}
                                            </a>
                                        ) : null,
                                        data.location ? (
                                            <span key="loc">
                                                {data.location}
                                            </span>
                                        ) : null,
                                        data.linkedin_url ? (
                                            <span key="li">
                                                {renderLink(data.linkedin_url)}
                                            </span>
                                        ) : null,
                                        data.github_url ? (
                                            <span key="gh">
                                                {renderLink(data.github_url)}
                                            </span>
                                        ) : null,
                                        data.website_url ? (
                                            <span key="web">
                                                {renderLink(data.website_url)}
                                            </span>
                                        ) : null,
                                    ]
                                        .filter(Boolean)
                                        .reduce(
                                            (
                                                acc: React.ReactNode[],
                                                curr,
                                                i,
                                                arr,
                                            ) => {
                                                acc.push(curr);

                                                if (i < arr.length - 1) {
                                                    acc.push(
                                                        <span key={`sep-${i}`}>
                                                            {' '}
                                                            |{' '}
                                                        </span>,
                                                    );
                                                }

                                                return acc;
                                            },
                                            [],
                                        )}
                                </div>
                            </div>

                            {data.summary && (
                                <>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('summary', 'PROFESSIONAL SUMMARY').toUpperCase()}
                                    </div>
                                    <p
                                        style={{
                                            fontSize: '12px',
                                            lineHeight: 1.5,
                                            color: '#111827',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        {data.summary}
                                    </p>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="skills">
                            {(data.skills?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('skills', 'TECHNICAL SKILLS').toUpperCase()}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            lineHeight: 1.5,
                                            color: '#111827',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        {data.skills?.map((skill, i) => {
                                            const colonIndex =
                                                skill.indexOf(':');

                                            if (
                                                colonIndex > 0 &&
                                                colonIndex < 30
                                            ) {
                                                const prefix = skill.substring(
                                                    0,
                                                    colonIndex,
                                                );
                                                const rest = skill.substring(
                                                    colonIndex + 1,
                                                );

                                                return (
                                                    <div key={i} style={{ marginBottom: '3px' }}>
                                                        <strong style={{ fontWeight: 600 }}>
                                                            {prefix}:
                                                        </strong>
                                                        {renderFormattedBullet(rest)}
                                                    </div>
                                                );
                                            }

                                            return <div key={i} style={{ marginBottom: '3px' }}>{renderFormattedBullet(skill)}</div>;
                                        })}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="work">
                            {(data.work_experience?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('work', 'EXPERIENCE').toUpperCase()}
                                    </div>
                                    {data.work_experience?.map((job, i) => (
                                        <div
                                            key={i}
                                            style={{ marginBottom: '10px' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'baseline',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#111827',
                                                    }}
                                                >
                                                    {job.position || 'Position'}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {job.duration}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                }}
                                            >
                                                {job.company}
                                                {job.location
                                                    ? `, ${job.location}`
                                                    : ''}
                                            </div>
                                            {job.description && (
                                                <ul
                                                    style={{
                                                        marginTop: '4px',
                                                        paddingLeft: '18px',
                                                        listStyleType: 'disc',
                                                        fontSize: '12px',
                                                        lineHeight: 1.45,
                                                        color: '#111827',
                                                    }}
                                                >
                                                    {job.description
                                                        .split(
                                                            /\n|(?<=[\.\?!])\s+(?=[A-Z0-9])|•|▪|\*/,
                                                        )
                                                        .map((l) =>
                                                            l
                                                                .trim()
                                                                .replace(
                                                                    /^[-•*▪]\s*/,
                                                                    '',
                                                                ),
                                                        )
                                                        .filter(
                                                            (l) => l.length > 0,
                                                        )
                                                        .map((line, li) => (
                                                            <li key={li}>
                                                                {renderFormattedBullet(
                                                                    line,
                                                                )}
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="education">
                            {(data.education?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('education', 'EDUCATION').toUpperCase()}
                                    </div>
                                    {data.education?.map((edu, i) => (
                                        <div
                                            key={i}
                                            style={{ marginBottom: '8px' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'baseline',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#111827',
                                                    }}
                                                >
                                                    {edu.degree || 'Degree'}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {edu.year}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                }}
                                            >
                                                {edu.institution}
                                                {edu.location
                                                    ? `, ${edu.location}`
                                                    : ''}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="projects">
                            {(data.projects?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('projects', 'PROJECTS').toUpperCase()}
                                    </div>
                                    {data.projects?.map((project, i) => (
                                        <div
                                            key={i}
                                            style={{ marginBottom: '10px' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'baseline',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#111827',
                                                    }}
                                                >
                                                    {project.title}
                                                </span>
                                                {project.duration && (
                                                    <span
                                                        style={{
                                                            fontSize: '11px',
                                                            color: '#6b7280',
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {project.duration}
                                                    </span>
                                                )}
                                            </div>
                                            {project.technologies && (
                                                <div
                                                    style={{
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                    }}
                                                >
                                                    {project.technologies}
                                                </div>
                                            )}
                                            {project.description && (
                                                <ul
                                                    style={{
                                                        marginTop: '4px',
                                                        paddingLeft: '18px',
                                                        listStyleType: 'disc',
                                                        fontSize: '12px',
                                                        lineHeight: 1.45,
                                                        color: '#111827',
                                                    }}
                                                >
                                                    {project.description
                                                        .split(
                                                            /\n|(?<=[\.\?!])\s+(?=[A-Z0-9])|•|▪|\*/,
                                                        )
                                                        .map((l) =>
                                                            l
                                                                .trim()
                                                                .replace(
                                                                    /^[-•*▪]\s*/,
                                                                    '',
                                                                ),
                                                        )
                                                        .filter(
                                                            (l) => l.length > 0,
                                                        )
                                                        .map((line, li) => (
                                                            <li key={li}>
                                                                {renderFormattedBullet(
                                                                    line,
                                                                )}
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="certifications">
                            {(data.certifications?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('certifications', 'CERTIFICATIONS').toUpperCase()}
                                    </div>
                                    <ul
                                        style={{
                                            paddingLeft: '18px',
                                            listStyleType: 'disc',
                                            fontSize: '12px',
                                            lineHeight: 1.5,
                                            color: '#111827',
                                        }}
                                    >
                                        {data.certifications?.map((cert, i) => (
                                            <li key={i}>{cert}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="additional_info">
                            {(data.additional_info?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('additional_info', 'ADDITIONAL INFORMATION').toUpperCase()}
                                    </div>
                                    {data.additional_info?.map((item, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                fontSize: '12px',
                                                lineHeight: 1.5,
                                                color: '#111827',
                                                marginBottom: '4px',
                                            }}
                                        >
                                            <strong>
                                                {renderFormattedBullet(
                                                    item.label,
                                                )}
                                                :
                                            </strong>{' '}
                                            {renderFormattedBullet(item.value)}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>
                    </>
                )}

                {template === 'ats_classic_serif' && (
                    <>
                        <SectionWrapper id="personal">
                            <div
                                style={{
                                    marginBottom: '16px',
                                    paddingBottom: '12px',
                                    borderBottom: '3px double #d1d5db',
                                    textAlign: 'center',
                                }}
                            >
                                {hasPhoto && (
                                    <img
                                        src={photoSrc}
                                        alt=""
                                        className="photo"
                                        referrerPolicy="no-referrer"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '4px',
                                            objectFit: 'cover',
                                            margin: '0 auto 12px auto',
                                        }}
                                    />
                                )}
                                <div
                                    style={{
                                        fontFamily:
                                            "'Times New Roman', Garamond, Georgia, serif",
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        color: '#111827',
                                        marginBottom: '4px',
                                        letterSpacing: '0.025em',
                                    }}
                                >
                                    {data.full_name || 'Your Name'}
                                </div>
                                {data.target_role && (
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            fontStyle: 'italic',
                                            color: '#374151',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {data.target_role}
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontFamily:
                                            "'Times New Roman', Garamond, Georgia, serif",
                                        fontSize: '11px',
                                        color: '#6b7280',
                                    }}
                                >
                                    {[
                                        data.phone ? (
                                            <span key="phone">
                                                {data.phone}
                                            </span>
                                        ) : null,
                                        data.email ? (
                                            <a
                                                key="email"
                                                href={`mailto:${data.email}`}
                                                style={{
                                                    color: 'inherit',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                {data.email}
                                            </a>
                                        ) : null,
                                        data.location ? (
                                            <span key="loc">
                                                {data.location}
                                            </span>
                                        ) : null,
                                        data.linkedin_url ? (
                                            <span key="li">
                                                {renderLink(data.linkedin_url)}
                                            </span>
                                        ) : null,
                                        data.github_url ? (
                                            <span key="gh">
                                                {renderLink(data.github_url)}
                                            </span>
                                        ) : null,
                                        data.website_url ? (
                                            <span key="web">
                                                {renderLink(data.website_url)}
                                            </span>
                                        ) : null,
                                    ]
                                        .filter(Boolean)
                                        .reduce(
                                            (
                                                acc: React.ReactNode[],
                                                curr,
                                                i,
                                                arr,
                                            ) => {
                                                acc.push(curr);

                                                if (i < arr.length - 1) {
                                                    acc.push(
                                                        <span key={`sep-${i}`}>
                                                            {' '}
                                                            |{' '}
                                                        </span>,
                                                    );
                                                }

                                                return acc;
                                            },
                                            [],
                                        )}
                                </div>
                            </div>

                            {data.summary && (
                                <>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: '#111827',
                                            marginBottom: '8px',
                                            marginTop: '12px',
                                        }}
                                    >
                                        {getTitle('summary', 'PROFESSIONAL SUMMARY').toUpperCase()}
                                    </div>
                                    <p
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '12px',
                                            lineHeight: 1.5,
                                            color: '#111827',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        {data.summary}
                                    </p>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="skills">
                            {(data.skills?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: '#111827',
                                            marginBottom: '8px',
                                            marginTop: '12px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('skills', 'TECHNICAL SKILLS').toUpperCase()}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '12px',
                                            lineHeight: 1.5,
                                            color: '#111827',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        {data.skills?.map((skill, i) => {
                                            const colonIndex =
                                                skill.indexOf(':');

                                            if (
                                                colonIndex > 0 &&
                                                colonIndex < 30
                                            ) {
                                                const prefix = skill.substring(
                                                    0,
                                                    colonIndex,
                                                );
                                                const rest = skill.substring(
                                                    colonIndex + 1,
                                                );

                                                return (
                                                    <div key={i} style={{ marginBottom: '3px' }}>
                                                        <strong style={{ fontWeight: 600 }}>
                                                            {prefix}:
                                                        </strong>
                                                        {renderFormattedBullet(rest)}
                                                    </div>
                                                );
                                            }

                                            return <div key={i} style={{ marginBottom: '3px' }}>{renderFormattedBullet(skill)}</div>;
                                        })}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="work">
                            {(data.work_experience?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: '#111827',
                                            marginBottom: '8px',
                                            marginTop: '12px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('work', 'PROFESSIONAL EXPERIENCE').toUpperCase()}
                                    </div>
                                    {data.work_experience?.map((job, i) => (
                                        <div
                                            key={i}
                                            style={{ marginBottom: '12px' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'baseline',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Times New Roman', Garamond, Georgia, serif",
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#111827',
                                                    }}
                                                >
                                                    {job.position || 'Position'}
                                                </span>
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Times New Roman', Garamond, Georgia, serif",
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {job.duration}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Times New Roman', Garamond, Georgia, serif",
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                }}
                                            >
                                                {job.company}
                                                {job.location
                                                    ? `, ${job.location}`
                                                    : ''}
                                            </div>
                                            {job.description && (
                                                <ul
                                                    style={{
                                                        marginTop: '4px',
                                                        paddingLeft: '18px',
                                                        listStyleType: 'disc',
                                                        fontSize: '12px',
                                                        lineHeight: 1.45,
                                                        color: '#111827',
                                                        fontFamily:
                                                            "'Times New Roman', Garamond, Georgia, serif",
                                                    }}
                                                >
                                                    {job.description
                                                        .split(
                                                            /\n|(?<=[\.\?!])\s+(?=[A-Z0-9])|•|▪|\*/,
                                                        )
                                                        .map((l) =>
                                                            l
                                                                .trim()
                                                                .replace(
                                                                    /^[-•*▪]\s*/,
                                                                    '',
                                                                ),
                                                        )
                                                        .filter(
                                                            (l) => l.length > 0,
                                                        )
                                                        .map((line, li) => (
                                                            <li
                                                                key={li}
                                                                style={{
                                                                    marginBottom:
                                                                        '3px',
                                                                }}
                                                            >
                                                                {renderFormattedBullet(
                                                                    line,
                                                                )}
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="education">
                            {(data.education?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: '#111827',
                                            marginBottom: '8px',
                                            marginTop: '12px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('education', 'EDUCATION').toUpperCase()}
                                    </div>
                                    {data.education?.map((edu, i) => (
                                        <div
                                            key={i}
                                            style={{ marginBottom: '10px' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'baseline',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Times New Roman', Garamond, Georgia, serif",
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#111827',
                                                    }}
                                                >
                                                    {edu.degree || 'Degree'}
                                                </span>
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Times New Roman', Garamond, Georgia, serif",
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {edu.year}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Times New Roman', Garamond, Georgia, serif",
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                }}
                                            >
                                                {edu.institution}
                                                {edu.location
                                                    ? `, ${edu.location}`
                                                    : ''}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="projects">
                            {(data.projects?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: '#111827',
                                            marginBottom: '8px',
                                            marginTop: '12px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('projects', 'PROJECTS').toUpperCase()}
                                    </div>
                                    {data.projects?.map((project, i) => (
                                        <div
                                            key={i}
                                            style={{ marginBottom: '12px' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'baseline',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Times New Roman', Garamond, Georgia, serif",
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#111827',
                                                    }}
                                                >
                                                    {project.title}
                                                </span>
                                                {project.duration && (
                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                "'Times New Roman', Garamond, Georgia, serif",
                                                            fontSize: '11px',
                                                            color: '#6b7280',
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {project.duration}
                                                    </span>
                                                )}
                                            </div>
                                            {project.technologies && (
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "'Times New Roman', Garamond, Georgia, serif",
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                    }}
                                                >
                                                    {project.technologies}
                                                </div>
                                            )}
                                            {project.description && (
                                                <ul
                                                    style={{
                                                        marginTop: '4px',
                                                        paddingLeft: '18px',
                                                        listStyleType: 'disc',
                                                        fontSize: '12px',
                                                        lineHeight: 1.45,
                                                        color: '#111827',
                                                        fontFamily:
                                                            "'Times New Roman', Garamond, Georgia, serif",
                                                    }}
                                                >
                                                    {project.description
                                                        .split(
                                                            /\n|(?<=[\.\?!])\s+(?=[A-Z0-9])|•|▪|\*/,
                                                        )
                                                        .map((l) =>
                                                            l
                                                                .trim()
                                                                .replace(
                                                                    /^[-•*▪]\s*/,
                                                                    '',
                                                                ),
                                                        )
                                                        .filter(
                                                            (l) => l.length > 0,
                                                        )
                                                        .map((line, li) => (
                                                            <li
                                                                key={li}
                                                                style={{
                                                                    marginBottom:
                                                                        '3px',
                                                                }}
                                                            >
                                                                {renderFormattedBullet(
                                                                    line,
                                                                )}
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="certifications">
                            {(data.certifications?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: '#111827',
                                            marginBottom: '8px',
                                            marginTop: '12px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('certifications', 'CERTIFICATIONS').toUpperCase()}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '12px',
                                            lineHeight: 1.5,
                                            color: '#111827',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {data.certifications?.join(' | ')}
                                    </div>
                                </>
                            )}
                        </SectionWrapper>

                        <SectionWrapper id="additional_info">
                            {(data.additional_info?.length ?? 0) > 0 && (
                                <>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Times New Roman', Garamond, Georgia, serif",
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: '#111827',
                                            marginBottom: '8px',
                                            marginTop: '12px',
                                            borderBottom: '1px solid #d1d5db',
                                            paddingBottom: '3px',
                                        }}
                                    >
                                        {getTitle('additional_info', 'ADDITIONAL INFORMATION').toUpperCase()}
                                    </div>
                                    {data.additional_info?.map((item, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                fontFamily:
                                                    "'Times New Roman', Garamond, Georgia, serif",
                                                fontSize: '12px',
                                                lineHeight: 1.5,
                                                color: '#111827',
                                                marginBottom: '4px',
                                            }}
                                        >
                                            <strong>
                                                {renderFormattedBullet(
                                                    item.label,
                                                )}
                                                :
                                            </strong>{' '}
                                            {renderFormattedBullet(item.value)}
                                        </div>
                                    ))}
                                </>
                            )}
                        </SectionWrapper>
                    </>
                )}
            </div>
            <div className="flex w-full max-w-[210mm] justify-end gap-2">
                <Button variant="outline" onClick={handleSaveVersion}>
                    <Save className="mr-2 size-4" />
                    Save Version
                </Button>
                <Button variant="default" onClick={handleDownload}>
                    <Download className="mr-2 size-4" />
                    Download PDF
                </Button>
            </div>

            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Save Resume Version</DialogTitle>
                        <DialogDescription>
                            Give this version a name so you can find it later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="version_name">Version Name</Label>
                            <Input
                                id="version_name"
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                                placeholder="e.g. TechCorp Application"
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose
                                render={
                                    <Button type="button" variant="outline" />
                                }
                            >
                                Cancel
                            </DialogClose>
                            <Button
                                onClick={confirmSaveVersion}
                                disabled={!versionName.trim()}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CoverLetterPreview({
    content,
    template,
    fullName,
    targetCompany,
    targetJobTitle,
    jobDescription,
    recipient,
}: {
    content: string;
    template: string;
    fullName: string;
    targetCompany: string;
    targetJobTitle: string;
    jobDescription: string;
    recipient: string;
}) {
    const previewRef = useRef<HTMLDivElement>(null);
    const scopedStyles = getScopedCoverLetterStyles(template);
    const printStyles = getCoverLetterPrintStyles(template);
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const displayContent = content.trim() || DEFAULT_COVER_LETTER;
    const displayCompany = targetCompany.trim() || 'Acme Corp';
    const displayJobTitle = targetJobTitle.trim() || 'Software Developer';
    const displayRecipient = recipient.trim() || 'Hiring Manager';

    function handleDownload() {
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            return;
        }

        const contentHtml = previewRef.current?.innerHTML;

        if (!contentHtml) {
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cover Letter</title>
                <style>${printStyles}</style>
            </head>
            <body>
                ${contentHtml}
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    }

    function handleSaveVersion() {
        router.post('/documents/save-cover-letter', {
            content: displayContent,
            target_company: displayCompany,
            target_job_title: displayJobTitle,
            template,
            job_description: jobDescription,
            recipient: displayRecipient,
        });
    }

    return (
        <div className="flex max-w-full min-w-0 flex-col gap-4 overflow-x-auto overflow-y-hidden pb-4">
            <div
                ref={previewRef}
                className={`cover-letter-paper-preview template-${template} mx-auto min-h-[297mm] w-full max-w-[210mm] min-w-fit shrink-0 rounded-xl bg-white p-6 text-[#1b1b18] shadow-lg ring-1 ring-black/5 md:min-w-[210mm] md:p-8`}
            >
                <style>{scopedStyles}</style>

                <div className="letter-header">
                    <div className="letter-date">{today}</div>
                </div>

                <div
                    className="letter-recipient"
                    style={{ marginBottom: '16px' }}
                >
                    <div>{displayRecipient}</div>
                    <div>{displayCompany}</div>
                    <div style={{ marginBottom: '16px' }}>
                        Re: {displayJobTitle} Position
                    </div>
                </div>

                <div className="letter-salutation">
                    Dear {displayRecipient},
                </div>

                <div className="letter-body">
                    {displayContent
                        .split('\n')
                        .map((paragraph, i) =>
                            paragraph.trim() ? (
                                <p key={i}>{renderFormattedBullet(paragraph)}</p>
                            ) : null,
                        )}
                </div>

                <div className="letter-closing">
                    <p>Sincerely,</p>
                    <p className="letter-signature">
                        {fullName || 'Your Name'}
                    </p>
                </div>
            </div>
            <div className="flex w-full max-w-[210mm] justify-end gap-2">
                <Button variant="outline" onClick={handleSaveVersion}>
                    <Save className="mr-2 size-4" />
                    Save Version
                </Button>
                <Button variant="default" onClick={handleDownload}>
                    <Download className="mr-2 size-4" />
                    Download PDF
                </Button>
            </div>
        </div>
    );
}

function CoverLetterBuilder({
    profile,
    template,
    onTemplateChange,
    aiLimit,
    coverLetterContent,
    onCoverLetterContentChange,
    onCoverLetterMetaChange,
    jobDescription,
    onJobDescriptionChange,
    initialCompany,
    initialJobTitle,
    initialRecipient,
    onRecipientChange,
}: {
    profile: ResumeProfile;
    template: string;
    onTemplateChange: (t: string) => void;
    aiLimit: AiLimit;
    coverLetterContent: string;
    onCoverLetterContentChange: (content: string) => void;
    onCoverLetterMetaChange: (company: string, jobTitle: string) => void;
    jobDescription: string;
    onJobDescriptionChange: (val: string) => void;
    initialCompany: string;
    initialJobTitle: string;
    initialRecipient: string;
    onRecipientChange: (val: string) => void;
}) {
    const [jobTitle, setJobTitle] = useState(initialJobTitle);
    const [companyName, setCompanyName] = useState(initialCompany);
    const [recipient, setRecipient] = useState(initialRecipient);
    const [generating, setGenerating] = useState(false);
    const [polishingPreset, setPolishingPreset] = useState<string | null>(null);
    const [polishing, setPolishing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadDialogOpen, setLoadDialogOpen] = useState(false);
    const [savedLetters, setSavedLetters] = useState<
        Array<{
            id: number;
            content: string;
            target_company: string | null;
            target_job_title: string | null;
            created_at: string;
        }>
    >([]);
    const [loadingLetters, setLoadingLetters] = useState(false);

    useEffect(() => {
        onCoverLetterMetaChange(companyName, jobTitle);
    }, [companyName, jobTitle, onCoverLetterMetaChange]);

    useEffect(() => {
        onRecipientChange(recipient);
    }, [recipient, onRecipientChange]);

    async function handleGenerate() {
        if (!jobDescription.trim()) {
            return;
        }

        setGenerating(true);
        setError(null);
        setSaveSuccess(false);

        try {
            const token =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';
            const response = await fetch('/documents/cover-letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ job_description: jobDescription }),
            });

            const isJson = response.headers
                .get('content-type')
                ?.includes('application/json');
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        `Generation failed (HTTP ${response.status})`,
                );
            }

            onCoverLetterContentChange(data.cover_letter);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to generate cover letter',
            );
        } finally {
            setGenerating(false);
        }
    }

    async function handlePolish(preset: string) {
        if (!coverLetterContent.trim()) {
            return;
        }

        setPolishingPreset(preset);
        setPolishing(true);
        setError(null);
        setSaveSuccess(false);

        try {
            const token =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';
            const response = await fetch('/documents/ai-improve-cover-letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ content: coverLetterContent, preset }),
            });

            const isJson = response.headers
                .get('content-type')
                ?.includes('application/json');
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        `Improvement failed (HTTP ${response.status})`,
                );
            }

            onCoverLetterContentChange(data.improved);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to improve cover letter',
            );
        } finally {
            setPolishing(false);
            setPolishingPreset(null);
        }
    }

    async function handleSave() {
        if (!coverLetterContent.trim()) {
            return;
        }

        setSaving(true);
        setError(null);
        setSaveSuccess(false);

        try {
            const token =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';
            const response = await fetch('/documents/save-cover-letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({
                    content: coverLetterContent,
                    job_description: jobDescription,
                    target_company: companyName,
                    target_job_title: jobTitle,
                    template,
                    recipient,
                }),
            });

            const isJson = response.headers
                .get('content-type')
                ?.includes('application/json');
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                throw new Error(
                    data?.message || `Save failed (HTTP ${response.status})`,
                );
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 5000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to save cover letter',
            );
        } finally {
            setSaving(false);
        }
    }

    function handleClear() {
        setJobTitle('Software Developer');
        setCompanyName('Acme Corp');
        setRecipient('Hiring Manager');
        onCoverLetterContentChange('');
        setError(null);
    }

    async function handleOpenLoad() {
        setLoadDialogOpen(true);
        setLoadingLetters(true);
        setError(null);

        try {
            const token =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';
            const response = await fetch('/documents/saved-cover-letters', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                },
            });
            const isJson = response.headers
                .get('content-type')
                ?.includes('application/json');
            const data = isJson ? await response.json() : null;
            setSavedLetters(data?.coverLetters ?? []);
        } catch {
            setError('Failed to load saved cover letters.');
        } finally {
            setLoadingLetters(false);
        }
    }

    function handleLoadLetter(letter: {
        id: number;
        content: string;
        target_company: string | null;
        target_job_title: string | null;
    }) {
        onCoverLetterContentChange(letter.content);

        if (letter.target_company) {
            setCompanyName(letter.target_company);
        }

        if (letter.target_job_title) {
            setJobTitle(letter.target_job_title);
        }

        setLoadDialogOpen(false);
    }

    const polishPresets = [
        { id: 'polish', label: 'Polish & Grammar', icon: Wand2 },
        { id: 'concise', label: 'Make Concise', icon: FileText },
        { id: 'formal', label: 'Make Formal', icon: Briefcase },
    ] as const;

    function handleTemplateSelect(value: string) {
        onTemplateChange(value);
        const predefinedText = getPredefinedCoverLetter(
            value,
            jobTitle,
            companyName,
            profile?.full_name || 'Applicant',
        );
        onCoverLetterContentChange(predefinedText);
    }

    return (
        <Card className="flex h-full flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="size-4" />
                    Cover Letter Editor
                </CardTitle>
                <CardDescription>
                    Provide target job details and use AI to generate or polish
                    your cover letter.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="target_job_title">
                            Target Job Title
                        </Label>
                        <Input
                            id="target_job_title"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            onFocus={() => {
                                if (jobTitle === 'Software Developer') {
                                    setJobTitle('');
                                }
                            }}
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="target_company">Target Company</Label>
                        <Input
                            id="target_company"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            onFocus={() => {
                                if (companyName === 'Acme Corp') {
                                    setCompanyName('');
                                }
                            }}
                            placeholder="e.g. TechCorp"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="recipient">
                            Address To / Recipient
                        </Label>
                        <Input
                            id="recipient"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            onFocus={() => {
                                if (recipient === 'Hiring Manager') {
                                    setRecipient('');
                                }
                            }}
                            placeholder="e.g. Hiring Manager"
                        />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-3 lg:col-span-1">
                        <Label>Cover Letter Style</Label>
                        <Select
                            value={template}
                            onValueChange={(value: string | null) =>
                                value && handleTemplateSelect(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select style">
                                    {COVER_LETTER_TEMPLATES.find(
                                        (t) => t.id === template,
                                    )?.name || 'Select style'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {COVER_LETTER_TEMPLATES.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="job_description">Job Description</Label>
                    <Textarea
                        id="job_description"
                        value={jobDescription}
                        onChange={(e) => onJobDescriptionChange(e.target.value)}
                        rows={3}
                        placeholder="Paste the job description here to generate a tailored cover letter..."
                    />
                    <p className="text-xs text-muted-foreground">
                        Paste the full job description for best AI-generated results.
                    </p>
                </div>

                {/* Action buttons moved to bottom footer */}

                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                        <AlertCircle className="size-4 shrink-0" />
                        {error}
                    </div>
                )}

                {saveSuccess && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="size-4 shrink-0 text-emerald-500" />
                        Cover letter saved successfully! You can load it anytime
                        via "Load Saved".
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        AI Polish:
                    </span>
                    {polishPresets.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePolish(preset.id)}
                            disabled={
                                polishing ||
                                !coverLetterContent.trim() ||
                                aiLimit.exhausted
                            }
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-[#706f6c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1b1b18] disabled:opacity-40 dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                        >
                            {polishing && polishingPreset === preset.id ? (
                                <Loader2 className="size-3 animate-spin" />
                            ) : (
                                <preset.icon className="size-3" />
                            )}
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-2">
                    <Label htmlFor="cover_letter_content">Cover Letter</Label>
                    <Textarea
                        id="cover_letter_content"
                        value={coverLetterContent}
                        onChange={(e) =>
                            onCoverLetterContentChange(e.target.value)
                        }
                        rows={18}
                        className="flex-1 resize-none font-mono leading-relaxed"
                        placeholder="Write your cover letter here, or select a template to load predefined text..."
                    />
                    <p className="text-xs text-muted-foreground">
                        Press Enter to start a new paragraph. Use <code className="rounded bg-muted px-1">**bold text**</code> for emphasis (renders in PDF).
                    </p>
                </div>
            </CardContent>

            <div className="flex items-center justify-between border-t px-(--card-spacing) py-(--card-spacing)">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="default"
                        onClick={handleGenerate}
                        disabled={
                            generating ||
                            !jobDescription.trim() ||
                            aiLimit.exhausted
                        }
                    >
                        {generating ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 size-4" />
                        )}
                        {generating ? 'Generating...' : 'AI Generate'}
                    </Button>
                    <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                        <Sparkles className="size-3" />
                        <span>
                            {aiLimit.remaining}/{aiLimit.total} AI uses today
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleOpenLoad}
                    >
                        <FolderGit2 className="mr-2 size-4" />
                        Load Saved
                    </Button>
                    <ConfirmDestructiveDialog
                        title="Clear Cover Letter?"
                        description="This will erase your current content and reset the cover letter fields to their default values. This action cannot be undone."
                        confirmLabel="Clear Letter"
                        onConfirm={handleClear}
                        trigger={
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={!coverLetterContent.trim()}
                            >
                                Clear Letter
                            </Button>
                        }
                    />
                    <Button
                        type="button"
                        variant="default"
                        onClick={handleSave}
                        disabled={saving || !coverLetterContent.trim()}
                    >
                        {saving ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 size-4" />
                        )}
                        {saving ? 'Saving...' : 'Save Letter'}
                    </Button>
                </div>
            </div>

            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogContent className="flex max-h-[70vh] max-w-lg flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderGit2 className="size-4" />
                            Load Saved Cover Letter
                        </DialogTitle>
                        <DialogDescription>
                            Select a previously saved cover letter to load into
                            the editor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {loadingLetters ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : savedLetters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    No saved cover letters yet.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {savedLetters.map((letter) => (
                                    <button
                                        key={letter.id}
                                        type="button"
                                        onClick={() => handleLoadLetter(letter)}
                                        className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-left text-sm transition-colors hover:bg-[#f5f5f4] dark:hover:bg-[#1C1C1A]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-foreground">
                                                {letter.target_company ||
                                                letter.target_job_title
                                                    ? [
                                                          letter.target_company,
                                                          letter.target_job_title,
                                                      ]
                                                          .filter(Boolean)
                                                          .join(' - ')
                                                    : 'Cover Letter'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {letter.created_at}
                                            </span>
                                        </div>
                                        <p className="line-clamp-2 text-xs text-muted-foreground">
                                            {letter.content}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose
                            render={<Button variant="outline">Cancel</Button>}
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function SortableTab({
    id,
    label,
    icon: Icon,
    isActive,
    onClick,
    isFirst,
}: {
    id: string;
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
    isFirst: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        disabled: isFirst, // disable dragging for the first item (personal)
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-1 rounded-md transition-colors ${
                isActive
                    ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]'
                    : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'
            }`}
        >
            {!isFirst && (
                <button
                    type="button"
                    className="cursor-grab touch-none py-1.5 pr-1 pl-2 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="size-3.5" />
                </button>
            )}
            <button
                type="button"
                onClick={onClick}
                className={`flex items-center gap-1.5 py-1.5 text-xs font-medium ${isFirst ? 'px-3' : 'pr-3 pl-1'}`}
            >
                <Icon className="size-3.5" />
                {label}
            </button>
        </div>
    );
}

const VALID_EDITOR_TABS = [
    'personal',
    'work',
    'education',
    'skills',
    'projects',
    'certifications',
    'additional_info',
];
const VALID_VIEWS = [
    'resume-edit',
    'resume-preview',
    'cover-letter',
    'cover-letter-preview',
    'portfolio',
];

function getInitialEditorTab(): string {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');
        if (urlTab && VALID_EDITOR_TABS.includes(urlTab)) {
            return urlTab;
        }
        const savedTab = localStorage.getItem('documents_editor_tab');
        if (savedTab && VALID_EDITOR_TABS.includes(savedTab)) {
            return savedTab;
        }
    }
    return 'personal';
}

function getInitialView(defaultView: string): string {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlView = urlParams.get('view');
        if (urlView && VALID_VIEWS.includes(urlView)) {
            return urlView;
        }
        const savedView = localStorage.getItem('documents_active_view');
        if (savedView && VALID_VIEWS.includes(savedView)) {
            return savedView;
        }
    }
    return defaultView;
}

export default function DocumentsIndex({
    profile,
    aiLimit,
    loadedResume,
    loadedCoverLetter,
    flash,
}: DocumentsPageProps) {
    const initialView = loadedResume
        ? 'resume-preview'
        : loadedCoverLetter
          ? 'cover-letter-preview'
          : 'resume-edit';
    const initialTemplate = loadedResume?.template || 'ats_classic';
    const initialCLTemplate = loadedCoverLetter?.template || 'cl_formal';

    const [activeEditorTab, setActiveEditorTabState] =
        useState<string>(getInitialEditorTab);
    const [activeView, setActiveViewState] = useState<string>(() =>
        getInitialView(initialView),
    );

    const setActiveEditorTab = (tab: string) => {
        setActiveEditorTabState(tab);
        if (typeof window !== 'undefined') {
            localStorage.getItem('documents_editor_tab');
            localStorage.setItem('documents_editor_tab', tab);
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const setActiveView = (view: string) => {
        setActiveViewState(view);
        if (typeof window !== 'undefined') {
            localStorage.setItem('documents_active_view', view);
            const url = new URL(window.location.href);
            url.searchParams.set('view', view);
            window.history.replaceState({}, '', url.toString());
        }
    };
    const [template, setTemplate] = useState<string>(initialTemplate);
    const [clTemplate, setCLTemplate] = useState<string>(initialCLTemplate);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const [aiPolishing, setAiPolishing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [coverLetterContent, setCoverLetterContent] = useState(
        loadedCoverLetter?.content || DEFAULT_COVER_LETTER,
    );
    const [coverLetterCompany, setCoverLetterCompany] = useState(
        loadedCoverLetter?.target_company || 'Acme Corp',
    );
    const [coverLetterJobTitle, setCoverLetterJobTitle] = useState(
        loadedCoverLetter?.target_job_title || 'Software Developer',
    );
    const [coverLetterJobDescription, setCoverLetterJobDescription] = useState(
        loadedCoverLetter?.job_description || '',
    );
    const [coverLetterRecipient, setCoverLetterRecipient] = useState(
        loadedCoverLetter?.recipient || 'Hiring Manager',
    );
    const [loadResumeDialogOpen, setLoadResumeDialogOpen] = useState(false);
    const [savedResumes, setSavedResumes] = useState<
        Array<{
            id: number;
            name: string;
            template: string;
            profile_data: ResumeProfile;
            created_at: string;
        }>
    >([]);
    const [loadingResumes, setLoadingResumes] = useState(false);

    const isNew = !profile || !profile.id;
    const activeProfileData = loadedResume?.profile_data || profile;

    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm<ResumeProfile>({
            full_name:
                activeProfileData?.full_name ?? (isNew ? 'Juan Dela Cruz' : ''),
            email:
                activeProfileData?.email ?? (isNew ? 'juan@example.com' : ''),
            phone:
                activeProfileData?.phone ?? (isNew ? '+63 917 123 4567' : ''),
            location:
                activeProfileData?.location ?? (isNew ? 'Metro Manila' : ''),
            photo_url: activeProfileData?.photo_url ?? '',
            linkedin_url:
                activeProfileData?.linkedin_url ??
                (isNew ? 'https://linkedin.com/in/juandelacruz' : ''),
            github_url:
                activeProfileData?.github_url ??
                (isNew ? 'https://github.com/juandelacruz' : ''),
            website_url:
                activeProfileData?.website_url ??
                (isNew ? 'https://juanportfolio.com' : ''),
            target_role:
                activeProfileData?.target_role || 'Senior Software Developer',
            summary:
                activeProfileData?.summary ||
                'Experienced software developer with expertise in building scalable web applications...',
            work_experience:
                (activeProfileData?.work_experience?.length ?? 0) > 0
                    ? activeProfileData?.work_experience || []
                    : [
                          {
                              company: 'Acme Corp',
                              position: 'Software Developer',
                              duration: '2020 - 2023',
                              description:
                                  'Developed and maintained various web applications using Laravel and React.',
                          },
                      ],
            education:
                (activeProfileData?.education?.length ?? 0) > 0
                    ? activeProfileData?.education || []
                    : [
                          {
                              institution: 'UP Diliman',
                              degree: 'BS Computer Science',
                              year: '2020',
                          },
                      ],
            skills:
                (activeProfileData?.skills?.length ?? 0) > 0
                    ? activeProfileData?.skills || []
                    : ['PHP', 'Laravel', 'React', 'TypeScript'],
            certifications:
                (activeProfileData?.certifications?.length ?? 0) > 0
                    ? activeProfileData?.certifications || []
                    : ['AWS Certified Solutions Architect'],
            projects:
                (activeProfileData?.projects?.length ?? 0) > 0
                    ? activeProfileData?.projects || []
                    : [
                          {
                              title: 'E-commerce Platform',
                              description:
                                  'Built a full-stack e-commerce platform with Next.js and Stripe.',
                              url: '',
                              technologies: 'Laravel, React, PostgreSQL',
                          },
                      ],
            additional_info:
                (activeProfileData?.additional_info?.length ?? 0) > 0
                    ? activeProfileData?.additional_info || []
                    : [],
            section_order: activeProfileData?.section_order ?? [
                'personal',
                'work',
                'education',
                'skills',
                'projects',
                'certifications',
                'additional_info',
            ],
            section_titles: activeProfileData?.section_titles ?? {},
        });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put('/documents/profile', {
            preserveScroll: true,
            preserveState: true,
        });
    }

    async function handleOpenLoadResume() {
        setLoadResumeDialogOpen(true);
        setLoadingResumes(true);

        try {
            const token =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';
            const response = await fetch('/documents/saved-resumes', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                },
            });
            const isJson = response.headers
                .get('content-type')
                ?.includes('application/json');
            const data = isJson ? await response.json() : null;
            setSavedResumes(data?.resumes ?? []);
        } catch {
            console.error('Failed to load saved resumes.');
        } finally {
            setLoadingResumes(false);
        }
    }

    function handleLoadResume(resume: {
        template: string;
        profile_data: ResumeProfile;
    }) {
        setTemplate(resume.template);
        setData({
            full_name: resume.profile_data.full_name || '',
            email: resume.profile_data.email || '',
            phone: resume.profile_data.phone || '',
            location: resume.profile_data.location || '',
            photo_url: resume.profile_data.photo_url || '',
            linkedin_url: resume.profile_data.linkedin_url || '',
            github_url: resume.profile_data.github_url || '',
            website_url: resume.profile_data.website_url || '',
            target_role: resume.profile_data.target_role || '',
            summary: resume.profile_data.summary || '',
            work_experience: resume.profile_data.work_experience || [],
            education: resume.profile_data.education || [],
            skills: resume.profile_data.skills || [],
            certifications: resume.profile_data.certifications || [],
            projects: resume.profile_data.projects || [],
            additional_info: resume.profile_data.additional_info || [],
            section_order: resume.profile_data.section_order || [
                'personal',
                'work',
                'education',
                'skills',
                'projects',
                'certifications',
                'additional_info',
            ],
        });
        setLoadResumeDialogOpen(false);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const currentOrder = data.section_order || [
                'personal',
                'work',
                'education',
                'skills',
                'projects',
                'certifications',
                'additional_info',
            ];
            const oldIndex = currentOrder.indexOf(active.id as string);
            const newIndex = currentOrder.indexOf(over.id as string);

            // Prevent dragging the 'personal' tab or dragging anything to the 'personal' position
            if (oldIndex === 0 || newIndex === 0) {
                return;
            }

            setData(
                'section_order',
                arrayMove(currentOrder, oldIndex, newIndex),
            );
        }
    }

    async function handleAiPolish(section: string, content: string) {
        if (!content.trim() || aiLimit.exhausted) {
            return;
        }

        setAiPolishing(true);
        setAiError(null);

        try {
            const token =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';
            const response = await fetch('/documents/ai-polish-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ section, content }),
            });

            const isJson = response.headers
                .get('content-type')
                ?.includes('application/json');
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                throw new Error(
                    data?.message || `Polish failed (HTTP ${response.status})`,
                );
            }

            if (section === 'summary') {
                setData('summary', data.polished);
            } else if (section === 'work_experience') {
                const experiences = [...(data.work_experience ?? [])];
                const updated = experiences.map((exp: WorkExperience) => {
                    if (exp.description === content) {
                        return { ...exp, description: data.polished };
                    }

                    return exp;
                });
                setData('work_experience', updated);
            } else if (section === 'projects') {
                const projects = [...(data.projects ?? [])];
                const updated = projects.map((proj: Project) => {
                    if (proj.description === content) {
                        return { ...proj, description: data.polished };
                    }

                    return proj;
                });
                setData('projects', updated);
            }
        } catch (err) {
            setAiError(
                err instanceof Error ? err.message : 'Failed to polish section',
            );
            setTimeout(() => setAiError(null), 3000);
        } finally {
            setAiPolishing(false);
        }
    }

    return (
        <>
            <Head title="Documents" />

            <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-6">
                <div className="flex shrink-0 items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold text-foreground">
                            Documents
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Build your resume and cover letter, then preview
                            them with matched styling.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <span className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                                            <Sparkles className="size-3 text-amber-500" />
                                            {aiLimit.remaining}/{aiLimit.total}{' '}
                                            AI uses today
                                        </span>
                                    }
                                />
                                <TooltipContent
                                    side="bottom"
                                    className="max-w-xs text-xs"
                                >
                                    Shared daily limit (10 uncached
                                    requests/day) across AI Assist and Document
                                    Generator. Cached requests are unlimited and
                                    free.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Link href="/documents/saved">
                            <Button variant="outline" size="sm">
                                <FolderGit2 className="mr-2 size-4" />
                                Saved Documents
                            </Button>
                        </Link>
                    </div>
                </div>

                {(flash?.success || recentlySuccessful) && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="size-4 shrink-0 text-emerald-500" />
                        {flash?.success || 'Resume profile saved successfully!'}
                    </div>
                )}

                {loadedResume && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="size-4 shrink-0 text-emerald-500" />
                        Loaded saved resume version: "{loadedResume.name}". You
                        can customize details in Resume Builder or switch
                        templates above.
                    </div>
                )}

                {loadedCoverLetter && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="size-4 shrink-0 text-emerald-500" />
                        Loaded saved cover letter for "
                        {loadedCoverLetter.target_company || 'Target Company'}".
                        You can customize text in Cover Letter Builder.
                    </div>
                )}

                {aiError && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                        <AlertCircle className="size-4 shrink-0" />
                        {aiError}
                    </div>
                )}

                <div className="flex shrink-0 gap-1 rounded-lg bg-[#f5f5f4] p-1 dark:bg-[#1C1C1A]">
                    {VIEWS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveView(id)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                activeView === id
                                    ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]'
                                    : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'
                            }`}
                        >
                            <Icon className="size-4" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
                    {activeView === 'resume-edit' && (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Edit3 className="size-4" />
                                        Resume Profile
                                    </CardTitle>
                                    <CardDescription>
                                        Fill in your details to build your
                                        ATS-friendly resume.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="flex flex-wrap gap-1 rounded-lg bg-[#f5f5f4] p-1 dark:bg-[#1C1C1A]">
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={
                                                    data.section_order || [
                                                        'personal',
                                                        'work',
                                                        'education',
                                                        'skills',
                                                        'projects',
                                                        'certifications',
                                                        'additional_info',
                                                    ]
                                                }
                                                strategy={
                                                    horizontalListSortingStrategy
                                                }
                                            >
                                                {(
                                                    data.section_order || [
                                                        'personal',
                                                        'work',
                                                        'education',
                                                        'skills',
                                                        'projects',
                                                        'certifications',
                                                        'additional_info',
                                                    ]
                                                ).map((id, index) => {
                                                    const tab = TABS.find(
                                                        (t) => t.id === id,
                                                    );

                                                    if (!tab) {
                                                        return null;
                                                    }

                                                    return (
                                                        <SortableTab
                                                            key={id}
                                                            id={id}
                                                            label={tab.label}
                                                            icon={tab.icon}
                                                            isActive={
                                                                activeEditorTab ===
                                                                id
                                                            }
                                                            onClick={() =>
                                                                setActiveEditorTab(
                                                                    id,
                                                                )
                                                            }
                                                            isFirst={
                                                                index === 0
                                                            }
                                                        />
                                                    );
                                                })}
                                            </SortableContext>
                                        </DndContext>
                                    </div>

                                    <div className="min-h-[300px]">
                                        {activeEditorTab === 'personal' && (
                                            <PersonalInfoTab
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                photoDataUrl={photoDataUrl}
                                                onPhotoDataUrlChange={
                                                    setPhotoDataUrl
                                                }
                                                onAiPolish={handleAiPolish}
                                            />
                                        )}
                                        {activeEditorTab === 'work' && (
                                            <WorkExperienceTab
                                                data={data}
                                                setData={setData}
                                                onAiPolish={handleAiPolish}
                                            />
                                        )}
                                        {activeEditorTab === 'education' && (
                                            <EducationTab
                                                data={data}
                                                setData={setData}
                                            />
                                        )}
                                        {activeEditorTab === 'skills' && (
                                            <SkillsTab
                                                data={data}
                                                setData={setData}
                                            />
                                        )}
                                        {activeEditorTab === 'projects' && (
                                            <ProjectsTab
                                                data={data}
                                                setData={setData}
                                                onAiPolish={handleAiPolish}
                                            />
                                        )}
                                        {activeEditorTab ===
                                            'certifications' && (
                                            <CertificationsTab
                                                data={data}
                                                setData={setData}
                                            />
                                        )}
                                        {activeEditorTab ===
                                            'additional_info' && (
                                            <AdditionalInfoTab
                                                data={data}
                                                setData={setData}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                                <div className="flex items-center justify-between border-t px-(--card-spacing) py-(--card-spacing)">
                                    <div className="text-xs text-muted-foreground">
                                        {aiPolishing && (
                                            <span className="inline-flex items-center gap-1">
                                                <Loader2 className="size-3 animate-spin" />
                                                AI polishing...
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleOpenLoadResume}
                                        >
                                            <FolderGit2 className="mr-2 size-4" />
                                            Load Saved
                                        </Button>
                                        <ConfirmDestructiveDialog
                                            title="Clear Resume?"
                                            description="This will erase all your current progress and restore the builder fields to their default dummy data. This action cannot be undone."
                                            confirmLabel="Clear Resume"
                                            trigger={
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                >
                                                    Clear Resume
                                                </Button>
                                            }
                                            onConfirm={() => {
                                                setData({
                                                    full_name: 'Juan Dela Cruz',
                                                    email: 'juan@example.com',
                                                    phone: '+63 917 123 4567',
                                                    location: 'Metro Manila',
                                                    photo_url: '',
                                                    linkedin_url:
                                                        'https://linkedin.com/in/juandelacruz',
                                                    github_url:
                                                        'https://github.com/juandelacruz',
                                                    website_url:
                                                        'https://juanportfolio.com',
                                                    target_role:
                                                        'Senior Software Developer',
                                                    summary:
                                                        'Experienced software developer with expertise in building scalable web applications...',
                                                    work_experience: [
                                                        {
                                                            company:
                                                                'Acme Corp',
                                                            position:
                                                                'Software Developer',
                                                            duration:
                                                                '2020 - 2023',
                                                            description:
                                                                'Developed and maintained various web applications using Laravel and React.',
                                                        },
                                                    ],
                                                    education: [
                                                        {
                                                            institution:
                                                                'UP Diliman',
                                                            degree: 'BS Computer Science',
                                                            year: '2020',
                                                        },
                                                    ],
                                                    skills: [
                                                        'PHP',
                                                        'Laravel',
                                                        'React',
                                                        'TypeScript',
                                                    ],
                                                    certifications: [
                                                        'AWS Certified Solutions Architect',
                                                    ],
                                                    projects: [
                                                        {
                                                            title: 'E-commerce Platform',
                                                            description:
                                                                'Built a full-stack e-commerce platform with Next.js and Stripe.',
                                                            url: '',
                                                            technologies:
                                                                'Laravel, React, PostgreSQL',
                                                        },
                                                    ],
                                                    additional_info: [],
                                                    section_order: [
                                                        'personal',
                                                        'work',
                                                        'education',
                                                        'skills',
                                                        'projects',
                                                        'certifications',
                                                        'additional_info',
                                                    ],
                                                });
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Saving...'
                                                : 'Save Profile'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </form>
                    )}

                    {activeView === 'cover-letter-edit' && (
                        <CoverLetterBuilder
                            profile={data}
                            template={clTemplate}
                            onTemplateChange={setCLTemplate}
                            aiLimit={aiLimit}
                            coverLetterContent={coverLetterContent}
                            onCoverLetterContentChange={setCoverLetterContent}
                            onCoverLetterMetaChange={(company, jobTitle) => {
                                setCoverLetterCompany(company);
                                setCoverLetterJobTitle(jobTitle);
                            }}
                            jobDescription={coverLetterJobDescription}
                            onJobDescriptionChange={
                                setCoverLetterJobDescription
                            }
                            initialCompany={coverLetterCompany}
                            initialJobTitle={coverLetterJobTitle}
                            initialRecipient={coverLetterRecipient}
                            onRecipientChange={setCoverLetterRecipient}
                        />
                    )}

                    {activeView === 'resume-preview' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex shrink-0 items-center justify-between">
                                <Label>Template</Label>
                                <Select
                                    value={template}
                                    onValueChange={(value: string | null) =>
                                        value && setTemplate(value)
                                    }
                                >
                                    <SelectTrigger className="w-auto min-w-[260px] bg-background text-foreground">
                                        <SelectValue placeholder="Select template">
                                            {TEMPLATES.find(
                                                (t) => t.id === template,
                                            )?.name || 'Select template'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        {TEMPLATES.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ResumePreview
                                data={data}
                                template={template}
                                photoDataUrl={photoDataUrl}
                            />
                        </div>
                    )}

                    {activeView === 'cover-letter-preview' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex shrink-0 items-center justify-between">
                                <Label>Cover Letter Style</Label>
                                <Select
                                    value={clTemplate}
                                    onValueChange={(value: string | null) =>
                                        value && setCLTemplate(value)
                                    }
                                >
                                    <SelectTrigger className="w-auto min-w-[260px] bg-background text-foreground">
                                        <SelectValue placeholder="Select style">
                                            {COVER_LETTER_TEMPLATES.find(
                                                (t) => t.id === clTemplate,
                                            )?.name || 'Select style'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        {COVER_LETTER_TEMPLATES.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <CoverLetterPreview
                                content={coverLetterContent}
                                template={clTemplate}
                                fullName={data.full_name}
                                targetCompany={coverLetterCompany}
                                targetJobTitle={coverLetterJobTitle}
                                jobDescription={coverLetterJobDescription}
                                recipient={coverLetterRecipient}
                            />
                        </div>
                    )}

                    <Dialog
                        open={loadResumeDialogOpen}
                        onOpenChange={setLoadResumeDialogOpen}
                    >
                        <DialogContent className="flex max-h-[70vh] max-w-lg flex-col">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FolderGit2 className="size-4" />
                                    Load Saved Resume
                                </DialogTitle>
                                <DialogDescription>
                                    Select a previously saved resume profile to
                                    load into the editor.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="min-h-0 flex-1 overflow-y-auto">
                                {loadingResumes ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : savedResumes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            No saved resumes yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {savedResumes.map((resume) => (
                                            <button
                                                key={resume.id}
                                                type="button"
                                                onClick={() =>
                                                    handleLoadResume(resume)
                                                }
                                                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-left text-sm transition-colors hover:bg-[#f5f5f4] dark:hover:bg-[#1C1C1A]"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-foreground">
                                                        {resume.name ||
                                                            'Resume'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {resume.created_at}
                                                    </span>
                                                </div>
                                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                                    Target Role:{' '}
                                                    {resume.profile_data
                                                        ?.target_role ||
                                                        'Not specified'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <DialogClose
                                    render={
                                        <Button variant="outline">
                                            Cancel
                                        </Button>
                                    }
                                />
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}

DocumentsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
