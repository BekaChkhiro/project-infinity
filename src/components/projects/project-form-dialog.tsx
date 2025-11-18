'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { showToast, toastMessages } from '@/lib/toast';
import { Database } from '@/types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

interface ProjectFormDialogProps {
  prefilledClientId?: string;
  onSuccess?: () => void;
}

export function ProjectFormDialog({ prefilledClientId, onSuccess }: ProjectFormDialogProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [newClientMode, setNewClientMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    clientId: prefilledClientId || '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    description: '',
    notes: '',
  });

  // Load existing clients
  useEffect(() => {
    async function loadClients() {
      // @ts-ignore
      const { data, error } = await (supabase as any)
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setClients(data);
      }
    }
    loadClients();
  }, [supabase]);

  const resetForm = () => {
    setFormData({
      title: '',
      clientId: prefilledClientId || '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      description: '',
      notes: '',
    });
    setNewClientMode(false);
  };

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

        // @ts-ignore - Supabase client type inference issue
        const { data: newClient, error: clientError } = await (supabase as any)
          .from('clients')
          .insert(clientData)
          .select()
          .single();

        if (clientError) {
          console.error('Client insert error:', clientError);
          throw clientError;
        }

        clientId = newClient.id;
      }

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

      // @ts-ignore - Supabase client type inference issue
      const { data: newProject, error } = await (supabase as any)
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Project insert error:', error);
        throw error;
      }

      // Create initial stage history entry
      // @ts-ignore - Supabase client type inference issue
      await (supabase as any).from('stage_history').insert({
        project_id: newProject.id,
        from_stage: null,
        to_stage: 'დასაწყები',
        from_stage_number: null,
        to_stage_number: 1,
        changed_by: user.id,
        notes: 'პროექტი შეიქმნა',
      });

      // Call onSuccess callback if provided to refresh data
      if (onSuccess) {
        onSuccess();
      }

      // Refresh the router to update server components
      router.refresh();

      // Show success message and close dialog
      showToast.success(toastMessages.project.created);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving project:', error);
      showToast.error(error?.message || toastMessages.project.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          ახალი პროექტი
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ახალი პროექტის შექმნა</DialogTitle>
          <DialogDescription>შეავსეთ ფორმა ახალი პროექტის შესაქმნელად</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
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

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">პროექტის აღწერა</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="პროექტის დეტალური აღწერა..."
              rows={3}
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
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              გაუქმება
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'შენახვა...' : 'შექმნა'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
