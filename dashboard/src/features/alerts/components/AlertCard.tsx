import { CheckCircle, Clock, Eye } from 'lucide-react';
import type { Alert } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelative, truncateHash } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => Promise<void>;
  onViewDetail: (alert: Alert) => void;
  isAcknowledging?: boolean;
}

const severityBorderColor: Record<string, string> = {
  LOW: '#eab308',
  MEDIUM: '#f97316',
  HIGH: '#ef4444',
  CRITICAL: '#7f1d1d',
};

export function AlertCard({
  alert,
  onAcknowledge,
  onViewDetail,
  isAcknowledging = false,
}: AlertCardProps) {
  const handleAcknowledge = async () => {
    await onAcknowledge(alert.id);
  };

  const borderColor = severityBorderColor[alert.severity] ?? '#9ca3af';

  return (
    <div
      className={cn('neu-card p-4 transition-all duration-200 hover:scale-[1.01]')}
      style={{ borderLeft: `4px solid ${borderColor}` }}
      data-testid="alert-card"
      data-severity={alert.severity}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left section */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Severity badge + acknowledged marker */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge severity={alert.severity} data-testid="severity-badge" />
            {alert.acknowledged && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500">
                <CheckCircle className="h-3.5 w-3.5" />
                Acknowledged
              </span>
            )}
          </div>

          {/* Image hash */}
          <p
            className="font-mono text-xs text-gray-400 truncate"
            title={alert.imageHash}
          >
            {truncateHash(alert.imageHash)}
          </p>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3 shrink-0" />
            <time dateTime={alert.timestamp}>{formatRelative(alert.timestamp)}</time>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex shrink-0 flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(alert)}
            leftIcon={<Eye className="h-3.5 w-3.5" />}
          >
            Details
          </Button>
          {!alert.acknowledged && (
            <Button
              variant="secondary"
              size="sm"
              isLoading={isAcknowledging}
              onClick={() => {
                void handleAcknowledge();
              }}
              data-testid="acknowledge-button"
            >
              {isAcknowledging ? 'Acking…' : 'Acknowledge'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
