import { createContext, useContext, useState, ReactNode } from 'react';
import { saveToken, clearToken, isAuthenticated as checkAuth, getToken } from '@/lib/auth';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    token: null,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => getToken());

    const login = (newToken: string) => {
        saveToken(newToken);
        setToken(newToken);
    };

    const logout = () => {
        clearToken();
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token || checkAuth(), token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
