import { Bell, Mail, Activity } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
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
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        {/* Icon in small neu-icon circle */}
        <div className="neu-icon flex h-9 w-9 shrink-0 items-center justify-center text-indigo-400">
          {icon}
        </div>
        <div>
          <label
            htmlFor={id}
            className="cursor-pointer font-bold text-gray-600"
          >
            {label}
          </label>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      {/* Neumorphic toggle switch */}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2',
        )}
        style={
          checked
            ? {
                background: 'linear-gradient(145deg,#6366f1,#4f46e5)',
                boxShadow:
                  'inset 3px 3px 6px rgba(0,0,0,0.15), inset -2px -2px 5px rgba(255,255,255,0.1)',
              }
            : {
                background: 'var(--neu-bg)',
                boxShadow:
                  'inset 3px 3px 8px var(--neu-shadow-dark), inset -3px -3px 8px var(--neu-shadow-light)',
              }
        }
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full transition-all duration-200',
            'my-1',
            checked ? 'translate-x-8' : 'translate-x-1',
          )}
          style={{
            background: checked ? '#ffffff' : 'var(--neu-bg)',
            boxShadow: checked
              ? '2px 2px 5px rgba(0,0,0,0.2)'
              : '3px 3px 8px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)',
          }}
        />
      </button>
    </div>
  );
}

const SEVERITY_OPTIONS: {
  value: SeverityLevel;
  label: string;
  activeColor: string;
  dot: string;
}[] = [
  { value: 'LOW', label: 'Low+', activeColor: '#eab308', dot: 'bg-yellow-400' },
  { value: 'MEDIUM', label: 'Medium+', activeColor: '#f97316', dot: 'bg-orange-400' },
  { value: 'HIGH', label: 'High+', activeColor: '#ef4444', dot: 'bg-red-400' },
  { value: 'CRITICAL', label: 'Critical', activeColor: '#7f1d1d', dot: 'bg-red-800' },
];

export function NotificationPreferences() {
  const { prefs, toggleRealtime, toggleEmail, setSeverityThreshold } = useSettings();

  return (
    <div className="neu-card p-6">
      <h2 className="mb-5 text-lg font-bold text-gray-600">Notification Preferences</h2>

      <div style={{ borderBottom: '1px solid rgba(184,190,201,0.35)' }}>
        <ToggleRow
          id="realtime-toggle"
          icon={<Activity className="h-4 w-4" />}
          label="Real-time WebSocket alerts"
          description="Receive alerts instantly as they are detected."
          checked={prefs.realtimeEnabled}
          onChange={toggleRealtime}
        />
      </div>

      <div style={{ borderBottom: '1px solid rgba(184,190,201,0.35)' }}>
        <ToggleRow
          id="email-toggle"
          icon={<Mail className="h-4 w-4" />}
          label="Email notifications"
          description="Receive a daily digest email of flagged content."
          checked={prefs.emailNotifications}
          onChange={toggleEmail}
        />
      </div>

      {/* Minimum severity selector */}
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div className="neu-icon flex h-9 w-9 shrink-0 items-center justify-center text-indigo-400">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-600">Minimum severity</p>
            <p className="mb-4 text-sm text-gray-400">
              Only notify for alerts at or above this severity level.
            </p>
            <div className="flex flex-wrap gap-2">
              {SEVERITY_OPTIONS.map(({ value, label, activeColor, dot }) => {
                const isActive = prefs.minimumSeverity === value;
                return (
                  <button
                    key={value}
                    onClick={() => setSeverityThreshold(value)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                      isActive ? 'neu-inset' : 'neu-btn',
                    )}
                    style={
                      isActive
                        ? { color: activeColor }
                        : { color: '#9ca3af' }
                    }
                  >
                    <span className={cn('h-2 w-2 rounded-full', dot)} aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
