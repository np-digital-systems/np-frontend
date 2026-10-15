'use server';

import { headers } from 'next/headers';

import { redirect, routing, type Locale } from '@/i18n/routing';
import { api, ApiError } from '@/lib/api';
import { validate } from '@/lib/validation';

import { SIGN_IN_IDLE, type SignInState } from '../types/auth';

import { AUTH_ROUTES } from './auth-routes';
import { signInSchema } from './auth-schemas';
import { createSession, destroySession, type AuthTokens } from './session';

// The form passes the locale because a server action has no pathname to redirect from.
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
      // Same message for wrong password and unknown email, to avoid revealing which accounts exist.
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

  // Unreachable (redirect throws); satisfies the useActionState return type.
  redirect({ href: AUTH_ROUTES.portalHome, locale });

  return SIGN_IN_IDLE;
}

export async function signOut(formData: FormData): Promise<void> {
  const locale = readLocale(formData.get('locale'));

  // Revoke server-side first, or the refresh token would still work.
  try {
    await api.post('/auth/logout');
  } catch {
    // Already revoked counts as signed out.
  }

  await destroySession();

  redirect({ href: AUTH_ROUTES.signIn, locale });
}
