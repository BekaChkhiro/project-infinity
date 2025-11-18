'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Bell, AlertTriangle, Activity, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAutomationDashboard } from '@/lib/supabase/automation';
import { AutomationDashboard } from '@/types/database.types';

export function AutomationStatsWidget() {
  const [stats, setStats] = useState<AutomationDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getAutomationDashboard();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading automation stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ავტომატიზაციის სტატისტიკა</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">იტვირთება...</p>
        </CardContent>
      </Card>
    );
  }

  const statsData = [
    {
      label: 'წაუკითხავი შეტყობინებები',
      value: stats.unread_notifications,
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/dashboard/notifications?filter=unread',
    },
    {
      label: 'აქტიური გაფრთხილებები',
      value: stats.active_alerts,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/dashboard/automation',
    },
    {
      label: 'აქტიური წესები',
      value: stats.active_rules,
      icon: Settings,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/dashboard/automation',
    },
    {
      label: 'გაჩერებული პროექტები',
      value: stats.stuck_projects,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/dashboard/projects?filter=stuck',
    },
    {
      label: 'ავტომატიზაცია დღეს',
      value: stats.automations_today,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/dashboard/automation',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          ავტომატიზაციის სტატისტიკა
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="block p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
