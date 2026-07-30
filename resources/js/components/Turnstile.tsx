import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface TurnstileInstance {
    execute: () => Promise<string | null>;
}

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                params: {
                    sitekey: string;
                    callback: (token: string) => void;
                },
            ) => string;
            execute: (widgetId: string) => void;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

const SCRIPT_SRC =
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const Turnstile = forwardRef<
    TurnstileInstance,
    { siteKey: string; onVerify?: (token: string) => void }
>(
    function Turnstile({ siteKey, onVerify }, ref) {
        const containerRef = useRef<HTMLDivElement>(null);
        const widgetIdRef = useRef<string | null>(null);
        const resolveRef = useRef<((token: string | null) => void) | null>(
            null,
        );

        useImperativeHandle(ref, () => ({
            execute: () => {
                const widgetId = widgetIdRef.current;
                if (!siteKey || !widgetId || !window.turnstile) {
                    return Promise.resolve(null);
                }

                return new Promise<string | null>((resolve) => {
                    resolveRef.current = resolve;
                    window.turnstile!.reset(widgetId);
                    window.turnstile!.execute(widgetId);
                });
            },
        }));

        useEffect(() => {
            if (typeof window === 'undefined' || !siteKey) return;

            function initWidget() {
                if (!containerRef.current || !window.turnstile) return;

                widgetIdRef.current = window.turnstile.render(
                    containerRef.current,
                    {
                        sitekey: siteKey,
                        callback: (token: string) => {
                            if (onVerify) {
                                onVerify(token);
                            }
                            if (resolveRef.current) {
                                resolveRef.current(token);
                                resolveRef.current = null;
                            }
                        },
                    },
                );
            }

            const existing = document.querySelector(
                `script[src="${SCRIPT_SRC}"]`,
            );
            if (existing) {
                if (window.turnstile) {
                    initWidget();
                }
                return;
            }

            const script = document.createElement('script');
            script.src = SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            script.onload = initWidget;
            document.head.appendChild(script);

            return () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
                if (widgetIdRef.current && window.turnstile) {
                    window.turnstile.remove(widgetIdRef.current);
                }
            };
        }, [siteKey]);

        if (!siteKey) return null;

        return <div ref={containerRef} />;
    },
);

export default Turnstile;
