import { createClient } from './client';
import {
  Notification,
  NewNotification,
  UpdateNotification,
  NotificationWithRelations,
} from '@/types/database.types';

// Get all notifications for current user
export async function getNotifications(limit: number = 50, offset: number = 0) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      project:projects(id, title),
      client:clients(id, name)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as NotificationWithRelations[];
}

// Get unread notifications count
export async function getUnreadCount() {
  const supabase = createClient();

  // @ts-ignore - RPC function type not in generated types
  const { data, error } = await (supabase as any)
    .rpc('get_unread_notification_count', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
    });

  if (error) throw error;
  return data as number;
}

// Get unread notifications
export async function getUnreadNotifications(limit: number = 20) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      project:projects(id, title),
      client:clients(id, name)
    `)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as NotificationWithRelations[];
}

// Create a new notification
export async function createNotification(notification: NewNotification) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

// Mark notification as read
export async function markAsRead(notificationId: string) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

// Mark multiple notifications as read
export async function markMultipleAsRead(notificationIds: string[]) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .in('id', notificationIds)
    .select();

  if (error) throw error;
  return data as Notification[];
}

// Mark all notifications as read
export async function markAllAsRead(userId: string) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();

  if (error) throw error;
  return data as Notification[];
}

// Delete a notification
export async function deleteNotification(notificationId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

// Clear all notifications for user
export async function clearAllNotifications(userId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

// Subscribe to new notifications (real-time)
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return channel;
}

// Unsubscribe from notifications
export function unsubscribeFromNotifications(channel: any) {
  channel.unsubscribe();
}
