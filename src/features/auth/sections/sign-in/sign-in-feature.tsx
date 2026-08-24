import { getTranslations } from 'next-intl/server';

import { getRoleOptions } from '../../lib/auth-service';

import { SignInScreen } from './sign-in-screen';

export async function SignInFeature() {
  // The temple's name is the one string on this page that belongs to the
  // public site, so it comes from the site's own message catalogue.
  const t = await getTranslations('TempleInfo');

  return (
    <SignInScreen roles={getRoleOptions()} templeName={t('shortName')} />
  );
}
