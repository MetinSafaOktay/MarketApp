'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useAdminAnnouncements,
  useAnnouncementMutations,
} from '@/lib/use-admin';
import type { AdminAnnouncement, TranslatedText } from '@/lib/admin-types';
import { TranslationInput } from './translation-input';

export function AnnouncementsManager() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const { data, isLoading } = useAdminAnnouncements();
  const { remove } = useAnnouncementMutations();
  const [editing, setEditing] = useState<AdminAnnouncement | 'new' | null>(null);

  return (
    <div className="space-y-4">
      {editing ? (
        <AnnouncementForm
          announcement={editing === 'new' ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('new')}
        </button>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted">{tc('loading')}</p>
      ) : (
        <div className="divide-y divide-border rounded-card border border-border text-sm">
          {(data ?? []).map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-3 py-2">
              <span className="line-clamp-1 flex-1" dir="auto">
                {a.title?.tr ?? a.content.tr ?? a.content.en ?? '—'}
              </span>
              <button
                type="button"
                onClick={() => setEditing(a)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => confirm(t('confirmDelete')) && remove.mutate(a.id)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementForm({
  announcement,
  onDone,
}: {
  announcement?: AdminAnnouncement;
  onDone: () => void;
}) {
  const t = useTranslations('Admin');
  const { create, update } = useAnnouncementMutations();
  const [title, setTitle] = useState<TranslatedText>(announcement?.title ?? {});
  const [content, setContent] = useState<TranslatedText>(
    announcement?.content ?? {},
  );
  const [imageUrl, setImageUrl] = useState(announcement?.image_url ?? '');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.tr?.trim()) {
      setError('TR *');
      return;
    }
    const body = {
      title: Object.keys(title).length ? title : undefined,
      content,
      image_url: imageUrl || undefined,
    };
    try {
      if (announcement) await update.mutateAsync({ id: announcement.id, body });
      else await create.mutateAsync(body);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-lg space-y-3 rounded-card border border-border bg-surface p-4"
    >
      <TranslationInput label={t('title')} value={title} onChange={setTitle} />
      <TranslationInput
        label={t('content')}
        value={content}
        onChange={setContent}
        required
        textarea
      />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-muted">{t('imageUrl')}</span>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
