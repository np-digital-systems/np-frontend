import { getTranslations } from 'next-intl/server';

import { SignInScreen } from './sign-in-screen';

export async function SignInFeature() {
  // The temple name comes from the public site's message catalogue.
  const t = await getTranslations('TempleInfo');

  return (
    <SignInScreen templeName={t('shortName')} />
  );
}
