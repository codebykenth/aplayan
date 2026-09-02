import { z } from 'zod';

function sanitize(val: string): string {
    return val.replace(/<[^>]*>/g, '').trim();
}

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
    .object({
        name: z
            .string()
            .transform(sanitize)
            .pipe(z.string().min(1, 'Name is required').max(255)),
        email: z.string().email('Please enter a valid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        password_confirmation: z.string(),
        terms: z.literal(true, {
            message: 'You must accept the Terms of Service',
        }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
    });

export const jobApplicationSchema = z.object({
    company_name: z
        .string()
        .transform(sanitize)
        .pipe(z.string().min(1, 'Company name is required').max(255)),
    job_title: z
        .string()
        .transform(sanitize)
        .pipe(z.string().min(1, 'Job title is required').max(255)),
    location: z
        .string()
        .transform(sanitize)
        .pipe(z.string().max(255))
        .or(z.literal(''))
        .optional(),
    work_setup: z.string().min(1, 'Work setup is required'),
    status: z.string().min(1, 'Status is required'),
    job_url: z.string().url('Invalid URL').or(z.literal('')).optional(),
    job_description: z.string().optional(),
    date_applied: z.string().optional(),
    expected_salary: z.coerce.number().min(0).optional(),
    offered_salary: z.coerce.number().min(0).optional(),
    currency: z.string().optional(),
    notes: z.string().optional(),
    interview_date: z.string().optional(),
});

export const contactSchema = z.object({
    name: z
        .string()
        .transform(sanitize)
        .pipe(z.string().min(1, 'Name is required').max(255)),
    email: z.string().email('Invalid email').or(z.literal('')).optional(),
    phone: z.string().optional(),
    company_name: z.string().optional(),
    role: z.string().optional(),
    notes: z.string().optional(),
    last_contacted_at: z.string().optional(),
});

export const profileSchema = z.object({
    name: z
        .string()
        .transform(sanitize)
        .pipe(z.string().min(1, 'Name is required').max(255)),
    email: z.string().email('Invalid email address'),
    expected_salary: z.coerce.number().min(0).optional(),
    base_currency: z.string().optional(),
    job_search_preferences: z
        .object({
            target_roles: z.string().optional(),
            work_setup: z.string().optional(),
            target_industry: z.string().optional(),
        })
        .optional(),
});

export const passwordSchema = z
    .object({
        current_password: z.string().min(1, 'Current password is required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        password_confirmation: z
            .string()
            .min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
    });

export const goalSchema = z.object({
    weekly_goal: z.coerce
        .number()
        .int()
        .min(1, 'Goal must be at least 1')
        .max(100, 'Goal must be at most 100'),
});

export const saveResumeSchema = z.object({
    name: z
        .string()
        .transform(sanitize)
        .pipe(z.string().min(1, 'Name is required').max(255)),
    template: z.string().min(1, 'Template is required'),
    photo_url: z.string().url('Invalid URL').or(z.literal('')).optional(),
});

export function validateWithZod<T extends z.ZodSchema>(
    schema: T,
    data: unknown,
):
    | { success: true; data: z.infer<T> }
    | { success: false; errors: Record<string, string> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};

    for (const issue of result.error.issues) {
        const path = issue.path.join('.');

        if (!errors[path]) {
            errors[path] = issue.message;
        }
    }

    return { success: false, errors };
}
