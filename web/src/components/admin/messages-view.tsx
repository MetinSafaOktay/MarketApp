'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import {
  useConversation,
  useConversations,
  useReplyToConversation,
} from '@/lib/use-messages';
import { cn } from '@/lib/cn';

export function MessagesView() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: conversations, isLoading } = useConversations();
  const [selected, setSelected] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  if (!conversations || conversations.length === 0)
    return <p className="text-sm text-text-muted">{t('noMessages')}</p>;

  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <div className="divide-y divide-border rounded-card border border-border">
        {conversations.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelected(c.id)}
            className={cn(
              'block w-full px-3 py-2 text-left text-sm',
              selected === c.id ? 'bg-surface-2' : 'hover:bg-surface-2',
            )}
          >
            <span className="font-medium" dir="auto">
              {c.users?.profile_name ?? c.user_id.slice(0, 8)}
            </span>
            <span className="block text-xs text-text-muted">
              {new Date(c.created_at).toLocaleDateString(locale)}
            </span>
          </button>
        ))}
      </div>

      {selected ? (
        <Thread id={selected} />
      ) : (
        <p className="text-sm text-text-muted">{t('messages')}</p>
      )}
    </div>
  );
}

function Thread({ id }: { id: string }) {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const { data: messages = [] } = useConversation(id);
  const reply = useReplyToConversation(id);
  const [text, setText] = useState('');

  function send(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    reply.mutate(content, { onSuccess: () => setText('') });
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-card border border-border">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'max-w-[75%] rounded-lg px-3 py-2 text-sm',
              m.sender_type === 'store'
                ? 'ml-auto bg-accent text-accent-fg'
                : 'bg-surface-2',
            )}
          >
            <p dir="auto">{m.content}</p>
            <span className="mt-0.5 block text-[10px] opacity-70">
              {new Date(m.created_at).toLocaleTimeString(locale)}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-border p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('reply')}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="submit"
          disabled={reply.isPending}
          className="rounded-lg bg-accent px-3 py-2 text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
