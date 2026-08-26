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

import { createSponsor } from '../lib/sponsor-actions';

const EMPTY = { fullName: '', phone: '', email: '', address: '' };

interface SponsorCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Receives the new sponsor's id, so the caller can assign them straight away. */
  onCreated: (sponsorId: string) => void;
}

export function SponsorCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: SponsorCreateDialogProps) {
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [lastOpen, setLastOpen] = useState(open);

  if (lastOpen !== open) {
    setLastOpen(open);
    setDraft(EMPTY);
    setError(null);
  }

  function update(key: keyof typeof EMPTY, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!draft.fullName.trim()) {
      setError('A sponsor name is required.');
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await createSponsor(draft);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      onCreated(result.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Sponsor</DialogTitle>
          <DialogDescription>
            Register a devotee, family or trust. Once registered they can be
            assigned to any pooja or festival instance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="sponsor-name" label="Name" required>
            <Input
              id="sponsor-name"
              value={draft.fullName}
              placeholder="ம. கணேசன் மற்றும் குடும்பத்தினர்"
              onChange={(event) => update('fullName', event.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="sponsor-phone" label="Phone">
              <Input
                id="sponsor-phone"
                value={draft.phone}
                placeholder="077 111 2222"
                onChange={(event) => update('phone', event.target.value)}
              />
            </FormField>

            <FormField id="sponsor-email" label="Email">
              <Input
                id="sponsor-email"
                type="email"
                value={draft.email}
                placeholder="ganesan@example.com"
                onChange={(event) => update('email', event.target.value)}
              />
            </FormField>
          </div>

          <FormField id="sponsor-address" label="Address">
            <Input
              id="sponsor-address"
              value={draft.address}
              placeholder="நல்லூர், யாழ்ப்பாணம்"
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Registering…' : 'Register Sponsor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
