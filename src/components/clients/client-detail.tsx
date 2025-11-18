'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building2,
  MapPin,
  MessageSquare,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getClientWithProjects,
  getClientTimeline,
  getClientPaymentAnalytics,
} from '@/lib/supabase/clients';
import { Client, Project, ClientPaymentAnalytics } from '@/types/database.types';
import { getStageConfig } from '@/lib/stages';
import { showToast } from '@/lib/toast';

interface ClientDetailContentProps {
  clientId: string;
  initialClient: Client;
}

export function ClientDetailContent({ clientId, initialClient }: ClientDetailContentProps) {
  const router = useRouter();
  const [client, setClient] = useState(initialClient);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<ClientPaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  async function loadClientData() {
    try {
      const [clientData, timelineData, analyticsData] = await Promise.all([
        getClientWithProjects(clientId),
        getClientTimeline(clientId),
        getClientPaymentAnalytics(clientId),
      ]);

      setClient(clientData);
      setProjects(clientData.projects || []);
      setTimeline(timelineData);
      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error('Error loading client data:', error);
      showToast.error('მონაცემების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  }

  const getCommunicationIcon = (method: string | null) => {
    switch (method) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'whatsapp':
      case 'telegram':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCommunicationLabel = (method: string | null) => {
    switch (method) {
      case 'email':
        return 'ელ. ფოსტა';
      case 'phone':
        return 'ტელეფონი';
      case 'whatsapp':
        return 'WhatsApp';
      case 'telegram':
        return 'Telegram';
      default:
        return '-';
    }
  };

  const activeProjects = projects.filter((p) => p.stage_number < 18);
  const completedProjects = projects.filter((p) => p.stage_number === 18);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">იტვირთება...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/clients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            {client.company && (
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {client.company}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/clients/${clientId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              რედაქტირება
            </Button>
          </Link>
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>საკონტაქტო ინფორმაცია</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ელ. ფოსტა</p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {client.email || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ტელეფონი</p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {client.phone || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">მისამართი</p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {client.address || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">სასურველი კომუნიკაცია</p>
            <p className="flex items-center gap-2">
              {getCommunicationIcon(client.preferred_communication_method)}
              {getCommunicationLabel(client.preferred_communication_method)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">სულ პროექტები</p>
                  <p className="text-2xl font-bold">{analytics.total_projects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">დასრულებული</p>
                  <p className="text-2xl font-bold">{analytics.completed_projects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">სულ შემოსავალი</p>
                  <p className="text-2xl font-bold">
                    {analytics.total_budget?.toLocaleString('ka-GE')} ₾
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
                    {analytics.avg_project_duration_days
                      ? `${Math.round(analytics.avg_project_duration_days)} დღე`
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>სწრაფი მოქმედებები</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <ProjectFormDialog prefilledClientId={clientId} onSuccess={loadClientData} />
          {client.email && (
            <Button variant="outline" onClick={() => window.open(`mailto:${client.email}`)}>
              <Mail className="h-4 w-4 mr-2" />
              გაგზავნა ელ. ფოსტა
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle>პროექტები</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                ამ კლიენტს არ აქვს პროექტები
              </p>
              <ProjectFormDialog prefilledClientId={clientId} onSuccess={loadClientData} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Projects */}
              {activeProjects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    აქტიური პროექტები ({activeProjects.length})
                  </h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>პროექტი</TableHead>
                          <TableHead>სტატუსი</TableHead>
                          <TableHead>ბიუჯეტი</TableHead>
                          <TableHead>შეიქმნა</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeProjects.map((project) => {
                          const stageConfig = getStageConfig(project.current_stage);
                          return (
                            <TableRow key={project.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{project.title}</div>
                                  {project.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                      {project.description}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {stageConfig && (
                                  <Badge
                                    variant="outline"
                                    className={`${stageConfig.bgColor} ${stageConfig.borderColor}`}
                                  >
                                    <span className={stageConfig.color}>
                                      {project.current_stage}
                                    </span>
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {project.budget
                                  ? `${project.budget.toLocaleString('ka-GE')} ₾`
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {format(new Date(project.created_at), 'dd MMM yyyy', {
                                  locale: ka,
                                })}
                              </TableCell>
                              <TableCell>
                                <Link href={`/dashboard/projects/${project.id}`}>
                                  <Button variant="ghost" size="sm">
                                    ნახვა
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Completed Projects */}
              {completedProjects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    დასრულებული პროექტები ({completedProjects.length})
                  </h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>პროექტი</TableHead>
                          <TableHead>ბიუჯეტი</TableHead>
                          <TableHead>გადახდილი</TableHead>
                          <TableHead>დასრულდა</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div className="font-medium">{project.title}</div>
                            </TableCell>
                            <TableCell>
                              {project.budget
                                ? `${project.budget.toLocaleString('ka-GE')} ₾`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {project.paid_amount
                                ? `${project.paid_amount.toLocaleString('ka-GE')} ₾`
                                : '0 ₾'}
                            </TableCell>
                            <TableCell>
                              {project.completion_date
                                ? format(new Date(project.completion_date), 'dd MMM yyyy', {
                                    locale: ka,
                                  })
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Link href={`/dashboard/projects/${project.id}`}>
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
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ინტერაქციების ისტორია</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.slice(0, 10).map((item, index) => {
                const stageConfig = getStageConfig(item.to_stage);
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${stageConfig?.bgColor || 'bg-gray-200'}`} />
                      {index < timeline.slice(0, 10).length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{item.to_stage}</p>
                        {stageConfig && (
                          <Badge
                            variant="outline"
                            className={`${stageConfig.bgColor} ${stageConfig.borderColor}`}
                          >
                            <span className={stageConfig.color}>{stageConfig.phaseLabel}</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        პროექტი: {item.project?.title}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', {
                          locale: ka,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle>შენიშვნები</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
