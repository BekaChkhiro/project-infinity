import { createClient } from './client';
import { SavedFilter, NewSavedFilter, UpdateSavedFilter } from '@/types/database.types';

// Get all saved filters for current user
export async function getSavedFilters(filterType?: 'projects' | 'clients' | 'both') {
  const supabase = createClient();

  let query = supabase
    .from('saved_filters')
    .select('*')
    .order('name', { ascending: true });

  if (filterType) {
    query = query.eq('filter_type', filterType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as SavedFilter[];
}

// Get default saved filter
export async function getDefaultSavedFilter(filterType: 'projects' | 'clients' | 'both') {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('filter_type', filterType)
    .eq('is_default', true)
    .maybeSingle();

  if (error) throw error;
  return data as SavedFilter | null;
}

// Create a new saved filter
export async function createSavedFilter(filterData: NewSavedFilter) {
  const supabase = createClient();

  // If this is being set as default, unset other defaults
  if (filterData.is_default) {
    // @ts-ignore - Supabase client type inference issue
    await (supabase as any)
      .from('saved_filters')
      .update({ is_default: false })
      .eq('user_id', filterData.user_id)
      .eq('filter_type', filterData.filter_type);
  }

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('saved_filters')
    .insert(filterData)
    .select()
    .single();

  if (error) throw error;
  return data as SavedFilter;
}

// Update a saved filter
export async function updateSavedFilter(id: string, updates: UpdateSavedFilter) {
  const supabase = createClient();

  // If this is being set as default, unset other defaults
  if (updates.is_default) {
    const { data: filter } = await supabase
      .from('saved_filters')
      .select('user_id, filter_type')
      .eq('id', id)
      .single();

    if (filter) {
      // @ts-ignore - Supabase client type inference issue
      await (supabase as any)
        .from('saved_filters')
        .update({ is_default: false })
        .eq('user_id', (filter as any).user_id)
        .eq('filter_type', (filter as any).filter_type)
        .neq('id', id);
    }
  }

  // @ts-ignore - Supabase client type inference issue
  const { data, error } = await (supabase as any)
    .from('saved_filters')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedFilter;
}

// Delete a saved filter
export async function deleteSavedFilter(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('saved_filters')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
