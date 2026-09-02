'use client';

import { User } from 'lucide-react';
import { useCurrentUser } from '@/lib/use-auth';

export function AccountHeader() {
  const { user } = useCurrentUser();

  return (
    <div className="flex items-center gap-4">
      <div className="grid size-16 place-items-center rounded-full bg-surface-2 text-text-muted">
        {user?.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profile_photo_url}
            alt=""
            className="size-16 rounded-full object-cover"
          />
        ) : (
          <User className="size-7" />
        )}
      </div>
      <div>
        <h1 className="text-lg font-bold" dir="auto">
          {user ? `${user.first_name} ${user.last_name}`.trim() || user.profile_name : ''}
        </h1>
        {user?.email && (
          <p className="text-sm text-text-muted">{user.email}</p>
        )}
      </div>
    </div>
  );
}
