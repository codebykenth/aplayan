import type { Contact } from '@/types/contact';

export interface JobApplicationActivity {
    id: number;
    type: string;
    description: string;
    created_at: string;
}

export interface TaxBreakdown {
    monthly_gross: number;
    regime: string;
    sss: number;
    philhealth: number;
    pagibig: number;
    bir_tax: number;
    total_statutory_deductions: number;
    taxable_allowances: number;
    non_taxable_allowances: number;
    total_allowances: number;
    custom_deductions: number;
    total_deductions: number;
    monthly_net: number;
    manual_net_override: number | null;
    thirteenth_month: number;
    annual_gross: number;
    annual_net: number;
    original_currency?: string;
    original_monthly_gross?: number;
    converted_monthly_gross?: number;
    conversion_rate?: number;
}

export interface TaxAllowance {
    name: string;
    amount: number;
    taxable: boolean;
}

export interface TaxCustomDeduction {
    name: string;
    amount: number;
}

export interface TaxConfig {
    regime: 'ph_regular' | 'ph_freelance_8' | 'tax_exempt' | 'custom';
    allowances: TaxAllowance[];
    custom_deductions: TaxCustomDeduction[];
    manual_net_override: number | null;
    override_sss?: number | null;
    override_philhealth?: number | null;
    override_pagibig?: number | null;
    override_bir_tax?: number | null;
}

export interface TaxSettings {
    regime: 'ph_regular' | 'ph_freelance_8' | 'tax_exempt' | 'custom';
    allowances: TaxAllowance[];
    custom_deductions: TaxCustomDeduction[];
    override_sss?: number | null;
    override_philhealth?: number | null;
    override_pagibig?: number | null;
    override_bir_tax?: number | null;
}

export const TAX_REGIMES = [
    {
        value: 'ph_regular',
        label: 'PH Regular Employee',
        description: 'SSS + PhilHealth + Pag-IBIG + BIR TRAIN',
    },
    {
        value: 'ph_freelance_8',
        label: 'PH Freelancer (8% Flat Tax)',
        description: '8% flat tax above ₱250k, no statutory contributions',
    },
    {
        value: 'tax_exempt',
        label: 'Tax-Exempt / Overseas',
        description: 'No local statutory taxes applied',
    },
] as const;

export type WorkSetupOption = 'remote' | 'hybrid' | 'onsite';

export const WORK_SETUP_OPTIONS: { value: WorkSetupOption; label: string }[] = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
];

export interface JobApplication {
    id: number;
    user_id: number;
    company_name: string;
    job_title: string;
    job_url: string | null;
    job_description: string | null;
    location: string | null;
    work_setup: WorkSetupOption;
    status: JobApplicationStatus;
    date_applied: string | null;
    expected_salary: number | null;
    offered_salary: number | null;
    currency: string;
    tax_config: TaxConfig | null;
    tax_breakdown: TaxBreakdown | null;
    notes: string | null;
    last_contacted_at: string | null;
    interview_date: string | null;
    interview_notes: string | null;
    staleness_level: 'warning' | 'alert' | null;
    days_since_update: number;
    ai_match_percentage: number | null;
    ai_tech_stack_percentage: number | null;
    ai_experience_percentage: number | null;
    ai_education_percentage: number | null;
    ai_strengths: string[] | null;
    ai_gaps: string[] | null;
    ai_salary_min: number | null;
    ai_salary_max: number | null;
    ai_salary_notes: string | null;
    ai_resume_text?: string | null;
    ai_evaluated_at: string | null;
    ai_interview_prep: {
        questions: string[];
        talking_points: string[];
        tips: string[];
    } | null;
    created_at: string;
    updated_at: string;
    activities: JobApplicationActivity[];
    contacts?: Pick<
        Contact,
        'id' | 'name' | 'email' | 'phone' | 'company_name' | 'role'
    >[];
}

export type JobApplicationStatus =
    | 'wishlist'
    | 'applied'
    | 'interviewing'
    | 'offer'
    | 'rejected'
    | 'withdrawn';

export const JOB_APPLICATION_STATUSES: {
    value: JobApplicationStatus;
    label: string;
}[] = [
    { value: 'wishlist', label: 'Wishlist' },
    { value: 'applied', label: 'Applied' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
];

export const STATUS_COLORS: Record<JobApplicationStatus, string> = {
    wishlist:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    applied:
        'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-200 dark:border dark:border-blue-800/50',
    interviewing:
        'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 dark:border dark:border-amber-800/50',
    offer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border dark:border-emerald-800/50',
    rejected:
        'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 dark:border dark:border-rose-800/50',
    withdrawn:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const JOB_APPLICATION_STATUS_ORDER: JobApplicationStatus[] = [
    'wishlist',
    'applied',
    'interviewing',
    'offer',
];

export interface ParsedJobUrl {
    company_name: string | null;
    job_title: string | null;
    job_description: string | null;
    location: string | null;
    expected_salary: number | null;
}
