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
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" label="Loading chart…" />
      </div>
    );
  }

  if (!stats || stats.byDay.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        No data available for this week.
      </div>
    );
  }

  const data = buildChartData(stats);

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'currentColor' }}
          className="text-gray-500 dark:text-gray-400"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: 'currentColor' }}
          className="text-gray-500 dark:text-gray-400"
        />
        <Tooltip
          contentStyle={{
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            fontSize: '0.75rem',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
          <Bar
            key={sev}
            dataKey={sev}
            name={SEVERITY_LABELS[sev]}
            stackId="a"
            fill={SEVERITY_CHART_COLORS[sev]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
