import { useCallback, useSyncExternalStore } from 'react';

const THEME_STORAGE_KEY = 'aplayan-theme';
const COLOR_THEME_STORAGE_KEY = 'aplayan-color-theme';

type Mode = 'light' | 'dark' | 'system';
type ColorTheme = 'zinc' | 'emerald' | 'ocean' | 'indigo' | 'sunset';

function getStoredMode(): Mode | null {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return stored ? (stored as Mode) : null;
    } catch {
        return null;
    }
}

function setStoredMode(mode: Mode): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
        // localStorage unavailable
    }
}

function getStoredColorTheme(): ColorTheme | null {
    try {
        const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
        return stored ? (stored as ColorTheme) : null;
    } catch {
        return null;
    }
}

function setStoredColorTheme(colorTheme: ColorTheme): void {
    try {
        localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
    } catch {
        // localStorage unavailable
    }
}

function getSystemPrefersDark(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyMode(mode: Mode): void {
    const isDark = mode === 'dark' || (mode === 'system' && getSystemPrefersDark());
    document.documentElement.classList.toggle('dark', isDark);
}

function applyColorTheme(colorTheme: ColorTheme): void {
    document.documentElement.setAttribute('data-color-theme', colorTheme);
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
    const mode = useSyncExternalStore(
        subscribeToStorage,
        () => getStoredMode() ?? 'system',
        () => 'system' as Mode,
    );

    const setMode = useCallback((newMode: Mode) => {
        setStoredMode(newMode);
        applyMode(newMode);
        window.dispatchEvent(new Event('storage'));
    }, []);

    return { mode, setMode };
}

export function useColorTheme() {
    const colorTheme = useSyncExternalStore(
        subscribeToStorage,
        () => getStoredColorTheme() ?? 'zinc',
        () => 'zinc' as ColorTheme,
    );

    const setColorTheme = useCallback((newColorTheme: ColorTheme) => {
        setStoredColorTheme(newColorTheme);
        applyColorTheme(newColorTheme);
        window.dispatchEvent(new Event('storage'));
    }, []);

    return { colorTheme, setColorTheme };
}

export function initTheme(): void {
    const storedMode = getStoredMode() ?? 'system';
    setStoredMode(storedMode);
    applyMode(storedMode);

    const storedColorTheme = getStoredColorTheme() ?? 'zinc';
    setStoredColorTheme(storedColorTheme);
    applyColorTheme(storedColorTheme);
}

export function subscribeToThemeChanges(): () => void {
    return subscribeToSystemTheme(() => {
        const storedMode = getStoredMode() ?? 'system';
        applyMode(storedMode);
    });
}
