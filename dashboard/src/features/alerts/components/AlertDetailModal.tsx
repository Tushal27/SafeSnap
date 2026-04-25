import { CheckCircle, Clock, Hash, User, BarChart2, CalendarDays } from 'lucide-react';
import type { Alert } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatRelative } from '@/lib/utils';

interface AlertDetailModalProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge: (id: string) => Promise<void>;
  isAcknowledging?: boolean;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="neu-inset flex items-start gap-3 rounded-xl p-3">
      <span className="mt-0.5 shrink-0 text-indigo-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-gray-600">{value}</div>
      </div>
    </div>
  );
}

export function AlertDetailModal({
  alert,
  onClose,
  onAcknowledge,
  isAcknowledging = false,
}: AlertDetailModalProps) {
  const handleAcknowledge = async () => {
    if (!alert) return;
    await onAcknowledge(alert.id);
    onClose();
  };

  const footer =
    alert && !alert.acknowledged ? (
      <>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="primary"
          isLoading={isAcknowledging}
          onClick={() => {
            void handleAcknowledge();
          }}
          leftIcon={<CheckCircle className="h-4 w-4" />}
        >
          Acknowledge
        </Button>
      </>
    ) : (
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
    );

  return (
    <Modal
      isOpen={alert !== null}
      onClose={onClose}
      title="Alert Details"
      description="Full information about this detected event."
      size="md"
      footer={footer}
    >
      {alert && (
        <div className="space-y-3">
          <DetailRow
            icon={<Hash className="h-4 w-4" />}
            label="Alert ID"
            value={<code className="break-all text-xs font-mono text-gray-500">{alert.id}</code>}
          />

          <DetailRow
            icon={<User className="h-4 w-4" />}
            label="Child ID"
            value={<code className="text-xs font-mono text-gray-500">{alert.childId}</code>}
          />

          <DetailRow
            icon={<BarChart2 className="h-4 w-4" />}
            label="Severity"
            value={
              <div className="flex items-center gap-3">
                <Badge severity={alert.severity} />
                <span className="text-xs text-gray-400">
                  Score: {(alert.severityScore * 100).toFixed(1)}%
                </span>
              </div>
            }
          />

          <DetailRow
            icon={<Hash className="h-4 w-4" />}
            label="Image Hash"
            value={
              <code className="break-all text-xs font-mono text-gray-500">{alert.imageHash}</code>
            }
          />

          <DetailRow
            icon={<CalendarDays className="h-4 w-4" />}
            label="Detected"
            value={
              <span title={alert.timestamp}>
                {formatDateTime(alert.timestamp)}{' '}
                <span className="text-gray-400 text-xs">({formatRelative(alert.timestamp)})</span>
              </span>
            }
          />

          <DetailRow
            icon={<Clock className="h-4 w-4" />}
            label="Status"
            value={
              alert.acknowledged ? (
                <span className="inline-flex items-center gap-1.5 text-green-500 font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  Acknowledged
                  {alert.acknowledgedAt ? (
                    <span className="font-normal text-gray-400 text-xs">
                      at {formatDateTime(alert.acknowledgedAt)}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="text-yellow-500 font-semibold">Pending review</span>
              )
            }
          />
        </div>
      )}
    </Modal>
  );
}
