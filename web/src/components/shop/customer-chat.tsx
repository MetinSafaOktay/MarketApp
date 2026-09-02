'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { useMyMessages, useSendMessage } from '@/lib/use-customer-messages';
import { cn } from '@/lib/cn';

export function CustomerChat() {
  const t = useTranslations('Messages');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: messages = [], isLoading } = useMyMessages();
  const send = useSendMessage();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    send.mutate(content, { onSuccess: () => setText('') });
  }

  return (
    <div className="flex h-[65vh] flex-col rounded-card border border-border">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-text-muted">{tc('loading')}</p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            {t('startConversation')}
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                m.sender_type === 'user'
                  ? 'ml-auto bg-accent text-accent-fg'
                  : 'bg-surface-2',
              )}
            >
              <p dir="auto">{m.content}</p>
              <span className="mt-0.5 block text-[10px] opacity-70">
                {new Date(m.created_at).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="submit"
          disabled={send.isPending}
          className="rounded-lg bg-accent px-3 py-2 text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
