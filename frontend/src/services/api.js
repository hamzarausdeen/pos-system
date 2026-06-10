import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('grocery-pos-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = async (promise) => {
  const response = await promise;
  return response.data;
};

export const authApi = {
  login: (payload) => unwrap(apiClient.post('/auth/login', payload)),
  me: () => unwrap(apiClient.get('/auth/me'))
};

export const setupApi = {
  status: () => unwrap(apiClient.get('/setup/status')),
  initialize: (payload) => unwrap(apiClient.post('/setup/initialize', payload))
};

export const dashboardApi = {
  summary: () => unwrap(apiClient.get('/dashboard/summary'))
};

export const categoryApi = {
  list: (params = {}) => unwrap(apiClient.get('/categories', { params })),
  create: (payload) => unwrap(apiClient.post('/categories', payload)),
  update: (id, payload) => unwrap(apiClient.put(`/categories/${id}`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/categories/${id}`))
};

export const productApi = {
  list: (params = {}) => unwrap(apiClient.get('/products', { params })),
  search: (query) => unwrap(apiClient.get('/products/search', { params: { query } })),
  create: (payload) => unwrap(apiClient.post('/products', payload)),
  update: (id, payload) => unwrap(apiClient.put(`/products/${id}`, payload)),
  updateStock: (id, payload) => unwrap(apiClient.patch(`/products/${id}/stock`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/products/${id}`)),
  // archive removed: use permanent delete (`remove`) instead
};

export const inventoryApi = {
  lowStock: () => unwrap(apiClient.get('/inventory/low-stock')),
  history: (params = {}) => unwrap(apiClient.get('/inventory/history', { params }))
};

export const saleApi = {
  create: (payload) => unwrap(apiClient.post('/sales', payload)),
  list: (params = {}) => unwrap(apiClient.get('/sales', { params })),
  getById: (id) => unwrap(apiClient.get(`/sales/${id}`))
};

export const reportApi = {
  daily: (params = {}) => unwrap(apiClient.get('/reports/daily', { params })),
  monthly: (params = {}) => unwrap(apiClient.get('/reports/monthly', { params })),
  annual: (params = {}) => unwrap(apiClient.get('/reports/annual', { params })),
  profit: () => unwrap(apiClient.get('/reports/profit')),
  stock: () => unwrap(apiClient.get('/reports/stock')),
  bestSelling: () => unwrap(apiClient.get('/reports/best-selling'))
};

export default apiClient;
