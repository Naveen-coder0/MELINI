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

/**
 * Wrapper around fetch for admin API calls.
 * Automatically clears token and redirects to /admin/login on 401.
 */
export const adminFetch = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...(options.headers as Record<string, string> || {}),
        },
    });

    if (res.status === 401) {
        clearToken();
        window.location.href = '/admin/login';
    }

    return res;
};
