import axios from 'axios';

const API_BASE_URL = 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
    : 'https://nizami-pizza-api.vercel.app/api';

// Track server status globally
let serverAwake = false;
let wakeUpPromise = null;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 45000, // 45 second timeout for cold starts
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nizami_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---- AUTO-RETRY on failure (fixes Replit cold-start) ----
api.interceptors.response.use(
    (response) => {
        // Server responded = it's awake
        serverAwake = true;
        return response;
    },
    async (error) => {
        const config = error.config;

        // Don't retry if we already retried max times, or it's a client error (real errors)
        if (
            config._retryCount >= 4 ||
            error.response?.status === 401 ||
            error.response?.status === 400 ||
            error.response?.status === 403 ||
            error.response?.status === 404
        ) {
            // Handle 401 (expired token)
            if (error.response?.status === 401) {
                localStorage.removeItem('nizami_token');
                localStorage.removeItem('nizami_user');
            }
            return Promise.reject(error);
        }

        // It's a network error or 500/502/503 — server is waking up, RETRY
        config._retryCount = (config._retryCount || 0) + 1;
        serverAwake = false;
        console.log(`[API Retry] Attempt ${config._retryCount}/4 for ${config.url}`);

        // Wait before retrying (2s, 3s, 5s, 7s) — progressive backoff
        const delays = [2000, 3000, 5000, 7000];
        await new Promise(resolve => setTimeout(resolve, delays[config._retryCount - 1] || 5000));

        return api(config);
    }
);

// ---- WAKE-UP PING: Call this on app start to wake Replit ----
export const wakeUpServer = async () => {
    // If already waking up, return the same promise (prevent duplicate pings)
    if (wakeUpPromise) return wakeUpPromise;

    wakeUpPromise = (async () => {
        const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        const maxAttempts = 5;

        for (let i = 1; i <= maxAttempts; i++) {
            try {
                const response = await axios.get(`${baseUrl}/api/health`, { 
                    timeout: 40000,
                    // Don't use the api instance to avoid auth headers
                });
                if (response.data?.status === 'OK') {
                    console.log(`[WakeUp] Server is awake! (attempt ${i})`);
                    serverAwake = true;
                    wakeUpPromise = null;
                    return true;
                }
            } catch (err) {
                console.warn(`[WakeUp] Attempt ${i}/${maxAttempts} failed: ${err.message}`);
                if (i < maxAttempts) {
                    // Wait longer between attempts (3s, 5s, 7s, 10s)
                    const delay = [3000, 5000, 7000, 10000][i - 1] || 5000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        console.error('[WakeUp] Server is not responding after all attempts');
        wakeUpPromise = null;
        return false;
    })();

    return wakeUpPromise;
};

// Check if server is awake
export const isServerAwake = () => serverAwake;

// ==================== AUTH ====================
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
    getMe: () => api.get('/auth/me'),
    updateProfile: (userData) => api.put('/auth/profile', userData)
};

// ==================== DEALS ====================
export const dealsAPI = {
    getAll: () => api.get('/deals'),
    getById: (id) => api.get(`/deals/${id}`),
    search: (query) => api.get(`/deals/search?q=${encodeURIComponent(query)}`),
    create: (dealData) => api.post('/deals', dealData),
    update: (id, dealData) => api.put(`/deals/${id}`, dealData),
    delete: (id) => api.delete(`/deals/${id}`)
};

// ==================== BANNERS ====================
export const bannersAPI = {
    getAll: (activeOnly = true) => api.get(`/banners?activeOnly=${activeOnly}`),
    getById: (id) => api.get(`/banners/${id}`),
    create: (data) => api.post('/banners', data),
    update: (id, data) => api.put(`/banners/${id}`, data),
    delete: (id) => api.delete(`/banners/${id}`)
};

// ==================== CART ====================
export const cartAPI = {
    get: () => api.get('/cart'),
    addItem: (item) => api.post('/cart', item),
    updateQuantity: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
    removeItem: (itemId) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete('/cart')
};

// ==================== ORDERS ====================
export const ordersAPI = {
    place: (orderData) => api.post('/orders', orderData),
    getUserOrders: () => api.get('/orders'),
    getAllOrders: () => api.get('/orders/all'),
    updateStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
    deleteOrder: (orderId) => api.delete(`/orders/${orderId}`),
};

// ==================== UPLOAD ====================
export const uploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// ==================== ADMIN ====================
export const adminAPI = {
    getStats: (range = 'all') => api.get(`/admin/stats?range=${range}`),
    clearOldOrders: (olderThan = '30days') => api.delete(`/admin/orders/clear?olderThan=${olderThan}`),
    getUsers: () => api.get('/admin/users'),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getCategories: () => api.get('/admin/categories'),
    getOrders: (status) => api.get(status ? `/admin/orders?status=${status}` : '/admin/orders'),
    getUnseenCount: () => api.get('/admin/orders/unseen-count'),
    markOrdersSeen: () => api.put('/admin/orders/mark-seen'),
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data)
};

export default api;
