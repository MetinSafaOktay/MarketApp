export interface CreateNotificationInput {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  related_order_id?: string;
}
