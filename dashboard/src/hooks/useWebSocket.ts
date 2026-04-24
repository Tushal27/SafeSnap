import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { WS_ALERTS } from '@/api/routes';
import { getAccessToken } from '@/api/axiosInstance';
import {
  WS_RECONNECT_BASE_DELAY_MS,
  WS_RECONNECT_MAX_DELAY_MS,
  WS_RECONNECT_MAX_ATTEMPTS,
} from '@/constants';
import { logger } from '@/lib/logger';
import type { Alert } from '@/types';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

const AlertSchema = z.object({
  id: z.string(),
  childId: z.string(),
  timestamp: z.string(),
  severityScore: z.number().min(0).max(1),
  imageHash: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  acknowledged: z.boolean(),
  acknowledgedAt: z.string().nullable(),
});

interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  alerts: Alert[];
  disconnect: () => void;
  reconnect: () => void;
}

export function useWebSocket(enabled = true): UseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabledRef.current) return;

    const token = getAccessToken();
    const url = token ? `${WS_ALERTS}?token=${encodeURIComponent(token)}` : WS_ALERTS;

    setConnectionStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptsRef.current = 0;
      setConnectionStatus('connected');
      logger.info('WebSocket connected');
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const raw: unknown = JSON.parse(event.data);
        const alert = AlertSchema.parse(raw);

        setAlerts((prev) => {
          const exists = prev.some((a) => a.id === alert.id);
          if (exists) return prev;
          return [alert, ...prev].slice(0, 200); // cap in-memory list
        });

        // Push into React Query cache
        queryClient.setQueryData<Alert[]>(['alerts', 'live'], (old = []) => {
          const exists = old.some((a) => a.id === alert.id);
          if (exists) return old;
          return [alert, ...old];
        });
      } catch (err) {
        logger.warn('Failed to parse WebSocket message', err);
      }
    };

    ws.onerror = () => {
      logger.warn('WebSocket error');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      wsRef.current = null;

      if (!enabledRef.current) return;

      const attempt = attemptsRef.current;
      if (attempt >= WS_RECONNECT_MAX_ATTEMPTS) {
        logger.warn('WebSocket max reconnect attempts reached');
        return;
      }

      const delay = Math.min(
        WS_RECONNECT_BASE_DELAY_MS * 2 ** attempt,
        WS_RECONNECT_MAX_DELAY_MS,
      );
      attemptsRef.current += 1;

      logger.info(`WebSocket reconnecting in ${delay}ms (attempt ${attempt + 1})`);
      reconnectTimerRef.current = setTimeout(connect, delay);
    };
  }, [queryClient]);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionStatus('disconnected');
  }, [clearReconnectTimer]);

  const reconnect = useCallback(() => {
    disconnect();
    attemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
    return disconnect;
  }, [enabled, connect, disconnect]);

  return { connectionStatus, alerts, disconnect, reconnect };
}
