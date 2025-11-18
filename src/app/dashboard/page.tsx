import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StagePipeline } from '@/components/dashboard/stage-pipeline';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { FolderKanban, Code, DollarSign, CheckCircle, List } from 'lucide-react';
import { startOfMonth } from 'date-fns';
import type { User, Project, StageHistory } from '@/types/database.types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single() as { data: User | null };

  // Fetch all projects for statistics
  const { data: allProjects } = await supabase
    .from('projects')
    .select('current_stage, stage_number, completion_date') as {
    data: Pick<Project, 'current_stage' | 'stage_number' | 'completion_date'>[] | null;
  };

  const totalProjects = allProjects?.length || 0;

  // Projects in development (stages 6-11)
  const projectsInDevelopment = allProjects?.filter(
    (p) => p.stage_number >= 6 && p.stage_number <= 11
  ).length || 0;

  // Awaiting payment (stages 14-16)
  const awaitingPayment = allProjects?.filter(
    (p) => p.stage_number >= 14 && p.stage_number <= 16
  ).length || 0;

  // Completed this month
  const startOfThisMonth = startOfMonth(new Date()).toISOString();
  const completedThisMonth = allProjects?.filter(
    (p) => p.completion_date && p.completion_date >= startOfThisMonth
  ).length || 0;

  // Count projects per stage
  const projectCounts: Record<number, number> = {};
  allProjects?.forEach((project) => {
    const stageNum = project.stage_number;
    projectCounts[stageNum] = (projectCounts[stageNum] || 0) + 1;
  });

  const stats = [
    {
      title: 'სულ აქტიური პროექტები',
      value: totalProjects,
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'დეველოპმენტში',
      value: projectsInDevelopment,
      icon: Code,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'ელოდება გადახდას',
      value: awaitingPayment,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'დასრულდა ამ თვეში',
      value: completedThisMonth,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  // Fetch recent activity (last 10 stage changes)
  const { data: recentActivity } = await supabase
    .from('stage_history')
    .select('*, projects(title)')
    .order('created_at', { ascending: false })
    .limit(10) as { data: (StageHistory & { projects: Pick<Project, 'title'> | null })[] | null };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">მთავარი</h2>
            <p className="text-muted-foreground">
              მოგესალმებით, {profile?.full_name || user?.email || 'მომხმარებელი'}!
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/projects">
              <Button variant="outline">
                <List className="mr-2 h-4 w-4" />
                ყველა პროექტი
              </Button>
            </Link>
            <ProjectFormDialog />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <StagePipeline projectCounts={projectCounts} />

        <ActivityFeed activities={recentActivity || []} />
      </div>
  );
}
