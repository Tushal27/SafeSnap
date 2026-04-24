import { CheckCircle, Clock } from 'lucide-react';
import type { Alert } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatRelative, truncateHash } from '@/lib/utils';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => Promise<void>;
  onViewDetail: (alert: Alert) => void;
  isAcknowledging?: boolean;
}

export function AlertCard({ alert, onAcknowledge, onViewDetail, isAcknowledging = false }: AlertCardProps) {
  const handleAcknowledge = async () => {
    await onAcknowledge(alert.id);
  };

  return (
    <Card
      className="transition-shadow hover:shadow-md"
      data-testid="alert-card"
      data-severity={alert.severity}
    >
      <CardContent className="flex items-start justify-between gap-4 p-4">
        {/* Left: severity + info */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge severity={alert.severity} data-testid="severity-badge" />
            {alert.acknowledged && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="h-3.5 w-3.5" />
                Acknowledged
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
              {truncateHash(alert.imageHash)}
            </span>
          </p>

          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="h-3 w-3" />
            <time dateTime={alert.timestamp}>{formatRelative(alert.timestamp)}</time>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(alert)}
          >
            Details
          </Button>
          {!alert.acknowledged && (
            <Button
              variant="secondary"
              size="sm"
              isLoading={isAcknowledging}
              onClick={() => { void handleAcknowledge(); }}
              data-testid="acknowledge-button"
            >
              Acknowledge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
