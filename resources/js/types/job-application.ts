export interface JobApplication {
    id: number;
    user_id: number;
    company_name: string;
    job_title: string;
    job_url: string | null;
    job_description: string | null;
    location: string;
    status: JobApplicationStatus;
    date_applied: string | null;
    expected_salary: number | null;
    offered_salary: number | null;
    notes: string | null;
    ai_match_percentage: number | null;
    ai_strengths: string[] | null;
    ai_gaps: string[] | null;
    ai_salary_min: number | null;
    ai_salary_max: number | null;
    ai_salary_notes: string | null;
    ai_evaluated_at: string | null;
    created_at: string;
    updated_at: string;
}

export type JobApplicationStatus =
    | 'wishlist'
    | 'applied'
    | 'interviewing'
    | 'offer'
    | 'rejected';

export const JOB_APPLICATION_STATUSES: {
    value: JobApplicationStatus;
    label: string;
}[] = [
    { value: 'wishlist', label: 'Wishlist' },
    { value: 'applied', label: 'Applied' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
];

export const STATUS_COLORS: Record<JobApplicationStatus, string> = {
    wishlist: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    interviewing:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    offer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    rejected:
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};