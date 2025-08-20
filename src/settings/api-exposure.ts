const STORAGE_KEY = 'google-lookup:api-exposure';

export function isApiExposureEnabled(): boolean {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue === 'true';
}

export function setApiExposure(enabled: boolean): void {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}
