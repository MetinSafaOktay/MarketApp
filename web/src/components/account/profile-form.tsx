'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Lock, User } from 'lucide-react';
import { useCurrentUser } from '@/lib/use-auth';
import { useUpdateProfile } from '@/lib/use-profile';
import { ImageUpload } from '@/components/admin/image-upload';

export function ProfileForm() {
  const t = useTranslations('Profile');
  const tc = useTranslations('Common');
  const { user } = useCurrentUser();
  const update = useUpdateProfile();

  if (!user) return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  return (
    <ProfileFormInner
      key={user.id}
      user={user}
      t={t}
      saveLabel={tc('save')}
      update={update}
    />
  );
}

function ProfileFormInner({
  user,
  t,
  saveLabel,
  update,
}: {
  user: NonNullable<ReturnType<typeof useCurrentUser>['user']>;
  t: ReturnType<typeof useTranslations>;
  saveLabel: string;
  update: ReturnType<typeof useUpdateProfile>;
}) {
  const [profileName, setProfileName] = useState(user.profile_name);
  const [isPrivate, setIsPrivate] = useState(user.is_private);
  const [photo, setPhoto] = useState(user.profile_photo_url);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await update.mutateAsync({
        profile_name: profileName,
        is_private: isPrivate,
        profile_photo_url: photo ?? undefined,
      });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative size-16 overflow-hidden rounded-full bg-surface-2">
          {photo ? (
            <Image src={photo} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-text-muted">
              <User className="size-7" />
            </span>
          )}
        </div>
        <ImageUpload
          endpoint="/uploads/avatar"
          label={t('changePhoto')}
          onUploaded={(url) => {
            setPhoto(url);
            update.mutate({ profile_photo_url: url });
          }}
        />
      </div>

      <label className="flex max-w-sm flex-col gap-1.5 text-sm">
        <span className="text-text-muted">{t('profileName')}</span>
        <input
          value={profileName}
          maxLength={30}
          onChange={(e) => setProfileName(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>

      <div className="grid max-w-sm grid-cols-2 gap-3">
        <LockedField label={t('firstName')} value={user.first_name} />
        <LockedField label={t('lastName')} value={user.last_name} />
      </div>

      <label className="flex max-w-sm items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="mt-0.5 accent-[var(--color-accent)]"
        />
        <span>
          {t('isPrivate')}
          <span className="block text-xs text-text-muted">
            {t('isPrivateHint')}
          </span>
        </span>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">{t('saved')}</p>}

      <button
        type="submit"
        disabled={update.isPending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-60"
      >
        {saveLabel}
      </button>
    </form>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-text-muted">
        <span dir="auto" className="flex-1">
          {value || '—'}
        </span>
        <Lock className="size-3.5" />
      </div>
    </label>
  );
}
