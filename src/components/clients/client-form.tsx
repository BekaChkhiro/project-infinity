'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/lib/toast';
import { Client, NewClient } from '@/types/database.types';

interface ClientFormProps {
  isEdit?: boolean;
  clientId?: string;
  initialData?: Client;
}

export function ClientForm({ isEdit = false, clientId, initialData }: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    preferredCommunication: initialData?.preferred_communication_method || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
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

      const clientData: NewClient = {
        name: formData.name,
        company: formData.company || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        notes: formData.notes || null,
        preferred_communication_method: formData.preferredCommunication
          ? (formData.preferredCommunication as 'email' | 'phone' | 'whatsapp' | 'telegram')
          : null,
        created_by: user.id,
      };

      if (isEdit && clientId) {
        // Update existing client
        // @ts-ignore - Supabase client type inference issue
        const { error } = await (supabase as any)
          .from('clients')
          .update({
            name: formData.name,
            company: formData.company || null,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            notes: formData.notes || null,
            preferred_communication_method: formData.preferredCommunication
              ? (formData.preferredCommunication as 'email' | 'phone' | 'whatsapp' | 'telegram')
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', clientId);

        if (error) throw error;

        showToast.success('კლიენტი წარმატებით განახლდა');
        router.push(`/dashboard/clients/${clientId}`);
      } else {
        // Create new client
        // @ts-ignore - Supabase client type inference issue
        const { data: newClient, error } = await (supabase as any)
          .from('clients')
          .insert(clientData)
          .select()
          .single();

        if (error) throw error;

        showToast.success('კლიენტი წარმატებით შეიქმნა');
        router.push(`/dashboard/clients/${newClient.id}`);
      }
    } catch (error: any) {
      console.error('Error saving client:', error);
      showToast.error(error?.message || 'კლიენტის შენახვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'კლიენტის რედაქტირება' : 'ახალი კლიენტი'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">სახელი *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="მაგ: გიორგი გიორგაძე"
              required
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">კომპანია</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="მაგ: ABC კომპანია"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">ელ. ფოსტა</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@mail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ტელეფონი</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+995 555 12 34 56"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">მისამართი</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="მაგ: თბილისი, ვაჟა-ფშაველას 12"
            />
          </div>

          {/* Preferred Communication Method */}
          <div className="space-y-2">
            <Label htmlFor="preferredCommunication">სასურველი კომუნიკაციის საშუალება</Label>
            <Select
              value={formData.preferredCommunication}
              onValueChange={(value) =>
                setFormData({ ...formData, preferredCommunication: value })
              }
            >
              <SelectTrigger id="preferredCommunication">
                <SelectValue placeholder="აირჩიეთ საშუალება" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">ელ. ფოსტა</SelectItem>
                <SelectItem value="phone">ტელეფონი</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">შენიშვნები</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="დამატებითი ინფორმაცია კლიენტის შესახებ..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
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
