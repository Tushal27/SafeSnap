import { useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
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

  const {
    alerts,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    acknowledge,
  } = useAlerts({ childId });

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
      <div className="neu-inset flex flex-col items-center justify-center gap-3 rounded-2xl py-16">
        <Spinner size="lg" label="Loading alerts…" />
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Loading alerts…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="neu-inset flex flex-col items-center gap-4 rounded-2xl py-16 text-center">
        <div className="neu-icon flex h-14 w-14 items-center justify-center text-red-400">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div>
          <p className="font-bold text-gray-600">Failed to load alerts</p>
          <p className="mt-1 text-sm text-gray-400">Check your connection and try again.</p>
        </div>
        <Button variant="secondary" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="neu-inset flex flex-col items-center gap-4 rounded-2xl py-16 text-center">
        <div className="neu-icon flex h-14 w-14 items-center justify-center text-indigo-300">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div>
          <p className="font-bold text-gray-600">All clear</p>
          <p className="mt-1 text-sm text-gray-400">No flagged content detected.</p>
        </div>
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
            onClick={() => {
              void fetchNextPage();
            }}
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
