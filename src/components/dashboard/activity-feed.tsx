'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StageBadge } from './stage-badge';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';
import type { StageHistory, Project } from '@/types/database.types';

interface ActivityFeedProps {
  activities: (StageHistory & {
    projects: Pick<Project, 'title'> | null;
  })[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>უახლესი აქტივობები</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            ჯერ არ არის აქტივობები
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>უახლესი აქტივობები</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {activity.projects?.title || 'უცნობი პროექტი'}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {activity.from_stage && (
                    <>
                      <StageBadge stage={activity.from_stage} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                  <StageBadge stage={activity.to_stage} />
                </div>
                {activity.notes && (
                  <p className="text-xs text-muted-foreground">{activity.notes}</p>
                )}
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                  locale: ka,
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
