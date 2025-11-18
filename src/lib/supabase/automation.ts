import { createClient } from './client';
import {
  AutomationRule,
  NewAutomationRule,
  UpdateAutomationRule,
  AutomationExecution,
  AutomationRuleWithExecutions,
  ProjectAlert,
  NewProjectAlert,
  AutomationDashboard,
  ProjectRequiringAction,
} from '@/types/database.types';

// ============================================================================
// AUTOMATION RULES
// ============================================================================

// Get all automation rules
export async function getAutomationRules(activeOnly: boolean = false) {
  const supabase = createClient();

  let query = supabase
    .from('automation_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as AutomationRule[];
}

// Get single automation rule
export async function getAutomationRule(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('automation_rules')
    .select(`
      *,
      executions:automation_executions(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as AutomationRuleWithExecutions;
}

// Create automation rule
export async function createAutomationRule(rule: NewAutomationRule) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('automation_rules')
    .insert(rule)
    .select()
    .single();

  if (error) throw error;
  return data as AutomationRule;
}

// Update automation rule
export async function updateAutomationRule(id: string, updates: UpdateAutomationRule) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('automation_rules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AutomationRule;
}

// Delete automation rule
export async function deleteAutomationRule(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('automation_rules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Toggle automation rule active status
export async function toggleAutomationRule(id: string, isActive: boolean) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('automation_rules')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AutomationRule;
}

// Toggle dry run mode
export async function toggleDryRun(id: string, dryRun: boolean) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('automation_rules')
    .update({
      dry_run: dryRun,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AutomationRule;
}

// ============================================================================
// AUTOMATION EXECUTIONS
// ============================================================================

// Get automation executions for a rule
export async function getAutomationExecutions(
  ruleId: string,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('automation_executions')
    .select('*')
    .eq('rule_id', ruleId)
    .order('executed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as AutomationExecution[];
}

// Get recent automation executions
export async function getRecentExecutions(limit: number = 20) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('automation_executions')
    .select(`
      *,
      rule:automation_rules(name),
      project:projects(title)
    `)
    .order('executed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ============================================================================
// PROJECT ALERTS
// ============================================================================

// Get all active alerts
export async function getActiveAlerts() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('project_alerts')
    .select(`
      *,
      project:projects(id, title, current_stage, client_id)
    `)
    .eq('is_resolved', false)
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get alerts for a project
export async function getProjectAlerts(projectId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('project_alerts')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_resolved', false)
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ProjectAlert[];
}

// Create project alert
export async function createProjectAlert(alert: NewProjectAlert) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('project_alerts')
    .insert(alert)
    .select()
    .single();

  if (error) throw error;
  return data as ProjectAlert;
}

// Resolve alert
export async function resolveAlert(alertId: string, userId: string) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('project_alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data as ProjectAlert;
}

// ============================================================================
// SMART DETECTION
// ============================================================================

// Detect stuck projects
export async function detectStuckProjects(thresholdDays: number = 7) {
  const supabase = createClient();

  // @ts-ignore - RPC function type not in generated types
  const { data, error } = await (supabase as any)
    .rpc('detect_stuck_projects', { threshold_days: thresholdDays });

  if (error) throw error;
  return data;
}

// Get automation dashboard data
export async function getAutomationDashboard() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('automation_dashboard')
    .select('*')
    .single();

  if (error) throw error;
  return data as AutomationDashboard;
}

// Get projects requiring action
export async function getProjectsRequiringAction() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects_requiring_action')
    .select('*');

  if (error) throw error;
  return data as ProjectRequiringAction[];
}

// Detect payment delays
export async function detectPaymentDelays() {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(name)
    `)
    .in('stage_number', [14, 15, 16]) // Payment stages
    .order('updated_at', { ascending: true });

  if (error) throw error;

  // Filter projects that have been in payment stages for >14 days
  const now = new Date();
  const delayedProjects = (projects as any[])?.filter((p: any) => {
    const updatedAt = new Date(p.updated_at);
    const daysSinceUpdate = Math.floor(
      (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate >= 14;
  });

  return delayedProjects;
}

// Detect high-value projects
export async function detectHighValueProjects(threshold: number = 10000) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(name)
    `)
    .gte('budget', threshold)
    .lt('stage_number', 18) // Not completed
    .order('budget', { ascending: false });

  if (error) throw error;
  return data;
}

// Detect clients with multiple active projects
export async function detectMultipleProjectsClients() {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('client_id, clients(name)')
    .lt('stage_number', 18);

  if (error) throw error;

  // Group by client and count
  const clientCounts: Record<string, { count: number; name: string }> = {};

  (projects as any[])?.forEach((p: any) => {
    if (p.client_id) {
      if (!clientCounts[p.client_id]) {
        clientCounts[p.client_id] = {
          count: 0,
          name: p.clients?.name || 'Unknown',
        };
      }
      clientCounts[p.client_id].count++;
    }
  });

  // Return clients with 3+ active projects
  return Object.entries(clientCounts)
    .filter(([_, data]) => data.count >= 3)
    .map(([clientId, data]) => ({
      client_id: clientId,
      client_name: data.name,
      active_projects_count: data.count,
    }));
}
