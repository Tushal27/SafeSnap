import { useEffect, useState } from 'react';
import { Smartphone, RefreshCw, Copy, Check } from 'lucide-react';
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

export function PairChildModal({
  isOpen,
  onClose,
  onPair,
  isPairing,
  pairingData,
}: PairChildModalProps) {
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
      description="Install SafeSnap on the child's device and enter the code below."
      size="md"
      footer={footer}
    >
      <div className="space-y-5">
        {isPairing && (
          <div className="neu-inset flex flex-col items-center gap-3 rounded-2xl py-10">
            <Spinner size="lg" />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Generating pairing code…
            </p>
          </div>
        )}

        {pairingData && !isPairing && (
          <>
            {/* QR / device illustration box */}
            <div className="neu-inset flex flex-col items-center gap-4 rounded-2xl p-8">
              <div className="neu-icon flex h-16 w-16 items-center justify-center text-indigo-500">
                <Smartphone className="h-8 w-8" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center">
                QR code data
              </p>
              <code className="break-all neu-inset rounded-xl px-4 py-2 text-center text-xs font-mono text-gray-500 w-full">
                {pairingData.qrData}
              </code>
            </div>

            {/* Manual pairing code */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Manual pairing code
              </p>
              <div className="neu-inset flex items-center gap-3 rounded-xl px-5 py-4">
                <code className="flex-1 text-center font-mono text-2xl font-bold tracking-[0.4em] text-gray-600">
                  {pairingData.pairingCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void handleCopy();
                  }}
                  aria-label="Copy pairing code"
                  className={copied ? 'text-green-500' : 'text-gray-400 hover:text-indigo-500'}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Expires {formatDateTime(pairingData.expiresAt)}
              </p>
            </div>

            {/* Regenerate button */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                void onPair();
              }}
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
