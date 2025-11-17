'use client';

import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  FileText,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/types/database.types';
import { getStageConfig } from '@/lib/stages';

type Project = Database['public']['Tables']['projects']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type StageHistory = Database['public']['Tables']['stage_history']['Row'];

interface ProjectInfoCardsProps {
  project: Project;
  client: Client | null;
  stageHistory: StageHistory[];
  className?: string;
}

export function ProjectInfoCards({
  project,
  client,
  stageHistory,
  className,
}: ProjectInfoCardsProps) {
  const currentStageConfig = getStageConfig(project.current_stage);

  // Calculate time metrics
  const createdDate = new Date(project.created_at);
  const totalDays = differenceInDays(new Date(), createdDate);

  // Calculate days in current stage
  const currentStageEntry = stageHistory.find(
    (h) => h.to_stage === project.current_stage
  );
  const daysInCurrentStage = currentStageEntry
    ? differenceInDays(new Date(), new Date(currentStageEntry.created_at))
    : 0;

  // Calculate average days per stage
  const averageDaysPerStage =
    project.stage_number > 0 ? Math.round(totalDays / project.stage_number) : 0;

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Project Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              პროექტის დეტალები
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                სახელი
              </p>
              <p className="font-medium">{project.title}</p>
            </div>

            {project.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  აღწერა
                </p>
                <p className="text-sm">{project.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                მიმდინარე ეტაპი
              </p>
              {currentStageConfig && (
                <Badge
                  variant="outline"
                  className={`${currentStageConfig.bgColor} ${currentStageConfig.color} ${currentStageConfig.borderColor}`}
                >
                  {currentStageConfig.stage}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                ეტაპი {project.stage_number} / 18
              </p>
            </div>

            {project.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  შენიშვნები
                </p>
                <p className="text-sm">{project.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              კლიენტის ინფორმაცია
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    სახელი
                  </p>
                  <p className="font-medium">{client.name}</p>
                </div>

                {client.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      ელ. ფოსტა
                    </p>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {client.email}
                    </a>
                  </div>
                )}

                {client.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      ტელეფონი
                    </p>
                    <a
                      href={`tel:${client.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {client.phone}
                    </a>
                  </div>
                )}

                {client.company && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      კომპანია
                    </p>
                    <p className="text-sm">{client.company}</p>
                  </div>
                )}

                {client.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      შენიშვნები
                    </p>
                    <p className="text-sm text-muted-foreground">{client.notes}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                კლიენტის ინფორმაცია არ არის
              </p>
            )}
          </CardContent>
        </Card>

        {/* Time Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              დროის მეტრიკა
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                შექმნის თარიღი
              </p>
              <p className="text-sm font-medium">
                {format(createdDate, 'PPP', { locale: ka })}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(createdDate, { addSuffix: true, locale: ka })}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                სულ დღეები
              </p>
              <p className="text-2xl font-bold">{totalDays}</p>
              <p className="text-xs text-muted-foreground">დღე პროექტზე მუშაობა</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                მიმდინარე ეტაპში
              </p>
              <p className="text-xl font-bold text-primary">{daysInCurrentStage}</p>
              <p className="text-xs text-muted-foreground">დღე ამ ეტაპზე</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                საშუალო პროგრესი
              </p>
              <p className="text-lg font-semibold">{averageDaysPerStage}</p>
              <p className="text-xs text-muted-foreground">
                დღე თითო ეტაპისთვის
              </p>
            </div>

            {project.deadline && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  ვადა
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(project.deadline), 'PPP', { locale: ka })}
                </p>
              </div>
            )}

            {project.completion_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  დასრულების თარიღი
                </p>
                <p className="text-sm font-medium text-green-600">
                  {format(new Date(project.completion_date), 'PPP', { locale: ka })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Card (if budget exists) */}
        {(project.budget || project.paid_amount > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                ბიუჯეტი და გადახდა
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.budget && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    ბიუჯეტი
                  </p>
                  <p className="text-2xl font-bold">₾{project.budget.toLocaleString()}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  გადახდილი
                </p>
                <p className="text-xl font-semibold text-green-600">
                  ₾{project.paid_amount.toLocaleString()}
                </p>
              </div>

              {project.budget && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    დარჩენილი
                  </p>
                  <p className="text-lg font-medium text-orange-600">
                    ₾{(project.budget - project.paid_amount).toLocaleString()}
                  </p>
                </div>
              )}

              {project.budget && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">პროგრესი</span>
                    <span className="text-xs font-medium">
                      {Math.round((project.paid_amount / project.budget) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${Math.min((project.paid_amount / project.budget) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
