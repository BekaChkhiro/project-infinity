import { createClient } from './client';
import { UserPreferences, NewUserPreferences, UpdateUserPreferences } from '@/types/database.types';

// Get user preferences
export async function getUserPreferences(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  // If preferences don't exist, create default ones
  if (!data) {
    return createDefaultPreferences(userId);
  }

  return data as UserPreferences;
}

// Create default preferences for a user
async function createDefaultPreferences(userId: string) {
  const supabase = createClient();

  const defaultPreferences: NewUserPreferences = {
    user_id: userId,
    notifications_enabled: true,
    email_notifications: true,
    automation_enabled: true,
    notification_types: {
      stage_change: true,
      project_stuck: true,
      payment_received: true,
      project_created: true,
      approval_received: true,
      deadline_approaching: true,
      automation_triggered: false,
    },
    stuck_project_threshold_days: 7,
    alert_preferences: {
      high_value_threshold: 10000,
      weekend_alerts: false,
      quiet_hours_start: null,
      quiet_hours_end: null,
    },
  };

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('user_preferences')
    .insert(defaultPreferences)
    .select()
    .single();

  if (error) throw error;
  return data as UserPreferences;
}

// Update user preferences
export async function updateUserPreferences(userId: string, updates: UpdateUserPreferences) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('user_preferences')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserPreferences;
}

// Toggle notifications
export async function toggleNotifications(userId: string, enabled: boolean) {
  return updateUserPreferences(userId, { notifications_enabled: enabled });
}

// Toggle email notifications
export async function toggleEmailNotifications(userId: string, enabled: boolean) {
  return updateUserPreferences(userId, { email_notifications: enabled });
}

// Toggle automation
export async function toggleAutomation(userId: string, enabled: boolean) {
  return updateUserPreferences(userId, { automation_enabled: enabled });
}

// Update notification type preferences
export async function updateNotificationTypes(
  userId: string,
  notificationTypes: Record<string, boolean>
) {
  return updateUserPreferences(userId, { notification_types: notificationTypes });
}

// Update stuck project threshold
export async function updateStuckProjectThreshold(userId: string, days: number) {
  return updateUserPreferences(userId, { stuck_project_threshold_days: days });
}

// Update alert preferences
export async function updateAlertPreferences(
  userId: string,
  alertPreferences: Record<string, any>
) {
  return updateUserPreferences(userId, { alert_preferences: alertPreferences });
}

// Check if user should receive notification based on preferences
export async function shouldReceiveNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  const preferences = await getUserPreferences(userId);

  if (!preferences.notifications_enabled) {
    return false;
  }

  // Check if this specific notification type is enabled
  const notificationTypes = preferences.notification_types as Record<string, boolean>;
  return notificationTypes[notificationType] !== false;
}

// Check if quiet hours are active
export function isQuietHours(alertPreferences: Record<string, any>): boolean {
  const quietHoursStart = alertPreferences.quiet_hours_start;
  const quietHoursEnd = alertPreferences.quiet_hours_end;

  if (!quietHoursStart || !quietHoursEnd) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();

  // Parse hours (format: "HH:mm")
  const startHour = parseInt(quietHoursStart.split(':')[0]);
  const endHour = parseInt(quietHoursEnd.split(':')[0]);

  // Check if current hour is in quiet hours range
  if (startHour <= endHour) {
    return currentHour >= startHour && currentHour < endHour;
  } else {
    // Handles overnight quiet hours (e.g., 22:00 - 06:00)
    return currentHour >= startHour || currentHour < endHour;
  }
}

// Check if weekend alerts are disabled
export function isWeekendAndAlertsDisabled(alertPreferences: Record<string, any>): boolean {
  if (alertPreferences.weekend_alerts !== false) {
    return false; // Weekend alerts are enabled
  }

  const now = new Date();
  const dayOfWeek = now.getDay();

  // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
}
