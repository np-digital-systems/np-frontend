'use client';

import { useMemo, useState } from 'react';
import { KeyRound, Mail, Phone, Shield } from 'lucide-react';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormField,
  PortalPageHeader,
} from '@/components/portal/ui';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Permission } from '@/features/auth/types/permission';
import { validate } from '@/lib/validation';

import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../lib/administration-data';
import { templeProfileSchema } from '../../lib/administration-schemas';
import type { PermissionGroup, UserRecord } from '../../types';

interface ProfileScreenProps {
  user: UserRecord;
  permissions: readonly Permission[];
  groups: readonly PermissionGroup[];
}

/** TODO: replace the local state with calls to the profile API. */
export function ProfileScreen({
  user,
  permissions,
  groups,
}: ProfileScreenProps) {
  const [draft, setDraft] = useState({
    fullName: user.fullName,
    nameTa: user.nameTa,
    phone: user.phone,
    address: user.address,
  });
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    draft.fullName !== user.fullName ||
    draft.nameTa !== user.nameTa ||
    draft.phone !== user.phone ||
    draft.address !== user.address;

  const held = useMemo(() => new Set(permissions), [permissions]);

  function update(key: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(
      templeProfileSchema.pick({ name: true }),
      { name: draft.fullName },
    );

    setError(result.ok ? null : 'A name is required.');
  }

  return (
    <>
      <PortalPageHeader
        title="My Profile"
        description="Your account details and what your role lets you do."
        meta={[
          <span key="role">{ROLE_LABELS[user.role]}</span>,
          <span key="email">{user.email}</span>,
        ]}
      />

      <Card>
        <CardBody className="flex flex-wrap items-center gap-5">
          <Avatar className="size-14">
            <AvatarFallback className="text-base font-semibold">
              {user.fullName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold text-text-primary">
              {user.fullName}
            </p>
            <p className="mt-0.5 text-[13px] text-text-muted">{user.nameTa}</p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Mail className="size-3.5 text-text-muted" aria-hidden />
                {user.email}
              </span>

              <span className="flex items-center gap-1.5 text-xs text-text-secondary tabular">
                <Phone className="size-3.5 text-text-muted" aria-hidden />
                {user.phone || '—'}
              </span>
            </div>
          </div>

          <div className="shrink-0 rounded-lg border border-border bg-surface-2 px-4 py-2.5">
            <p className="text-[11px] text-text-muted">Role</p>
            <p className="mt-0.5 text-[13px] font-semibold text-text-primary">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Your details"
              description="Your role and email address are set by an administrator"
            />

            <form onSubmit={handleSubmit}>
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField id="profile-name" label="Name (English)" required>
                    <Input
                      id="profile-name"
                      value={draft.fullName}
                      onChange={(event) =>
                        update('fullName', event.target.value)
                      }
                    />
                  </FormField>

                  <FormField id="profile-name-ta" label="Name (Tamil)">
                    <Input
                      id="profile-name-ta"
                      value={draft.nameTa}
                      onChange={(event) => update('nameTa', event.target.value)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField id="profile-phone" label="Phone">
                    <Input
                      id="profile-phone"
                      value={draft.phone}
                      onChange={(event) => update('phone', event.target.value)}
                    />
                  </FormField>

                  <FormField
                    id="profile-email"
                    label="Email"
                    hint="Changing this changes how you sign in — ask an administrator."
                  >
                    <Input id="profile-email" value={user.email} disabled />
                  </FormField>
                </div>

                <FormField id="profile-address" label="Address">
                  <Input
                    id="profile-address"
                    value={draft.address}
                    onChange={(event) => update('address', event.target.value)}
                  />
                </FormField>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger"
                  >
                    {error}
                  </p>
                )}
              </CardBody>

              <CardFooter>
                <Button type="button" variant="outline">
                  <KeyRound />
                  Change password
                </Button>

                <Button type="submit" disabled={!isDirty}>
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <Card className="flex flex-col">
          <CardHeader
            title="What you can do"
            description={ROLE_DESCRIPTIONS[user.role]}
          />

          <CardBody className="flex flex-1 flex-col gap-4">
            {groups.map((group) => {
              const granted = group.permissions.filter((permission) =>
                held.has(permission),
              );

              if (granted.length === 0) return null;

              return (
                <div key={group.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
                      {group.label}
                    </p>
                    <span className="text-[11px] text-text-muted tabular">
                      {granted.length} of {group.permissions.length}
                    </span>
                  </div>

                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(granted.length / group.permissions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>

          <CardFooter>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Shield className="size-3.5" aria-hidden />
              {permissions.length} capabilities held
            </span>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
