'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpFromLine, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/layout/logo';
import {
  useLoginMutation,
  useSignupMutation,
} from "@/lib/features/api/authApi";

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';
  const isSignup = mode === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [login, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();
  const [signup, { isLoading: isSigningUp, error: signupError }] = useSignupMutation();

  const isLoading = isLoggingIn || isSigningUp;
  const error = loginError ?? signupError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      if (isSignup) {
        await signup({ email, password, name }).unwrap();
      } else {
        await login({ email, password }).unwrap();
      }
      router.push(next);
      router.refresh(); // re-run middleware with the fresh cookie
    } catch {
      // error is already surfaced through `error` from the hook
    }
  };

  // Extract a friendly message from RTK Query's error shape
  const errorMessage = (() => {
    if (!error) return null;
    if ('data' in error && typeof error.data === 'object' && error.data) {
      const data = error.data as { message?: string };
      return data.message ?? 'Something went wrong';
    }
    return 'Network error — please try again';
  })();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-3 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl sm:rounded-3xl lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div>
            <Logo />
            <div className="mt-28 max-w-sm">
              <Badge
                variant="secondary"
                className="mb-5 bg-primary-foreground/15 text-primary-foreground"
              >
                Inventory, made simple
              </Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                Know what you have. Move with confidence.
              </h1>
              <p className="mt-5 text-primary-foreground/70">
                Keep your stock accurate, your team aligned, and your next order one step ahead.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
            <Sparkles data-icon="inline-start" /> Trusted by growing teams
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <div className="mx-auto max-w-sm">
            <p className="text-sm font-medium text-muted-foreground">Welcome to Inventory</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignup
                ? 'Start managing your inventory in minutes.'
                : 'Sign in to your inventory workspace.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {isSignup && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Olivia Martin"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                className="mt-1 h-11 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    {isSignup ? 'Creating account…' : 'Signing in…'}
                  </>
                ) : (
                  <>
                    {isSignup ? 'Create account' : 'Sign in'}
                    <ArrowUpFromLine data-icon="inline-end" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-7">
              <Separator />
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <a
                href={isSignup ? '/login' : '/signup'}
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                {isSignup ? 'Sign in' : 'Create one'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}