'use client';

import { useState } from 'react';

import { FormField } from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { USER_ROLES, type UserRole } from '@/features/auth/types/user-role';

import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '../lib/administration-data';
import type { UserRecord } from '../types';

export interface UserDraft {
  fullName: string;
  nameTa: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  isActive: boolean;
}

function draftFrom(user: UserRecord | null): UserDraft {
  if (user) {
    return {
      fullName: user.fullName,
      nameTa: user.nameTa,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.isActive,
    };
  }

  return {
    fullName: '',
    nameTa: '',
    email: '',
    phone: '',
    address: '',
    role: 'user',
    isActive: true,
  };
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRecord | null;
  existing: readonly UserRecord[];
  /** The signed-in user, so the form can refuse self-demotion. */
  currentUserId: string;
  /** Administrators still active — the portal must never lose its last one. */
  adminCount: number;
  onSubmit: (draft: UserDraft) => void;
}

/**
 * Create or amend a portal account.
 *
 * Two things this form will not let happen, because both lock people out
 * permanently: an administrator demoting or deactivating themselves, and the
 * last active administrator losing the role. Password handling is absent by
 * design — a password is set through a reset link, never typed into an
 * admin screen.
 */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
  existing,
  currentUserId,
  adminCount,
  onSubmit,
}: UserFormDialogProps) {
  const [draft, setDraft] = useState<UserDraft>(() => draftFrom(user));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${user?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(user));
    setError(null);
  }

  const isSelf = user?.id === currentUserId;
  const wasAdmin = user?.role === 'admin' && user.isActive;
  const losesAdmin = wasAdmin && (draft.role !== 'admin' || !draft.isActive);
  const isLastAdmin = losesAdmin && adminCount <= 1;

  function update<K extends keyof UserDraft>(key: K, value: UserDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!draft.fullName.trim()) {
      setError('A name is required.');
      return;
    }

    const email = draft.email.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      setError('A valid email address is required — it is how they sign in.');
      return;
    }

    if (
      existing.some(
        (entry) =>
          entry.email.toLowerCase() === email && entry.id !== user?.id,
      )
    ) {
      setError(`${email} is already registered to another account.`);
      return;
    }

    if (isSelf && losesAdmin) {
      setError(
        'You cannot remove your own administrator access — ask another administrator to do it.',
      );
      return;
    }

    if (isLastAdmin) {
      setError(
        'This is the last active administrator. Give somebody else the role first.',
      );
      return;
    }

    setError(null);

    onSubmit({
      ...draft,
      fullName: draft.fullName.trim(),
      nameTa: draft.nameTa.trim(),
      email,
      phone: draft.phone.trim(),
      address: draft.address.trim(),
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {user ? `Edit ${user.fullName}` : 'New User'}
          </DialogTitle>
          <DialogDescription>
            {user
              ? 'Change what this account can reach, or deactivate it.'
              : 'The account is created without a password — they set one through the invitation link.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="user-name" label="Name (English)" required>
            <Input
              id="user-name"
              value={draft.fullName}
              placeholder="S. Vijayan"
              onChange={(changeEvent) =>
                update('fullName', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField id="user-name-ta" label="Name (Tamil)">
            <Input
              id="user-name-ta"
              value={draft.nameTa}
              placeholder="சி. விஜயன்"
              onChange={(changeEvent) =>
                update('nameTa', changeEvent.target.value)
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="user-email"
              label="Email"
              required
              hint="Used to sign in."
            >
              <Input
                id="user-email"
                type="email"
                value={draft.email}
                placeholder="name@temple.com"
                onChange={(changeEvent) =>
                  update('email', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="user-phone" label="Phone">
              <Input
                id="user-phone"
                value={draft.phone}
                placeholder="077 234 5678"
                onChange={(changeEvent) =>
                  update('phone', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <FormField id="user-address" label="Address">
            <Input
              id="user-address"
              value={draft.address}
              placeholder="நல்லூர், யாழ்ப்பாணம்"
              onChange={(changeEvent) =>
                update('address', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField
            id="user-role"
            label="Role"
            required
            hint={ROLE_DESCRIPTIONS[draft.role]}
          >
            <Select
              value={draft.role}
              onValueChange={(value) => update('role', value as UserRole)}
            >
              <SelectTrigger id="user-role" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="user-active"
                className="text-xs font-medium text-text-secondary"
              >
                Active
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Deactivating signs the account out everywhere and keeps its
                history.
              </p>
            </div>

            <Switch
              id="user-active"
              checked={draft.isActive}
              disabled={isSelf}
              onCheckedChange={(checked) => update('isActive', checked)}
            />
          </div>

          {isSelf && (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-text-secondary">
              This is your own account. You cannot deactivate it or take away
              your own administrator access.
            </p>
          )}

          {isLastAdmin && (
            <p className="rounded-lg bg-danger-subtle px-3 py-2 text-xs leading-relaxed text-danger">
              This is the last active administrator. Removing the role would
              leave nobody able to restore it.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {user ? 'Save Changes' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
