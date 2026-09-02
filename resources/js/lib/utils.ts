import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
    const digits = phone.replace(/[^\d]/g, '');

    if (digits.startsWith('639') || digits.startsWith('63')) {
        if (digits.length === 12) {
            return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
        }

        if (digits.length === 11 && digits.startsWith('639')) {
            return `+63 ${digits.slice(2)}`;
        }
    }

    if (digits.startsWith('09') && digits.length === 11) {
        return `09${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }

    return phone;
}
