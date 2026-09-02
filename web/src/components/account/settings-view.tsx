'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';
import { useUserSettings, useUpdateSettings, useDeleteAccount } from '@/lib/use-profile';

export function SettingsView() {
  const t = useTranslations('Settings');
  const tc = useTranslations('Common');
  const tl = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { data: settings, isLoading } = useUserSettings();
  const update = useUpdateSettings();
  const del = useDeleteAccount();
  const [saved, setSaved] = useState(false);

  if (isLoading || !settings) {
    return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  }

  function patch(body: Parameters<typeof update.mutate>[0]) {
    update.mutate(body, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  }

  return (
    <div className="max-w-md space-y-8">
      {/* Dil */}
      <section>
        <h2 className="mb-2 text-sm font-semibold">{t('language')}</h2>
        <select
          value={locale}
          onChange={(e) => {
            patch({ language: e.target.value });
            router.replace(pathname, { locale: e.target.value });
          }}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
        >
          {locales.map((l) => (
            <option key={l} value={l}>
              {tl(l)}
            </option>
          ))}
        </select>
      </section>

      {/* Bildirimler */}
      <section>
        <h2 className="mb-2 text-sm font-semibold">{t('notifications')}</h2>
        <Toggle
          label={t('pushEnabled')}
          checked={settings.push_notifications_enabled}
          onChange={(v) => patch({ push_notifications_enabled: v })}
        />
        <Toggle
          label={t('orderNotifications')}
          checked={settings.order_notifications_enabled}
          onChange={(v) => patch({ order_notifications_enabled: v })}
        />
      </section>

      {saved && <p className="text-sm text-success">{t('saved')}</p>}

      {/* Tehlikeli bölge */}
      <section className="rounded-card border border-danger/30 p-4">
        <h2 className="mb-1 text-sm font-semibold text-danger">
          {t('dangerZone')}
        </h2>
        <p className="mb-3 text-xs text-text-muted">{t('deleteWarning')}</p>
        <button
          type="button"
          disabled={del.isPending}
          onClick={() => {
            if (confirm(t('deleteConfirm'))) {
              del.mutate(undefined, {
                onSuccess: () => router.replace('/'),
              });
            }
          }}
          className="rounded-lg border border-danger/40 px-4 py-2 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
        >
          {t('deleteAccount')}
        </button>
      </section>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-2 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-accent)]"
      />
    </label>
  );
}
