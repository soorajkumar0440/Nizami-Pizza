import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
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

// Handle 401 responses (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('nizami_token');
            localStorage.removeItem('nizami_user');
        }
        return Promise.reject(error);
    }
);

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
