-- Add new columns to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS preferred_communication_method TEXT CHECK (preferred_communication_method IN ('email', 'phone', 'whatsapp', 'telegram'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Create a view for client statistics (helps with analytics)
CREATE OR REPLACE VIEW client_statistics AS
SELECT
  c.id,
  c.name,
  c.company,
  c.email,
  c.phone,
  c.address,
  c.preferred_communication_method,
  COUNT(p.id) as total_projects,
  COUNT(CASE WHEN p.stage_number < 18 THEN 1 END) as active_projects,
  MAX(p.created_at) as last_project_date,
  COALESCE(SUM(p.budget), 0) as total_revenue,
  COALESCE(SUM(p.paid_amount), 0) as total_paid,
  c.created_at,
  c.updated_at
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id
GROUP BY c.id, c.name, c.company, c.email, c.phone, c.address, c.preferred_communication_method, c.created_at, c.updated_at;

-- Create a view for client payment analytics
CREATE OR REPLACE VIEW client_payment_analytics AS
SELECT
  c.id as client_id,
  c.name as client_name,
  COUNT(p.id) as total_projects,
  COUNT(CASE WHEN p.stage_number = 18 THEN 1 END) as completed_projects,
  COUNT(CASE WHEN p.stage_number >= 14 AND p.stage_number <= 16 THEN 1 END) as projects_in_payment,
  COALESCE(SUM(p.budget), 0) as total_budget,
  COALESCE(SUM(p.paid_amount), 0) as total_paid,
  CASE
    WHEN COUNT(p.id) > 0 THEN
      ROUND((COUNT(CASE WHEN p.paid_amount >= p.budget THEN 1 END)::numeric / COUNT(p.id)::numeric) * 100, 2)
    ELSE 0
  END as payment_punctuality_score,
  AVG(CASE
    WHEN p.stage_number = 18 AND p.start_date IS NOT NULL AND p.completion_date IS NOT NULL
    THEN EXTRACT(DAY FROM (p.completion_date::timestamp - p.start_date::timestamp))
  END) as avg_project_duration_days
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id
GROUP BY c.id, c.name;

-- Create saved_filters table for storing user's custom filter combinations
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('projects', 'clients', 'both')),
  filters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on saved_filters
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_filters
CREATE POLICY "Users can view their own saved filters"
ON saved_filters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved filters"
ON saved_filters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved filters"
ON saved_filters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved filters"
ON saved_filters
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for saved_filters
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_filter_type ON saved_filters(filter_type);
