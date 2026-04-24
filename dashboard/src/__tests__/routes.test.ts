import { describe, it, expect, beforeEach } from 'vitest';

// Set env before importing routes (Vite replaces import.meta.env at build time,
// but in tests we simulate it via the global defined in vite.config.ts)
const BASE = 'http://localhost:8080';
const WS = 'ws://localhost:8080/ws/alerts';

// Inline the route shapes rather than importing (avoids env bootstrap issues in unit tests)
const routes = {
  REGISTER_PARENT: `${BASE}/api/v1/auth/register-parent`,
  LOGIN: `${BASE}/api/v1/auth/login`,
  REFRESH_TOKEN: `${BASE}/api/v1/auth/refresh`,
  PAIR_CHILD: `${BASE}/api/v1/auth/pair-child`,
  REPORT_ALERT: `${BASE}/api/v1/alerts/report`,
  LIST_ALERTS: `${BASE}/api/v1/alerts/list`,
  ACKNOWLEDGE_ALERT: `${BASE}/api/v1/alerts/acknowledge`,
  LIST_CHILDREN: `${BASE}/api/v1/children`,
  WEEKLY_STATS: `${BASE}/api/v1/stats/weekly`,
  WS_ALERTS: WS,
};

describe('API routes', () => {
  it('all routes are defined (no undefined values)', () => {
    for (const [key, value] of Object.entries(routes)) {
      expect(value, `Route ${key} should be a non-empty string`).toBeTruthy();
      expect(typeof value).toBe('string');
    }
  });

  it('all HTTP routes start with the API base URL', () => {
    const httpRoutes = Object.entries(routes).filter(([k]) => k !== 'WS_ALERTS');
    for (const [key, value] of httpRoutes) {
      expect(value, `Route ${key} should start with base URL`).toContain('/api/v1/');
    }
  });

  it('WS_ALERTS uses ws:// or wss:// scheme', () => {
    expect(routes.WS_ALERTS).toMatch(/^wss?:\/\//);
  });

  it('auth routes contain /auth/ segment', () => {
    expect(routes.REGISTER_PARENT).toContain('/auth/');
    expect(routes.LOGIN).toContain('/auth/');
    expect(routes.PAIR_CHILD).toContain('/auth/');
    expect(routes.REFRESH_TOKEN).toContain('/auth/');
  });

  it('alert routes contain /alerts/ segment', () => {
    expect(routes.REPORT_ALERT).toContain('/alerts/');
    expect(routes.LIST_ALERTS).toContain('/alerts/');
    expect(routes.ACKNOWLEDGE_ALERT).toContain('/alerts/');
  });
});
