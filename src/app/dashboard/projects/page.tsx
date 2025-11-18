import { createClient } from '@/lib/supabase/server';
import { ProjectsViewSwitcher } from '@/components/projects/projects-view-switcher';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import type { Project, Client } from '@/types/database.types';

type ProjectWithClient = Project & {
  clients: Pick<Client, 'name'> | null;
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('updated_at', { ascending: false }) as { data: ProjectWithClient[] | null };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">პროექტები</h2>
            <p className="text-muted-foreground">
              მართეთ და თვალყური ადევნეთ ყველა პროექტს
            </p>
          </div>
          <ProjectFormDialog />
        </div>

        <ProjectsViewSwitcher projects={projects || []} />
      </div>
  );
}
