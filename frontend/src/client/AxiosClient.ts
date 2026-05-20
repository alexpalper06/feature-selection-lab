// src/client/AxiosClient.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

/*
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Unpacks FastAPI's structured error responses
    const detail = error.response?.data?.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((e: any) => e.msg).join(', ')
        : error.message || 'An unexpected error occurred.';

    return Promise.reject(new Error(message));
  }
);
*/

export default axiosClient;