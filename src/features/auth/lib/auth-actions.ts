'use server';

import { headers } from 'next/headers';

import { redirect, routing, type Locale } from '@/i18n/routing';
import { api, ApiError } from '@/lib/api';
import { validate } from '@/lib/validation';

import { SIGN_IN_IDLE, type SignInState } from '../types/auth';

import { AUTH_ROUTES } from './auth-routes';
import { signInSchema } from './auth-schemas';
import { createSession, destroySession, type AuthTokens } from './session';

/**
 * The form carries the locale so the redirect lands on the prefixed path the
 * visitor was already browsing — a server action has no pathname of its own.
 */
function readLocale(value: FormDataEntryValue | null): Locale {
  return (routing.locales as readonly string[]).includes(String(value))
    ? (value as Locale)
    : routing.defaultLocale;
}

async function deviceName(): Promise<string> {
  const agent = (await headers()).get('user-agent') ?? 'unknown device';

  return agent.slice(0, 120);
}

export async function signIn(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const locale = readLocale(formData.get('locale'));

  const parsed = validate(signInSchema, {
    email: formData.get('email'),
    password: formData.get('password'),
    remember: formData.get('remember') === 'on',
  });

  if (!parsed.ok) {
    return { status: 'error', message: parsed.message };
  }

  const { email, password, remember } = parsed.data;

  try {
    const tokens = await api.post<AuthTokens>(
      '/auth/login',
      { email, password, deviceName: await deviceName() },
      { anonymous: true },
    );

    await createSession(tokens, remember);
  } catch (error) {
    if (error instanceof ApiError) {
      /*
       * The API answers a wrong password and an unknown address identically,
       * and so does this: telling a visitor which half was wrong tells an
       * attacker which addresses are worth guessing at.
       */
      return {
        status: 'error',
        message: error.isUnauthenticated
          ? 'Those credentials were not recognised.'
          : error.message,
      };
    }

    return {
      status: 'error',
      message: 'The portal could not reach the server. Try again in a moment.',
    };
  }

  // `redirect` throws to unwind, so nothing below it runs. The return keeps the
  // action's declared state type honest for `useActionState`.
  redirect({ href: AUTH_ROUTES.portalHome, locale });

  return SIGN_IN_IDLE;
}

export async function signOut(formData: FormData): Promise<void> {
  const locale = readLocale(formData.get('locale'));

  // Revoke the session server-side first; a cookie cleared locally would
  // otherwise leave a refresh token that still works.
  try {
    await api.post('/auth/logout');
  } catch {
    // A session the API has already forgotten is still a successful sign-out.
  }

  await destroySession();

  redirect({ href: AUTH_ROUTES.signIn, locale });
}
