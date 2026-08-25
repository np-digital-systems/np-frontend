import type { Metadata } from 'next';

import { SignInFeature } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the temple management portal.',

  // A login screen has nothing to offer a crawler.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <SignInFeature />;
}
