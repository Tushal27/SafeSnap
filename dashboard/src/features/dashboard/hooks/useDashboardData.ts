import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/api/axiosInstance';
import { WEEKLY_STATS } from '@/api/routes';
import type { WeeklyStats } from '@/types';

const DayStatSchema = z.object({
  date: z.string(),
  flaggedCount: z.number(),
  bySeverity: z.object({
    LOW: z.number(),
    MEDIUM: z.number(),
    HIGH: z.number(),
    CRITICAL: z.number(),
  }),
});

const WeeklyStatsSchema = z.object({
  weekStart: z.string(),
  totalScanned: z.number(),
  flaggedCount: z.number(),
  byDay: z.array(DayStatSchema),
  bySeverity: z.object({
    LOW: z.number(),
    MEDIUM: z.number(),
    HIGH: z.number(),
    CRITICAL: z.number(),
  }),
});

async function fetchWeeklyStats(): Promise<WeeklyStats> {
  const { data } = await api.get<unknown>(WEEKLY_STATS);
  return WeeklyStatsSchema.parse(data);
}

export function useDashboardData() {
  const statsQuery = useQuery({
    queryKey: ['stats', 'weekly'],
    queryFn: fetchWeeklyStats,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });

  const ackRate =
    statsQuery.data && statsQuery.data.totalScanned > 0
      ? Math.round(
          ((statsQuery.data.totalScanned - statsQuery.data.flaggedCount) /
            statsQuery.data.totalScanned) *
            100,
        )
      : 0;

  return {
    weeklyStats: statsQuery.data ?? null,
    isLoadingStats: statsQuery.isLoading,
    statsError: statsQuery.error,
    ackRate,
    refetchStats: statsQuery.refetch,
  };
}
