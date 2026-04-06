import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const rawAuthClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshPromise: Promise<string> | null = null;

function skipRefreshForUrl(url: string | undefined): boolean {
    if (!url) return true;
    const paths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
    return paths.some((p) => url.includes(p));
}

export function revokeRefreshOnServer(refreshToken: string | null | undefined) {
    if (!refreshToken) return Promise.resolve();
    return rawAuthClient.post('/auth/logout', { refresh_token: refreshToken }).catch(() => {});
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retryRefresh?: boolean };
        if (!original || original._retryRefresh) return Promise.reject(error);
        if (error.response?.status !== 401) return Promise.reject(error);
        if (skipRefreshForUrl(original.url)) return Promise.reject(error);

        const refresh = useAuthStore.getState().refreshToken;
        if (!refresh) {
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined') {
                window.location.assign('/login?session=expired');
            }
            return Promise.reject(error);
        }

        try {
            if (!refreshPromise) {
                refreshPromise = rawAuthClient
                    .post('/auth/refresh', { refresh_token: refresh })
                    .then((res) => {
                        const { access_token, refresh_token, user } = res.data;
                        useAuthStore.getState().setAuth(user, access_token, refresh_token);
                        return access_token as string;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }
            const newAccess = await refreshPromise;
            original.headers = original.headers || {};
            (original.headers as Record<string, string>).Authorization = `Bearer ${newAccess}`;
            original._retryRefresh = true;
            return api(original);
        } catch {
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined') {
                window.location.assign('/login?session=expired');
            }
            return Promise.reject(error);
        }
    }
);

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    verifyEmail: (token: string) => api.get('/auth/verify', { params: { token } }),
    resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, new_password: string) => api.post('/auth/reset-password', { token, new_password }),
};

export const productApi = {
    getAll: (params?: any) => api.get('/products', { params }),
    getOne: (id: string) => api.get(`/products/${id}`),
};

export const categoryApi = {
    getAll: (params?: any) => api.get('/categories', { params }),
};

export const brandApi = {
    getAll: (params?: any) => api.get('/brands', { params }),
};

export const orderApi = {
    create: (data: any) => api.post('/orders', data),
    getAll: (userId?: string) => api.get('/orders', { params: { user_id: userId } }),
    getUserOrders: (userId?: string) => api.get('/orders', { params: { user_id: userId } }),
    getOne: (id: string) => api.get(`/orders/${id}`),
    track: (id: string) => api.get(`/orders/track/${id}`),
    syncGuestOrders: () => api.post('/orders/sync'),
    initiatePaymentOnly: (
        amount: number,
        items: { product_id: string; size_ml: number; quantity: number }[],
        orderData?: any,
    ) => api.post(`/orders/initiate-payment-only`, { amount, items, order_data: orderData }),
    verifyAndCreate: (paymentDetails: any, orderData: any) => api.post('/orders/verify-and-create', { payment_details: paymentDetails, order_data: orderData }),
    customerCancel: (orderId: string, customerEmail?: string) =>
        api.post(`/orders/${orderId}/customer-cancel`, { customer_email: customerEmail || undefined }),
};

export const influencerApi = {
    validateCoupon: (code: string) => api.post('/influencers/coupons/validate', { code }),
};

export default api;
