import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { RegisterRequestSchema, type RegisterRequest } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { extractErrorMessage } from '@/lib/utils';
import { APP_NAME } from '@/constants';

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerParent, isRegisterPending, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
  });

  const onSubmit = async (data: RegisterRequest) => {
    await registerParent(data);
    void navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your parent account
          </p>
        </div>

        <Card>
          <CardContent>
            <form
              onSubmit={(e) => { void handleSubmit(onSubmit)(e); }}
              className="space-y-5"
              noValidate
            >
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                helperText="Min. 8 chars, one uppercase, one number"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {registerError && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {extractErrorMessage(registerError, 'Registration failed. Please try again.')}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isRegisterPending}
                disabled={isRegisterPending}
              >
                Create account
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
