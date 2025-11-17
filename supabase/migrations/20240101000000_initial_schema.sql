-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users with additional profile information)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  current_stage TEXT DEFAULT 'დასაწყები' NOT NULL CHECK (
    current_stage IN (
      'დასაწყები',
      'მოხდა პირველი კავშირი',
      'ჩავნიშნეთ შეხვედრა',
      'შევხვდით და ველოდებით ინფორმაციას',
      'მივიღეთ ინფორმაცია',
      'დავიწყეთ დეველოპემნტი',
      'დავიწყეთ ტესტირება',
      'გადავაგზავნეთ კლიენტთან',
      'ველოდებით კლიენტისგან უკუკავშირს',
      'დავიწყეთ კლიენტის ჩასწორებებზე მუშაობა',
      'გავუგზავნეთ კლიენტს საბოლოო ვერსია',
      'ველოდებით კლიენტის დასტურს',
      'კლიენტმა დაგვიდასტურა',
      'კლიენტს გავუგზავნეთ პროექტის გადახდის დეტალები',
      'კლიენტისგან ველოდებით ჩარიცხვას',
      'კლიენტმა ჩარიცხა',
      'ვამატებთ პორტფოლიო პროექტებში',
      'პროექტი დასრულებულია'
    )
  ),
  stage_number INTEGER DEFAULT 1 CHECK (stage_number >= 1 AND stage_number <= 18),
  budget DECIMAL(12, 2),
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  start_date DATE,
  deadline DATE,
  completion_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stage_history table to track all stage changes
CREATE TABLE public.stage_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  from_stage_number INTEGER,
  to_stage_number INTEGER NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_assigned_to ON public.projects(assigned_to);
CREATE INDEX idx_projects_current_stage ON public.projects(current_stage);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_stage_history_project_id ON public.stage_history(project_id);
CREATE INDEX idx_stage_history_created_at ON public.stage_history(created_at DESC);
CREATE INDEX idx_clients_created_by ON public.clients(created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log stage changes
CREATE OR REPLACE FUNCTION log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.current_stage IS DISTINCT FROM NEW.current_stage) THEN
    INSERT INTO public.stage_history (
      project_id,
      from_stage,
      to_stage,
      from_stage_number,
      to_stage_number,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.current_stage,
      NEW.current_stage,
      OLD.stage_number,
      NEW.stage_number,
      NEW.assigned_to
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.stage_history (
      project_id,
      from_stage,
      to_stage,
      from_stage_number,
      to_stage_number,
      changed_by
    ) VALUES (
      NEW.id,
      NULL,
      NEW.current_stage,
      NULL,
      NEW.stage_number,
      NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log stage changes
CREATE TRIGGER log_project_stage_change
  AFTER INSERT OR UPDATE OF current_stage ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION log_stage_change();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
