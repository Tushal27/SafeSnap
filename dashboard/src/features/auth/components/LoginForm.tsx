import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { LoginRequestSchema, type LoginRequest } from '../types';
import { useAuth } from '../hooks/useAuth';
import { extractErrorMessage } from '@/lib/utils';
import { APP_NAME } from '@/constants';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoginPending, loginError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    await login(data);
    void navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 neu-page">
      <div className="w-full max-w-md space-y-8">

        <div className="flex flex-col items-center gap-4">
          <div className="neu-icon w-20 h-20 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-indigo-500" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-600 tracking-tight">{APP_NAME}</h1>
            <p className="text-gray-400 mt-1 text-sm">Welcome back, parent</p>
          </div>
        </div>

        <div className="neu-card p-8 space-y-5">
          <NeuField label="Email address" error={errors.email?.message}
            icon={<Mail className="w-4 h-4 text-gray-400" />}>
            <input type="email" autoComplete="email" placeholder="you@example.com"
              className="neu-input w-full px-4 py-3 pl-10 text-sm text-gray-600 placeholder:text-gray-400"
              {...register('email')} />
          </NeuField>

          <NeuField label="Password" error={errors.password?.message}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            action={
              <button type="button" onClick={() => setShowPassword(v => !v)} className="text-gray-400 hover:text-indigo-500">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }>
            <input type={showPassword ? 'text' : 'password'} autoComplete="current-password"
              placeholder="••••••••"
              className="neu-input w-full px-4 py-3 pl-10 pr-10 text-sm text-gray-600 placeholder:text-gray-400"
              {...register('password')} />
          </NeuField>

          {loginError && (
            <div className="neu-inset px-4 py-3">
              <p className="text-sm text-red-400 text-center">{extractErrorMessage(loginError)}</p>
            </div>
          )}

          <button type="button" disabled={isLoginPending}
            onClick={() => { void handleSubmit(onSubmit)(); }}
            className="neu-btn-primary w-full py-3 text-white font-semibold text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoginPending ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400">
          No account yet?{' '}
          <Link to="/register" className="text-indigo-500 font-medium hover:text-indigo-600">Create one</Link>
        </p>
      </div>
    </div>
  );
}

interface NeuFieldProps {
  label: string;
  error?: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

function NeuField({ label, error, icon, action, children }: NeuFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
        {children}
        {action && <span className="absolute right-3 top-1/2 -translate-y-1/2">{action}</span>}
      </div>
      {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
    </div>
  );
}
