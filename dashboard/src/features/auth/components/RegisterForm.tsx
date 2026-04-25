import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { RegisterRequestSchema, type RegisterRequest } from '../types';
import { useAuth } from '../hooks/useAuth';
import { extractErrorMessage } from '@/lib/utils';
import { APP_NAME } from '@/constants';

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerParent, isRegisterPending, registerError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
  });

  const onSubmit = async (data: RegisterRequest) => {
    await registerParent(data);
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
            <p className="text-gray-400 mt-1 text-sm">Create your parent account</p>
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
            hint="Min 8 chars, one uppercase, one number"
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            action={
              <button type="button" onClick={() => setShowPassword(v => !v)} className="text-gray-400 hover:text-indigo-500">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }>
            <input type={showPassword ? 'text' : 'password'} autoComplete="new-password"
              placeholder="••••••••"
              className="neu-input w-full px-4 py-3 pl-10 pr-10 text-sm text-gray-600 placeholder:text-gray-400"
              {...register('password')} />
          </NeuField>

          <NeuField label="Confirm password" error={errors.confirmPassword?.message}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            action={
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-gray-400 hover:text-indigo-500">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }>
            <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
              placeholder="••••••••"
              className="neu-input w-full px-4 py-3 pl-10 pr-10 text-sm text-gray-600 placeholder:text-gray-400"
              {...register('confirmPassword')} />
          </NeuField>

          {registerError && (
            <div className="neu-inset px-4 py-3">
              <p className="text-sm text-red-400 text-center">{extractErrorMessage(registerError)}</p>
            </div>
          )}

          <button type="button" disabled={isRegisterPending}
            onClick={() => { void handleSubmit(onSubmit)(); }}
            className="neu-btn-primary w-full py-3 text-white font-semibold text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed">
            {isRegisterPending ? 'Creating account…' : 'Create account'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 font-medium hover:text-indigo-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

interface NeuFieldProps {
  label: string;
  error?: string;
  hint?: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

function NeuField({ label, error, hint, icon, action, children }: NeuFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
        {children}
        {action && <span className="absolute right-3 top-1/2 -translate-y-1/2">{action}</span>}
      </div>
      {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-400 pl-1">{hint}</p>}
    </div>
  );
}
