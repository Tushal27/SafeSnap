import { Bell, Users, Settings, Shield, LogOut, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';

const WS_DOT: Record<'connected' | 'disconnected' | 'connecting', string> = {
  connected: 'bg-green-400',
  disconnected: 'bg-gray-400',
  connecting: 'bg-yellow-400 animate-pulse',
};

const WS_LABEL: Record<'connected' | 'disconnected' | 'connecting', string> = {
  connected: 'Live',
  disconnected: 'Offline',
  connecting: 'Connecting…',
};

const WS_ICON: Record<'connected' | 'disconnected' | 'connecting', React.ReactNode> = {
  connected: <Wifi className="h-3 w-3" />,
  disconnected: <WifiOff className="h-3 w-3" />,
  connecting: <RefreshCw className="h-3 w-3 animate-spin" />,
};

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Shield },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/children', label: 'Devices', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell() {
  const { logout } = useAuth();
  const { connectionStatus } = useWebSocket();
  const navigate = useNavigate();

  return (
    <div className="neu-page min-h-screen">
      {/* ── Top Navigation ── */}
      <nav className="neu-card mx-4 mt-4 px-6 py-3 flex items-center justify-between rounded-[20px]">
        {/* Brand */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
          aria-label="Go to dashboard"
        >
          <div className="neu-icon flex h-9 w-9 items-center justify-center text-indigo-500">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-gray-600 tracking-tight">SafeSnap</span>
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'neu-btn-primary text-white'
                    : 'neu-btn text-gray-500 hover:text-indigo-500',
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}

          {/* WS status indicator */}
          <div className="neu-inset flex items-center gap-1.5 px-3 py-1.5 ml-2">
            <span className={cn('h-2 w-2 rounded-full', WS_DOT[connectionStatus])} aria-hidden="true" />
            <span className="text-indigo-400">{WS_ICON[connectionStatus]}</span>
            <span className="text-xs font-semibold text-gray-400">{WS_LABEL[connectionStatus]}</span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="neu-btn flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors ml-1"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <Outlet />
    </div>
  );
}
