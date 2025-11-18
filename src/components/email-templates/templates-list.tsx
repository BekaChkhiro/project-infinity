'use client';

import { useEffect, useState } from 'react';
import { Mail, Edit, Trash2, Plus } from 'lucide-react';
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
import { EmailTemplate } from '@/types/database.types';
import { getEmailTemplates, deleteEmailTemplate } from '@/lib/supabase/email-templates';
import { showToast } from '@/lib/toast';
import { TemplateEditor } from './template-editor';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

export function TemplatesList() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      showToast.error('შაბლონების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const handleNew = () => {
    setSelectedTemplate(null);
    setEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await deleteEmailTemplate(templateToDelete);
      setTemplates(templates.filter((t) => t.id !== templateToDelete));
      showToast.success('შაბლონი წაიშალა');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error: any) {
      console.error('Error deleting template:', error);
      showToast.error('წაშლა ვერ მოხერხდა');
    }
  };

  const openDeleteDialog = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
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
              <Mail className="h-5 w-5" />
              ელ. ფოსტის შაბლონები
              <Badge variant="secondary">{templates.length}</Badge>
            </CardTitle>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              ახალი შაბლონი
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                შაბლონები არ არის დამატებული
              </p>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                პირველი შაბლონის შექმნა
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>სახელი</TableHead>
                  <TableHead>თემა</TableHead>
                  <TableHead>შექმნილია</TableHead>
                  <TableHead className="text-right">მოქმედებები</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {template.subject}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(template.created_at), {
                          addSuffix: true,
                          locale: ka,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(template.id)}
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

      <TemplateEditor
        open={editorOpen}
        template={selectedTemplate}
        onClose={() => {
          setEditorOpen(false);
          setSelectedTemplate(null);
        }}
        onSaved={loadTemplates}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>დარწმუნებული ხართ?</AlertDialogTitle>
            <AlertDialogDescription>
              ეს მოქმედება შეუქცევადია. შაბლონი სამუდამოდ წაიშლება.
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
