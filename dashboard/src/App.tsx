import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from './components/ui/Spinner';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { AppShell } from './components/AppShell';

const LoginForm = lazy(() =>
  import('./features/auth/components/LoginForm').then((m) => ({ default: m.LoginForm })),
);
const RegisterForm = lazy(() =>
  import('./features/auth/components/RegisterForm').then((m) => ({ default: m.RegisterForm })),
);
const DashboardPage = lazy(() =>
  import('./features/dashboard/components/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
);
const AlertsPage = lazy(() =>
  import('./features/alerts/components/AlertsPage').then((m) => ({ default: m.AlertsPage })),
);
const ChildrenList = lazy(() =>
  import('./features/children/components/ChildrenList').then((m) => ({
    default: m.ChildrenList,
  })),
);
const SettingsPage = lazy(() =>
  import('./features/settings/components/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
);

const PageFallback = () => (
  <div className="neu-page flex h-screen items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/children" element={<ChildrenList />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
