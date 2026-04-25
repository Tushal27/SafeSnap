import { useState } from 'react';
import { Bell, Users, Settings, Shield, LogOut, Wifi, WifiOff, RefreshCw, Menu, X } from 'lucide-react';
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
  { to: '/alerts',    label: 'Alerts',    icon: Bell },
  { to: '/children',  label: 'Devices',   icon: Users },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];

export function AppShell() {
  const { logout } = useAuth();
  const { connectionStatus } = useWebSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="neu-page min-h-screen">
      {/* ── Top Navigation ── */}
      <nav className="neu-card mx-4 mt-4 overflow-hidden">

        {/* Main bar row */}
        <div className="flex items-center justify-between px-6 py-3">

          {/* Brand */}
          <button
            onClick={() => { navigate('/dashboard'); closeMenu(); }}
            className="flex items-center gap-2"
            aria-label="Go to dashboard"
          >
            <div className="neu-icon flex h-9 w-9 items-center justify-center text-indigo-500">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-base font-bold text-gray-600 tracking-tight">SafeSnap</span>
          </button>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
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

            {/* WS status */}
            <div className="neu-inset flex items-center gap-1.5 px-3 py-1.5 ml-2">
              <span className={cn('h-2 w-2 rounded-full', WS_DOT[connectionStatus])} aria-hidden="true" />
              <span className="text-indigo-400">{WS_ICON[connectionStatus]}</span>
              <span className="text-xs font-semibold text-gray-400">{WS_LABEL[connectionStatus]}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="neu-btn flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors ml-1"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>

          {/* Mobile: WS dot + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <span className={cn('h-2 w-2 rounded-full', WS_DOT[connectionStatus])} aria-hidden="true" />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="neu-btn flex h-9 w-9 items-center justify-center text-gray-500"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown — slides open below the bar */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4 flex flex-col gap-2"
            style={{ borderTop: '1px solid rgba(184,190,201,0.35)' }}
          >
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'neu-btn-primary text-white'
                      : 'neu-btn text-gray-500 hover:text-indigo-500',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}

            {/* WS status row */}
            <div className="neu-inset flex items-center gap-2 rounded-xl px-4 py-3">
              <span className={cn('h-2 w-2 rounded-full', WS_DOT[connectionStatus])} aria-hidden="true" />
              <span className="text-indigo-400">{WS_ICON[connectionStatus]}</span>
              <span className="text-xs font-semibold text-gray-400">{WS_LABEL[connectionStatus]}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="neu-btn flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors text-left"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </div>
        )}
      </nav>

      {/* ── Page content ── */}
      <Outlet />
    </div>
  );
}
