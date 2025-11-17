'use client';

import { STAGE_CONFIGS } from '@/lib/stages';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StagePipelineProps {
  projectCounts: Record<number, number>;
}

export function StagePipeline({ projectCounts }: StagePipelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">პროექტების სტადიები</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAGE_CONFIGS.map((config) => {
          const count = projectCounts[config.number] || 0;
          
          return (
            <Card
              key={config.number}
              className={cn(
                'border-2 transition-all hover:shadow-md',
                config.borderColor
              )}
            >
              <CardContent className={cn('p-4', config.bgColor)}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{config.number}
                    </span>
                    <span className={cn('text-2xl font-bold', config.color)}>
                      {count}
                    </span>
                  </div>
                  <p className={cn('text-sm font-medium line-clamp-2', config.color)}>
                    {config.stage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.phaseLabel}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
