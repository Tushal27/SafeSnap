import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setTokens, clearTokens, getAccessToken } from '@/api/axiosInstance';
import { LOGIN, REGISTER_PARENT } from '@/api/routes';
import { AuthResponseSchema } from '../types';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';
import type { Parent } from '@/types';

function parseParentFromToken(): Parent | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload)) as Record<string, unknown>;
    return {
      id: typeof decoded.sub === 'string' ? decoded.sub : '',
      email: typeof decoded.email === 'string' ? decoded.email : '',
      createdAt: typeof decoded.iat === 'number' ? new Date(decoded.iat * 1000).toISOString() : '',
    };
  } catch {
    return null;
  }
}

interface StoredAuthState {
  parent: Parent | null;
}

async function postLogin(credentials: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<unknown>(LOGIN, credentials);
  return AuthResponseSchema.parse(data);
}

async function postRegister(payload: Omit<RegisterRequest, 'confirmPassword'>): Promise<AuthResponse> {
  const { data } = await api.post<unknown>(REGISTER_PARENT, payload);
  return AuthResponseSchema.parse(data);
}

interface UseAuthReturn {
  parent: Parent | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoginPending: boolean;
  isRegisterPending: boolean;
  loginError: Error | null;
  registerError: Error | null;
}

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();

  const [state, setState] = useState<StoredAuthState>(() => ({
    parent: parseParentFromToken(),
  }));

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    setTokens(response.accessToken, response.refreshToken);
    // Parse parent info from JWT claims since backend returns flat parentId
    setState({ parent: parseParentFromToken() });
  }, []);

  const loginMutation = useMutation({
    mutationFn: postLogin,
    onSuccess: handleAuthSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: (req: RegisterRequest) =>
      postRegister({ email: req.email, password: req.password }),
    onSuccess: handleAuthSuccess,
  });

  const logout = useCallback(() => {
    clearTokens();
    setState({ parent: null });
    queryClient.clear();
  }, [queryClient]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation],
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      await registerMutation.mutateAsync(payload);
    },
    [registerMutation],
  );

  return {
    parent: state.parent,
    isAuthenticated: state.parent !== null && getAccessToken() !== null,
    login,
    register,
    logout,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
