import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAccessToken } from '@/api/axiosInstance';

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = getAccessToken() !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
