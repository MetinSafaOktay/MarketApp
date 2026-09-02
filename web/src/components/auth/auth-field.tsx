export function AuthField({
  label,
  name,
  type = 'text',
  autoComplete,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-text outline-none focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}
