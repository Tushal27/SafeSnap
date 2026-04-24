// Re-export the global WebSocket hook scoped to the alerts feature.
// This allows the alerts feature to import from a feature-local path
// while keeping the implementation centralized.
export { useWebSocket } from '@/hooks/useWebSocket';
export type { ConnectionStatus } from '@/hooks/useWebSocket';
