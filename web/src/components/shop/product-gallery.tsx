'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { ProductImage } from '@/lib/types';

export function ProductGallery({
  images,
  alt,
}: {
  images: ProductImage[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-card border border-border bg-surface-2 text-sm text-text-muted">
        {alt}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-card border border-border bg-white">
        <Image
          src={images[active].image_url}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-contain"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-lg border bg-white',
                i === active ? 'border-accent' : 'border-border',
              )}
            >
              <Image
                src={img.image_url}
                alt=""
                fill
                sizes="64px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
