import { setRequestLocale } from 'next-intl/server';
import { RequireAdmin } from '@/components/auth/require-admin';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<'/[locale]/admin'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequireAdmin>
      <div className="flex min-h-dvh">
        <AdminSidebar />
        <main className="min-w-0 flex-1 bg-bg">
          <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        </main>
      </div>
    </RequireAdmin>
  );
}
