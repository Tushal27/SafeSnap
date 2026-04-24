import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/axiosInstance';
import { LIST_CHILDREN, PAIR_CHILD } from '@/api/routes';
import { ChildrenListSchema, PairChildResponseSchema, type PairChildResponse } from '../types';
import type { Child } from '@/types';

async function fetchChildren(): Promise<Child[]> {
  const { data } = await api.get<unknown>(LIST_CHILDREN);
  return ChildrenListSchema.parse(data);
}

async function pairChild(): Promise<PairChildResponse> {
  const { data } = await api.post<unknown>(PAIR_CHILD);
  return PairChildResponseSchema.parse(data);
}

export function useChildren() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['children'],
    queryFn: fetchChildren,
    staleTime: 60_000,
    refetchInterval: 30_000, // poll for online status
  });

  const pairMutation = useMutation({
    mutationFn: pairChild,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });

  return {
    children: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    pairChild: pairMutation.mutateAsync,
    pairingData: pairMutation.data ?? null,
    isPairing: pairMutation.isPending,
    pairError: pairMutation.error,
    resetPairing: pairMutation.reset,
  };
}
