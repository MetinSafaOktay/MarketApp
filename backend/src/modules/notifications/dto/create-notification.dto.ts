/**
 * `NotificationsService.create` girdisi — HTTP DTO'su DEĞİL (bildirim uçları yok),
 * sadece diğer servislerin (orders) çağırırken kullandığı iç tip.
 * `type`: 'order_status_update' | 'announcement' | ... (istemci ikonu buna göre seçer).
 */
export interface CreateNotificationInput {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  related_order_id?: string; // varsa istemci "siparişe git" yapabilir
}
