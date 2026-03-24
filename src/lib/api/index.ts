import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for Auth tokens
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-storage');
        if (token) {
            try {
                const parsed = JSON.parse(token);
                const actualToken = parsed.state.token;
                if (actualToken) {
                    config.headers.Authorization = `Bearer ${actualToken}`;
                }
            } catch (e) {
                console.error("Error parsing auth token", e);
            }
        }
    }
    return config;
});

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
    initiatePaymentOnly: (amount: number) => api.post(`/orders/initiate-payment-only`, null, { params: { amount } }),
    verifyAndCreate: (paymentDetails: any, orderData: any) => api.post('/orders/verify-and-create', { payment_details: paymentDetails, order_data: orderData }),
};

export const influencerApi = {
    validateCoupon: (code: string) => api.post('/influencers/coupons/validate', { code }),
};

export default api;
