import { FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const sampleProfile = {
    name: 'Maria Santos',
    targetRole: 'Senior Software Engineer',
    email: 'maria.santos@email.com',
    phone: '+63 912 345 6789',
    location: 'Metro Manila, Philippines',
    summary:
        'Results-driven software engineer with 6+ years of experience building scalable web applications. Passionate about clean architecture, developer tooling, and mentoring junior engineers.',
    skills: [
        {
            category: 'Languages',
            items: 'PHP, TypeScript, JavaScript, SQL, Python',
        },
        {
            category: 'Frameworks',
            items: 'Laravel, React, Vue.js, Express.js, Django',
        },
        {
            category: 'Tools',
            items: '**Docker**, **Kubernetes**, AWS, CI/CD, Git, Linux',
        },
        { category: 'Databases', items: 'PostgreSQL, MySQL, MongoDB, Redis' },
    ],
    experience: [
        {
            company: 'TechCorp Philippines',
            role: 'Senior Full-Stack Developer',
            period: '2022 — PRESENT',
            bullets: [
                'Led a team of 5 engineers to deliver a **microservices architecture** handling 50k+ daily requests',
                'Reduced API response times by 40% through **query optimization** and **caching strategies**',
                'Implemented automated CI/CD pipelines reducing deployment time from 2 hours to 15 minutes',
            ],
        },
        {
            company: 'StartupLab Inc.',
            role: 'Software Engineer',
            period: '2019 — 2022',
            bullets: [
                'Built and maintained React component library used across 3 product teams',
                'Designed **RESTful APIs** serving 10k+ concurrent users with 99.9% uptime',
                'Mentored 4 junior developers through structured code review and pair programming',
            ],
        },
    ],
    education:
        'B.S. Computer Science — University of the Philippines (2015 — 2019)',
};

function SingleColumnResume() {
    return (
        <div className="rounded-lg border border-border bg-white p-5 text-xs text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-100">
            <div className="border-b border-gray-200 pb-3 dark:border-gray-700">
                <h3 className="text-base font-bold tracking-tight">
                    {sampleProfile.name}
                </h3>
                <p className="mt-0.5 font-medium text-gray-700 dark:text-gray-300">
                    {sampleProfile.targetRole}
                </p>
                <p className="mt-0.5 text-gray-500 dark:text-gray-400">
                    {sampleProfile.email} | {sampleProfile.phone} |{' '}
                    {sampleProfile.location}
                </p>
            </div>

            <div className="mt-3">
                <h4 className="mb-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Professional Summary
                </h4>
                <p className="leading-relaxed">{sampleProfile.summary}</p>
            </div>

            <div className="mt-3">
                <h4 className="mb-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Technical Skills
                </h4>
                {sampleProfile.skills.map((skill) => (
                    <p key={skill.category} className="leading-relaxed">
                        <span className="font-semibold">{skill.category}:</span>{' '}
                        <span
                            dangerouslySetInnerHTML={{
                                __html: skill.items.replace(
                                    /\*\*(.*?)\*\*/g,
                                    '<strong>$1</strong>',
                                ),
                            }}
                        />
                    </p>
                ))}
            </div>

            <div className="mt-3">
                <h4 className="mb-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Experience
                </h4>
                {sampleProfile.experience.map((exp) => (
                    <div key={exp.company} className="mb-2">
                        <div className="flex items-baseline justify-between">
                            <span className="font-semibold">{exp.role}</span>
                            <span className="text-gray-500">{exp.period}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            {exp.company}
                        </p>
                        <ul className="mt-0.5 list-inside list-disc space-y-0.5">
                            {exp.bullets.map((b, i) => (
                                <li
                                    key={i}
                                    className="leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: b.replace(
                                            /\*\*(.*?)\*\*/g,
                                            '<strong>$1</strong>',
                                        ),
                                    }}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700">
                <h4 className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Education
                </h4>
                <p className="leading-relaxed">{sampleProfile.education}</p>
            </div>
        </div>
    );
}

function ClassicSerifResume() {
    return (
        <div className="rounded-lg border border-border bg-white p-5 text-xs text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-100">
            <div className="border-b-2 border-double border-gray-300 pb-3 text-center dark:border-gray-600">
                <h3 className="font-serif text-lg font-bold tracking-wide">
                    {sampleProfile.name}
                </h3>
                <p className="mt-1 font-serif text-gray-700 italic dark:text-gray-300">
                    {sampleProfile.targetRole}
                </p>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    {sampleProfile.email} &ensp;|&ensp; {sampleProfile.phone}{' '}
                    &ensp;|&ensp; {sampleProfile.location}
                </p>
            </div>

            <div className="mt-3">
                <h4 className="font-serif text-[11px] font-bold tracking-wider uppercase">
                    Professional Summary
                </h4>
                <p className="mt-0.5 font-serif leading-relaxed text-gray-700 dark:text-gray-300">
                    {sampleProfile.summary}
                </p>
            </div>

            <div className="mt-3">
                <h4 className="border-b border-gray-200 pb-0.5 font-serif text-[11px] font-bold tracking-wider uppercase dark:border-gray-700">
                    Technical Skills
                </h4>
                {sampleProfile.skills.map((skill) => (
                    <p
                        key={skill.category}
                        className="mt-0.5 font-serif leading-relaxed"
                    >
                        <span className="font-semibold">{skill.category}:</span>{' '}
                        <span
                            dangerouslySetInnerHTML={{
                                __html: skill.items.replace(
                                    /\*\*(.*?)\*\*/g,
                                    '<strong>$1</strong>',
                                ),
                            }}
                        />
                    </p>
                ))}
            </div>

            <div className="mt-3">
                <h4 className="border-b border-gray-200 pb-0.5 font-serif text-[11px] font-bold tracking-wider uppercase dark:border-gray-700">
                    Professional Experience
                </h4>
                {sampleProfile.experience.map((exp) => (
                    <div key={exp.company} className="mt-2">
                        <div className="flex items-baseline justify-between">
                            <span className="font-serif font-bold">
                                {exp.role}
                            </span>
                            <span className="font-serif text-gray-500 italic">
                                {exp.period}
                            </span>
                        </div>
                        <p className="font-serif text-gray-600 italic dark:text-gray-400">
                            {exp.company}
                        </p>
                        <ul className="mt-0.5 list-inside list-disc space-y-0.5 pl-1">
                            {exp.bullets.map((b, i) => (
                                <li
                                    key={i}
                                    className="font-serif leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: b.replace(
                                            /\*\*(.*?)\*\*/g,
                                            '<strong>$1</strong>',
                                        ),
                                    }}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700">
                <h4 className="font-serif text-[11px] font-bold tracking-wider uppercase">
                    Education
                </h4>
                <p className="mt-0.5 font-serif leading-relaxed italic">
                    {sampleProfile.education}
                </p>
            </div>
        </div>
    );
}

export default function AtsResumePreviewer() {
    const [activeTab, setActiveTab] = useState<
        'single_column' | 'classic_serif'
    >('single_column');

    return (
        <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">
                    ATS Resume Preview
                </h3>
            </div>

            <div className="mt-4 flex gap-1.5 rounded-lg bg-muted/80 p-1.5">
                <button
                    onClick={() => setActiveTab('single_column')}
                    className={cn(
                        'flex-1 cursor-pointer rounded-md px-3.5 py-2 text-sm font-semibold transition-all',
                        activeTab === 'single_column'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-zinc-600 hover:text-foreground dark:text-zinc-300',
                    )}
                >
                    ATS Single Column
                </button>
                <button
                    onClick={() => setActiveTab('classic_serif')}
                    className={cn(
                        'flex-1 cursor-pointer rounded-md px-3.5 py-2 text-sm font-semibold transition-all',
                        activeTab === 'classic_serif'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-zinc-600 hover:text-foreground dark:text-zinc-300',
                    )}
                >
                    ATS Classic Serif
                </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto rounded-lg">
                {activeTab === 'single_column' ? (
                    <SingleColumnResume />
                ) : (
                    <ClassicSerifResume />
                )}
            </div>
        </div>
    );
}
