import { Scan, Flag, CheckCircle2, Wifi } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatsChart } from './StatsChart';
import { ChildStatusCard } from './ChildStatusCard';
import { useChildren } from '@/features/children/hooks/useChildren';
import { AlertsFeed } from '@/features/alerts/components/AlertsFeed';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

interface StatTileProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: boolean;
}

function StatTile({ label, value, icon, accent = false }: StatTileProps) {
  return (
    <div className="neu-card p-6 flex flex-col gap-4">
      <div
        className={cn(
          'neu-icon flex h-12 w-12 items-center justify-center',
          accent ? 'text-indigo-500' : 'text-gray-500',
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-600 leading-none">{value}</p>
        <p className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { weeklyStats, isLoadingStats, ackRate } = useDashboardData();
  const { children } = useChildren();
  const { parent } = useAuth();

  const onlineCount = children.filter((c) => c.isOnline).length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-600">
          {greeting}, {parent?.email?.split('@')[0] ?? 'parent'} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Here's your child safety overview for this week.
        </p>
      </div>

      {/* ── Stat tiles ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Scanned this week"
          value={weeklyStats?.totalScanned ?? '—'}
          icon={<Scan className="h-5 w-5" />}
        />
        <StatTile
          label="Flagged this week"
          value={weeklyStats?.flaggedCount ?? '—'}
          icon={<Flag className="h-5 w-5" />}
          accent={!!weeklyStats && weeklyStats.flaggedCount > 0}
        />
        <StatTile
          label="Acknowledgement rate"
          value={weeklyStats ? `${ackRate}%` : '—'}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent
        />
        <StatTile
          label="Devices online"
          value={`${onlineCount} / ${children.length}`}
          icon={<Wifi className="h-5 w-5" />}
        />
      </div>

      {/* ── Chart + Live Alerts side-by-side ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Weekly Chart — 3 cols */}
        <div className="neu-card p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-600">Flagged Content — This Week</h2>
            <span className="neu-inset px-3 py-0.5 text-xs font-semibold text-indigo-500">
              By Severity
            </span>
          </div>
          <StatsChart stats={weeklyStats} isLoading={isLoadingStats} />
        </div>

        {/* Live Alerts — 2 cols */}
        <div className="neu-card p-6 lg:col-span-2 flex flex-col">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-600">Live Alerts</h2>
            <span className="flex items-center gap-1.5 neu-inset px-3 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-500">Real-time</span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-96 pr-1 space-y-2">
            <AlertsFeed />
          </div>
        </div>
      </div>

      {/* ── Child Devices ── */}
      {children.length > 0 && (
        <div className="neu-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-600">Child Devices</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {onlineCount}/{children.length} online
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <ChildStatusCard key={child.id} child={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
