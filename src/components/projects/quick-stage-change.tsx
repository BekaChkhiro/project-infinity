'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { showToast, toastMessages } from '@/lib/toast';
import { STAGE_CONFIGS, getStageConfig } from '@/lib/stages';
import { ProjectStage } from '@/types/database.types';

interface QuickStageChangeProps {
  projectId: string;
  currentStage: ProjectStage;
  currentStageNumber: number;
  onStageChanged?: () => void;
}

export function QuickStageChange({
  projectId,
  currentStage,
  currentStageNumber,
  onStageChanged,
}: QuickStageChangeProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [showBackwardDialog, setShowBackwardDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const currentStageConfig = getStageConfig(currentStage);

  const handleStageSelect = (stageNumber: number) => {
    setSelectedStage(stageNumber);

    // If moving backward, show confirmation dialog
    if (stageNumber < currentStageNumber) {
      setIsOpen(false);
      setShowBackwardDialog(true);
    } else {
      // If moving forward, proceed directly
      handleStageChange(stageNumber);
    }
  };

  const handleStageChange = async (targetStageNumber: number) => {
    if (targetStageNumber === currentStageNumber) {
      showToast.error('უკვე იმყოფებით ამ ეტაპზე');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showToast.error('მომხმარებელი არ არის ავტორიზებული');
        return;
      }

      const targetStageConfig = STAGE_CONFIGS.find((s) => s.number === targetStageNumber);
      if (!targetStageConfig) {
        showToast.error('ეტაპი ვერ მოიძებნა');
        return;
      }

      // Update project stage
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          current_stage: targetStageConfig.stage,
          stage_number: targetStageConfig.number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (updateError) throw updateError;

      // Create stage history entry
      const { error: historyError } = await supabase
        .from('stage_history')
        .insert({
          project_id: projectId,
          from_stage: currentStage,
          to_stage: targetStageConfig.stage,
          from_stage_number: currentStageNumber,
          to_stage_number: targetStageConfig.number,
          changed_by: user.id,
          notes: notes || null,
        });

      if (historyError) throw historyError;

      showToast.success(toastMessages.project.stageChanged);
      setIsOpen(false);
      setShowBackwardDialog(false);
      setNotes('');
      setSelectedStage(null);

      // Refresh the page or call callback
      if (onStageChanged) {
        onStageChanged();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error changing stage:', error);
      showToast.error(toastMessages.project.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main button */}
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <ArrowRight className="w-4 h-4 mr-2" />
        ეტაპის შეცვლა
      </Button>

      {/* Stage selection dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ეტაპის შეცვლა</DialogTitle>
            <DialogDescription>
              აირჩიეთ ახალი ეტაპი პროექტისთვის
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current stage */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                მიმდინარე ეტაპი
              </p>
              {currentStageConfig && (
                <Badge
                  variant="outline"
                  className={`${currentStageConfig.bgColor} ${currentStageConfig.color} ${currentStageConfig.borderColor}`}
                >
                  {currentStageConfig.number}. {currentStageConfig.stage}
                </Badge>
              )}
            </div>

            {/* Stage selection grid */}
            <div className="space-y-4">
              <Label>აირჩიეთ ახალი ეტაპი</Label>
              <div className="grid gap-2">
                {STAGE_CONFIGS.map((config) => {
                  const isCurrent = config.number === currentStageNumber;
                  const isCompleted = config.number < currentStageNumber;
                  const isBackward = config.number < currentStageNumber;

                  return (
                    <button
                      key={config.number}
                      onClick={() => handleStageSelect(config.number)}
                      disabled={isCurrent || loading}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isCurrent
                          ? 'bg-muted border-muted-foreground cursor-not-allowed'
                          : isCompleted
                          ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              isCurrent
                                ? config.bgColor + ' ' + config.color
                                : isCompleted
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {config.number}
                          </span>
                          <div>
                            <p className={`text-sm font-medium ${isCurrent ? config.color : ''}`}>
                              {config.stage}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {config.phaseLabel}
                            </p>
                          </div>
                        </div>
                        {isCurrent && (
                          <Badge variant="secondary">მიმდინარე</Badge>
                        )}
                        {isBackward && !isCurrent && (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">შენიშვნა (არასავალდებულო)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="დაამატეთ შენიშვნა ეტაპის შეცვლის შესახებ..."
                rows={3}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backward movement confirmation dialog */}
      <AlertDialog open={showBackwardDialog} onOpenChange={setShowBackwardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              დაადასტურეთ უკან დაბრუნება
            </AlertDialogTitle>
            <AlertDialogDescription>
              თქვენ აპირებთ პროექტის დაბრუნებას წინა ეტაპზე. ეს მოქმედება არ გაითვალისწინებს
              უკვე შესრულებულ სამუშაოს. დარწმუნებული ხართ, რომ გსურთ გაგრძელება?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowBackwardDialog(false);
              setIsOpen(true);
              setSelectedStage(null);
            }}>
              გაუქმება
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedStage && handleStageChange(selectedStage)}
              disabled={loading}
            >
              {loading ? 'შენახვა...' : 'დადასტურება'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
