import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

// Attach the Sanctum token to every request when one is stored.
// The token key must match the constant in authService.ts.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('codemind_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
