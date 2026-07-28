export interface CoverLetterTemplate {
    id: number;
    user_id: number;
    title: string;
    recipient: string | null;
    content: string;
    created_at: string;
    updated_at: string;
}
