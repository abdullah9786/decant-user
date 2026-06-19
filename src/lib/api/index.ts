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
    /** Related/"you may also like" products. Loaded client-side on the PDP. */
    getRelated: (idOrSlug: string, limit = 10) =>
        api.get(`/products/${encodeURIComponent(idOrSlug)}/related`, { params: { limit } }),
    /**
     * Paginated server-side search. Drives the navbar autosuggest dropdown
     * and the /search page (with Load More). Returns `{ items, total,
     * has_more }`. Pass small `limit` (~6-8) for autosuggest and a larger
     * one (~12) for the full results grid.
     */
    search: (
        q: string,
        { limit = 12, skip = 0 }: { limit?: number; skip?: number } = {},
    ) => api.get('/products/search', { params: { q, limit, skip } }),
};

export const fragranceFamilyApi = {
    getAll: (params?: any) => api.get('/fragrance-families', { params }),
};

export const categoryApi = {
    getAll: (params?: any) => api.get('/categories', { params }),
    getOne: (id: string) => api.get(`/categories/${id}`),
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
    placeCod: (orderData: any, idempotencyKey: string) =>
        api.post('/orders/place-cod', { order_data: orderData, idempotency_key: idempotencyKey }),
    customerCancel: (orderId: string, customerEmail?: string) =>
        api.post(`/orders/${orderId}/customer-cancel`, { customer_email: customerEmail || undefined }),
};

export const settingsApi = {
    getCod: () => api.get('/settings/cod'),
};

export const giftBoxApi = {
    getAll: (params?: any) => api.get('/gift-boxes', { params }),
    getOne: (id: string) => api.get(`/gift-boxes/${id}`),
};

export const bottleApi = {
    getAll: (params?: any) => api.get('/bottles', { params }),
};

export const offerApi = {
    getActive: () => api.get('/offers/active'),
    getDailyDeal: () => api.get('/offers/daily-deal/today'),
};

export const influencerApi = {
    validateCoupon: (code: string, cartItems?: { product_id: string; quantity?: number }[]) =>
        api.post('/influencers/coupons/validate', { code, cart_items: cartItems ?? [] }),
};

export const reviewApi = {
    getByProduct: (productId: string, params?: { skip?: number; limit?: number }) =>
        api.get(`/reviews/product/${productId}`, { params }),
    getSummary: (productId: string) => api.get(`/reviews/product/${productId}/summary`),
    getEligibility: (productId: string) => api.get(`/reviews/product/${productId}/eligibility`),
    create: (data: { product_id: string; rating: number; comment: string }) =>
        api.post('/reviews', data),
};

export const blogApi = {
  listPublished: (params?: { skip?: number; limit?: number }) => api.get("/blog", { params }),
  getPublished: (slug: string) => api.get(`/blog/${encodeURIComponent(slug)}`),
  listMy: () => api.get("/blog/my"),
  getMy: (id: string) => api.get(`/blog/my/${id}`),
  createMy: (data: Record<string, unknown>) => api.post("/blog/my", data),
  updateMy: (id: string, data: Record<string, unknown>) => api.put(`/blog/my/${id}`, data),
  submitMy: (id: string) => api.post(`/blog/my/${id}/submit`),
  deleteMy: (id: string) => api.delete(`/blog/my/${id}`),
};

export default api;
