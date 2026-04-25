import { User, LogOut, Shield } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { NotificationPreferences } from './NotificationPreferences';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../components/ui/Button';

export function SettingsPage() {
  const { parent, logout } = useAuth();

  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-600">Settings</h1>
          <p className="mt-1 text-sm text-gray-400">Manage your account and notification preferences.</p>
        </div>

        {/* Account card */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="neu-icon flex h-12 w-12 shrink-0 items-center justify-center text-indigo-500">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-600">Account</h2>
              <p className="mt-1 text-sm text-gray-400">
                Signed in as{' '}
                <span className="font-semibold text-gray-600">{parent?.email ?? '—'}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Notification preferences */}
        <NotificationPreferences />

        {/* Danger zone */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="neu-icon flex h-12 w-12 shrink-0 items-center justify-center text-red-400">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-600">Danger zone</h2>
              <p className="mt-1 mb-4 text-sm text-gray-400">
                Signing out will close all active monitoring sessions.
              </p>
              <Button variant="danger" onClick={logout} leftIcon={<LogOut className="h-4 w-4" />}>
                Sign out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
