'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewAutomationRule } from '@/types/database.types';
import { createAutomationRule } from '@/lib/supabase/automation';
import { showToast, toastMessages } from '@/lib/toast';

interface AutomationRuleCreatorProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AutomationRuleCreator({
  open,
  onClose,
  onCreated,
}: AutomationRuleCreatorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<string>('');
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>({});
  const [actionType, setActionType] = useState<string>('');
  const [actionConfig, setActionConfig] = useState<Record<string, any>>({});
  const [isActive, setIsActive] = useState(true);
  const [dryRun, setDryRun] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerOptions = [
    { value: 'stage_enter', label: 'ეტაპზე შესვლა' },
    { value: 'stage_duration', label: 'ეტაპზე დარჩენის ხანგრძლივობა' },
    { value: 'time_scheduled', label: 'დაგეგმილი დრო' },
    { value: 'project_created', label: 'პროექტი შეიქმნა' },
    { value: 'payment_received', label: 'გადახდა მიღებულია' },
    { value: 'condition_met', label: 'პირობა დაკმაყოფილდა' },
  ];

  const actionOptions = [
    { value: 'send_notification', label: 'შეტყობინების გაგზავნა' },
    { value: 'send_email', label: 'ელ. ფოსტის გაგზავნა' },
    { value: 'create_task', label: 'ამოცანის შექმნა' },
    { value: 'assign_team', label: 'გუნდის მინიჭება' },
    { value: 'move_stage', label: 'ეტაპის შეცვლა' },
    { value: 'flag_project', label: 'პროექტის მონიშვნა' },
    { value: 'generate_invoice', label: 'ინვოისის გენერაცია' },
    { value: 'create_reminder', label: 'შეხსენების შექმნა' },
  ];

  const updateTriggerConfig = (key: string, value: any) => {
    setTriggerConfig({ ...triggerConfig, [key]: value });
  };

  const updateActionConfig = (key: string, value: any) => {
    setActionConfig({ ...actionConfig, [key]: value });
  };

  const handleSubmit = async () => {
    if (!name || !triggerType || !actionType) {
      showToast.error('გთხოვთ შეავსოთ ყველა სავალდებულო ველი');
      return;
    }

    setLoading(true);
    try {
      const rule: NewAutomationRule = {
        name,
        description: description || null,
        trigger_type: triggerType as any,
        trigger_config: triggerConfig,
        action_type: actionType as any,
        action_config: actionConfig,
        is_active: isActive,
        dry_run: dryRun,
      };

      await createAutomationRule(rule);
      showToast.success('ავტომატიზაციის წესი წარმატებით შეიქმნა');
      onCreated();
      handleClose();
    } catch (error: any) {
      console.error('Error creating rule:', error);
      showToast.error(error.message || toastMessages.generic.error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setTriggerType('');
    setTriggerConfig({});
    setActionType('');
    setActionConfig({});
    setIsActive(true);
    setDryRun(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ახალი ავტომატიზაციის წესი</DialogTitle>
          <DialogDescription>
            შექმენით ავტომატური მოქმედება პროექტების მართვისთვის
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">სახელი *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="მაგ: გააფრთხილე გადახდის შეფერხებაზე"
              />
            </div>

            <div>
              <Label htmlFor="description">აღწერა</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="აღწერეთ რას აკეთებს ეს წესი"
                rows={2}
              />
            </div>
          </div>

          {/* Trigger */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ტრიგერი (როდის) *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ტრიგერის ტიპი</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ ტრიგერი" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trigger-specific config */}
              {triggerType === 'stage_enter' && (
                <div>
                  <Label>ეტაპის ნომერი</Label>
                  <Input
                    type="number"
                    placeholder="მაგ: 5"
                    value={triggerConfig.stage_number || ''}
                    onChange={(e) =>
                      updateTriggerConfig('stage_number', parseInt(e.target.value))
                    }
                  />
                </div>
              )}

              {triggerType === 'stage_duration' && (
                <div className="space-y-2">
                  <Label>ეტაპის ნომერი</Label>
                  <Input
                    type="number"
                    placeholder="მაგ: 5"
                    value={triggerConfig.stage_number || ''}
                    onChange={(e) =>
                      updateTriggerConfig('stage_number', parseInt(e.target.value))
                    }
                  />
                  <Label>ხანგრძლივობა (დღეები)</Label>
                  <Input
                    type="number"
                    placeholder="მაგ: 7"
                    value={triggerConfig.duration_days || ''}
                    onChange={(e) =>
                      updateTriggerConfig('duration_days', parseInt(e.target.value))
                    }
                  />
                </div>
              )}

              {triggerType === 'time_scheduled' && (
                <div>
                  <Label>განრიგი (cron)</Label>
                  <Input
                    placeholder="მაგ: 0 9 * * 1 (ყოველ ორშაბათს 9:00-ზე)"
                    value={triggerConfig.schedule || ''}
                    onChange={(e) => updateTriggerConfig('schedule', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">მოქმედება (რა) *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>მოქმედების ტიპი</Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ მოქმედება" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action-specific config */}
              {actionType === 'send_notification' && (
                <div className="space-y-2">
                  <Label>სათაური</Label>
                  <Input
                    placeholder="შეტყობინების სათაური"
                    value={actionConfig.title || ''}
                    onChange={(e) => updateActionConfig('title', e.target.value)}
                  />
                  <Label>შეტყობინება</Label>
                  <Textarea
                    placeholder="შეტყობინების ტექსტი"
                    value={actionConfig.message || ''}
                    onChange={(e) => updateActionConfig('message', e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              {actionType === 'send_email' && (
                <div className="space-y-2">
                  <Label>შაბლონის ID</Label>
                  <Input
                    placeholder="ელ. ფოსტის შაბლონის ID"
                    value={actionConfig.template_id || ''}
                    onChange={(e) => updateActionConfig('template_id', e.target.value)}
                  />
                </div>
              )}

              {actionType === 'move_stage' && (
                <div>
                  <Label>ახალი ეტაპის ნომერი</Label>
                  <Input
                    type="number"
                    placeholder="მაგ: 6"
                    value={actionConfig.target_stage || ''}
                    onChange={(e) =>
                      updateActionConfig('target_stage', parseInt(e.target.value))
                    }
                  />
                </div>
              )}

              {actionType === 'create_task' && (
                <div className="space-y-2">
                  <Label>ამოცანის სათაური</Label>
                  <Input
                    placeholder="ამოცანის სათაური"
                    value={actionConfig.title || ''}
                    onChange={(e) => updateActionConfig('title', e.target.value)}
                  />
                  <Label>აღწერა</Label>
                  <Textarea
                    placeholder="ამოცანის აღწერა"
                    value={actionConfig.description || ''}
                    onChange={(e) => updateActionConfig('description', e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              {actionType === 'flag_project' && (
                <div>
                  <Label>დროშის ტიპი</Label>
                  <Select
                    value={actionConfig.flag_type || ''}
                    onValueChange={(value) => updateActionConfig('flag_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="აირჩიეთ დროშა" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">სასწრაფო</SelectItem>
                      <SelectItem value="attention">ყურადღება</SelectItem>
                      <SelectItem value="review">გადახედვა</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>აქტიური</Label>
                <p className="text-sm text-muted-foreground">
                  ჩართეთ ან გამორთეთ ეს წესი
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>ტესტირების რეჟიმი (Dry Run)</Label>
                <p className="text-sm text-muted-foreground">
                  მოქმედებები არ შესრულდება, მხოლოდ ლოგირდება
                </p>
              </div>
              <Switch checked={dryRun} onCheckedChange={setDryRun} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            გაუქმება
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'იქმნება...' : 'შექმნა'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
