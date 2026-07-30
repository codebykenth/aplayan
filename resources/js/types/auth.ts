export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    expected_salary?: number | null;
    base_currency?: string;
    role?: 'admin' | 'user' | string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
};

export type Auth = {
    user: User;
};
