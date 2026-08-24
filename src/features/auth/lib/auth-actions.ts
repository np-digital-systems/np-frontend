'use server';

import { redirect, routing, type Locale } from '@/i18n/routing';
import { validate } from '@/lib/validation';

import { PORTAL_ACCOUNTS } from '../constants/portal-accounts';
import { SIGN_IN_IDLE, type SignInState } from '../types/auth';

import { ROLE_LABELS } from './auth-data';
import { AUTH_ROUTES } from './auth-routes';
import { signInSchema } from './auth-schemas';
import { createSession, destroySession } from './session';

/**
 * The form carries the locale so the redirect lands on the prefixed path the
 * visitor was already browsing — a server action has no pathname of its own.
 */
function readLocale(value: FormDataEntryValue | null): Locale {
  return (routing.locales as readonly string[]).includes(String(value))
    ? (value as Locale)
    : routing.defaultLocale;
}

export async function signIn(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const locale = readLocale(formData.get('locale'));

  const parsed = validate(signInSchema, {
    role: formData.get('role'),
    email: formData.get('email'),
    password: formData.get('password'),
    remember: formData.get('remember') === 'on',
  });

  if (!parsed.ok) {
    return { status: 'error', message: parsed.message };
  }

  const { role, email, remember } = parsed.data;
  const account = PORTAL_ACCOUNTS[role];

  /*
   * TODO: this is the whole of the credential check until the auth API
   * exists — the address has to match the account the temple holds for that
   * role, and the password is only length-checked. Nothing here is a security
   * boundary; every real check belongs on the server that issues the session.
   */
  if (account.email !== email) {
    return {
      status: 'error',
      message: `No ${ROLE_LABELS[role]} account is registered to ${email}.`,
    };
  }

  await createSession(role, remember);

  // `redirect` throws to unwind, so nothing below it runs. The return keeps
  // the action's declared state type honest for `useActionState`.
  redirect({ href: AUTH_ROUTES.portalHome, locale });

  return SIGN_IN_IDLE;
}

export async function signOut(formData: FormData): Promise<void> {
  const locale = readLocale(formData.get('locale'));

  await destroySession();

  redirect({ href: AUTH_ROUTES.signIn, locale });
}
