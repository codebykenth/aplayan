import { useCallback, useSyncExternalStore } from 'react';

const THEME_STORAGE_KEY = 'aplayan-theme';

function getStoredTheme(): string {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) ?? 'system';
    } catch {
        return 'system';
    }
}

function setStoredTheme(theme: string): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // localStorage unavailable
    }
}

function getSystemPrefersDark(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme: string): void {
    const isDark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark());
    document.documentElement.classList.toggle('dark', isDark);
}

function subscribeToStorage(callback: () => void): () => void {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
}

function subscribeToSystemTheme(callback: () => void): () => void {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
}

export function useTheme() {
    const theme = useSyncExternalStore(
        subscribeToStorage,
        getStoredTheme,
        () => 'system',
    );

    const setTheme = useCallback((newTheme: string) => {
        setStoredTheme(newTheme);
        applyTheme(newTheme);
        window.dispatchEvent(new Event('storage'));
    }, []);

    return { theme, setTheme };
}

export function initTheme(): void {
    const stored = getStoredTheme();
    applyTheme(stored);
}

export function subscribeToThemeChanges(): () => void {
    return subscribeToSystemTheme(() => {
        const stored = getStoredTheme();
        applyTheme(stored);
    });
}