'use client';

import { Check } from 'lucide-react';
import { STAGE_CONFIGS } from '@/lib/stages';
import { ProjectStage } from '@/types/database.types';
import { cn } from '@/lib/utils';

interface StageProgressionTimelineProps {
  currentStage: ProjectStage;
  currentStageNumber: number;
  onStageClick?: (stageNumber: number, stage: ProjectStage) => void;
  className?: string;
}

export function StageProgressionTimeline({
  currentStage,
  currentStageNumber,
  onStageClick,
  className,
}: StageProgressionTimelineProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold mb-4">პროექტის პროგრესი</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Stages */}
          <div className="space-y-4">
            {STAGE_CONFIGS.map((config, index) => {
              const isCompleted = config.number < currentStageNumber;
              const isCurrent = config.number === currentStageNumber;
              const isFuture = config.number > currentStageNumber;

              return (
                <div key={config.number} className="relative flex items-start gap-4">
                  {/* Stage indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all',
                        isCompleted && 'bg-green-500 border-green-500',
                        isCurrent && config.bgColor + ' ' + config.borderColor + ' border-4',
                        isFuture && 'bg-muted border-muted-foreground/20'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            isCurrent && config.color,
                            isFuture && 'text-muted-foreground'
                          )}
                        >
                          {config.number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stage content */}
                  <button
                    onClick={() => onStageClick?.(config.number, config.stage)}
                    disabled={!onStageClick}
                    className={cn(
                      'flex-1 text-left p-4 rounded-lg border transition-all',
                      isCompleted && 'bg-green-50 border-green-200 hover:bg-green-100',
                      isCurrent && config.bgColor + ' ' + config.borderColor + ' border-2',
                      isFuture && 'bg-muted/50 border-muted-foreground/20',
                      onStageClick && 'cursor-pointer hover:shadow-md',
                      !onStageClick && 'cursor-default'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              isCompleted && 'bg-green-100 text-green-700',
                              isCurrent && config.bgColor + ' ' + config.color,
                              isFuture && 'bg-muted text-muted-foreground'
                            )}
                          >
                            {config.phaseLabel}
                          </span>
                          {isCurrent && (
                            <span className="text-xs font-semibold text-primary">
                              მიმდინარე ეტაპი
                            </span>
                          )}
                        </div>
                        <h4
                          className={cn(
                            'text-sm font-medium',
                            isCompleted && 'text-green-900',
                            isCurrent && config.color,
                            isFuture && 'text-muted-foreground'
                          )}
                        >
                          {config.stage}
                        </h4>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        {['sales', 'development', 'payment', 'completion'].map((phase) => {
          const phaseStages = STAGE_CONFIGS.filter((s) => s.phase === phase);
          const completedInPhase = phaseStages.filter(
            (s) => s.number < currentStageNumber
          ).length;
          const totalInPhase = phaseStages.length;
          const progress = (completedInPhase / totalInPhase) * 100;

          const phaseLabels = {
            sales: 'პირველადი',
            development: 'დეველოპმენტი',
            payment: 'გადახდა',
            completion: 'დასრული',
          };

          const phaseColors = {
            sales: 'text-gray-700',
            development: 'text-green-700',
            payment: 'text-orange-700',
            completion: 'text-purple-700',
          };

          return (
            <div key={phase} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn('text-sm font-medium', phaseColors[phase as keyof typeof phaseColors])}>
                  {phaseLabels[phase as keyof typeof phaseLabels]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {completedInPhase}/{totalInPhase}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all',
                    phase === 'sales' && 'bg-gray-500',
                    phase === 'development' && 'bg-green-500',
                    phase === 'payment' && 'bg-orange-500',
                    phase === 'completion' && 'bg-purple-500'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
