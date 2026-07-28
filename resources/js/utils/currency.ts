export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export const CURRENCIES: Currency[] = [
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export function getCurrencySymbol(code: string): string {
    return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function getCurrencyName(code: string): string {
    return CURRENCIES.find((c) => c.code === code)?.name ?? code;
}

export function formatSalary(amount: number | null, currency: string = 'PHP'): string | null {
    if (amount === null) {
        return null;
    }

    const symbol = getCurrencySymbol(currency);
    const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return `${symbol}${formatted}`;
}

export function formatSalaryWithPeriod(amount: number | null, currency: string = 'PHP'): string | null {
    const formatted = formatSalary(amount, currency);

    return formatted ? `${formatted} / mo` : null;
}
