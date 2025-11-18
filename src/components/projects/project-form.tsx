'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { showToast, toastMessages } from '@/lib/toast';
import { Database } from '@/types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

interface ProjectFormProps {
  isEdit?: boolean;
  projectId?: string;
  prefilledClientId?: string;
  initialData?: {
    title: string;
    client_id: string;
    client_email?: string;
    client_phone?: string;
    description?: string;
    notes?: string;
  };
}

export function ProjectForm({ isEdit = false, projectId, prefilledClientId, initialData }: ProjectFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [newClientMode, setNewClientMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    clientId: initialData?.client_id || prefilledClientId || '',
    clientName: '',
    clientEmail: initialData?.client_email || '',
    clientPhone: initialData?.client_phone || '',
    description: initialData?.description || '',
    notes: initialData?.notes || '',
  });

  // Load existing clients
  useEffect(() => {
    async function loadClients() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setClients(data);
      }
    }
    loadClients();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showToast.error('პროექტის სახელი აუცილებელია');
      return;
    }

    if (!newClientMode && !formData.clientId) {
      showToast.error('აირჩიეთ კლიენტი ან შექმენით ახალი');
      return;
    }

    if (newClientMode && !formData.clientName.trim()) {
      showToast.error('კლიენტის სახელი აუცილებელია');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showToast.error('მომხმარებელი არ არის ავტორიზებული');
        setLoading(false);
        return;
      }

      let clientId = formData.clientId;

      // Create new client if in new client mode
      if (newClientMode) {
        const clientData = {
          name: formData.clientName,
          email: formData.clientEmail || null,
          phone: formData.clientPhone || null,
          created_by: user.id,
        };

        console.log('Creating client with data:', clientData);

        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          // @ts-ignore - Supabase client type inference issue
          .insert(clientData)
          .select()
          .single();

        if (clientError) {
          console.error('Client insert error:', clientError);
          throw clientError;
        }

        // @ts-ignore - Supabase client type inference issue
        clientId = newClient.id;
        console.log('Created client with ID:', clientId);
      }

      if (isEdit && projectId) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          // @ts-ignore - Supabase client type inference issue
          .update({
            title: formData.title,
            client_id: clientId,
            description: formData.description || null,
            notes: formData.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        if (error) throw error;

        showToast.success(toastMessages.project.updated);
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        // Create new project (auto-assign to Stage 1)
        const projectData = {
          title: formData.title,
          client_id: clientId,
          description: formData.description || null,
          notes: formData.notes || null,
          current_stage: 'დასაწყები' as const,
          stage_number: 1,
          created_by: user.id,
        };

        console.log('Creating project with data:', projectData);

        const { data: newProject, error } = await supabase
          .from('projects')
          // @ts-ignore - Supabase client type inference issue
          .insert(projectData)
          .select()
          .single();

        if (error) {
          console.error('Project insert error:', error);
          throw error;
        }

        // Create initial stage history entry
        // @ts-ignore - Supabase client type inference issue
        await supabase.from('stage_history').insert({
          // @ts-ignore - Supabase client type inference issue
          project_id: newProject.id,
          from_stage: null,
          to_stage: 'დასაწყები',
          from_stage_number: null,
          to_stage_number: 1,
          changed_by: user.id,
          notes: 'პროექტი შეიქმნა',
        });

        showToast.success(toastMessages.project.created);
        // @ts-ignore - Supabase client type inference issue
        router.push(`/dashboard/projects/${newProject.id}`);
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      showToast.error(error?.message || toastMessages.project.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'პროექტის რედაქტირება' : 'ახალი პროექტი'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="title">პროექტის სახელი *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="მაგ: ვებსაიტის დიზაინი"
              required
            />
          </div>

          {/* Client Selection */}
          {!isEdit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>კლიენტი *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewClientMode(!newClientMode)}
                >
                  {newClientMode ? 'არსებული კლიენტი' : 'ახალი კლიენტი'}
                </Button>
              </div>

              {newClientMode ? (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">კლიენტის სახელი *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="მაგ: გიორგი გიორგაძე"
                      required={newClientMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">ელ. ფოსტა</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="example@mail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">ტელეფონი</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="+995 555 12 34 56"
                    />
                  </div>
                </div>
              ) : (
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required={!newClientMode}
                >
                  <option value="">აირჩიეთ კლიენტი</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.email && `(${client.email})`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">პროექტის აღწერა</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="პროექტის დეტალური აღწერა..."
              rows={4}
            />
          </div>

          {/* Initial Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">შენიშვნები</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="დამატებითი შენიშვნები..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              გაუქმება
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'შენახვა...' : isEdit ? 'განახლება' : 'შექმნა'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
