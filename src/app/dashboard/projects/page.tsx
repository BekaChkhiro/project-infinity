import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { ProjectsViewSwitcher } from '@/components/projects/projects-view-switcher';
import { Plus } from 'lucide-react';
import type { User, Project, Client } from '@/types/database.types';

type ProjectWithClient = Project & {
  clients: Pick<Client, 'name'> | null;
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single() as { data: User | null };

  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('updated_at', { ascending: false }) as { data: ProjectWithClient[] | null };

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">პროექტები</h2>
            <p className="text-muted-foreground">
              მართეთ და თვალყური ადევნეთ ყველა პროექტს
            </p>
          </div>
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ახალი პროექტი
            </Button>
          </Link>
        </div>

        <ProjectsViewSwitcher projects={projects || []} />
      </div>
    </DashboardLayout>
  );
}
