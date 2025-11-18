'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/lib/supabase/notifications';
import { NotificationWithRelations } from '@/types/database.types';
import { showToast } from '@/lib/toast';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationWithRelations[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time notifications
    const channel = subscribeToNotifications(userId, (notification) => {
      setNotifications((prev) => [notification as any, ...prev]);
      setUnreadCount((prev) => prev + 1);
      showToast.info(notification.title, { description: notification.message });
    });

    return () => {
      unsubscribeFromNotifications(channel);
    };
  }, [userId]);

  async function loadNotifications() {
    try {
      const [notifs, count] = await Promise.all([
        getUnreadNotifications(10),
        getUnreadCount(),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      showToast.error('შეტყობინების წასაშლელად ვერ მოხერხდა');
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast.success('ყველა შეტყობინება წაშლილია');
    } catch (error: any) {
      showToast.error('ოპერაცია ვერ განხორციელდა');
    }
  }

  const getNotificationIcon = (type: string) => {
    // Return appropriate icon based on notification type
    return <Bell className="h-4 w-4" />;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>შეტყობინებები</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              ყველას წაშლა
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              იტვირთება...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              შეტყობინებები არ არის
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-3 py-2 hover:bg-accent cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-accent/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.related_project_id && (
                        <Link
                          href={`/dashboard/projects/${notification.related_project_id}`}
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                          onClick={() => setOpen(false)}
                        >
                          პროექტის ნახვა →
                        </Link>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ka,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/notifications"
            className="w-full text-center cursor-pointer"
            onClick={() => setOpen(false)}
          >
            ყველა შეტყობინების ნახვა
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
