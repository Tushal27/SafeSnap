import type { SeverityLevel } from '@/types';

export const APP_NAME = 'SafeSnap';
export const APP_VERSION = '0.1.0';

export const TOKEN_STORAGE_KEY = 'safesnap_access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'safesnap_refresh_token';
export const THEME_STORAGE_KEY = 'safesnap_theme';
export const NOTIFICATION_PREFS_KEY = 'safesnap_notification_prefs';

export const DEFAULT_PAGE_SIZE = 20;
export const WS_RECONNECT_BASE_DELAY_MS = 1_000;
export const WS_RECONNECT_MAX_DELAY_MS = 30_000;
export const WS_RECONNECT_MAX_ATTEMPTS = 10;

export const SEVERITY_LEVELS: readonly SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

// Tailwind class sets for each severity level
export const SEVERITY_BADGE_CLASSES: Record<SeverityLevel, string> = {
  LOW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  MEDIUM: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CRITICAL: 'bg-red-200 text-red-950 dark:bg-red-950/60 dark:text-red-200 font-bold',
};

export const SEVERITY_CHART_COLORS: Record<SeverityLevel, string> = {
  LOW: '#EAB308',
  MEDIUM: '#F97316',
  HIGH: '#EF4444',
  CRITICAL: '#7F1D1D',
};
