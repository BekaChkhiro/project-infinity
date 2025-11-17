'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { showToast, toastMessages } from '@/lib/toast';
import { STAGE_CONFIGS, StageConfig } from '@/lib/stages';
import { Database } from '@/types/database.types';
import { cn } from '@/lib/utils';

type Project = Database['public']['Tables']['projects']['Row'] & {
  client?: {
    name: string;
  } | null;
};

interface KanbanBoardProps {
  projects: Project[];
  className?: string;
}

export function KanbanBoard({ projects: initialProjects, className }: KanbanBoardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState(initialProjects);
  const [isDragging, setIsDragging] = useState(false);

  // Group projects by stage
  const projectsByStage = STAGE_CONFIGS.reduce((acc, stage) => {
    acc[stage.number] = projects.filter((p) => p.stage_number === stage.number);
    return acc;
  }, {} as Record<number, Project[]>);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStageNumber = parseInt(source.droppableId);
    const destStageNumber = parseInt(destination.droppableId);

    // If stage changed, update the project
    if (sourceStageNumber !== destStageNumber) {
      const projectId = draggableId;
      const project = projects.find((p) => p.id === projectId);
      const targetStage = STAGE_CONFIGS.find((s) => s.number === destStageNumber);

      if (!project || !targetStage) return;

      // Optimistic update
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, current_stage: targetStage.stage, stage_number: targetStage.number }
            : p
        )
      );

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          showToast.error('მომხმარებელი არ არის ავტორიზებული');
          router.refresh();
          return;
        }

        // Update project
        const { error: updateError } = await supabase
          .from('projects')
          // @ts-ignore - Supabase client type inference issue
          .update({
            current_stage: targetStage.stage,
            stage_number: targetStage.number,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        if (updateError) throw updateError;

        // Create stage history
        const { error: historyError } = await supabase
          .from('stage_history')
          // @ts-ignore - Supabase client type inference issue
          .insert({
            project_id: projectId,
            from_stage: project.current_stage,
            to_stage: targetStage.stage,
            from_stage_number: project.stage_number,
            to_stage_number: targetStage.number,
            changed_by: user.id,
            notes: 'ეტაპი შეიცვალა Kanban დაფიდან',
          });

        if (historyError) throw historyError;

        showToast.success(toastMessages.project.stageChanged);
      } catch (error) {
        console.error('Error updating project stage:', error);
        showToast.error(toastMessages.project.error);
        router.refresh();
      }
    }
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 pb-4 min-w-max">
          {STAGE_CONFIGS.map((stageConfig) => (
            <StageColumn
              key={stageConfig.number}
              stageConfig={stageConfig}
              projects={projectsByStage[stageConfig.number] || []}
              isDragging={isDragging}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

interface StageColumnProps {
  stageConfig: StageConfig;
  projects: Project[];
  isDragging: boolean;
}

function StageColumn({ stageConfig, projects, isDragging }: StageColumnProps) {
  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full">
        <CardHeader className={cn('pb-3', stageConfig.bgColor, stageConfig.borderColor, 'border-b-2')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    stageConfig.bgColor,
                    stageConfig.color
                  )}
                >
                  {stageConfig.number}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {projects.length}
                </Badge>
              </div>
              <p className={cn('text-sm font-medium line-clamp-2', stageConfig.color)}>
                {stageConfig.stage}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stageConfig.phaseLabel}
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <Droppable droppableId={stageConfig.number.toString()}>
          {(provided, snapshot) => (
            <CardContent
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'p-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto',
                snapshot.isDraggingOver && 'bg-muted/50'
              )}
            >
              <div className="space-y-2">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    stageConfig={stageConfig}
                  />
                ))}
                {provided.placeholder}
              </div>

              {projects.length === 0 && !isDragging && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  პროექტები არ არის
                </div>
              )}
            </CardContent>
          )}
        </Droppable>
      </Card>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
  stageConfig: StageConfig;
}

function ProjectCard({ project, index, stageConfig }: ProjectCardProps) {
  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            className={cn(
              'cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
              snapshot.isDragging && 'shadow-lg rotate-2'
            )}
          >
            <CardContent className="p-4">
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="group"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>

                  {project.client && (
                    <p className="text-xs text-muted-foreground">
                      {project.client.name}
                    </p>
                  )}

                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(project.created_at), 'dd MMM', { locale: ka })}
                    </span>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
