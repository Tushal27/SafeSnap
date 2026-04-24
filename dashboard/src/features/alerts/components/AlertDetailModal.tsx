import { CheckCircle } from 'lucide-react';
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
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4">
      <dt className="w-36 shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}

export function AlertDetailModal({ alert, onClose, onAcknowledge, isAcknowledging = false }: AlertDetailModalProps) {
  const handleAcknowledge = async () => {
    if (!alert) return;
    await onAcknowledge(alert.id);
    onClose();
  };

  const footer = alert && !alert.acknowledged ? (
    <>
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
      <Button
        variant="primary"
        isLoading={isAcknowledging}
        onClick={() => { void handleAcknowledge(); }}
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
        <dl className="space-y-4">
          <DetailRow label="Alert ID" value={<code className="text-xs break-all">{alert.id}</code>} />
          <DetailRow label="Child ID" value={<code className="text-xs">{alert.childId}</code>} />
          <DetailRow
            label="Severity"
            value={<Badge severity={alert.severity} />}
          />
          <DetailRow
            label="Severity Score"
            value={`${(alert.severityScore * 100).toFixed(1)}%`}
          />
          <DetailRow
            label="Image Hash"
            value={<code className="break-all text-xs">{alert.imageHash}</code>}
          />
          <DetailRow
            label="Detected"
            value={
              <span title={alert.timestamp}>
                {formatDateTime(alert.timestamp)}{' '}
                <span className="text-gray-400">({formatRelative(alert.timestamp)})</span>
              </span>
            }
          />
          <DetailRow
            label="Status"
            value={
              alert.acknowledged ? (
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  Acknowledged {alert.acknowledgedAt ? `at ${formatDateTime(alert.acknowledgedAt)}` : ''}
                </span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">Pending review</span>
              )
            }
          />
        </dl>
      )}
    </Modal>
  );
}
