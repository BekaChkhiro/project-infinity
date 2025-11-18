'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { detectStuckProjects } from '@/lib/supabase/automation';
import { getUserPreferences } from '@/lib/supabase/preferences';
import { createClient } from '@/lib/supabase/client';

export function StuckProjectsWidget() {
  const [stuckProjects, setStuckProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(7);

  useEffect(() => {
    loadStuckProjects();
  }, []);

  async function loadStuckProjects() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get user's preferred threshold
        const preferences = await getUserPreferences(user.id);
        const userThreshold = preferences.stuck_project_threshold_days || 7;
        setThreshold(userThreshold);

        // Detect stuck projects
        const projects = await detectStuckProjects(userThreshold);
        setStuckProjects((projects as any[])?.slice(0, 5) || []); // Show top 5
      }
    } catch (error: any) {
      console.error('Error loading stuck projects:', error);
    } finally {
      setLoading(false);
    }
  }

  const getPriorityColor = (days: number) => {
    if (days >= 14) return 'destructive';
    if (days >= 10) return 'default';
    return 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            გაჩერებული პროექტები
          </CardTitle>
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
          <AlertCircle className="h-5 w-5 text-orange-600" />
          გაჩერებული პროექტები
          {stuckProjects.length > 0 && (
            <Badge variant="destructive">{stuckProjects.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stuckProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            გაჩერებული პროექტები არ არის
          </p>
        ) : (
          <div className="space-y-3">
            {stuckProjects.map((project: any) => (
              <Link
                key={project.project_id}
                href={`/dashboard/projects/${project.project_id}`}
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {project.project_title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.client_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.current_stage}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getPriorityColor(project.days_in_stage)}>
                      <Clock className="h-3 w-3 mr-1" />
                      {project.days_in_stage} დღე
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
            {stuckProjects.length >= 5 && (
              <Link href="/dashboard/projects?filter=stuck">
                <Button variant="ghost" className="w-full">
                  ყველას ნახვა
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
