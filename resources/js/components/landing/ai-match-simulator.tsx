import { CheckCircle2, ChevronRight, Target, XCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RolePreset {
    title: string;
    matchScore: number;
    strengths: string[];
    gaps: string[];
}

const rolePresets: RolePreset[] = [
    {
        title: 'Senior Full-Stack Dev',
        matchScore: 94,
        strengths: [
            'Laravel & React experience (5+ yrs)',
            'API design & RESTful architecture',
            'Team leadership & code review',
        ],
        gaps: ['Kubernetes orchestration', 'GraphQL API design'],
    },
    {
        title: 'Frontend Engineer',
        matchScore: 87,
        strengths: [
            'React & TypeScript proficiency',
            'Tailwind CSS & responsive design',
            'Component library architecture',
        ],
        gaps: ['Next.js / SSR patterns', 'E2E testing with Playwright'],
    },
    {
        title: 'Product Manager',
        matchScore: 72,
        strengths: [
            'Agile / Scrum facilitation',
            'Stakeholder communication',
            'Data-driven decision making',
        ],
        gaps: [
            'Technical architecture fundamentals',
            'SQL & analytics tooling',
        ],
    },
];

function AnimatedCounter({
    value,
    duration = 1000,
}: {
    value: number;
    duration?: number;
}) {
    const [display, setDisplay] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        startRef.current = null;
        const animate = (timestamp: number) => {
            if (startRef.current === null) {
                startRef.current = timestamp;
            }

            const elapsed = timestamp - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            setDisplay(Math.round(eased * value));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [value, duration]);

    return <span>{display}%</span>;
}

export default function AiMatchSimulator() {
    const [selectedRole, setSelectedRole] = useState<RolePreset>(
        rolePresets[0],
    );
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // trigger animation on mount and on role change
        setAnimate(false);
        const t = setTimeout(() => setAnimate(true), 50);

        return () => clearTimeout(t);
    }, [selectedRole]);

    return (
        <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">
                    Select a target role to simulate AI match analysis
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {rolePresets.map((role) => (
                    <button
                        key={role.title}
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                            'cursor-pointer rounded-lg border px-3.5 py-1.5 text-sm font-semibold transition-all',
                            selectedRole.title === role.title
                                ? 'border-primary bg-primary/15 text-primary shadow-xs'
                                : 'border-border bg-background/50 text-zinc-700 hover:border-foreground/40 hover:text-foreground dark:text-zinc-300',
                        )}
                    >
                        {role.title}
                    </button>
                ))}
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1fr]">
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background/60 p-6">
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                        {animate ? (
                            <AnimatedCounter value={selectedRole.matchScore} />
                        ) : (
                            '0%'
                        )}
                    </span>
                    <span className="mt-1.5 text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                        Match Score
                    </span>
                    <div className="mt-3 h-2.5 w-full max-w-40 overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn(
                                'h-full rounded-full bg-primary transition-all duration-1000 ease-out',
                            )}
                            style={{
                                width: animate
                                    ? `${selectedRole.matchScore}%`
                                    : '0%',
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-3.5">
                    <div>
                        <h4 className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Matched Strengths
                        </h4>
                        <ul className="mt-1.5 space-y-1.5">
                            {selectedRole.strengths.map((s) => (
                                <li
                                    key={s}
                                    className="flex items-start gap-2 text-sm font-medium text-foreground"
                                >
                                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="flex items-center gap-1.5 text-sm font-bold text-rose-600 dark:text-rose-400">
                            <XCircle className="h-4 w-4" />
                            Skill Gaps
                        </h4>
                        <ul className="mt-1.5 space-y-1.5">
                            {selectedRole.gaps.map((g) => (
                                <li
                                    key={g}
                                    className="flex items-start gap-2 text-sm font-medium text-foreground"
                                >
                                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                                    {g}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
