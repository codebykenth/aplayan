import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface TurnstileInstance {
    execute: () => Promise<string | null>;
}

const Turnstile = forwardRef<TurnstileInstance, { siteKey: string }>(
    function Turnstile({ siteKey }, ref) {
        useImperativeHandle(ref, () => ({
            execute: () =>
                new Promise<string | null>((resolve) => {
                    const turnstile = (window as unknown as { turnstile?: { execute: unknown } }).turnstile;

                    if (!turnstile) {
                        resolve(null);
                        return;
                    }

                    turnstile.execute(siteKey, {
                        callback: (token: string) => resolve(token),
                    });
                }),
        }));

        useEffect(() => {
            if (typeof window === 'undefined') return;

            const existingScript = document.querySelector(
                'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
            );

            if (existingScript) return;

            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            return () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
            };
        }, [siteKey]);

        return <div style={{ display: 'none' }} />;
    },
);

export default Turnstile;