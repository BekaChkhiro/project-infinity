'use client';

import { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserPreferences } from '@/types/database.types';
import {
  getUserPreferences,
  updateUserPreferences,
  toggleNotifications,
  updateNotificationTypes,
} from '@/lib/supabase/preferences';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/lib/toast';

export function PreferencesForm() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const prefs = await getUserPreferences(user.id);
        setPreferences(prefs);
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      showToast.error('პარამეტრების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!preferences) return;

    try {
      await toggleNotifications(preferences.user_id, enabled);
      setPreferences({ ...preferences, notifications_enabled: enabled });
      showToast.success('პარამეტრი განახლდა');
    } catch (error: any) {
      console.error('Error toggling notifications:', error);
      showToast.error('განახლება ვერ მოხერხდა');
    }
  };

  const handleUpdateNotificationType = async (type: string, enabled: boolean) => {
    if (!preferences) return;

    try {
      const notificationTypes = { ...(preferences.notification_types || {}) };
      notificationTypes[type] = enabled;

      await updateNotificationTypes(preferences.user_id, notificationTypes);
      setPreferences({ ...preferences, notification_types: notificationTypes });
      showToast.success('პარამეტრი განახლდა');
    } catch (error: any) {
      console.error('Error updating notification type:', error);
      showToast.error('განახლება ვერ მოხერხდა');
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      await updateUserPreferences(preferences.user_id, {
        stuck_project_threshold_days: preferences.stuck_project_threshold_days,
        alert_preferences: preferences.alert_preferences,
      });
      showToast.success('პარამეტრები შენახულია');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      showToast.error('შენახვა ვერ მოხერხდა');
    } finally {
      setSaving(false);
    }
  };

  const isNotificationTypeEnabled = (type: string) => {
    if (!preferences?.notification_types) return false;
    return preferences.notification_types[type] === true;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">იტვირთება...</p>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            პარამეტრები ვერ მოიძებნა
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>შეტყობინებები</CardTitle>
          <CardDescription>
            მართეთ როგორ და როდის მიიღებთ შეტყობინებებს
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">შეტყობინებების ჩართვა</Label>
              <p className="text-sm text-muted-foreground">
                ყველა შეტყობინების ჩართვა/გამორთვა
              </p>
            </div>
            <Switch
              checked={preferences.notifications_enabled}
              onCheckedChange={handleToggleNotifications}
            />
          </div>

          {preferences.notifications_enabled && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">შეტყობინების ტიპები</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label>ეტაპის შეცვლა</Label>
                  <p className="text-xs text-muted-foreground">
                    როცა პროექტი გადადის ახალ ეტაპზე
                  </p>
                </div>
                <Switch
                  checked={isNotificationTypeEnabled('stage_change')}
                  onCheckedChange={(enabled) =>
                    handleUpdateNotificationType('stage_change', enabled)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>გაჩერებული პროექტი</Label>
                  <p className="text-xs text-muted-foreground">
                    როცა პროექტი დიდხანს არ განახლებულა
                  </p>
                </div>
                <Switch
                  checked={isNotificationTypeEnabled('project_stuck')}
                  onCheckedChange={(enabled) =>
                    handleUpdateNotificationType('project_stuck', enabled)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>გადახდა მიღებულია</Label>
                  <p className="text-xs text-muted-foreground">
                    როცა გადახდა დადასტურდება
                  </p>
                </div>
                <Switch
                  checked={isNotificationTypeEnabled('payment_received')}
                  onCheckedChange={(enabled) =>
                    handleUpdateNotificationType('payment_received', enabled)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>ახალი პროექტი</Label>
                  <p className="text-xs text-muted-foreground">
                    როცა ახალი პროექტი იქმნება
                  </p>
                </div>
                <Switch
                  checked={isNotificationTypeEnabled('project_created')}
                  onCheckedChange={(enabled) =>
                    handleUpdateNotificationType('project_created', enabled)
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Automation */}
      <Card>
        <CardHeader>
          <CardTitle>ავტომატიზაცია</CardTitle>
          <CardDescription>
            პარამეტრები ავტომატური წესებისთვის
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>გაჩერებული პროექტის ზღვარი (დღეები)</Label>
            <Input
              type="number"
              min="1"
              max="90"
              value={preferences.stuck_project_threshold_days}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  stuck_project_threshold_days: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              რამდენი დღის შემდეგ ითვლება პროექტი გაჩერებულად
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'ინახება...' : 'შენახვა'}
        </Button>
      </div>
    </div>
  );
}
