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
import { KolamMandala } from '@/components/site/kolam';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation';

import { signIn } from '../../lib/auth-actions';
import { SIGN_IN_IDLE } from '../../types/auth';

interface SignInScreenProps {
  templeName: string;
  eyebrow: string;
}

const FIELD_CLASS =
  'h-11 rounded-xl border-temple-gold/20 bg-temple-night/70 pl-9 text-sm text-temple-paper placeholder:text-temple-paper/35 focus-visible:border-temple-gold focus-visible:ring-temple-gold/25 autofill:shadow-[inset_0_0_0_1000px_var(--temple-night)] autofill:[-webkit-text-fill-color:var(--temple-paper)]';

export function SignInScreen({ templeName, eyebrow }: SignInScreenProps) {
  const locale = useLocale();
  const fieldId = useId();

  const [state, formAction, isPending] = useActionState(signIn, SIGN_IN_IDLE);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_0.95fr]">
      <DevotionalPanel templeName={templeName} eyebrow={eyebrow} />

      <main className="relative isolate flex items-center justify-center overflow-hidden bg-gradient-to-br from-temple-maroon via-temple-night to-temple-night px-5 py-12 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 temple-kolam-dots text-temple-gold/10" />
        <KolamMandala className="temple-spin-reverse absolute -right-40 -top-40 -z-10 w-[440px] text-temple-gold/15" />

        <div className="temple-rise relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-temple-paper/10 bg-temple-night/50 px-6 py-9 sm:px-9">
          {/* Shown here because the side panel is hidden on small screens. */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <TempleMark src="/logo-light.png" />
            <span className="min-w-0">
              <span className="font-heading block truncate text-base font-bold text-temple-paper">
                {templeName}
              </span>
              <span className="block text-xs text-temple-paper/60">
                Management Portal
              </span>
            </span>
          </div>

          <h1 className="font-heading text-[2rem] font-bold leading-tight text-temple-paper">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-temple-paper/65">
            Use the address and password the temple gave you.
          </p>

          <form action={formAction} className="mt-8 flex flex-col gap-4">
            <input type="hidden" name="locale" value={locale} />

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={`${fieldId}-email`}
                className="text-xs font-semibold text-temple-paper/85"
              >
                Email
              </Label>

              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-temple-gold"
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
                  className={FIELD_CLASS}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={`${fieldId}-password`}
                className="text-xs font-semibold text-temple-paper/85"
              >
                Password
              </Label>

              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-temple-gold"
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
                  className={`${FIELD_CLASS} pr-10`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-temple-paper/60 transition-colors hover:text-temple-gold"
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
              className="w-fit text-xs font-normal text-temple-paper/70"
            >
              <Checkbox
                id={`${fieldId}-remember`}
                name="remember"
                className="border-temple-gold/40 data-checked:border-temple-gold data-checked:bg-temple-gold data-checked:text-temple-night"
              />
              Keep me signed in on this device
            </Label>

            {state.status === 'error' && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-temple-kumkum/50 bg-temple-kumkum/15 px-3.5 py-2.5 text-xs leading-relaxed text-temple-gold-soft"
              >
                <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
                {state.message}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="mt-2 h-12 w-full rounded-full bg-gradient-to-r from-temple-gold to-temple-saffron text-sm font-semibold text-temple-night transition-opacity hover:opacity-90"
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

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-temple-paper/10 pt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-temple-gold-soft transition-colors hover:text-temple-gold"
            >
              <ArrowLeft className="size-3.5" />
              Temple website
            </Link>

            <span className="text-[11px] text-temple-paper/50">
              Locked out? Ask an administrator.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

function TempleMark({ src }: { src: string }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
      <Image
        src={src}
        alt=""
        width={48}
        height={48}
        className="rounded-full object-contain"
      />
    </span>
  );
}

function DevotionalPanel({
  templeName,
  eyebrow,
}: {
  templeName: string;
  eyebrow: string;
}) {
  return (
    <aside className="relative isolate hidden overflow-hidden bg-temple-night text-temple-paper lg:block">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/deity-shrine.png"
          alt=""
          fill
          priority
          sizes="55vw"
          className="temple-kenburns object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-temple-night via-temple-night/20 to-transparent" />
      </div>

      <div className="flex h-full flex-col justify-between p-12">
        <TempleMark src="/logo-light.png" />

        <div className="max-w-md">
          <p className="temple-rise inline-flex items-center gap-3 rounded-full border border-temple-gold/30 bg-temple-gold/10 px-4 py-1.5 text-sm text-temple-gold-soft backdrop-blur-sm">
            <span className="font-heading text-base text-temple-gold">ॐ</span>
            {eyebrow}
          </p>

          <h2
            className="temple-rise font-heading mt-6 text-[2.75rem] font-bold leading-[1.15]"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="temple-gold-text">{templeName}</span>
          </h2>

          <svg
            viewBox="0 0 320 20"
            fill="none"
            className="mt-4 h-5 w-56 text-temple-gold"
            aria-hidden="true"
          >
            <path
              d="M2 12 C 60 2, 110 18, 160 10 S 260 4, 318 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength={1}
              className="temple-draw"
            />
          </svg>

        </div>
      </div>
    </aside>
  );
}
