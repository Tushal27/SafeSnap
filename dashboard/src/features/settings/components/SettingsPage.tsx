import { Card } from '../../../components/ui/Card';
import { NotificationPreferences } from './NotificationPreferences';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../components/ui/Button';

export function SettingsPage() {
  const { parent, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      <Card>
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Account
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Signed in as <span className="font-medium">{parent?.email ?? '—'}</span>
          </p>
        </div>
      </Card>

      <NotificationPreferences />

      <Card>
        <div className="p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Danger zone
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Signing out will close all active monitoring sessions.
          </p>
          <Button variant="danger" onClick={logout}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
