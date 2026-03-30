import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    full_name?: string;
    is_admin: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            setAuth: (user, token, refreshToken) =>
                set({ user, token, refreshToken, isAuthenticated: true }),
            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
