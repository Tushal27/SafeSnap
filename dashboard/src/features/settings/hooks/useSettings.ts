import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { NOTIFICATION_PREFS_KEY, SEVERITY_LEVELS } from '@/constants';
import type { SeverityLevel } from '@/types';

export interface NotificationPreferences {
  realtimeEnabled: boolean;
  minimumSeverity: SeverityLevel;
  emailNotifications: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  realtimeEnabled: true,
  minimumSeverity: 'MEDIUM',
  emailNotifications: false,
};

export function useSettings() {
  const [prefs, setPrefs] = useLocalStorage<NotificationPreferences>(
    NOTIFICATION_PREFS_KEY,
    DEFAULT_PREFS,
  );

  const updatePrefs = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      setPrefs((prev) => ({ ...prev, ...updates }));
    },
    [setPrefs],
  );

  const setSeverityThreshold = useCallback(
    (severity: SeverityLevel) => {
      updatePrefs({ minimumSeverity: severity });
    },
    [updatePrefs],
  );

  const toggleRealtime = useCallback(() => {
    updatePrefs({ realtimeEnabled: !prefs.realtimeEnabled });
  }, [prefs.realtimeEnabled, updatePrefs]);

  const toggleEmail = useCallback(() => {
    updatePrefs({ emailNotifications: !prefs.emailNotifications });
  }, [prefs.emailNotifications, updatePrefs]);

  const severityOptions = SEVERITY_LEVELS.map((level) => ({
    value: level,
    label: level.charAt(0) + level.slice(1).toLowerCase(),
  }));

  return {
    prefs,
    updatePrefs,
    setSeverityThreshold,
    toggleRealtime,
    toggleEmail,
    severityOptions,
  };
}
