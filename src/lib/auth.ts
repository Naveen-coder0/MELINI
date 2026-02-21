// Token stored in localStorage (persists across reloads)
const TOKEN_KEY = 'melini_admin_token';

export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isAuthenticated = () => Boolean(getToken());

export const authHeaders = (): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};
