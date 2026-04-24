import { useEffect } from 'react';
import { Smartphone, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/utils';
import type { PairChildResponse } from '../types';

interface PairChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPair: () => Promise<PairChildResponse>;
  isPairing: boolean;
  pairingData: PairChildResponse | null;
}

export function PairChildModal({ isOpen, onClose, onPair, isPairing, pairingData }: PairChildModalProps) {
  const [copied, setCopied] = useState(false);

  // Trigger pairing when modal opens
  useEffect(() => {
    if (isOpen && !pairingData && !isPairing) {
      void onPair();
    }
  }, [isOpen, pairingData, isPairing, onPair]);

  const handleCopy = async () => {
    if (!pairingData) return;
    await navigator.clipboard.writeText(pairingData.pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const footer = (
    <Button variant="secondary" onClick={onClose}>
      Done
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pair a Child Device"
      description="Install SafeSnap on the child's device and scan this code or enter it manually."
      size="md"
      footer={footer}
    >
      <div className="space-y-6">
        {isPairing && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Generating pairing code…</p>
          </div>
        )}

        {pairingData && !isPairing && (
          <>
            {/* QR placeholder — render the data string in a styled box */}
            <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800">
              <Smartphone className="h-12 w-12 text-blue-500" />
              <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                QR code data (render with a QR library on the child device):
              </p>
              <code className="break-all rounded bg-white px-3 py-2 text-center text-xs font-mono shadow dark:bg-gray-900">
                {pairingData.qrData}
              </code>
            </div>

            {/* Pairing code */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Manual pairing code
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <code className="flex-1 text-center font-mono text-2xl tracking-[0.5em] text-gray-900 dark:text-gray-100">
                  {pairingData.pairingCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { void handleCopy(); }}
                  aria-label="Copy pairing code"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Expires {formatDateTime(pairingData.expiresAt)}
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => { void onPair(); }}
              isLoading={isPairing}
            >
              Generate new code
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
