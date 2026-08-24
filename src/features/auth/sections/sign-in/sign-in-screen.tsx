'use client';

import { useActionState, useId, useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Receipt,
  ShieldCheck,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { signIn } from '../../lib/auth-actions';
import type { AuthRoleIcon, AuthRoleOption } from '../../types/auth';
import { SIGN_IN_IDLE } from '../../types/auth';
import type { UserRole } from '../../types/user-role';

const ROLE_ICONS: Record<AuthRoleIcon, LucideIcon> = {
  shield: ShieldCheck,
  ledger: BookOpenCheck,
  counter: Receipt,
  devotee: UserRound,
};

interface SignInScreenProps {
  roles: readonly AuthRoleOption[];
  templeName: string;
}

export function SignInScreen({ roles, templeName }: SignInScreenProps) {
  const locale = useLocale();
  const fieldId = useId();

  const [state, formAction, isPending] = useActionState(signIn, SIGN_IN_IDLE);

  const [selectedRole, setSelectedRole] = useState<UserRole>(
    roles[0]?.role ?? 'admin',
  );
  const [showPassword, setShowPassword] = useState(false);

  const active = roles.find((option) => option.role === selectedRole) ?? roles[0];

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel templeName={templeName} />

      <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[440px] animate-fade-in-up">
          <div className="lg:hidden">
            <TempleMark templeName={templeName} />
          </div>

          <header className="mt-7 lg:mt-0">
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.022em] text-text-primary">
              Sign in to the portal
            </h1>

            <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
              Choose the role you hold at the temple. What you can reach after
              this is decided by that role, not by this screen.
            </p>
          </header>

          <form action={formAction} className="mt-7 flex flex-col gap-5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="role" value={selectedRole} />

            <fieldset className="flex flex-col gap-2.5">
              <legend className="text-overline text-text-muted">
                Signing in as
              </legend>

              <div className="grid grid-cols-2 gap-2.5">
                {roles.map((option) => (
                  <RoleTile
                    key={option.role}
                    option={option}
                    selected={option.role === selectedRole}
                    onSelect={() => setSelectedRole(option.role)}
                  />
                ))}
              </div>
            </fieldset>

            {active && <RoleSummary option={active} />}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={`${fieldId}-email`}
                  className="text-xs font-medium text-text-secondary"
                >
                  Email address
                </Label>

                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-disabled"
                    aria-hidden
                  />

                  <Input
                    key={selectedRole}
                    id={`${fieldId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={active?.demoEmail}
                    placeholder="you@neeliyampathipillaiyarkovil.com"
                    className="h-11 rounded-xl pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`${fieldId}-password`}
                    className="text-xs font-medium text-text-secondary"
                  >
                    Password
                  </Label>

                  <button
                    type="button"
                    className="text-[11px] font-medium text-primary transition-opacity hover:opacity-70"
                  >
                    Forgot password?
                  </button>
                </div>

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
                    minLength={6}
                    placeholder="••••••••"
                    className="h-11 rounded-xl pl-9 pr-10 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
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
            </div>

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
              className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in as {active?.label}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-[11px] leading-relaxed text-text-muted">
            <Sparkles className="mt-px size-3.5 shrink-0 text-primary" aria-hidden />
            <span>
              Demo build — the accounts above are pre-filled and any password of
              six characters or more opens the session. Real credentials arrive
              with the auth API.
            </span>
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="size-3.5" />
              Back to the temple website
            </Link>

            <span className="text-[11px] text-text-disabled">
              Need access? Ask an administrator.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface RoleTileProps {
  option: AuthRoleOption;
  selected: boolean;
  onSelect: () => void;
}

function RoleTile({ option, selected, onSelect }: RoleTileProps) {
  const Icon = ROLE_ICONS[option.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all duration-150',
        selected
          ? 'border-primary bg-primary-subtle shadow-sm ring-2 ring-primary/15'
          : 'border-border bg-surface hover:border-border-strong hover:bg-interactive-hover',
      )}
    >
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-lg transition-colors',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-neutral-subtle text-text-muted group-hover:text-text-primary',
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>

      <span className="flex flex-col gap-0.5">
        <span
          className={cn(
            'text-[13px] font-semibold tracking-[-0.01em]',
            selected ? 'text-primary' : 'text-text-primary',
          )}
        >
          {option.label}
        </span>

        <span className="line-clamp-2 text-[11px] leading-snug text-text-muted">
          {option.summary}
        </span>
      </span>

      {selected && (
        <span
          className="absolute right-2.5 top-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden
        >
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function RoleSummary({ option }: { option: AuthRoleOption }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium text-text-secondary">
          {option.label} access
        </p>

        <span className="tabular rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-medium text-primary">
          {option.capabilityCount} capabilities
        </span>
      </div>

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {option.highlights.map((highlight) => (
          <li
            key={highlight}
            className="rounded-md bg-neutral-subtle px-2 py-1 text-[11px] text-text-secondary"
          >
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function TempleMark({ templeName }: { templeName: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4C430] shadow-[0_10px_24px_rgba(212,175,55,0.25)]">
        <Image
          src="/logo-dark.png"
          alt=""
          width={38}
          height={38}
          className="rounded-full object-contain"
        />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-text-primary">
          {templeName}
        </span>
        <span className="text-overline block text-text-muted">
          Management Portal
        </span>
      </span>
    </div>
  );
}

/**
 * The left panel is the one place in the portal that is allowed to be
 * decorative — it is a front door, not a working surface. It keeps its own
 * fixed dark palette in both themes so the temple's gold reads the same way
 * every time, and the form beside it stays in portal tokens.
 */
function BrandPanel({ templeName }: { templeName: string }) {
  const promises: readonly { icon: LucideIcon; title: string; body: string }[] = [
    {
      icon: ShieldCheck,
      title: 'Permission-checked, screen by screen',
      body: 'Every page asks what you may do, never who you are.',
    },
    {
      icon: BookOpenCheck,
      title: 'One ledger for the whole temple',
      body: 'Receipts, payments, funds and the approval chain in one book.',
    },
    {
      icon: CalendarDays,
      title: 'The year, planned and sponsored',
      body: 'Poojas, festivals and the sponsors standing behind them.',
    },
  ];

  return (
    <aside className="relative hidden overflow-hidden bg-[#0a0a0c] px-12 py-14 lg:flex lg:flex-col lg:justify-between">
      {/* Two soft lights: temple gold above, portal blue below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 size-[460px] rounded-full opacity-70 blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, rgba(212,175,55,0.34) 0%, transparent 70%)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 size-[520px] rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(10,132,255,0.30) 0%, transparent 70%)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse at 30% 20%, #000 0%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 30% 20%, #000 0%, transparent 75%)',
        }}
      />

      <div className="relative flex items-center gap-3">
        <span className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4C430] shadow-[0_12px_30px_rgba(212,175,55,0.3)]">
          <Image
            src="/logo-dark.png"
            alt=""
            width={38}
            height={38}
            className="rounded-full object-contain"
          />
        </span>

        <span>
          <span className="block text-[13px] font-semibold text-white">
            {templeName}
          </span>
          <span className="text-overline block text-[#D4AF37]">
            Management Portal
          </span>
        </span>
      </div>

      <div className="relative max-w-[440px]">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-sm">
          <Sparkles className="size-3 text-[#F4C430]" aria-hidden />
          Kept by the temple, for the temple
        </p>

        <h2 className="mt-5 text-[34px] font-semibold leading-[1.12] tracking-[-0.028em] text-white">
          Every rupee, every pooja,
          <br />
          <span className="bg-gradient-to-r from-[#F4C430] to-[#D4AF37] bg-clip-text text-transparent">
            accounted for.
          </span>
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-white/55">
          The administration portal behind Mallakam Neeliyampanai Pillaiyar
          Kovil — its ledger, its calendar and its subscription register, open
          only to the people the temple has trusted with them.
        </p>

        <ul className="mt-9 flex flex-col gap-5">
          {promises.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3.5">
              <span
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#F4C430]"
                aria-hidden
              >
                <Icon className="size-4" />
              </span>

              <span>
                <span className="block text-[13px] font-medium text-white/90">
                  {title}
                </span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-white/45">
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-[11px] text-white/35">
        Neeliyampanai Pillaiyar Kovil · Mallakam, Jaffna
      </p>
    </aside>
  );
}
