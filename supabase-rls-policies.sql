-- RLS Policies for stage_history table

-- Enable RLS on stage_history if not already enabled
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all stage history
CREATE POLICY "Users can view stage history"
ON stage_history
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert stage history
CREATE POLICY "Users can insert stage history"
ON stage_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = changed_by);

-- Policy: Prevent updates and deletes (stage history should be immutable)
-- If you want to allow updates/deletes, add those policies here

-- Optional: If you also need to fix other tables, here are recommended policies

-- Projects table policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all projects"
ON projects
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert projects"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update projects"
ON projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete projects"
ON projects
FOR DELETE
TO authenticated
USING (true);

-- Clients table policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all clients"
ON clients
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert clients"
ON clients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update clients"
ON clients
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete clients"
ON clients
FOR DELETE
TO authenticated
USING (true);
