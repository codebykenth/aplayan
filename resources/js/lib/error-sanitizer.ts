const PRODUCTION_MESSAGES: Record<number, string> = {
    401: 'Session expired or permission denied. Please refresh or sign in again.',
    403: 'Session expired or permission denied. Please refresh or sign in again.',
    422: 'Validation failed. Please review the highlighted fields.',
    429: 'Rate limit exceeded. Please wait a moment before trying again.',
    500: 'Server issue encountered. Please try again later.',
    503: 'Server issue encountered. Please try again later.',
};

const INTERNAL_PATTERNS = [
    'SQLSTATE',
    'PDOException',
    'QueryException',
    'ClassNotFoundException',
    'ErrorException',
    'TypeError',
];

function extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (error && typeof error === 'object') {
        const obj = error as Record<string, unknown>;

        if (typeof obj.message === 'string') {
            return obj.message;
        }

        if (typeof obj.error === 'string') {
            return obj.error;
        }

        try {
            return JSON.stringify(obj);
        } catch {
            return 'An unexpected error occurred';
        }
    }

    return 'An unexpected error occurred';
}

function matchesInternalPattern(message: string): boolean {
    return INTERNAL_PATTERNS.some((pattern) => message.includes(pattern));
}

export function sanitizeErrorMessage(
    error: unknown,
    env: string = 'production',
    statusCode?: number,
): string {
    const rawMessage = extractErrorMessage(error);

    if (env === 'local') {
        return rawMessage;
    }

    if (statusCode && PRODUCTION_MESSAGES[statusCode]) {
        return PRODUCTION_MESSAGES[statusCode];
    }

    if (matchesInternalPattern(rawMessage)) {
        return 'Server issue encountered. Please try again later.';
    }

    return rawMessage;
}
