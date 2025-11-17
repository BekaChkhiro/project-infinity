'use client';

import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Clock, User, MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStageConfig } from '@/lib/stages';
import { Database } from '@/types/database.types';

type StageHistory = Database['public']['Tables']['stage_history']['Row'] & {
  user?: {
    full_name: string | null;
    email: string;
  } | null;
};

interface StageHistoryTimelineProps {
  history: StageHistory[];
  className?: string;
}

export function StageHistoryTimeline({ history, className }: StageHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>ეტაპების ისტორია</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">ჯერ არ არის ჩანაწერები</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>ეტაპების ისტორია</CardTitle>
        <p className="text-sm text-muted-foreground">
          პროექტის ეტაპების შეცვლის სრული ისტორია
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Vertical line */}
          <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />

          {/* History items */}
          {history.map((item, index) => {
            const fromConfig = item.from_stage ? getStageConfig(item.from_stage) : null;
            const toConfig = item.to_stage ? getStageConfig(item.to_stage) : null;
            const isFirst = index === 0;

            return (
              <div key={item.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    isFirst
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border'
                  }`}
                >
                  <ArrowRight
                    className={`w-5 h-5 ${
                      isFirst ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    {/* Stage change */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {fromConfig && (
                        <Badge
                          variant="outline"
                          className={`${fromConfig.bgColor} ${fromConfig.color} ${fromConfig.borderColor}`}
                        >
                          {fromConfig.stage}
                        </Badge>
                      )}
                      {fromConfig && toConfig && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      {toConfig && (
                        <Badge
                          variant="outline"
                          className={`${toConfig.bgColor} ${toConfig.color} ${toConfig.borderColor}`}
                        >
                          {toConfig.stage}
                        </Badge>
                      )}
                      {!fromConfig && toConfig && (
                        <span className="text-sm text-muted-foreground">
                          პროექტი შეიქმნა
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: ka,
                          })}
                        </span>
                      </div>

                      {item.user && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{item.user.full_name || item.user.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{item.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Stage numbers */}
                    <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
                      {fromConfig && (
                        <span>
                          ეტაპი {fromConfig.number}
                        </span>
                      )}
                      {fromConfig && toConfig && <span>→</span>}
                      {toConfig && (
                        <span>
                          ეტაპი {toConfig.number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
