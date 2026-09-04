'use client';

import { useActionState, useId, useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation';

import { signIn } from '../../lib/auth-actions';
import { SIGN_IN_IDLE } from '../../types/auth';

interface SignInScreenProps {
  templeName: string;
}

/**
 * The portal's front door.
 *
 * Two halves and nothing else: the deity on the left, the two fields that
 * actually sign somebody in on the right. It used to ask which role you held
 * before letting you type — a choice the form collected and then threw away,
 * since `signIn` sends only the address and the password and the real role
 * comes off the account. Picking "Administrator" and arriving as a cashier is
 * worse than not being asked, so the question is gone.
 */
export function SignInScreen({ templeName }: SignInScreenProps) {
  const locale = useLocale();
  const fieldId = useId();

  const [state, formAction, isPending] = useActionState(signIn, SIGN_IN_IDLE);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <DevotionalPanel templeName={templeName} />

      <main className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-[380px]">
          {/* The panel is hidden on small screens, so the mark comes here. */}
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <TempleMark />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-text-primary">
                {templeName}
              </span>
              <span className="text-overline block text-text-muted">
                Management Portal
              </span>
            </span>
          </div>

          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.022em] text-text-primary">
            Sign in
          </h1>
          <p className="mt-2 text-[13px] text-text-muted">
            Use the address and password the temple gave you.
          </p>

          <form action={formAction} className="mt-8 flex flex-col gap-4">
            <input type="hidden" name="locale" value={locale} />

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={`${fieldId}-email`}
                className="text-xs font-medium text-text-secondary"
              >
                Email
              </Label>

              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-disabled"
                  aria-hidden
                />
                <Input
                  id={`${fieldId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  placeholder="you@kovil.lk"
                  className="h-11 rounded-xl pl-9 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={`${fieldId}-password`}
                className="text-xs font-medium text-text-secondary"
              >
                Password
              </Label>

              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-disabled"
                  aria-hidden
                />
                <Input
                  id={`${fieldId}-password`}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pl-9 pr-10 text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition-colors hover:text-text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Label
              htmlFor={`${fieldId}-remember`}
              className="w-fit text-xs font-normal text-text-secondary"
            >
              <Checkbox id={`${fieldId}-remember`} name="remember" />
              Keep me signed in on this device
            </Label>

            {state.status === 'error' && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-subtle px-3.5 py-2.5 text-xs leading-relaxed text-danger"
              >
                <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
                {state.message}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="mt-1 h-11 w-full rounded-xl text-sm font-semibold shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="size-3.5" />
              Temple website
            </Link>

            {/* There is no self-service reset, so this points at the person
                who can actually do it rather than a button that cannot. */}
            <span className="text-[11px] text-text-disabled">
              Locked out? Ask an administrator.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function TempleMark() {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4C430] shadow-[0_10px_24px_rgba(212,175,55,0.25)]">
      <Image
        src="/logo-dark.png"
        alt=""
        width={38}
        height={38}
        className="rounded-full object-contain"
      />
    </span>
  );
}

/**
 * The deity, and the temple's name over it.
 *
 * The one decorative surface in the portal — a front door rather than a working
 * screen. It carries no copy beyond the name: anything more is read once and
 * then in the way, every day after.
 */
function DevotionalPanel({ templeName }: { templeName: string }) {
  return (
    <aside className="relative hidden overflow-hidden bg-[#0a0a0c] lg:block">
      <Image
        src="/images/deity-shrine.png"
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
      />

      {/* Dark at the foot so the name reads, clear at the top so the deity does. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40"
      />

      <div className="relative flex h-full flex-col justify-between p-12">
        <TempleMark />

        <div>
          <span className="block h-[2px] w-10 bg-[#D4AF37]" />
          <h2 className="font-heading mt-5 text-[32px] font-bold leading-[1.15] text-white">
            {templeName}
          </h2>
          <p className="mt-2 text-[13px] text-white/60">
            Management Portal · Mallakam, Jaffna
          </p>
        </div>
      </div>
    </aside>
  );
}
