'use client';

import { use } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Lock, User } from 'lucide-react';
import { usePublicProfile } from '@/lib/use-social';
import { useCurrentUser } from '@/lib/use-auth';
import { FollowButton } from '@/components/social/follow-button';

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('Social');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: profile, isLoading, isError } = usePublicProfile(id);
  const { user } = useCurrentUser();

  if (isLoading)
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-text-muted">
        {tc('loading')}
      </div>
    );
  if (isError || !profile)
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-text-muted">
        {t('notFound')}
      </div>
    );

  const isSelf = user?.id === profile.id;
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-surface-2">
          {profile.profile_photo_url ? (
            <Image
              src={profile.profile_photo_url}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center text-text-muted">
              <User className="size-8" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold" dir="auto">
            {profile.profile_name}
          </h1>
          {fullName && !profile.is_private && (
            <p className="text-sm text-text-muted" dir="auto">
              {fullName}
            </p>
          )}
        </div>
        {!isSelf && <FollowButton userId={profile.id} />}
      </div>

      <div className="mt-6 flex gap-6 text-sm">
        <span>
          <strong>{profile.followerCount}</strong>{' '}
          <span className="text-text-muted">{t('followers')}</span>
        </span>
        <span>
          <strong>{profile.followingCount}</strong>{' '}
          <span className="text-text-muted">{t('following')}</span>
        </span>
      </div>

      {profile.is_private ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-text-muted">
          <Lock className="size-4" />
          {t('privateHint')}
        </p>
      ) : (
        <>
          {profile.bio && (
            <p className="mt-4 whitespace-pre-line text-sm" dir="auto">
              {profile.bio}
            </p>
          )}
          <p className="mt-4 text-xs text-text-muted">
            {t('memberSince')}:{' '}
            {new Date(profile.created_at).toLocaleDateString(locale)}
          </p>
        </>
      )}
    </div>
  );
}
