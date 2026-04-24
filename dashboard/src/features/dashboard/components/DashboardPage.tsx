import { Scan, Flag, CheckCircle2, Wifi } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatsChart } from './StatsChart';
import { ChildStatusCard } from './ChildStatusCard';
import { useChildren } from '@/features/children/hooks/useChildren';
import { AlertsFeed } from '@/features/alerts/components/AlertsFeed';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ label, value, icon, highlight = false }: StatCardProps) {
  return (
    <Card className={cn('flex items-center gap-4 p-5', highlight && 'border-blue-200 dark:border-blue-800')}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </Card>
  );
}

const STATUS_DOT: Record<'connected' | 'disconnected' | 'connecting', string> = {
  connected: 'bg-green-500',
  disconnected: 'bg-gray-400',
  connecting: 'bg-yellow-400 animate-pulse',
};

export function DashboardPage() {
  const { weeklyStats, isLoadingStats, ackRate } = useDashboardData();
  const { children } = useChildren();
  const { connectionStatus } = useWebSocket();

  const onlineCount = children.filter((c) => c.isOnline).length;

  return (
    <div className="space-y-8">
      {/* Real-time status bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Overview</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span
            className={cn('h-2 w-2 rounded-full', STATUS_DOT[connectionStatus])}
            aria-hidden="true"
          />
          {connectionStatus === 'connected' ? 'Live alerts active' : connectionStatus}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Scanned this week"
          value={weeklyStats?.totalScanned ?? '—'}
          icon={<Scan className="h-6 w-6" />}
        />
        <StatCard
          label="Flagged this week"
          value={weeklyStats?.flaggedCount ?? '—'}
          icon={<Flag className="h-6 w-6" />}
          highlight={!!weeklyStats && weeklyStats.flaggedCount > 0}
        />
        <StatCard
          label="Acknowledgement rate"
          value={weeklyStats ? `${ackRate}%` : '—'}
          icon={<CheckCircle2 className="h-6 w-6" />}
        />
        <StatCard
          label="Devices online"
          value={`${onlineCount} / ${children.length}`}
          icon={<Wifi className="h-6 w-6" />}
        />
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged content — this week</CardTitle>
          <Badge variant="info">By severity</Badge>
        </CardHeader>
        <CardContent>
          <StatsChart stats={weeklyStats} isLoading={isLoadingStats} />
        </CardContent>
      </Card>

      {/* Children status */}
      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Child Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <ChildStatusCard key={child.id} child={child} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertsFeed />
        </CardContent>
      </Card>
    </div>
  );
}
