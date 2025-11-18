'use client';

import { useEffect, useState } from 'react';
import { Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AutomationRule,
  AutomationExecution,
  AutomationRuleWithExecutions,
} from '@/types/database.types';
import { getAutomationRule, getAutomationExecutions } from '@/lib/supabase/automation';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

interface AutomationRuleDetailProps {
  open: boolean;
  rule: AutomationRule;
  onClose: () => void;
}

export function AutomationRuleDetail({
  open,
  rule,
  onClose,
}: AutomationRuleDetailProps) {
  const [ruleDetails, setRuleDetails] = useState<AutomationRuleWithExecutions | null>(
    null
  );
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && rule.id) {
      loadRuleDetails();
    }
  }, [open, rule.id]);

  async function loadRuleDetails() {
    try {
      setLoading(true);
      const [details, execs] = await Promise.all([
        getAutomationRule(rule.id),
        getAutomationExecutions(rule.id, 20),
      ]);
      setRuleDetails(details);
      setExecutions(execs);
    } catch (error) {
      console.error('Error loading rule details:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      stage_enter: 'ეტაპზე შესვლა',
      stage_duration: 'ეტაპზე დარჩენის ხანგრძლივობა',
      time_scheduled: 'დაგეგმილი დრო',
      project_created: 'პროექტი შეიქმნა',
      payment_received: 'გადახდა მიღებულია',
      condition_met: 'პირობა დაკმაყოფილდა',
    };
    return labels[trigger] || trigger;
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      send_notification: 'შეტყობინების გაგზავნა',
      send_email: 'ელ. ფოსტის გაგზავნა',
      create_task: 'ამოცანის შექმნა',
      assign_team: 'გუნდის მინიჭება',
      move_stage: 'ეტაპის შეცვლა',
      flag_project: 'პროექტის მონიშვნა',
      generate_invoice: 'ინვოისის გენერაცია',
      create_reminder: 'შეხსენების შექმნა',
    };
    return labels[actionType] || actionType;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {rule.name}
          </DialogTitle>
          <DialogDescription>{rule.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Rule Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ზოგადი ინფორმაცია</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ტრიგერი:</span>
                  <Badge variant="outline">
                    {getTriggerLabel(rule.trigger_type)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">სტატუსი:</span>
                  <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                    {rule.is_active ? 'აქტიური' : 'არააქტიური'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">რეჟიმი:</span>
                  <Badge variant={rule.dry_run ? 'secondary' : 'default'}>
                    {rule.dry_run ? 'ტესტირება' : 'რეალური'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">შეიქმნა:</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(rule.created_at), {
                      addSuffix: true,
                      locale: ka,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trigger Config */}
            {rule.trigger_config && Object.keys(rule.trigger_config).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ტრიგერის კონფიგურაცია</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(rule.trigger_config).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                      >
                        <span className="text-muted-foreground">{key}:</span>
                        <Badge variant="outline">{String(value)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">მოქმედება</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {getActionLabel(rule.action_type)}
                        </p>
                        {rule.action_config && Object.keys(rule.action_config).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(rule.action_config).map(([key, value]) => (
                              <div
                                key={key}
                                className="text-xs text-muted-foreground"
                              >
                                <span className="font-medium">{key}:</span>{' '}
                                {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ბოლო შესრულებები</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    იტვირთება...
                  </p>
                ) : executions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    შესრულებები არ მოიძებნა
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>სტატუსი</TableHead>
                        <TableHead>პროექტი</TableHead>
                        <TableHead>დრო</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executions.map((execution) => (
                        <TableRow key={execution.id}>
                          <TableCell>
                            {execution.status === 'success' ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm">წარმატებული</span>
                              </div>
                            ) : execution.status === 'failed' ? (
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">წარუმატებელი</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm">გამოტოვებული</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {execution.project_id || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(execution.executed_at), {
                              addSuffix: true,
                              locale: ka,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
