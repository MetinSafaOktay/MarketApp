'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload } from 'lucide-react';
import { authedApi } from '@/lib/auth';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

interface SignedUpload {
  upload_url: string;
  public_url: string;
  content_type: string;
}

export function ImageUpload({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const t = useTranslations('Admin');
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    const ext = EXT_BY_MIME[file.type];
    if (!ext) {
      setError('jpg / png / webp');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const signed = await authedApi<SignedUpload>('/uploads/product-image', {
        method: 'POST',
        body: JSON.stringify({ ext, content_type: file.type }),
      });
      const put = await fetch(signed.upload_url, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`upload ${put.status}`);
      onUploaded(signed.public_url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-2 disabled:opacity-60"
      >
        <Upload className="size-4" />
        {busy ? '…' : t('uploadImage')}
      </button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
