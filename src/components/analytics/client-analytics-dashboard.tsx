'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getAllClientPaymentAnalytics,
  getMostFrequentStuckStage,
} from '@/lib/supabase/clients';
import { createClient } from '@/lib/supabase/client';
import { ClientPaymentAnalytics, Project } from '@/types/database.types';
import { showToast } from '@/lib/toast';

export function ClientAnalyticsDashboard() {
  const supabase = createClient();
  const [analytics, setAnalytics] = useState<ClientPaymentAnalytics[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stuckStageData, setStuckStageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const [analyticsData, stuckData, projectsData] = await Promise.all([
        getAllClientPaymentAnalytics(),
        getMostFrequentStuckStage(),
        supabase.from('projects').select('*'),
      ]);

      setAnalytics(analyticsData);
      setStuckStageData(stuckData);
      if (projectsData.data) setProjects(projectsData.data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      showToast.error('ანალიტიკის ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  }

  // Calculate overall metrics
  const totalClients = analytics.length;
  const totalRevenue = analytics.reduce((sum, a) => sum + a.total_budget, 0);
  const totalPaid = analytics.reduce((sum, a) => sum + a.total_paid, 0);
  const avgDuration =
    analytics
      .filter((a) => a.avg_project_duration_days !== null)
      .reduce((sum, a) => sum + (a.avg_project_duration_days || 0), 0) /
    analytics.filter((a) => a.avg_project_duration_days !== null).length;

  const totalProjects = analytics.reduce((sum, a) => sum + a.total_projects, 0);
  const totalCompleted = analytics.reduce((sum, a) => sum + a.completed_projects, 0);
  const successRate = totalProjects > 0 ? (totalCompleted / totalProjects) * 100 : 0;

  const avgPaymentPunctuality =
    analytics.reduce((sum, a) => sum + a.payment_punctuality_score, 0) / analytics.length;

  // Top clients by revenue
  const topClients = [...analytics]
    .sort((a, b) => b.total_budget - a.total_budget)
    .slice(0, 10);

  // Clients with best payment punctuality
  const bestPayingClients = [...analytics]
    .filter((a) => a.total_projects >= 2)
    .sort((a, b) => b.payment_punctuality_score - a.payment_punctuality_score)
    .slice(0, 5);

  // Clients with most projects
  const mostActiveClients = [...analytics]
    .sort((a, b) => b.total_projects - a.total_projects)
    .slice(0, 5);

  if (loading) {
    return <div className="text-center py-12">იტვირთება...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">სულ კლიენტები</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">სულ შემოსავალი</p>
                <p className="text-2xl font-bold">
                  {totalRevenue.toLocaleString('ka-GE')} ₾
                </p>
                <p className="text-xs text-muted-foreground">
                  გადახდილი: {totalPaid.toLocaleString('ka-GE')} ₾
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">წარმატების კოეფიციენტი</p>
                <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {totalCompleted} / {totalProjects} პროექტი
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">საშ. ხანგრძლივობა</p>
                <p className="text-2xl font-bold">
                  {isNaN(avgDuration) ? '-' : `${Math.round(avgDuration)} დღე`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Punctuality */}
      <Card>
        <CardHeader>
          <CardTitle>საშუალო გადახდის პუნქტუალურობის ქულა</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className={`text-4xl font-bold ${
                avgPaymentPunctuality >= 80
                  ? 'text-green-600'
                  : avgPaymentPunctuality >= 50
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {avgPaymentPunctuality.toFixed(1)}%
            </div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    avgPaymentPunctuality >= 80
                      ? 'bg-green-600'
                      : avgPaymentPunctuality >= 50
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${avgPaymentPunctuality}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ეფუძნება პროექტების გადახდის ისტორიას
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stuck Stage */}
      {stuckStageData && stuckStageData.stage && (
        <Card>
          <CardHeader>
            <CardTitle>ყველაზე პრობლემური სტადია</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="font-semibold text-lg">{stuckStageData.stage}</p>
                <p className="text-sm text-muted-foreground">
                  {stuckStageData.count} პროექტი ამ სტადიაში 14+ დღეა
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Clients by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>ტოპ კლიენტები შემოსავლის მიხედვით</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>კლიენტი</TableHead>
                  <TableHead>პროექტები</TableHead>
                  <TableHead>დასრულებული</TableHead>
                  <TableHead>შემოსავალი</TableHead>
                  <TableHead>გადახდილი</TableHead>
                  <TableHead>პუნქტუალურობა</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((client, index) => (
                  <TableRow key={client.client_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{client.client_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{client.total_projects}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {client.completed_projects}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {client.total_budget.toLocaleString('ka-GE')} ₾
                    </TableCell>
                    <TableCell>
                      {client.total_paid.toLocaleString('ka-GE')} ₾
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          client.payment_punctuality_score >= 80
                            ? 'default'
                            : client.payment_punctuality_score >= 50
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {client.payment_punctuality_score.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/clients/${client.client_id}`}>
                        <Button variant="ghost" size="sm">
                          ნახვა
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Best Paying Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>საუკეთესო გადამხდელი კლიენტები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestPayingClients.map((client, index) => (
                <div key={client.client_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{client.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.total_projects} პროექტი
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600">
                      {client.payment_punctuality_score.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Active Clients */}
        <Card>
          <CardHeader>
            <CardTitle>ყველაზე აქტიური კლიენტები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostActiveClients.map((client, index) => (
                <div key={client.client_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{client.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.completed_projects} დასრულებული
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{client.total_projects} პროექტი</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Project Duration per Client */}
      <Card>
        <CardHeader>
          <CardTitle>საშუალო პროექტის ხანგრძლივობა კლიენტების მიხედვით</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics
              .filter((a) => a.avg_project_duration_days !== null)
              .sort(
                (a, b) =>
                  (a.avg_project_duration_days || 0) - (b.avg_project_duration_days || 0)
              )
              .slice(0, 10)
              .map((client) => (
                <div key={client.client_id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{client.client_name}</span>
                      <span className="text-sm font-semibold">
                        {Math.round(client.avg_project_duration_days || 0)} დღე
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            ((client.avg_project_duration_days || 0) / 120) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
