'use client';

import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTemplate, NewEmailTemplate } from '@/types/database.types';
import {
  createEmailTemplate,
  updateEmailTemplate,
  previewTemplate,
  getAvailableVariables,
} from '@/lib/supabase/email-templates';
import { showToast, toastMessages } from '@/lib/toast';

interface TemplateEditorProps {
  open: boolean;
  template?: EmailTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TemplateEditor({
  open,
  template,
  onClose,
  onSaved,
}: TemplateEditorProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<Array<{ key: string; label: string; description: string }>>([]);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
    } else {
      setName('');
      setSubject('');
      setBody('');
    }
  }, [template]);

  useEffect(() => {
    loadVariables();
  }, []);

  async function loadVariables() {
    try {
      const vars = await getAvailableVariables();
      setVariables(vars);
    } catch (error) {
      console.error('Error loading variables:', error);
    }
  }

  const handlePreview = () => {
    // Simple preview by replacing variables inline
    const sampleData: Record<string, string> = {
      client_name: 'კომპანია ABC',
      project_name: 'ვებ დიზაინის პროექტი',
      stage: 'დიზაინი',
      notes: 'დიზაინის ეტაპი დასრულებულია',
      budget: '5000',
    };

    const previewText = body.replace(/{(\w+)}/g, (_, key) => sampleData[key] || `{${key}}`);
    setPreview(previewText);
  };

  const handleSave = async () => {
    if (!name || !subject || !body) {
      showToast.error('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    setLoading(true);
    try {
      if (template) {
        // Update existing template
        await updateEmailTemplate(template.id, {
          name,
          subject,
          body,
        });
        showToast.success('შაბლონი წარმატებით განახლდა');
      } else {
        // Create new template
        const newTemplate: NewEmailTemplate = {
          name,
          subject,
          body,
        };
        await createEmailTemplate(newTemplate);
        showToast.success('შაბლონი წარმატებით შეიქმნა');
      }
      onSaved();
      handleClose();
    } catch (error: any) {
      console.error('Error saving template:', error);
      showToast.error(error.message || toastMessages.generic.error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSubject('');
    setBody('');
    setPreview('');
    onClose();
  };

  const insertVariable = (variable: string) => {
    setBody(body + `{${variable}}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {template ? 'შაბლონის რედაქტირება' : 'ახალი შაბლონი'}
          </DialogTitle>
          <DialogDescription>
            შექმენით ან შეცვალეთ ელ. ფოსტის შაბლონი ცვლადებით
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">რედაქტირება</TabsTrigger>
            <TabsTrigger value="preview" onClick={handlePreview}>
              პრევიუ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">შაბლონის სახელი *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="მაგ: პროექტის შეტყობინება"
              />
            </div>

            <div>
              <Label htmlFor="subject">თემა *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="მაგ: პროექტი: {project_name} - სტატუსი განახლდა"
              />
            </div>

            <div>
              <Label>ტექსტი *</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="შეიყვანეთ შაბლონის ტექსტი..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ხელმისაწვდომი ცვლადები</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <Badge
                      key={variable.key}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => insertVariable(variable.key)}
                      title={variable.description}
                    >
                      {'{'}
                      {variable.key}
                      {'}'}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  დააწკაპუნეთ ცვლადზე ტექსტში ჩასასმელად
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">პრევიუ</CardTitle>
                <p className="text-xs text-muted-foreground">
                  ნიმუში მონაცემებით
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      თემა:
                    </Label>
                    <p className="font-medium mt-1">
                      {subject.replace(
                        /{(\w+)}/g,
                        (_, key) => {
                          const sampleData: Record<string, string> = {
                            client_name: 'კომპანია ABC',
                            project_name: 'ვებ დიზაინის პროექტი',
                            stage: 'დიზაინი',
                            notes: 'დიზაინის ეტაპი დასრულებულია',
                            budget: '5000',
                          };
                          return sampleData[key] || `{${key}}`;
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      ტექსტი:
                    </Label>
                    <div className="mt-1 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                      {preview || body.replace(
                        /{(\w+)}/g,
                        (_, key) => {
                          const sampleData: Record<string, string> = {
                            client_name: 'კომპანია ABC',
                            project_name: 'ვებ დიზაინის პროექტი',
                            stage: 'დიზაინი',
                            notes: 'დიზაინის ეტაპი დასრულებულია',
                            budget: '5000',
                          };
                          return sampleData[key] || `{${key}}`;
                        }
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            გაუქმება
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'ინახება...' : 'შენახვა'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
