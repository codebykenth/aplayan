import React from 'react';
import { cn } from '@/lib/utils';

interface ApplicationLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function ApplicationLogoIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('shrink-0', className)}
            {...props}
        >
            <defs>
                <linearGradient id="aplayanVortex1" x1="16" y1="2" x2="28" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="currentColor" className="text-emerald-500 dark:text-emerald-300" />
                    <stop offset="60%" stopColor="currentColor" className="text-emerald-600 dark:text-emerald-400" />
                    <stop offset="100%" stopColor="currentColor" className="text-emerald-800 dark:text-emerald-700" />
                </linearGradient>
                <linearGradient id="aplayanVortex2" x1="28" y1="22" x2="4" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="currentColor" className="text-emerald-600 dark:text-emerald-400" />
                    <stop offset="60%" stopColor="currentColor" className="text-emerald-700 dark:text-emerald-500" />
                    <stop offset="100%" stopColor="currentColor" className="text-emerald-900 dark:text-emerald-800" />
                </linearGradient>
                <linearGradient id="aplayanVortex3" x1="4" y1="22" x2="16" y2="2" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="currentColor" className="text-emerald-400 dark:text-emerald-200" />
                    <stop offset="60%" stopColor="currentColor" className="text-emerald-500 dark:text-emerald-300" />
                    <stop offset="100%" stopColor="currentColor" className="text-emerald-700 dark:text-emerald-600" />
                </linearGradient>
            </defs>

            {/* Ribbon Blade 1 (Top Sweep) */}
            <path
                d="M16 2C21.5 2 26 5.5 27.5 10.5C24.5 10.8 21 12.2 18 14.5C15 16.8 13.2 20 13 23.5C11.5 19.5 12.2 14.5 14.8 10C17.4 5.5 16 2 16 2Z"
                fill="url(#aplayanVortex1)"
            />

            {/* Ribbon Blade 2 (Right-Bottom Sweep) */}
            <path
                d="M27.5 10.5C28.8 16.2 26.5 22.2 21.5 25.5C20.2 22.8 17.5 21 14.2 20.2C10.9 19.4 7.4 20.2 4.5 22.5C7.8 19.8 12.5 18.8 17.2 19.5C21.9 20.2 25.5 17.2 27.5 10.5Z"
                fill="url(#aplayanVortex2)"
            />

            {/* Ribbon Blade 3 (Left-Bottom Sweep) */}
            <path
                d="M21.5 25.5C16.2 28.8 9.5 28 4.8 23.5C6.5 21 9.2 19.2 12.5 18.5C15.8 17.8 19 18.5 21.5 20.2C18.5 17.5 14.2 15.8 9.5 16.5C4.8 17.2 1.5 20.5 4.8 23.5Z"
                fill="url(#aplayanVortex3)"
            />

            {/* Core AI Node */}
            <circle cx="16" cy="16" r="3.5" stopColor="currentColor" className="fill-emerald-400 dark:fill-emerald-300" />
            <circle cx="16" cy="16" r="1.8" className="fill-slate-900 dark:fill-white" />
        </svg>
    );
}

export default function ApplicationLogo({
    className,
    iconOnly = false,
    size = 'md',
}: ApplicationLogoProps) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
    };

    const containerPaddingClasses = {
        sm: 'p-1',
        md: 'p-1.5',
        lg: 'p-2',
    };

    const iconSize = sizeClasses[size];
    const containerPadding = containerPaddingClasses[size];

    return (
        <div className={cn('inline-flex items-center gap-2.5', className)}>
            <div className={cn("relative flex items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 transition-all hover:bg-emerald-500/15 dark:bg-emerald-500/15 dark:ring-emerald-500/30", containerPadding)}>
                <ApplicationLogoIcon className={iconSize} />
            </div>
            {!iconOnly && (
                <span className="text-lg font-bold tracking-tight text-foreground">
                    Aplayan
                </span>
            )}
        </div>
    );
}
