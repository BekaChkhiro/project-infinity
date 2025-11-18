import { createClient } from './client';
import { EmailTemplate, NewEmailTemplate, UpdateEmailTemplate } from '@/types/database.types';

// Get all email templates
export async function getEmailTemplates(activeOnly: boolean = false) {
  const supabase = createClient();

  let query = supabase
    .from('email_templates')
    .select('*')
    .order('stage_number', { ascending: true, nullsFirst: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as EmailTemplate[];
}

// Get email template by ID
export async function getEmailTemplate(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as EmailTemplate;
}

// Get templates for a specific stage
export async function getTemplatesByStage(stageNumber: number) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('stage_number', stageNumber)
    .eq('is_active', true);

  if (error) throw error;
  return data as EmailTemplate[];
}

// Create email template
export async function createEmailTemplate(template: NewEmailTemplate) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('email_templates')
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data as EmailTemplate;
}

// Update email template
export async function updateEmailTemplate(id: string, updates: UpdateEmailTemplate) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('email_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as EmailTemplate;
}

// Delete email template
export async function deleteEmailTemplate(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Toggle template active status
export async function toggleTemplateActive(id: string, isActive: boolean) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('email_templates')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as EmailTemplate;
}

// Render template with variables
export function renderTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  // Replace all variables in the format {variable_name}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  return { subject, body };
}

// Preview template with sample data
export function previewTemplate(template: EmailTemplate) {
  const sampleData = {
    client_name: 'გიორგი გიორგაძე',
    project_name: 'ვებსაიტის დიზაინი',
    stage: template.stage_number ? `ეტაპი ${template.stage_number}` : 'დასაწყები',
    notes: 'შენიშვნის მაგალითი',
  };

  return renderTemplate(template, sampleData);
}

// Get available variables
export function getAvailableVariables(): Array<{ key: string; label: string; description: string }> {
  return [
    {
      key: 'client_name',
      label: 'კლიენტის სახელი',
      description: 'კლიენტის სრული სახელი',
    },
    {
      key: 'project_name',
      label: 'პროექტის სახელი',
      description: 'პროექტის დასახელება',
    },
    {
      key: 'stage',
      label: 'მიმდინარე ეტაპი',
      description: 'პროექტის მიმდინარე სტადია',
    },
    {
      key: 'notes',
      label: 'შენიშვნები',
      description: 'დამატებითი შენიშვნები ან კომენტარები',
    },
    {
      key: 'budget',
      label: 'ბიუჯეტი',
      description: 'პროექტის ბიუჯეტი',
    },
    {
      key: 'deadline',
      label: 'ვადა',
      description: 'პროექტის დასრულების ვადა',
    },
  ];
}
