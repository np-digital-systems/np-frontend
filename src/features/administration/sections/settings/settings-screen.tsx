'use client';

import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';

import {
  Card,
  CardBody,
  CardHeader,
  FormField,
  PortalPageHeader,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  formatCurrency,
  monthName,
  ROLE_LABELS,
} from '../../lib/administration-data';
import type {
  AccountingSettings,
  LocaleSettings,
  NotificationSettings,
  PortalSettings,
  TempleProfile,
  UserRecord,
  UserSession,
} from '../../types';

import { ProfileScreen } from '../profile/profile-screen';
import { SessionsScreen } from '../profile/sessions-screen';

interface SettingsScreenProps {
  user: UserRecord;
  sessions: readonly UserSession[];
  currentSessionId: string;
  today: string;
  /** Portal-wide settings, present only for roles that may change them. */
  initialSettings: PortalSettings | null;
}

/**
 * TODO: replace the local state with calls to the settings API. Nothing
 * here persists yet, which is why the save button tracks a dirty count
 * rather than pretending to have written.
 */
export function SettingsScreen({
  user,
  sessions,
  currentSessionId,
  today,
  initialSettings,
}: SettingsScreenProps) {
  const [settings, setSettings] = useState<PortalSettings | null>(
    initialSettings,
  );

  const canManagePortal = initialSettings !== null;

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initialSettings),
    [settings, initialSettings],
  );

  function patch<K extends keyof PortalSettings>(
    key: K,
    value: Partial<PortalSettings[K]>,
  ) {
    setSettings((current) =>
      current ? { ...current, [key]: { ...current[key], ...value } } : current,
    );
  }

  return (
    <>
      <PortalPageHeader
        title="Settings"
        description={
          canManagePortal
            ? 'Your account, your sessions, and the defaults every other screen in the portal follows.'
            : 'Your account details and the devices signed in to it.'
        }
        meta={[
          <span key="role">{ROLE_LABELS[user.role]}</span>,
          isDirty ? (
            <span key="dirty" className="text-warning">
              Unsaved changes
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          canManagePortal && (
            <>
              {isDirty && (
                <Button
                  variant="outline"
                  onClick={() => setSettings(initialSettings)}
                >
                  <RotateCcw />
                  Discard
                </Button>
              )}

              <Button disabled={!isDirty}>Save Settings</Button>
            </>
          )
        }
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>

          {canManagePortal && (
            <>
              <TabsTrigger value="temple">Temple</TabsTrigger>
              <TabsTrigger value="locale">Locale &amp; Format</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile">
          <ProfileScreen user={user} embedded />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionsScreen
            embedded
            initialSessions={sessions}
            currentSessionId={currentSessionId}
            today={today}
          />
        </TabsContent>

        {canManagePortal && settings && (
          <>
          <TabsContent value="temple">
            <TempleSection
              profile={settings.temple}
              onChange={(value) => patch('temple', value)}
            />
          </TabsContent>

          <TabsContent value="locale">
            <LocaleSection
              locale={settings.locale}
              onChange={(value) => patch('locale', value)}
            />
          </TabsContent>

          <TabsContent value="accounting">
            <AccountingSection
              accounting={settings.accounting}
              onChange={(value) => patch('accounting', value)}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsSection
              notifications={settings.notifications}
              onChange={(value) => patch('notifications', value)}
            />
          </TabsContent>
          </>
        )}

      </Tabs>
    </>
  );
}

function TempleSection({
  profile,
  onChange,
}: {
  profile: TempleProfile;
  onChange: (value: Partial<TempleProfile>) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Temple profile"
        description="Printed on every receipt, voucher and statement the portal produces"
      />

      <CardBody className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="temple-name" label="Name (English)" required>
            <Input
              id="temple-name"
              value={profile.name}
              onChange={(event) => onChange({ name: event.target.value })}
            />
          </FormField>

          <FormField id="temple-name-ta" label="Name (Tamil)" required>
            <Input
              id="temple-name-ta"
              value={profile.nameTa}
              onChange={(event) => onChange({ nameTa: event.target.value })}
            />
          </FormField>
        </div>

        <FormField
          id="temple-reg"
          label="Registration Number"
          hint="As registered with the provincial authority."
        >
          <Input
            id="temple-reg"
            value={profile.registrationNo}
            onChange={(event) =>
              onChange({ registrationNo: event.target.value })
            }
          />
        </FormField>

        <FormField id="temple-address" label="Address">
          <Input
            id="temple-address"
            value={profile.address}
            onChange={(event) => onChange({ address: event.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField id="temple-phone" label="Phone">
            <Input
              id="temple-phone"
              value={profile.phone}
              onChange={(event) => onChange({ phone: event.target.value })}
            />
          </FormField>

          <FormField id="temple-email" label="Email">
            <Input
              id="temple-email"
              type="email"
              value={profile.email}
              onChange={(event) => onChange({ email: event.target.value })}
            />
          </FormField>

          <FormField id="temple-website" label="Website">
            <Input
              id="temple-website"
              value={profile.website}
              onChange={(event) => onChange({ website: event.target.value })}
            />
          </FormField>
        </div>
      </CardBody>
    </Card>
  );
}

const TIME_ZONES = ['Asia/Colombo', 'Asia/Kolkata', 'UTC'] as const;

const DATE_FORMATS = [
  { value: 'dd-mon-yyyy', label: '21 Aug 2026' },
  { value: 'dd-mm-yyyy', label: '21-08-2026' },
  { value: 'yyyy-mm-dd', label: '2026-08-21' },
] as const;

function LocaleSection({
  locale,
  onChange,
}: {
  locale: LocaleSettings;
  onChange: (value: Partial<LocaleSettings>) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Locale and formatting"
        description="How dates, figures and language are rendered across the portal"
      />

      <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="locale-language"
          label="Default Language"
          hint="What a new visitor sees before choosing."
        >
          <Select
            value={locale.defaultLanguage}
            onValueChange={(value) =>
              onChange({ defaultLanguage: value as LocaleSettings['defaultLanguage'] })
            }
          >
            <SelectTrigger id="locale-language" className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ta">தமிழ் — Tamil</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="locale-timezone" label="Time Zone">
          <Select
            value={locale.timeZone}
            onValueChange={(value) => onChange({ timeZone: value })}
          >
            <SelectTrigger id="locale-timezone" className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {TIME_ZONES.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="locale-date" label="Date Format">
          <Select
            value={locale.dateFormat}
            onValueChange={(value) =>
              onChange({ dateFormat: value as LocaleSettings['dateFormat'] })
            }
          >
            <SelectTrigger id="locale-date" className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {DATE_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </CardBody>
    </Card>
  );
}

function AccountingSection({
  accounting,
  onChange,
}: {
  accounting: AccountingSettings;
  onChange: (value: Partial<AccountingSettings>) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Accounting defaults"
        description="Rules the voucher and approval screens enforce"
      />

      <CardBody className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            id="acc-receipt-prefix"
            label="Receipt Prefix"
            hint="RV-2026-0001"
          >
            <Input
              id="acc-receipt-prefix"
              value={accounting.receiptPrefix}
              maxLength={4}
              onChange={(event) =>
                onChange({ receiptPrefix: event.target.value.toUpperCase() })
              }
            />
          </FormField>

          <FormField
            id="acc-payment-prefix"
            label="Payment Prefix"
            hint="PV-2026-0001"
          >
            <Input
              id="acc-payment-prefix"
              value={accounting.paymentPrefix}
              maxLength={4}
              onChange={(event) =>
                onChange({ paymentPrefix: event.target.value.toUpperCase() })
              }
            />
          </FormField>

          <FormField
            id="acc-year-start"
            label="Year Starts"
            hint="Month the financial year opens."
          >
            <Select
              value={String(accounting.yearStartMonth)}
              onValueChange={(value) =>
                onChange({ yearStartMonth: Number(value) })
              }
            >
              <SelectTrigger id="acc-year-start" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {Array.from({ length: 12 }, (_, index) => (
                  <SelectItem key={index + 1} value={String(index + 1)}>
                    {monthName(index + 1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField
          id="acc-threshold"
          label="Second Approval Threshold"
          hint={`Payments above ${formatCurrency(accounting.approvalThreshold)} need a second approver.`}
        >
          <Input
            id="acc-threshold"
            type="number"
            min={0}
            step={5000}
            value={accounting.approvalThreshold || ''}
            onChange={(event) =>
              onChange({ approvalThreshold: Number(event.target.value) || 0 })
            }
          />
        </FormField>

        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
          <div className="min-w-0 pr-4">
            <Label
              htmlFor="acc-separate-poster"
              className="text-xs font-medium text-text-secondary"
            >
              Require a separate poster
            </Label>
            <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
              An approver cannot also post their own approval to the ledger.
              Turning this off collapses two checks into one person.
            </p>
          </div>

          <Switch
            id="acc-separate-poster"
            checked={accounting.requireSeparatePoster}
            onCheckedChange={(checked) =>
              onChange({ requireSeparatePoster: checked })
            }
          />
        </div>

        {!accounting.requireSeparatePoster && (
          <p className="rounded-lg bg-warning-subtle px-3 py-2 text-xs leading-relaxed text-warning">
            With this off, one person can approve an entry and post it to the
            ledger without anybody else seeing it. Nobody may still approve
            their own entry — that rule is not configurable.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

const NOTIFICATION_ROWS: readonly {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}[] = [
  {
    key: 'voucherSubmitted',
    label: 'Voucher submitted',
    description: 'Tell approvers when an entry reaches the queue.',
  },
  {
    key: 'voucherApproved',
    label: 'Voucher approved',
    description: 'Tell the drafter when their entry is approved.',
  },
  {
    key: 'voucherRejected',
    label: 'Voucher rejected',
    description: 'Tell the drafter when an entry comes back, with the reason.',
  },
  {
    key: 'depositMaturing',
    label: 'Deposit maturing',
    description: 'Warn administrators 90 days before a fixed deposit matures.',
  },
  {
    key: 'sanththaArrears',
    label: 'Sanththa arrears',
    description: 'Monthly summary of members who have fallen behind.',
  },
  {
    key: 'eventReminders',
    label: 'Event reminders',
    description: 'Remind sponsors and staff ahead of a scheduled pooja.',
  },
];

function NotificationsSection({
  notifications,
  onChange,
}: {
  notifications: NotificationSettings;
  onChange: (value: Partial<NotificationSettings>) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Notifications"
        description="What the portal tells people about, and when"
      />

      <ul className="divide-y divide-border">
        {NOTIFICATION_ROWS.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-4 px-5 py-3.5"
          >
            <div className="min-w-0">
              <Label
                htmlFor={`notify-${row.key}`}
                className="text-[13px] font-medium text-text-primary"
              >
                {row.label}
              </Label>
              <p className="mt-0.5 text-xs text-text-muted">
                {row.description}
              </p>
            </div>

            <Switch
              id={`notify-${row.key}`}
              checked={notifications[row.key]}
              onCheckedChange={(checked) => onChange({ [row.key]: checked })}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
