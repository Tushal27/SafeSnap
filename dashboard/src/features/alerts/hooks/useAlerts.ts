import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/axiosInstance';
import { LIST_ALERTS, ACKNOWLEDGE_ALERT } from '@/api/routes';
import { AlertsPageSchema, AcknowledgeResponseSchema, type AlertsFilters, type AlertsPage, type AcknowledgeResponse } from '../types';
import type { Alert } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/constants';

async function fetchAlerts(filters: AlertsFilters): Promise<AlertsPage> {
  const params = new URLSearchParams({
    page: String(filters.page),         // 0-indexed for Spring Pageable
    size: String(filters.pageSize),     // Spring uses 'size', not 'pageSize'
    sort: 'timestamp,desc',
    ...(filters.severity ? { severity: filters.severity } : {}),
    ...(filters.childId ? { childId: filters.childId } : {}),
    ...(filters.acknowledged !== undefined ? { acknowledged: String(filters.acknowledged) } : {}),
  });

  const { data } = await api.get<unknown>(`${LIST_ALERTS}?${params.toString()}`);
  return AlertsPageSchema.parse(data);
}

async function acknowledgeAlert(alertId: string): Promise<AcknowledgeResponse> {
  // Backend expects POST /acknowledge with { alertId } in the body
  const { data } = await api.post<unknown>(ACKNOWLEDGE_ALERT, { alertId });
  return AcknowledgeResponseSchema.parse(data);
}

interface UseAlertsOptions {
  severity?: string;
  childId?: string;
  acknowledged?: boolean;
  pageSize?: number;
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const queryClient = useQueryClient();
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  const query = useInfiniteQuery({
    queryKey: ['alerts', 'list', options],
    queryFn: ({ pageParam }) =>
      fetchAlerts({
        page: pageParam as number,
        pageSize,
        severity: options.severity,
        childId: options.childId,
        acknowledged: options.acknowledged,
      }),
    initialPageParam: 0,   // Spring pages are 0-indexed
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 30_000,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: (response) => {
      queryClient.setQueriesData<{ pages: AlertsPage[] }>(
        { queryKey: ['alerts', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((alert: Alert) =>
                alert.id === response.id
                  ? { ...alert, acknowledged: true, acknowledgedAt: response.acknowledgedAt }
                  : alert,
              ),
            })),
          };
        },
      );
    },
  });

  const allAlerts = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    alerts: allAlerts,
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    acknowledge: acknowledgeMutation.mutateAsync,
    isAcknowledging: acknowledgeMutation.isPending,
  };
}
