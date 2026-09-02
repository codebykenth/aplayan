import type {
    Errors,
    FormDataType,
    HttpExceptionResponse,
    UseFormSubmitOptions,
} from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { useCallback } from 'react';
import { useToastManager } from '@/components/ui/toast';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';

function getEnv(): string {
    if (typeof window === 'undefined') {
        return 'production';
    }

    return (
        (window as unknown as Record<string, string | undefined>).APP_ENV ||
        'production'
    );
}

function scrollToFirstInvalid(): void {
    const firstInvalid = document.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
    );

    if (firstInvalid) {
        firstInvalid.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        firstInvalid.focus({ preventScroll: true });
    }
}

export function useFormSubmit<TForm extends FormDataType<TForm>>(
    initialData: TForm | (() => TForm),
) {
    const form = useForm(initialData);
    const toastManager = useToastManager();

    const handleSubmit = useCallback(
        (
            method: 'post' | 'put' | 'patch',
            url: string,
            options?: UseFormSubmitOptions & {
                onSuccess?: () => void;
                onError?: (errors: Errors) => void;
                onHttpException?: (response: HttpExceptionResponse) => void;
            },
        ) => {
            const env = getEnv();

            form[method](url, {
                ...options,
                onError: (errors: Errors) => {
                    options?.onError?.(errors);

                    setTimeout(() => scrollToFirstInvalid(), 100);

                    const errorMessages = Object.values(errors).filter(Boolean);

                    if (errorMessages.length > 0) {
                        toastManager.add({
                            title: 'Error',
                            description: sanitizeErrorMessage(
                                errorMessages[0],
                                env,
                                422,
                            ),
                            type: 'error',
                        });
                    }
                },
                onHttpException: (response: HttpExceptionResponse) => {
                    options?.onHttpException?.(response);

                    toastManager.add({
                        title: 'Error',
                        description: sanitizeErrorMessage(
                            response.data,
                            env,
                            response.status,
                        ),
                        type: 'error',
                    });
                },
                onSuccess: () => {
                    toastManager.add({
                        title: 'Success',
                        description: 'Changes saved successfully.',
                        type: 'success',
                    });
                    options?.onSuccess?.();
                },
            });
        },
        [form, toastManager],
    );

    return { ...form, handleSubmit };
}
