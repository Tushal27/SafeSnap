import { useState } from 'react';
import { Plus, AlertTriangle, Smartphone } from 'lucide-react';
import { useChildren } from '../hooks/useChildren';
import { PairChildModal } from './PairChildModal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ChildStatusCard } from '@/features/dashboard/components/ChildStatusCard';

export function ChildrenList() {
  const [showPairModal, setShowPairModal] = useState(false);
  const { children, isLoading, isError, pairChild, isPairing, pairingData, resetPairing } =
    useChildren();

  const handleClosePairModal = () => {
    setShowPairModal(false);
    resetPairing();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" label="Loading devices…" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Loading devices…
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <div className="neu-icon flex h-16 w-16 items-center justify-center text-red-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="font-bold text-gray-600">Failed to load child devices</p>
        <p className="text-sm text-gray-400">Please refresh and try again.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-600">Child Devices</h1>
            <p className="mt-1 text-sm text-gray-400">
              {children.length === 0
                ? 'No devices paired yet'
                : `${children.length} device${children.length !== 1 ? 's' : ''} paired`}
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowPairModal(true)}
          >
            Pair device
          </Button>
        </div>

        {children.length === 0 ? (
          /* Empty state */
          <div className="neu-card flex flex-col items-center gap-5 py-20 text-center">
            <div className="neu-icon flex h-16 w-16 items-center justify-center text-indigo-300">
              <Smartphone className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-600">No devices paired yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Pair a child's device to start monitoring their content.
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowPairModal(true)}
            >
              Pair first device
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <ChildStatusCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </div>

      <PairChildModal
        isOpen={showPairModal}
        onClose={handleClosePairModal}
        onPair={pairChild}
        isPairing={isPairing}
        pairingData={pairingData}
      />
    </div>
  );
}
