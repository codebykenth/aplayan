export interface ApplicationTemplate {
    id: number;
    user_id: number;
    name: string;
    category: string | null;
    default_location: string | null;
    default_expected_salary: number | null;
    default_job_description_keywords: string | null;
    default_notes: string | null;
    created_at: string;
    updated_at: string;
}
