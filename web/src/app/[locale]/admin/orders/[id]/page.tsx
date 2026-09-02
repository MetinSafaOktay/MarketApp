import { AdminOrderDetail } from '@/components/admin/admin-orders';

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  return <AdminOrderDetail params={params} />;
}
