import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AnnouncementsManager } from '@/components/admin/announcements-manager';

export default async function AdminAnnouncementsPage({
  params,
}: PageProps<'/[locale]/admin/announcements'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');
  return (
    <>
      <h1 className="mb-6 text-xl font-bold">{t('announcements')}</h1>
      <AnnouncementsManager />
    </>
  );
}
