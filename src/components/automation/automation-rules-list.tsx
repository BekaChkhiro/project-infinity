'use client';

import { useEffect, useState } from 'react';
import { Zap, Play, Pause, Trash2, Edit, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { AutomationRule } from '@/types/database.types';
import {
  getAutomationRules,
  deleteAutomationRule,
  toggleAutomationRule,
  toggleDryRun,
} from '@/lib/supabase/automation';
import { showToast } from '@/lib/toast';
import { AutomationRuleCreator } from './automation-rule-creator';
import { AutomationRuleDetail } from './automation-rule-detail';

export function AutomationRulesList() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      setLoading(true);
      const data = await getAutomationRules();
      setRules(data);
    } catch (error: any) {
      console.error('Error loading rules:', error);
      showToast.error('წესების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await toggleAutomationRule(id, !currentState);
      setRules(
        rules.map((rule) =>
          rule.id === id ? { ...rule, is_active: !currentState } : rule
        )
      );
      showToast.success(
        currentState ? 'წესი გამოირთო' : 'წესი ჩაირთო'
      );
    } catch (error: any) {
      console.error('Error toggling rule:', error);
      showToast.error('მოქმედება ვერ შესრულდა');
    }
  };

  const handleToggleDryRun = async (id: string, currentState: boolean) => {
    try {
      await toggleDryRun(id, !currentState);
      setRules(
        rules.map((rule) =>
          rule.id === id ? { ...rule, dry_run: !currentState } : rule
        )
      );
      showToast.success(
        currentState
          ? 'ტესტირების რეჟიმი გამოირთო'
          : 'ტესტირების რეჟიმი ჩაირთო'
      );
    } catch (error: any) {
      console.error('Error toggling dry run:', error);
      showToast.error('მოქმედება ვერ შესრულდა');
    }
  };

  const handleDelete = async () => {
    if (!ruleToDelete) return;

    try {
      await deleteAutomationRule(ruleToDelete);
      setRules(rules.filter((rule) => rule.id !== ruleToDelete));
      showToast.success('წესი წაიშალა');
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      showToast.error('წაშლა ვერ მოხერხდა');
    }
  };

  const openDeleteDialog = (id: string) => {
    setRuleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const openDetail = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setDetailOpen(true);
  };

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

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">იტვირთება...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              ავტომატიზაციის წესები
              <Badge variant="secondary">{rules.length}</Badge>
            </CardTitle>
            <Button onClick={() => setCreatorOpen(true)}>
              <Zap className="h-4 w-4 mr-2" />
              ახალი წესი
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                ავტომატიზაციის წესები არ არის დამატებული
              </p>
              <Button onClick={() => setCreatorOpen(true)}>
                <Zap className="h-4 w-4 mr-2" />
                პირველი წესის შექმნა
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>სახელი</TableHead>
                  <TableHead>ტრიგერი</TableHead>
                  <TableHead>სტატუსი</TableHead>
                  <TableHead>რეჟიმი</TableHead>
                  <TableHead>შესრულებები</TableHead>
                  <TableHead className="text-right">მოქმედებები</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTriggerLabel(rule.trigger_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() =>
                            handleToggleActive(rule.id, rule.is_active)
                          }
                        />
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'აქტიური' : 'არააქტიური'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.dry_run ? (
                        <Badge variant="secondary">ტესტირება</Badge>
                      ) : (
                        <Badge variant="default">რეალური</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">-</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetail(rule)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleDryRun(rule.id, rule.dry_run)}
                          title={
                            rule.dry_run
                              ? 'რეალურ რეჟიმზე გადასვლა'
                              : 'ტესტირების რეჟიმზე გადასვლა'
                          }
                        >
                          {rule.dry_run ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AutomationRuleCreator
        open={creatorOpen}
        onClose={() => setCreatorOpen(false)}
        onCreated={loadRules}
      />

      {selectedRule && (
        <AutomationRuleDetail
          open={detailOpen}
          rule={selectedRule}
          onClose={() => {
            setDetailOpen(false);
            setSelectedRule(null);
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>დარწმუნებული ხართ?</AlertDialogTitle>
            <AlertDialogDescription>
              ეს მოქმედება შეუქცევადია. წესი სამუდამოდ წაიშლება.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>გაუქმება</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              წაშლა
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
