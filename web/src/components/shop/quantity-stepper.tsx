'use client';

import { Minus, Plus } from 'lucide-react';

export function QuantityStepper({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
}) {
  const cap = max && max > 0 ? max : 99;
  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <button
        type="button"
        aria-label="-"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="grid size-9 place-items-center text-text-muted hover:text-text disabled:opacity-40"
        disabled={value <= 1}
      >
        <Minus className="size-4" />
      </button>
      <span className="w-10 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="+"
        onClick={() => onChange(Math.min(cap, value + 1))}
        className="grid size-9 place-items-center text-text-muted hover:text-text disabled:opacity-40"
        disabled={value >= cap}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
