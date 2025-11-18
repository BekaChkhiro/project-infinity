import { createClient } from './client';
import {
  Client,
  NewClient,
  UpdateClient,
  ClientStatistics,
  ClientPaymentAnalytics
} from '@/types/database.types';

// Get all clients
export async function getClients() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Client[];
}

// Get clients with statistics (using the view)
export async function getClientsWithStats() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('client_statistics')
    .select('*')
    .order('name', { ascending: true });

  // If view doesn't exist, fall back to manual calculation
  if (error && error.code === 'PGRST204') {
    console.warn('client_statistics view not found, falling back to manual calculation');
    return getClientsWithStatsManual();
  }

  if (error) throw error;
  return data as ClientStatistics[];
}

// Fallback function when view doesn't exist
async function getClientsWithStatsManual(): Promise<ClientStatistics[]> {
  const supabase = createClient();

  // Get all clients
  // @ts-ignore - Supabase type inference issue
  const { data: clients, error: clientsError } = await (supabase as any)
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (clientsError) throw clientsError;
  if (!clients) return [];

  // Get all projects
  // @ts-ignore - Supabase type inference issue
  const { data: projects, error: projectsError } = await (supabase as any)
    .from('projects')
    .select('*');

  if (projectsError) throw projectsError;

  // Calculate stats for each client
  return (clients as Client[]).map(client => {
    const clientProjects = (projects as any[])?.filter((p: any) => p.client_id === client.id) || [];
    const activeProjects = clientProjects.filter((p: any) => p.stage_number < 18);
    const totalRevenue = clientProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
    const totalPaid = clientProjects.reduce((sum: number, p: any) => sum + (p.paid_amount || 0), 0);
    const lastProjectDate = clientProjects.length > 0
      ? clientProjects.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : null;

    return {
      ...client,
      total_projects: clientProjects.length,
      active_projects: activeProjects.length,
      last_project_date: lastProjectDate,
      total_revenue: totalRevenue,
      total_paid: totalPaid,
    } as ClientStatistics;
  });
}

// Get a single client by ID
export async function getClientById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Client;
}

// Get client with their projects
export async function getClientWithProjects(clientId: string) {
  const supabase = createClient();

  // Get client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientError) throw clientError;

  // Get projects for this client
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (projectsError) throw projectsError;

  return {
    ...(client as Client),
    projects: projects || [],
  };
}

// Get client payment analytics
export async function getClientPaymentAnalytics(clientId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('client_payment_analytics')
    .select('*')
    .eq('client_id', clientId)
    .single();

  // If view doesn't exist, fall back to manual calculation
  if (error && error.code === 'PGRST204') {
    console.warn('client_payment_analytics view not found, falling back to manual calculation');
    return getClientPaymentAnalyticsManual(clientId);
  }

  if (error) throw error;
  return data as ClientPaymentAnalytics;
}

// Fallback function for single client analytics
async function getClientPaymentAnalyticsManual(clientId: string): Promise<ClientPaymentAnalytics> {
  const supabase = createClient();

  // @ts-ignore - Supabase type inference issue
  const { data: client } = await (supabase as any)
    .from('clients')
    .select('name')
    .eq('id', clientId)
    .single();

  // @ts-ignore - Supabase type inference issue
  const { data: projects } = await (supabase as any)
    .from('projects')
    .select('*')
    .eq('client_id', clientId);

  const totalProjects = projects?.length || 0;
  const completedProjects = projects?.filter((p: any) => p.stage_number === 18).length || 0;
  const projectsInPayment = projects?.filter((p: any) => p.stage_number >= 14 && p.stage_number <= 16).length || 0;
  const totalBudget = projects?.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) || 0;
  const totalPaid = projects?.reduce((sum: number, p: any) => sum + (p.paid_amount || 0), 0) || 0;

  const paidInFullCount = projects?.filter((p: any) => p.budget && p.paid_amount >= p.budget).length || 0;
  const paymentPunctualityScore = totalProjects > 0 ? (paidInFullCount / totalProjects) * 100 : 0;

  const completedWithDates = projects?.filter((p: any) =>
    p.stage_number === 18 && p.start_date && p.completion_date
  ) || [];

  const avgProjectDurationDays = completedWithDates.length > 0
    ? completedWithDates.reduce((sum: number, p: any) => {
        const start = new Date(p.start_date!).getTime();
        const end = new Date(p.completion_date!).getTime();
        return sum + Math.floor((end - start) / (1000 * 60 * 60 * 24));
      }, 0) / completedWithDates.length
    : null;

  return {
    client_id: clientId,
    client_name: client?.name || '',
    total_projects: totalProjects,
    completed_projects: completedProjects,
    projects_in_payment: projectsInPayment,
    total_budget: totalBudget,
    total_paid: totalPaid,
    payment_punctuality_score: paymentPunctualityScore,
    avg_project_duration_days: avgProjectDurationDays,
  };
}

// Get all client payment analytics
export async function getAllClientPaymentAnalytics() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('client_payment_analytics')
    .select('*')
    .order('total_budget', { ascending: false });

  // If view doesn't exist, fall back to manual calculation
  if (error && error.code === 'PGRST204') {
    console.warn('client_payment_analytics view not found, falling back to manual calculation');
    return getAllClientPaymentAnalyticsManual();
  }

  if (error) throw error;
  return data as ClientPaymentAnalytics[];
}

// Fallback function for all clients analytics
async function getAllClientPaymentAnalyticsManual(): Promise<ClientPaymentAnalytics[]> {
  const supabase = createClient();

  // @ts-ignore - Supabase type inference issue
  const { data: clients } = await (supabase as any).from('clients').select('*');
  // @ts-ignore - Supabase type inference issue
  const { data: projects } = await (supabase as any).from('projects').select('*');

  if (!clients) return [];

  return clients.map((client: any) => {
    const clientProjects = projects?.filter((p: any) => p.client_id === client.id) || [];
    const totalProjects = clientProjects.length;
    const completedProjects = clientProjects.filter((p: any) => p.stage_number === 18).length;
    const projectsInPayment = clientProjects.filter((p: any) => p.stage_number >= 14 && p.stage_number <= 16).length;
    const totalBudget = clientProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
    const totalPaid = clientProjects.reduce((sum: number, p: any) => sum + (p.paid_amount || 0), 0);

    const paidInFullCount = clientProjects.filter((p: any) => p.budget && p.paid_amount >= p.budget).length;
    const paymentPunctualityScore = totalProjects > 0 ? (paidInFullCount / totalProjects) * 100 : 0;

    const completedWithDates = clientProjects.filter((p: any) =>
      p.stage_number === 18 && p.start_date && p.completion_date
    );

    const avgProjectDurationDays = completedWithDates.length > 0
      ? completedWithDates.reduce((sum: number, p: any) => {
          const start = new Date(p.start_date!).getTime();
          const end = new Date(p.completion_date!).getTime();
          return sum + Math.floor((end - start) / (1000 * 60 * 60 * 24));
        }, 0) / completedWithDates.length
      : null;

    return {
      client_id: client.id,
      client_name: client.name,
      total_projects: totalProjects,
      completed_projects: completedProjects,
      projects_in_payment: projectsInPayment,
      total_budget: totalBudget,
      total_paid: totalPaid,
      payment_punctuality_score: paymentPunctualityScore,
      avg_project_duration_days: avgProjectDurationDays,
    };
  }).sort((a: any, b: any) => b.total_budget - a.total_budget);
}

// Create a new client
export async function insertClient(clientData: NewClient) {
  const supabase = createClient();
  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('clients')
    .insert(clientData)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

// Update a client
export async function updateClient(id: string, updates: UpdateClient) {
  const supabase = createClient();
  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

// Delete a client
export async function deleteClient(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Search clients by name, company, or email
export async function searchClients(query: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Client[];
}

// Get timeline of interactions for a client (stage history of all their projects)
export async function getClientTimeline(clientId: string) {
  const supabase = createClient();

  // Get all projects for this client
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title')
    .eq('client_id', clientId);

  if (projectsError) throw projectsError;

  if (!projects || projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((p: any) => p.id);

  // Get stage history for all these projects
  const { data: history, error: historyError } = await supabase
    .from('stage_history')
    .select(`
      *,
      project:projects(title)
    `)
    .in('project_id', projectIds)
    .order('created_at', { ascending: false });

  if (historyError) throw historyError;

  return history;
}

// Get payment history for a client
export async function getClientPaymentHistory(clientId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, budget, paid_amount, current_stage, stage_number, created_at, completion_date')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get most frequent stuck stage across all clients
export async function getMostFrequentStuckStage() {
  const supabase = createClient();

  // Get all projects that have been in a stage for more than 30 days
  const { data, error } = await supabase
    .from('projects')
    .select('current_stage, updated_at')
    .order('current_stage');

  if (error) throw error;

  // Calculate how long each project has been in current stage
  const now = new Date();
  const stageCounts: Record<string, number> = {};

  data?.forEach((project: any) => {
    const updatedAt = new Date(project.updated_at);
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

    // Consider a project "stuck" if it's been in the same stage for more than 14 days
    if (daysSinceUpdate > 14 && project.current_stage) {
      stageCounts[project.current_stage] = (stageCounts[project.current_stage] || 0) + 1;
    }
  });

  // Find the stage with the most stuck projects
  let maxCount = 0;
  let mostFrequentStage = null;

  Object.entries(stageCounts).forEach(([stage, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentStage = stage;
    }
  });

  return {
    stage: mostFrequentStage,
    count: maxCount,
    allStageCounts: stageCounts,
  };
}
