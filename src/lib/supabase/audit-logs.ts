import { createClient } from './client';
import { AuditLog, NewAuditLog, AuditLogWithUser } from '@/types/database.types';

// Get audit logs with filters
export async function getAuditLogs(options: {
  userId?: string;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      user:users(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options.actionType) {
    query = query.eq('action_type', options.actionType);
  }

  if (options.entityType) {
    query = query.eq('entity_type', options.entityType);
  }

  if (options.entityId) {
    query = query.eq('entity_id', options.entityId);
  }

  if (options.startDate) {
    query = query.gte('created_at', options.startDate);
  }

  if (options.endDate) {
    query = query.lte('created_at', options.endDate);
  }

  const limit = options.limit || 50;
  const offset = options.offset || 0;

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;
  return data as AuditLogWithUser[];
}

// Create audit log entry
export async function createAuditLog(log: NewAuditLog) {
  const supabase = createClient();

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('audit_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data as AuditLog;
}

// Get audit logs for a specific project
export async function getProjectAuditLogs(projectId: string, limit: number = 50) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:users(id, full_name, email)
    `)
    .eq('entity_type', 'project')
    .eq('entity_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AuditLogWithUser[];
}

// Get audit logs for a specific client
export async function getClientAuditLogs(clientId: string, limit: number = 50) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:users(id, full_name, email)
    `)
    .eq('entity_type', 'client')
    .eq('entity_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AuditLogWithUser[];
}

// Get recent activity (last N entries)
export async function getRecentActivity(limit: number = 20) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:users(id, full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AuditLogWithUser[];
}

// Get activity grouped by action type
export async function getActivityByActionType(days: number = 30) {
  const supabase = createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('audit_logs')
    .select('action_type')
    .gte('created_at', startDate.toISOString());

  if (error) throw error;

  // Group and count
  const counts: Record<string, number> = {};
  (data as any[])?.forEach((log: any) => {
    counts[log.action_type] = (counts[log.action_type] || 0) + 1;
  });

  return Object.entries(counts).map(([action_type, count]) => ({
    action_type,
    count,
  }));
}

// Get activity by user
export async function getActivityByUser(days: number = 30) {
  const supabase = createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      user_id,
      user:users(full_name, email)
    `)
    .gte('created_at', startDate.toISOString());

  if (error) throw error;

  // Group and count
  const counts: Record<string, { count: number; user: any }> = {};
  (data as any[])?.forEach((log: any) => {
    if (log.user_id) {
      if (!counts[log.user_id]) {
        counts[log.user_id] = { count: 0, user: log.user };
      }
      counts[log.user_id].count++;
    }
  });

  return Object.entries(counts).map(([user_id, data]) => ({
    user_id,
    user_name: data.user?.full_name || data.user?.email || 'Unknown',
    count: data.count,
  }));
}

// Export audit logs to JSON
export async function exportAuditLogs(options: {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  entityType?: string;
}) {
  const logs = await getAuditLogs({
    ...options,
    limit: 10000, // Large limit for export
  });

  // Convert to JSON
  const json = JSON.stringify(logs, null, 2);
  return json;
}

// Export audit logs to CSV
export async function exportAuditLogsCSV(options: {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  entityType?: string;
}) {
  const logs = await getAuditLogs({
    ...options,
    limit: 10000,
  });

  if (!logs || logs.length === 0) {
    return '';
  }

  // CSV headers
  const headers = [
    'თარიღი',
    'მომხმარებელი',
    'მოქმედება',
    'ობიექტის ტიპი',
    'ობიექტის ID',
  ];

  // CSV rows
  const rows = logs.map((log: any) => [
    new Date(log.created_at).toLocaleString('ka-GE'),
    log.user?.full_name || log.user?.email || '-',
    log.action_type,
    log.entity_type,
    log.entity_id || '-',
  ]);

  // Combine headers and rows
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}

// Helper: Log project creation
export async function logProjectCreated(projectId: string, userId: string, projectData: any) {
  return createAuditLog({
    user_id: userId,
    action_type: 'project_created',
    entity_type: 'project',
    entity_id: projectId,
    new_values: projectData,
    metadata: {},
  });
}

// Helper: Log stage change
export async function logStageChanged(
  projectId: string,
  userId: string,
  oldStage: string,
  newStage: string
) {
  return createAuditLog({
    user_id: userId,
    action_type: 'stage_changed',
    entity_type: 'project',
    entity_id: projectId,
    old_values: { stage: oldStage },
    new_values: { stage: newStage },
    metadata: {},
  });
}

// Helper: Log client created
export async function logClientCreated(clientId: string, userId: string, clientData: any) {
  return createAuditLog({
    user_id: userId,
    action_type: 'client_created',
    entity_type: 'client',
    entity_id: clientId,
    new_values: clientData,
    metadata: {},
  });
}
