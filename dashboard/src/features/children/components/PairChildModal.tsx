import { useEffect, useRef, useState } from 'react';
import { Smartphone, RefreshCw, Copy, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
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

  // Keep a stable ref so the effect below doesn't re-run when mutateAsync
  // gets a new reference on each render.
  const onPairRef = useRef(onPair);
  useEffect(() => { onPairRef.current = onPair; });

  // Trigger pairing once when the modal opens (and hasn't paired yet).
  useEffect(() => {
    if (isOpen && !pairingData && !isPairing) {
      void onPairRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCopy = async () => {
    if (!pairingData) return;
    await navigator.clipboard.writeText(pairingData.pairingToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute human-readable expiry from TTL seconds
  const expiresAt = pairingData
    ? new Date(Date.now() + pairingData.tokenTtlSeconds * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

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
            {/* QR code (base64 image from backend) */}
            <div className="neu-inset flex flex-col items-center gap-4 rounded-2xl p-6">
              {pairingData.qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${pairingData.qrCodeBase64}`}
                  alt="Pairing QR code"
                  className="h-40 w-40 rounded-xl"
                />
              ) : (
                <div className="neu-icon flex h-16 w-16 items-center justify-center text-indigo-500">
                  <Smartphone className="h-8 w-8" />
                </div>
              )}
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center">
                Scan with the SafeSnap child app
              </p>
            </div>

            {/* Manual pairing token */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Or enter this code manually
              </p>
              <div className="neu-inset flex items-center gap-3 rounded-xl px-5 py-4">
                <code className="flex-1 text-center font-mono text-lg font-bold tracking-widest text-gray-600 break-all">
                  {pairingData.pairingToken}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { void handleCopy(); }}
                  aria-label="Copy pairing code"
                  className={copied ? 'text-green-500' : 'text-gray-400 hover:text-indigo-500'}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {expiresAt && (
                <p className="mt-2 text-xs text-gray-400">Expires at {expiresAt}</p>
              )}
            </div>

            {/* Regenerate */}
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
