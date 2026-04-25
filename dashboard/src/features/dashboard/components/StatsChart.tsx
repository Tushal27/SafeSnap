import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { WeeklyStats } from '@/types';
import { SEVERITY_CHART_COLORS, SEVERITY_LABELS } from '@/constants';
import { formatDateShort } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

interface StatsChartProps {
  stats: WeeklyStats | null;
  isLoading: boolean;
}

interface ChartDatum {
  date: string;
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
}

function buildChartData(stats: WeeklyStats): ChartDatum[] {
  return stats.byDay.map((day) => ({
    date: formatDateShort(day.date),
    LOW: day.bySeverity.LOW,
    MEDIUM: day.bySeverity.MEDIUM,
    HIGH: day.bySeverity.HIGH,
    CRITICAL: day.bySeverity.CRITICAL,
  }));
}

export function StatsChart({ stats, isLoading }: StatsChartProps) {
  if (isLoading) {
    return (
      <div className="neu-inset flex h-64 items-center justify-center rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" label="Loading chart…" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Loading chart…
          </p>
        </div>
      </div>
    );
  }

  if (!stats || stats.byDay.length === 0) {
    return (
      <div className="neu-inset flex h-64 flex-col items-center justify-center gap-3 rounded-2xl">
        <div className="neu-icon flex h-14 w-14 items-center justify-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.5l4-4 4 4 4-6 4 2"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-400">No data available for this week</p>
      </div>
    );
  }

  const data = buildChartData(stats);

  return (
    <div className="neu-inset rounded-2xl p-2">
      <ResponsiveContainer width="100%" height={256}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(184,190,201,0.5)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#e8ecf1',
              border: 'none',
              borderRadius: '12px',
              boxShadow:
                '6px 6px 14px #b8bec9,-6px -6px 14px #ffffff',
              fontSize: '0.75rem',
              color: '#4b5563',
            }}
            cursor={{ fill: 'rgba(99,102,241,0.06)' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.72rem', color: '#9ca3af', paddingTop: '8px' }}
          />
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
            <Bar
              key={sev}
              dataKey={sev}
              name={SEVERITY_LABELS[sev]}
              stackId="a"
              fill={SEVERITY_CHART_COLORS[sev]}
              radius={sev === 'CRITICAL' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
