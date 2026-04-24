import { Bell, Mail, Activity } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { SeverityLevel } from '@/types';

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  id: string;
}

function ToggleRow({ icon, label, description, checked, onChange, id }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-gray-400 dark:text-gray-500">{icon}</span>
        <div>
          <label htmlFor={id} className="cursor-pointer font-medium text-gray-900 dark:text-gray-100">
            {label}
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform',
            'my-0.5',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  );
}

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low+', color: 'text-yellow-600' },
  { value: 'MEDIUM', label: 'Medium+', color: 'text-orange-600' },
  { value: 'HIGH', label: 'High+', color: 'text-red-600' },
  { value: 'CRITICAL', label: 'Critical only', color: 'text-red-900' },
];

export function NotificationPreferences() {
  const { prefs, toggleRealtime, toggleEmail, setSeverityThreshold } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
        <ToggleRow
          id="realtime-toggle"
          icon={<Activity className="h-5 w-5" />}
          label="Real-time WebSocket alerts"
          description="Receive alerts instantly as they are detected."
          checked={prefs.realtimeEnabled}
          onChange={toggleRealtime}
        />

        <ToggleRow
          id="email-toggle"
          icon={<Mail className="h-5 w-5" />}
          label="Email notifications"
          description="Receive a daily digest email of flagged content."
          checked={prefs.emailNotifications}
          onChange={toggleEmail}
        />

        <div className="py-4">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">Minimum severity</p>
              <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                Only notify for alerts at or above this severity level.
              </p>
              <div className="flex flex-wrap gap-2">
                {SEVERITY_OPTIONS.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setSeverityThreshold(value)}
                    className={cn(
                      'rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
                      prefs.minimumSeverity === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : cn(
                            'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
                            color,
                          ),
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
