'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProjectsRequiringAction } from '@/lib/supabase/automation';
import { ProjectRequiringAction } from '@/types/database.types';

export function RequiredActionsWidget() {
  const [projects, setProjects] = useState<ProjectRequiringAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getProjectsRequiringAction();
      // Show only critical and high priority
      const urgent = data.filter(
        (p: any) => p.priority === 'critical' || p.priority === 'high'
      );
      setProjects(urgent.slice(0, 5));
    } catch (error: any) {
      console.error('Error loading projects requiring action:', error);
    } finally {
      setLoading(false);
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'კრიტიკული';
      case 'high':
        return 'მაღალი';
      case 'medium':
        return 'საშუალო';
      default:
        return 'დაბალი';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>საჭირო მოქმედებები</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">იტვირთება...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          საჭირო მოქმედებები
          {projects.length > 0 && (
            <Badge variant="default">{projects.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            გასაკეთებელი არაფერია
          </p>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getPriorityIcon(project.priority)}
                      <p className="font-medium text-sm truncate">
                        {project.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {project.current_stage} • {project.days_in_current_stage} დღე
                    </p>
                    {project.client_name && (
                      <p className="text-xs text-muted-foreground">
                        {project.client_name}
                      </p>
                    )}
                  </div>
                  <Badge variant={project.priority === 'critical' ? 'destructive' : 'default'}>
                    {getPriorityLabel(project.priority)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
