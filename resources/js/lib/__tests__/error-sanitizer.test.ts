import { describe, it, expect } from 'vitest';
import { sanitizeErrorMessage } from '../error-sanitizer';

describe('sanitizeErrorMessage', () => {
    describe('production environment', () => {
        it('returns friendly message for 401 status', () => {
            const result = sanitizeErrorMessage(
                'Unauthenticated.',
                'production',
                401,
            );
            expect(result).toBe(
                'Session expired or permission denied. Please refresh or sign in again.',
            );
        });

        it('returns friendly message for 403 status', () => {
            const result = sanitizeErrorMessage(
                'Forbidden.',
                'production',
                403,
            );
            expect(result).toBe(
                'Session expired or permission denied. Please refresh or sign in again.',
            );
        });

        it('returns friendly message for 422 status', () => {
            const result = sanitizeErrorMessage(
                'The given data was invalid.',
                'production',
                422,
            );
            expect(result).toBe(
                'Validation failed. Please review the highlighted fields.',
            );
        });

        it('returns friendly message for 429 status', () => {
            const result = sanitizeErrorMessage(
                'Too Many Attempts.',
                'production',
                429,
            );
            expect(result).toBe(
                'Rate limit exceeded. Please wait a moment before trying again.',
            );
        });

        it('returns friendly message for 500 status', () => {
            const result = sanitizeErrorMessage(
                'Server Error',
                'production',
                500,
            );
            expect(result).toBe(
                'Server issue encountered. Please try again later.',
            );
        });

        it('returns friendly message for 503 status', () => {
            const result = sanitizeErrorMessage(
                'Service Unavailable',
                'production',
                503,
            );
            expect(result).toBe(
                'Server issue encountered. Please try again later.',
            );
        });

        it('sanitizes SQLSTATE errors', () => {
            const result = sanitizeErrorMessage(
                'SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry',
                'production',
            );
            expect(result).toBe(
                'Server issue encountered. Please try again later.',
            );
        });

        it('sanitizes PDOException messages', () => {
            const result = sanitizeErrorMessage(
                'PDOException: could not find driver',
                'production',
            );
            expect(result).toBe(
                'Server issue encountered. Please try again later.',
            );
        });

        it('sanitizes QueryException messages', () => {
            const result = sanitizeErrorMessage(
                'QueryException: Column not found',
                'production',
            );
            expect(result).toBe(
                'Server issue encountered. Please try again later.',
            );
        });

        it('sanitizes ClassNotFoundException messages', () => {
            const result = sanitizeErrorMessage(
                'ClassNotFoundException: App\\Services\\MissingService',
                'production',
            );
            expect(result).toBe(
                'Server issue encountered. Please try again later.',
            );
        });

        it('sanitizes ErrorException messages', () => {
            const result = sanitizeErrorMessage(
                'ErrorException: Undefined variable',
                'production',
            );
            expect(result).toBe(
                'Server issue encountered. Please try again later.',
            );
        });

        it('sanitizes TypeError messages', () => {
            const result = sanitizeErrorMessage(
                'TypeError: Return value must be of type string',
                'production',
            );
            expect(result).toBe(
                'Server issue encountered. Please try again later.',
            );
        });

        it('returns normal error messages in production', () => {
            const result = sanitizeErrorMessage(
                'This field is required.',
                'production',
            );
            expect(result).toBe('This field is required.');
        });
    });

    describe('local environment', () => {
        it('returns raw SQLSTATE error message', () => {
            const result = sanitizeErrorMessage(
                'SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry',
                'local',
            );
            expect(result).toBe(
                'SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry',
            );
        });

        it('returns raw PDOException message', () => {
            const result = sanitizeErrorMessage(
                'PDOException: could not find driver',
                'local',
            );
            expect(result).toBe('PDOException: could not find driver');
        });

        it('returns raw error messages in local mode', () => {
            const result = sanitizeErrorMessage(
                'Something is broken!',
                'local',
            );
            expect(result).toBe('Something is broken!');
        });

        it('ignores status code mapping in local mode', () => {
            const result = sanitizeErrorMessage(
                'SQLSTATE[23000]: Duplicate entry',
                'local',
                500,
            );
            expect(result).toBe('SQLSTATE[23000]: Duplicate entry');
        });

        it('passes through user-friendly messages unchanged in local mode', () => {
            const result = sanitizeErrorMessage(
                'This field is required.',
                'local',
                422,
            );
            expect(result).toBe('This field is required.');
        });
    });

    describe('input handling', () => {
        it('extracts message from Error objects', () => {
            const error = new Error('Something went wrong');
            const result = sanitizeErrorMessage(error, 'local');
            expect(result).toBe('Something went wrong');
        });

        it('extracts message from objects with message property', () => {
            const error = { message: 'Custom error message' };
            const result = sanitizeErrorMessage(error, 'local');
            expect(result).toBe('Custom error message');
        });

        it('extracts error from objects with error property', () => {
            const error = { error: 'Error field value' };
            const result = sanitizeErrorMessage(error, 'local');
            expect(result).toBe('Error field value');
        });

        it('returns fallback for null input', () => {
            const result = sanitizeErrorMessage(null, 'local');
            expect(result).toBe('An unexpected error occurred');
        });

        it('returns fallback for undefined input', () => {
            const result = sanitizeErrorMessage(undefined, 'local');
            expect(result).toBe('An unexpected error occurred');
        });

        it('handles numeric input', () => {
            const result = sanitizeErrorMessage(42, 'local');
            expect(result).toBe('An unexpected error occurred');
        });
    });
});
