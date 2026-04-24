import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCard } from './AlertCard';
import { AlertDetailModal } from './AlertDetailModal';
import type { Alert } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface AlertsFeedProps {
  childId?: string;
}

export function AlertsFeed({ childId }: AlertsFeedProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const { alerts, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, acknowledge } =
    useAlerts({ childId });

  const handleAcknowledge = async (id: string) => {
    setAcknowledgingId(id);
    try {
      await acknowledge(id);
    } finally {
      setAcknowledgingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Loading alerts…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-gray-600 dark:text-gray-400">Failed to load alerts.</p>
        <Button variant="secondary" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="font-medium text-gray-500 dark:text-gray-400">No alerts found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          All clear — no flagged content detected.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Alerts feed">
      <div className="space-y-3">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={handleAcknowledge}
            onViewDetail={setSelectedAlert}
            isAcknowledging={acknowledgingId === alert.id}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="secondary"
            isLoading={isFetchingNextPage}
            onClick={() => { void fetchNextPage(); }}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Load more
          </Button>
        </div>
      )}

      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAcknowledge}
        isAcknowledging={acknowledgingId === selectedAlert?.id}
      />
    </section>
  );
}
