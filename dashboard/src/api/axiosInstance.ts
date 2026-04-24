import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { REFRESH_TOKEN } from './routes';

const TOKEN_KEY = 'safesnap_access_token';
const REFRESH_KEY = 'safesnap_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track whether a refresh is in flight to avoid concurrent refresh storms
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await axios.post<{ accessToken: string; refreshToken: string }>(
    REFRESH_TOKEN,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const { accessToken, refreshToken: newRefresh } = response.data;
  setTokens(accessToken, newRefresh);
  return accessToken;
}

// ── Response interceptor: 401 → refresh → retry ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as AxiosRequestConfig & { _retried?: boolean };

    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;

      try {
        if (!refreshPromise) {
          refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        } else {
          originalRequest.headers = { Authorization: `Bearer ${newToken}` };
        }

        return api(originalRequest);
      } catch {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
