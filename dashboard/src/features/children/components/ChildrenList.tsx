import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useChildren } from '../hooks/useChildren';
import { PairChildModal } from './PairChildModal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ChildStatusCard } from '@/features/dashboard/components/ChildStatusCard';

export function ChildrenList() {
  const [showPairModal, setShowPairModal] = useState(false);
  const { children, isLoading, isError, pairChild, isPairing, pairingData, resetPairing } = useChildren();

  const handleClosePairModal = () => {
    setShowPairModal(false);
    resetPairing();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Loading devices…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-gray-600 dark:text-gray-400">Failed to load child devices.</p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Child Devices ({children.length})
        </h2>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowPairModal(true)}
        >
          Pair device
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
          <p className="font-medium text-gray-500 dark:text-gray-400">No devices paired yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Pair a child device to start monitoring.
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowPairModal(true)}
          >
            Pair first device
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildStatusCard key={child.id} child={child} />
          ))}
        </div>
      )}

      <PairChildModal
        isOpen={showPairModal}
        onClose={handleClosePairModal}
        onPair={pairChild}
        isPairing={isPairing}
        pairingData={pairingData}
      />
    </section>
  );
}
