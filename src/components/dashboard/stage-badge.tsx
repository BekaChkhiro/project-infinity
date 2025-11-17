import { ProjectStage } from '@/types/database.types';
import { getStageConfig } from '@/lib/stages';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StageBadgeProps {
  stage: ProjectStage;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const config = getStageConfig(stage);
  
  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {stage}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {stage}
    </Badge>
  );
}
