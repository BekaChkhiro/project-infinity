'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, Trash2, Archive } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { showToast, toastMessages } from '@/lib/toast';

interface ProjectActionsProps {
  projectId: string;
  projectTitle: string;
}

export function ProjectActions({ projectId, projectTitle }: ProjectActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    notes: '',
    budget: '',
    deadline: '',
  });

  const loadProjectData = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!error && data) {
      setEditData({
        title: data.title || '',
        description: data.description || '',
        notes: data.notes || '',
        budget: data.budget?.toString() || '',
        deadline: data.deadline || '',
      });
    }
    setLoadingData(false);
  };

  const handleEdit = async () => {
    if (!editData.title.trim()) {
      showToast.error('პროექტის სახელი აუცილებელია');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: editData.title,
          description: editData.description || null,
          notes: editData.notes || null,
          budget: editData.budget ? parseFloat(editData.budget) : null,
          deadline: editData.deadline || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;

      showToast.success(toastMessages.project.updated);
      setShowEditDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating project:', error);
      showToast.error(toastMessages.project.error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      // Delete stage history first (foreign key constraint)
      await supabase.from('stage_history').delete().eq('project_id', projectId);

      // Delete project
      const { error } = await supabase.from('projects').delete().eq('id', projectId);

      if (error) throw error;

      showToast.success(toastMessages.project.deleted);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast.error(toastMessages.project.error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleArchive = async () => {
    // Placeholder for archive functionality
    // You could add an 'archived' boolean field to the projects table
    showToast.success(toastMessages.project.archived);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              loadProjectData();
              setShowEditDialog(true);
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            რედაქტირება
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="w-4 h-4 mr-2" />
            არქივი
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            წაშლა
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>პროექტის რედაქტირება</DialogTitle>
            <DialogDescription>
              განაახლეთ პროექტის ინფორმაცია
            </DialogDescription>
          </DialogHeader>

          {loadingData ? (
            <div className="py-8 text-center text-muted-foreground">
              იტვირთება...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">პროექტის სახელი *</Label>
                <Input
                  id="edit-title"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  placeholder="პროექტის სახელი"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">აღწერა</Label>
                <Textarea
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="პროექტის აღწერა"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">შენიშვნები</Label>
                <Textarea
                  id="edit-notes"
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="შენიშვნები"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-budget">ბიუჯეტი (₾)</Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    value={editData.budget}
                    onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-deadline">ვადა</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={loading}
                >
                  გაუქმება
                </Button>
                <Button onClick={handleEdit} disabled={loading}>
                  {loading ? 'შენახვა...' : 'განახლება'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>დარწმუნებული ხართ?</AlertDialogTitle>
            <AlertDialogDescription>
              ეს მოქმედება შეუქცევადია. პროექტი "{projectTitle}" და მისი ყველა ისტორია
              სამუდამოდ წაიშლება.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'წაშლა...' : 'წაშლა'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
