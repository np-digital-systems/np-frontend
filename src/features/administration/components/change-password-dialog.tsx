'use client';

import { useState, useTransition } from 'react';

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
import { PASSWORD_MIN_LENGTH } from '@/lib/validation';

import { changeOwnPassword } from '../lib/administration-actions';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setError(null);
  }

  function close(next: boolean) {
    if (!next) reset();

    onOpenChange(next);
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    // Checked here so an obvious mistake costs nothing, and again on the server
    // because a form is not where a rule like this can be enforced.
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`The new password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmation) {
      setError('The two new passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('The new password must differ from the current one.');
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await changeOwnPassword(currentPassword, newPassword);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      reset();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Every other device signed in as you is signed out. This one stays.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="current-password" label="Current password" required>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(changeEvent) => setCurrentPassword(changeEvent.target.value)}
            />
          </FormField>

          <FormField
            id="new-password"
            label="New password"
            required
            hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          >
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(changeEvent) => setNewPassword(changeEvent.target.value)}
            />
          </FormField>

          <FormField id="confirm-password" label="Confirm new password" required>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(changeEvent) => setConfirmation(changeEvent.target.value)}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? 'Changing…' : 'Change password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
