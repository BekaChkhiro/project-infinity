'use client';

import { useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectsTable } from '@/components/dashboard/projects-table';
import { KanbanBoard } from './kanban-board';
import { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'] & {
  clients?: {
    name: string;
  } | null;
  client?: {
    name: string;
  } | null;
};

interface ProjectsViewSwitcherProps {
  projects: Project[];
}

export function ProjectsViewSwitcher({ projects }: ProjectsViewSwitcherProps) {
  const [view, setView] = useState<'list' | 'kanban'>('list');

  // Normalize the data structure for both views
  const normalizedProjects = projects.map((p) => ({
    ...p,
    client: p.clients || p.client,
  }));

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('list')}
        >
          <List className="w-4 h-4 mr-2" />
          სია
        </Button>
        <Button
          variant={view === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('kanban')}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Kanban
        </Button>
      </div>

      {/* Views */}
      {view === 'list' ? (
        <ProjectsTable initialProjects={normalizedProjects} />
      ) : (
        <KanbanBoard projects={normalizedProjects} />
      )}
    </div>
  );
}
