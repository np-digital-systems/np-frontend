'use client';

import { useServerAction } from '@/hooks/use-server-action';

import { revokeSession } from '../../lib/administration-actions';

import { useState } from 'react';
import { Laptop, LogOut, ShieldCheck, Smartphone } from 'lucide-react';

import {
  ActionError,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  PortalPageHeader,
  StatCard,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { formatStamp, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

import type { UserSession } from '../../types';

interface SessionsScreenProps {
  /** Hides the page header when rendered inside the Settings tabs. */
  embedded?: boolean;
  initialSessions: readonly UserSession[];
    currentSessionId: string;
  today: string;
}

export function SessionsScreen({
  embedded = false,
  initialSessions,
  currentSessionId,
  today,
}: SessionsScreenProps) {
  const { run, error: actionError } = useServerAction();
  const sessions = initialSessions;
  const [revoking, setRevoking] = useState<UserSession | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const others = sessions.filter((session) => session.id !== currentSessionId);

  return (
    <>
      {!embedded && (
        <PortalPageHeader
          title="My Sessions"
          description="Every device signed in to your account. Revoke anything you do not recognise."
          meta={[
            <span key="count" className="tabular">
              {sessions.length} active
            </span>,
            others.length > 0 ? (
              <span key="others" className="tabular">
                {others.length} other {others.length === 1 ? 'device' : 'devices'}
              </span>
            ) : null,
          ].filter(Boolean)}
          actions={
            others.length > 0 && (
              <Button variant="outline" onClick={() => setRevokingAll(true)}>
                <LogOut />

      <ActionError message={actionError} />
                Sign out other devices
              </Button>
            )
          }
        />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Devices"
          value={String(sessions.length)}
          caption="Signed in right now"
        />
        <StatCard
          label="Other Devices"
          value={String(others.length)}
          caption="Besides this one"
        />
        <StatCard
          label="This Device"
          value="1"
          caption="The session you are using"
        />
        <StatCard
          label="Session Length"
          value="30 days"
          caption="Before a fresh sign-in is needed"
        />
      </div>

      <Card>
        <CardHeader
          title="Signed-in devices"
          description="Newest first"
        />

        {sessions.length === 0 ? (
          <EmptyState
            icon={LogOut}
            title="No active sessions"
            description="Nothing is signed in to your account."
          />
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              const Icon = /iphone|android|mobile/i.test(session.deviceName)
                ? Smartphone
                : Laptop;

              return (
                <li
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                        isCurrent
                          ? 'bg-success-subtle text-success'
                          : 'bg-neutral-subtle text-text-muted',
                      )}
                      aria-hidden
                    >
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[13px] font-medium text-text-primary">
                          {session.deviceName}
                        </p>

                        {isCurrent && (
                          <span className="rounded bg-success-subtle px-1.5 py-0.5 text-[10px] font-medium text-success">
                            This device
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-xs text-text-muted">
                        <span className="ref">{session.ipAddress}</span> ·
                        signed in {timeAgo(session.createdAt, today)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-text-muted tabular">
                        Expires {formatStamp(session.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger-subtle hover:text-danger"
                      onClick={() => setRevoking(session)}
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardBody className="flex items-start gap-2.5">
          <ShieldCheck
            className="mt-px size-4 shrink-0 text-text-muted"
            aria-hidden
          />
          <p className="text-xs leading-relaxed text-text-secondary">
            Do not recognise a device? Revoke it and change your password. The
            portal stores only a hash of each session token, so revoking ends
            that device&rsquo;s access immediately and permanently.
          </p>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => !open && setRevoking(null)}
        title="Revoke this session?"
        confirmLabel="Revoke"
        description={
          revoking
            ? `${revoking.deviceName} (${revoking.ipAddress}) will be signed out immediately and will need to sign in again.`
            : ''
        }
        onConfirm={() => {
          if (revoking) run(() => revokeSession(revoking.id));
          setRevoking(null);
        }}
      />

      <ConfirmDialog
        open={revokingAll}
        onOpenChange={setRevokingAll}
        title="Sign out other devices?"
        confirmLabel="Sign Out"
        description={`${others.length} other ${others.length === 1 ? 'device' : 'devices'} will be signed out immediately. This device stays signed in.`}
        onConfirm={() => {
          // One call each: the API revokes a named session, and revoking every
          // one of them would take this device with it.
          run(async () => {
            for (const session of others) {
              const result = await revokeSession(session.id);

              if (!result.ok) return result;
            }

            return { ok: true };
          });

          setRevokingAll(false);
        }}
      />
    </>
  );
}
