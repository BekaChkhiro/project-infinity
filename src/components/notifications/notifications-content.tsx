'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Clock,
  FileText,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/lib/supabase/notifications';
import { NotificationWithRelations } from '@/types/database.types';
import { showToast } from '@/lib/toast';
import { createClient } from '@/lib/supabase/client';

export function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, filter, typeFilter]);

  async function loadUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  }

  async function loadNotifications() {
    try {
      setLoading(true);
      let allNotifications = await getNotifications(100);

      // Apply filters
      if (filter === 'unread') {
        allNotifications = allNotifications.filter((n: any) => !n.is_read);
      } else if (filter === 'read') {
        allNotifications = allNotifications.filter((n: any) => n.is_read);
      }

      if (typeFilter !== 'all') {
        allNotifications = allNotifications.filter((n: any) => n.type === typeFilter);
      }

      setNotifications(allNotifications);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      showToast.error('შეტყობინებების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markAsRead(notificationId);
      await loadNotifications();
      showToast.success('შეტყობინება წაკითხულად აღინიშნა');
    } catch (error: any) {
      showToast.error('ოპერაცია ვერ განხორციელდა');
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead(userId);
      await loadNotifications();
      showToast.success('ყველა შეტყობინება წაკითხულად აღინიშნა');
    } catch (error: any) {
      showToast.error('ოპერაცია ვერ განხორციელდა');
    }
  }

  async function handleDelete(notificationId: string) {
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
      showToast.success('შეტყობინება წაშლილია');
    } catch (error: any) {
      showToast.error('წაშლა ვერ მოხერხდა');
    }
  }

  async function handleClearAll() {
    if (!confirm('დარწმუნებული ხართ რომ გსურთ ყველა შეტყობინების წაშლა?')) {
      return;
    }

    try {
      await clearAllNotifications(userId);
      await loadNotifications();
      showToast.success('ყველა შეტყობინება წაშლილია');
    } catch (error: any) {
      showToast.error('ოპერაცია ვერ განხორციელდა');
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stage_change':
        return <Bell className="h-5 w-5 text-blue-600" />;
      case 'project_stuck':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'payment_received':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'deadline_approaching':
        return <Clock className="h-5 w-5 text-red-600" />;
      case 'project_created':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'automation_triggered':
        return <Zap className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      stage_change: 'ეტაპის ცვლილება',
      project_stuck: 'გაჩერებული პროექტი',
      payment_received: 'გადახდა მიღებულია',
      project_created: 'ახალი პროექტი',
      approval_received: 'დასტური მიღებულია',
      deadline_approaching: 'ვადა ახლოვდება',
      automation_triggered: 'ავტომატიზაცია',
      system_alert: 'სისტემური გაფრთხილება',
    };
    return labels[type] || type;
  };

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">იტვირთება...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="ტიპი" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ყველა ტიპი</SelectItem>
                <SelectItem value="stage_change">ეტაპის ცვლილება</SelectItem>
                <SelectItem value="project_stuck">გაჩერებული პროექტი</SelectItem>
                <SelectItem value="payment_received">გადახდა მიღებულია</SelectItem>
                <SelectItem value="project_created">ახალი პროექტი</SelectItem>
                <SelectItem value="deadline_approaching">ვადა ახლოვდება</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadNotifications}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                ყველას წაკითხულად მონიშვნა
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                ყველას წაშლა
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for filtering */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            ყველა ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            წაუკითხავი ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            წაკითხული ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'unread'
                ? 'წაუკითხავი შეტყობინებები არ არის'
                : 'შეტყობინებები არ არის'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: any) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.is_read ? 'bg-accent/50 border-l-4 border-l-primary' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        {notification.related_project_id && notification.project && (
                          <Link
                            href={`/dashboard/projects/${notification.related_project_id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            პროექტი: {notification.project.title} →
                          </Link>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(notification.created_at), 'dd MMM yyyy, HH:mm', {
                            locale: ka,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="წაკითხულად მონიშვნა"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                          title="წაშლა"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
