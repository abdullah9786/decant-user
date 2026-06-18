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
    /** Becomes true after persist middleware finishes reading localStorage (avoids treating user as logged out on hard refresh). */
    authHydrated: boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, _get, api) => {
            // Persist may rehydrate synchronously during `create()`; do not reference `useAuthStore`
            // in onRehydrateStorage (TDZ). Mark hydrated after the current stack so rehydration has run.
            queueMicrotask(() => {
                api.setState({ authHydrated: true });
            });
            return {
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                authHydrated: false,
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
            };
        },
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
