export interface Contact {
    id: number;
    user_id: number;
    name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    role: string | null;
    notes: string | null;
    last_contacted_at: string | null;
    created_at: string;
    updated_at: string;
    job_application_ids: number[];
}
