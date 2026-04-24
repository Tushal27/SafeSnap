import { Smartphone, Wifi, WifiOff } from 'lucide-react';
import type { Child } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelative } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ChildStatusCardProps {
  child: Child;
}

export function ChildStatusCard({ child }: ChildStatusCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-4 p-5">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            child.isOnline
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
          )}
          aria-hidden="true"
        >
          <Smartphone className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-gray-900 dark:text-gray-100">
              {child.deviceName}
            </h3>
            {child.isOnline ? (
              <Badge variant="success" className="gap-1">
                <Wifi className="h-3 w-3" />
                Online
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
          </div>

          <p className="truncate text-xs text-gray-400 dark:text-gray-500">
            ID: {child.deviceId}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {child.lastSeenAt
              ? `Last seen ${formatRelative(child.lastSeenAt)}`
              : 'Never connected'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
