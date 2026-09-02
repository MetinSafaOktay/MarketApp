'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useAdminCustomers } from '@/lib/use-admin';

export function CustomersTable() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data, isLoading } = useAdminCustomers();

  if (isLoading) return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  const rows = data?.data ?? [];
  if (rows.length === 0)
    return <p className="text-sm text-text-muted">{tc('empty')}</p>;

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-text-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t('name')}</th>
            <th className="px-3 py-2 font-medium">E-mail</th>
            <th className="px-3 py-2 font-medium">{t('orders')}</th>
            <th className="px-3 py-2 font-medium">{t('created')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="px-3 py-2" dir="auto">
                {`${c.first_name} ${c.last_name}`.trim() || c.profile_name}
              </td>
              <td className="px-3 py-2 text-text-muted">
                {c.email ?? c.phone ?? '—'}
              </td>
              <td className="px-3 py-2">{c.order_count}</td>
              <td className="px-3 py-2 text-text-muted">
                {new Date(c.created_at).toLocaleDateString(locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
