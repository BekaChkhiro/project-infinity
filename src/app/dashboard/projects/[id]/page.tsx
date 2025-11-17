import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StageProgressionTimeline } from '@/components/projects/stage-progression-timeline';
import { StageHistoryTimeline } from '@/components/projects/stage-history-timeline';
import { ProjectInfoCards } from '@/components/projects/project-info-cards';
import { QuickStageChange } from '@/components/projects/quick-stage-change';
import { ProjectActions } from '@/components/projects/project-actions';
import { getStageConfig } from '@/lib/stages';
import type { Project, Client } from '@/types/database.types';

type ProjectWithClient = Project & {
  client: Client | null;
};

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Fetch project with client data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('id', params.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  const projectWithClient = project as unknown as ProjectWithClient;

  // Fetch stage history with user data
  const { data: stageHistory } = await supabase
    .from('stage_history')
    .select(`
      *,
      user:users!stage_history_changed_by_fkey(full_name, email)
    `)
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  const currentStageConfig = getStageConfig(projectWithClient.current_stage);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            უკან პროექტებზე
          </Button>
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">{projectWithClient.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {currentStageConfig && (
                <Badge
                  variant="outline"
                  className={`${currentStageConfig.bgColor} ${currentStageConfig.color} ${currentStageConfig.borderColor} text-sm`}
                >
                  {currentStageConfig.stage}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                ეტაპი {projectWithClient.stage_number} / 18
              </span>
              {projectWithClient.client && (
                <span className="text-sm text-muted-foreground">
                  კლიენტი: <span className="font-medium">{projectWithClient.client.name}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <QuickStageChange
              projectId={projectWithClient.id}
              currentStage={projectWithClient.current_stage}
              currentStageNumber={projectWithClient.stage_number}
            />
            <ProjectActions projectId={projectWithClient.id} projectTitle={projectWithClient.title} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - Stage progression */}
        <div className="lg:col-span-1">
          <StageProgressionTimeline
            currentStage={projectWithClient.current_stage}
            currentStageNumber={projectWithClient.stage_number}
          />
        </div>

        {/* Right column - Info and history */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Info Cards */}
          <ProjectInfoCards
            project={projectWithClient}
            client={projectWithClient.client}
            stageHistory={stageHistory || []}
          />

          {/* Stage History */}
          <StageHistoryTimeline history={stageHistory || []} />
        </div>
      </div>
    </div>
  );
}
