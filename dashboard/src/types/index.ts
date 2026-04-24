export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Alert {
  id: string;
  childId: string;
  timestamp: string; // ISO 8601
  severityScore: number; // 0–1
  imageHash: string; // SHA-256, NOT the image
  severity: SeverityLevel;
  acknowledged: boolean;
  acknowledgedAt: string | null;
}

export interface Child {
  id: string;
  deviceName: string;
  deviceId: string;
  pairedAt: string;
  lastSeenAt: string | null;
  isOnline: boolean;
}

export interface DayStat {
  date: string; // ISO date yyyy-MM-dd
  flaggedCount: number;
  bySeverity: Record<SeverityLevel, number>;
}

export interface WeeklyStats {
  weekStart: string;
  totalScanned: number;
  flaggedCount: number;
  byDay: DayStat[];
  bySeverity: Record<SeverityLevel, number>;
}

export interface Parent {
  id: string;
  email: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
