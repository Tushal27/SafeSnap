const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// Auth
export const REGISTER_PARENT = `${API_BASE}/api/v1/auth/register-parent`;
export const LOGIN = `${API_BASE}/api/v1/auth/login`;
export const REFRESH_TOKEN = `${API_BASE}/api/v1/auth/refresh`;
export const PAIR_CHILD = `${API_BASE}/api/v1/auth/pair-child`;

// Alerts
export const REPORT_ALERT = `${API_BASE}/api/v1/alerts/report`;
export const LIST_ALERTS = `${API_BASE}/api/v1/alerts/list`;
export const ACKNOWLEDGE_ALERT = `${API_BASE}/api/v1/alerts/acknowledge`;

// Children
export const LIST_CHILDREN = `${API_BASE}/api/v1/children`;

// Stats
export const WEEKLY_STATS = `${API_BASE}/api/v1/stats/weekly`;

// WebSocket
export const WS_ALERTS = (import.meta.env.VITE_WS_URL as string | undefined) ?? 'ws://localhost:8080/ws/alerts';
