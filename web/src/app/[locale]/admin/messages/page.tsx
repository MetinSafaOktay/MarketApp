import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MessagesView } from '@/components/admin/messages-view';

export default async function AdminMessagesPage({
  params,
}: PageProps<'/[locale]/admin/messages'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');
  return (
    <>
      <h1 className="mb-6 text-xl font-bold">{t('messages')}</h1>
      <MessagesView />
    </>
  );
}
