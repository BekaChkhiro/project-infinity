-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_history ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- All authenticated users can view other users (for assignment purposes)
CREATE POLICY "Authenticated users can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Clients table policies
-- Authenticated users can view all clients
CREATE POLICY "Authenticated users can view clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create clients
CREATE POLICY "Authenticated users can create clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update clients they created or if they're admin
CREATE POLICY "Users can update own clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Users can delete clients they created or if they're admin
CREATE POLICY "Users can delete own clients"
  ON public.clients FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Projects table policies
-- Authenticated users can view all projects
CREATE POLICY "Authenticated users can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update projects they created, are assigned to, or if they're admin
CREATE POLICY "Users can update relevant projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Users can delete projects they created or if they're admin
CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Stage history table policies
-- Authenticated users can view stage history for projects they have access to
CREATE POLICY "Authenticated users can view stage history"
  ON public.stage_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = stage_history.project_id
    )
  );

-- Stage history is automatically created via trigger, so no insert policy needed for users
-- Only the system (trigger) should create stage history entries
CREATE POLICY "Only system can insert stage history"
  ON public.stage_history FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Prevent manual updates to stage history
CREATE POLICY "No manual updates to stage history"
  ON public.stage_history FOR UPDATE
  TO authenticated
  USING (false);

-- Prevent manual deletes to stage history (except cascade from project delete)
CREATE POLICY "No manual deletes to stage history"
  ON public.stage_history FOR DELETE
  TO authenticated
  USING (false);
