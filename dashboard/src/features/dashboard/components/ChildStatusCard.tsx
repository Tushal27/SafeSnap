import { Smartphone, Wifi, WifiOff } from 'lucide-react';
import type { Child } from '@/types';
import { formatRelative } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ChildStatusCardProps {
  child: Child;
}

export function ChildStatusCard({ child }: ChildStatusCardProps) {
  return (
    <div className="neu-card p-5 transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-start gap-4">
        {/* Device icon in neu-icon circle */}
        <div
          className={cn(
            'neu-icon flex h-12 w-12 shrink-0 items-center justify-center',
            child.isOnline ? 'text-indigo-500' : 'text-gray-400',
          )}
          aria-hidden="true"
        >
          <Smartphone className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Name row with status badge */}
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-gray-600">{child.deviceName}</h3>
          </div>

          {/* Online / offline pill */}
          <div className="inline-flex items-center gap-1.5 neu-inset px-3 py-0.5">
            {child.isOnline ? (
              <>
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-green-400 animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Online
                </span>
              </>
            ) : (
              <>
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-gray-400"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </span>
              </>
            )}
          </div>

          {/* Device ID */}
          <p className="truncate text-xs text-gray-400 font-mono">
            {child.deviceId}
          </p>

          {/* Last seen */}
          <p className="text-xs text-gray-400">
            {child.lastSeenAt
              ? `Last seen ${formatRelative(child.lastSeenAt)}`
              : 'Never connected'}
          </p>
        </div>
      </div>
    </div>
  );
}
